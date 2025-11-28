 import { Camera, CameraView } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  InteractionManager,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useSubmissions } from '@/hooks/use-submissions';
import { app } from '@/lib/firebase';
import type { BeneficiaryDrawerParamList } from '@/navigation/types';
import { useAuthStore } from '@/state/authStore';
import type { DrawerScreenProps } from '@react-navigation/drawer';

import { useBeneficiaryPalette } from './ui-kit';

const storage = getStorage(app);

type Props = DrawerScreenProps<
  BeneficiaryDrawerParamList,
  'LoanEvidenceCamera'
>;

export const LoanEvidenceCameraScreen = ({ route, navigation }: Props) => {
  const { requirementId, requirementName, loanId } = route.params ?? {};
  const theme = useAppTheme();
  const palette = useBeneficiaryPalette();

  const cameraRef = useRef<CameraView | null>(null);
  const composedRef = useRef<View | null>(null);

  const userId = useAuthStore((s) => s.profile?.id ?? 'anonymous');
  const { submitEvidence } = useSubmissions();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>();
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean>();
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>();
  const [photoUri, setPhotoUri] = useState<string>();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const requestMediaPermission = useCallback(async () => {
    try {
      const status = await MediaLibrary.requestPermissionsAsync();
      const granted = status.status === 'granted';
      setHasMediaPermission(granted);
      return granted;
    } catch {
      setHasMediaPermission(false);
      return false;
    }
  }, []);

  const saveToGalleryIfAllowed = useCallback(
    async (uri: string) => {
      if (!hasMediaPermission) return;
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
      } catch {}
    },
    [hasMediaPermission]
  );

  const captureWatermarkedEvidence = useCallback(async () => {
    if (!composedRef.current) throw new Error('Missing watermark view');

    await new Promise((resolve) =>
      InteractionManager.runAfterInteractions(() => resolve(undefined))
    );

    return captureRef(composedRef.current, {
      format: 'jpg',
      quality: 0.9,
      result: 'tmpfile',
    });
  }, []);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      await requestMediaPermission();

      const locationStatus = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus.status === 'granted');
      if (locationStatus.status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        setLocation(pos);
      }
    })();
  }, [requestMediaPermission]);

  const ensureLocation = async () => {
    if (!hasLocationPermission) {
      const status = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status.status === 'granted');
      if (!status.granted) return null;
    }

    const pos = await Location.getCurrentPositionAsync({});
    setLocation(pos);
    return pos;
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: true,
      });

      if (result?.uri) {
        setPhotoUri(result.uri);
        await saveToGalleryIfAllowed(result.uri);
        await ensureLocation();
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const uploadToStorage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `loan-evidence/${userId}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
    return getDownloadURL(storageRef);
  };

  const handleConfirm = async () => {
    if (!photoUri) return;

    const loc = location ?? (await ensureLocation());
    if (!loc) return;

    setIsUploading(true);
    try {
      let finalUri = photoUri;

      try {
        finalUri = await captureWatermarkedEvidence();
      } catch {}

      await saveToGalleryIfAllowed(finalUri);

      const remoteUrl = await uploadToStorage(finalUri);

      await submitEvidence({
        assetName: requirementName ?? 'Loan Evidence',
        mediaType: 'photo',
        capturedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        location: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
        remarks: requirementId ? `Requirement: ${requirementId}` : undefined,
        mediaUrl: remoteUrl,
        thumbnailUrl: remoteUrl,
      });

      Alert.alert('Success', 'Evidence uploaded successfully.', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
      setPhotoUri(undefined);
    } finally {
      setIsUploading(false);
    }
  };

  const watermarkLines = useMemo(() => {
    if (!location) return [];

    const ts = new Date(location.timestamp ?? Date.now());
    const dt = `${ts.getDate()}-${ts.getMonth() + 1}-${ts.getFullYear()} ${ts.getHours()}:${ts.getMinutes()}`;

    return [
      `Lat: ${location.coords.latitude.toFixed(5)}`,
      `Lon: ${location.coords.longitude.toFixed(5)}`,
      `Time: ${dt}`,
      loanId ? `Loan: ${loanId}` : undefined,
      requirementName ? `Req: ${requirementName}` : undefined,
      userId ? `User: ${userId}` : undefined,
    ].filter(Boolean) as string[];
  }, [location, loanId, requirementName, userId]);

  if (hasCameraPermission === undefined) {
    return <SafeAreaView />;
  }

  if (hasCameraPermission === false) {
    return (
      <SafeAreaView style={styles.center}>
        <AppText variant="bodyLarge">Camera permission required</AppText>
        <AppButton
          label="Grant Permission"
          onPress={async () => {
            const status = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(status.status === 'granted');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!photoUri ? (
        <CameraView ref={cameraRef} style={{ flex: 1 }} />
      ) : (
        <View style={{ flex: 1 }} ref={composedRef}>
          <Image source={{ uri: photoUri }} style={{ flex: 1 }} />
          <View style={styles.watermark}>
            {watermarkLines.map((line, i) => (
              <AppText key={i} color="white">
                {line}
              </AppText>
            ))}
          </View>
        </View>
      )}

      <View style={styles.bottomBar}>
        {!photoUri ? (
          <TouchableOpacity onPress={handleCapture} disabled={isCapturing}>
            <View style={styles.captureBtn} />
          </TouchableOpacity>
        ) : (
          <>
            <AppButton label="Retake" onPress={() => setPhotoUri(undefined)} />
            <AppButton label="Upload" onPress={handleConfirm} loading={isUploading} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bottomBar: { padding: 20, flexDirection: 'row', gap: 10, justifyContent: 'center' },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  watermark: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    gap: 4,
  },
});
