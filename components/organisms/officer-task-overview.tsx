import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AnalyticsSummary } from '@/types/entities';

interface StatItem {
  label: string;
  value: number;
  color: string;
  progress: number; // 0 to 1
}

interface OfficerTaskOverviewProps {
  stats: AnalyticsSummary;
}

const StatCard = ({ item }: { item: StatItem }) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
      <View style={[styles.colorStrip, { backgroundColor: item.color }]} />
      <View style={styles.content}>
        <AppText variant="headlineMedium" color="text" weight="700">
          {item.value}
        </AppText>
        <AppText variant="labelSmall" color="muted">
          {item.label}
        </AppText>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={[styles.progressFill, { width: `${item.progress * 100}%`, backgroundColor: item.color }]} />
        </View>
      </View>
    </View>
  );
};

export const OfficerTaskOverview = ({ stats }: OfficerTaskOverviewProps) => {
  const theme = useAppTheme();

  const total = stats.total || 1;

  const items: StatItem[] = [
    { label: 'Assigned', value: stats.total, color: theme.colors.primary, progress: 1 },
    { label: 'Verified', value: stats.approved, color: theme.colors.secondary, progress: stats.approved / total },
    { label: 'Pending', value: stats.pending, color: theme.colors.subtext, progress: stats.pending / total },
    { label: 'Rejected', value: stats.rejected, color: theme.colors.error, progress: stats.rejected / total },
    // Mocking 'Under Review' as it's not in AnalyticsSummary yet
    { label: 'Review', value: 0, color: theme.colors.info, progress: 0 },
  ];

  return (
    <View>
      <AppText variant="titleMedium" color="text" style={styles.header}>
        Task Overview
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {items.map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 8,
  },
  card: {
    width: 100,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  colorStrip: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 12,
    gap: 4,
  },
  progressBar: {
    height: 2,
    width: '100%',
    marginTop: 4,
    borderRadius: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
});
