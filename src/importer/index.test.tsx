// @vitest-environment happy-dom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/preact';
import Importer from '.';
import { ImporterDefinition, SheetDefinition } from '../types';

vi.mock('dropzone', () => ({
  default: vi.fn(),
}));

const employees: SheetDefinition = {
  id: 'employees',
  label: 'Employees',
  columns: [{ id: 'name', label: 'Employee name', type: 'string' }],
};

const products: SheetDefinition = {
  id: 'products',
  label: 'Products',
  columns: [{ id: 'sku', label: 'Product SKU', type: 'string' }],
};

function props(sheets: SheetDefinition[]): ImporterDefinition {
  return { sheets, onComplete: async () => {}, allowManualDataEntry: true };
}

const enterManually = { name: 'Or just manually enter your data' };

afterEach(() => {
  cleanup();
});

describe('Importer when its sheets change', () => {
  it('starts fresh for a different set of sheets', () => {
    const view = render(<Importer {...props([employees])} />);
    fireEvent.click(view.getByRole('button', enterManually));
    expect(view.getByText('Employee name')).toBeTruthy();

    view.rerender(<Importer {...props([products])} />);
    fireEvent.click(view.getByRole('button', enterManually));

    expect(view.getByText('Product SKU')).toBeTruthy();
    expect(view.queryByText('Employee name')).toBeNull();
  });

  it("keeps the user's progress when only labels change", () => {
    const view = render(<Importer {...props([employees])} />);
    fireEvent.click(view.getByRole('button', enterManually));

    const relabelled: SheetDefinition = {
      ...employees,
      columns: [{ id: 'name', label: 'Full name', type: 'string' }],
    };
    view.rerender(<Importer {...props([relabelled])} />);

    // still in the preview, not back on the upload screen
    expect(view.queryByRole('button', enterManually)).toBeNull();
    expect(view.getByText('Full name')).toBeTruthy();
  });

  it("starts fresh when a sheet's columns change", () => {
    const view = render(<Importer {...props([employees])} />);
    fireEvent.click(view.getByRole('button', enterManually));

    const withEmail: SheetDefinition = {
      ...employees,
      columns: [
        ...employees.columns,
        { id: 'email', label: 'Email', type: 'string' },
      ],
    };
    view.rerender(<Importer {...props([withEmail])} />);

    expect(view.getByRole('button', enterManually)).toBeTruthy();
  });
});
