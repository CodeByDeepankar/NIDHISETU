import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon, IconName } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { Chip } from '@/components/atoms/chip';
import { useAppTheme } from '@/hooks/use-app-theme';

export interface UploadCardProps {
  status: 'idle' | 'capturing' | 'saved' | 'error';
  gpsStatus: 'fetching' | 'ready' | 'error';
  lastCaptureAt?: string;
  onCapturePhoto?: () => void;
  onCaptureVideo?: () => void;
  onOpenDrafts?: () => void;
}

export const UploadCard = ({
  status,
  gpsStatus,
  lastCaptureAt,
  onCapturePhoto,
  onCaptureVideo,
  onOpenDrafts,
}: UploadCardProps) => {
  const theme = useAppTheme();
  const statusLabel = statusMap[status];
  const gpsLabel = gpsMap[gpsStatus];

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.radii.lg }]}
      accessibilityRole="summary"
      aria-label="Upload Evidence"
    >
      <View style={styles.headerRow}>
        <AppText variant="titleMedium" color="text">
          Upload Evidence
        </AppText>
        <Chip
          label={statusLabel}
          tone={status === 'error' ? 'error' : 'secondary'}
          backgroundColor={status === 'error' ? theme.colors.errorContainer : theme.colors.secondaryContainer}
        />
      </View>
      <View style={styles.statusRow}>
        <InfoRow icon="crosshairs-gps" label="GPS" value={gpsLabel} tone={gpsStatus === 'error' ? 'error' : 'primary'} />
        <InfoRow
          icon="clock-outline"
          label="Last Capture"
          value={lastCaptureAt ? new Date(lastCaptureAt).toLocaleString() : 'Not captured yet'}
        />
      </View>
      <View style={styles.actionRow}>
        <AppButton label="Capture Photo" icon="camera" onPress={onCapturePhoto} />
        <AppButton label="Capture Video" icon="video" variant="secondary" onPress={onCaptureVideo} />
      </View>
      <View style={styles.draftsRow}>
        <AppIcon name="cloud-off-outline" size={20} color="warning" />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyMedium" color="text">
            Offline drafts stored locally
          </AppText>
          <AppText variant="labelSmall" color="muted">
            Sync automatically when network resumes
          </AppText>
        </View>
        <AppButton label="View Drafts" variant="outline" icon="folder" onPress={onOpenDrafts} />
      </View>
    </View>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
  tone = 'muted',
}: {
  icon: IconName;
  label: string;
  value: string;
  tone?: 'muted' | 'primary' | 'error';
}) => (
  <View style={styles.infoRow}>
    <AppIcon name={icon} size={20} color={tone === 'muted' ? 'muted' : tone} />
    <View style={{ flex: 1 }}>
      <AppText variant="labelSmall" color="muted">
        {label}
      </AppText>
      <AppText variant="bodyMedium" color="text">
        {value}
      </AppText>
    </View>
  </View>
);

const statusMap: Record<UploadCardProps['status'], string> = {
  idle: 'Ready to capture',
  capturing: 'Capturing…',
  saved: 'Saved to drafts',
  error: 'Capture failed',
};

const gpsMap: Record<UploadCardProps['gpsStatus'], string> = {
  fetching: 'Fetching coordinates…',
  ready: 'GPS locked',
  error: 'Location unavailable',
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  draftsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
