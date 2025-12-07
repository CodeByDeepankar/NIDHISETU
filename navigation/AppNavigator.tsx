import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
import { useT } from 'lingo.dev/react';

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
import { EditProfileScreen } from '@/screens/beneficiary/edit-profile-screen';
import { EmiCalculatorScreen } from '@/screens/beneficiary/emi-calculator-screen';
import { SubsidyCalculatorScreen } from '@/screens/beneficiary/subsidy-calculator-screen';
import { EligibilityPredictionScreen } from '@/screens/beneficiary/eligibility-prediction-screen';
import { NotificationsScreen } from '@/screens/beneficiary/notifications-screen';
import { ContactOfficerScreen } from '@/screens/beneficiary/contact-officer-screen';
import { SyncStatusScreen } from '@/screens/beneficiary/sync-status-screen';
import { UploadEvidenceScreen } from '@/screens/beneficiary/upload-evidence-screen';
import { SubmissionDetailScreen } from '@/screens/beneficiary/submission-detail-screen';
import { BeneficiaryFormScreen } from '@/screens/officer/beneficiary-form-screen';
import { BeneficiaryListScreen } from '@/screens/officer/beneficiary-list-screen';
import { OfficerDashboardScreen } from '@/screens/officer/dashboard-screen';
import { VerificationDetailScreen } from '@/screens/officer/verification-detail-screen';
import { OfficerSubmissionDetailScreen } from '@/screens/officer/officer-submission-detail-screen';
import { VerificationTasksScreen } from '@/screens/officer/verification-tasks-screen';
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
const BeneficiaryStack = createNativeStackNavigator<BeneficiaryDrawerParamList>();
const OfficerDrawer = createDrawerNavigator<OfficerStackParamList>();
const OfficerStack = createNativeStackNavigator<OfficerStackParamList>();
const ReviewerStack = createNativeStackNavigator<ReviewerStackParamList>();
const Tab = createBottomTabNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="MobileInput" component={MobileInputScreen} />
    <AuthStack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
  </AuthStack.Navigator>
);

const BeneficiaryTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: '#ffffff',
          borderRadius: 35,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderTopWidth: 0,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarItemStyle: {
          height: 70,
          padding: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen
        name="Home"
        component={BeneficiaryDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <AppIcon name="home" size={32} color={color} />,
        }}
      />
      <Tab.Screen
        name="NIDHIMITRA"
        component={BeneficiaryLoanAssistantScreen}
        options={{
          tabBarIcon: ({ color }) => <AppIcon name="robot" size={32} color={color} />,
        }}
      />
      <Tab.Screen
        name="UploadEvidence"
        component={UploadEvidenceScreen}
        options={{
          tabBarIcon: ({ color }) => <AppIcon name="hand-coin" size={32} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={BeneficiaryProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <AppIcon name="chart-pie" size={32} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const beneficiaryIconMap = {
  BeneficiaryDashboard: 'view-dashboard',
  UploadEvidence: 'camera',
  PreviousSubmissions: 'history',
  SyncStatus: 'cloud-sync',
  BeneficiaryProfile: 'account-circle',
  LoanAssistant: 'robot-happy-outline',
} as const;

const BeneficiaryDrawerNavigator = () => {
  const theme = useAppTheme();
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.actions.logout);
  const t = useT();

  return (
    <BeneficiaryDrawer.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: false,
        drawerActiveTintColor: '#FFFFFF',
        drawerInactiveTintColor: '#E9D5FF',
        drawerStyle: { backgroundColor: '#7C3AED', width: '80%' },
        sceneContainerStyle: { backgroundColor: theme.colors.background },
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
          beneficiaryVillage={profile?.role === 'beneficiary' ? profile.village : undefined}
          onLogout={logout}
        />
      )}
    >
      <BeneficiaryDrawer.Screen
        name="BeneficiaryDashboard"
        component={BeneficiaryTabNavigator}
        options={{ title: t('Dashboard'), drawerIcon: ({color}) => <AppIcon name="view-dashboard" size={24} color={color} /> }}
      />
      <BeneficiaryDrawer.Screen
        name="BeneficiaryProfile"
        component={BeneficiaryProfileScreen}
        options={{ title: t('Profile'), drawerIcon: ({color}) => <AppIcon name="account" size={24} color={color} /> }}
      />
      <BeneficiaryDrawer.Screen
        name="PreviousSubmissions"
        component={PreviousSubmissionsScreen}
        options={{ title: t('My Submissions'), drawerIcon: ({color}) => <AppIcon name="history" size={24} color={color} /> }}
      />
      <BeneficiaryDrawer.Screen
        name="SyncStatus"
        component={SyncStatusScreen}
        options={{ title: t('Download'), drawerIcon: ({color}) => <AppIcon name="download" size={24} color={color} /> }}
      />
      <BeneficiaryDrawer.Screen
        name="LoanAssistant"
        component={BeneficiaryLoanAssistantScreen}
        options={{ title: t('Support'), drawerIcon: ({color}) => <AppIcon name="lifebuoy" size={24} color={color} /> }}
      />
      <BeneficiaryDrawer.Screen
        name="LoanDetails"
        component={LoanDetailsScreen}
        options={{ title: t('Settings'), drawerIcon: ({color}) => <AppIcon name="cog" size={24} color={color} /> }}
      />
    </BeneficiaryDrawer.Navigator>
  );
};

