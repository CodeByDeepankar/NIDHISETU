import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/atoms/app-text';
import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import type { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { evidenceRequirementApi, type EvidenceRequirementRecord } from '@/services/api/evidenceRequirements';
import { submissionRepository } from '@/services/api/submissionRepository';
import type { SubmissionEvidence } from '@/types/entities';
import { useAuthStore } from '@/state/authStore';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

const gradient = ['#A7F3D0', '#6EE7B7'] as const;

export const EvidenceTasksScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const beneficiaryId = useAuthStore((s) => s.profile?.id);
  const beneficiaryMobile = useAuthStore((s) => s.profile?.mobile ?? s.mobile);

  const [requirements, setRequirements] = useState<EvidenceRequirementRecord[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionEvidence[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!beneficiaryId && !beneficiaryMobile) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const primaryKey = beneficiaryId || beneficiaryMobile || '';
        const [primaryReq, primarySub] = await Promise.all([
          primaryKey ? evidenceRequirementApi.list(primaryKey) : [],
          primaryKey ? submissionRepository.listByBeneficiary(primaryKey) : []
        ]);
        
        if (!active) return;
        
        let foundReq = primaryReq;
        let foundSub = primarySub;

        if (!primaryReq.length && beneficiaryMobile && beneficiaryMobile !== primaryKey) {
          const fallbackReq = await evidenceRequirementApi.list(beneficiaryMobile);
          // submissions are bound to the specific ID usually, but maybe fallback too?
          // For safety, let's just stick to requirements fallback logic for now
          // or assume submission fetch via primaryKey is sufficient
           if (!active) return;
           foundReq = fallbackReq;
        }
        setRequirements(foundReq);
        setSubmissions(foundSub);
      } catch (err) {
        console.error('Load evidence tasks failed', err);
        if (active) Alert.alert('Error', 'Unable to load evidence tasks');
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
        <LinearGradient colors={gradient} style={styles.gradientHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
      </View>

      <SafeAreaView edges={["top"]} style={styles.floatingHeader}>
        <View style={styles.headerContent}>
          <AppButton label="Back" variant="ghost" icon="arrow-left" onPress={() => navigation.goBack()} />
          <AppText style={styles.headerTitle}>Evidence Tasks</AppText>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <AppText variant="titleMedium" color="text">Officer-assigned evidence</AppText>
          <AppText variant="bodyMedium" color="muted">Select a task and upload as per the allowed sources.</AppText>
        </View>

        {loading ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <AppText variant="labelMedium" color="muted">Loading tasks...</AppText>
          </View>
        ) : requirements.length === 0 ? (
          <AppText variant="bodyMedium" color="muted">No evidence tasks available.</AppText>
        ) : (
          requirements.map((req) => {
            const submission = submissions.find(s => s.requirementId === req.id);
            return (
            <TouchableOpacity 
              key={req.id} 
              style={[styles.card, { borderColor: theme.colors.border }]}
              disabled={req.status !== 'submitted' || !submission}
              onPress={() => {
                if (submission) {
                  navigation.navigate('SubmissionDetail', { submission });
                }
              }}
              activeOpacity={0.7}
            > 
              <View style={styles.cardHeader}>
                <AppIcon name="clipboard-text-outline" size={20} color={theme.colors.secondary} />
                <View style={{ flex: 1 }}>
                  <AppText variant="titleSmall" color="text">{req.label}</AppText>
                  {req.instructions ? (
                    <AppText variant="labelSmall" color="muted" numberOfLines={2}>{req.instructions}</AppText>
                  ) : null}
                  <View style={styles.metaRow}>
                    <AppText variant="labelSmall" color="muted">Camera: {req.permissions?.camera === false ? 'Disabled' : 'Allowed'}</AppText>
                    <AppText variant="labelSmall" color="muted">Files: {req.permissions?.fileUpload === false ? 'Disabled' : 'Allowed'}</AppText>
                  </View>
                  <View style={styles.metaRow}>
                    {req.response_type ? (
                      <AppText variant="labelSmall" color="muted">Type: {req.response_type}</AppText>
                    ) : null}
                    {req.model ? (
                      <AppText variant="labelSmall" color="muted">Model: {req.model}</AppText>
                    ) : null}
                    {req.image_quality ? (
                      <AppText variant="labelSmall" color="muted">Quality: {req.image_quality}</AppText>
                    ) : null}
                  </View>
                </View>
              </View>
              {submission ? (
                <AppButton
                  label="Pending for Review"
                  tone="secondary"
                  icon="clock-check-outline"
                  disabled
                  style={styles.uploadButton}
                />
              ) : (
                <AppButton
                  label="Upload"
                  tone="secondary"
                  icon="cloud-upload-outline"
                  onPress={() => handleUploadPress(req)}
                  style={styles.uploadButton}
                />
              )}
            </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, zIndex: 0 },
    gradientHeader: { flex: 1, paddingBottom: 40 },
    floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.onPrimary },
    scrollContent: { paddingTop: 160, paddingHorizontal: 24, paddingBottom: 40, gap: 16 },
    sectionHeader: { gap: 6 },
    loaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
    card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10, backgroundColor: theme.colors.surface },
    cardHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
    metaRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginTop: 4 },
    uploadButton: { alignSelf: 'flex-end', marginTop: 6 },
  });
