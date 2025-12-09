import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { analyticsService, type AnalyticsSummary, type ActivityLogEntry, type PerformancePoint } from '@/services/api/analyticsService';

import { AppButton } from '@/components/atoms/app-button';
import type { IconName } from '@/components/atoms/app-icon';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { WaveHeader } from '@/components/molecules/wave-header';
import MapView, { Marker, PROVIDER_GOOGLE } from '@/components/react-native-maps-shim';
import type { ColorToken } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const GAUGE_SIZE = 160;
const GAUGE_STROKE = 18;
const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_STROKE) / 2;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;
const GAUGE_SWEEP_DEG = 180;
const GAUGE_SWEEP_RATIO = GAUGE_SWEEP_DEG / 360;

export const ReportsScreen = () => {
  const theme = useAppTheme();
  const [activeTab, setActiveTab] = useState<ReportsTab>('risk');
  const [duration, setDuration] = useState<DurationKey>('6m');
  const [isDurationMenuOpen, setDurationMenuOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<{ label: string; value: number; index: number } | null>(null);

  // Real-time State
  const [metrics, setMetrics] = useState<AnalyticsSummary>({ total: 0, approved: 0, rejected: 0, pending: 0 });
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformancePoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        try {
          // Determine months based on duration (simple mapping for now)
          const months = duration === '3m' ? 3 : duration === '12m' ? 12 : 6;
          
          const [m, a, p] = await Promise.all([
            analyticsService.getSummaryMetrics(),
            analyticsService.getRecentActivity(),
            analyticsService.getPerformanceData(months)
          ]);

          if (active) {
            setMetrics(m);
            setActivities(a);
            setPerformanceData(p);
            setLoading(false);
          }
        } catch (err) {
          console.error('Reports fetch error', err);
        }
      };
      load();
      return () => { active = false; };
    }, [duration])
  );

  const selectedSeries = performanceData;
  const maxPerformanceValue = Math.max(...selectedSeries.map((point) => point.value), 1);
  const tooltipLeftPercent = activeTooltip
    ? ((activeTooltip.index + 0.5) / selectedSeries.length) * 100
    : 0;

  const handleDurationSelect = (value: DurationKey) => {
    setDuration(value);
    setDurationMenuOpen(false);
    setActiveTooltip(null);
  };

  const handleShowTooltip = (point: { label: string; value: number }, index: number) =>
    setActiveTooltip({ label: point.label, value: point.value, index });

  const handleHideTooltip = () => setActiveTooltip(null);

  const handleTabChange = (tab: ReportsTab) => {
    setActiveTab(tab);
    setDurationMenuOpen(false);
    setActiveTooltip(null);
  };

  const getTabPalette = (isActive: boolean) => {
    const accent = theme.colors.gradientStart ?? theme.colors.primary;
    if (isActive) {
      return {
        background: accent,
        border: accent,
        label: theme.colors.onPrimary,
        shadowOpacity: 0,
      };
    }
    return {
      background: theme.colors.surface,
      border: `${theme.colors.border}aa`,
      label: theme.colors.text,
      shadowOpacity: 0,
    };
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'risk':
        return <RiskScoringCard />;
      case 'documents':
        return <DocumentAlertsPanel />;
      case 'performance':
        return (
          <View style={[styles.card, styles.performanceCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.performanceHeader}>
              <View>
                <AppText variant="titleMedium" color="text" weight="600">
                  Monthly Performance Trend
                </AppText>
                <AppText variant="bodySmall" color="muted">
                  Showing approvals vs submissions
                </AppText>
              </View>
              <View style={styles.dropdownWrapper}>
                <Pressable
                  onPress={() => setDurationMenuOpen((prev) => !prev)}
                  style={[styles.dropdownButton, { borderColor: theme.colors.border }]}
                >
                  <AppText variant="labelMedium" color="text" weight="600">
                    {durationOptions.find((option) => option.value === duration)?.label ?? ''}
                  </AppText>
                  <AppIcon name={isDurationMenuOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.icon} />
                </Pressable>
                {isDurationMenuOpen ? (
                  <View style={[styles.dropdownMenu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
                    {durationOptions.map((option) => (
                      <Pressable
                        key={option.value}
                        style={styles.dropdownOption}
                        onPress={() => handleDurationSelect(option.value)}
                      >
                        <AppText
                          variant="bodyMedium"
                          color={option.value === duration ? 'primary' : 'text'}
                          weight={option.value === duration ? '600' : '400'}
                        >
                          {option.label}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.chartWrapper}>
              {activeTooltip ? (
                <View
                  style={[
                    styles.chartTooltip,
                    {
                      left: `${tooltipLeftPercent}%`,
                      backgroundColor: theme.colors.surface,
                      borderColor: `${theme.colors.border}80`,
                    },
                  ]}
                >
                  <AppText variant="labelSmall" color="muted">
                    {activeTooltip.label}
                  </AppText>
                  <AppText variant="titleMedium" color="text" weight="600">
                    {activeTooltip.value} cases
                  </AppText>
                </View>
              ) : null}
              <View style={styles.chartBars}>
                {selectedSeries.map((point, index) => (
                  <Pressable
                    key={`${point.label}-${index}`}
                    style={styles.chartBarPressable}
                    onHoverIn={() => handleShowTooltip(point, index)}
                    onHoverOut={handleHideTooltip}
                    onPressIn={() => handleShowTooltip(point, index)}
                    onPressOut={handleHideTooltip}
                  >
                    <View style={[styles.barTrack, { backgroundColor: `${theme.colors.primary}18` }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${Math.max((point.value / maxPerformanceValue) * 100, 8)}%`,
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <AppText variant="labelSmall" color="muted">
                      {point.label}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        );
      case 'activity':
        return <ActivityLogCard data={activities} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WaveHeader title="Reports & Analytics" />

      <ScrollView contentContainerStyle={styles.content}>
        <SummaryStrip data={metrics} />

        <QuickActionPanel />

        <View style={[styles.tabBar, { backgroundColor: theme.colors.surfaceVariant }]}> 
          {reportsTabs.map((tab) => {
            const isActive = tab.key === activeTab;
            const palette = getTabPalette(isActive);
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.tabItem,
                  {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                  },
                ]}
                onPress={() => handleTabChange(tab.key)}
              >
                <View style={styles.tabContentRow}>
                  <AppIcon name={tab.icon} size={16} color={palette.label} />
                  <AppText
                    variant="labelMedium"
                    color={palette.label}
                    weight={isActive ? '600' : '500'}
                  >
                    {tab.label}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>

        {renderTabContent()}
      </ScrollView>
    </View>
  );
};
const ActivityItem = ({ title, subtitle, time, icon, color }: { title: string; subtitle: string; time: string; icon: string; color: string }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
        <AppIcon name={icon as any} size={20} color={color as any} />
      </View>
      <View style={styles.activityContent}>
        <AppText variant="bodyMedium" color="text" weight="500">
          {title}
        </AppText>
        <AppText variant="bodySmall" color="muted">
          {subtitle}
        </AppText>
      </View>
      <AppText variant="labelSmall" color="muted">
        {time}
      </AppText>
    </View>
  );
};

const summaryMetrics = [
  { label: 'Total', value: '124', tone: '#4F46E5' },
  { label: 'Approved', value: '86', tone: '#10B981' },
  { label: 'Pending', value: '32', tone: '#F59E0B' },
  { label: 'Rejected', value: '6', tone: '#EF4444' },
];

const quickActions: Array<{ label: string; icon: IconName; tone: ColorToken; helper: string }> = [
  {
    label: 'Approve',
    icon: 'check-circle',
    tone: 'success',
    helper: 'Confirm when AI risk is low and KYC + site proofs align.',
  },
  {
    label: 'Ask Re-Upload',
    icon: 'cloud-upload',
    tone: 'warning',
    helper: 'Request if a document is blurry, expired, or mismatched.',
  },
  {
    label: 'Raise Field Inspection',
    icon: 'map-marker-alert',
    tone: 'error',
    helper: 'Escalate when anomalies persist or address needs validation.',
  },
];

const quickActionSummary = {
  label: 'System analysis',
  highlight: 'Low risk detected - documents valid',
  detail: 'AI + registry checks refreshed 2 mins ago',
};

type ReportsTab = 'risk' | 'documents' | 'performance' | 'activity';

const reportsTabs: Array<{ key: ReportsTab; label: string; icon: IconName }> = [
  { key: 'risk', label: 'Risk', icon: 'alert-circle-outline' },
  { key: 'documents', label: 'Docs', icon: 'file-document-outline' },
  { key: 'performance', label: 'Perf', icon: 'chart-box-outline' },
  { key: 'activity', label: 'Logs', icon: 'bell-outline' },
];

type DurationKey = '3m' | '6m' | '12m';

const durationOptions: Array<{ label: string; value: DurationKey }> = [
  { label: 'Last 3 months', value: '3m' },
  { label: 'Last 6 months', value: '6m' },
  { label: 'Last 12 months', value: '12m' },
];

const performanceSeries: Record<DurationKey, Array<{ label: string; value: number }>> = {
  '3m': [
    { label: 'Aug', value: 68 },
    { label: 'Sep', value: 74 },
    { label: 'Oct', value: 82 },
  ],
  '6m': [
    { label: 'May', value: 60 },
    { label: 'Jun', value: 78 },
    { label: 'Jul', value: 55 },
    { label: 'Aug', value: 92 },
    { label: 'Sep', value: 71 },
    { label: 'Oct', value: 66 },
  ],
  '12m': [
    { label: 'Jan', value: 48 },
    { label: 'Feb', value: 52 },
    { label: 'Mar', value: 57 },
    { label: 'Apr', value: 63 },
    { label: 'May', value: 60 },
    { label: 'Jun', value: 78 },
    { label: 'Jul', value: 55 },
    { label: 'Aug', value: 92 },
    { label: 'Sep', value: 71 },
    { label: 'Oct', value: 66 },
    { label: 'Nov', value: 73 },
    { label: 'Dec', value: 69 },
  ],
};

const SummaryStrip = ({ data }: { data: AnalyticsSummary }) => {
  const theme = useAppTheme();
  
  const items = [
    { label: 'Total', value: String(data.total), tone: '#4F46E5' },
    { label: 'Approved', value: String(data.approved), tone: '#10B981' },
    { label: 'Pending', value: String(data.pending), tone: '#F59E0B' },
    { label: 'Rejected', value: String(data.rejected), tone: '#EF4444' },
  ];

  return (
    <View style={[styles.summaryStrip, { backgroundColor: theme.colors.surface }]}>
      {items.map((metric, index) => (
        <View
          key={metric.label}
          style={[
            styles.summaryCell,
            index < items.length - 1 && {
              borderRightWidth: StyleSheet.hairlineWidth,
              borderRightColor: `${theme.colors.border}60`,
            },
          ]}
        >
          <AppText variant="labelSmall" color="muted">
            {metric.label}
          </AppText>
          <AppText variant="headlineMedium" weight="700" style={{ color: metric.tone }}>
            {metric.value}
          </AppText>
        </View>
      ))}
    </View>
  );
};

const QuickActionPanel = () => {
  const theme = useAppTheme();
  return (
    <View style={[styles.card, styles.quickActionsCard, { backgroundColor: theme.colors.surface }]}> 
      <View style={styles.quickActionHeader}>
        <View>
          <AppText variant="titleSmall" color="text" weight="600">
            Decision Guidance
          </AppText>
          <AppText variant="bodySmall" color="muted">
            Choose the right next step for this file
          </AppText>
        </View>
        <AppIcon name="shield-check" size={20} color={theme.colors.success} />
      </View>

      <View
        style={[
          styles.quickSummaryContainer,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: `${theme.colors.border}80`,
          },
        ]}
      >
        <View style={styles.quickSummaryBadge}>
          <AppIcon name="robot" size={14} color={theme.colors.info} />
          <AppText variant="labelSmall" color="muted" weight="600">
            {quickActionSummary.label}
          </AppText>
        </View>
        <AppText variant="bodyMedium" color="text" weight="600">
          {quickActionSummary.highlight}
        </AppText>
        <AppText variant="bodySmall" color="muted">
          {quickActionSummary.detail}
        </AppText>
      </View>

      <View style={styles.quickActionList}>
        {quickActions.map((action) => (
          <View
            key={action.label}
            style={[
              styles.quickActionItem,
              {
                borderColor: `${theme.colors.border}80`,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <AppButton
              label={action.label}
              icon={action.icon}
              compact
              tone={action.tone}
              variant="outline"
              style={styles.quickActionButton}
            />
            <AppText variant="bodySmall" color="muted">
              {action.helper}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

const DocumentAlertsPanel = () => {
  const theme = useAppTheme();
  const resolveTone = (tone: Tone) => {
    switch (tone) {
      case 'warning':
        return { fill: theme.colors.warning, track: `${theme.colors.warning}33` };
      case 'error':
        return { fill: theme.colors.error, track: `${theme.colors.error}33` };
      case 'info':
        return { fill: theme.colors.info, track: `${theme.colors.info}33` };
      default:
        return { fill: theme.colors.primary, track: `${theme.colors.primary}33` };
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}> 
      <AppText variant="titleMedium" color="text" weight="600" style={{ marginBottom: 12 }}>
        Document Alerts
      </AppText>
      {documentAlerts.map((doc) => (
        <View
          key={doc.title}
          style={[styles.docCard, { borderColor: `${theme.colors.border}80`, backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.docHeader}>
            <AppIcon name="file-document" size={20} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" color="text" weight="600">
                {doc.title}
              </AppText>
              <AppText variant="bodySmall" color="muted">
                {doc.entity}
              </AppText>
            </View>
            <AppText variant="labelSmall" color="muted">
              {doc.modified}
            </AppText>
          </View>
          <View style={styles.badgeRow}>
            {doc.badges.map((badge) => {
              const palette = resolveTone(badge.tone as Tone);
              return (
                <View
                  key={badge.label}
                  style={[styles.badge, { backgroundColor: palette.track }]}
                >
                  <AppIcon name="alert-circle" size={14} color={palette.fill} />
                  <AppText variant="labelSmall" style={{ color: palette.fill, fontWeight: '600' }}>
                    {badge.label}
                  </AppText>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};

const ActivityLogCard = ({ data }: { data: ActivityLogEntry[] }) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}> 
      <AppText variant="titleMedium" color="text" weight="600" style={{ marginBottom: 16 }}>
        Activity Log
      </AppText>
      {data.length === 0 ? (
        <AppText variant="bodyMedium" color="muted">No recent activity.</AppText>
      ) : (
        data.map((entry, idx) => (
        <ActivityItem
          key={`${entry.title}-${entry.time}-${idx}`}
          title={entry.title}
          subtitle={entry.subtitle}
          time={entry.time}
          icon={entry.icon}
          color={entry.color}
        />
        ))
      )}
    </View>
  );
};

type Tone = 'primary' | 'warning' | 'error' | 'info';
type AlertBadge = { label: string; tone: Tone };

const documentAlerts: Array<{
  title: string;
  entity: string;
  modified: string;
  badges: AlertBadge[];
}> = [
  {
    title: 'Bank Statement',
    entity: 'Saaet Finance',
    modified: '27 March, 2022',
    badges: [
      { label: 'Mismatched Fonts', tone: 'error' },
      { label: 'Possible Tampering', tone: 'warning' },
    ],
  },
  {
    title: 'Company Letterhead',
    entity: 'Arcadia Textiles',
    modified: 'Auto-generated',
    badges: [{ label: 'Layer Irregularity', tone: 'info' }],
  },
];

const fraudSignals: Array<{ label: string; severity: 'High' | 'Medium' }> = [
  { label: 'Font inconsistency', severity: 'High' },
  { label: 'Metadata mismatch', severity: 'Medium' },
  { label: 'Layer manipulation', severity: 'High' },
  { label: 'Location mismatch', severity: 'High' },
  { label: 'Repeat device used', severity: 'Medium' },
];

const suggestedActions = [
  { label: 'Ask for re-upload', icon: 'cloud-upload' },
  { label: 'Send site inspection request', icon: 'map-marker-check' },
  { label: 'Approve with warning', icon: 'shield-alert' },
];

const activityLogEntries = [
  {
    title: 'Verification Completed',
    subtitle: 'Rahul Kumar - PMEGP',
    time: '2 hours ago',
    icon: 'check-circle',
    color: 'success',
  },
  {
    title: 'New Application',
    subtitle: 'Sita Devi - Mudra',
    time: '5 hours ago',
    icon: 'file-plus',
    color: 'primary',
  },
  {
    title: 'Document Rejected',
    subtitle: 'Amit Singh - Missing Invoice',
    time: '1 day ago',
    icon: 'alert-circle',
    color: 'error',
  },
];

type LatLng = { latitude: number; longitude: number };
type GeoPoint = LatLng & { label: string; subtitle: string; color: string };
type GeoVerificationSnapshot = { evidence: GeoPoint; project: GeoPoint };

const geoVerificationSnapshot: GeoVerificationSnapshot = {
  evidence: {
    label: 'Evidence Upload Ping',
    subtitle: 'Captured near Saki Naka, 12:42 PM',
    latitude: 19.1106,
    longitude: 72.8697,
    color: '#2563EB',
  },
  project: {
    label: 'Sanctioned Project Site',
    subtitle: 'Registered plot, Andheri MIDC',
    latitude: 19.1541,
    longitude: 72.8603,
    color: '#10B981',
  },
};

const RiskScoringCard = () => {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const isWide = width > 900;
  const score = 82;
  const sweepLength = GAUGE_CIRCUMFERENCE * GAUGE_SWEEP_RATIO;
  const progressLength = sweepLength * (score / 100);
  const gradientId = 'riskGaugeGradient';
  const getSeverityPalette = (severity: 'High' | 'Medium') =>
    severity === 'High'
      ? { text: theme.colors.error, background: `${theme.colors.error}26` }
      : { text: theme.colors.warning, background: `${theme.colors.warning}26` };

  return (
    <View style={[styles.card, styles.riskCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardHeader}>
        <View>
          <AppText variant="titleMedium" color="text" weight="600">
            AI-Powered Document Risk Scoring
          </AppText>
          <AppText variant="bodySmall" color="muted">
            Highlights suspicious signals across uploaded proofs
          </AppText>
        </View>
        <AppButton label="View All Flags" compact variant="ghost" icon="shield-alert" />
      </View>

      <View style={[styles.riskGrid, isWide ? styles.riskGridWide : styles.riskGridStack]}>
        <View style={[styles.riskColumn, styles.scorePanel, { backgroundColor: theme.colors.primaryContainer }]}> 
          <View style={styles.scoreHeaderRow}>
            <AppText variant="labelMedium" color="muted">
              Risk Score
            </AppText>
            <AppText variant="labelSmall" color="muted">
              Updated moments ago
            </AppText>
          </View>
          <View style={[styles.scoreSummaryRow, !isWide && styles.scoreSummaryStack]}>
            <View style={styles.gaugeWrapper}>
              <View style={styles.gaugeSvgWrapper}>
                <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
                  <Defs>
                    <SvgLinearGradient id={gradientId} x1="0%" y1="50%" x2="100%" y2="50%" gradientUnits="userSpaceOnUse">
                      <Stop offset="0%" stopColor="#DC2626" />
                      <Stop offset="45%" stopColor="#F97316" />
                      <Stop offset="100%" stopColor="#16A34A" />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle
                    cx={GAUGE_SIZE / 2}
                    cy={GAUGE_SIZE / 2}
                    r={GAUGE_RADIUS}
                    stroke={`url(#${gradientId})`}
                    strokeOpacity={0.25}
                    strokeWidth={GAUGE_STROKE}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${sweepLength} ${GAUGE_CIRCUMFERENCE}`}
                    transform={`rotate(-180 ${GAUGE_SIZE / 2} ${GAUGE_SIZE / 2})`}
                  />
                  <Circle
                    cx={GAUGE_SIZE / 2}
                    cy={GAUGE_SIZE / 2}
                    r={GAUGE_RADIUS}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={GAUGE_STROKE}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${sweepLength} ${GAUGE_CIRCUMFERENCE}`}
                    strokeDashoffset={`${sweepLength - progressLength}`}
                    transform={`rotate(-180 ${GAUGE_SIZE / 2} ${GAUGE_SIZE / 2})`}
                  />
                </Svg>
              </View>
              <View style={styles.gaugeInnerContent}>
                <AppText variant="headlineLarge" color="text" weight="700">
                  {score}
                </AppText>
                <AppText variant="bodySmall" color="muted">
                  out of 100
                </AppText>
                <View style={[styles.riskPill, { backgroundColor: theme.colors.error }]}> 
                  <AppText variant="labelMedium" color="onPrimary" weight="600">
                    High Risk
                  </AppText>
                </View>
              </View>
            </View>
            <View style={styles.aiRecommendationStack}>
              <AppButton
                label="AI Recommendation"
                icon="robot"
                compact
                tone="info"
                variant="primary"
              />
              <AppText variant="bodySmall" color="muted" style={{ textAlign: 'center' }}>
                Manual review required before approval
              </AppText>
            </View>
          </View>
          <View style={styles.suggestedActionsSection}>
            <AppText variant="labelMedium" color="muted" style={{ marginBottom: 8 }}>
              Suggested Actions
            </AppText>
            {suggestedActions.map((action) => (
              <View key={action.label} style={[styles.actionChip, { backgroundColor: theme.colors.surface }]}> 
                <View style={[styles.actionIconBadge, { backgroundColor: `${theme.colors.info}1A` }]}> 
                  <AppIcon name={action.icon as any} size={18} color={theme.colors.info} />
                </View>
                <AppText variant="bodyMedium" color="text" weight="500" style={{ flex: 1 }}>
                  {action.label}
                </AppText>
                <AppIcon name="chevron-right" size={20} color={theme.colors.muted} />
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.riskColumn, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={styles.signalsHeaderRow}>
            <View style={styles.signalsHeaderLeft}>
              <AppIcon name="flag" size={18} color={theme.colors.error} />
              <AppText variant="labelMedium" color="text" weight="600">
                Fraud Signals
              </AppText>
            </View>
            <AppText variant="labelSmall" color="muted" weight="500">
              Severity
            </AppText>
          </View>
          {fraudSignals.map((signal) => {
            const palette = getSeverityPalette(signal.severity);
            return (
              <View key={signal.label} style={styles.signalRow}>
                <AppText variant="bodyMedium" color="text" weight="500" style={{ flex: 1 }}>
                  {signal.label}
                </AppText>
                <View style={[styles.severityBadge, { backgroundColor: palette.background }]}> 
                  <AppText variant="labelSmall" weight="600" style={{ color: palette.text }}>
                    {signal.severity}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <GeoVerificationMap />
    </View>
  );
};

const GeoVerificationMap = () => {
  const theme = useAppTheme();
  const { evidence, project } = geoVerificationSnapshot;
  const distanceKm = calculateDistanceKm(evidence, project);
  const region = buildRegionForPoints(evidence, project);

  return (
    <View style={[styles.geoCard, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.geoHeaderRow}>
        <View>
          <AppText variant="titleSmall" color="text" weight="600">
            Live Geo-Verification
          </AppText>
          <AppText variant="bodySmall" color="muted">
            Comparing evidence ping vs sanctioned project site
          </AppText>
        </View>
        <View style={[styles.distancePill, { backgroundColor: theme.colors.surface }]}> 
          <AppIcon name="map-marker-distance" size={16} color={theme.colors.primary} />
          <AppText variant="labelMedium" color="text" weight="600">
            {distanceKm.toFixed(2)} km apart
          </AppText>
        </View>
      </View>

      <View style={styles.mapWrapper}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
        >
          <Marker
            coordinate={project}
            title={project.label}
            description={project.subtitle}
            pinColor={project.color}
          />
          <Marker
            coordinate={evidence}
            title={evidence.label}
            description={evidence.subtitle}
            pinColor={evidence.color}
          />
        </MapView>
        <View style={[styles.mapBadge, { backgroundColor: `${theme.colors.background}CC` }]}> 
          <AppIcon name="crosshairs-gps" size={14} color={theme.colors.primary} />
          <AppText variant="labelSmall" color="text">
            Live location checks
          </AppText>
        </View>
      </View>

      <View style={styles.geoLegendRow}>
        {[project, evidence].map((point) => (
          <View key={point.label} style={styles.geoLegendItem}>
            <View style={[styles.geoLegendDot, { backgroundColor: point.color }]} />
            <View style={{ flex: 1 }}>
              <AppText variant="labelMedium" color="text" weight="600">
                {point.label}
              </AppText>
              <AppText variant="bodySmall" color="muted">
                {point.subtitle}
              </AppText>
            </View>
          </View>
        ))}
      </View>
      <AppText variant="bodySmall" color="muted">
        Distance difference indicates how far the upload location drifted from the sanctioned coordinates.
      </AppText>
    </View>
  );
};

const EARTH_RADIUS_KM = 6371;
const toRad = (value: number) => (value * Math.PI) / 180;

const calculateDistanceKm = (pointA: LatLng, pointB: LatLng) => {
  const dLat = toRad(pointB.latitude - pointA.latitude);
  const dLon = toRad(pointB.longitude - pointA.longitude);
  const lat1 = toRad(pointA.latitude);
  const lat2 = toRad(pointB.latitude);

  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return EARTH_RADIUS_KM * c;
};

const buildRegionForPoints = (pointA: LatLng, pointB: LatLng) => {
  const latitude = (pointA.latitude + pointB.latitude) / 2;
  const longitude = (pointA.longitude + pointB.longitude) / 2;
  const latitudeDelta = Math.max(Math.abs(pointA.latitude - pointB.latitude) * 2, 0.02);
  const longitudeDelta = Math.max(Math.abs(pointA.longitude - pointB.longitude) * 2, 0.02);
  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 8,
  },
  tabItem: {
    flex: 1,
    minHeight: 40,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 0,
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryStrip: {
    flexDirection: 'row',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  summaryCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionsCard: {
    gap: 16,
  },
  quickActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickSummaryContainer: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  quickSummaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickActionList: {
    gap: 12,
  },
  quickActionItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  quickActionButton: {
    alignSelf: 'stretch',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceCard: {
    gap: 8,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 10,
    minWidth: 180,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  chartWrapper: {
    marginTop: 12,
    height: 220,
    position: 'relative',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  chartTooltip: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 130,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    transform: [{ translateX: -65 }],
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    height: '100%',
  },
  chartBarPressable: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    width: 24,
    height: 160,
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  riskCard: {
    paddingBottom: 24,
  },
  riskGrid: {
    gap: 16,
    width: '100%',
  },
  riskGridStack: {
    flexDirection: 'column',
  },
  riskGridWide: {
    flexDirection: 'row',
  },
  riskColumn: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    gap: 12,
  },
  geoCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  geoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 220,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  geoLegendRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  geoLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 140,
  },
  geoLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  docCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  docHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scorePanel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreSummaryRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 12,
  },
  scoreSummaryStack: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  gaugeWrapper: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  gaugeSvgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
  },
  gaugeInnerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  gaugeInner: {
    width: '100%',
    height: '100%',
    borderRadius: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiRecommendationStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 160,
  },
  riskPill: {
    marginTop: 12,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  suggestedActionsSection: {
    width: '100%',
    marginTop: 16,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    gap: 10,
  },
  actionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signalsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 23, 42, 0.1)',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
