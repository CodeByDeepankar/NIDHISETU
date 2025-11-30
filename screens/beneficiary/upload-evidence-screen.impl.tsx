import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { Chip } from '@/components/atoms/chip';
import { SubmissionCard } from '@/components/molecules/submission-card';
import { UploadCard } from '@/components/molecules/upload-card';
import MapView, { Marker } from '@/components/react-native-maps-shim';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useSubmissions } from '@/hooks/use-submissions';
import type { BeneficiaryDrawerParamList } from '@/navigation/types';
import type { SubmissionEvidence } from '@/types/entities';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type UploadEvidenceScreenProps = NativeStackScreenProps<BeneficiaryDrawerParamList, 'UploadEvidence'>;

export const UploadEvidenceScreen = ({ route, navigation }: UploadEvidenceScreenProps) => {
  const { requirementId, requirementName } = route.params || {};
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { submissions, refresh, isLoading } = useSubmissions();
  const theme = useAppTheme();

  useEffect(() => {
    if (!locationPermission?.granted) {
      requestLocationPermission();
      return;
    }

    const fetchLocation = async () => {
      const current = await Location.getCurrentPositionAsync({});
      setLocation(current);
    };

    void fetchLocation();
  }, [locationPermission, requestLocationPermission]);

  const requirementKey = useMemo(() => (requirementId ? `Requirement: ${requirementId}` : undefined), [requirementId]);

  const relatedSubmissions = useMemo(() => {
    if (!submissions.length) {
      return [] as SubmissionEvidence[];
    }
    if (!requirementKey && !requirementName) {
      return submissions;
    }
    return submissions.filter((submission) => {
      if (requirementKey && submission.remarks?.includes(requirementKey)) {
        return true;
      }
      if (requirementName && submission.assetName === requirementName) {
        return true;
      }
      return false;
    });
  }, [requirementKey, requirementName, submissions]);

  const gpsStatus: 'fetching' | 'ready' | 'error' = !locationPermission?.granted
    ? 'error'
    : location
      ? 'ready'
      : 'fetching';
  const lastCaptureAt = relatedSubmissions[0]?.capturedAt;

  const handleOpenCamera = () => {
    navigation.navigate('LoanEvidenceCamera', { requirementId, requirementName });
  };

  const handleRecordVideo = () => {
    Alert.alert('Coming soon', 'Video capture is not yet supported.');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}
      refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={handleRefresh} />}
      accessibilityLabel="Upload evidence detail"
    >
      <View style={styles.header}>
        <AppButton
          label="Back"
          variant="ghost"
          icon="arrow-left"
          onPress={() => navigation.goBack()}
        />
        <AppText variant="titleLarge" color="text">
          {requirementName ? `Upload ${requirementName}` : 'Upload Evidence'}
        </AppText>
        <AppText variant="bodyMedium" color="muted">
          Capture geo-tagged proof with timestamp and watermark. Items upload automatically when online.
        </AppText>
      </View>

      <UploadCard
        status="idle"
        gpsStatus={gpsStatus}
        lastCaptureAt={lastCaptureAt}
        onCapturePhoto={handleOpenCamera}
        onCaptureVideo={handleRecordVideo}
        onOpenDrafts={() => navigation.navigate('SyncStatus')}
      />

      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.infoRow}>
          <AppIcon name="crosshairs-gps" color={gpsStatus === 'error' ? 'error' : 'primary'} />
          <View>
            <AppText variant="titleSmall" color="text">
              Location metadata
            </AppText>
            <AppText variant="bodySmall" color="muted">
              {location
                ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
                : gpsStatus === 'error'
                  ? 'Location permission required'
                  : 'Fetching coordinates…'}
            </AppText>
          </View>
          <AppButton label="View Map" variant="outline" compact onPress={() => setShowMap(true)} />
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <View style={styles.sectionHeader}>
          <AppText variant="titleMedium" color="text">
            Recent uploads
          </AppText>
          <Chip
            label={`${relatedSubmissions.length} item${relatedSubmissions.length === 1 ? '' : 's'}`}
            tone="secondary"
          />
        </View>
        {relatedSubmissions.length ? (
          relatedSubmissions.map((submission) => (
            <SubmissionCard key={submission.id || submission.offlineId} submission={submission} />
          ))
        ) : (
          <View style={[styles.emptyState, { borderColor: theme.colors.border }]}
            accessibilityRole="text"
          >
            <AppIcon name="image-off" color="muted" size={32} />
            <AppText variant="bodyMedium" color="muted" style={{ textAlign: 'center' }}>
              No uploads yet. Tap “Capture Photo” to submit your first proof.
            </AppText>
          </View>
        )}
      </View>

      <AppButton
        label="Capture Photo"
        icon="camera"
        onPress={handleOpenCamera}
      />

      <AppButton
        label="View All Uploads"
        variant="secondary"
        onPress={() => navigation.navigate('PreviousSubmissions')}
      />

      <Modal visible={showMap} transparent animationType="fade">
        <View style={[styles.modalBackdrop, { backgroundColor: theme.colors.overlay }]}
          accessibilityViewIsModal
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
            accessibilityLabel="Map preview"
          >
            {location ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker coordinate={location.coords} />
              </MapView>
            ) : (
              <AppText variant="bodyMedium" color="text">
                Fetching location…
              </AppText>
            )}
            <AppButton label="Close" onPress={() => setShowMap(false)} style={{ marginTop: theme.spacing.sm }} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    padding: 16,
  },
  map: {
    height: 240,
    borderRadius: 12,
  },
  header: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
});
