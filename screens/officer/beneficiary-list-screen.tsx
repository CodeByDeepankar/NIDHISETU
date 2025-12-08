import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppText } from '@/components/atoms/app-text';
import { Chip } from '@/components/atoms/chip';
import { InputField } from '@/components/atoms/input-field';
import { WaveHeader } from '@/components/molecules/wave-header';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useOfficerBeneficiaries } from '@/hooks/use-officer-beneficiaries';
import type { BeneficiaryLoan } from '@/types/entities';

const withAlpha = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) return hex;
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const BeneficiaryListScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const { loans, isLoading, isRefreshing, error, refresh } = useOfficerBeneficiaries();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const accent = theme.colors.gradientStart;
  const accentSecondary = theme.colors.gradientEnd;
  const accentSoft = withAlpha(accent, 0.12);
  const accentSecondarySoft = withAlpha(accentSecondary, 0.18);
  const borderSoft = withAlpha(theme.colors.border, 0.7);
  const iconMuted = withAlpha(theme.colors.text, 0.55);

  const filterOptions = ['All', 'Pending', 'Approved', 'Rejected', 'High Priority'];
  const sampleBeneficiaries = useMemo<BeneficiaryLoan[]>(
    () => [
      {
        id: 'demo-1',
        loanId: 'LN-0002',
        name: 'Swastik Kumar Purohit',
        mobile: '+91 98234 56789',
        bank: 'Panjab',
        scheme: 'PMEGP',
        loanAmount: 308568,
        sanctionDate: '2025-11-18',
        status: 'sanctioned',
      },
      {
        id: 'demo-2',
        loanId: 'LN-0001',
        name: 'Deepankar Sahoo',
        mobile: '+91 98760 11223',
        bank: 'UCO',
        scheme: 'Stand-Up India',
        loanAmount: 2500080,
        sanctionDate: '2025-11-05',
        status: 'sanctioned',
      },
      {
        id: 'demo-3',
        loanId: 'LN-0015',
        name: 'Priya Sharma',
        mobile: '+91 97854 88992',
        bank: 'SBI',
        scheme: 'Mudra',
        loanAmount: 512000,
        sanctionDate: '2025-10-22',
        status: 'pending',
      },
    ],
    []
  );

  const dataSource = loans.length ? loans : sampleBeneficiaries;

  const filtered = useMemo(() => {
    return dataSource.filter((item) => {
      const haystack = `${item.name} ${item.loanId} ${item.mobile}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      
      let matchesFilter = true;
      if (filter === 'All') matchesFilter = true;
      else if (filter === 'Pending') matchesFilter = item.status === 'pending';
      else if (filter === 'Approved') matchesFilter = item.status === 'sanctioned' || item.status === 'disbursed';
      else if (filter === 'Rejected') matchesFilter = item.status === 'closed'; // Mapping closed to rejected for demo if needed, or add rejected status
      else if (filter === 'High Priority') matchesFilter = false; // Need priority field in entity

      return matchesQuery && matchesFilter;
    });
  }, [dataSource, query, filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sanctioned':
      case 'disbursed':
        return accent;
      case 'pending':
        return '#F59E0B';
      case 'closed':
        return '#DC2626';
      default:
        return theme.colors.muted;
    }
  };

  const formatAmount = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const BeneficiaryCard = ({ item }: { item: BeneficiaryLoan }) => {
    const isPending = item.status === 'pending';
    const syncedLabel = isPending ? 'Data Synced' : 'Synced';
    const reviewLabel = isPending ? 'Under Review' : 'Verified';

    return (
      <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: borderSoft,
          shadowColor: withAlpha('#000000', 0.1),
        },
      ]}
      activeOpacity={0.85}
      onPress={() => {}}
    >
      <View style={styles.cardHeader}>
        <View>
          <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>{item.name}</AppText>
          <AppText style={[styles.cardSubtitle, { color: theme.colors.muted }]}>Loan ID: {item.loanId}</AppText>
        </View>
        <View style={[styles.statusPill, { backgroundColor: withAlpha(getStatusColor(item.status), 0.16) }]}>
          <AppText style={[styles.statusPillText, { color: getStatusColor(item.status) }]}>
            {item.status === 'sanctioned' ? 'Synced' : item.status.toUpperCase()}
          </AppText>
        </View>
      </View>

      <View style={[styles.amountBlock, { backgroundColor: accentSoft }]}> 
        <AppText style={[styles.amountLabel, { color: accent }]}>Loan Amount</AppText>
        <AppText style={[styles.amountValue, { color: accent }]}>{formatAmount(item.loanAmount)}</AppText>
        <View style={styles.secondaryBadgesRow}>
          <View style={[styles.secondaryBadge, { backgroundColor: accentSoft }]}> 
            <AppText style={[styles.secondaryBadgeText, { color: accent }]}>{syncedLabel}</AppText>
          </View>
          <View style={[styles.secondaryBadge, { backgroundColor: accentSecondarySoft }]}> 
            <AppText style={[styles.secondaryBadgeText, { color: accentSecondary }]}>{reviewLabel}</AppText>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={16} color={iconMuted} />
          <AppText style={[styles.infoText, { color: theme.colors.text }]}>{item.bank}</AppText>
        </View>
        {item.status !== 'pending' ? (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={iconMuted} />
            <AppText style={[styles.infoText, { color: theme.colors.text }]}>Sanctioned: {new Date(item.sanctionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</AppText>
          </View>
        ) : null}
      </View>

      <TouchableOpacity style={[styles.uploadButton, { backgroundColor: accent }]}> 
        <AppText style={[styles.uploadButtonText, { color: theme.colors.onPrimary }]}>UPLOAD PHOTO</AppText>
      </TouchableOpacity>
    </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WaveHeader title="Beneficiaries" onBack={() => navigation.goBack()} />
      
      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <InputField 
            label="" 
            placeholder="Search by name, ID, or mobile..." 
            onChangeText={setQuery}
            style={[styles.searchInput, { backgroundColor: theme.colors.surface, borderColor: borderSoft }]}
          />
        </View>

        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={filterOptions}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <Chip
                label={item}
                tone={filter === item ? 'gradientStart' : 'muted'}
                backgroundColor={filter === item ? accentSoft : theme.colors.surface}
                onPress={() => setFilter(item)}
                style={[styles.filterChip, { borderColor: borderSoft }]}
              />
            )}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 40 }]}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
          renderItem={({ item }) => <BeneficiaryCard item={item} />}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={theme.colors.muted} />
                <AppText style={[styles.emptyText, { color: theme.colors.muted }]}> 
                  {error ? 'Unable to load beneficiaries.' : 'No beneficiaries found.'}
                </AppText>
              </View>
            )
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    marginTop: 100, // Space for header
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
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
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: {
    fontWeight: '600',
  },
  cardBody: {
    gap: 8,
    marginBottom: 16,
  },
  amountBlock: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  secondaryBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  secondaryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  secondaryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  uploadButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  actionButtonText: {
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
    fontSize: 14,
  },
});
