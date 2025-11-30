import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@/hooks/use-app-theme';

import { ThemeToggleButton } from './ui-kit';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
type IoniconName = keyof typeof Ionicons.glyphMap;

const palette = {
  primary: '#0E9F6E',
  primarySoft: '#42D8A1',
  accentAmber: '#F5A524',
  accentSky: '#38BDF8',
  accentViolet: '#7C5CFC',
  forest: '#052B27',
  deepText: '#0F172A',
  mutedText: '#5F6C80',
};

const heroSnapshot = {
  farmer: 'Aditi Sharma',
  stage: 'Farmer Motion · Stage 3 of 5',
  nextVisit: 'Next geo-tag check · 05 Dec · 09:30 AM',
  progress: 0.72,
};

const heroStats: Array<{ icon: IoniconName; label: string; value: string; meta: string }> = [
  { icon: 'water', label: 'Soil moisture', value: '62%', meta: 'Ideal band · +4% vs last week' },
  { icon: 'document-text', label: 'Docs synced', value: '12 / 15', meta: '3 pending evidence packets' },
  { icon: 'leaf', label: 'Soil health', value: 'Grade A-', meta: 'Stable · 2 bio inputs used' },
];

type InsightCard = {
  id: string;
  icon: IoniconName;
  title: string;
  value: string;
  meta: string;
  chip: string;
  accent: string;
};

const insightCards: InsightCard[] = [
  {
    id: 'crop-health',
    icon: 'sunny',
    title: 'Crop vitality',
    value: '92%',
    meta: 'Sensors show strong canopy growth',
    chip: 'Thriving',
    accent: '#FCD34D',
  },
  {
    id: 'irrigation',
    icon: 'rainy',
    title: 'Irrigation window',
    value: 'Tonight · 11pm',
    meta: 'Smart gates scheduled for 34 mins',
    chip: 'Auto-set',
    accent: '#38BDF8',
  },
  {
    id: 'credit-usage',
    icon: 'bar-chart',
    title: 'Credit utilized',
    value: '58%',
    meta: '₹7.2L of ₹12.5L limit used',
    chip: 'Healthy',
    accent: '#A855F7',
  },
];

type MotionStep = {
  id: string;
  icon: IoniconName;
  title: string;
  detail: string;
  status: 'Ready' | 'In Progress' | 'Blocked';
  eta: string;
};

const farmerMotion: MotionStep[] = [
  {
    id: 'capture',
    icon: 'scan',
    title: 'Geo evidence capture',
    detail: 'Pump-set & drip layout tagging',
    status: 'In Progress',
    eta: 'Due today',
  },
  {
    id: 'verification',
    icon: 'checkmark-circle',
    title: 'Officer walkthrough',
    detail: 'On-ground validation slot booked',
    status: 'Ready',
    eta: '05 Dec · 09:30 AM',
  },
  {
    id: 'sanction',
    icon: 'shield-checkmark',
    title: 'Sanction sync',
    detail: 'Awaiting remaining invoices',
    status: 'Blocked',
    eta: 'Upload 3 files',
  },
];

const supportTiles: Array<{ id: string; icon: IoniconName; title: string; detail: string; cta: string }> = [
  {
    id: 'advisor',
    icon: 'call',
    title: 'Talk to agri officer',
    detail: 'Rahul Mehta · Avg wait 4 mins',
    cta: 'Request call back',
  },
  {
    id: 'docs',
    icon: 'document-text',
    title: 'Compliance studio',
    detail: 'AI pre-check for invoices & soil cards',
    cta: 'Open workspace',
  },
];

