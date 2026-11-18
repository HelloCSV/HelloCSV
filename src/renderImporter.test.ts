// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { renderImporter } from '.';
import { ImporterDefinition } from './types';

vi.mock('dropzone', () => ({
  default: vi.fn(),
}));

const props: ImporterDefinition = {
  sheets: [
    {
      id: 'employees',
      label: 'Employees',
      columns: [
        {
          label: 'Name',
          id: 'name',
          type: 'string',
          validators: [{ validate: 'required' }],
        },
      ],
    },
  ],
  onComplete: async () => {},
};

describe('renderImporter', () => {
  it('returns an importer that can be unmounted and rendered again', async () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const importer = renderImporter(element, props);
    expect(element.textContent).toContain('Name');
    // let effects run
    await new Promise((resolve) => setTimeout(resolve, 50));
    // its tooltips are portalled into <body>, outside the element
    expect(
      document.querySelectorAll('body > .hello-csv').length
    ).toBeGreaterThan(0);

    importer.unmount();
    expect(element.childNodes.length).toBe(0);
    expect(document.querySelectorAll('body > .hello-csv').length).toBe(0);

    const again = renderImporter(element, props);
    expect(element.textContent).toContain('Name');
    again.unmount();
  });
});
