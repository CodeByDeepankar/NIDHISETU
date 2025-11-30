import { useMemo } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { ReviewerStackParamList } from '@/navigation/types';
import type { SubmissionEvidence } from '@/types/entities';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const submissions: Record<string, SubmissionEvidence> = {
  'rev-0': {
    id: 'rev-0',
    assetName: 'Solar Panel',
    mediaType: 'photo',
    capturedAt: new Date().toISOString(),
    location: { latitude: 19.074, longitude: 72.8777 },
    status: 'pending',
    remarks: 'Installed on rooftop',
    thumbnailUrl: 'https://placehold.co/600x400',
  },
};

export type ReviewDetailScreenProps = NativeStackScreenProps<ReviewerStackParamList, 'ReviewDetail'>;

export const ReviewDetailScreen = ({ route }: ReviewDetailScreenProps) => {
  const submission = useMemo(() => submissions[route.params.submissionId] ?? Object.values(submissions)[0], [route.params.submissionId]);
  const theme = useAppTheme();

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { padding: theme.spacing.lg, gap: theme.spacing.md }]}
    >
      <ImageBackground
        source={{ uri: submission.thumbnailUrl ?? 'https://placehold.co/600x400' }}
        style={styles.media}
      >
        <View style={[styles.mediaBadge, { backgroundColor: theme.colors.overlay }]}
          accessibilityLabel={`${submission.mediaType} badge`}
        >
          <AppIcon name={submission.mediaType === 'photo' ? 'camera' : 'video'} color="onPrimary" />
          <AppText variant="labelSmall" color="onPrimary">
            {submission.mediaType.toUpperCase()}
          </AppText>
        </View>
      </ImageBackground>
      <AppText variant="headlineMedium" color="text">
        {submission.assetName}
      </AppText>
      <AppText variant="bodyMedium" color="muted">
        Captured {new Date(submission.capturedAt).toLocaleString()}
      </AppText>
      <View
        style={[
          styles.mapPlaceholder,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <AppIcon name="map" size={28} color="muted" />
        <AppText variant="labelMedium" color="muted">
          Map preview available on mobile builds
        </AppText>
      </View>
      {submission.remarks ? (
        <AppText variant="bodyMedium" color="text">
          Remarks: {submission.remarks}
        </AppText>
      ) : null}
      <View style={styles.actionRow}>
        <AppButton label="Approve" icon="check" onPress={() => {}} />
        <AppButton label="Reject" icon="close" variant="outline" tone="error" onPress={() => {}} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  media: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  mediaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    margin: 12,
    borderRadius: 999,
  },
  mapPlaceholder: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
