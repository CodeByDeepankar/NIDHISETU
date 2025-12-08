import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppText } from '@/components/atoms/app-text';
import { WaveHeader } from '@/components/molecules/wave-header';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useOfficerBeneficiaries } from '@/hooks/use-officer-beneficiaries';

type TaskItem = {
  id: string;
  name: string;
  priority: string;
  status: string;
  updatedAt?: string;
  village?: string | null;
  docCount: number;
  loanId?: string;
  bank?: string;
  loanAmount?: number;
  lastSynced?: string;
  uploads?: Array<{ title: string; detail?: string }>;
  analysis?: string[];
  actions?: string[];
};

export const VerificationTasksScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const { records, isLoading, isRefreshing, refresh } = useOfficerBeneficiaries();

  const tasks = useMemo<TaskItem[]>(() => {
    return records
      .filter((record) => (record.metadata?.status ?? '').toLowerCase() !== 'approved')
      .map((record) => ({
        id: record.id,
        name: record.fullName,
        priority: record.priorityLevel ?? 'Normal',
        status: record.metadata?.status ?? 'Pending',
        updatedAt: record.metadata?.updatedAt,
        village: record.village,
        docCount: record.metadata?.docCount ?? 0,
        loanId: record.metadata?.loanId,
        bank: record.bankName,
        loanAmount: record.metadata?.loanAmount,
      }));
  }, [records]);

  const fallbackTasks: TaskItem[] = useMemo(
    () => [
      {
        id: 'demo-priya',
        name: 'Priya Sharma',
        priority: 'High',
        status: 'Pending Verification',
        updatedAt: '2025-12-04T16:22:00+05:30',
        village: 'SBI Rural Branch',
        docCount: 2,
        loanId: 'LN-0015',
        bank: 'SBI',
        loanAmount: 512000,
        lastSynced: '04 Dec 2025, 4:22 PM',
        uploads: [
          { title: 'Asset Photo 1', detail: 'Tractor Engine — Geo-tagged' },
          { title: 'Asset Photo 2', detail: 'Invoice — Geo-tagged' },
        ],
        analysis: [
          'Invoice authenticity: 92% match',
          'Object detected: Agricultural Equipment',
          'Location variance: 0.8 km from sanctioned area (Flagged yellow)',
        ],
        actions: [
          'Verify location mismatch',
          'Confirm invoice details',
          'Approve or Reject uploads',
        ],
      },
    ],
    []
  );

  const data = tasks.length ? tasks : fallbackTasks;

  const statusColor = (status: string) => {
    const lowered = status.toLowerCase();
    if (lowered.includes('pending')) return '#F59E0B';
    if (lowered.includes('approved') || lowered.includes('verified')) return '#16A34A';
    if (lowered.includes('reject')) return '#DC2626';
    return '#6B7280';
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '—';
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const TaskCard = ({ item }: { item: TaskItem }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => {}}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarPlaceholder}>
            <AppText style={styles.avatarText}>{item.name.charAt(0)}</AppText>
          </View>
          <View>
            <AppText style={styles.cardTitle}>{item.name}</AppText>
            <AppText style={styles.cardSubtitle}>{item.village || 'Unknown Location'}</AppText>
          </View>
        </View>
        <View style={[styles.priorityBadge, item.priority === 'High' ? styles.highPriority : styles.normalPriority]}>
          <AppText style={[styles.priorityText, item.priority === 'High' ? styles.highPriorityText : styles.normalPriorityText]}>
            {item.priority}
          </AppText>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <AppText style={styles.metaLabel}>Loan ID</AppText>
          <AppText style={styles.metaValue}>{item.loanId ?? '—'}</AppText>
        </View>
        <View style={styles.metaItem}>
          <AppText style={styles.metaLabel}>Bank</AppText>
          <AppText style={styles.metaValue}>{item.bank ?? '—'}</AppText>
        </View>
        <View style={styles.metaItem}>
          <AppText style={styles.metaLabel}>Loan Amount</AppText>
          <AppText style={styles.metaValue}>{formatCurrency(item.loanAmount)}</AppText>
        </View>
        <View style={styles.metaItem}>
          <AppText style={styles.metaLabel}>Status</AppText>
          <AppText style={[styles.metaValue, { color: statusColor(item.status) }]}>{item.status}</AppText>
        </View>
      </View>

      {item.lastSynced ? (
        <View style={styles.syncedRow}>
          <Ionicons name="cloud-done-outline" size={16} color="#0F9D58" />
          <AppText style={styles.syncedText}>Last synced: {item.lastSynced}</AppText>
        </View>
      ) : null}

      <View style={styles.cardBody}>
        <View style={styles.infoItem}>
          <Ionicons name="document-text-outline" size={16} color="#6B7280" />
          <AppText style={styles.infoText}>{item.docCount} Documents</AppText>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <AppText style={styles.infoText}>{formatTimestamp(item.updatedAt)}</AppText>
        </View>
      </View>

      {item.uploads ? (
        <View style={styles.sectionBlock}>
          <AppText style={styles.sectionTitle}>Uploads</AppText>
          {item.uploads.map((upload) => (
            <View key={upload.title} style={styles.bulletRow}>
              <Ionicons name="images-outline" size={16} color="#0F9D58" />
              <AppText style={styles.bulletText}>
                {upload.title}
                {upload.detail ? ` (${upload.detail})` : ''}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {item.analysis ? (
        <View style={styles.sectionBlock}>
          <AppText style={styles.sectionTitle}>AI Analysis</AppText>
          {item.analysis.map((line) => (
            <View key={line} style={styles.bulletRow}>
              <Ionicons name="sparkles-outline" size={16} color="#6366F1" />
              <AppText style={styles.bulletText}>{line}</AppText>
            </View>
          ))}
        </View>
      ) : null}

      {item.actions ? (
        <View style={styles.sectionBlock}>
          <AppText style={styles.sectionTitle}>Officer Action Required</AppText>
          {item.actions.map((line) => (
            <View key={line} style={styles.bulletRow}>
              <Ionicons name="alert-circle-outline" size={16} color="#F59E0B" />
              <AppText style={styles.bulletText}>{line}</AppText>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.reviewButton}>
          <AppText style={styles.reviewButtonText}>Review Now</AppText>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <WaveHeader title="Verification Tasks" onBack={() => navigation.goBack()} />
      
      <View style={styles.contentContainer}>
        <FlatList
          contentContainerStyle={styles.listContent}
          data={data}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <TaskCard item={item} />}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
                <AppText style={styles.emptyText}>
                  {data.length ? null : 'All caught up! No pending tasks.'}
                </AppText>
              </View>
            )
          }
        />
      </View>
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
  return date.toLocaleDateString();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    flex: 1,
    marginTop: 100,
  },
  listContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008080',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    width: '48%',
  },
  metaLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  syncedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  syncedText: {
    fontSize: 12,
    color: '#065F46',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  highPriority: {
    backgroundColor: '#FEE2E2',
  },
  normalPriority: {
    backgroundColor: '#F3F4F6',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  highPriorityText: {
    color: '#DC2626',
  },
  normalPriorityText: {
    color: '#4B5563',
  },
  cardBody: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
  },
  sectionBlock: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
});
