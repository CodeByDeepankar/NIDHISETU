import { StyleSheet, View } from 'react-native';

import { AppIcon, IconName } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AnalyticsSummary as AnalyticsSummaryType } from '@/types/entities';

const metricConfig: { key: keyof AnalyticsSummaryType; label: string; icon: IconName; tone: MetricTone }[] = [
  { key: 'approved', label: 'Approved', icon: 'check-circle', tone: 'success' },
  { key: 'pending', label: 'Pending', icon: 'progress-clock', tone: 'warning' },
  { key: 'rejected', label: 'Rejected', icon: 'close-circle', tone: 'error' },
];

type MetricTone = 'success' | 'warning' | 'error' | 'primary';

export interface AnalyticsSummaryProps {
  data: AnalyticsSummaryType;
}

export const AnalyticsSummary = ({ data }: AnalyticsSummaryProps) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderRadius: theme.radii.lg }]}
      accessibilityRole="summary"
    >
      <AppText variant="titleMedium" color="text">
        Analytics Overview
      </AppText>
      <View style={styles.metricsRow}>
        {metricConfig.map((metric) => (
          <MetricCard
            key={metric.key}
            label={metric.label}
            value={data[metric.key as keyof AnalyticsSummaryType]}
            icon={metric.icon}
            tone={metric.tone as 'success' | 'warning' | 'error'}
          />
        ))}
  <MetricCard label="Total" value={data.total} icon="chart-bar" tone="primary" />
      </View>
    </View>
  );
};

const MetricCard = ({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: IconName;
  tone: MetricTone;
}) => {
  const theme = useAppTheme();
  const backgroundMap = {
    success: theme.colors.successContainer,
    warning: theme.colors.warningContainer,
    error: theme.colors.errorContainer,
    primary: theme.colors.primaryContainer,
  } as const;

  return (
    <View style={[styles.metricCard, { backgroundColor: backgroundMap[tone] }]}
      accessibilityRole="summary"
    >
  <AppIcon name={icon} size={22} color={tone === 'primary' ? 'primary' : tone} />
      <AppText variant="headlineLarge" color="text">
        {value}
      </AppText>
      <AppText variant="labelMedium" color="muted">
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47%',
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
});
