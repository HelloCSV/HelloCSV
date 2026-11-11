import { describe, it, expect } from 'vitest';
import { applyValidations, fieldIsRequired } from './';
import {
  RegexValidator,
  buildValidatorFromDefinition,
} from './validator_definitions';

describe('Validator.buildFromDefinition', () => {
  it('creates the correct validator', () => {
    const validator = buildValidatorFromDefinition({
      validate: 'regex_matches',
      regex: '^(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,})$',
      error: 'Must be a valid email',
    });
    expect(validator instanceof RegexValidator).toEqual(true);
    expect(validator.definition.error).toEqual('Must be a valid email');
  });
});

describe('IncludesValidator', () => {
  it('correctly validates', () => {
    const validator = buildValidatorFromDefinition({
      validate: 'includes',
      values: ['a', 'b', 'c'],
    });
    expect(validator.isValid('a')).toEqual(undefined);
    expect(validator.isValid('a, b, c')).toEqual('validators.includes');
    expect(validator.isValid('a,b,c')).toEqual('validators.includes');
    expect(validator.isValid('d')).toEqual('validators.includes');
  });
});

describe('MultiIncludesValidator', () => {
  it('correctly validates', () => {
    const validator = buildValidatorFromDefinition({
      validate: 'multi_includes',
      values: ['a', 'b', 'c'],
    });
    expect(validator.isValid('a')).toEqual(undefined);
    expect(validator.isValid('a, b, c')).toEqual(undefined);
    expect(validator.isValid('a,b,c')).toEqual(undefined);
    expect(validator.isValid('d')).toEqual('validators.multiIncludes');
  });
});

describe('BooleanValidator', () => {
  it('accepts real booleans and empty, flags anything else', () => {
    const validator = buildValidatorFromDefinition({ validate: 'boolean' });
    expect(validator.isValid(true)).toEqual(undefined);
    expect(validator.isValid(false)).toEqual(undefined);
    expect(validator.isValid('')).toEqual(undefined);
    expect(validator.isValid(null)).toEqual(undefined);
    expect(validator.isValid(undefined)).toEqual(undefined);
    expect(validator.isValid('maybe')).toEqual('validators.boolean');
  });
});

describe('CustomValidator', () => {
  it('works with function', () => {
    const validator = buildValidatorFromDefinition({
      validate: 'custom',
      validateFn: (item) => {
        if (!Number.isInteger(item)) {
          return 'Must be an integer';
        }
      },
      key: 'is_int',
    });
    expect(validator.isValid('a')).toEqual('Must be an integer');
    expect(validator.isValid(2)).toEqual(undefined);
    expect(validator.isValid('1')).toEqual('Must be an integer');
  });
});

describe('UniqueValidator', () => {
  it('validates uniqueness', () => {
    const validator = buildValidatorFromDefinition({ validate: 'unique' });
    expect(validator.isValid(1)).toEqual(undefined);
    expect(validator.isValid(2)).toEqual(undefined);
    expect(validator.isValid(1)).toEqual('validators.unique');
  });

  it('validates uniqueness case-insensitively when configured', () => {
    const validator = buildValidatorFromDefinition({
      validate: 'unique',
      caseInsensitive: true,
    });
    expect(validator.isValid('Foo')).toEqual(undefined);
    expect(validator.isValid('bar')).toEqual(undefined);
    expect(validator.isValid('foo')).toEqual('validators.unique');
  });
});

describe('RequiredValidator', () => {
  it('validates required', () => {
    const validator = buildValidatorFromDefinition({ validate: 'required' });
    expect(validator.isValid(1)).toEqual(undefined);
    expect(validator.isValid('2')).toEqual(undefined);
    expect(validator.isValid('')).toEqual('validators.required');
    expect(validator.isValid(null)).toEqual('validators.required');
  });
});

describe('IntegerValidator', () => {
  it('validates integer', () => {
    const validator = buildValidatorFromDefinition({ validate: 'is_integer' });
    expect(validator.isValid(0)).toEqual(undefined);
    expect(validator.isValid(1)).toEqual(undefined);
    expect(validator.isValid('2')).toEqual('validators.integer');
    expect(validator.isValid(null)).toEqual('validators.integer');
    expect(validator.isValid(NaN)).toEqual('validators.integer');
    expect(validator.isValid(undefined)).toEqual('validators.integer');
    expect(validator.isValid('hello')).toEqual('validators.integer');
  });
});

