import { applyTransformations, Pipeline } from './';
import {
  PhoneNumberTransformer,
  StateCodeTransformer,
  PostalCodeTransformer,
  CustomTransformer,
  StripTransformer,
} from './transformer_definitions';
import { describe, it, expect } from 'vitest';

describe('Pipeline', () => {
  it('can run a series of transformations', async () => {
    const pipeline = new Pipeline();
    pipeline.push(new PhoneNumberTransformer());
    expect(await pipeline.transform('555-555-5555')).toEqual('5555555555');
  });

  it('runs steps serially, feeding each result into the next', async () => {
    const pipeline = new Pipeline();
    pipeline.push(
      new CustomTransformer({
        key: 'async_trim',
        transformFn: async (value) => value.trim(),
      })
    );
    pipeline.push(
      new CustomTransformer({
        key: 'upper',
        transformFn: (value) => value.toUpperCase(),
      })
    );
    expect(await pipeline.transform('  abc  ')).toEqual('ABC');
  });
});

describe('applyTransformations', () => {
  it('can apply transformations', async () => {
    const sheetDefinitions = [
      {
        id: 'a',
        label: 'Sheet A',
        columns: [
          {
            type: 'string',
            label: 'Phone Number',
            id: 'phone_number',
            transformers: [{ transformer: 'phone_number' }],
          },
        ],
      },
    ];

    const data = await applyTransformations(sheetDefinitions, [
      { sheetId: 'a', rows: [{ phone_number: '555-555-5555' }] },
    ]);

    expect(data[0].rows[0].phone_number).toEqual('5555555555');
  });

  it('awaits async custom transformers', async () => {
    const sheetDefinitions = [
      {
        id: 'a',
        label: 'Sheet A',
        columns: [
          {
            type: 'string',
            label: 'Name',
            id: 'name',
            transformers: [
              {
                transformer: 'custom',
                key: 'async_upper',
                transformFn: async (value) => {
                  await Promise.resolve();
                  return String(value).toUpperCase();
                },
              },
            ],
          },
        ],
      },
    ];

    const data = await applyTransformations(sheetDefinitions, [
      { sheetId: 'a', rows: [{ name: 'alice' }] },
    ]);

    expect(data[0].rows[0].name).toEqual('ALICE');
  });

  it('only runs transformers whose runOn matches the phase', async () => {
    const sheetDefinitions = [
      {
        id: 'a',
        label: 'Sheet A',
        columns: [
          {
            type: 'string',
            label: 'Name',
            id: 'name',
            transformers: [
              {
                transformer: 'custom',
                key: 'submit_only',
                runOn: 'submit',
                transformFn: (value) => `${value}!`,
              },
            ],
          },
        ],
      },
    ];

    const changeData = await applyTransformations(
      sheetDefinitions,
      [{ sheetId: 'a', rows: [{ name: 'alice' }] }],
      { phase: 'change' }
    );
    // Deferred transformer should NOT run in the change phase.
    expect(changeData[0].rows[0].name).toEqual('alice');

    const submitData = await applyTransformations(
      sheetDefinitions,
      [{ sheetId: 'a', rows: [{ name: 'alice' }] }],
      { phase: 'submit' }
    );
    expect(submitData[0].rows[0].name).toEqual('alice!');
  });

  it('does not mutate input rows and gives changed rows a new identity', async () => {
    const sheetDefinitions = [
      {
        id: 'a',
        label: 'Sheet A',
        columns: [
          {
            type: 'string',
            label: 'Name',
            id: 'name',
            transformers: [
              {
                transformer: 'custom',
                key: 'cap',
                transformFn: (value) => String(value).toUpperCase(),
              },
            ],
          },
        ],
      },
    ];

    const originalRow = { name: 'alice' };
    const result = await applyTransformations(sheetDefinitions, [
      { sheetId: 'a', rows: [originalRow] },
    ]);

    // The input row object must not be mutated in place — otherwise React/
    // react-table can't detect the change and the grid shows stale values until
    // an unrelated re-render (e.g. entering/leaving edit mode).
    expect(originalRow.name).toEqual('alice');
    // The transformed row is a fresh object carrying the new value.
    expect(result[0].rows[0]).not.toBe(originalRow);
    expect(result[0].rows[0].name).toEqual('ALICE');
  });

  it('preserves the identity of rows whose values do not change', async () => {
    const sheetDefinitions = [
      {
        id: 'a',
        label: 'Sheet A',
        columns: [
          {
            type: 'string',
            label: 'Name',
            id: 'name',
            transformers: [
              {
                transformer: 'custom',
                key: 'cap',
                transformFn: (value) => String(value).toUpperCase(),
              },
            ],
          },
        ],
      },
    ];

    // Already uppercase → the transform yields the same value, so the row object
    // should keep its identity (no needless re-render).
    const unchangedRow = { name: 'ALICE' };
    const result = await applyTransformations(sheetDefinitions, [
      { sheetId: 'a', rows: [unchangedRow] },
    ]);

    expect(result[0].rows[0]).toBe(unchangedRow);
  });

  it('respects the concurrency limit', async () => {
    let inFlight = 0;
    let maxInFlight = 0;

    const sheetDefinitions = [
      {
        id: 'a',
        label: 'Sheet A',
        columns: [
          {
            type: 'string',
            label: 'Name',
            id: 'name',
            transformers: [
              {
                transformer: 'custom',
                key: 'tracked',
                transformFn: async (value) => {
                  inFlight += 1;
                  maxInFlight = Math.max(maxInFlight, inFlight);
                  await Promise.resolve();
                  await Promise.resolve();
                  inFlight -= 1;
                  return value;
                },
              },
            ],
          },
        ],
      },
    ];

    const rows = Array.from({ length: 20 }, (_, i) => ({ name: `n${i}` }));

    await applyTransformations(sheetDefinitions, [{ sheetId: 'a', rows }], {
      concurrency: 3,
    });

    expect(maxInFlight).toBeLessThanOrEqual(3);
  });
});

describe('CustomTransformer', () => {
  it('can apply transformations', async () => {
    const transformer = new CustomTransformer({
      key: 'add_one',
      transformFn: (item) => item + 1,
    });

    expect(await transformer.transform(1)).toEqual(2);
  });
});

describe('StripTransformer', () => {
  it('can apply transformations', async () => {
    const transformer = new StripTransformer();

    expect(await transformer.transform(' a ')).toEqual('a');
  });
});

describe('PhoneNumberTransformer', () => {
  it('corrects phone number', async () => {
    const transformer = new PhoneNumberTransformer();
    expect(await transformer.transform('555-555-5555')).toEqual('5555555555');
    expect(await transformer.transform('5555555555')).toEqual('5555555555');
  });
});

describe('StateCodeTransformer', () => {
  it('re-maps state code', async () => {
    const transformer = new StateCodeTransformer();
    expect(await transformer.transform('california')).toEqual('CA');
    expect(await transformer.transform('California')).toEqual('CA');
  });
});

describe('PostalCodeTransformer', () => {
  it('corrects hyphenated postal codes', async () => {
    const transformer = new PostalCodeTransformer();
    expect(await transformer.transform('12345-6789')).toEqual('12345');
    expect(await transformer.transform('12345')).toEqual('12345');
  });
});
