import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/atoms/app-button';
import { OfflineStatusBanner } from '@/components/molecules/offline-status-banner';
import { OfficerDashboardHeader } from '@/components/organisms/officer-dashboard-header';
import { OfficerMapPreview } from '@/components/organisms/officer-map-preview';
import { OfficerQuickActions } from '@/components/organisms/officer-quick-actions';
import { OfficerRecentActivity } from '@/components/organisms/officer-recent-activity';
import { OfficerTaskOverview } from '@/components/organisms/officer-task-overview';
import { OfficerWorkList } from '@/components/organisms/officer-work-list';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useOfficerBeneficiaries } from '@/hooks/use-officer-beneficiaries';
import type { OfficerStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/state/authStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type OfficerDashboardScreenProps = NativeStackScreenProps<OfficerStackParamList, 'OfficerDashboard'>;

export const OfficerDashboardScreen = ({ navigation }: OfficerDashboardScreenProps) => {
  const theme = useAppTheme();
  const { loans, analytics, isLoading, isRefreshing, refresh } = useOfficerBeneficiaries();
  const profile = useAuthStore((state) => state.profile);
  const officerName = profile?.name ?? 'Officer';

  // Mock offline status for demo
  const isOffline = false;

  const handleRefresh = async () => {
    await refresh();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <OfficerDashboardHeader
          name={officerName}
          notificationCount={3}
          onPressNotifications={() => navigation.navigate('Notifications')}
          onPressProfile={() => navigation.navigate('Profile')}
        />

        <OfflineStatusBanner isOffline={isOffline} />

        <View style={styles.section}>
          <OfficerQuickActions
            onAddBeneficiary={() => navigation.navigate('BeneficiaryForm')}
            onTodaysVisits={() => {}}
            onPendingVerification={() => navigation.navigate('VerificationTasks')}
            onOpenMap={() => {}}
          />
        </View>

        <View style={styles.section}>
          <OfficerTaskOverview stats={analytics} />
        </View>

        <View style={styles.section}>
          <OfficerWorkList
            beneficiaries={loans.slice(0, 5)}
            onStartVerification={(id) => console.log('Start verification', id)}
          />
        </View>

        <View style={styles.section}>
          <OfficerMapPreview onExpand={() => {}} />
        </View>

        <View style={styles.section}>
          <OfficerRecentActivity />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.fabContainer}>
        <AppButton
          label="Support"
          icon="lifebuoy"
          onPress={() => navigation.navigate('Support')}
          style={[styles.fab, { backgroundColor: theme.colors.secondary, shadowColor: theme.colors.secondary }]}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  section: {
    marginTop: 24,
  },
  bottomSpacer: {
    height: 40,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
  },
  fab: {
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 20,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
