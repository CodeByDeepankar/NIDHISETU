import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

export const SyncStatusChip = ({ lastSyncedAt }: { lastSyncedAt?: string }) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <AppIcon name="cloud-check" size={14} color="muted" />
      <AppText variant="labelSmall" color="muted">
        {lastSyncedAt ? `Synced ${lastSyncedAt}` : 'Syncing...'}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
