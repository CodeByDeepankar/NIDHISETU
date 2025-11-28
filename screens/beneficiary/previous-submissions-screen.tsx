import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/atoms/app-button';
import { SubmissionList } from '@/components/organisms/submission-list';
import { useSubmissions } from '@/hooks/use-submissions';
import type { BeneficiaryDrawerParamList } from '@/navigation/types';
import type { SubmissionEvidence } from '@/types/entities';

import { HeroSurface, InfoRow, Pill, SectionCard, useBeneficiaryPalette } from './ui-kit';

export type PreviousSubmissionsScreenProps = NativeStackScreenProps<BeneficiaryDrawerParamList, 'PreviousSubmissions'>;

export const PreviousSubmissionsScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<BeneficiaryDrawerParamList>>();
  const { submissions, refresh, isLoading } = useSubmissions();
  const palette = useBeneficiaryPalette();

  const total = submissions.length;
  const pending = submissions.filter((submission) => submission.status === 'pending' || submission.status === 'syncing').length;
  const approved = submissions.filter((submission) => submission.status === 'approved').length;
  const rejected = submissions.filter((submission) => submission.status === 'rejected').length;
  const latestSubmission = submissions[0];
  const lastSyncedAt = latestSubmission?.submittedAt ?? latestSubmission?.capturedAt ?? null;

  const handleRetry = (submission: SubmissionEvidence) => {
    navigation.navigate('UploadEvidence', {
      requirementId: submission.assetName,
      requirementName: submission.assetName,
    });
  };

  const handleCaptureNew = () => {
    navigation.navigate('UploadEvidence', {} as never);
  };

  const listHeader = () => (
    <View style={styles.headerContainer}>
      <HeroSurface>
        <View style={styles.heroHeader}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.subtext }]}>Submission trail</Text>
            <Text style={[styles.heroTitle, { color: palette.text }]}>Evidence</Text>
            <Text style={[styles.heroSubtitle, { color: palette.subtext }]}>Track approvals & sync status</Text>
          </View>
        </View>
        <View style={styles.heroPills}>
          <Pill label={`Total ${total}`} tone="sky" />
          <Pill label={`Pending ${pending}`} tone="warning" />
          <Pill label={`Approved ${approved}`} tone="success" />
        </View>
        <InfoRow label="Last sync" value={lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Not synced yet'} />
        <AppButton label="Capture new evidence" icon="camera" onPress={handleCaptureNew} />
      </HeroSurface>

      <SectionCard title="Submission insights" subtitle="Status overview" accentLabel="Live">
        <View style={styles.metricRow}>
          <StatBlock label="Pending" value={pending} palette={palette} />
          <StatBlock label="Approved" value={approved} palette={palette} />
          <StatBlock label="Rejected" value={rejected} palette={palette} />
        </View>
        <AppButton label="Refresh list" icon="refresh" variant="outline" onPress={() => void refresh()} />
      </SectionCard>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <SubmissionList
        submissions={submissions}
        refreshing={isLoading}
        onRefresh={() => {
          void refresh();
        }}
        onPressRetry={handleRetry}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 120 }}
      />
    </SafeAreaView>
  );
};

const StatBlock = ({ label, value, palette }: { label: string; value: number; palette: ReturnType<typeof useBeneficiaryPalette> }) => (
  <View style={[styles.statBlock, { borderColor: palette.border, backgroundColor: palette.surface }]}
    accessibilityLabel={`${label} ${value}`}
  >
    <Text style={[styles.statValue, { color: palette.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: palette.subtext }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
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
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBlock: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
