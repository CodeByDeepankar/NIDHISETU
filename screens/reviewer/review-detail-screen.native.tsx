import { useMemo } from 'react';
import { ImageBackground, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
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
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${submission.location.latitude},${submission.location.longitude}`;
  const handleOpenMap = () => {
    void Linking.openURL(mapsUrl);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={{ uri: submission.thumbnailUrl ?? 'https://placehold.co/600x400' }}
        style={styles.media}
      >
        <View style={styles.mediaBadge}>
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
      <TouchableOpacity
        style={styles.locationCard}
        accessibilityRole="button"
        accessibilityLabel="Open location in maps"
        onPress={handleOpenMap}
      >
        <AppIcon name="map-marker" color="primary" size={20} />
        <View style={{ flex: 1 }}>
          <AppText variant="titleSmall" color="text">
            Evidence location
          </AppText>
          <AppText variant="bodySmall" color="muted">
            {submission.location.latitude.toFixed(4)}, {submission.location.longitude.toFixed(4)}
          </AppText>
        </View>
        <AppButton label="Open" icon="map" variant="ghost" onPress={handleOpenMap} />
      </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    margin: 12,
    borderRadius: 999,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
