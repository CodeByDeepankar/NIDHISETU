import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { useNetworkStatus } from '@/hooks/use-network-status';
import type { BeneficiaryDrawerParamList } from '@/navigation/types';
import { useAuthStore } from '@/state/authStore';
import { useSubmissionQueueStore, type PendingSubmission } from '@/state/submissionQueueStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeroSurface, InfoRow, Pill, SectionCard, useBeneficiaryPalette } from './ui-kit';

export type SyncStatusScreenProps = NativeStackScreenProps<BeneficiaryDrawerParamList, 'SyncStatus'>;

export const SyncStatusScreen = () => {
  const palette = useBeneficiaryPalette();
  const isOnline = useNetworkStatus();
  const beneficiaryId = useAuthStore((state) => state.profile?.id ?? undefined);
  const pendingDrafts = useSubmissionQueueStore((state) => state.pending);
  const syncStatus = useSubmissionQueueStore((state) => state.syncStatus);
  const syncError = useSubmissionQueueStore((state) => state.error);
  const lastSyncedAt = useSubmissionQueueStore((state) => state.lastSyncedAt);
  const syncPendingWithServer = useSubmissionQueueStore((state) => state.actions.syncPendingWithServer);

  const handleSyncAll = () => {
    if (!beneficiaryId || !pendingDrafts.length || syncStatus === 'syncing') {
      return;
    }
    void syncPendingWithServer(beneficiaryId);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <HeroSurface>
        <View style={styles.heroHeader}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.subtext }]}>Offline queue</Text>
            <Text style={[styles.heroTitle, { color: palette.text }]}>Sync status</Text>
            <Text style={[styles.heroSubtitle, { color: palette.subtext }]}>Monitor drafts and network health</Text>
          </View>
        </View>
        <View style={styles.heroPills}>
          <Pill label={isOnline ? 'Online' : 'Offline'} tone={isOnline ? 'success' : 'warning'} />
          <Pill label={`${pendingDrafts.length} drafts`} tone={pendingDrafts.length ? 'amber' : 'success'} />
        </View>
        <InfoRow label="Last synced" value={lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Not synced yet'} />
        <AppButton
          label={syncStatus === 'syncing' ? 'Syncing drafts…' : 'Sync all drafts'}
          icon="cloud-sync"
          onPress={handleSyncAll}
          disabled={!isOnline || !pendingDrafts.length || syncStatus === 'syncing'}
        />
      </HeroSurface>

      {syncError ? (
        <SectionCard title="Sync error" subtitle="We could not reach the server" accentLabel="Issue">
          <AppText variant="bodyMedium" color="error">
            {syncError}
          </AppText>
          <AppButton label="Retry now" icon="refresh" onPress={handleSyncAll} variant="outline" />
        </SectionCard>
      ) : null}
    </View>
  );

  const renderDraft = ({ item }: { item: PendingSubmission }) => (
    <SectionCard
      title={item.assetName}
      subtitle={`Captured ${new Date(item.capturedAt).toLocaleString()}`}
      accentLabel={item.status === 'failed' ? 'Failed' : 'Pending'}
    >
      <InfoRow
        label="Coordinates"
        value={`Lat ${item.location.latitude.toFixed(3)}, Lon ${item.location.longitude.toFixed(3)}`}
      />
      <InfoRow label="Media" value={item.mediaType.toUpperCase()} />
      <AppButton
        label={syncStatus === 'syncing' ? 'Syncing…' : 'Retry upload'}
        icon="refresh"
        variant="outline"
        onPress={handleSyncAll}
        disabled={!isOnline || syncStatus === 'syncing'}
      />
    </SectionCard>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <FlatList
        data={pendingDrafts}
        keyExtractor={(item) => item.id}
        renderItem={renderDraft}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <AppText variant="bodyMedium" color="muted" style={styles.emptyState}>
            No offline drafts waiting for upload.
          </AppText>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 8,
  },
  headerContainer: {
    gap: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyState: {
    textAlign: 'center',
    marginTop: 40,
  },
});
