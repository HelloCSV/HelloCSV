import {
  formatData,
  filterEmptyRows,
  normalizeValue,
  escapeDelimitedCell,
  serializeRows,
  generateCsvContent,
} from './';
import { describe, it, expect } from 'vitest';

const headerMappings = {
  0: {
    columnIndex: 0,
    selectedField: { value: 'name' },
    name: 'Name',
    confirmed: true,
  },
  1: {
    columnIndex: 1,
    selectedField: { value: 'email' },
    name: 'Email',
    confirmed: true,
  },
  2: {
    columnIndex: 2,
    selectedField: { value: 'phone_number' },
    name: 'Phone Number',
    confirmed: false,
  },
};

const data = [
  ['Name', 'Email', 'Phone Number'], // Headers
  ['chris', 'chris@example.com', '555-555-5555'], // This row is fine
  ['jason', 'jason@gmail.com', '555-555-5556'][ // This row is fine
    ('mike', 'mike@gmail.com', undefined)
  ], // This row is fine
];

describe('formatData', () => {
  it.skip('creates data for aggrid', () => {
    const output = formatData(headerMappings, data);

    expect(output[0].name).toEqual('chris');
    expect(output[0].email).toEqual('chris@example.com');
    expect(output[0].phone_number).toEqual('555-555-5555');

    expect(output[1].name).toEqual('jason');
    expect(output[1].email).toEqual('jason@gmail.com');
    expect(output[1].phone_number).toEqual('555-555-5556');

    expect(output[2].name).toEqual('mike');
    expect(output[2].email).toEqual('mike@gmail.com');
    expect(output[2].phone_number).toEqual(undefined);
  });
});

describe('filterEmptyRows', () => {
  it('it filters out empty rows', () => {
    expect(
      filterEmptyRows({
        rows: [{ key: 'hello' }, {}, {}],
      }).length
    ).toEqual(1);
    expect(filterEmptyRows({ rows: [{}, {}, {}] }).length).toEqual(0);
    expect(filterEmptyRows({ rows: [] }).length).toEqual(0);
  });
});

describe('normalizeValue', () => {
  it('normalizes a value', () => {
    expect(normalizeValue('patient.data-SEX_AT_BIRTH')).toEqual(
      'patientdatasexatbirth'
    );
  });
});

describe('escapeDelimitedCell', () => {
  it('leaves plain cells untouched and renders null as empty', () => {
    expect(escapeDelimitedCell('hello', ',')).toEqual('hello');
    expect(escapeDelimitedCell(42, ',')).toEqual('42');
    expect(escapeDelimitedCell(null, ',')).toEqual('');
    expect(escapeDelimitedCell(undefined, ',')).toEqual('');
  });

  it('quotes and escapes cells containing the delimiter, quotes or newlines', () => {
    expect(escapeDelimitedCell('a,b', ',')).toEqual('"a,b"');
    expect(escapeDelimitedCell('a,b', '\t')).toEqual('a,b'); // comma is fine under TSV
    expect(escapeDelimitedCell('a\tb', '\t')).toEqual('"a\tb"');
    expect(escapeDelimitedCell('say "hi"', ',')).toEqual('"say ""hi"""');
    expect(escapeDelimitedCell('line\nbreak', ',')).toEqual('"line\nbreak"');
  });
});

describe('serializeRows', () => {
  it('joins a 2D block with the delimiter and newlines', () => {
    expect(
      serializeRows(
        [
          ['a', 'b'],
          ['c', 'd'],
        ],
        ','
      )
    ).toEqual('a,b\nc,d');
    expect(serializeRows([['a', 'b']], '\t')).toEqual('a\tb');
  });
});

describe('generateCsvContent', () => {
  const sheetDefinition = {
    id: 'people',
    label: 'People',
    columns: [
      { id: 'name', label: 'Name', type: 'string' },
      { id: 'age', label: 'Age', type: 'number' },
    ],
  };
  const enumLabelDict = {};

  async function csvText(mode) {
    const blob = generateCsvContent(
      sheetDefinition,
      [
        { name: 'Ann', age: 30 },
        { name: 'Bob, Jr', age: 25 },
      ],
      enumLabelDict,
      mode
    );
    return blob.text();
  }

  it('serializes headers + rows and quotes cells with the separator', async () => {
    expect(await csvText('value')).toEqual('name,age\nAnn,30\n"Bob, Jr",25');
  });

  it('uses column labels as headers in label mode', async () => {
    expect(await csvText('label')).toEqual('Name,Age\nAnn,30\n"Bob, Jr",25');
  });
});
