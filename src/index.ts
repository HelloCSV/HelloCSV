import { createRoot } from 'preact/compat/client';
import { createElement } from 'preact';

import Importer from './importer';
export * from './types';

import './index.css';
import { ImporterDefinition } from './types';
import { OuterStateBuilder } from './importer/state';

export default Importer;

export interface ImporterInstance {
  /** Re-renders the importer with new props, keeping its state. */
  render: (props: ImporterDefinition) => void;
  /** Removes the importer, its listeners and anything it rendered outside the element. */
  unmount: () => void;
}

export function renderImporter(
  element: HTMLElement,
  props: ImporterDefinition
): ImporterInstance {
  const root = createRoot(element);
  root.render(createElement(Importer, props));
  return {
    render: (nextProps) => root.render(createElement(Importer, nextProps)),
    unmount: () => root.unmount(),
  };
}

export { OuterStateBuilder as CsvImporterStateBuilder };
