import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ColorValue,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import { decode as base64Decode } from 'base-64';
import { AppText } from '@/components/atoms/app-text';
import { AppButton } from '@/components/atoms/app-button';
import type { AppTheme } from '@/constants/theme';
import { useSubmissions } from '@/hooks/use-submissions';
import { useAppTheme } from '@/hooks/use-app-theme';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/state/authStore';

const { width } = Dimensions.get('window');

const ASSET_CATEGORIES = [
  "Machinery",
  "Raw Material",
  "Shop Front",
  "Stock",
  "Livestock",
  "Vehicle",
  "Tools/Equipment",
  "Construction Progress"
];

export type UploadEvidenceScreenProps = {
  navigation: any;
  route: {
    params?: {
      requirementId?: string;
      requirementName?: string;
    };
  };
};

export const UploadEvidenceScreen = ({ navigation, route }: UploadEvidenceScreenProps) => {
  const { requirementId, requirementName } = route.params || {};
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const gradientColors = useMemo<readonly [ColorValue, ColorValue]>(
    () => (theme.mode === 'dark' ? [theme.colors.gradientStart, theme.colors.gradientEnd] : ['#A7F3D0', '#6EE7B7']),
    [theme]
  );
  const waveFill = theme.colors.background;
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [assetCategory, setAssetCategory] = useState(requirementName || 'Machinery');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString());
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);

  const { submitEvidence, isOnline } = useSubmissions();
  const userId = useAuthStore((s) => s.profile?.id ?? 'anonymous');

  useEffect(() => {
    // Update timestamp every minute if no image selected
    if (!imageUri) {
      const interval = setInterval(() => {
        setTimestamp(new Date().toLocaleString());
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [imageUri]);

  useEffect(() => {
    setDeviceInfo(`${Device.manufacturer} ${Device.modelName}`);
  }, []);

  const checkLocationServices = async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      Alert.alert(
        'Location Required',
        'Please enable location services to capture geo-tagged evidence.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings() }
        ]
      );
      return false;
    }
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return false;
    }
    return true;
  };

  const handleCameraCapture = async () => {
    const hasLocation = await checkLocationServices();
    if (!hasLocation) return;

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }

      // Get location before capture to ensure we have it
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
        setTimestamp(new Date().toLocaleString());
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const uploadToStorage = async (uri: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const binary = base64Decode(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      buffer[i] = binary.charCodeAt(i);
    }

    const fileName = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('UploadEvedence')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage.from('UploadEvedence').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleUpload = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please capture an image first');
      return;
    }
    if (!assetCategory) {
      Alert.alert('Error', 'Please select an asset category');
      return;
    }
    if (!location) {
      Alert.alert('Error', 'Location data is missing. Please retake the photo.');
      return;
    }

    setLoading(true);
    try {
      let publicUrl = imageUri; // Default to local URI for offline

      if (isOnline) {
        publicUrl = await uploadToStorage(imageUri);
      } else {
        // In offline mode, we might want to copy the file to a permanent local location
        // For now, we use the cache URI, but in a real app, we'd move it to documentDirectory
        const fileName = `${Date.now()}.jpg`;
        const newPath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({ from: imageUri, to: newPath });
        publicUrl = newPath;
        Alert.alert('Offline Mode', 'Evidence saved locally. It will be uploaded when you are back online.');
      }

      await submitEvidence({
        assetName: assetCategory,
        mediaType: 'photo',
        capturedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        remarks: `${caption} [Device: ${deviceInfo}]`,
        mediaUrl: publicUrl,
        thumbnailUrl: publicUrl,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });

      if (isOnline) {
        Alert.alert('Success', 'Evidence uploaded successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save evidence');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Wave */}
      <View style={styles.headerContainer}>
        <LinearGradient colors={gradientColors} style={styles.gradientHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        <View style={styles.waveContainer}>
          <Svg height="100" width={width} viewBox="0 0 1440 320" style={styles.wave}>
            <Path
              fill={waveFill}
              d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,176C672,160,768,160,864,176C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L0,320Z"
            />
          </Svg>
        </View>
      </View>

      <SafeAreaView edges={['top']} style={styles.floatingHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.onPrimary} />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>Upload Evidence</AppText>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Image Placeholder / Preview */}
        <TouchableOpacity style={styles.imageCard} onPress={handleCameraCapture}>
          {imageUri ? (
            <View style={{ width: '100%', height: '100%' }}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.metadataOverlay}>
                    <AppText style={styles.metadataText}>LAT: {location?.coords.latitude.toFixed(6)}</AppText>
                    <AppText style={styles.metadataText}>LON: {location?.coords.longitude.toFixed(6)}</AppText>
                    <AppText style={styles.metadataText}>{timestamp}</AppText>
                    <AppText style={styles.metadataText}>{deviceInfo}</AppText>
                </View>
            </View>
          ) : (
            <View style={styles.placeholderContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="camera" size={40} color={theme.colors.subtext} />
              </View>
              <AppText style={styles.geoText}>GEO CAMERA</AppText>
              <AppText style={styles.timestampText}>{timestamp}</AppText>
              {location && <AppText style={styles.locationText}>GPS Active</AppText>}
            </View>
          )}
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Asset Category</AppText>
            <TouchableOpacity 
                style={styles.dropdownButton} 
                onPress={() => setShowDropdown(true)}
            >
                <AppText style={styles.dropdownText}>{assetCategory}</AppText>
                <Ionicons name="chevron-down" size={20} color={theme.colors.subtext} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Caption</AppText>
            <TextInput
              style={styles.input}
              value={caption}
              onChangeText={setCaption}
              placeholder="Enter a caption"
              placeholderTextColor={theme.colors.subtext}
            />
          </View>

          <View style={styles.inputGroup}>
             <AppButton
                label={isOnline ? "Upload Evidence" : "Save Offline"}
                onPress={handleUpload}
                loading={loading}
               style={styles.uploadButton}
               labelStyle={styles.uploadButtonText}
               tone="secondary"
            />
          </View>
        </View>

      </ScrollView>

      {/* Asset Category Modal */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowDropdown(false)}
        >
            <View style={styles.modalContent}>
                <AppText style={styles.modalTitle}>Select Asset Category</AppText>
                <FlatList
                    data={ASSET_CATEGORIES}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.modalItem}
                            onPress={() => {
                                setAssetCategory(item);
                                setShowDropdown(false);
                            }}
                        >
                            <AppText style={[
                                styles.modalItemText,
                                assetCategory === item && styles.selectedItemText
                            ]}>
                                {item}
                            </AppText>
                            {assetCategory === item && (
                              <Ionicons name="checkmark" size={20} color={theme.colors.secondary} />
                            )}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 200,
      zIndex: 0,
    },
    gradientHeader: {
      flex: 1,
      paddingBottom: 40,
    },
    waveContainer: {
      position: 'absolute',
      bottom: -1,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    wave: {
      width: '100%',
    },
    floatingHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onPrimary,
    },
    backButton: {
      padding: 8,
    },
    scrollContent: {
      paddingTop: 160,
      paddingHorizontal: 24,
      paddingBottom: 40,
      zIndex: 10,
      gap: 32,
    },
    imageCard: {
      width: '100%',
      height: 240,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    previewImage: {
      width: '100%',
      height: '100%',
    },
    metadataOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: 12,
    },
    metadataText: {
      color: theme.colors.onPrimary,
      fontSize: 10,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    placeholderContent: {
      alignItems: 'center',
      gap: 8,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    geoText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    timestampText: {
      fontSize: 14,
      color: theme.colors.subtext,
    },
    locationText: {
      fontSize: 12,
      color: theme.colors.success,
      marginTop: 4,
      fontWeight: '500',
    },
    form: {
      gap: 24,
    },
    inputGroup: {
      gap: 8,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    dropdownButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
    },
    dropdownText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    uploadButton: {
      marginTop: 8,
    },
    uploadButtonText: {
      fontSize: 16,
      fontWeight: '600',
      textTransform: 'none',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: 20,
      maxHeight: '80%',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.colors.text,
    },
    modalItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalItemText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    selectedItemText: {
      color: theme.colors.secondary,
      fontWeight: '600',
    },
  });
