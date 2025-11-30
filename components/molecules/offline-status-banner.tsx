import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

export const OfflineStatusBanner = ({ isOffline }: { isOffline: boolean }) => {
  const theme = useAppTheme();

  if (!isOffline) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.errorContainer }]}>
      <AppIcon name="wifi-off" size={20} color="error" />
      <AppText variant="bodyMedium" color="error" weight="500">
        You are currently offline. Changes will sync when online.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
});
