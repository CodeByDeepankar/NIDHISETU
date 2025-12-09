import { useMemo, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppText } from '@/components/atoms/app-text';
import { WaveHeader } from '@/components/molecules/wave-header';
import { deadlineCrossedLoans, highRiskLoans, pendingReviewLoans, type LoanItem } from '@/components/organisms/beneficiary-risk-lists';
import type { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useOfficerBeneficiaries } from '@/hooks/use-officer-beneficiaries';
import { useAuthStore } from '@/state/authStore';

export const OfficerDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const { analytics, isRefreshing, refresh } = useOfficerBeneficiaries();
  const profile = useAuthStore((state) => state.profile);

  const HEADER_HEIGHT = 240;
  const CONTENT_TOP_PADDING = 96;

  const officerName = profile?.name ?? 'District Officer';
  const officerId = profile?.id ?? 'OFF-2024-001';
  const region = (profile as any)?.region ?? 'Bhopal Division';
  const palette = useMemo(() => buildDashboardPalette(theme), [theme]);
  const styles = useMemo(() => createDashboardStyles(palette), [palette]);
  const [openSections, setOpenSections] = useState({
    high: true,
    pending: true,
    deadline: true,
  });

  const handleRefresh = async () => {
    await refresh();
  };

  const handleViewDetails = (loan: LoanItem) => {
    navigation.navigate('VerificationTasks', {
      filter: loan.status,
      loanId: loan.loanId,
    });
  };

  const highRiskAlerts = highRiskLoans;
  const pendingReviewAlerts = pendingReviewLoans;
  const deadlineCrossedAlerts = deadlineCrossedLoans;

  const toggleSection = (key: 'high' | 'pending' | 'deadline') => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderAlertCard = (
    key: 'high' | 'pending' | 'deadline',
    title: string,
    color: string,
    data: LoanItem[]
  ) => (
    <View key={key} style={[styles.alertCard, { borderColor: `${color}40`, backgroundColor: `${color}0D` }]}> 
      <Pressable style={styles.alertCardHeader} onPress={() => toggleSection(key)}>
        <View style={styles.alertCardTitleRow}>
          <View style={[styles.alertDot, { backgroundColor: color }]} />
          <AppText style={[styles.sectionTitle, { color }]}>{title}</AppText>
        </View>
        <View style={styles.alertHeaderRight}>
          <AppText style={[styles.alertCardCount, { color }]}>{data.length} items</AppText>
          <Ionicons
            name={openSections[key] ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={color}
          />
        </View>
      </Pressable>

      {openSections[key] ? (
        <View style={styles.alertCardBody}>
          {data.map((item) => (
            <View key={item.id} style={styles.alertItemRow}>
              <View style={styles.alertItemLeft}>
                <AppText style={styles.alertItemName}>{item.name}</AppText>
                <AppText style={styles.alertItemMeta}>Loan ID: {item.loanId}</AppText>
                <AppText style={styles.alertItemMeta}>Bank: {item.bank}</AppText>
                <AppText style={styles.alertItemMeta}>Last Updated: {item.lastUpdated ?? '—'}</AppText>
              </View>
              <View style={[styles.alertStatusPill, { backgroundColor: `${color}22` }]}> 
                <AppText style={[styles.alertStatusText, { color }]}>{item.status}</AppText>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );

  const alertChips = [
    { title: 'High Risk', count: highRiskAlerts.length.toString().padStart(2, '0'), color: palette.red, icon: 'arrow-forward', onPress: () => navigation.navigate('VerificationTasks', { filter: 'highRisk' }) },
    { title: 'Pending Review', count: pendingReviewAlerts.length.toString().padStart(2, '0'), color: palette.gold, icon: 'arrow-forward', onPress: () => navigation.navigate('VerificationTasks', { filter: 'pending' }) },
    { title: 'Deadline Crossed', count: deadlineCrossedAlerts.length.toString().padStart(2, '0'), color: palette.blue, icon: 'arrow-forward', onPress: () => navigation.navigate('VerificationTasks', { filter: 'deadline' }) },
  ];

  const utilisationTrend = [
    { label: 'Mar', value: 62 },
    { label: 'Apr', value: 66 },
    { label: 'May', value: 70 },
    { label: 'Jun', value: 68 },
    { label: 'Jul', value: 74 },
    { label: 'Aug', value: 78 },
  ];
  const utilisationChange = 4.2;

  const verificationQueue = [
    { name: 'Priya Varma', scheme: 'PMEGP', wait: '12 hrs', status: 'Docs uploaded, needs check' },
    { name: 'Rahul Singh', scheme: 'Mudra', wait: '5 hrs', status: 'Bank statement pending' },
    { name: 'Asha Devi', scheme: 'Field', wait: '2 hrs', status: 'Field visit scheduled' },
    { name: 'Karan Patel', scheme: 'Compliance', wait: '1 hr', status: 'Escalation flagged' },
  ];

  const quickActionShortcuts = [
    { label: 'Approve Batch', icon: 'checkmark-done-circle', color: palette.green, onPress: () => navigation.navigate('VerificationTasks') },
    { label: 'Request Re-upload', icon: 'cloud-upload-outline', color: palette.gold, onPress: () => navigation.navigate('Reports') },
    { label: 'Schedule Field Visit', icon: 'map-outline', color: palette.blue, onPress: () => navigation.navigate('Reports') },
    { label: 'Export Utilisation', icon: 'download-outline', color: palette.slate, onPress: () => navigation.navigate('Reports') },
  ];

  const todaysTasks = [
    { time: '09:30', duration: '15 min', title: 'Verify utilisation photos - Rahman Traders', tag: 'PMEGP', status: 'Pending media upload' },
    { time: '11:00', duration: '20 min', title: 'Call borrower - Seema Textile', tag: 'Mudra', status: 'Requires manual check' },
    { time: '14:15', duration: '30 min', title: 'Approve field report - Ward 4', tag: 'Field', status: 'Deadline today' },
    { time: '16:00', duration: '10 min', title: 'Escalate overdue files (3)', tag: 'Compliance', status: 'Deadline today' },
  ];

  return (
    <View style={styles.container}>
      <WaveHeader
        title="Loan Monitoring"
        subtitle="District intelligence & tasks"
        height={HEADER_HEIGHT}
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: CONTENT_TOP_PADDING }]}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: palette.background }}
      >
        <TouchableOpacity
          style={styles.notificationFab}
          onPress={() => navigation.navigate('Notifications')}
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
        >
          <Ionicons name="notifications-outline" size={20} color={palette.blue} />
        </TouchableOpacity>

        <View style={styles.profileStrip}>
          <View style={styles.profileIdentity}>
            <View style={styles.avatarSmall}>
              <Ionicons name="person" size={18} color={palette.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.profileName}>{officerName}</AppText>
              <AppText style={styles.profileMeta}>{region}</AppText>
              <AppText style={styles.profileMeta}>Loan Monitoring — District Intelligence & Tasks</AppText>
            </View>
          </View>
          <View style={styles.profileBadges}>
            <View style={[styles.statusPill, { backgroundColor: `${palette.green}18` }]}> 
              <View style={[styles.statusDot, { backgroundColor: palette.green }]} />
              <AppText style={[styles.profileBadgeText, { color: palette.green }]}>Active / Online</AppText>
            </View>
            <AppText style={styles.profileId}>{officerId}</AppText>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>Alerts</AppText>
            <TouchableOpacity onPress={handleRefresh}>
              <AppText style={[styles.sectionMeta, { color: palette.blue }]}>Refresh</AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.alertChipsRow}>
            {alertChips.map((chip) => (
              <Pressable
                key={chip.title}
                style={[styles.alertChip, { backgroundColor: `${chip.color}12`, borderColor: `${chip.color}40` }]}
                onPress={chip.onPress}
                android_ripple={{ color: `${chip.color}30`, borderless: false }}
              >
                <AppText style={[styles.alertChipLabel, { color: chip.color }]}>
                  {chip.title}
                </AppText>
                <View style={styles.alertChipRight}>
                  <AppText style={[styles.alertChipCount, { color: chip.color }]}>{chip.count}</AppText>
                  <Ionicons name={chip.icon as any} size={14} color={chip.color} />
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.alertAccordionContainer}>
            {renderAlertCard('high', 'High Risk', palette.red, highRiskAlerts)}
            {renderAlertCard('pending', 'Pending Review', palette.gold, pendingReviewAlerts)}
            {renderAlertCard('deadline', 'Deadline Crossed', palette.blue, deadlineCrossedAlerts)}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.utilisationCard}>
            <View style={styles.utilisationHeader}>
              <View>
                <AppText style={styles.sectionTitle}>Loan Utilisation Overview</AppText>
                <AppText style={styles.sectionMeta}>Tracking sanctioned vs used</AppText>
              </View>
              <View style={styles.utilisationStat}>
                <AppText style={styles.utilisationValue}>78%</AppText>
                <AppText
                  style={[
                    styles.utilisationChange,
                    { color: utilisationChange >= 0 ? palette.green : palette.red },
                  ]}
                >
                  {utilisationChange >= 0 ? '+' : ''}
                  {utilisationChange.toFixed(1)}% vs last month
                </AppText>
              </View>
            </View>
            <View style={styles.utilisationChart}>
              {utilisationTrend.map((point) => (
                <View key={point.label} style={styles.chartColumn}>
                  <View style={styles.chartTrack}>
                    <View
                      style={[
                        styles.chartFill,
                        { backgroundColor: palette.green, height: `${point.value}%` },
                      ]}
                    />
                  </View>
                  <AppText style={styles.chartLabel}>{point.label}</AppText>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>Verification Queue</AppText>
            <TouchableOpacity onPress={() => navigation.navigate('VerificationTasks')}>
              <AppText style={styles.sectionAction}>View all</AppText>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.queueScroll}
          >
            {verificationQueue.map((item) => (
              <View key={item.name} style={styles.queueCard}>
                <View style={styles.queueHeader}>
                  <AppText style={styles.queueName}>{item.name}</AppText>
                  <View style={styles.queueBadge}>
                    <AppText style={styles.queueBadgeText}>{item.wait}</AppText>
                  </View>
                </View>
                <AppText style={styles.queueScheme}>{item.scheme}</AppText>
                <AppText style={styles.queueStatus}>{item.status}</AppText>
                <TouchableOpacity style={styles.queueAction}>
                  <AppText style={styles.queueActionText}>Open file</AppText>
                  <Ionicons name="chevron-forward" size={16} color={palette.navy} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>Quick Actions</AppText>
            <AppText style={styles.sectionMeta}>4 most used workflows</AppText>
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActionShortcuts.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickActionButton}
                onPress={action.onPress}
                activeOpacity={0.85}
              >
                <View style={[styles.quickIconRing, { backgroundColor: `${action.color}18` }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <AppText style={styles.quickActionLabel}>{action.label}</AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>Today's Tasks</AppText>
            <AppText style={styles.sectionMeta}>Auto-prioritized by SLA</AppText>
          </View>
          <View style={styles.taskList}>
            {todaysTasks.map((task) => (
              <View key={task.title} style={styles.taskRow}>
                <View style={styles.taskTimeBlock}>
                  <AppText style={styles.taskTime}>{task.time}</AppText>
                  <AppText style={styles.taskDuration}>{task.duration}</AppText>
                </View>
                <View style={styles.taskInfo}>
                  <AppText style={styles.taskTitle}>{task.title}</AppText>
                  <View style={styles.taskMetaRow}>
                    <View style={styles.taskTag}>
                      <AppText style={styles.taskTagText}>{task.tag}</AppText>
                    </View>
                    <AppText style={styles.taskStatus}>{task.status}</AppText>
                  </View>
                </View>
                <TouchableOpacity style={styles.taskCTA}>
                  <Ionicons name="chevron-forward" size={18} color={palette.navy} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const createDashboardStyles = (palette: DashboardPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 24,
      gap: 20,
    },
    notificationFab: {
      alignSelf: 'flex-end',
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.borderSoft,
      backgroundColor: palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: palette.navy,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    profileStrip: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: palette.borderSoft,
      backgroundColor: palette.surface,
      shadowColor: palette.navy,
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    avatarSmall: {
      width: 40,
      height: 40,
      borderRadius: 16,
      backgroundColor: `${palette.blue}15`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileIdentity: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.navy,
    },
    profileMeta: {
      fontSize: 13,
      color: palette.slate,
      marginTop: 4,
    },
    profileBadges: {
      alignItems: 'flex-end',
      gap: 6,
    },
    profileBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: palette.accentSoft,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    profileBadgeText: {
      fontSize: 12,
      color: palette.green,
      fontWeight: '600',
    },
    profileId: {
      fontSize: 12,
      color: palette.slate,
      letterSpacing: 0.3,
    },
    section: {
      gap: 12,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.navy,
    },
    sectionMeta: {
      fontSize: 12,
      color: palette.slate,
    },
    sectionAction: {
      fontSize: 13,
      color: palette.blue,
      fontWeight: '600',
    },
    alertChipsRow: {
      flexDirection: 'row',
      gap: 10,
      flexWrap: 'wrap',
    },
    alertChip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      minWidth: 140,
      backgroundColor: palette.surface,
    },
    alertChipLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: palette.navy,
    },
    alertChipRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    alertChipCount: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.navy,
    },
    alertAccordionContainer: {
      gap: 12,
    },
    alertCard: {
      borderWidth: 1,
      borderRadius: 14,
      padding: 12,
      gap: 8,
    },
    alertCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    alertCardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    alertHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    alertCardCount: {
      fontSize: 12,
      fontWeight: '600',
    },
    alertCardBody: {
      gap: 10,
      paddingTop: 4,
    },
    alertItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.borderSoft,
      gap: 12,
    },
    alertItemLeft: {
      flex: 1,
      gap: 4,
    },
    alertItemName: {
      fontSize: 14,
      fontWeight: '700',
      color: palette.navy,
    },
    alertItemMeta: {
      fontSize: 12,
      color: palette.slate,
    },
    alertStatusPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      alignSelf: 'flex-start',
    },
    alertStatusText: {
      fontSize: 12,
      fontWeight: '700',
    },
    alertDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    utilisationCard: {
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: palette.borderSoft,
      gap: 18,
      backgroundColor: palette.surface,
    },
    utilisationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    utilisationStat: {
      alignItems: 'flex-end',
    },
    utilisationValue: {
      fontSize: 32,
      fontWeight: '700',
      color: palette.navy,
    },
    utilisationChange: {
      fontSize: 12,
      marginTop: 2,
      fontWeight: '600',
    },
    utilisationChart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
    },
    chartColumn: {
      alignItems: 'center',
      flex: 1,
      gap: 8,
    },
    chartTrack: {
      width: '100%',
      height: 120,
      borderRadius: 12,
      backgroundColor: palette.chartTrack,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    chartFill: {
      width: '100%',
      borderRadius: 12,
    },
    chartLabel: {
      fontSize: 11,
      color: palette.slate,
    },
    queueScroll: {
      gap: 12,
    },
    queueCard: {
      width: 240,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: palette.borderSoft,
      marginRight: 12,
      gap: 8,
      backgroundColor: palette.surface,
    },
    queueHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    queueName: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.navy,
    },
    queueBadge: {
      paddingHorizontal: 10,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: palette.queueBadgeBg,
    },
    queueBadgeText: {
      fontSize: 11,
      color: palette.gold,
      fontWeight: '600',
    },
    queueScheme: {
      fontSize: 12,
      color: palette.slate,
    },
    queueStatus: {
      fontSize: 13,
      color: palette.navy,
      fontWeight: '500',
    },
    queueAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    queueActionText: {
      fontSize: 13,
      color: palette.navy,
      fontWeight: '600',
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    quickActionButton: {
      width: '30%',
      borderRadius: 18,
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: palette.quickBorder,
      gap: 12,
      backgroundColor: palette.surface,
      shadowColor: palette.navy,
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    quickIconRing: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickActionLabel: {
      fontSize: 13,
      color: palette.navy,
      textAlign: 'center',
      fontWeight: '600',
    },
    taskList: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: palette.borderSoft,
      backgroundColor: palette.surface,
    },
    taskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.borderSoft,
    },
    taskTimeBlock: {
      alignItems: 'flex-start',
      width: 68,
    },
    taskTime: {
      fontSize: 15,
      fontWeight: '700',
      color: palette.navy,
    },
    taskDuration: {
      fontSize: 12,
      color: palette.slate,
    },
    taskInfo: {
      flex: 1,
      gap: 4,
    },
    taskTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.navy,
    },
    taskMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    taskTag: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: palette.taskTagBg,
    },
    taskTagText: {
      fontSize: 11,
      color: palette.gold,
      fontWeight: '600',
    },
    taskStatus: {
      fontSize: 12,
      color: palette.slate,
    },
    taskCTA: {
      width: 28,
      alignItems: 'flex-end',
    },
  });

type DashboardPalette = {
  background: string;
  surface: string;
  navy: string;
  slate: string;
  gold: string;
  blue: string;
  red: string;
  green: string;
  accentSoft: string;
  borderSoft: string;
  queueBadgeBg: string;
  taskTagBg: string;
  chartTrack: string;
  quickBorder: string;
};

const buildDashboardPalette = (theme: AppTheme): DashboardPalette => {
  const accent = theme.colors.gradientStart ?? '#0F8F88';
  const accentSecondary = theme.colors.gradientEnd ?? '#20B2AA';
  return {
    background: '#E8F3F2',
    surface: theme.colors.surface,
    navy: '#0B2A3F',
    slate: '#4E5F6D',
    gold: '#C7951E',
    blue: '#1F6FAE',
    red: theme.colors.error,
    green: accent,
    accentSoft: `${accentSecondary}26`,
    borderSoft: `${theme.colors.border}99`,
    queueBadgeBg: '#FFF2E3',
    taskTagBg: '#F6EFE1',
    chartTrack: `${accent}1A`,
    quickBorder: `${accent}30`,
  };
};
