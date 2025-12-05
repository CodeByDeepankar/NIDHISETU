import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useT } from 'lingo.dev/react';

import { AppText } from '@/components/atoms/app-text';
import { SubmissionList } from '@/components/organisms/submission-list';
import { useSubmissions } from '@/hooks/use-submissions';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppTheme } from '@/constants/theme';
import type { BeneficiaryDrawerParamList } from '@/navigation/types';
import type { SubmissionEvidence } from '@/types/entities';

export type PreviousSubmissionsScreenProps = NativeStackScreenProps<BeneficiaryDrawerParamList, 'PreviousSubmissions'>;

export const PreviousSubmissionsScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<BeneficiaryDrawerParamList>>();
  const { submissions, refresh, isLoading } = useSubmissions();
  const t = useT();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
          <Ionicons name="menu" size={24} color={theme.colors.icon} />
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    menuButton: {
      padding: 8,
      marginLeft: -8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 100,
    },
  });
