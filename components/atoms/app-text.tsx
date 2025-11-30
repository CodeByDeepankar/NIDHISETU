import type { TextProps, TextStyle } from 'react-native';
import { Text } from 'react-native';

import type { AppTheme, ColorToken, TypographyVariant } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken | string;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
};

/**
 * Typography-driven Text atom aligned with the Material 3 scale.
 */
export const AppText = ({
  variant = 'bodyMedium',
  color = 'text',
  weight,
  align,
  style,
  children,
  ...rest
}: AppTextProps) => {
  const theme = useAppTheme();
  const variantStyle = theme.typography[variant];
  const palette = theme.colors;

  const resolvedColor = typeof color === 'string' ? palette[color as ColorToken] ?? color : palette[color];

  return (
    <Text
      {...rest}
      style={[
        variantStyle,
        weight ? { fontWeight: weight } : null,
        align ? { textAlign: align } : null,
        { color: resolvedColor },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export type TextColor = keyof AppTheme['colors'];
