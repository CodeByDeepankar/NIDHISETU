import { AppTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Returns the memoized design system theme (light/dark aware).
 */
export const useAppTheme = (): AppTheme => {
  const { theme } = useTheme();
  return theme;
};
