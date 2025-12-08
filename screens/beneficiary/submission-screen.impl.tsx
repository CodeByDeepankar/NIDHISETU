import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/atoms/app-button';
import { AppIcon, type IconName } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import type { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { evidenceRequirementApi, type EvidenceRequirementRecord } from '@/services/api/evidenceRequirements';
import { useAuthStore } from '@/state/authStore';

const { width } = Dimensions.get('window');

export type SubmissionScreenProps = {
  navigation: { goBack: () => void; navigate: (screen: string, params?: any) => void };
};

export const SubmissionScreen = ({ navigation }: SubmissionScreenProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const beneficiaryId = useAuthStore((s) => s.profile?.id);
  const beneficiaryMobile = useAuthStore((s) => s.profile?.mobile ?? s.mobile);
  const [requirements, setRequirements] = useState<EvidenceRequirementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const gradientColors = useMemo<readonly [string, string, ...string[]]>(
    () => (theme.mode === 'dark' ? [theme.colors.gradientStart, theme.colors.gradientEnd] : ['#A7F3D0', '#6EE7B7']),
    [theme]
  );

  useEffect(() => {
    if (!beneficiaryId && !beneficiaryMobile) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const primaryKey = beneficiaryId || beneficiaryMobile || '';
        const primary = primaryKey ? await evidenceRequirementApi.list(primaryKey) : [];
        if (!active) return;

        if (primary.length) {
          setRequirements(primary);
          return;
        }

        if (beneficiaryMobile && beneficiaryMobile !== primaryKey) {
          const fallback = await evidenceRequirementApi.list(beneficiaryMobile);
          if (!active) return;
          setRequirements(fallback);
          return;
        }

        setRequirements([]);
      } catch (err) {
        console.error('Load requirements failed', err);
        if (active) Alert.alert('Error', 'Unable to load requirements');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [beneficiaryId, beneficiaryMobile]);

  const handleUploadPress = (req: EvidenceRequirementRecord) => {
    const allowCamera = req.permissions?.camera !== false;
    const allowFiles = req.permissions?.fileUpload !== false;

    if (!allowCamera && !allowFiles) {
      Alert.alert('Not Allowed', 'Uploads are disabled for this requirement.');
      return;
    }

    const goCamera = () => navigation.navigate('UploadEvidence', { requirementId: req.id, requirementName: req.label, startWithLibrary: false });
    const goFiles = () => navigation.navigate('UploadEvidence', { requirementId: req.id, requirementName: req.label, startWithLibrary: true });

    if (allowCamera && allowFiles) {
      Alert.alert('Choose source', 'Select how you want to upload', [
        { text: 'Camera', onPress: goCamera },
        { text: 'Files', onPress: goFiles },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (allowCamera) {
      goCamera();
      return;
    }

    if (allowFiles) {
      goFiles();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient colors={gradientColors} style={styles.gradientHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        <View style={styles.waveContainer}>
          <Svg height="100" width={width} viewBox="0 0 1440 320" style={styles.wave}>
            <Path
              fill={theme.colors.background}
              d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,176C672,160,768,160,864,176C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L0,320Z"
            />
          </Svg>
        </View>
      </View>

      <SafeAreaView edges={["top"]} style={styles.floatingHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.onPrimary} />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>Submission</AppText>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <View style={styles.headingRow}>
            <AppIcon name="cloud-upload-outline" size={22} color={theme.colors.secondary} style={styles.headingIcon} />
            <AppText variant="titleMedium" color="text" style={styles.headingText}>Upload Evidence</AppText>
          </View>
          <AppText variant="bodyMedium" color="muted">
            Pick a source and add proof for each category below.
          </AppText>
        </View>

        {loading ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <AppText variant="labelMedium" color="muted">Loading requirements...</AppText>
          </View>
        ) : requirements.length === 0 ? (
          <AppText variant="bodyMedium" color="muted">No requirements available.</AppText>
        ) : (
          requirements.map((req) => (
            <View
              key={req.id}
              style={[styles.uploadCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <View style={styles.iconBadge}>
                <AppIcon name="cloud-upload-outline" size={22} color={theme.colors.secondary} />
              </View>

              <View style={styles.cardBody}>
                <AppText variant="titleSmall" color="text">{req.label}</AppText>
                <AppText variant="labelSmall" color="muted">Upload required evidence</AppText>
                <View style={styles.permissionRow}>
                  <AppText variant="labelSmall" color="muted">
                    Camera: {req.permissions?.camera === false ? 'Disabled' : 'Allowed'}
                  </AppText>
                  <AppText variant="labelSmall" color="muted">
                    Files: {req.permissions?.fileUpload === false ? 'Disabled' : 'Allowed'}
                  </AppText>
                </View>
              </View>

              {req.status === 'submitted' ? (
                <AppButton
                  label="Pending for Review"
                  tone="secondary"
                  disabled
                  style={styles.uploadButton}
                />
              ) : (
                <AppButton
                  label="Upload"
                  tone="secondary"
                  onPress={() => handleUploadPress(req)}
                  style={styles.uploadButton}
                />
              )}
            </View>
          ))
        )}
      </ScrollView>
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
      overflow: 'hidden',
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
      headingIcon: {
        textShadowColor: 'rgba(0,0,0,0.08)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    headingText: {
      fontWeight: '700',
      letterSpacing: 0.3,
      textDecorationLine: 'none',
      textDecorationColor: 'transparent',
      textDecorationStyle: 'solid',
      textShadowColor: 'rgba(0,0,0,0.08)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    uploadCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.mode === 'dark' ? 0.18 : 0.06,
      shadowRadius: 6,
      elevation: theme.mode === 'dark' ? 1 : 3,
      gap: 12,
    },
    iconBadge: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardBody: {
      flex: 1,
      gap: 2,
    },
    uploadButton: {
      minWidth: 108,
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 6,
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
    sectionHeader: {
      paddingHorizontal: 4,
      marginTop: 20,
      marginBottom: 24,
      gap: 6,
    },
    headingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 6,
    },
    permissionRow: {
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap',
      marginTop: 4,
    },
    loaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
    },
  });
