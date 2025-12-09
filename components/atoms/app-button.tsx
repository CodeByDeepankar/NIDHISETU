import type { PressableProps, PressableStateCallbackType, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import type { ColorToken } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { AppIcon, IconName } from './app-icon';
import { AppText } from './app-text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export type AppButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  compact?: boolean;
  tone?: ColorToken;
  /** Optional override for the label typography. */
  labelStyle?: StyleProp<TextStyle>;
  /** Backwards-compatible alias for labelStyle so screen code can keep using textStyle. */
  textStyle?: StyleProp<TextStyle>;
};

export const AppButton = ({
  label,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled,
  compact,
  tone = 'primary',
  style,
  labelStyle,
  textStyle,
  ...rest
}: AppButtonProps) => {
  const theme = useAppTheme();
  const isDisabled = Boolean(disabled || loading);
  const { backgroundColor, textColor, borderColor } = getVariantStyles(
    theme.colors[tone],
    variant,
    theme.colors,
    isDisabled
  );
  const buttonHeight = compact ? 44 : theme.components.button.height;

  const resolveStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const { pressed } = state;
    const incomingStyle =
      typeof style === 'function'
        ? style(state)
        : (style as StyleProp<ViewStyle> | undefined);

    return [
      styles.base,
      {
        minHeight: buttonHeight,
        borderRadius: theme.components.button.borderRadius,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor,
        borderColor,
        opacity: pressed ? 0.88 : 1,
        borderWidth: variant === 'outline' ? 1 : 0,
        shadowColor: '#000',
        shadowOpacity: variant === 'primary' ? 0.08 : 0,
        shadowOffset: { width: 0, height: variant === 'primary' ? 3 : 0 },
        shadowRadius: variant === 'primary' ? 6 : 0,
        elevation: variant === 'primary' ? 2 : 0,
      },
      incomingStyle,
    ];
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={resolveStyle}
      {...rest}
    >
      <View style={styles.contentRow}>
        {icon && iconPosition === 'left' ? (
          <AppIcon name={icon} size={20} color={textColor} style={styles.iconSpacing} />
        ) : null}
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <AppText
            variant="labelLarge"
            color={textColor}
            style={[styles.label, labelStyle, textStyle]}
          >
            {label}
          </AppText>
        )}
        {icon && iconPosition === 'right' ? (
          <AppIcon name={icon} size={20} color={textColor} style={styles.iconSpacing} />
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconSpacing: {
    marginHorizontal: 2,
  },
  label: {
    textTransform: 'capitalize',
  },
});

const getVariantStyles = (
  toneValue: string,
  variant: ButtonVariant,
  colors: Record<ColorToken, string>,
  disabled?: boolean
) => {
  const base = {
    backgroundColor: toneValue,
    textColor: colors.onPrimary,
    borderColor: 'transparent',
  };

  if (disabled) {
    return {
      backgroundColor: colors.surfaceVariant,
      textColor: colors.muted,
      borderColor: colors.surfaceVariant,
    };
  }

  switch (variant) {
    case 'secondary':
      return {
        backgroundColor: 'transparent',
        textColor: colors.secondary,
        borderColor: colors.secondary,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        textColor: toneValue,
        borderColor: toneValue,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        textColor: toneValue,
        borderColor: 'transparent',
      };
    default:
      return base;
  }
};
