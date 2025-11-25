import {
    createDrawerNavigator,
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList
} from '@react-navigation/drawer';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { MobileInputScreen } from '@/screens/auth/mobile-input-screen';
import { OnboardingScreen } from '@/screens/auth/onboarding-screen';
import { OtpVerificationScreen } from '@/screens/auth/otp-verification-screen';
import { WelcomeScreen } from '@/screens/auth/welcome-screen';
import { BeneficiaryDashboardScreen } from '@/screens/beneficiary/dashboard-screen';
import { BeneficiaryLoanAssistantScreen } from '@/screens/beneficiary/loan-assistant-screen';
import { LoanDetailsScreen } from '@/screens/beneficiary/loan-details-screen';
import { LoanEvidenceCameraScreen } from '@/screens/beneficiary/loan-evidence-camera-screen';
import { PreviousSubmissionsScreen } from '@/screens/beneficiary/previous-submissions-screen';
import { BeneficiaryProfileScreen } from '@/screens/beneficiary/profile-screen';
import { SyncStatusScreen } from '@/screens/beneficiary/sync-status-screen';
import { UploadEvidenceScreen } from '@/screens/beneficiary/upload-evidence-screen';
import { BeneficiaryFormScreen } from '@/screens/officer/beneficiary-form-screen';
import { BeneficiaryListScreen } from '@/screens/officer/beneficiary-list-screen';
import { OfficerDashboardScreen } from '@/screens/officer/dashboard-screen';
import { ReviewerDashboardScreen } from '@/screens/reviewer/dashboard-screen';
import { ReviewDetailScreen } from '@/screens/reviewer/review-detail-screen';
import { ReviewerSubmissionListScreen } from '@/screens/reviewer/submission-list-screen';
import { useAuthStore } from '@/state/authStore';
import type {
    AuthStackParamList,
    BeneficiaryDrawerParamList,
    OfficerStackParamList,
    ReviewerStackParamList,
    RootStackParamList,
} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const BeneficiaryDrawer = createDrawerNavigator<BeneficiaryDrawerParamList>();
const OfficerDrawer = createDrawerNavigator<OfficerStackParamList>();
const ReviewerStack = createNativeStackNavigator<ReviewerStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="MobileInput" component={MobileInputScreen} />
    <AuthStack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
  </AuthStack.Navigator>
);

const beneficiaryIconMap = {
  BeneficiaryDashboard: 'view-dashboard',
  UploadEvidence: 'camera',
  PreviousSubmissions: 'history',
  SyncStatus: 'cloud-sync',
  BeneficiaryProfile: 'account-circle',
  LoanAssistant: 'robot-happy-outline',
} as const;

const BeneficiaryNavigator = () => {
  const theme = useAppTheme();
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.actions.logout);

  return (
    <BeneficiaryDrawer.Navigator
      screenOptions={({ route, navigation }) => ({
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.muted,
        drawerStyle: { backgroundColor: theme.colors.card },
        sceneContainerStyle: { backgroundColor: theme.colors.background },
        headerLeft: () => (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open navigation"
            style={[drawerStyles.menuButton, { borderColor: theme.colors.border }]}
            onPress={() => navigation.toggleDrawer()}
          >
            <AppIcon name="menu" size={22} color="text" />
          </TouchableOpacity>
        ),
        drawerIcon: ({ color, size }) => (
          <AppIcon
            name={beneficiaryIconMap[route.name as keyof typeof beneficiaryIconMap] ?? 'folder'}
            size={size}
            color={color}
          />
        ),
      })}
      drawerContent={(props) => (
        <BeneficiaryDrawerContent
          {...props}
          beneficiaryName={profile?.name ?? 'Beneficiary'}
          beneficiaryVillage={profile?.village}
          onLogout={logout}
        />
      )}
    >
      <BeneficiaryDrawer.Screen name="BeneficiaryDashboard" component={BeneficiaryDashboardScreen} options={{ title: 'Dashboard' }} />
      <BeneficiaryDrawer.Screen name="UploadEvidence" component={UploadEvidenceScreen} options={{ title: 'Upload Evidence' }} />
      <BeneficiaryDrawer.Screen name="PreviousSubmissions" component={PreviousSubmissionsScreen} options={{ title: 'Submissions' }} />
      <BeneficiaryDrawer.Screen name="SyncStatus" component={SyncStatusScreen} options={{ title: 'Sync Status' }} />
      <BeneficiaryDrawer.Screen name="BeneficiaryProfile" component={BeneficiaryProfileScreen} options={{ title: 'Profile' }} />
      <BeneficiaryDrawer.Screen name="LoanAssistant" component={BeneficiaryLoanAssistantScreen} options={{ title: 'Loan Copilot' }} />
        <BeneficiaryDrawer.Screen name="LoanDetails" component={LoanDetailsScreen} options={{ title: 'Loan Details', drawerItemStyle: { display: 'none' } }} />
        <BeneficiaryDrawer.Screen
          name="LoanEvidenceCamera"
          component={LoanEvidenceCameraScreen}
          options={{
            title: 'Capture Evidence',
            drawerItemStyle: { display: 'none' },
            headerShown: false,
          }}
        />
    </BeneficiaryDrawer.Navigator>
  );
};

const officerIconMap = {
  OfficerDashboard: 'view-dashboard',
  Beneficiaries: 'account-group',
  BeneficiaryForm: 'account-plus',
  VerificationTasks: 'playlist-check',
  Reports: 'chart-box',
  Notifications: 'bell',
  Profile: 'account-circle',
  Settings: 'cog',
  Support: 'lifebuoy',
} as const;

