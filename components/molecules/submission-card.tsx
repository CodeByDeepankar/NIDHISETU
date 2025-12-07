import { useMemo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppLocale, useT } from 'lingo.dev/react';

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
  role = 'beneficiary',
}: SubmissionCardProps) => {
  const theme = useAppTheme();
  const t = useT();
  const { locale } = useAppLocale();
  const statusTone = getStatusTone(submission.status);
  const statusBackground = getStatusBackground(theme, submission.status);
  const dateLocale = locale === 'en' ? 'en-GB' : locale;

  const capturedAtLabel = useMemo(() => (
    new Date(submission.capturedAt).toLocaleString(dateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  ), [submission.capturedAt, dateLocale]);

  const statusLabel = useMemo(() => t(getStatusLabel(submission.status)), [submission.status, t]);
  const hasCustomRemarks = Boolean(submission.remarks);
  const remarksText = submission.remarks ?? t('No remarks provided');

  const handlePress = () => {
    if (submission.status === 'failed' || submission.status === 'rejected') {
      onPressRetry?.(submission);
    } else {
      onPressView?.(submission);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Left: Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: submission.thumbnailUrl ?? 'https://placehold.co/120x120?text=Asset' }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.iconOverlay}>
            <Ionicons name="camera" size={20} color="white" />
        </View>
      </View>

      {/* Right: Content */}
      <View style={styles.contentContainer}>
        {/* Row 1: Date & Status */}
        <View style={styles.headerRow}>
          <AppText style={styles.dateText} translate={false}>
            {capturedAtLabel}
          </AppText>
          <Chip
            label={statusLabel}
            tone={statusTone}
            backgroundColor={statusBackground}
            style={styles.statusChip}
            textStyle={styles.statusText}
          />
        </View>

        {/* Row 2: Asset Name */}
        <AppText style={styles.assetName} numberOfLines={1} translate={false}>
          {submission.assetName}
        </AppText>

        {/* Row 3: Remarks */}
        <AppText style={styles.remarks} numberOfLines={1} translate={!hasCustomRemarks}>
          {remarksText}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    height: 24,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  assetName: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  remarks: {
    fontSize: 14,
    color: '#6B7280',
  },
});
