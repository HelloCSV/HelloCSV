// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/preact';

// Mutable holders so each test can control the mocked importer contexts.
const holders = vi.hoisted(() => ({
  state: {
    value: {} as { sheetData: unknown[]; validationInProgress: boolean },
  },
  def: {
    value: {} as { availableActions: string[]; csvDownloadMode: string },
  },
}));

vi.mock('@/importer/reducer', () => ({
  useImporterState: () => holders.state.value,
}));
vi.mock('@/importer/hooks', () => ({
  useImporterDefinition: () => holders.def.value,
}));

// Render every row deterministically — happy-dom has no real layout for the
// virtualizer to measure, and virtualization itself is a library concern.
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        key: index,
        start: index * 52,
        end: (index + 1) * 52,
      })),
    getTotalSize: () => count * 52,
    measureElement: () => {},
    scrollToIndex: () => {},
    options: { scrollMargin: 0 },
  }),
}));

import SheetDataEditor from './SheetDataEditor';
import { TranslationProvider } from '@/i18';
import { SheetDefinition, SheetState } from '@/types';

const sheetDefinition: SheetDefinition = {
  id: 'people',
  label: 'People',
  columns: [
    { id: 'name', label: 'Name', type: 'string' },
    { id: 'city', label: 'City', type: 'string' },
  ],
};

function makeData(): SheetState {
  return {
    sheetId: 'people',
    rows: [
      { name: 'Ann', city: 'NY' },
      { name: 'Bob', city: 'LA' },
      { name: 'Cat', city: 'SF' },
    ],
  };
}

function setup(
  overrides: Partial<Parameters<typeof SheetDataEditor>[0]> = {},
  def: SheetDefinition = sheetDefinition,
  data: SheetState = makeData()
) {
  holders.state.value = { sheetData: [data], validationInProgress: false };
  holders.def.value = {
    availableActions: ['editRows', 'removeRows'],
    csvDownloadMode: 'value',
  };

  const setRowData = vi.fn();
  const setRowsData = vi.fn();

  const utils = render(
    <TranslationProvider>
      <SheetDataEditor
        sheetDefinition={def}
        data={data}
        sheetValidationErrors={[]}
        setRowData={setRowData}
        setRowsData={setRowsData}
        removeRows={vi.fn()}
        addEmptyRow={vi.fn()}
        resetState={vi.fn()}
        enumLabelDict={{}}
        {...overrides}
      />
    </TranslationProvider>
  );

  const cellAt = (row: number, col: number) =>
    utils.container.querySelector<HTMLElement>(
      `[data-cell-row="${row}"][data-cell-col="${col}"]`
    )!;

  return { ...utils, data, setRowData, setRowsData, cellAt };
}

