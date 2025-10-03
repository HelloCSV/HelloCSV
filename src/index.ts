import { createRoot } from 'preact/compat/client';
import { createElement } from 'preact';

import Importer from './importer';
export * from './types';

import './index.css';
import { ImporterDefinition } from './types';
import { OuterStateBuilder } from './importer/state';

export default Importer;

export function renderImporter(
  element: HTMLElement,
  props: ImporterDefinition
) {
  createRoot(element).render(createElement(Importer, props));
}

export { OuterStateBuilder as CsvImporterStateBuilder };
