import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppText } from '@/components/atoms/app-text';
import { Chip } from '@/components/atoms/chip';
import { LoanDetailCard } from '@/components/molecules/loan-detail-card';
import { useBeneficiaryData } from '@/hooks/use-beneficiary-data';

import { HeroSurface, InfoRow, Pill, SectionCard, useBeneficiaryPalette } from './ui-kit';

type PillTone = 'default' | 'amber' | 'sky' | 'violet' | 'success' | 'warning' | 'danger';

export const LoanDetailsScreen = () => {
  const { loan, analytics } = useBeneficiaryData();
  const palette = useBeneficiaryPalette();

  const statusChip = loan?.status ?? 'Pending';
  const sanctionDate = loan?.sanctionDate ? new Date(loan.sanctionDate).toLocaleDateString('en-IN') : '—';
  const loanAmount = formatCurrency(loan?.loanAmount);
  const verificationLevel = analytics ? `${analytics.approved}/${analytics.total} verified` : 'Tracking evidence';
  const officerRemarks = ['Asset photo should include geo-tag overlay', 'Upload invoice with clearer stamp'];
  const motionSteps = getMotionSteps(loan?.status ?? 'pending');

  if (!loan) {
    return (
      <View style={[styles.emptyState, { backgroundColor: palette.background }]}
        accessibilityLabel="Loan details loading"
      >
        <HeroSurface>
          <Text style={[styles.heroTitle, { color: palette.text }]}>Fetching loan data…</Text>
          <Text style={{ color: palette.subtext }}>
            Please ensure your profile is synced. Gemini will populate your sanction summary shortly.
          </Text>
        </HeroSurface>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: palette.background }]} contentContainerStyle={styles.content}>
      <HeroSurface>
        <View style={styles.heroHeader}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.subtext }]}>Sanction overview</Text>
            <Text style={[styles.heroTitle, { color: palette.text }]}>{loan.scheme}</Text>
            <Text style={[styles.heroSubtitle, { color: palette.subtext }]}>{loan.bank}</Text>
          </View>
        </View>
        <Text style={[styles.heroHint, { color: palette.text }]}>Farmer Motion keeps this snapshot synced with officer updates.</Text>
        <View style={styles.heroMetrics}>
          <HeroMetric label="Loan" value={loanAmount} palette={palette} />
          <HeroMetric label="Status" value={statusChip} palette={palette} />
          <HeroMetric label="Sanctioned" value={sanctionDate} palette={palette} />
        </View>
        <View style={styles.heroPills}>
          <Pill label={verificationLevel} tone="sky" />
          <Pill label={loan.loanId} tone="violet" />
        </View>
      </HeroSurface>

      <SectionCard
        title="Loan detail card"
        subtitle="Live data direct from MSME core"
        accentLabel={statusChip}
      >
        <LoanDetailCard loan={loan} />
      </SectionCard>

      <SectionCard title="Verification status" subtitle="Farmer motion checkpoints" accentLabel="Active">
        <View style={styles.statusRow}>
          <Chip label="In progress" tone="warning" />
          <AppText variant="bodySmall" color="muted">
            Last updated {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </AppText>
        </View>
        <View style={styles.motionList}>
          {motionSteps.map((step) => (
            <View key={step.id} style={[styles.motionCard, { backgroundColor: palette.mutedSurface, borderColor: palette.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.motionTitle, { color: palette.text }]}>{step.title}</Text>
                <Text style={{ color: palette.subtext }}>{step.detail}</Text>
              </View>
              <Pill label={step.status} tone={step.tone} />
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Sanction metadata" subtitle="Key facts" accentLabel="Docs">
        <View style={styles.infoGrid}>
          <InfoRow label="Loan ID" value={loan.loanId} />
          <InfoRow label="Bank" value={loan.bank} />
          <InfoRow label="Amount" value={loanAmount} />
          <InfoRow label="Sanction date" value={sanctionDate} />
          <InfoRow label="Scheme" value={loan.scheme} />
          <InfoRow label="Contact" value={loan.mobile ?? '—'} />
        </View>
      </SectionCard>

      <SectionCard title="Officer remarks" subtitle="Next actions" accentLabel="Focus">
        <View style={styles.remarkList}>
          {officerRemarks.map((remark) => (
            <View key={remark} style={[styles.remarkItem, { borderColor: palette.border }]}
            >
              <Text style={{ color: palette.text }}>{remark}</Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 18,
  },
  emptyState: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
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
  heroMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  motionList: {
    gap: 12,
  },
  motionCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  motionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  remarkList: {
    gap: 10,
  },
  remarkItem: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
  },
});

const HeroMetric = ({ label, value, palette }: { label: string; value: string; palette: ReturnType<typeof useBeneficiaryPalette> }) => (
  <View style={[styles.metricCard, { backgroundColor: palette.mutedSurface, borderColor: palette.border }]}
    accessibilityLabel={label}
  >
    <Text style={[styles.metricLabel, { color: palette.subtext }]}>{label}</Text>
    <Text style={[styles.metricValue, { color: palette.text }]}>{value}</Text>
  </View>
);

const getMotionSteps = (status: string): Array<{ id: string; title: string; detail: string; status: string; tone: PillTone }> => {
  return [
    { id: 'capture', title: 'Evidence capture', detail: 'Upload geo-tagged photos & invoices', status: 'Due today', tone: 'warning' },
    { id: 'review', title: 'Officer review', detail: 'District officer validates submissions', status: 'Queued', tone: 'violet' },
    { id: 'sanction', title: 'Sanction sync', detail: 'Bank disbursal readiness', status: status === 'sanctioned' ? 'Ready' : 'Awaiting', tone: status === 'sanctioned' ? 'success' : 'default' },
  ];
};

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
