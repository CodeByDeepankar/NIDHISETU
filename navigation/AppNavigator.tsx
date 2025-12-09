import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    createDrawerNavigator,
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useT } from 'lingo.dev/react';
import { useMemo } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import type { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { EnterPinScreen } from '@/screens/auth/EnterPinScreen';
import { MobileInputScreen } from '@/screens/auth/mobile-input-screen';
import { OnboardingScreen } from '@/screens/auth/onboarding-screen';
import { OtpVerificationScreen } from '@/screens/auth/otp-verification-screen';
import { SetPinScreen } from '@/screens/auth/SetPinScreen';
import { WelcomeScreen } from '@/screens/auth/welcome-screen';
import { ContactOfficerScreen } from '@/screens/beneficiary/contact-officer-screen';
import { BeneficiaryDashboardScreen } from '@/screens/beneficiary/dashboard-screen';
import { EditProfileScreen } from '@/screens/beneficiary/edit-profile-screen';
import { EligibilityPredictionScreen } from '@/screens/beneficiary/eligibility-prediction-screen';
import { EmiCalculatorScreen } from '@/screens/beneficiary/emi-calculator-screen';
import { BeneficiaryLoanAssistantScreen } from '@/screens/beneficiary/loan-assistant-screen';
import { LoanDetailsScreen } from '@/screens/beneficiary/loan-details-screen';
import { LoanEvidenceCameraScreen } from '@/screens/beneficiary/loan-evidence-camera-screen';
import { NotificationsScreen } from '@/screens/beneficiary/notifications-screen';
import { PreviousSubmissionsScreen } from '@/screens/beneficiary/previous-submissions-screen';
import { BeneficiaryProfileScreen } from '@/screens/beneficiary/profile-screen';
import { SubmissionDetailScreen } from '@/screens/beneficiary/submission-detail-screen';
import { SubsidyCalculatorScreen } from '@/screens/beneficiary/subsidy-calculator-screen';
import { SyncStatusScreen } from '@/screens/beneficiary/sync-status-screen';
import { UploadEvidenceScreen } from '@/screens/beneficiary/upload-evidence-screen';
import { ActiveSessionsScreen } from '@/screens/officer/active-sessions-screen';
import { BeneficiaryFormScreen } from '@/screens/officer/beneficiary-form-screen';
import { BeneficiaryListScreen } from '@/screens/officer/beneficiary-list-screen';
import { ChangePasswordScreen } from '@/screens/officer/change-password-screen';
import { OfficerDashboardScreen } from '@/screens/officer/dashboard-screen';
import { OfficerSubmissionDetailScreen } from '@/screens/officer/officer-submission-detail-screen';
import { VerificationDetailScreen } from '@/screens/officer/verification-detail-screen';
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

const tabItemStyle: ViewStyle = {
  height: 70,
  padding: 0,
  justifyContent: 'center',
  alignItems: 'center',
};

const tabToggleStyles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 24,
    bottom: 8,
    zIndex: 2000,
  },
  touch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffffee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
});

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="MobileInput" component={MobileInputScreen} />
    <AuthStack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    <AuthStack.Screen name="SetPin" component={SetPinScreen} />
    <AuthStack.Screen name="EnterPin" component={EnterPinScreen} />
    <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
  </AuthStack.Navigator>
);

