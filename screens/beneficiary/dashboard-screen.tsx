import type { DrawerNavigationProp, DrawerScreenProps } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { LoanDetailCard } from '@/components/molecules';
import { VerificationProgress } from '@/components/molecules/verification-progress';
import { SyncBanner } from '@/components/organisms';
import { RequiredUploadsList, UploadRequirement } from '@/components/organisms/required-uploads-list';
import { useBeneficiaryData } from '@/hooks/use-beneficiary-data';
import { useSubmissions } from '@/hooks/use-submissions';
import type { BeneficiaryDrawerParamList } from '@/navigation/types';
import { useAuthStore } from '@/state/authStore';

import { HeroSurface, InfoRow, Pill, SectionCard, ThemeToggleButton, useBeneficiaryPalette } from './ui-kit';

export type BeneficiaryDashboardScreenProps = DrawerScreenProps<BeneficiaryDrawerParamList, 'BeneficiaryDashboard'>;

const REQUIRED_ITEMS = [
  { id: 'asset_photo', label: 'Asset Photo' },
  { id: 'selfie_asset', label: 'Selfie with Asset' },
  { id: 'invoice', label: 'Invoice/Bill' },
  { id: 'workshop_photo', label: 'Workshop Photo' },
];

export const BeneficiaryDashboardScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<BeneficiaryDrawerParamList>>();
  const storedProfile = useAuthStore((state) => state.profile);
  const { profile, loan, analytics, refetch } = useBeneficiaryData();
  const { submissions, syncState, refresh: refreshSubmissions } = useSubmissions();
  const palette = useBeneficiaryPalette();

  const headerProfile = profile ?? storedProfile;
  const beneficiaryProfile = headerProfile?.role === 'beneficiary' ? headerProfile : undefined;

  const handleRefresh = () => {
    void Promise.all([refetch(), refreshSubmissions()]);
  };

  const requirements: UploadRequirement[] = REQUIRED_ITEMS.map((item) => {
    // Simple matching logic - in real app, use IDs or types
    const submission = submissions.find((s) => s.assetName === item.label);
    let status: UploadRequirement['status'] = 'pending';
    if (submission) {
      status = submission.status === 'rejected' ? 'rejected' : 'uploaded';
    }
    return { ...item, status };
  });

  const completedCount = requirements.filter((r) => r.status === 'uploaded').length;
  const progress = Math.round((completedCount / requirements.length) * 100);
  const pendingCount = requirements.length - completedCount;

  const handleUpload = (id: string, label: string) => {
    navigation.navigate('UploadEvidence', { requirementId: id, requirementName: label });
  };

  const syncTone: Record<typeof syncState.status, 'default' | 'warning' | 'danger' | 'success'> = {
    idle: 'default',
    'in-progress': 'warning',
    error: 'danger',
    success: 'success',
  };

  const syncLabel = useMemo(() => {
    if (syncState.status === 'success' && syncState.lastSyncedAt) {
      return `Synced · ${formatDate(syncState.lastSyncedAt)}`;
    }
    if (syncState.status === 'in-progress') {
      return 'Syncing evidence…';
    }
    if (syncState.status === 'error') {
      return 'Sync needs attention';
    }
    if (syncState.pendingCount) {
      return `${syncState.pendingCount} uploads pending`;
    }
    return 'Ready to capture';
  }, [syncState]);

  const heroSummary = useMemo(() => {
    if (progress >= 80) {
      return 'Almost there—finish remaining uploads to keep Farmer Motion on track.';
    }
    if (progress >= 40) {
      return 'Momentum looks good. Continue capturing geo-tagged evidence.';
    }
    return 'Let’s kick-start your checklist with fresh captures today.';
  }, [progress]);

  const loanAmountDisplay = formatCurrency(loan?.loanAmount);
  const schemeLabel = loan?.scheme ?? beneficiaryProfile?.scheme ?? 'Scheme pending';
  const districtLabel = beneficiaryProfile?.district ?? 'Farmer Motion';

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
      accessibilityLabel="Beneficiary dashboard"
    >
      <View style={styles.stack}>
        <HeroSurface>
          <View style={styles.heroHeader}>
            <View>
              <Text style={[styles.eyebrow, { color: palette.subtext }]}>{districtLabel}</Text>
              <Text style={[styles.heroTitle, { color: palette.text }]}>{headerProfile?.name ?? 'Beneficiary'}</Text>
              <Text style={[styles.heroSubtitle, { color: palette.subtext }]}>{schemeLabel}</Text>
            </View>
            <View style={styles.heroHeaderActions}>
              <ThemeToggleButton variant="icon" />
              <Pill label={syncLabel} tone={syncTone[syncState.status]} />
            </View>
          </View>
          <Text style={[styles.heroHint, { color: palette.text }]}>{heroSummary}</Text>
          <View style={styles.heroMetricsRow}>
            <HeroMetric label="Checklist" value={`${completedCount}/${requirements.length}`} palette={palette} />
            <HeroMetric label="Loan" value={loanAmountDisplay} palette={palette} />
            <HeroMetric label="Status" value={loan?.status ?? 'Pending'} palette={palette} />
          </View>
          <AppButton
            label="Continue evidence capture"
            variant="secondary"
            onPress={() => navigation.navigate('UploadEvidence')}
          />
        </HeroSurface>

        <SectionCard
          title="Verification pulse"
          subtitle=" Your checklist completion status"
          accentLabel={`${progress}%`}
          footer={
            <View style={styles.inlineActions}>
              <AppButton label="Refresh" variant="ghost" onPress={handleRefresh} />
              <AppButton label="Previous submissions" variant="ghost" onPress={() => navigation.navigate('PreviousSubmissions')} />
            </View>
          }
        >
          <VerificationProgress percentage={progress} />
          <View style={styles.statsRow}>
            <InfoRow label="Completed" value={`${completedCount} items`} />
            <InfoRow label="Pending" value={`${pendingCount} items`} />
            <InfoRow label="Documents" value={`${analytics?.total ?? requirements.length} tracked`} />
          </View>
        </SectionCard>

        <SectionCard
          title="Evidence checklist"
          subtitle="Upload geo-tagged proof  of asset ownership"
          accentLabel={`${completedCount}/${requirements.length} done`}
        >
          <RequiredUploadsList requirements={requirements} onUpload={handleUpload} />
        </SectionCard>

        {loan ? (
          <SectionCard
            title="Loan snapshot"
            subtitle=" Your loan details at a glance"
            accentLabel={loan.status}
            footer={<AppButton label="View loan details" variant="ghost" onPress={() => navigation.navigate('LoanDetails')} />}
          >
            <LoanDetailCard loan={loan} />
          </SectionCard>
        ) : null}

        <SectionCard
          title="Sync & network"
          subtitle="Make sure captures keep flowing"
          accentLabel={syncState.status === 'in-progress' ? 'Syncing' : 'Status'}
        >
          <SyncBanner syncState={syncState} />
          <View style={styles.statsRow}>
            <InfoRow label="Pending" value={`${syncState.pendingCount ?? 0} uploads`} />
            <InfoRow label="Last sync" value={syncState.lastSyncedAt ? formatTime(syncState.lastSyncedAt) : 'Not synced yet'} />
            <InfoRow label="Errors" value={syncState.errorMessage ? 'Needs attention' : 'None'} />
          </View>
        </SectionCard>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  stack: {
    gap: 18,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  heroHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  heroHint: {
    fontSize: 14,
    opacity: 0.85,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroMetric: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  heroMetricLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroMetricValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
});

const HeroMetric = ({ label, value, palette }: { label: string; value: string; palette: ReturnType<typeof useBeneficiaryPalette> }) => (
  <View style={[styles.heroMetric, { borderColor: palette.border, backgroundColor: palette.mutedSurface }]}
    accessibilityLabel={label}
  >
    <Text style={[styles.heroMetricLabel, { color: palette.subtext }]}>{label}</Text>
    <Text style={[styles.heroMetricValue, { color: palette.text }]}>{value}</Text>
  </View>
);

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number') {
    return '—';
  }
  try {
    return `₹${Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`;
  } catch {
    return `₹${value}`;
  }
};

const formatDate = (iso: string) => {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

const formatTime = (iso: string) => {
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
};