let clipboardText = '';
beforeEach(() => {
  clipboardText = '';
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: (text: string) => {
        clipboardText = text;
        return Promise.resolve();
      },
      readText: () => Promise.resolve(clipboardText),
    },
  });

  globalThis.ResizeObserver = class {
    observe() {}

    unobserve() {}

    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SheetDataEditor keyboard grid', () => {
  it('renders WAI-ARIA grid semantics', () => {
    const { container, cellAt } = setup();
    const grid = container.querySelector('[role="grid"]')!;
    expect(grid).toBeTruthy();
    expect(grid.getAttribute('aria-multiselectable')).toBe('true');
    // 3 data rows + header
    expect(grid.getAttribute('aria-rowcount')).toBe('4');
    // 2 data columns + checkbox
    expect(grid.getAttribute('aria-colcount')).toBe('3');
    expect(cellAt(0, 0).getAttribute('role')).toBe('gridcell');
    // checkbox column is aria-colindex 1, first data column is 2
    expect(cellAt(0, 0).getAttribute('aria-colindex')).toBe('2');
  });

  it('moves the active cell with arrow keys (roving tabindex)', () => {
    const { cellAt } = setup();
    fireEvent.click(cellAt(0, 0));
    expect(cellAt(0, 0).getAttribute('tabindex')).toBe('0');

    fireEvent.keyDown(cellAt(0, 0), { key: 'ArrowDown' });
    expect(cellAt(1, 0).getAttribute('tabindex')).toBe('0');
    expect(cellAt(0, 0).getAttribute('tabindex')).toBe('-1');

    fireEvent.keyDown(cellAt(1, 0), { key: 'ArrowRight' });
    expect(cellAt(1, 1).getAttribute('tabindex')).toBe('0');
  });

  it('extends a selection with Shift+Arrow (aria-selected)', () => {
    const { cellAt } = setup();
    fireEvent.click(cellAt(0, 0));
    fireEvent.keyDown(cellAt(0, 0), { key: 'ArrowDown', shiftKey: true });

    expect(cellAt(0, 0).getAttribute('aria-selected')).toBe('true');
    expect(cellAt(1, 0).getAttribute('aria-selected')).toBe('true');
    expect(cellAt(2, 0).getAttribute('aria-selected')).toBe('false');
  });

  it('type-to-edit then Enter commits and moves down', () => {
    const { cellAt, setRowData } = setup();
    fireEvent.click(cellAt(0, 0));
    fireEvent.keyDown(cellAt(0, 0), { key: 'Z' });

    const input = cellAt(0, 0).querySelector<HTMLInputElement>('input')!;
    expect(input).toBeTruthy();
    expect(input.value).toBe('Z');
    fireEvent.input(input, { target: { value: 'Zed' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(setRowData).toHaveBeenCalledTimes(1);
    expect(setRowData).toHaveBeenCalledWith({
      sheetId: 'people',
      rowIndex: 0,
      value: { name: 'Zed', city: 'NY' },
    });
    // Moved exactly one row down — not two.
    expect(cellAt(1, 0).getAttribute('tabindex')).toBe('0');
    expect(cellAt(2, 0).getAttribute('tabindex')).toBe('-1');
  });

  it('Enter while editing moves exactly one cell (no double navigation)', () => {
    const { cellAt } = setup();
    fireEvent.click(cellAt(1, 0));
    fireEvent.keyDown(cellAt(1, 0), { key: 'F2' });
    const input = cellAt(1, 0).querySelector<HTMLInputElement>('input')!;
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(cellAt(2, 0).getAttribute('tabindex')).toBe('0');
    expect(cellAt(1, 0).getAttribute('tabindex')).toBe('-1');
    // Not two below.
    expect(cellAt(0, 0).getAttribute('tabindex')).toBe('-1');
  });

  it('extends a selection with Shift+click', () => {
    const { cellAt } = setup();
    fireEvent.click(cellAt(0, 0));
    fireEvent.click(cellAt(2, 1), { shiftKey: true });
    // Whole 3x2 block selected.
    expect(cellAt(0, 0).getAttribute('aria-selected')).toBe('true');
    expect(cellAt(1, 0).getAttribute('aria-selected')).toBe('true');
    expect(cellAt(2, 1).getAttribute('aria-selected')).toBe('true');
    expect(cellAt(0, 1).getAttribute('aria-selected')).toBe('true');
  });

  it('selects a range by click-and-drag', () => {
    const { cellAt } = setup();
    fireEvent.mouseDown(cellAt(0, 0));
    fireEvent.mouseEnter(cellAt(1, 1));
    fireEvent.mouseUp(window);

    expect(cellAt(0, 0).getAttribute('aria-selected')).toBe('true');
    expect(cellAt(1, 1).getAttribute('aria-selected')).toBe('true');
    expect(cellAt(1, 0).getAttribute('aria-selected')).toBe('true');
    expect(cellAt(0, 1).getAttribute('aria-selected')).toBe('true');
    // Row 2 not part of the drag.
    expect(cellAt(2, 0).getAttribute('aria-selected')).toBe('false');
  });

  it('renders active ring and selection tint as overlays (visible over error cells)', () => {
    const { cellAt } = setup({
      sheetValidationErrors: [
        {
          sheetId: 'people',
          rowIndex: 0,
          columnId: 'name',
          message: 'validations.required',
        },
        {
          sheetId: 'people',
          rowIndex: 1,
          columnId: 'name',
          message: 'validations.required',
        },
      ],
    });
    fireEvent.click(cellAt(0, 0));
    fireEvent.keyDown(cellAt(0, 0), { key: 'ArrowDown', shiftKey: true });

    // Active cell (1,0) shows a ring overlay; anchor (0,0) shows a tint overlay
    // — both are error cells, so the overlays must sit on top of the error bg.
    expect(cellAt(1, 0).querySelector('.ring-2')).not.toBeNull();
    expect(
      cellAt(0, 0).querySelector('[class*="bg-hello-csv-primary/20"]')
    ).not.toBeNull();
  });

  it('opens the tooltip upward on the last row, downward otherwise', () => {
    const { cellAt } = setup({
      sheetValidationErrors: [
        {
          sheetId: 'people',
          rowIndex: 0,
          columnId: 'name',
          message: 'validations.required',
        },
        {
          sheetId: 'people',
          rowIndex: 2,
          columnId: 'name',
          message: 'validations.required',
        },
      ],
    });
    // The tooltip span is a sibling of the grid cell, inside the enclosing <td>.
    const tdOf = (row: number, col: number) => cellAt(row, col).closest('td')!;
    // 3 rows: row 0 opens down, last row (2) opens up.
    expect(tdOf(0, 0).querySelector('.top-full')).not.toBeNull();
    expect(tdOf(0, 0).querySelector('.bottom-full')).toBeNull();
    expect(tdOf(2, 0).querySelector('.bottom-full')).not.toBeNull();
    expect(tdOf(2, 0).querySelector('.top-full')).toBeNull();
  });

  it('clears the selection when clicking outside the grid', () => {
    const { cellAt } = setup();
    fireEvent.click(cellAt(0, 0));
    fireEvent.keyDown(cellAt(0, 0), { key: 'ArrowDown', shiftKey: true });
    expect(cellAt(1, 0).getAttribute('aria-selected')).toBe('true');

    // Click somewhere outside the grid container.
    fireEvent.mouseDown(document.body);

    expect(cellAt(0, 0).getAttribute('aria-selected')).toBe('false');
    expect(cellAt(1, 0).getAttribute('aria-selected')).toBe('false');
    // No cell remains active (roving tabindex resets).
    expect(cellAt(0, 0).getAttribute('tabindex')).toBe('-1');
  });

  it('Escape cancels an edit without committing', () => {
    const { cellAt, setRowData } = setup();
    fireEvent.click(cellAt(0, 0));
    fireEvent.keyDown(cellAt(0, 0), { key: 'F2' });
    const input = cellAt(0, 0).querySelector<HTMLInputElement>('input')!;
    fireEvent.input(input, { target: { value: 'changed' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(setRowData).not.toHaveBeenCalled();
  });

  it('Delete clears the selected cell via a batch change', () => {
    const { cellAt, setRowsData } = setup();
    fireEvent.click(cellAt(0, 0));
    fireEvent.keyDown(cellAt(0, 0), { key: 'Delete' });
    expect(setRowsData).toHaveBeenCalledWith([
      { sheetId: 'people', rowIndex: 0, value: { name: '', city: 'NY' } },
    ]);
  });

  it('copies a range and pastes it at the new active cell', async () => {
    const { cellAt, setRowsData } = setup();
    // Select A0:B0 (Ann, NY)
    fireEvent.click(cellAt(0, 0));
    fireEvent.keyDown(cellAt(0, 0), { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(cellAt(0, 1), { key: 'c', metaKey: true });
    await waitFor(() => expect(clipboardText).toBe('Ann\tNY'));

    // Paste at row 1
    fireEvent.click(cellAt(1, 0));
    fireEvent.keyDown(cellAt(1, 0), { key: 'v', metaKey: true });

    await waitFor(() =>
      expect(setRowsData).toHaveBeenCalledWith([
        { sheetId: 'people', rowIndex: 1, value: { name: 'Ann', city: 'NY' } },
      ])
    );
  });

  it('fills a column down over a selection with Ctrl+D', () => {
    const { cellAt, setRowsData } = setup();
    fireEvent.click(cellAt(0, 0));
    // extend down to row 2
    fireEvent.keyDown(cellAt(0, 0), { key: 'ArrowDown', shiftKey: true });
    fireEvent.keyDown(cellAt(1, 0), { key: 'ArrowDown', shiftKey: true });
    fireEvent.keyDown(cellAt(2, 0), { key: 'd', metaKey: true });

    expect(setRowsData).toHaveBeenCalledWith([
      { sheetId: 'people', rowIndex: 1, value: { name: 'Ann', city: 'LA' } },
      { sheetId: 'people', rowIndex: 2, value: { name: 'Ann', city: 'SF' } },
    ]);
  });

  it('selects the whole grid with Ctrl+A', () => {
    const { cellAt } = setup();
    fireEvent.click(cellAt(0, 0));
    fireEvent.keyDown(cellAt(0, 0), { key: 'a', metaKey: true });
    expect(cellAt(0, 0).getAttribute('aria-selected')).toBe('true');
    expect(cellAt(2, 1).getAttribute('aria-selected')).toBe('true');
  });

  it('jumps to the last row with Ctrl+ArrowDown', () => {
    const { cellAt } = setup();
    fireEvent.click(cellAt(0, 0));
    fireEvent.keyDown(cellAt(0, 0), { key: 'ArrowDown', ctrlKey: true });
    expect(cellAt(2, 0).getAttribute('tabindex')).toBe('0');
  });

  it('read-only cells are focusable/navigable but reject editing', () => {
    const readOnlyDef: SheetDefinition = {
      id: 'people',
      label: 'People',
      columns: [
        { id: 'name', label: 'Name', type: 'string' },
        { id: 'city', label: 'City', type: 'string', isReadOnly: true },
      ],
    };
    const { cellAt, setRowData } = setup({}, readOnlyDef);

    // Navigate onto the read-only column.
    fireEvent.click(cellAt(0, 0));
    fireEvent.keyDown(cellAt(0, 0), { key: 'ArrowRight' });
    const roCell = cellAt(0, 1);
    expect(roCell.getAttribute('tabindex')).toBe('0'); // still focusable

    // Type-to-edit and F2 are suppressed on read-only cells.
    fireEvent.keyDown(roCell, { key: 'x' });
    fireEvent.keyDown(roCell, { key: 'F2' });
    expect(roCell.querySelector('input')).toBeNull();
    expect(setRowData).not.toHaveBeenCalled();
  });

  it('keeps error cells focusable with the tooltip as a focus-within ancestor', () => {
    const { cellAt } = setup({
      sheetValidationErrors: [
        {
          sheetId: 'people',
          rowIndex: 0,
          columnId: 'name',
          message: 'validations.required',
        },
      ],
    });

    const errorCell = cellAt(0, 0);
    fireEvent.click(errorCell);
    expect(errorCell.getAttribute('tabindex')).toBe('0');
    // The focusable grid cell must live inside the `group` tooltip wrapper so
    // group-focus-within reveals the error message on keyboard focus.
    expect(errorCell.closest('.group')).not.toBeNull();
  });

  it('clicking the filter ✕ clears the filter but stays in edit mode', () => {
    const enumDef: SheetDefinition = {
      id: 'people',
      label: 'People',
      columns: [
        {
          id: 'dept',
          label: 'Dept',
          type: 'enum',
          typeArguments: {
            values: [
              { label: 'Engineering', value: 'eng' },
              { label: 'Sales', value: 'sales' },
            ],
          },
        },
      ],
    };
    const data: SheetState = { sheetId: 'people', rows: [{ dept: 'eng' }] };
    const enumLabelDict = {
      people: { dept: { eng: 'Engineering', sales: 'Sales' } },
    };
    const { cellAt, setRowData } = setup({ enumLabelDict }, enumDef, data);

    fireEvent.click(cellAt(0, 0));
    fireEvent.keyDown(cellAt(0, 0), { key: 'F2' });

    const input = cellAt(0, 0).querySelector<HTMLInputElement>('input')!;
    expect(input).toBeTruthy();
    fireEvent.focus(input);
    // Type a filter so the ✕ appears.
    fireEvent.input(input, { target: { value: 'Sal' } });

    const clearBtn = Array.from(
      cellAt(0, 0).querySelectorAll('[role="button"]')
    ).find((el) => (el.getAttribute('aria-label') || '').match(/clear/i))!;
    expect(clearBtn).toBeTruthy();
    fireEvent.mouseDown(clearBtn);
    fireEvent.click(clearBtn);

    // Still editing (the combobox input is still rendered in the cell) and the
    // value was not changed.
    expect(cellAt(0, 0).querySelector('input')).toBeTruthy();
    expect(setRowData).not.toHaveBeenCalled();

    // Clicking the field itself also keeps edit mode.
    fireEvent.click(cellAt(0, 0).querySelector('input')!);
    expect(cellAt(0, 0).querySelector('input')).toBeTruthy();

    // Focus leaving the cell ends the edit.
    fireEvent.focusOut(cellAt(0, 0).querySelector('input')!, {
      relatedTarget: document.body,
    });
    expect(cellAt(0, 0).querySelector('input')).toBeNull();
  });
});
