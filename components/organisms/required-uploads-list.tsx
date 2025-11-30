import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { Chip } from '@/components/atoms/chip';
import { useAppTheme } from '@/hooks/use-app-theme';
import { StyleSheet, View } from 'react-native';

export interface UploadRequirement {
  id: string;
  label: string;
  status: 'pending' | 'uploaded' | 'rejected';
}

interface RequiredUploadsListProps {
  requirements: UploadRequirement[];
  onUpload: (id: string, label: string) => void;
}

export const RequiredUploadsList = ({ requirements, onUpload }: RequiredUploadsListProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <AppText variant="titleMedium" style={styles.title}>Required Uploads</AppText>
      <View style={styles.list}>
        {requirements.map((req) => (
          <View key={req.id} style={[styles.item, { backgroundColor: theme.colors.card }]}>
            <View style={styles.itemInfo}>
                <AppText variant="bodyMedium" weight="500">{req.label}</AppText>
                <StatusBadge status={req.status} />
            </View>
            {req.status !== 'uploaded' ? (
                <AppButton 
                    label={req.status === 'rejected' ? 'Re-upload' : 'Upload'}
                    compact
                    variant={req.status === 'rejected' ? 'primary' : 'outline'}
                    onPress={() => onUpload(req.id, req.label)} 
                />
            ) : (
                <View style={styles.uploadedIcon}>
                    <AppIcon name="check-circle" color="success" size={24} />
                </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
    const tone = status === 'uploaded' ? 'success' : status === 'rejected' ? 'error' : 'outline';
    const label = status === 'uploaded' ? 'Uploaded' : status === 'rejected' ? 'Rejected' : 'Not Uploaded';
    return <Chip label={label} tone={tone} />;
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    marginBottom: 4,
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  itemInfo: {
    gap: 8,
  },
  uploadedIcon: {
    padding: 8,
  },
});