describe('PostalCodeValidator', () => {
  it('validates postal code', () => {
    const validator = buildValidatorFromDefinition({ validate: 'postal_code' });
    expect(validator.isValid('12345')).toEqual(undefined);
    expect(validator.isValid('12345-1234')).toEqual(undefined);
    expect(validator.isValid('12345-12345')).toEqual('validators.regex');
    expect(validator.isValid('12345-123456')).toEqual('validators.regex');
    expect(validator.isValid('12345-1234567')).toEqual('validators.regex');
    expect(validator.isValid('12345-12345678')).toEqual('validators.regex');
    expect(validator.isValid('12345-123456789')).toEqual('validators.regex');
  });

  it('returns custom error when provided', () => {
    const validator = buildValidatorFromDefinition({
      validate: 'postal_code',
      error: 'Invalid postal code',
    });

    expect(validator.isValid('not-an-email')).toEqual('Invalid postal code');
  });
});

describe('PhoneNumberValidator', () => {
  it('validates phone number', () => {
    const validator = buildValidatorFromDefinition({
      validate: 'phone_number',
    });
    expect(validator.isValid('123-456-7890')).toEqual(undefined);
    expect(validator.isValid('(123) 456-7890')).toEqual(undefined);
    expect(validator.isValid('1234567890')).toEqual(undefined);
    expect(validator.isValid('invalid')).toEqual('validators.regex');
    expect(validator.isValid('123-45-678')).toEqual('validators.regex');
    expect(validator.isValid('')).toEqual('validators.regex');
  });

  it('returns custom error when provided', () => {
    const validator = buildValidatorFromDefinition({
      validate: 'phone_number',
      error: 'Invalid phone number',
    });

    expect(validator.isValid('not-an-email')).toEqual('Invalid phone number');
  });
});

describe('EmailValidator', () => {
  it('validates email', () => {
    const validator = buildValidatorFromDefinition({ validate: 'email' });
    const invalid = 'validators.regex';

    // valid
    expect(validator.isValid('test@example.com')).toEqual(undefined);
    expect(validator.isValid('TEST@ExAmPlE.com')).toEqual(undefined);
    expect(validator.isValid('first.last@example.com')).toEqual(undefined);
    expect(validator.isValid('first_last@example.com')).toEqual(undefined);
    expect(validator.isValid('first+tag@example.com')).toEqual(undefined);
    expect(validator.isValid('first%tag@example.com')).toEqual(undefined);

    // invalid structure
    expect(validator.isValid('test@example')).toEqual(invalid);
    expect(validator.isValid('test@')).toEqual(invalid);
    expect(validator.isValid('test')).toEqual(invalid);
    expect(validator.isValid('')).toEqual(invalid);

    // invalid domain dots
    expect(validator.isValid('test@example..com')).toEqual(invalid);
    expect(validator.isValid('test@.example.com')).toEqual(invalid);
    expect(validator.isValid('test@example.com.')).toEqual(invalid);

    // explicitly disallowed
    expect(validator.isValid('test*@example.com')).toEqual(invalid);
    expect(validator.isValid('"quoted"@example.com')).toEqual(invalid);
    expect(validator.isValid('user@[127.0.0.1]')).toEqual(invalid);
  });

  it('returns custom error when provided', () => {
    const validator = buildValidatorFromDefinition({
      validate: 'email',
      error: 'Invalid email address',
    });

    expect(validator.isValid('not-an-email')).toEqual('Invalid email address');
  });

  it('ignores overridden regex definitions', () => {
    const validator = buildValidatorFromDefinition({
      validate: 'email',
      regex: /.*/,
    });

    expect(validator.isValid('not-an-email')).toEqual('validators.regex');
  });
});

