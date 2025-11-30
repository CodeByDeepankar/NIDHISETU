import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/atoms/app-text';
import { Chip } from '@/components/atoms/chip';
import { InputField } from '@/components/atoms/input-field';
import { LoanDetailCard } from '@/components/molecules/loan-detail-card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useOfficerBeneficiaries } from '@/hooks/use-officer-beneficiaries';
import type { OfficerStackParamList } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type BeneficiaryListScreenProps = NativeStackScreenProps<OfficerStackParamList, 'Beneficiaries'>;

export const BeneficiaryListScreen = () => {
  const theme = useAppTheme();
  const { loans, isLoading, isRefreshing, error, refresh } = useOfficerBeneficiaries();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const filterOptions = useMemo(() => {
    const unique = Array.from(new Set(loans.map((loan) => loan.bank))).filter(Boolean) as string[];
    return ['All', ...unique];
  }, [loans]);

  useEffect(() => {
    if (filter !== 'All' && !filterOptions.includes(filter)) {
      setFilter('All');
    }
  }, [filter, filterOptions]);

  const filtered = useMemo(() => {
    return loans.filter((item) => {
      const haystack = `${item.name} ${item.loanId}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesFilter = filter === 'All' ? true : item.bank === filter;
      return matchesQuery && matchesFilter;
    });
  }, [loans, query, filter]);

  return (
    <View style={styles.container}>
      <InputField label="Search" placeholder="Name or Loan ID" onChangeText={setQuery} />
      <View style={styles.filterRow}>
        {filterOptions.map((option) => (
          <Chip
            key={option}
            label={option}
            tone={filter === option ? 'primary' : 'muted'}
            backgroundColor={filter === option ? undefined : theme.colors.surfaceVariant}
            onPress={() => setFilter(option)}
          />
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 60, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        renderItem={({ item }) => <LoanDetailCard loan={item} />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.loader} />
          ) : (
            <AppText variant="bodyMedium" color="muted" style={styles.emptyCopy}>
              {error ? 'Unable to load beneficiaries right now.' : 'No beneficiaries match your search.'}
            </AppText>
          )
        }
      />
      {error ? (
        <AppText variant="bodySmall" color="error" style={styles.errorCopy}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  loader: {
    marginTop: 32,
  },
  emptyCopy: {
    textAlign: 'center',
    marginTop: 16,
  },
  errorCopy: {
    marginTop: 12,
    textAlign: 'center',
  },
});
