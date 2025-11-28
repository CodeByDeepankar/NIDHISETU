import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { Chip } from '@/components/atoms/chip';
import { InputField } from '@/components/atoms/input-field';
import { useAppTheme } from '@/hooks/use-app-theme';
import { twilioVerifyClient } from '@/services/twilioVerify';
import { useAuthStore } from '@/state/authStore';

import { HeroSurface, InfoRow, Pill, SectionCard, useBeneficiaryPalette } from './ui-kit';

const languageOptions = ['English', 'हिन्दी', 'मराठी'] as const;

export const BeneficiaryProfileScreen = () => {
  const profile = useAuthStore((state) => state.profile);
  const logoutAction = useAuthStore((state) => state.actions.logout);
  const theme = useAppTheme();
  const palette = useBeneficiaryPalette();
  const [language, setLanguage] = useState<(typeof languageOptions)[number]>('English');
  const [highContrast, setHighContrast] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [voicePrompts, setVoicePrompts] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [otpStatus, setOtpStatus] = useState<'idle' | 'sending' | 'codeSent' | 'verifying' | 'verified' | 'error'>('idle');
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [lastVerifiedAt, setLastVerifiedAt] = useState<string | null>(null);
  const [verificationTarget, setVerificationTarget] = useState<string | null>(null);

  const personalInfo = useMemo(
    () => [
      { label: 'Full Name', value: profile?.name ?? 'Field Beneficiary' },
      { label: 'Village', value: (profile as any)?.village ?? 'Unknown' },
      { label: 'District', value: (profile as any)?.district ?? '—' },
      { label: 'Bank', value: (profile as any)?.bank ?? '—' },
    ],
    [profile]
  );

  const loanInfo = [
    { label: 'Scheme', value: 'PMEGP' },
    { label: 'Loan Amount', value: '₹1,50,000' },
    { label: 'Sanction Date', value: '12 Feb 2024' },
    { label: 'Loan ID', value: '#LN-9023' },
  ];

  const rewardStats = [
    { label: 'Verified Visits', value: '18' },
    { label: 'Points Earned', value: '240' },
    { label: 'Tier', value: 'Trusted Champion' },
  ];

  const formattedPhone = formatDisplayPhone(profile?.mobile);

  const sendRealtimeOtp = async () => {
    if (!profile?.mobile) {
      setOtpStatus('error');
      setOtpMessage('No mobile number found in your profile.');
      return;
    }
    try {
      setOtpStatus('sending');
      setOtpMessage(null);
      await twilioVerifyClient.sendVerification(profile.mobile);
      setVerificationTarget(profile.mobile);
      setOtpStatus('codeSent');
      setOtpMessage(`OTP sent to ${formatDisplayPhone(toE164(profile.mobile))}`);
    } catch (error) {
      setOtpStatus('error');
      setOtpMessage(error instanceof Error ? error.message : 'Unable to send OTP at the moment.');
    }
  };

  const verifyRealtimeOtp = async () => {
    if (!verificationTarget || !otpCode) {
      return;
    }
    try {
      setOtpStatus('verifying');
      const approved = await twilioVerifyClient.checkVerification(verificationTarget, otpCode);
      if (!approved) {
        throw new Error('Invalid verification code.');
      }
      setOtpStatus('verified');
      setOtpMessage('Phone number verified via Twilio.');
      setLastVerifiedAt(new Date().toISOString());
      setOtpCode('');
    } catch (error) {
      setOtpStatus('error');
      setOtpMessage(error instanceof Error ? error.message : 'Invalid verification code.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          logoutAction();
        },
      },
    ]);
  };

  const heroStats = rewardStats.map((stat) => ({ label: stat.label, value: stat.value }));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: theme.spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <HeroSurface>
          <View style={styles.heroHeader}>
            <View>
              <Text style={[styles.eyebrow, { color: palette.subtext }]}>Beneficiary profile</Text>
              <Text style={[styles.heroTitle, { color: palette.text }]}>{personalInfo[0].value}</Text>
              <Text style={[styles.heroSubtitle, { color: palette.subtext }]}>{personalInfo[1].value}</Text>
            </View>
          </View>
          <Text style={[styles.heroBody, { color: palette.text }]}>
            Keep your Farmer Motion identity, contact preferences, and AI verifications aligned in one place.
          </Text>
          <View style={styles.heroPills}>
            <Pill label={`Language · ${language}`} tone="sky" />
            <Pill label={notifications ? 'Alerts on' : 'Alerts muted'} tone={notifications ? 'success' : 'warning'} />
            <Pill label={`Visits · ${rewardStats[0].value}`} tone="violet" />
          </View>
          <View style={styles.heroMetrics}>
            {heroStats.map((stat) => (
              <HeroMetric key={stat.label} label={stat.label} value={stat.value} palette={palette} />
            ))}
          </View>
          <View style={styles.heroActions}>
            <AppButton label="Update photo" variant="ghost" icon="camera" style={styles.heroButton} />
            <AppButton label="Redeem points" icon="gift" variant="secondary" style={styles.heroButton} />
          </View>
        </HeroSurface>

        <SectionCard title="Identity & KYC" subtitle="Field details for service delivery" accentLabel="Profile">
          {personalInfo.map((item) => (
            <InfoRow key={item.label} label={item.label} value={item.value} />
          ))}
          <AppButton label="Edit KYC" variant="secondary" icon="pencil" />
        </SectionCard>

        <SectionCard
          title="Realtime phone authentication"
          subtitle="Secure your account with live OTP"
          accentLabel={otpStatus === 'verified' ? 'Verified' : 'Action'}
        >
          <InfoRow label="Linked Mobile" value={formattedPhone} />
          <InfoRow label="Verification Status" value={otpStatus === 'verified' ? 'Verified via Twilio' : 'Not linked yet'} />
          {lastVerifiedAt ? <InfoRow label="Last Verified" value={new Date(lastVerifiedAt).toLocaleString()} /> : null}
          <View style={styles.rowGap}>
            <AppButton
              label={otpStatus === 'codeSent' ? 'Resend OTP' : 'Send OTP'}
              icon="shield-check"
              onPress={sendRealtimeOtp}
              loading={otpStatus === 'sending'}
              compact
            />
            {otpStatus === 'verified' ? <Chip label="Verified" tone="success" /> : null}
          </View>
          {otpStatus === 'codeSent' || otpStatus === 'verifying' || otpStatus === 'error' ? (
            <>
              <InputField
                label="Verification Code"
                placeholder="6 digit code"
                keyboardType="number-pad"
                maxLength={6}
                value={otpCode}
                onChangeText={setOtpCode}
              />
              <AppButton
                label="Confirm Code"
                icon="check"
                onPress={verifyRealtimeOtp}
                loading={otpStatus === 'verifying'}
                disabled={!otpCode}
              />
            </>
          ) : null}
          {otpMessage ? (
            <AppText variant="labelSmall" color={otpStatus === 'error' ? 'error' : 'muted'}>
              {otpMessage}
            </AppText>
          ) : null}
        </SectionCard>

        <SectionCard title="Loan information" subtitle="Linked PMEGP application" accentLabel="Linked">
          {loanInfo.map((item) => (
            <InfoRow key={item.label} label={item.label} value={item.value} />
          ))}
          <View style={styles.rowGap}>
            <Chip label="Verified" tone="success" />
            <Chip label="Auto-sync" tone="secondary" />
          </View>
        </SectionCard>

        <SectionCard title="Upload status & AI results" subtitle="Last sync snapshot" accentLabel="Sync">
          <View style={[styles.rowGap, { alignItems: 'center' }]}
            accessibilityRole="summary"
          >
            <AppIcon name="cloud-sync" size={20} color="primary" />
            <AppText variant="bodyMedium" color="text">
              2 pending uploads · Last sync 10:12 AM
            </AppText>
          </View>
          <View style={[styles.rowGap, { marginTop: theme.spacing.sm }]}>
            <Chip label="AI Confidence 93%" tone="info" />
            <Chip label="Geo-tag OK" tone="success" />
            <Chip label="Blur check passed" tone="secondary" />
          </View>
          <AppButton label="View upload queue" variant="outline" icon="playlist-check" />
        </SectionCard>

        <SectionCard title="Language & accessibility" subtitle="Make the app comfortable">
          <AppText variant="labelMedium" color="muted">
            Preferred language
          </AppText>
          <View style={[styles.rowGap, { marginBottom: theme.spacing.sm }]}>
            {languageOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                tone={language === option ? 'primary' : 'muted'}
                backgroundColor={language === option ? theme.colors.primaryContainer : palette.mutedSurface}
                onPress={() => setLanguage(option)}
              />
            ))}
          </View>
          <ToggleRow label="High contrast text" active={highContrast} onToggle={() => setHighContrast((prev) => !prev)} />
          <ToggleRow label="Voice prompts" active={voicePrompts} onToggle={() => setVoicePrompts((prev) => !prev)} />
        </SectionCard>

        <SectionCard title="Rewards & progress" subtitle="Stay on the leaderboard">
          <View style={styles.statsGrid}>
            {rewardStats.map((stat) => (
              <View key={stat.label} style={[styles.statCard, { borderColor: palette.border, backgroundColor: palette.surface }]}
                accessibilityRole="summary"
              >
                <AppText variant="headlineMedium" color="primary">
                  {stat.value}
                </AppText>
                <AppText variant="labelMedium" color="muted">
                  {stat.label}
                </AppText>
              </View>
            ))}
          </View>
          <AppButton label="Redeem points" icon="gift" variant="secondary" />
        </SectionCard>

        <SectionCard title="Help & support" subtitle="Reach us anytime">
          <View style={styles.supportRow}>
            <AppButton label="Call support" variant="outline" icon="phone" />
            <AppButton label="FAQs" variant="outline" icon="book-open-page-variant" />
            <AppButton label="Chatbot" variant="outline" icon="robot" />
          </View>
        </SectionCard>

        <SectionCard title="App settings" subtitle="Control notifications & privacy">
          <ToggleRow label="Notifications" active={notifications} onToggle={() => setNotifications((prev) => !prev)} />
          <ToggleRow label="Biometric login" active onToggle={() => undefined} />
          <AppButton label="Data & privacy" variant="ghost" icon="shield-key" style={{ alignSelf: 'flex-start' }} />
        </SectionCard>

        <AppButton label="Logout" tone="error" icon="logout" variant="outline" onPress={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
};

