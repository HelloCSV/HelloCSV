import { render, h } from 'preact';

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
  render(h(Importer, props), element);
}

export { OuterStateBuilder as CsvImporterStateBuilder };
