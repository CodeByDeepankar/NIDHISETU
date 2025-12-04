import { useState } from 'react';
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

import type { ColorToken } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { AppIcon, IconName } from './app-icon';
import { AppText } from './app-text';

export type InputFieldProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  secureToggle?: boolean;
  backgroundColor?: ColorToken | string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
};

export const InputField = ({
  label,
  helperText,
  errorText,
  leftIcon,
  rightIcon,
  secureTextEntry,
  secureToggle,
  backgroundColor = 'surfaceVariant',
  containerStyle,
  inputStyle,
  style,
  ...rest
}: InputFieldProps) => {
  const theme = useAppTheme();
  const [isSecure, setSecure] = useState(Boolean(secureTextEntry));
  const hasError = Boolean(errorText);
  const resolvedBg = typeof backgroundColor === 'string' ? backgroundColor : theme.colors[backgroundColor];
  const outlineColor = hasError ? theme.colors.error : theme.colors.gradientEnd;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <AppText variant="labelMedium" color="muted" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.inputRow,
          {
            minHeight: theme.components.input.height,
            borderRadius: theme.components.input.borderRadius,
            paddingHorizontal: theme.spacing.md,
            backgroundColor: hasError ? resolvedBg : theme.colors.surface,
            borderWidth: 1,
            borderColor: outlineColor,
          },
        ]}
      >
        {leftIcon ? <AppIcon name={leftIcon} size={20} color="muted" style={styles.iconPadding} /> : null}
        <TextInput
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, { color: theme.colors.text }, inputStyle, style]}
          secureTextEntry={isSecure}
          {...rest}
        />
        {secureToggle ? (
          <TouchableOpacity accessibilityRole="button" onPress={() => setSecure((prev) => !prev)}>
            <AppIcon name={isSecure ? 'eye-off' : 'eye'} size={20} color="muted" />
          </TouchableOpacity>
        ) : null}
        {!secureToggle && rightIcon ? <AppIcon name={rightIcon} size={20} color="muted" /> : null}
      </View>
      {hasError ? (
        <AppText variant="labelSmall" color="error" style={styles.helper}>
          {errorText}
        </AppText>
      ) : helperText ? (
        <AppText variant="labelSmall" color="muted" style={styles.helper}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  helper: {
    marginTop: 4,
  },
  iconPadding: {
    marginRight: 4,
  },
});
