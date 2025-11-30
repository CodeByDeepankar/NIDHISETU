import { useCallback, useEffect, useMemo, useState } from 'react';

import { beneficiaryRepository } from '@/services/api/beneficiaryRepository';
import type { BeneficiaryRecord } from '@/types/beneficiary';
import type { AnalyticsSummary, BeneficiaryLoan } from '@/types/entities';

const DEFAULT_SUMMARY: AnalyticsSummary = {
  approved: 0,
  pending: 0,
  rejected: 0,
  total: 0,
};

const toLoanModel = (record: BeneficiaryRecord): BeneficiaryLoan => ({
  id: record.id,
  loanId: record.loanId || record.metadata?.beneficiaryUid || record.id,
  name: record.fullName,
  mobile: record.mobile,
  bank: record.bankName || 'NA',
  scheme: record.schemeName || 'NA',
  loanAmount: Number(record.sanctionAmount ?? 0),
  sanctionDate: record.sanctionDate || record.metadata?.createdAt || '—',
  status: 'sanctioned',
});

export const useOfficerBeneficiaries = () => {
  const [records, setRecords] = useState<BeneficiaryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const unsubscribe = beneficiaryRepository.subscribeToRecords(
      (next) => {
        setRecords(next);
        setIsLoading(false);
        setError(undefined);
      },
      (err) => {
        setError(err instanceof Error ? err.message : 'Unable to load beneficiaries.');
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const latest = await beneficiaryRepository.listRecords();
      setRecords(latest);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to refresh beneficiaries.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const loans = useMemo(() => records.map(toLoanModel), [records]);

  const analytics = useMemo(() => {
    if (!records.length) {
      return DEFAULT_SUMMARY;
    }
    return records.reduce<AnalyticsSummary>(
      (summary, record) => {
        const status = record.metadata?.status?.toLowerCase();
        if (status === 'pending') {
          summary.pending += 1;
        } else if (status === 'rejected') {
          summary.rejected += 1;
        } else {
          summary.approved += 1;
        }
        summary.total += 1;
        return summary;
      },
      { ...DEFAULT_SUMMARY }
    );
  }, [records]);

  return {
    records,
    loans,
    analytics,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
};