export const DashboardScreen = () => {
  const theme = useAppTheme();
  const isDark = theme.mode === 'dark';
  const heroShift = useSharedValue(32);
  const heroOpacity = useSharedValue(0);
  const cardsEntrance = useSharedValue(0);

  useEffect(() => {
    heroShift.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });
    heroOpacity.value = withTiming(1, { duration: 700 });
    cardsEntrance.value = withDelay(120, withTiming(1, { duration: 600 }));
  }, [cardsEntrance, heroOpacity, heroShift]);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: heroShift.value }],
    opacity: heroOpacity.value,
  }));

  const cardsStyle = useAnimatedStyle(() => ({
    opacity: cardsEntrance.value,
    transform: [{ translateY: (1 - cardsEntrance.value) * 12 }],
  }));

  const containerColor = isDark ? theme.colors.background : '#EEF4F2';
  const cardColor = isDark ? theme.colors.card : '#FFFFFF';
  const softSurface = isDark ? 'rgba(255,255,255,0.035)' : '#F7FAF8';
  const borderColor = isDark ? theme.colors.border : '#E2E8F0';
  const headingColor = isDark ? theme.colors.text : palette.deepText;
  const subTextColor = isDark ? theme.colors.subtext : palette.mutedText;

  const motionSummary = useMemo(() => {
    if (heroSnapshot.progress >= 0.9) return 'Verification complete — awaiting disbursal';
    if (heroSnapshot.progress >= 0.6) return 'Almost there · finish Farmer Motion evidence uploads';
    return 'Keep capturing geo evidence to stay on schedule';
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: containerColor }]} accessibilityLabel="Beneficiary dashboard">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: subTextColor }]}>Namaste, welcome back</Text>
            <Text style={[styles.title, { color: headingColor }]}>{heroSnapshot.farmer}</Text>
          </View>
        </View>

        <AnimatedLinearGradient
          colors={[palette.primary, palette.primarySoft, palette.forest]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, heroStyle]}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Text style={styles.heroBadgeLabel}>{heroSnapshot.stage}</Text>
            </View>
            <ThemeToggleButton variant="icon" />
          </View>
          <Text style={styles.heroTitle}>Agri credit journey</Text>
          <Text style={styles.heroSubtitle}>{heroSnapshot.nextVisit}</Text>
          <View style={styles.heroProgressTrack}>
            <View style={[styles.heroProgressFill, { width: `${heroSnapshot.progress * 100}%` }]} />
          </View>
          <Text style={styles.heroHint}>{motionSummary}</Text>
          <View style={styles.heroStatsRow}>
            {heroStats.map((stat) => (
              <View key={stat.label} style={styles.heroStatCard}>
                <Ionicons name={stat.icon} size={18} color="#E7F8F1" />
                <Text style={styles.heroStatLabel}>{stat.label}</Text>
                <Text style={styles.heroStatValue}>{stat.value}</Text>
                <Text style={styles.heroStatMeta}>{stat.meta}</Text>
              </View>
            ))}
          </View>
        </AnimatedLinearGradient>

        <Animated.View style={[cardsStyle, styles.sectionBlock]}>
          <SectionHeader
            title="Field pulse"
            subtitle="Shadcn-inspired cards tuned for agri insights"
            headingColor={headingColor}
            subtextColor={subTextColor}
          />
          <View style={styles.insightGrid}>
            {insightCards.map((card) => (
              <InsightCardView
                key={card.id}
                card={card}
                cardColor={cardColor}
                borderColor={borderColor}
                textColor={headingColor}
                subtextColor={subTextColor}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[cardsStyle, styles.sectionBlock]}>
          <SectionHeader
            title="Farmer Motion"
            subtitle="Track evidence capture & sanction flow"
            headingColor={headingColor}
            subtextColor={subTextColor}
          />
          <View style={{ gap: 12 }}>
            {farmerMotion.map((step) => (
              <MotionStepCard
                key={step.id}
                step={step}
                cardColor={cardColor}
                borderColor={borderColor}
                textColor={headingColor}
                subtextColor={subTextColor}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[cardsStyle, styles.sectionBlock]}>
          <SectionHeader
            title="Support hub"
            subtitle="Guided help without touching backend"
            headingColor={headingColor}
            subtextColor={subTextColor}
          />
          <View style={styles.supportGrid}>
            {supportTiles.map((tile) => (
              <SupportTile
                key={tile.id}
                tile={tile}
                cardColor={softSurface}
                borderColor={borderColor}
                textColor={headingColor}
                subtextColor={subTextColor}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const InsightCardView = ({
  card,
  cardColor,
  borderColor,
  textColor,
  subtextColor,
}: {
  card: InsightCard;
  cardColor: string;
  borderColor: string;
  textColor: string;
  subtextColor: string;
}) => {
  const { animatedStyle, handlePressIn, handlePressOut } = usePressFeedback();
  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.95}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.insightCard, animatedStyle, { backgroundColor: cardColor, borderColor }]}
    >
      <View style={[styles.insightIcon, { backgroundColor: `${card.accent}16` }]} accessibilityLabel={card.title}>
        <Ionicons name={card.icon} size={20} color={card.accent} />
      </View>
      <View style={styles.insightHeader}>
        <Text style={[styles.insightTitle, { color: textColor }]}>{card.title}</Text>
        <View style={[styles.insightChip, { backgroundColor: `${card.accent}29` }]}
        >
          <Text style={[styles.insightChipText, { color: card.accent }]}>{card.chip}</Text>
        </View>
      </View>
      <Text style={[styles.insightValue, { color: textColor }]}>{card.value}</Text>
      <Text style={[styles.insightMeta, { color: subtextColor }]}>{card.meta}</Text>
    </AnimatedTouchableOpacity>
  );
};

const MotionStepCard = ({
  step,
  cardColor,
  borderColor,
  textColor,
  subtextColor,
}: {
  step: MotionStep;
  cardColor: string;
  borderColor: string;
  textColor: string;
  subtextColor: string;
}) => {
  const { animatedStyle, handlePressIn, handlePressOut } = usePressFeedback();
  const statusColors: Record<MotionStep['status'], string> = {
    Ready: '#22C55E',
    'In Progress': '#FACC15',
    Blocked: '#F87171',
  };

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.95}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.motionCard, animatedStyle, { backgroundColor: cardColor, borderColor }]}
    >
      <View style={styles.motionIconWrap}>
        <Ionicons name={step.icon} size={20} color={palette.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.motionTitle, { color: textColor }]}>{step.title}</Text>
        <Text style={[styles.motionMeta, { color: subtextColor }]}>{step.detail}</Text>
        <Text style={[styles.motionEta, { color: subtextColor }]}>{step.eta}</Text>
      </View>
      <View style={[styles.statusPill, { borderColor: statusColors[step.status] }]}
      >
        <Text style={[styles.statusText, { color: statusColors[step.status] }]}>{step.status}</Text>
      </View>
    </AnimatedTouchableOpacity>
  );
};

