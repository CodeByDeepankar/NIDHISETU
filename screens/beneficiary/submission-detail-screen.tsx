import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { WaveHeader } from '@/components/molecules/wave-header';
import { submissionRepository } from '@/services/api/submissionRepository';
import type { SubmissionEvidence } from '@/types/entities';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppTheme } from '@/constants/theme';

export const SubmissionDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { submission } = route.params as { submission: SubmissionEvidence };
  const [currentSubmission, setCurrentSubmission] = useState(submission);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleAnalyze = async () => {
    if (!currentSubmission.mediaUrl) {
      Alert.alert('Error', 'No image available to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
      const API_URL = `http://${host}:3000`;
      
      const response = await fetch(`${API_URL}/api/analyze-evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: currentSubmission.mediaUrl }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const aiAnalysis = await response.json();
      
      // Update in DB
      await submissionRepository.updateAIAnalysis(currentSubmission.id, aiAnalysis);
      
      // Update local state
      setCurrentSubmission(prev => ({ ...prev, aiAnalysis }));
      
      Alert.alert('Success', 'AI Analysis completed');
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'rejected':
        return theme.colors.error;
      case 'correction_needed':
        return theme.colors.warning;
      default:
        return theme.colors.subtext;
    }
  };

  const DetailRow = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
    <View style={styles.row}>
      <AppText style={styles.label}>{label}</AppText>
      <AppText style={styles.value}>{value ?? 'N/A'}</AppText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WaveHeader title="Submission Details" onBack={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Image 
          source={{ uri: currentSubmission.mediaUrl || currentSubmission.thumbnailUrl || 'https://placehold.co/600x400/png' }} 
          style={styles.image} 
          resizeMode="cover" 
        />

        <View style={styles.card}>
          <View style={styles.headerRow}>
            <AppText style={styles.title}>{currentSubmission.assetName}</AppText>
            <View style={[styles.badge, { backgroundColor: `${getStatusColor(currentSubmission.status)}20` }]}
            >
              <AppText style={[styles.statusText, { color: getStatusColor(currentSubmission.status) }]}>
                {currentSubmission.status.toUpperCase()}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          <DetailRow label="Captured At" value={new Date(currentSubmission.capturedAt).toLocaleString()} />
          <DetailRow label="Submitted At" value={currentSubmission.submittedAt ? new Date(currentSubmission.submittedAt).toLocaleString() : 'Pending Sync'} />
          
          <View style={styles.divider} />
          
          <AppText style={styles.sectionHeader}>Location Details</AppText>
          <DetailRow label="Latitude" value={currentSubmission.location?.latitude?.toFixed(6)} />
          <DetailRow label="Longitude" value={currentSubmission.location?.longitude?.toFixed(6)} />

          <View style={styles.divider} />

          <AppText style={styles.sectionHeader}>AI Detect</AppText>
          {currentSubmission.aiAnalysis ? (
            <>
              <DetailRow label="Object" value={currentSubmission.aiAnalysis.object} />
              <DetailRow label="Secondary Objects" value={currentSubmission.aiAnalysis.secondary_objects} />
              <DetailRow label="Image Quality" value={currentSubmission.aiAnalysis.image_quality_check} />
              <DetailRow label="Document Check" value={currentSubmission.aiAnalysis.document_check} />
              <DetailRow label="Geo/Time Check" value={currentSubmission.aiAnalysis.geo_timestamp_check} />
              <DetailRow label="Compliance" value={currentSubmission.aiAnalysis.compliance_status} />
              <DetailRow label="AI Remarks" value={currentSubmission.aiAnalysis.remarks} />
            </>
          ) : (
            <View>
              <AppText style={[styles.remarks, { marginBottom: 10 }]}>AI analysis pending or not available.</AppText>
              <AppButton 
                label="Analyze with AI" 
                onPress={handleAnalyze} 
                loading={isAnalyzing}
                disabled={isAnalyzing}
              />
            </View>
          )}

          {currentSubmission.remarks && (
            <>
              <View style={styles.divider} />
              <AppText style={styles.sectionHeader}>Remarks</AppText>
              <AppText style={styles.remarks}>{currentSubmission.remarks}</AppText>
            </>
          )}

          {currentSubmission.rejectionReason && (
            <>
              <View style={styles.divider} />
              <AppText style={[styles.sectionHeader, { color: theme.colors.error }]}>Rejection Reason</AppText>
              <AppText style={[styles.remarks, { color: theme.colors.error }]}>{currentSubmission.rejectionReason}</AppText>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 20,
      paddingTop: 80,
    },
    image: {
      width: '100%',
      height: 250,
      borderRadius: 16,
      marginBottom: 20,
      backgroundColor: theme.colors.surfaceVariant,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginVertical: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      color: theme.colors.subtext,
    },
    value: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      textAlign: 'right',
      flex: 1,
      marginLeft: 16,
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    remarks: {
      fontSize: 14,
      color: theme.colors.subtext,
      fontStyle: 'italic',
      lineHeight: 20,
    },
  });
