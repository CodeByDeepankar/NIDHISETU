import { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useOfficerBeneficiaries } from '@/hooks/use-officer-beneficiaries';

export const VerificationTasksScreen = () => {
  const theme = useAppTheme();
  const { records, isLoading, isRefreshing, refresh } = useOfficerBeneficiaries();

  const tasks = useMemo(() => {
    return records
      .filter((record) => (record.metadata?.status ?? '').toLowerCase() !== 'approved')
      .map((record) => ({
        id: record.id,
        name: record.fullName,
        priority: record.priorityLevel ?? 'Normal',
        status: record.metadata?.status ?? 'Pending',
        updatedAt: record.metadata?.updatedAt,
        village: record.village,
      }));
  }, [records]);

  const renderItem = ({ item }: { item: (typeof tasks)[number] }) => (
    <View style={[styles.taskCard, { backgroundColor: theme.colors.card, borderRadius: theme.radii.lg }]}
      accessibilityRole="summary"
    >
      <View style={styles.taskHeader}>
        <AppText variant="titleMedium" color="text">
          {item.name}
        </AppText>
        <AppText variant="labelSmall" color={item.priority === 'High' ? 'error' : 'muted'}>
          {item.priority} priority
        </AppText>
      </View>
      <AppText variant="bodySmall" color="muted">
        Status: {item.status} • {formatTimestamp(item.updatedAt)}
      </AppText>
      {item.village ? (
        <AppText variant="labelSmall" color="text">
          {item.village}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <AppText variant="headlineMedium" color="text">Verification Tasks</AppText>
      <FlatList
        contentContainerStyle={{ gap: 12, paddingTop: 12, paddingBottom: 24 }}
        data={tasks}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={{ marginTop: 24 }} color={theme.colors.primary} />
          ) : (
            <AppText variant="bodyMedium" color="muted" style={{ marginTop: 24, textAlign: 'center' }}>
              {tasks.length ? null : 'No verification tasks pending right now.'}
            </AppText>
          )
        }
      />
    </View>
  );
};

const formatTimestamp = (value?: string) => {
  if (!value) {
    return 'Just now';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  taskCard: {
    padding: 12,
    gap: 6,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