const SupportTile = ({
  tile,
  cardColor,
  borderColor,
  textColor,
  subtextColor,
}: {
  tile: { id: string; icon: IoniconName; title: string; detail: string; cta: string };
  cardColor: string;
  borderColor: string;
  textColor: string;
  subtextColor: string;
}) => {
  const { animatedStyle, handlePressIn, handlePressOut } = usePressFeedback();
  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.95}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.supportTile, animatedStyle, { backgroundColor: cardColor, borderColor }]}
    >
      <View style={styles.supportIconWrap}>
        <Ionicons name={tile.icon} size={20} color={palette.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.supportTitle, { color: textColor }]}>{tile.title}</Text>
        <Text style={[styles.supportDetail, { color: subtextColor }]}>{tile.detail}</Text>
        <Text style={[styles.supportCta, { color: palette.primary }]}>{tile.cta}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={subtextColor} />
    </AnimatedTouchableOpacity>
  );
};

const SectionHeader = ({
  title,
  subtitle,
  headingColor,
  subtextColor,
}: {
  title: string;
  subtitle?: string;
  headingColor: string;
  subtextColor: string;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color: headingColor }]}>{title}</Text>
    {subtitle ? <Text style={[styles.sectionSubtitle, { color: subtextColor }]}>{subtitle}</Text> : null}
  </View>
);

const usePressFeedback = () => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 120 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 120 });
  };

  return { animatedStyle, handlePressIn, handlePressOut };
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1FAE5',
  },
  heroBadgeLabel: {
    color: '#E7F8F1',
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    color: '#E3FFFB',
    fontSize: 14,
    lineHeight: 20,
  },
  heroHeaderActions: {
    alignItems: 'flex-end',
    gap: 8,
    paddingRight: 20,
  },
  heroProgressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FACC15',
  },
  heroHint: {
    color: '#D1FBEF',
    fontSize: 13,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: 'rgba(5, 43, 39, 0.35)',
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  heroStatLabel: {
    color: 'rgba(231,248,241,0.75)',
    fontSize: 12,
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  heroStatMeta: {
    color: 'rgba(231,248,241,0.8)',
    fontSize: 11,
  },
  sectionBlock: {
    gap: 16,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  insightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insightCard: {
    flexBasis: '48%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  insightChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  insightChipText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  insightValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  insightMeta: {
    fontSize: 13,
  },
  motionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  motionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(14,159,110,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  motionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  motionMeta: {
    fontSize: 13,
  },
  motionEta: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  supportGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  supportTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  supportIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(14,159,110,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  supportDetail: {
    fontSize: 13,
  },
  supportCta: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});
