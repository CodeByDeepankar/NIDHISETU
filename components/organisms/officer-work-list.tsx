import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { PriorityBadge } from '@/components/atoms/priority-badge';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { BeneficiaryLoan } from '@/types/entities';

interface OfficerWorkListProps {
  beneficiaries: BeneficiaryLoan[];
  onStartVerification: (id: string) => void;
}

const BeneficiaryCard = ({ item, onPress }: { item: BeneficiaryLoan; onPress: () => void }) => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}
    >
      <View style={[styles.statusBar, { backgroundColor: theme.colors.secondary }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View>
            <AppText variant="titleMedium" color="text" weight="600">
              {item.name}
            </AppText>
            <AppText variant="bodySmall" color="muted">
              {item.loanId}
            </AppText>
          </View>
          <AppIcon name="chevron-right" size={24} color="muted" />
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <AppIcon name="cash" size={16} color="primary" />
            <AppText variant="bodyMedium" color="text">
              ₹{item.loanAmount.toLocaleString()}
            </AppText>
          </View>
          <View style={styles.detailItem}>
            <AppIcon name="briefcase-outline" size={16} color="secondary" />
            <AppText variant="bodyMedium" color="text">
              {item.scheme}
            </AppText>
          </View>
        </View>

        <View style={styles.addressRow}>
          <AppIcon name="map-marker-outline" size={16} color="muted" />
          <AppText variant="bodySmall" color="muted" numberOfLines={1} style={{ flex: 1 }}>
            {item.bank} • {item.sanctionDate}
          </AppText>
        </View>

        <View style={styles.footer}>
          <View style={[styles.statusChip, { backgroundColor: theme.colors.surfaceVariant }]}>
            <AppText variant="labelSmall" color="text">
              {item.status.toUpperCase()}
            </AppText>
          </View>
          {/* Mock priority logic for UI demo */}
          {Math.random() > 0.7 && <PriorityBadge />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const OfficerWorkList = ({ beneficiaries, onStartVerification }: OfficerWorkListProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppText variant="titleMedium" color="text">
          Today&apos;s Work List
        </AppText>
        <TouchableOpacity>
          <AppText variant="labelMedium" color="primary">
            View All
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}>
          <AppIcon name="magnify" size={20} color="muted" />
          <TextInput
            placeholder="Search beneficiary..."
            placeholderTextColor={theme.colors.muted}
            style={[styles.input, { color: theme.colors.text }]}
          />
        </View>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.colors.surfaceVariant }]}>
          <AppIcon name="filter-variant" size={20} color="text" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} scrollEnabled={false}>
        {beneficiaries.map((item) => (
          <BeneficiaryCard key={item.id} item={item} onPress={() => onStartVerification(item.id)} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusBar: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
