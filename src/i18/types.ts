import { ReactNode } from 'preact/compat';
import type enTranslation from './en/translation.json';

type TranslationValue = string | { [key: string]: TranslationValue };
export type Translations = Record<string, TranslationValue>;
export type ArgumentsType<T> = Record<string, T>;

export type ArgumentsTypeText = ArgumentsType<string | number>;
export type ArgumentsTypeHtml = ArgumentsType<ReactNode>;

export type Resources = {
  [lang: string]: Translations;
};

type Prettify<T> = {
  [K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K];
} & unknown;

type CreateTranslation<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
      ? CreateTranslation<T[K]>
      : T[K];
};

export type Translation = Prettify<CreateTranslation<typeof enTranslation>>;

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never;

type TranslationPaths<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends string
        ? K & string
        : T[K] extends object
          ? (K & string) | Join<K & string, TranslationPaths<T[K]>>
          : never;
    }[keyof T]
  : never;

export type TranslationKey = TranslationPaths<Translation>;

export type TranslationContextType = {
  t: (key: TranslationKey, argumentValues?: ArgumentsTypeText) => string;
  tHtml: (key: TranslationKey, argumentValues?: ArgumentsTypeHtml) => ReactNode;
};
