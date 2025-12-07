import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useT } from 'lingo.dev/react';

import { AppText } from '@/components/atoms/app-text';
import { SubmissionList } from '@/components/organisms/submission-list';
import { useSubmissions } from '@/hooks/use-submissions';
import type { BeneficiaryDrawerParamList } from '@/navigation/types';
import type { SubmissionEvidence } from '@/types/entities';

export type PreviousSubmissionsScreenProps = NativeStackScreenProps<BeneficiaryDrawerParamList, 'PreviousSubmissions'>;

export const PreviousSubmissionsScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<BeneficiaryDrawerParamList>>();
  const { submissions, refresh, isLoading } = useSubmissions();
  const t = useT();

  const handleRetry = (submission: SubmissionEvidence) => {
    navigation.navigate('UploadEvidence', {
      requirementId: submission.assetName,
      requirementName: submission.assetName,
    });
  };

  const handleView = (submission: SubmissionEvidence) => {
    navigation.navigate('SubmissionDetail', { submission });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#1F2937" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>{t('My Submissions')}</AppText>
        <View style={{ width: 40 }} />
      </View>

      <SubmissionList
        submissions={submissions}
        refreshing={isLoading}
        onRefresh={() => {
          void refresh();
        }}
        onPressRetry={handleRetry}
        onPressView={handleView}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  menuButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
});
