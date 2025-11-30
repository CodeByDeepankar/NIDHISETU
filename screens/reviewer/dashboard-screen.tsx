import { ScrollView, StyleSheet } from 'react-native';

import { SubmissionCard } from '@/components/molecules/submission-card';
import { AnalyticsSummary as AnalyticsView, DashboardHeader } from '@/components/organisms';
import type { ReviewerStackParamList } from '@/navigation/types';
import type { AnalyticsSummary, SubmissionEvidence } from '@/types/entities';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const analytics: AnalyticsSummary = {
  approved: 54,
  pending: 6,
  rejected: 4,
  total: 64,
};

const pendingSubmissions: SubmissionEvidence[] = new Array(3).fill(null).map((_, index) => ({
  id: `rev-${index}`,
  assetName: `Asset ${index + 1}`,
  mediaType: index % 2 === 0 ? 'photo' : 'video',
  capturedAt: new Date().toISOString(),
  location: { latitude: 19.07 + index * 0.01, longitude: 72.87 + index * 0.01 },
  status: 'pending',
}));

export type ReviewerDashboardScreenProps = NativeStackScreenProps<ReviewerStackParamList, 'ReviewerDashboard'>;

export const ReviewerDashboardScreen = ({ navigation }: ReviewerDashboardScreenProps) => (
  <ScrollView contentContainerStyle={styles.container}>
    <DashboardHeader name="Reviewer" role="reviewer" syncState={{ status: 'idle' }} />
    <AnalyticsView data={analytics} />
    {pendingSubmissions.map((submission) => (
      <SubmissionCard
        key={submission.id}
        submission={submission}
        role="reviewer"
        onPressView={() => navigation.navigate('ReviewDetail', { submissionId: submission.id })}
        onPressApprove={() => {}}
        onPressReject={() => {}}
      />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
});
