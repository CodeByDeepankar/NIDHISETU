import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoanAssistantPanel } from '@/components/organisms/loan-assistant';
import { useBeneficiaryData } from '@/hooks/use-beneficiary-data';
import { useAuthStore } from '@/state/authStore';

import { HeroSurface, InfoRow, Pill, SectionCard, useBeneficiaryPalette } from './ui-kit';

export const BeneficiaryLoanAssistantScreen = () => {
  const storedProfile = useAuthStore((state) => state.profile);
  const { profile, loan, isLoading } = useBeneficiaryData();
  const palette = useBeneficiaryPalette();

  const beneficiaryProfile = profile ?? storedProfile;
  const beneficiaryDetails = beneficiaryProfile?.role === 'beneficiary' ? beneficiaryProfile : undefined;
  const showLoadingOverlay = isLoading && !loan;
  const formattedAmount = formatCurrency(loan?.loanAmount);
  const assistantSummary = loan
    ? `Gemini is tuned to your ${loan.scheme ?? 'loan'} details to guide documentation and disbursement.`
    : 'Gemini watches your Farmer Motion progress and answers MSME compliance questions instantly.';
  const insightPill = loan?.status ? `${loan.status}` : 'Loan assistant';
  const contextRows = [
    { label: 'Bank', value: loan?.bank ?? 'Not linked' },
    { label: 'Scheme', value: loan?.scheme ?? 'MSME' },
    { label: 'Advisor', value: beneficiaryDetails?.district ?? 'District officer' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}
      accessibilityLabel="Loan assistant"
    >
      <View style={styles.wrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <HeroSurface>
            <View style={styles.heroHeader}>
              <View>
                <Text style={[styles.eyebrow, { color: palette.subtext }]}>Loan copilot</Text>
                <Text style={[styles.heroTitle, { color: palette.text }]}>{beneficiaryProfile?.name ?? 'Beneficiary'}</Text>
                <Text style={[styles.heroSubtitle, { color: palette.subtext }]}>MSME guidance desk</Text>
              </View>
            </View>
            <Text style={[styles.heroBody, { color: palette.text }]}>{assistantSummary}</Text>
            <View style={styles.heroPills}>
              <Pill label={insightPill} tone="sky" />
              <Pill label={beneficiaryDetails?.district ?? 'Your district desk'} tone="violet" />
            </View>
            <View style={styles.heroStats}>
              <HeroMetric label="Loan" value={formattedAmount} palette={palette} />
              <HeroMetric label="Bank" value={loan?.bank ?? '—'} palette={palette} />
              <HeroMetric label="Status" value={loan?.status ?? 'Pending'} palette={palette} />
            </View>
          </HeroSurface>

          <SectionCard title="Context" subtitle="What Gemini knows about you" accentLabel="Live">
            <View style={styles.infoGrid}>
              {contextRows.map((row) => (
                <InfoRow key={row.label} label={row.label} value={row.value} />
              ))}
            </View>
          </SectionCard>

          <SectionCard
            title="Tips"
            subtitle="Farmer motion best practices"
            accentLabel="Recommended"
          >
            <View style={styles.tipList}>
              {tips.map((tip) => (
                <View key={tip.title} style={[styles.tipCard, { backgroundColor: palette.mutedSurface, borderColor: palette.border }]}
                >
                  <Text style={[styles.tipTitle, { color: palette.text }]}>{tip.title}</Text>
                  <Text style={[styles.tipBody, { color: palette.subtext }]}>{tip.body}</Text>
                </View>
              ))}
            </View>
          </SectionCard>

          <SectionCard
            title="Loan copilot"
            subtitle="Gemini chat guidance"
            accentLabel="Live"
          >
            <LoanAssistantPanel
              variant="embedded"
              beneficiaryName={beneficiaryProfile?.name ?? undefined}
              loanAmount={loan?.loanAmount}
              bankName={loan?.bank}
            />
          </SectionCard>
        </ScrollView>
      </View>
      {showLoadingOverlay ? (
        <View style={[styles.loadingOverlay, { backgroundColor: palette.background + 'CC' }]}
          pointerEvents="none"
        >
          <ActivityIndicator color={palette.accent} size="large" />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 18,
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
  heroBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroPills: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  tipList: {
    gap: 12,
  },
  tipCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipBody: {
    fontSize: 13,
    lineHeight: 18,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
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

const tips = [
  {
    title: 'Record geo evidence by noon',
    body: 'Natural light improves AI verification accuracy for pumpsets and assets.',
  },
  {
    title: 'Batch upload invoices',
    body: 'Use the multi-upload option to send related documents in one go for quicker sanction review.',
  },
  {
    title: 'Keep Twilio OTP handy',
    body: 'If you lose network, the assistant stores drafts and syncs automatically once back online.',
  },
];

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
