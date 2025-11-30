import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { useAppTheme } from '@/hooks/use-app-theme';
import { AppText } from './app-text';

export interface BrandLogoProps {
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
  align?: 'left' | 'center';
}

export const BrandLogo = memo(({ size = 120, showWordmark = true, showTagline = true, align = 'center' }: BrandLogoProps) => {
  const theme = useAppTheme();
  const width = size * 1.6;
  const height = size;
  const gradientId = useMemo(() => `nidhi-gradient-${Math.random().toString(36).slice(2, 7)}`, []);
  const aquaId = useMemo(() => `nidhi-aqua-${Math.random().toString(36).slice(2, 7)}`, []);

  const clearSpace = size * 0.25;

  return (
    <View
      style={[
        styles.wrapper,
        { paddingVertical: clearSpace / 2 },
        showWordmark ? styles.fullWidth : undefined,
        align === 'center' ? styles.center : undefined,
      ]}
    >
      <Svg width={width} height={height} viewBox="0 0 220 120" accessibilityRole="image" aria-label="NIDHI SETU logo">
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={theme.colors.gradientStart} />
            <Stop offset="100%" stopColor={theme.colors.gradientEnd} />
          </LinearGradient>
          <LinearGradient id={aquaId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E63FF" />
            <Stop offset="100%" stopColor="#124B8A" />
          </LinearGradient>
        </Defs>
        <Path
          d="M10 60C45 10 85 0 110 0s65 10 100 60c-35 50-75 60-100 60S45 110 10 60Z"
          fill={theme.colors.surface}
          opacity={0.15}
        />
        <Path
          d="M10 60C45 18 90 6 110 6s65 12 100 54c-35 42-75 54-100 54S45 102 10 60Z"
          fill={`url(#${gradientId})`}
        />
        <Path
          d="M26 60c28-32 54-38 84-38s56 6 84 38c-28 32-54 38-84 38S54 92 26 60Z"
          fill={`url(#${aquaId})`}
          opacity={0.8}
        />
        <Circle cx={110} cy={60} r={28} fill={theme.colors.secondary} opacity={0.85} />
        <Circle cx={110} cy={60} r={18} fill={theme.colors.gradientEnd} />
        <Circle cx={110} cy={60} r={9} fill={theme.colors.surface} opacity={0.9} />
        <Circle cx={100} cy={52} r={5} fill={theme.colors.primary} opacity={0.9} />
        <Circle cx={123} cy={70} r={4} fill={theme.colors.primaryContainer} />
      </Svg>
      {showWordmark ? (
        <View style={[styles.textBlock, align === 'center' ? styles.center : undefined]}
          accessibilityRole="text"
        >
          <AppText variant="displayMedium" color="text" weight="600">
            NIDHI SETU
          </AppText>
          {showTagline ? (
            <AppText variant="labelSmall" color="muted">
              YOUR MONEY, UNDER YOUR WATCH
            </AppText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

BrandLogo.displayName = 'BrandLogo';

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  fullWidth: {
    width: '100%',
  },
  center: {
    alignItems: 'center',
  },
  textBlock: {
    gap: 2,
  },
});
