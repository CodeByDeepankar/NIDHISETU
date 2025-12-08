import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { WaveHeader } from '@/components/molecules/wave-header';
import { useAppTheme } from '@/hooks/use-app-theme';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const GAUGE_SIZE = 210;
const GAUGE_STROKE = 22;
const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_STROKE) / 2;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;
const GAUGE_SWEEP_DEG = 180;
const GAUGE_SWEEP_RATIO = GAUGE_SWEEP_DEG / 360;

export const ReportsScreen = () => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WaveHeader
        title="Reports & Analytics"
        subtitle="Performance metrics and summaries"
        height={180}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryRow}>
          <SummaryCard label="Total Applications" value="124" icon="file-document-outline" color="#4F46E5" />
          <SummaryCard label="Approved" value="86" icon="check-circle-outline" color="#10B981" />
        </View>
        <View style={styles.summaryRow}>
          <SummaryCard label="Pending" value="32" icon="clock-outline" color="#F59E0B" />
          <SummaryCard label="Rejected" value="6" icon="close-circle-outline" color="#EF4444" />
        </View>

        <RiskScoringCard />

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <AppText variant="titleMedium" color="text" weight="600">
              Monthly Performance
            </AppText>
            <AppButton label="Export" variant="ghost" size="small" icon="download" />
          </View>
          
          <View style={styles.chartPlaceholder}>
            <View style={[styles.bar, { height: '60%', backgroundColor: theme.colors.primary }]} />
            <View style={[styles.bar, { height: '80%', backgroundColor: theme.colors.primary }]} />
            <View style={[styles.bar, { height: '40%', backgroundColor: theme.colors.primary }]} />
            <View style={[styles.bar, { height: '90%', backgroundColor: theme.colors.primary }]} />
            <View style={[styles.bar, { height: '70%', backgroundColor: theme.colors.primary }]} />
            <View style={[styles.bar, { height: '50%', backgroundColor: theme.colors.primary }]} />
          </View>
          <View style={styles.chartLabels}>
            <AppText variant="labelSmall" color="muted">May</AppText>
            <AppText variant="labelSmall" color="muted">Jun</AppText>
            <AppText variant="labelSmall" color="muted">Jul</AppText>
            <AppText variant="labelSmall" color="muted">Aug</AppText>
            <AppText variant="labelSmall" color="muted">Sep</AppText>
            <AppText variant="labelSmall" color="muted">Oct</AppText>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <AppText variant="titleMedium" color="text" weight="600" style={{ marginBottom: 16 }}>
            Recent Activity
          </AppText>
          
          <ActivityItem 
            title="Verification Completed" 
            subtitle="Rahul Kumar - PMEGP" 
            time="2 hours ago" 
            icon="check-circle"
            color="success"
          />
          <ActivityItem 
            title="New Application" 
            subtitle="Sita Devi - Mudra" 
            time="5 hours ago" 
            icon="file-plus"
            color="primary"
          />
          <ActivityItem 
            title="Document Rejected" 
            subtitle="Amit Singh - Missing Invoice" 
            time="1 day ago" 
            icon="alert-circle"
            color="error"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const SummaryCard = ({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
        <AppIcon name={icon as any} size={24} color={color as any} />
      </View>
      <View>
        <AppText variant="headlineSmall" color="text" weight="700">
          {value}
        </AppText>
        <AppText variant="labelSmall" color="muted">
          {label}
        </AppText>
      </View>
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

const riskBreakdown: Array<{ label: string; value: number; tone: Tone }> = [
  { label: 'Font Inconsistency', value: 92, tone: 'error' },
  { label: 'Metadata Mismatch', value: 75, tone: 'info' },
  { label: 'Layer Manipulation', value: 81, tone: 'warning' },
  { label: 'Cross-Document Mismatch', value: 66, tone: 'primary' },
  { label: 'Image Tampering', value: 78, tone: 'error' },
];

const RiskScoringCard = () => {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const isWide = width > 900;
  const score = 82;
  const minAngle = -180;
  const maxAngle = 0;
  const scoreAngle = minAngle + (score / 100) * (maxAngle - minAngle);
  const sweepLength = GAUGE_CIRCUMFERENCE * GAUGE_SWEEP_RATIO;
  const progressLength = sweepLength * (score / 100);
  const gradientId = 'riskGaugeGradient';
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
        <AppButton label="View All Flags" size="small" variant="ghost" icon="shield-alert" />
      </View>

      <View style={[styles.riskGrid, isWide ? styles.riskGridWide : styles.riskGridStack]}>
        <View style={[styles.riskColumn, { backgroundColor: theme.colors.infoContainer }]}>
          <AppText variant="labelMedium" color="muted" style={{ marginBottom: 8 }}>
            Uploaded Documents
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

        <View style={[styles.riskColumn, styles.scorePanel, { backgroundColor: theme.colors.primaryContainer }]}> 
          <AppText variant="labelMedium" color="muted">
            Risk Score
          </AppText>
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
              <AppText variant="displayLarge" color="text" weight="700">
                {score}
              </AppText>
              <AppText variant="bodyMedium" color="muted">
                / 100
              </AppText>
              <View style={[styles.riskPill, { backgroundColor: theme.colors.error }]}> 
                <AppText variant="labelMedium" color="onPrimary" weight="600">
                  High Risk
                </AppText>
              </View>
            </View>
          </View>
          <View style={styles.gaugeScale}>
            <AppText variant="labelSmall" color="muted">
              0
            </AppText>
            <AppText variant="labelSmall" color="muted">
              100
            </AppText>
          </View>
          <View style={[styles.aiNote, { backgroundColor: `${theme.colors.info}18` }]}>
            <AppIcon name="robot" size={16} color={theme.colors.info} />
            <AppText variant="labelSmall" color="muted">
              AI Recommendation: Manual review required
            </AppText>
          </View>
        </View>

        <View style={[styles.riskColumn, { backgroundColor: theme.colors.surfaceVariant }]}>
          <AppText variant="labelMedium" color="muted" style={{ marginBottom: 8 }}>
            Risk Breakdown
          </AppText>
          {riskBreakdown.map((item) => {
            const palette = resolveTone(item.tone as Tone);
            return (
              <View key={item.label} style={styles.breakdownRow}>
                <View style={styles.breakdownHeader}>
                  <AppText variant="bodyMedium" color="text" weight="500">
                    {item.label}
                  </AppText>
                  <AppText variant="bodyMedium" color="text" weight="600" style={{ color: palette.fill }}>
                    {item.value}%
                  </AppText>
                </View>
                <View style={[styles.riskBarTrack, { backgroundColor: palette.track }]}>
                  <View style={[styles.riskBarFill, { width: `${item.value}%`, backgroundColor: palette.fill }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
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
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    opacity: 0.8,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
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
  gaugeWrapper: {
    width: '100%',
    alignItems: 'center',
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
  riskPill: {
    marginTop: 12,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  gaugeScale: {
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  aiNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
  },
  breakdownRow: {
    marginBottom: 12,
    gap: 6,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskBarTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2563EB',
  },
});