const BeneficiaryNavigator = () => {
  return (
    <BeneficiaryStack.Navigator screenOptions={{ headerShown: false }}>
      <BeneficiaryStack.Screen name="BeneficiaryRoot" component={BeneficiaryDrawerNavigator} />
      <BeneficiaryStack.Screen name="SubmissionDetail" component={SubmissionDetailScreen} />
      <BeneficiaryStack.Screen name="LoanEvidenceCamera" component={LoanEvidenceCameraScreen} />
      <BeneficiaryStack.Screen name="EditProfile" component={EditProfileScreen} />
      <BeneficiaryStack.Screen name="EmiCalculator" component={EmiCalculatorScreen} />
      <BeneficiaryStack.Screen name="SubsidyCalculator" component={SubsidyCalculatorScreen} />
      <BeneficiaryStack.Screen name="EligibilityPrediction" component={EligibilityPredictionScreen} />
      <BeneficiaryStack.Screen name="Notifications" component={NotificationsScreen} />
      <BeneficiaryStack.Screen name="ContactOfficer" component={ContactOfficerScreen} />
    </BeneficiaryStack.Navigator>
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

const OfficerDrawerNavigator = () => {
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
        component={VerificationTasksScreen}
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

const OfficerNavigator = () => {
  return (
    <OfficerStack.Navigator screenOptions={{ headerShown: false }}>
      <OfficerStack.Screen name="OfficerRoot" component={OfficerDrawerNavigator} />
      <OfficerStack.Screen name="VerificationDetail" component={VerificationDetailScreen} />
      <OfficerStack.Screen name="OfficerSubmissionDetail" component={OfficerSubmissionDetailScreen} />
    </OfficerStack.Navigator>
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
  const t = useT();

  const handleLogout = () => {
    Alert.alert(t('Logout'), t('Are you sure you want to sign out?'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Logout'),
        style: 'destructive',
        onPress: () => {
          props.navigation.closeDrawer();
          onLogout();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#7C3AED' }}>
      <View style={{ padding: 24, paddingTop: 60 }}>
        <AppText style={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' }}>NIDHISETU</AppText>
      </View>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={{ padding: 24, paddingBottom: 40 }}>
        <TouchableOpacity onPress={handleLogout} style={{ alignSelf: 'flex-end', backgroundColor: '#333', padding: 12, borderRadius: 30 }}>
          <AppIcon name="power" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
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
