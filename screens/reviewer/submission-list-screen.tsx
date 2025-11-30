import { View } from 'react-native';

import { SubmissionList } from '@/components/organisms/submission-list';
import type { ReviewerStackParamList } from '@/navigation/types';
import type { SubmissionEvidence } from '@/types/entities';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const submissions: SubmissionEvidence[] = new Array(12).fill(null).map((_, index) => ({
  id: `review-${index}`,
  assetName: `Evidence ${index + 1}`,
  mediaType: index % 2 === 0 ? 'photo' : 'video',
  capturedAt: new Date().toISOString(),
  location: { latitude: 28.5 + index * 0.01, longitude: 77.2 + index * 0.01 },
  status: index % 3 === 0 ? 'approved' : 'pending',
}));

export type ReviewerSubmissionListScreenProps = NativeStackScreenProps<ReviewerStackParamList, 'ReviewerSubmissions'>;

export const ReviewerSubmissionListScreen = ({ navigation }: ReviewerSubmissionListScreenProps) => (
  <View style={{ flex: 1 }}>
    <SubmissionList
      submissions={submissions}
      role="reviewer"
      onPressView={(submission) => navigation.navigate('ReviewDetail', { submissionId: submission.id })}
    />
  </View>
);
