import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type ViewProps } from 'react-native';

import { AppIcon } from '@/components/atoms/app-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTheme } from '@/hooks/use-theme';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  accentLabel?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewProps['style'];
}

export const useBeneficiaryPalette = () => {
  const theme = useAppTheme();
  const isDark = theme.mode === 'dark';

  return useMemo(
    () => ({
      background: isDark ? '#040C0A' : '#F3F8F4',
      surface: isDark ? '#111F1A' : '#FFFFFF',
      mutedSurface: isDark ? 'rgba(255,255,255,0.05)' : '#EDF5EF',
      border: isDark ? 'rgba(255,255,255,0.08)' : '#D9E6DC',
      heroGradient: (isDark
        ? ['#04221D', '#0A3F35', '#061C18']
        : ['#E5FFF4', '#B8F6DC', '#86E1BF']) as readonly [string, string, string],
      accent: '#0E9F6E',
      accentSoft: '#42D8A1',
      accentAmber: '#F5A524',
      accentSky: '#38BDF8',
      accentViolet: '#7C5CFC',
      text: theme.colors.text,
      subtext: theme.colors.subtext,
    }),
    [isDark, theme.colors.subtext, theme.colors.text]
  );
};

export const SectionCard = ({ title, subtitle, accentLabel, children, footer, style }: SectionCardProps) => {
  const palette = useBeneficiaryPalette();
  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
        style,
      ]}
    >
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.sectionSubtitle, { color: palette.subtext }]}>{subtitle}</Text> : null}
        </View>
        {accentLabel ? (
          <View style={[styles.badge, { backgroundColor: `${palette.accent}1F` }]}
            accessibilityLabel={accentLabel}
          >
            <Text style={[styles.badgeText, { color: palette.accent }]}>{accentLabel}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ gap: 12 }}>{children}</View>
      {footer ? <View style={{ marginTop: 12 }}>{footer}</View> : null}
    </View>
  );
};

export const HeroSurface = ({ children }: { children: React.ReactNode }) => {
  const palette = useBeneficiaryPalette();
  return (
    <LinearGradient colors={palette.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroSurface}
      accessibilityRole="summary"
    >
      {children}
    </LinearGradient>
  );
};

export const Pill = ({ label, tone = 'default' }: { label: string; tone?: 'default' | 'amber' | 'sky' | 'violet' | 'success' | 'warning' | 'danger' }) => {
  const palette = useBeneficiaryPalette();
  const toneMap = {
    default: { bg: `${palette.accent}1A`, color: palette.accent },
    amber: { bg: 'rgba(245,165,36,0.14)', color: palette.accentAmber },
    sky: { bg: 'rgba(56,189,248,0.14)', color: palette.accentSky },
    violet: { bg: 'rgba(124,92,252,0.14)', color: palette.accentViolet },
    success: { bg: 'rgba(34,197,94,0.14)', color: '#22C55E' },
    warning: { bg: 'rgba(250,204,21,0.18)', color: '#FACC15' },
    danger: { bg: 'rgba(248,113,113,0.16)', color: '#F87171' },
  } as const;
  const toneColors = toneMap[tone];
  return (
    <View style={[styles.pill, { backgroundColor: toneColors.bg }]}
      accessibilityLabel={label}
    >
      <Text style={[styles.pillText, { color: toneColors.color }]}>{label}</Text>
    </View>
  );
};

export const InfoRow = ({ label, value }: { label: string; value: string }) => {
  const palette = useBeneficiaryPalette();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: palette.subtext }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
};

type ThemeToggleButtonProps = {
  variant?: 'default' | 'icon';
};

export const ThemeToggleButton = ({ variant = 'default' }: ThemeToggleButtonProps) => {
  const palette = useBeneficiaryPalette();
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === 'dark';
  const label = isDark ? 'Light mode' : 'Dark mode';
  const icon = isDark ? 'white-balance-sunny' : 'weather-night';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${label}`}
      onPress={toggleTheme}
      style={[
        styles.themeToggle,
        variant === 'icon' && styles.themeToggleIconOnly,
        {
          backgroundColor: palette.mutedSurface,
          borderColor: palette.border,
        },
      ]}
    >
      <AppIcon name={icon} size={18} color={isDark ? 'warning' : 'icon'} />
      {variant === 'default' ? (
        <Text style={[styles.themeToggleLabel, { color: palette.text }]}>{label}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  heroSurface: {
    borderRadius: 28,
    padding: 20,
    gap: 16,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  themeToggleIconOnly: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  themeToggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