describe('applyValidation', () => {
  const sheetDefinitions = [
    {
      id: 'a',
      columns: [
        {
          label: 'Full Name',
          id: 'name',
          validators: [{ validate: 'required' }],
        },
        {
          label: 'Email',
          id: 'email',
          validators: [
            {
              validate: 'regex_matches',
              regex:
                /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i, //eslint-disable-line
              error: 'Must be a valid email',
            },
            { validate: 'required' },
            { validate: 'unique' },
          ],
        },
        {
          label: 'Phone Number',
          id: 'phone_number',
          validators: [{ validate: 'unique' }],
        },
      ],
    },
  ];

  const data = [
    {
      sheetId: 'a',
      rows: [
        {
          name: 'chris',
          email: 'chris@example.com',
          phone_number: '555-555-5555',
        }, // This row is fine
        {
          name: 'chris',
          email: 'chris@example.com',
          phone_number: '555-555-5555',
        }, // This phone number, email is not unique
        { name: null, email: 'c.com', phone_number: '556-555-5555' },
      ], // This email doesn't match regex, name is null
    },
  ];

  it('runs validations correctly', () => {
    return applyValidations(sheetDefinitions, data).then((validationErrors) => {
      expect(
        validationErrors.find((e) => e.columnId === 'name' && e.rowIndex === 0)
      ).toBeUndefined();
      expect(
        validationErrors.find((e) => e.columnId === 'name' && e.rowIndex === 1)
      ).toBeUndefined();
      expect(
        validationErrors.find((e) => e.columnId === 'name' && e.rowIndex === 2)
      ).not.toBeUndefined();

      expect(
        validationErrors.find((e) => e.columnId === 'email' && e.rowIndex === 0)
      ).toBeUndefined();
      expect(
        validationErrors.find((e) => e.columnId === 'email' && e.rowIndex === 1)
      ).not.toBeUndefined();
      expect(
        validationErrors.find((e) => e.columnId === 'email' && e.rowIndex === 2)
      ).not.toBeUndefined();

      expect(
        validationErrors.find(
          (e) => e.columnId === 'phone_number' && e.rowIndex === 0
        )
      ).toBeUndefined();
      expect(
        validationErrors.find(
          (e) => e.columnId === 'phone_number' && e.rowIndex === 1
        )
      ).not.toBeUndefined();
      expect(
        validationErrors.find(
          (e) => e.columnId === 'phone_number' && e.rowIndex === 2
        )
      ).toBeUndefined();
    });
  });

  it('validates required columns', () => {
    return applyValidations(
      [
        {
          id: 'a',
          columns: [{ id: 'name', validators: [{ validate: 'required' }] }],
        },
      ],
      [
        {
          sheetId: 'a',
          rows: [{ email: 'czhu12@gmail.com' }, { email: 'czhu13@gmail.com' }],
        },
      ]
    ).then((validationErrors) => {
      expect(
        validationErrors.find((e) => e.columnId === 'name' && e.rowIndex === 0)
      ).not.toBeUndefined();
      expect(
        validationErrors.find((e) => e.columnId === 'name' && e.rowIndex === 1)
      ).not.toBeUndefined();
    });
  });
});

describe('fieldIsRequired', () => {
  it('returns true if field is required', () => {
    const field = {
      label: 'Test Group ID',
      key: 'test_group_id',
      validators: [{ validate: 'required' }, { validate: 'unique' }],
    };
    expect(fieldIsRequired(field)).toEqual(true);
  });

  it('returns true if field has no validators', () => {
    const field = { label: 'Test Group ID', key: 'test_group_id' };
    expect(fieldIsRequired(field)).toEqual(false);
  });

  it('returns true if field has empty validators', () => {
    const field = {
      label: 'Test Group ID',
      key: 'test_group_id',
      validators: [],
    };
    expect(fieldIsRequired(field)).toEqual(false);
  });
});

describe('async validators', () => {
  it('awaits async custom validators', async () => {
    const sheetDefinitions = [
      {
        id: 'a',
        columns: [
          {
            id: 'name',
            validators: [
              {
                validate: 'custom',
                key: 'async_check',
                validateFn: async (value) => {
                  await Promise.resolve();
                  return value === 'bad' ? 'validators.asyncError' : null;
                },
              },
            ],
          },
        ],
      },
    ];

    const errors = await applyValidations(sheetDefinitions, [
      { sheetId: 'a', rows: [{ name: 'ok' }, { name: 'bad' }] },
    ]);

    expect(errors.find((e) => e.rowIndex === 0)).toBeUndefined();
    expect(errors.find((e) => e.rowIndex === 1)?.message).toEqual(
      'validators.asyncError'
    );
  });

  it('surfaces a rejected async validator as a cell error', async () => {
    const sheetDefinitions = [
      {
        id: 'a',
        columns: [
          {
            id: 'name',
            validators: [
              {
                validate: 'custom',
                key: 'rejects',
                error: 'validators.asyncError',
                validateFn: async () => {
                  throw new Error('network down');
                },
              },
            ],
          },
        ],
      },
    ];

    const errors = await applyValidations(sheetDefinitions, [
      { sheetId: 'a', rows: [{ name: 'anything' }] },
    ]);

    expect(errors[0].message).toEqual('validators.asyncError');
  });

  it('only runs validators whose runOn matches the phase', async () => {
    const sheetDefinitions = [
      {
        id: 'a',
        columns: [
          {
            id: 'name',
            validators: [
              {
                validate: 'custom',
                key: 'submit_only',
                runOn: 'submit',
                validateFn: () => 'validators.asyncError',
              },
            ],
          },
        ],
      },
    ];
    const data = [{ sheetId: 'a', rows: [{ name: 'x' }] }];

    const changeErrors = await applyValidations(sheetDefinitions, data, {
      phase: 'change',
    });
    expect(changeErrors).toHaveLength(0);

    const submitErrors = await applyValidations(sheetDefinitions, data, {
      phase: 'submit',
    });
    expect(submitErrors).toHaveLength(1);
  });

  it('keeps the unique validator deterministic under low concurrency', async () => {
    const sheetDefinitions = [
      {
        id: 'a',
        columns: [{ id: 'name', validators: [{ validate: 'unique' }] }],
      },
    ];

    const errors = await applyValidations(
      sheetDefinitions,
      [
        {
          sheetId: 'a',
          rows: [{ name: 'dup' }, { name: 'unique' }, { name: 'dup' }],
        },
      ],
      { concurrency: 1 }
    );

    // The first occurrence passes; the later duplicate is flagged.
    expect(errors.find((e) => e.rowIndex === 0)).toBeUndefined();
    expect(errors.find((e) => e.rowIndex === 2)?.message).toEqual(
      'validators.unique'
    );
  });
});

