import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';

import type { ColorToken } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { AppText } from './app-text';

export interface ChipProps {
  label: string;
  tone?: ColorToken;
  backgroundColor?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const Chip = ({ label, tone = 'primary', backgroundColor, leftIcon, rightIcon, style, onPress }: ChipProps) => {
  const theme = useAppTheme();
  const bg = backgroundColor ?? theme.colors.primaryContainer;
  const textColor = theme.colors[tone] ?? theme.colors.primary;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: bg, borderRadius: theme.radii.pill }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      {leftIcon}
      <AppText variant="labelMedium" color={textColor}>
        {label}
      </AppText>
      {rightIcon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 6,
  },
});
