import { useCallback, useEffect, useMemo, useState } from 'react';

import { beneficiaryRepository } from '@/services/api/beneficiaryRepository';
import { useAuthStore } from '@/state/authStore';
import type { BeneficiaryRecord } from '@/types/beneficiary';
import type { AnalyticsSummary, BeneficiaryLoan, BeneficiaryProfile, UserProfile } from '@/types/entities';

interface BeneficiaryOverview {
  profile?: UserProfile;
  loan?: BeneficiaryLoan;
  analytics?: AnalyticsSummary;
  isLoading: boolean;
  error?: string;
  refetch: () => Promise<void>;
}

const toLoanModel = (record: BeneficiaryRecord): BeneficiaryLoan => ({
  id: record.id,
  loanId: record.loanId || record.metadata?.beneficiaryUid || record.id,
  name: record.fullName,
  mobile: record.mobile,
  bank: record.bankName,
  scheme: record.schemeName,
  loanAmount: Number(record.sanctionAmount ?? 0),
  sanctionDate: record.sanctionDate ?? record.metadata?.createdAt ?? new Date().toISOString(),
  status: 'sanctioned',
});

const deriveAnalytics = (record?: BeneficiaryRecord | null): AnalyticsSummary | undefined => {
  if (!record) {
    return undefined;
  }
  const docCount = record.metadata?.docCount ?? 0;
  const completion = record.metadata?.completionPercent ?? 0;
  const completed = Math.round((completion / 100) * docCount);
  const pending = Math.max(docCount - completed, 0);
  const status = (record.metadata?.status ?? '').toLowerCase();
  const rejected = status === 'rejected' ? 1 : 0;
  const approved = status === 'approved' ? 1 : completed;
  return {
    approved,
    pending,
    rejected,
    total: docCount || 1,
  } satisfies AnalyticsSummary;
};

const toProfile = (record?: BeneficiaryRecord, fallback?: UserProfile | null): UserProfile | undefined => {
  if (!record) {
    return fallback ?? undefined;
  }
  return {
    id: record.metadata?.beneficiaryUid ?? record.id,
    name: record.fullName,
    mobile: record.mobile,
    role: 'beneficiary',
    village: record.village,
    district: record.district,
    bank: record.bankName,
    scheme: record.schemeName,
  } as BeneficiaryProfile;
};

export const useBeneficiaryData = (): BeneficiaryOverview => {
  const storedProfile = useAuthStore((state) => state.profile);
  const [record, setRecord] = useState<BeneficiaryRecord>();
  const [analytics, setAnalytics] = useState<AnalyticsSummary>();
  const [loan, setLoan] = useState<BeneficiaryLoan>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const mobile = storedProfile?.mobile;
  const recordId = mobile ? beneficiaryRepository.normalizeMobile(mobile) : undefined;

  useEffect(() => {
    if (!recordId) {
      setRecord(undefined);
      setLoan(undefined);
      setAnalytics(undefined);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribe = beneficiaryRepository.subscribeToRecord(
      recordId,
      (next) => {
        setRecord(next ?? undefined);
        setLoan(next ? toLoanModel(next) : undefined);
        setAnalytics(deriveAnalytics(next));
        setIsLoading(false);
        setError(undefined);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [recordId]);

  const refetch = useCallback(async () => {
    if (!recordId) {
      return;
    }
    try {
      const latest = await beneficiaryRepository.getRecordByMobile(recordId);
      setRecord(latest ?? undefined);
      setLoan(latest ? toLoanModel(latest) : undefined);
      setAnalytics(deriveAnalytics(latest ?? undefined));
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to refresh beneficiary data.');
    }
  }, [recordId]);

  const profile = useMemo(() => toProfile(record, storedProfile), [record, storedProfile]);

  return {
    profile,
    loan,
    analytics,
    isLoading,
    error,
    refetch,
  };
};
