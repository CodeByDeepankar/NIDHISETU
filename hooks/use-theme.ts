import { useContext } from 'react';

import { getTheme } from '@/constants/theme';
import { ThemeContext, type ThemeContextValue } from '@/context/ThemeProvider';

const fallbackTheme: ThemeContextValue = {
  mode: 'light',
  theme: getTheme('light'),
  toggleTheme: () => undefined,
  setThemeMode: () => undefined,
  hydrated: false,
};

let hasWarnedAboutThemeProvider = false;

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    if (__DEV__ && !hasWarnedAboutThemeProvider) {
      console.warn('useTheme called outside ThemeProvider. Falling back to light theme.');
      hasWarnedAboutThemeProvider = true;
    }
    return fallbackTheme;
  }

  return context;
};
