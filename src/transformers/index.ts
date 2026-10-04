import { isEmptyCell } from '@/utils';
import { mapWithConcurrency } from '@/utils/concurrency';
import { DEFAULT_MAX_CONCURRENT_ASYNC_OPERATIONS } from '@/constants';
import {
  ImporterOutputFieldType,
  ProcessingPhase,
  SheetColumnDefinition,
  SheetDefinition,
  SheetRow,
  SheetState,
} from '../types';
import { eachWithObject, hasData } from '../utils/functional';
import { buildTransformerFromDefinition } from './transformer_definitions';
import { Transformer } from './transformer_definitions/base';
import { ApplyTransformationsOptions } from './types';

interface TransformTask {
  rowIndex: number;
  columnId: string;
  value: ImporterOutputFieldType;
  pipeline: Pipeline;
}

async function transformSheet(
  sheetDefinition: SheetDefinition,
  sheetData: SheetState,
  phase: ProcessingPhase,
  concurrency: number
) {
  const pipelineByColumnId = eachWithObject<SheetColumnDefinition, Pipeline>(
    sheetDefinition.columns,
    (columnDefinition, obj) => {
      obj[columnDefinition.id] = new Pipeline();
      if (!columnDefinition.transformers) return;
      columnDefinition.transformers
        .filter((t) => (t.runOn ?? 'change') === phase)
        .forEach((transformerDefinition) => {
          obj[columnDefinition.id].push(
            buildTransformerFromDefinition(transformerDefinition)
          );
        });
    }
  );

  const tasks: TransformTask[] = [];

  sheetDefinition.columns.forEach((columnDefinition) => {
    const columnId = columnDefinition.id;
    const pipeline = pipelineByColumnId[columnId];

    if (pipeline.steps.length === 0) return;

    sheetData.rows.forEach((row, rowIndex) => {
      if (!hasData(row)) {
        return;
      }

      const cellValue = row[columnId];
      if (isEmptyCell(cellValue)) {
        return;
      }

      tasks.push({ rowIndex, columnId, value: cellValue, pipeline });
    });
  });

  const results = await mapWithConcurrency(
    tasks,
    concurrency,
    async (task) => ({
      ...task,
      value: await task.pipeline.transform(task.value),
    })
  );

  const changesByRow = new Map<number, SheetRow>();
  results.forEach(({ rowIndex, columnId, value }) => {
    const changes = changesByRow.get(rowIndex) ?? {};
    changes[columnId] = value;
    changesByRow.set(rowIndex, changes);
  });

  return sheetData.rows.map((row, rowIndex) => {
    const changes = changesByRow.get(rowIndex);
    if (changes == null) return row;

    const changed = Object.keys(changes).some(
      (key) => row[key] !== changes[key]
    );
    return changed ? { ...row, ...changes } : row;
  });
}

export async function applyTransformations(
  sheetDefinitions: SheetDefinition[],
  sheetStates: SheetState[],
  options: ApplyTransformationsOptions = {}
): Promise<SheetState[]> {
  const phase = options.phase ?? 'change';
  const concurrency =
    options.concurrency ?? DEFAULT_MAX_CONCURRENT_ASYNC_OPERATIONS;

  const newSheetStates: SheetState[] = [];

  for (const sheetDefinition of sheetDefinitions) {
    const sheetData = sheetStates.find(
      (state) => state.sheetId === sheetDefinition.id
    );

    if (sheetData) {
      const newRows = await transformSheet(
        sheetDefinition,
        sheetData,
        phase,
        concurrency
      );

      newSheetStates.push({ sheetId: sheetDefinition.id, rows: newRows });
    }
  }

  return newSheetStates;
}

export class Pipeline {
  steps: Transformer[];

  // Series of transformations
  constructor(steps: Transformer[] = []) {
    this.steps = steps;
  }

  push(step: Transformer) {
    this.steps.push(step);
  }

  async transform(value: ImporterOutputFieldType) {
    let current = value;
    for (const step of this.steps) {
      current = await step.transform(current);
    }
    return current;
  }
}
