import { describe, it, expect } from 'vitest';
import { InnerStateBuilder, buildInitialState } from './state';
import { ImporterState, SheetDefinition } from '../types';

const sheets: SheetDefinition[] = [
  {
    id: 'people',
    label: 'People',
    columns: [
      {
        id: 'city',
        label: 'City',
        type: 'string',
        transformers: [
          {
            transformer: 'custom',
            key: 'capitalize',
            transformFn: (value) =>
              typeof value === 'string' ? value.toUpperCase() : value,
          },
        ],
      },
    ],
  },
];

function initialStateWithParsedFile(): ImporterState {
  return {
    ...buildInitialState(sheets),
    mode: 'mapping',
    parsedFile: {
      data: [{ City: 'warsaw' }, { City: 'krakow' }],
      meta: { fields: ['City'] },
      errors: [],
    } as unknown as ImporterState['parsedFile'],
    columnMappings: [
      { sheetId: 'people', sheetColumnId: 'city', csvColumnName: 'City' },
    ],
  };
}

describe('InnerStateBuilder — transformers apply on mapping', () => {
  it('capitalizes mapped data in the processing pass (DATA_MAPPED)', async () => {
    const builder = new InnerStateBuilder(
      { sheets },
      initialStateWithParsedFile()
    );

    await builder.confirmMappings();
    const result = await builder.getState();

    expect(result.sheetData[0].rows.map((r) => r.city)).toEqual([
      'WARSAW',
      'KRAKOW',
    ]);
  });
});
