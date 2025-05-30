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
});

describe('EmailValidator', () => {
  it('validates email', () => {
    const validator = buildValidatorFromDefinition({ validate: 'email' });
    expect(validator.isValid('test@example.com')).toEqual(undefined);
    expect(validator.isValid('test@example')).toEqual('validators.regex');
    expect(validator.isValid('test@')).toEqual('validators.regex');
    expect(validator.isValid('test')).toEqual('validators.regex');
    expect(validator.isValid('')).toEqual('validators.regex');
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
    const validationErrors = applyValidations(sheetDefinitions, data);

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

  it('validates required columns', () => {
    const validationErrors = applyValidations(
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
    );

    expect(
      validationErrors.find((e) => e.columnId === 'name' && e.rowIndex === 0)
    ).not.toBeUndefined();
    expect(
      validationErrors.find((e) => e.columnId === 'name' && e.rowIndex === 1)
    ).not.toBeUndefined();
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
