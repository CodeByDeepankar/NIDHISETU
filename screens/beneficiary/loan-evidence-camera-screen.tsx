
import { decode as base64Decode } from 'base-64';
import { Camera, CameraView } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';

import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
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
import { useSubmissions } from '@/hooks/use-submissions';
import { supabase, SUPABASE_BUCKET } from '@/lib/supabaseClient';
import type { BeneficiaryDrawerParamList } from '@/navigation/types';
import { useAuthStore } from '@/state/authStore';
import type { DrawerScreenProps } from '@react-navigation/drawer';


const localEvidenceDir = `${FileSystem.documentDirectory ?? ''}loan-evidence/`;


type Props = DrawerScreenProps<
  BeneficiaryDrawerParamList,
  'LoanEvidenceCamera'
>;

export const LoanEvidenceCameraScreen = ({ route, navigation }: Props) => {
  const { requirementId, requirementName, loanId } = route.params ?? {};

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

    } catch (error) {
      console.warn('Media library permission error', error);
      if (error instanceof Error && error.message.includes('AUDIO permission')) {
        console.warn('Expo Go cannot request AUDIO permission. Skipping gallery save; evidence upload continues.');
      }
      Alert.alert(
        'Gallery access limited',
        'Saving captures to the device gallery is only available in a development build. Evidence uploads will continue.'
      );
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

  const saveToLocalEvidenceFolder = useCallback(async (uri: string) => {
    if (!FileSystem.documentDirectory) {
      return undefined;
    }
    try {
      await FileSystem.makeDirectoryAsync(localEvidenceDir, { intermediates: true });
    } catch (error) {
      if (!(error instanceof Error && error.message.includes('Already exists'))) {
        console.warn('Unable to ensure local evidence directory', error);
      }
    }
    const localPath = `${localEvidenceDir}${Date.now()}.jpg`;
    try {
      await FileSystem.copyAsync({ from: uri, to: localPath });
      return localPath;
    } catch (error) {
      console.warn('Failed to persist local evidence copy', error);
      return undefined;
    }
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
        await saveToLocalEvidenceFolder(result.uri);
        await ensureLocation();
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const uploadToStorage = async (uri: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    }
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) {
        throw new Error('Captured file is missing.');
      }
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binary = base64Decode(base64);
      const buffer = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        buffer[i] = binary.charCodeAt(i);
      }
      const objectPath = `${userId ?? 'anonymous'}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(objectPath, buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });
      if (uploadError) {
        throw new Error(`Supabase upload failed: ${uploadError.message}`);
      }
      const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(objectPath);
      if (!data?.publicUrl) {
        throw new Error('Unable to generate Supabase public URL.');
      }
      return data.publicUrl;
    } catch (error) {
      console.error('uploadToStorage error', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown upload error');
    }
  };

  const handleConfirm = async () => {
    if (!photoUri) return;

    const loc = location ?? (await ensureLocation());
    if (!loc) return;

    setIsUploading(true);
    try {
      let finalUri = photoUri;

      let watermarkedUri: string | undefined;
      try {
        watermarkedUri = await captureWatermarkedEvidence();
      } catch (error) {
        console.warn('Unable to capture watermarked evidence. Using original photo.', error);
      }

      if (watermarkedUri) {
        finalUri = watermarkedUri;
        await saveToGalleryIfAllowed(watermarkedUri);
        await saveToLocalEvidenceFolder(watermarkedUri);
      } else {
        await saveToGalleryIfAllowed(finalUri);
        await saveToLocalEvidenceFolder(finalUri);
      }

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