const BeneficiaryTabNavigator = () => {
  const theme = useAppTheme();
  const tabScreenOptions = useMemo<BottomTabNavigationOptions>(
    () => ({
      headerShown: false,
      tabBarStyle: [
        {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: theme.mode === 'dark' ? 0 : 5,
          backgroundColor: theme.colors.surface,
          borderRadius: 35,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme.mode === 'dark' ? 0.35 : 0.1,
          shadowRadius: 10,
          borderTopWidth: 0,
          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor: theme.colors.border,
          paddingBottom: 0,
          paddingTop: 0,
        } as ViewStyle,
        { transform: [{ translateY }] },
      ],
      tabBarItemStyle: tabItemStyle,
      tabBarIconStyle: {
        marginTop: 0,
        marginBottom: 0,
      },
      sceneContainerStyle: { backgroundColor: theme.colors.background } as ViewStyle,
      tabBarShowLabel: false,
      tabBarActiveTintColor: theme.mode === 'dark' ? theme.colors.onPrimary : theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.subtext,
    }),
    [theme, translateY]
  );

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
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
  const drawerPalette = useMemo(
    () =>
      theme.mode === 'dark'
        ? {
            headerStart: '#0B1724',
            headerEnd: '#12324A',
            background: theme.colors.surface,
            border: theme.colors.border,
            icon: theme.colors.onPrimary,
            accent: 'rgba(255,255,255,0.04)',
            inactive: theme.colors.subtext,
          }
        : {
            headerStart: '#D9FBE5',
            headerEnd: '#8FE3B6',
            background: '#F6FFF7',
            border: '#CFF5DA',
            icon: '#0F5132',
            accent: 'rgba(15, 81, 50, 0.08)',
            inactive: '#5E8F7A',
          },
    [theme]
  );

  return (
    <BeneficiaryDrawer.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        drawerActiveTintColor: drawerPalette.icon,
        drawerInactiveTintColor: drawerPalette.inactive,
        drawerActiveBackgroundColor: drawerPalette.accent,
        drawerInactiveBackgroundColor: 'transparent',
        drawerStyle: {
          backgroundColor: drawerPalette.background,
          width: '80%',
          borderRightWidth: 0,
          paddingTop: 0,
          paddingBottom: 12,
          borderColor: drawerPalette.border,
          borderRightColor: drawerPalette.border,
        },
        drawerContentStyle: { backgroundColor: drawerPalette.background },
        drawerItemStyle: {
          borderRadius: 14,
          marginHorizontal: 16,
          marginVertical: 6,
          paddingVertical: 6,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
        },
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
          palette={drawerPalette}
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
        drawerActiveTintColor: '#FFFFFF',
        drawerInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
        drawerActiveBackgroundColor: 'transparent',
        drawerStyle: { backgroundColor: 'transparent', width: '82%' },
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
      <OfficerStack.Screen name="ActiveSessions" component={ActiveSessionsScreen} />
      <OfficerStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
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
  palette: DrawerPalette;
};

type DrawerPalette = {
  headerStart: string;
  headerEnd: string;
  background: string;
  border: string;
  icon: string;
  accent: string;
  inactive: string;
};

const BeneficiaryDrawerContent = ({ beneficiaryName, beneficiaryVillage, onLogout, palette, ...props }: BeneficiaryDrawerContentProps) => {
  const theme = useAppTheme();
  const t = useT();
  const styles = useMemo(() => createBeneficiaryDrawerStyles(theme, palette), [theme, palette]);

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
    <View style={styles.container}>
      <LinearGradient
        colors={[palette.headerStart, palette.headerEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.profileHeader}>
          <AppText style={styles.brand}>NIDHISETU</AppText>
          <AppText style={styles.beneficiaryName} numberOfLines={1}>
            {beneficiaryName}
          </AppText>
          {beneficiaryVillage ? (
            <AppText style={styles.beneficiaryMeta} numberOfLines={1}>
              {beneficiaryVillage}
            </AppText>
          ) : null}
        </View>
      </LinearGradient>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScrollContent}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.logoutSection}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <AppIcon name="power" size={24} color={theme.colors.onPrimary} />
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

  const visibleRoutes = props.state.routes.filter((route) => {
    const drawerItemStyle = props.descriptors[route.key]?.options?.drawerItemStyle;
    const flattened = drawerItemStyle ? StyleSheet.flatten(drawerItemStyle) : undefined;
    return flattened?.display !== 'none';
  });

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={drawerStyles.gradientBackground}
    >
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={drawerStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={drawerStyles.header}>
          <View style={drawerStyles.avatar}>
            <AppIcon name="shield-account" size={28} color="#FFFFFF" />
          </View>
          <View style={drawerStyles.headerTextWrap}>
            <AppText style={drawerStyles.headerName}>{officerName}</AppText>
            {officerMobile ? <AppText style={drawerStyles.headerMeta}>{officerMobile}</AppText> : null}
            <View style={drawerStyles.badge}>
              <AppText style={drawerStyles.badgeText}>Field Officer</AppText>
            </View>
          </View>
        </View>

        <View style={drawerStyles.menuSection}>
          {visibleRoutes.map((route) => {
            const originalIndex = props.state.routes.findIndex((item) => item.key === route.key);
            const focused = props.state.index === originalIndex;
            const label = props.descriptors[route.key]?.options?.title ?? route.name;
            const iconName = officerIconMap[route.name as keyof typeof officerIconMap] ?? 'folder';

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => props.navigation.navigate(route.name as never)}
                style={[drawerStyles.menuItem, focused && drawerStyles.menuItemActive]}
                activeOpacity={0.9}
              >
                <View style={[drawerStyles.menuIcon, focused && drawerStyles.menuIconActive]}>
                  <AppIcon
                    name={iconName}
                    size={20}
                    color={focused ? theme.colors.gradientStart : 'rgba(255, 255, 255, 0.9)'}
                  />
                </View>
                <AppText style={[drawerStyles.menuLabel, focused && drawerStyles.menuLabelActive]}>{label}</AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={handleLogout} style={drawerStyles.logoutButton} activeOpacity={0.9}>
          <View style={drawerStyles.logoutIcon}>
            <AppIcon name="power" size={22} color={theme.colors.gradientStart} />
          </View>
          <AppText style={drawerStyles.logoutText}>Logout</AppText>
          <AppIcon name="chevron-right" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </DrawerContentScrollView>
    </LinearGradient>
  );
};

const createBeneficiaryDrawerStyles = (theme: AppTheme, palette: DrawerPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
      borderTopRightRadius: 32,
      borderBottomRightRadius: 32,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: -6, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 12,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: palette.border,
    },
    headerGradient: {
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 32,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    profileHeader: {
      gap: 6,
    },
    brand: {
      fontSize: 24,
      fontWeight: 'bold',
      color: palette.icon,
      letterSpacing: 0.5,
    },
    beneficiaryName: {
      fontSize: 16,
      fontWeight: '500',
      color: palette.icon,
      opacity: 0.9,
    },
    beneficiaryMeta: {
      fontSize: 13,
      color: palette.icon,
      opacity: 0.7,
    },
    drawerScrollContent: {
      paddingTop: 0,
      backgroundColor: palette.background,
    },
    logoutSection: {
      paddingHorizontal: 24,
      paddingBottom: 40,
      paddingTop: 12,
      backgroundColor: palette.background,
    },
    logoutButton: {
      alignSelf: 'flex-end',
      backgroundColor: theme.colors.primary,
      padding: 14,
      borderRadius: theme.radii.pill,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 6,
    },
  });

const drawerStyles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 56,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerMeta: {
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  badge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  menuSection: {
    marginHorizontal: 16,
    borderRadius: 22,
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 16,
  },
  menuItemActive: {
    backgroundColor: '#FFFFFF',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  menuLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#0A3D3D',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  logoutIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
