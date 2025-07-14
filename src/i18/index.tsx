import { createContext, Fragment } from 'preact';
import enTranslation from './en/translation.json';
import frTranslation from './fr/translation.json';
import ptBRTranslation from './pt-BR/translation.json';
import { useContext } from 'preact/hooks';
import { ReactNode } from 'preact/compat';
import {
  ArgumentsTypeHtml,
  ArgumentsTypeText,
  Resources,
  Translation,
  TranslationContextType,
} from './types';
import { useImporterDefinition } from '@/importer/hooks';

const resources: Record<string, Translation | undefined> = {
  en: enTranslation,
  fr: frTranslation,
  'pt-BR': ptBRTranslation,
} satisfies Resources;

const defaultLocale = 'en';

function extractTranslation(
  currentLocale: string,
  key: string,
  translationResources?: Resources
) {
  const keyParts = key.split('.');

  let result: any =
    translationResources?.[currentLocale] ?? resources[currentLocale];

  for (const k of keyParts) {
    if (result && typeof result === 'object') {
      result = result[k];
    } else {
      return key;
    }
  }

  return typeof result === 'string' ? result : key;
}

function replaceArguments(
  translation: string,
  argumentValues: ArgumentsTypeText
) {
  // Mathing {{key}} in the translation string
  return translation.replace(/{{([^}]+)}}/g, (_, match) => {
    const value = argumentValues[match] ?? `{${match}}`;

    return `${value}`;
  });
}

function replaceArgumentsHtml(
  translation: string,
  argumentValues: ArgumentsTypeHtml
) {
  // Mathing {{key}} in the translation string
  const argumentMatches = translation.split(/({{[^}]+}})/g);

  return (
    <span>
      {argumentMatches.map((argument) => {
        const argumentMatch = argument.match(/{{([^}]+)}}/);
        let result: ReactNode = argument;
        if (argumentMatch) {
          const key = argumentMatch[1];
          const argumentValue = argumentValues[key];

          result = argumentValue ?? `{${key}}`;
        }

        return <Fragment key={argument}>{result}</Fragment>;
      })}
    </span>
  );
}

const TranslationContext = createContext<TranslationContextType>(
  {} as TranslationContextType
);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { translationResources, locale: selectedLocale } =
    useImporterDefinition();
  const locale = selectedLocale ?? defaultLocale;

  function t(key: string, argumentValues: ArgumentsTypeText = {}): string {
    const translation = extractTranslation(locale, key, translationResources);

    return replaceArguments(translation, argumentValues);
  }

  function tHtml(
    key: string,
    argumentValues: ArgumentsTypeHtml = {}
  ): ReactNode {
    const translation = extractTranslation(locale, key, translationResources);

    return replaceArgumentsHtml(translation, argumentValues);
  }

  return (
    <TranslationContext.Provider value={{ t, tHtml }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslations() {
  return useContext(TranslationContext);
}
