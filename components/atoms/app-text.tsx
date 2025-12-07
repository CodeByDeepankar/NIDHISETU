import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { TextProps, TextStyle } from 'react-native';
import { Text } from 'react-native';
import { useT } from 'lingo.dev/react';

import type { AppTheme, ColorToken, TypographyVariant } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken | string;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
  /** Optional explicit translation key. */
  tKey?: string;
  /** Toggle automatic translation of string children. Defaults to true. */
  translate?: boolean;
  /** Fallback text if the translation key is missing. */
  fallback?: string;
};

/**
 * Typography-driven Text atom aligned with the Material 3 scale.
 */
export const AppText = ({
  variant = 'bodyMedium',
  color = 'text',
  weight,
  align,
  tKey,
  translate = true,
  fallback,
  style,
  children,
  ...rest
}: AppTextProps) => {
  const theme = useAppTheme();
  const t = useT();
  const variantStyle = theme.typography[variant];
  const palette = theme.colors;

  const resolvedColor = typeof color === 'string' ? palette[color as ColorToken] ?? color : palette[color];
  const resolvedChildren = useMemo<ReactNode>(() => {
    if (typeof tKey === 'string' && tKey.length > 0) {
      return t(tKey, fallback ?? tKey);
    }

    if (!translate || typeof children !== 'string') {
      return children;
    }

    const trimmed = children.trim();
    if (!trimmed) {
      return children;
    }

    return t(children, fallback ?? children);
  }, [children, fallback, t, tKey, translate]);

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
      {resolvedChildren}
    </Text>
  );
};

export type TextColor = keyof AppTheme['colors'];
