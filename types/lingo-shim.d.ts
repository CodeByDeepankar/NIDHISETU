import type { ComponentType, ReactNode } from 'react';

declare module 'lingo.dev/react' {
  type LocaleValue = {
    locale: string;
    dictionary: Record<string, string>;
    setLocale: (next: string | ((current: string) => string)) => void;
  };

  export type TranslateFunction = (key: string, fallback?: string) => string;

  export function useAppLocale(): LocaleValue;
  export function setAppLocale(next: string | ((current: string) => string)): void;
  export function useT(): TranslateFunction;
  export function t(key: string, fallback?: string): string;

  interface LingoProviderProps {
    dictionary: {
      files: Record<string, unknown>;
    };
    children?: ReactNode;
  }

  export const LingoProvider: ComponentType<LingoProviderProps>;

  export * from '@lingo.dev/_react/client';
}
