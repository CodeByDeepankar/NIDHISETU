import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { SyncState } from '@/types/entities';

export interface SyncBannerProps {
  syncState: SyncState;
  onRetry?: () => void;
  onOpenQueue?: () => void;
}

export const SyncBanner = ({ syncState, onRetry, onOpenQueue }: SyncBannerProps) => {
  const theme = useAppTheme();
  const palette = getPalette(syncState.status, theme);

  return (
    <View style={[styles.container, { backgroundColor: palette.background, borderColor: palette.border }]}
      accessibilityLiveRegion="polite"
    >
      <AppIcon name={palette.icon} color={palette.iconTone} size={20} />
      <View style={{ flex: 1 }}>
        <AppText variant="bodyMedium" color={palette.iconTone}>
          {palette.title}
        </AppText>
        <AppText variant="labelSmall" color="muted">
          {palette.description(syncState)}
        </AppText>
      </View>
      {palette.showRetry ? (
        <AppButton label="Retry" variant="outline" compact onPress={onRetry} />
      ) : null}
      <AppButton label="Queue" variant="ghost" icon="playlist-check" onPress={onOpenQueue} />
    </View>
  );
};

const getPalette = (status: SyncState['status'], theme: ReturnType<typeof useAppTheme>) => {
  const base = {
    background: theme.colors.surfaceVariant,
    border: theme.colors.border,
    iconTone: 'primary' as const,
    icon: 'cloud-check' as const,
    title: 'All caught up',
    description: () => 'Background sync enabled',
    showRetry: false,
  };

  if (status === 'in-progress') {
    return {
      ...base,
      icon: 'progress-clock' as const,
      title: 'Syncing pending uploads…',
      description: (state: SyncState) => `${state.pendingCount ?? 0} items remaining`,
    };
  }

  if (status === 'error') {
    return {
      background: theme.colors.errorContainer,
      border: theme.colors.error,
      icon: 'alert-circle' as const,
      iconTone: 'error' as const,
      title: 'Sync failed',
      description: (state: SyncState) => state.errorMessage ?? 'Please retry when online',
      showRetry: true,
    };
  }

  if (status === 'success') {
    return {
      ...base,
      icon: 'check-circle-outline' as const,
      title: 'Synced successfully',
      description: (state: SyncState) =>
        state.lastSyncedAt ? `Last synced ${new Date(state.lastSyncedAt).toLocaleTimeString()}` : 'just now',
    };
  }

  return base;
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
