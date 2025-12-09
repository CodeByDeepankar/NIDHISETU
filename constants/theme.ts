import type { TextStyle, ViewStyle } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

export type ThemeMode = 'light' | 'dark';

type Shadow = Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'>;

const typography = {
  displayLarge: createType(32, 40, '600'),
  displayMedium: createType(28, 36, '600'),
  headlineLarge: createType(24, 32, '600'),
  headlineMedium: createType(20, 28, '600'),
  titleLarge: createType(18, 26, '500'),
  titleMedium: createType(16, 24, '500'),
  titleSmall: createType(14, 20, '500'),
  bodyLarge: createType(16, 24, '400'),
  bodyMedium: createType(14, 22, '400'),
  bodySmall: createType(12, 18, '400'),
  labelLarge: createType(16, 20, '500'),
  labelMedium: createType(14, 20, '500'),
  labelSmall: createType(12, 16, '400'),
} as const;

const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

const elevations: Record<'level0' | 'card' | 'fab', Shadow> = {
  level0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  fab: {
    shadowColor: 'rgba(30, 99, 255, 0.25)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
};

const lightColors = {
  primary: '#2563EB',
  onPrimary: '#FFFFFF',
  primaryContainer: '#DBEAFE',
  onPrimaryContainer: '#1E3A8A',
  secondary: '#4A2C82',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#EDE9FE',
  onSecondaryContainer: '#3C1D71',
  tertiary: '#7C3AED',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  outline: '#CBD5F5',
  text: '#1A1A1A',
  subtext: '#555555',
  muted: '#555555',
  border: '#DDDDDD',
  icon: '#1E293B',
  tint: '#2563EB',
  tabIconDefault: '#94A3B8',
  tabIconSelected: '#2563EB',
  success: '#16A34A',
  warning: '#FACC15',
  error: '#DC2626',
  info: '#0EA5E9',
  successContainer: '#DCFCE7',
  warningContainer: '#FEF9C3',
  errorContainer: '#FEE2E2',
  infoContainer: '#E0F2FE',
  card: '#F4F4F4',
  overlay: 'rgba(15, 23, 42, 0.6)',
  gradientStart: '#008080',
  gradientEnd: '#20B2AA',
};

const darkColors: typeof lightColors = {
  primary: '#5B8DEF',
  onPrimary: '#0B1220',
  primaryContainer: '#22355A',
  onPrimaryContainer: '#DCE7FF',
  secondary: '#9DB5F5',
  onSecondary: '#0B1220',
  secondaryContainer: '#1A2B4A',
  onSecondaryContainer: '#DCE7FF',
  tertiary: '#7C9AEF',
  background: '#0B1220',
  surface: '#0F1725',
  surfaceVariant: '#141E30',
  outline: '#1F2A40',
  text: '#E7ECF5',
  subtext: '#A6B2C6',
  muted: '#94A3B8',
  border: '#243049',
  icon: '#E7ECF5',
  tint: '#5B8DEF',
  tabIconDefault: '#7C8BA7',
  tabIconSelected: '#5B8DEF',
  success: '#4ADE80',
  warning: '#FACC15',
  error: '#F87171',
  info: '#38BDF8',
  successContainer: '#1C3124',
  warningContainer: '#2D2408',
  errorContainer: '#3A0E12',
  infoContainer: '#0E2742',
  card: '#111A2C',
  overlay: 'rgba(6, 12, 24, 0.78)',
  gradientStart: '#0F2027',
  gradientEnd: '#203A43',
};

export interface AppTheme {
  mode: ThemeMode;
  colors: typeof lightColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  elevations: typeof elevations;
  components: {
    button: {
      height: number;
      borderRadius: number;
    };
    input: {
      height: number;
      borderRadius: number;
    };
    card: {
      padding: number;
      borderRadius: number;
    };
    modal: {
      borderRadius: number;
    };
  };
}

const baseComponents = {
  button: {
    height: 48,
    borderRadius: 14,
  },
  input: {
    height: 50,
    borderRadius: 12,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radii.lg,
  },
  modal: {
    borderRadius: radii.xl,
  },
};

const lightTheme: AppTheme = {
  mode: 'light',
  colors: lightColors,
  typography,
  spacing,
  radii,
  elevations,
  components: baseComponents,
};

const darkTheme: AppTheme = {
  mode: 'dark',
  colors: darkColors,
  typography,
  spacing,
  radii,
  elevations,
  components: baseComponents,
};

export type TypographyVariant = keyof typeof typography;
export type ColorToken = keyof typeof lightColors;

export const Colors = {
  light: lightColors,
  dark: darkColors,
};

export const Tokens = {
  typography,
  spacing,
  radii,
  elevations,
};

export const getTheme = (mode: ThemeMode = 'light'): AppTheme => (mode === 'dark' ? darkTheme : lightTheme);

export const getPaperTheme = (mode: ThemeMode): MD3Theme => {
  const palette = mode === 'dark' ? darkColors : lightColors;
  const base = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    roundness: radii.md,
    colors: {
      ...base.colors,
      primary: palette.primary,
      background: palette.background,
      surface: palette.surface,
      secondary: palette.secondary,
      outline: palette.outline,
      error: palette.error,
    },
  };
};

function createType(fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight']): TextStyle {
  return {
    fontFamily: 'System',
    fontSize,
    lineHeight,
    fontWeight,
    letterSpacing: 0,
  };
}
