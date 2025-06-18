import { isEmptyCell } from '@/utils';
import {
  ImporterOutputFieldType,
  SheetColumnDefinition,
  SheetDefinition,
  SheetState,
} from '../types';
import { eachWithObject, hasData } from '../utils/functional';
import { buildTransformerFromDefinition } from './transformer_definitions';
import { Transformer } from './transformer_definitions/base';

function transformSheet(
  sheetDefinition: SheetDefinition,
  sheetData: SheetState
) {
  const pipelineByColumnId = eachWithObject<SheetColumnDefinition, Pipeline>(
    sheetDefinition.columns,
    (columnDefinition, obj) => {
      obj[columnDefinition.id] = new Pipeline();
      if (!columnDefinition.transformers) return;
      columnDefinition.transformers.forEach((transformerDefinition) => {
        obj[columnDefinition.id].push(
          buildTransformerFromDefinition(transformerDefinition)
        );
      });
    }
  );

  sheetDefinition.columns.forEach((columnDefinition) => {
    const columnId = columnDefinition.id;
    const pipeline = pipelineByColumnId[columnId];

    sheetData.rows.forEach((row) => {
      if (!hasData(row)) {
        return;
      }

      const cellValue = row[columnId];

      if (!isEmptyCell(cellValue)) {
        row[columnId] = pipeline.transform(cellValue);
      }
    });
  });

  return sheetData.rows;
}

export function applyTransformations(
  sheetDefinitions: SheetDefinition[],
  sheetStates: SheetState[]
) {
  const newSheetStates: SheetState[] = [];

  sheetDefinitions.forEach((sheetDefinition) => {
    const sheetData = sheetStates.find(
      (state) => state.sheetId === sheetDefinition.id
    );

    if (sheetData) {
      const newRows = transformSheet(sheetDefinition, sheetData);

      newSheetStates.push({ sheetId: sheetDefinition.id, rows: newRows });
    }
  });

  return newSheetStates;
}

export class Pipeline {
  steps: Transformer[];

  // Series of transformations
  constructor(steps = []) {
    this.steps = steps;
  }

  push(step: Transformer) {
    this.steps.push(step);
  }

  transform(value: ImporterOutputFieldType) {
    let current = value;
    this.steps.forEach((step) => {
      current = step.transform(current);
    });
    return current;
  }
}
