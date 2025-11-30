import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleProp, TextStyle } from 'react-native';

import type { ColorToken } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type AppIconProps = {
  name: IconName;
  size?: number;
  color?: ColorToken | string;
  style?: StyleProp<TextStyle>;
};

export const AppIcon = ({ name, size = 20, color = 'text', style }: AppIconProps) => {
  const theme = useAppTheme();
  const palette = theme.colors;
  const resolvedColor = typeof color === 'string' ? palette[color as ColorToken] ?? color : palette[color];

  return <MaterialCommunityIcons name={name} size={size} color={resolvedColor} style={style} />;
};
