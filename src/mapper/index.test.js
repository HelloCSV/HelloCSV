import { buildSuggestedHeaderMappings } from './utils';
import { getMappedData } from './';
import { describe, it, expect } from 'vitest';

function rowsFor(sheets, mappings, data, sheetId = 'people') {
  const mapped = getMappedData(sheets, mappings, { data });
  return mapped.find((s) => s.sheetId === sheetId).rows;
}

describe('getMappedData column coercion', () => {
  it('coerces regular columns by type (string/number/enum single+multi/boolean)', () => {
    const sheets = [
      {
        id: 'people',
        label: 'People',
        columns: [
          { id: 'name', label: 'Name', type: 'string' },
          { id: 'age', label: 'Age', type: 'number' },
          {
            id: 'department',
            label: 'Dept',
            type: 'enum',
            typeArguments: {
              multiple: false,
              values: [
                { label: 'Engineering', value: 'eng' },
                { label: 'Sales', value: 'sales' },
              ],
            },
          },
          {
            id: 'skills',
            label: 'Skills',
            type: 'enum',
            typeArguments: {
              multiple: true,
              delimiter: ';',
              values: [
                { label: 'JavaScript', value: 'js' },
                { label: 'Python', value: 'py' },
              ],
            },
          },
          {
            id: 'active',
            label: 'Active',
            type: 'boolean',
            typeArguments: { trueLabel: 'Active', falseLabel: 'Inactive' },
          },
        ],
      },
    ];
    const mappings = [
      { sheetId: 'people', sheetColumnId: 'name', csvColumnName: 'Name' },
      { sheetId: 'people', sheetColumnId: 'age', csvColumnName: 'Age' },
      {
        sheetId: 'people',
        sheetColumnId: 'department',
        csvColumnName: 'Department',
      },
      { sheetId: 'people', sheetColumnId: 'skills', csvColumnName: 'Skills' },
      { sheetId: 'people', sheetColumnId: 'active', csvColumnName: 'Active' },
    ];
    const data = [
      {
        Name: 'Ann',
        Age: '30',
        Department: 'Engineering', // by label
        Skills: 'JavaScript;py', // label + value
        Active: 'Active', // label -> boolean
      },
      {
        Name: 'Bob',
        Age: 'x', // non-numeric -> raw
        Department: 'eng', // by value
        Skills: '',
        Active: 'true', // default token -> boolean
      },
    ];

    const rows = rowsFor(sheets, mappings, data);
    expect(rows[0]).toEqual({
      name: 'Ann',
      age: 30,
      department: 'eng',
      skills: ['js', 'py'],
      active: true,
    });
    expect(rows[1]).toEqual({
      name: 'Bob',
      age: 'x',
      department: 'eng',
      skills: [],
      active: true,
    });
  });

  it('computes calculated columns via getValue (not coerced)', () => {
    const sheets = [
      {
        id: 'people',
        label: 'People',
        columns: [
          { id: 'name', label: 'Name', type: 'string' },
          {
            id: 'greeting',
            label: 'Greeting',
            type: 'calculated',
            typeArguments: { getValue: (row) => `Hi ${row.name}` },
          },
        ],
      },
    ];
    const mappings = [
      { sheetId: 'people', sheetColumnId: 'name', csvColumnName: 'Name' },
    ];
    const rows = rowsFor(sheets, mappings, [{ Name: 'Ann' }]);
    expect(rows[0]).toEqual({ name: 'Ann', greeting: 'Hi Ann' });
  });

  it('sources reference columns from the referenced sheet by row index', () => {
    const sheets = [
      {
        id: 'depts',
        label: 'Depts',
        columns: [{ id: 'dept_name', label: 'Dept', type: 'string' }],
      },
      {
        id: 'people',
        label: 'People',
        columns: [
          { id: 'name', label: 'Name', type: 'string' },
          {
            id: 'dept',
            label: 'Dept',
            type: 'reference',
            typeArguments: { sheetId: 'depts', sheetColumnId: 'dept_name' },
          },
        ],
      },
    ];
    const mappings = [
      {
        sheetId: 'depts',
        sheetColumnId: 'dept_name',
        csvColumnName: 'DeptName',
      },
      { sheetId: 'people', sheetColumnId: 'name', csvColumnName: 'Name' },
    ];
    const data = [
      { Name: 'Ann', DeptName: 'Engineering' },
      { Name: 'Bob', DeptName: 'Sales' },
    ];
    const rows = rowsFor(sheets, mappings, data);
    expect(rows[0]).toEqual({ name: 'Ann', dept: 'Engineering' });
    expect(rows[1]).toEqual({ name: 'Bob', dept: 'Sales' });
  });
});

const sheets = [
  {
    columns: [
      { label: 'Full Name', id: 'name' },
      { label: 'Email', id: 'email' },
      { label: 'Phone Number', id: 'phone_number' },
    ],
  },
];

describe('buildSuggestedHeaderMappings', () => {
  it('creates suggested header mappings', () => {
    const suggestedHeaderMappings = buildSuggestedHeaderMappings(sheets, [
      'Name',
      'Email',
      'Phone Number',
    ]);
    const phoneNumberMapping = suggestedHeaderMappings.find(
      (headerMapping) => headerMapping.csvColumnName === 'Phone Number'
    );
    expect(phoneNumberMapping.sheetColumnId).toEqual('phone_number');

    const emailMapping = suggestedHeaderMappings.find(
      (headerMapping) => headerMapping.csvColumnName === 'Email'
    );
    expect(emailMapping.sheetColumnId).toEqual('email');

    const nameMapping = suggestedHeaderMappings.find(
      (headerMapping) => headerMapping.csvColumnName === 'Name'
    );
    expect(nameMapping.sheetColumnId).toEqual('name');
  });
});