const HeroMetric = ({ label, value, palette }: { label: string; value: string; palette: ReturnType<typeof useBeneficiaryPalette> }) => (
  <View style={[styles.metricCard, { borderColor: palette.border, backgroundColor: palette.mutedSurface }]}
    accessibilityLabel={label}
  >
    <Text style={[styles.metricLabel, { color: palette.subtext }]}>{label}</Text>
    <Text style={[styles.metricValue, { color: palette.text }]}>{value}</Text>
  </View>
);

const ToggleRow = ({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) => (
  <View style={[styles.toggleRow, styles.rowGap]}>
    <AppText variant="bodyMedium" color="text" style={{ flex: 1 }}>
      {label}
    </AppText>
    <AppButton
      label={active ? 'On' : 'Off'}
      variant={active ? 'secondary' : 'outline'}
      tone={active ? 'primary' : 'muted'}
      onPress={onToggle}
    />
  </View>
);

const toE164 = (value?: string) => {
  if (!value) return '';
  const digits = value.replace(/[^0-9+]/g, '');
  if (digits.startsWith('+')) {
    return digits;
  }
  return `+91${digits}`;
};

const formatDisplayPhone = (value?: string) => {
  if (!value) return 'Not provided';
  const digits = toE164(value);
  return digits.replace(/(\+\d{2})(\d{5})(\d{5})/, '$1 $2 $3');
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  heroButton: {
    flexGrow: 1,
    minWidth: 140,
  },
  rowGap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flexBasis: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  supportRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toggleRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
  },
});
