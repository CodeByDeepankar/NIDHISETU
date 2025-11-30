import { ImageBackground, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { Chip } from '@/components/atoms/chip';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { SubmissionEvidence } from '@/types/entities';
import { getStatusBackground, getStatusLabel, getStatusTone } from '@/utils/status';

export interface SubmissionCardProps {
  submission: SubmissionEvidence;
  onPressView?: (submission: SubmissionEvidence) => void;
  onPressRetry?: (submission: SubmissionEvidence) => void;
  onPressApprove?: (submission: SubmissionEvidence) => void;
  onPressReject?: (submission: SubmissionEvidence) => void;
  role?: 'beneficiary' | 'reviewer';
}

export const SubmissionCard = ({
  submission,
  onPressView,
  onPressRetry,
  onPressApprove,
  onPressReject,
  role = 'beneficiary',
}: SubmissionCardProps) => {
  const theme = useAppTheme();
  const statusTone = getStatusTone(submission.status);
  const statusBackground = getStatusBackground(theme, submission.status);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.radii.lg }]}>
      <View style={styles.headerRow}>
        <AppText variant="titleSmall" color="text">
          {submission.assetName}
        </AppText>
        <Chip
          label={getStatusLabel(submission.status)}
          tone={statusTone}
          backgroundColor={statusBackground}
        />
      </View>
      <View style={styles.mediaRow}>
        <ImageBackground
          source={{ uri: submission.thumbnailUrl ?? 'https://placehold.co/120x120?text=Asset' }}
          style={[styles.thumbnail, { borderRadius: theme.radii.md }]}
        >
          <View style={[styles.mediaBadge, { backgroundColor: theme.colors.overlay }]}
            accessibilityRole="text"
            aria-label={`Media type ${submission.mediaType}`}
          >
            <AppIcon name={submission.mediaType === 'photo' ? 'camera' : 'video'} color="onPrimary" />
            <AppText variant="labelSmall" color="onPrimary">
              {submission.mediaType.toUpperCase()}
            </AppText>
          </View>
        </ImageBackground>
        <View style={styles.metaColumn}>
          <LabelValue label="Captured" value={formatDate(submission.capturedAt)} />
          <LabelValue label="GPS" value={`${submission.location.latitude.toFixed(4)}, ${submission.location.longitude.toFixed(4)}`} />
          {submission.remarks ? <LabelValue label="Remarks" value={submission.remarks} multiline /> : null}
          {submission.isDraft ? (
            <Chip label="Local Draft" tone="warning" backgroundColor={theme.colors.warningContainer} />
          ) : null}
        </View>
      </View>
      <View style={styles.actionsRow}>
        <AppButton label="View" variant="outline" icon="eye" onPress={() => onPressView?.(submission)} />
        {submission.status === 'failed' || submission.status === 'syncing' ? (
          <AppButton label="Retry" icon="refresh" onPress={() => onPressRetry?.(submission)} />
        ) : null}
        {submission.status === 'rejected' ? (
          <AppButton label="Re-upload" icon="camera" onPress={() => onPressRetry?.(submission)} />
        ) : null}
        {role === 'reviewer' && submission.status !== 'approved' ? (
          <View style={styles.reviewerActions}>
            <AppButton
              label="Approve"
              icon="check"
              variant="secondary"
              onPress={() => onPressApprove?.(submission)}
            />
            <AppButton
              label="Reject"
              icon="close"
              variant="outline"
              tone="error"
              onPress={() => onPressReject?.(submission)}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
};

const LabelValue = ({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) => (
  <View style={styles.labelValue}>
    <AppText variant="labelSmall" color="muted">
      {label}
    </AppText>
    <AppText variant="bodyMedium" color="text" numberOfLines={multiline ? undefined : 1}>
      {value}
    </AppText>
  </View>
);

const formatDate = (value: string) => new Date(value).toLocaleString();

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 120,
    height: 120,
    overflow: 'hidden',
  },
  mediaBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  metaColumn: {
    flex: 1,
    gap: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewerActions: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 0,
  },
  labelValue: {
    gap: 2,
  },
});