const OfficerNavigator = () => {
  const theme = useAppTheme();
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.actions.logout);

  return (
    <OfficerDrawer.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.muted,
        drawerStyle: { backgroundColor: theme.colors.card },
        sceneContainerStyle: { backgroundColor: theme.colors.background },
        drawerIcon: ({ color, size }) => (
          <AppIcon
            name={officerIconMap[route.name as keyof typeof officerIconMap] ?? 'folder'}
            size={size}
            color={color}
          />
        ),
      })}
      drawerContent={(props) => (
        <OfficerDrawerContent
          {...props}
          officerName={profile?.name ?? 'Officer'}
          officerMobile={profile?.mobile}
          onLogout={logout}
        />
      )}
    >
      <OfficerDrawer.Screen name="OfficerDashboard" component={OfficerDashboardScreen} options={{ title: 'Dashboard' }} />
      <OfficerDrawer.Screen name="Beneficiaries" component={BeneficiaryListScreen} options={{ title: 'Beneficiaries' }} />
      <OfficerDrawer.Screen name="BeneficiaryForm" component={BeneficiaryFormScreen} options={{ title: 'Add Beneficiary' }} />
      <OfficerDrawer.Screen
        name="VerificationTasks"
        component={require('@/screens/officer/verification-tasks-screen').VerificationTasksScreen}
        options={{ title: 'Verification Tasks' }}
      />
      <OfficerDrawer.Screen
        name="Reports"
        component={require('@/screens/officer/reports-screen').ReportsScreen}
        options={{ title: 'Reports' }}
      />
      <OfficerDrawer.Screen
        name="Notifications"
        component={require('@/screens/officer/notifications-screen').NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <OfficerDrawer.Screen
        name="Profile"
        component={require('@/screens/officer/profile-screen').ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <OfficerDrawer.Screen
        name="Settings"
        component={require('@/screens/officer/settings-screen').SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <OfficerDrawer.Screen
        name="Support"
        component={require('@/screens/officer/support-screen').SupportScreen}
        options={{ title: 'Support' }}
      />
    </OfficerDrawer.Navigator>
  );
};

const ReviewerNavigator = () => (
  <ReviewerStack.Navigator>
    <ReviewerStack.Screen name="ReviewerDashboard" component={ReviewerDashboardScreen} options={{ headerShown: false }} />
    <ReviewerStack.Screen name="ReviewerSubmissions" component={ReviewerSubmissionListScreen} options={{ title: 'Submissions' }} />
    <ReviewerStack.Screen name="ReviewDetail" component={ReviewDetailScreen} options={{ title: 'Evidence Detail' }} />
  </ReviewerStack.Navigator>
);

type OfficerDrawerContentProps = DrawerContentComponentProps & {
  officerName: string;
  officerMobile?: string;
  onLogout: () => void;
};

type BeneficiaryDrawerContentProps = DrawerContentComponentProps & {
  beneficiaryName: string;
  beneficiaryVillage?: string;
  onLogout: () => void;
};

const BeneficiaryDrawerContent = ({ beneficiaryName, beneficiaryVillage, onLogout, ...props }: BeneficiaryDrawerContentProps) => {
  const theme = useAppTheme();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          props.navigation.closeDrawer();
          onLogout();
        },
      },
    ]);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={drawerStyles.content}>
      <View style={[drawerStyles.header, { backgroundColor: theme.colors.surface }]}>
        <AppIcon name="account-circle" size={36} color="primary" />
        <View style={{ flex: 1 }}>
          <AppText variant="titleMedium" color="text">
            {beneficiaryName}
          </AppText>
          {beneficiaryVillage ? (
            <AppText variant="labelSmall" color="muted">
              {beneficiaryVillage}
            </AppText>
          ) : null}
        </View>
      </View>
      <View style={drawerStyles.listWrapper}>
        <DrawerItemList {...props} />
      </View>
      <DrawerItem
        label="Logout"
        icon={({ color, size }) => <AppIcon name="logout" size={size} color={color} />}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
};

const OfficerDrawerContent = ({ officerName, officerMobile, onLogout, ...props }: OfficerDrawerContentProps) => {
  const theme = useAppTheme();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          props.navigation.closeDrawer();
          onLogout();
        },
      },
    ]);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={drawerStyles.content}>
      <View style={[drawerStyles.header, { backgroundColor: theme.colors.surface }]}>
        <AppIcon name="shield-account" size={36} color="primary" />
        <View style={{ flex: 1 }}>
          <AppText variant="titleMedium" color="text">
            {officerName}
          </AppText>
          {officerMobile ? (
            <AppText variant="labelSmall" color="muted">
              {officerMobile}
            </AppText>
          ) : null}
        </View>
      </View>
      <View style={drawerStyles.listWrapper}>
        <DrawerItemList {...props} />
      </View>
      <DrawerItem
        label="Logout"
        icon={({ color, size }) => <AppIcon name="logout" size={size} color={color} />}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
};

const drawerStyles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listWrapper: {
    flexGrow: 1,
    paddingTop: 8,
  },
});

export const AppNavigator = () => {
  const { isAuthenticated, onboardingComplete, role } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    onboardingComplete: state.onboardingComplete,
    role: state.role,
  }));
  const theme = useAppTheme();

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: theme.colors.background,
        card: theme.colors.card,
        text: theme.colors.text,
        primary: theme.colors.primary,
        border: theme.colors.border,
      },
    }),
    [theme]
  );

  const AppFlow = role === 'officer' ? OfficerNavigator : role === 'reviewer' ? ReviewerNavigator : BeneficiaryNavigator;

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="AuthFlow" component={AuthNavigator} />
        ) : !onboardingComplete ? (
          <RootStack.Screen name="AuthFlow" component={AuthNavigator} />
        ) : (
          <RootStack.Screen name="AppFlow" component={AppFlow} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
