// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/preact';
import { ThemeSetter } from './ThemeSetter';
import { ImporterDefinitionProvider } from '@/importer/hooks';
import { ImporterDefinitionWithDefaults } from '@/importer/types';
import { ThemeVariant } from './types';

const THEME_ATTRIBUTE = 'hello-csv-data-theme';

function renderWithTheme(theme?: ThemeVariant) {
  return render(
    <ImporterDefinitionProvider
      importerDefintion={{ theme } as ImporterDefinitionWithDefaults}
    >
      <ThemeSetter>
        <div />
      </ThemeSetter>
    </ImporterDefinitionProvider>
  );
}

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute(THEME_ATTRIBUTE);
});

describe('ThemeSetter', () => {
  it('applies the dark theme attribute to the document root', () => {
    renderWithTheme('dark');
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('applies a named theme variant to the document root', () => {
    renderWithTheme('theme-1');
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(
      'theme-1'
    );
  });

  it('leaves the attribute unset when no theme is provided', () => {
    renderWithTheme(undefined);
    expect(document.documentElement.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
  });
});
