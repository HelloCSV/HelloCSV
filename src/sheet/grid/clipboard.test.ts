import { describe, it, expect } from 'vitest';
import { serializeRange, mapPasteBlock, groupChangesByRow } from './clipboard';
import { SheetColumnDefinition } from '../types';

const stringCol = {
  id: 's',
  label: 'S',
  type: 'string',
} as SheetColumnDefinition;
const boolCol = {
  id: 'b',
  label: 'B',
  type: 'boolean',
} as SheetColumnDefinition;
const multiEnumCol = {
  id: 'e',
  label: 'E',
  type: 'enum',
  typeArguments: {
    multiple: true,
    delimiter: ';',
    values: [
      { label: 'JavaScript', value: 'js' },
      { label: 'Python', value: 'py' },
    ],
  },
} as SheetColumnDefinition;

describe('serializeRange', () => {
  it('joins a 2D block with tabs and newlines', () => {
    expect(
      serializeRange(
        [
          ['a', 'b'],
          ['c', 'd'],
        ],
        [stringCol, stringCol]
      )
    ).toBe('a\tb\nc\td');
  });

  it('serializes numbers, booleans and empty values', () => {
    expect(
      serializeRange([[1, true, '']], [stringCol, boolCol, stringCol])
    ).toBe('1\ttrue\t');
  });

  it('joins multi-enum arrays with the column delimiter', () => {
    expect(
      serializeRange([[['js', 'py'], 'z']], [multiEnumCol, stringCol])
    ).toBe('js;py\tz');
  });

  it('quotes cells containing a tab, newline or quote', () => {
    expect(
      serializeRange(
        [['a\tb', 'c\nd', 'say "hi"']],
        [stringCol, stringCol, stringCol]
      )
    ).toBe('"a\tb"\t"c\nd"\t"say ""hi"""');
  });
});

describe('mapPasteBlock', () => {
  const dims = { rowCount: 4, colCount: 3 };
  const editableEverywhere = () => true;

  it('places a block anchored at the target cell', () => {
    const changes = mapPasteBlock(
      [
        ['a', 'b'],
        ['c', 'd'],
      ],
      { row: 1, col: 1 },
      dims,
      editableEverywhere
    );
    expect(changes).toEqual([
      { row: 1, col: 1, value: 'a' },
      { row: 1, col: 2, value: 'b' },
      { row: 2, col: 1, value: 'c' },
      { row: 2, col: 2, value: 'd' },
    ]);
  });

  it('clamps a block that overflows the grid bounds', () => {
    const changes = mapPasteBlock(
      [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
      ],
      { row: 3, col: 2 },
      dims,
      editableEverywhere
    );
    // Only the top-left cell fits (row 3, col 2 is the last cell).
    expect(changes).toEqual([{ row: 3, col: 2, value: 'a' }]);
  });

  it('skips read-only target cells', () => {
    const editable = (_row: number, col: number) => col !== 1;
    const changes = mapPasteBlock(
      [['a', 'b']],
      { row: 0, col: 0 },
      dims,
      editable
    );
    expect(changes).toEqual([{ row: 0, col: 0, value: 'a' }]);
  });

  it('fills a whole selection when the block is a single cell', () => {
    const changes = mapPasteBlock(
      [['x']],
      { row: 0, col: 0 },
      dims,
      editableEverywhere,
      { top: 0, left: 0, bottom: 1, right: 1 }
    );
    expect(changes).toEqual([
      { row: 0, col: 0, value: 'x' },
      { row: 0, col: 1, value: 'x' },
      { row: 1, col: 0, value: 'x' },
      { row: 1, col: 1, value: 'x' },
    ]);
  });
});

describe('groupChangesByRow', () => {
  const baseRows = [
    { name: 'Ann', age: '30', city: 'NY' },
    { name: 'Bob', age: '25', city: 'LA' },
  ];

  it('coalesces multiple column edits to one row into a single merged row', () => {
    const grouped = groupChangesByRow(
      [
        { rowIndex: 0, columnId: 'name', value: 'Zed' },
        { rowIndex: 0, columnId: 'city', value: 'SF' },
        { rowIndex: 1, columnId: 'age', value: '99' },
      ],
      baseRows
    );
    expect(grouped).toEqual([
      { rowIndex: 0, value: { name: 'Zed', age: '30', city: 'SF' } },
      { rowIndex: 1, value: { name: 'Bob', age: '99', city: 'LA' } },
    ]);
  });

  it('does not mutate the source rows', () => {
    groupChangesByRow(
      [{ rowIndex: 0, columnId: 'name', value: 'Zed' }],
      baseRows
    );
    expect(baseRows[0].name).toBe('Ann');
  });
});