describe('empty cells', () => {
  // `other` keeps every row non-blank, so only the cell under test varies.
  const validateColumn = (column, rows, options) =>
    applyValidations(
      [{ id: 'a', columns: [{ id: 'other' }, { id: 'c', ...column }] }],
      [{ sheetId: 'a', rows: rows.map((row) => ({ other: 'x', ...row })) }],
      options
    ).then((errors) => errors.map((e) => `${e.rowIndex}:${e.message}`));

  const emptyRows = [
    { c: '' },
    { c: '   ' },
    { c: null },
    { c: undefined },
    {},
  ];

  const spy = (seen) => ({
    validate: 'custom',
    key: 'spy',
    validateFn: (value) => {
      seen.push(value);
      return null;
    },
  });

  it.each([
    { validate: 'is_integer' },
    { validate: 'email' },
    { validate: 'phone_number' },
    { validate: 'postal_code' },
    { validate: 'regex_matches', regex: /^a/ },
    { validate: 'includes', values: ['a'] },
    { validate: 'multi_includes', values: ['a'] },
  ])('$validate skips empty cells but flags bad values', async (validator) => {
    const errors = await validateColumn({ validators: [validator] }, [
      ...emptyRows,
      { c: 'bad!' },
    ]);
    expect(errors).toEqual([expect.stringMatching(/^5:/)]);
  });

  it('skips the automatic enum validator on empty cells', async () => {
    const errors = await validateColumn(
      { type: 'enum', typeArguments: { values: [{ label: 'A', value: 'a' }] } },
      [{ c: '' }, {}, { c: 'b' }]
    );
    expect(errors).toEqual(['2:validators.includes']);
  });

  it('does not count empty cells as duplicates', async () => {
    const errors = await validateColumn(
      { validators: [{ validate: 'unique' }] },
      [{ c: '' }, { c: '' }, {}, {}, { c: 'a' }, { c: 'a' }]
    );
    expect(errors).toEqual(['5:validators.unique']);
  });

  it('still validates falsy values that are present', async () => {
    const errors = await validateColumn(
      { validators: [{ validate: 'includes', values: ['a'] }] },
      [{ c: 0 }, { c: false }]
    );
    expect(errors).toEqual(['0:validators.includes', '1:validators.includes']);
  });

  it('required flags every kind of empty cell', async () => {
    const errors = await validateColumn(
      { validators: [{ validate: 'required' }] },
      emptyRows
    );
    expect(errors).toEqual(
      [0, 1, 2, 3, 4].map((i) => `${i}:validators.required`)
    );
  });

  it('runs only required on an empty cell when its condition holds', async () => {
    const errors = await validateColumn(
      {
        validators: [
          { validate: 'required', when: (row) => row.other === 'yes' },
          { validate: 'email' },
        ],
      },
      [{ other: 'yes' }, { other: 'no' }]
    );
    expect(errors).toEqual(['0:validators.required']);
  });

  it('passes empty and missing cells to custom validators', async () => {
    const seen = [];
    await validateColumn({ validators: [spy(seen)] }, [{ c: '' }, {}]);
    expect(seen).toEqual(['', undefined]);
  });

  it('lets custom validators opt out of empty cells', async () => {
    const seen = [];
    await validateColumn(
      { validators: [{ ...spy(seen), validatesEmptyValues: false }] },
      [...emptyRows, { c: 'a' }]
    );
    expect(seen).toEqual(['a']);
  });

  it('skips rows with no data entirely', async () => {
    const seen = [];
    const errors = await applyValidations(
      [
        {
          id: 'a',
          columns: [
            { id: 'c', validators: [{ validate: 'required' }, spy(seen)] },
          ],
        },
      ],
      [{ sheetId: 'a', rows: [{}, {}] }]
    );
    expect(errors).toEqual([]);
    expect(seen).toEqual([]);
  });

  it('applies the same rule to submit-phase validators', async () => {
    const errors = await validateColumn(
      { validators: [{ validate: 'email', runOn: 'submit' }] },
      [{ c: '' }, { c: 'bad!' }],
      { phase: 'submit' }
    );
    expect(errors).toEqual(['1:validators.regex']);
  });
});
