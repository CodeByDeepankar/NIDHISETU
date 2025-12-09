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
  beneficiaryId?: string;
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
  assignedAt?: string;
  detailId?: string;
};


export const VerificationTasksScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const { records, isLoading, isRefreshing, refresh } = useOfficerBeneficiaries();

  const data = useMemo<TaskItem[]>(() => {
    return records
      .filter((record) => (record.metadata?.status ?? '').toLowerCase() !== 'approved')
      .map((record) => ({
        id: record.id,
        beneficiaryId: record.id,
        detailId: record.mobile || record.id,
        name: record.fullName,
        priority: record.priorityLevel ?? 'Normal',
        status: record.metadata?.status ?? 'Pending',
        updatedAt: record.metadata?.updatedAt,
        assignedAt: record.metadata?.createdAt ?? record.createdAt,
        village: record.village,
        docCount: record.metadata?.docCount ?? 0,
        loanId: record.metadata?.loanId ?? record.loanId,
        bank: record.bankName,
        loanAmount: record.metadata?.loanAmount,
        lastSynced: record.metadata?.lastSynced,
      }));
  }, [records]);

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
    <View style={styles.card}>
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
          <AppText style={styles.metaLabel}>Status</AppText>
          <AppText style={[styles.metaValue, { color: statusColor(item.status) }]}>{item.status}</AppText>
        </View>
        <View style={styles.metaItem}>
          <AppText style={styles.metaLabel}>Assigned</AppText>
          <AppText style={styles.metaValue}>{formatAssigned(item.assignedAt)}</AppText>
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
          <AppText style={styles.infoText}>Last update: {formatTimestamp(item.updatedAt)}</AppText>
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
        <TouchableOpacity
          style={styles.reviewButton}
          accessibilityLabel={`View details for ${item.name}`}
          onPress={() => navigation.navigate('VerificationDetail', { id: item.detailId ?? item.id })}
        >
          <AppText style={styles.reviewButtonText}>View Details</AppText>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
      ) : (
        <>
          <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
          <AppText style={styles.emptyText}>All caught up! No pending tasks.</AppText>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <WaveHeader title="Verification Tasks" onBack={() => navigation.goBack()} />

      <View style={styles.contentContainer}>
        {isLoading && !data.length ? (
          <View style={styles.initialLoader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={data}
            keyExtractor={(t) => t.id}
            renderItem={({ item }) => <TaskCard item={item} />}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
            ListEmptyComponent={renderEmpty}
          />
        )}
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

const formatAssigned = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
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
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  assetName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#6B7280',
  },
  beneficiaryName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  villageName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  statusText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loader: {
    marginTop: 40,
  },
  initialLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
