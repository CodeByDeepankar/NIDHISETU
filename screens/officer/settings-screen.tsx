import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { InputField } from '@/components/atoms/input-field';
import { WaveHeader } from '@/components/molecules/wave-header';
import type { ThemeMode } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTheme } from '@/hooks/use-theme';
import type { OfficerStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/state/authStore';
import type { OfficerProfile } from '@/types/entities';

const HEADER_HEIGHT = 160;

type SectionKey = 'profile' | 'security' | 'preferences';
type Frequency = 'realtime' | 'daily' | 'off';
type ThemePref = ThemeMode;
type LanguageCode = 'en' | 'hi' | 'bn' | 'te';
type SecurityTone = 'success' | 'warning' | 'error';

interface FormValues {
  name: string;
  mobile: string;
  email: string;
  designation: string;
}

const CollapsibleCard: React.FC<{
  title: string;
  icon: string;
  open: boolean;
  onToggle: () => void;
  badge?: string;
  badgeTone?: SecurityTone;
  children: React.ReactNode;
}> = ({ title, icon, open, onToggle, badge, badgeTone = 'success', children }) => {
  const theme = useAppTheme();
  const badgeColors: Record<SecurityTone, string> = {
    success: theme.colors.success ?? '#16a34a',
    warning: theme.colors.warning ?? '#f59e0b',
    error: theme.colors.error ?? '#dc2626',
  };
  const tinted = theme.colors.surfaceVariant ?? '#f4f6fb';
  return (
    <View style={[styles.card, { backgroundColor: tinted }]}> 
      <TouchableOpacity accessibilityRole="button" onPress={onToggle} activeOpacity={0.9} style={styles.cardHeaderRow}>
        <View style={styles.headerLeft}>
          <AppIcon name={icon as any} size={20} color="primary" />
          <AppText variant="titleMedium" weight="700" color="text">
            {title}
          </AppText>
          {badge ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: `${badgeColors[badgeTone]}22`, borderColor: badgeColors[badgeTone] },
              ]}
            >
              <AppText variant="labelSmall" weight="700" style={{ color: badgeColors[badgeTone] }}>
                {badge}
              </AppText>
            </View>
          ) : null}
        </View>
        <AppIcon name={open ? 'chevron-up' : 'chevron-down'} size={18} color="muted" />
      </TouchableOpacity>
      {open ? <View style={{ paddingTop: 4 }}>{children}</View> : null}
    </View>
  );
};

const ProgressBar = ({ value }: { value: number }) => {
  const theme = useAppTheme();
  const pct = Math.min(100, Math.max(0, value));
  return (
    <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceVariant ?? '#e5e7eb' }]}> 
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: theme.colors.primary }]} />
    </View>
  );
};

const Snackbar = ({ visible, message }: { visible: boolean; message: string }) => {
  const theme = useAppTheme();
  if (!visible) return null;
  return (
    <View style={[styles.snackbar, { backgroundColor: theme.colors.surface }]}> 
      <AppIcon name="check-circle" size={18} color="success" />
      <AppText variant="bodySmall" color="text" weight="600">
        {message}
      </AppText>
    </View>
  );
};

export const SettingsScreen = () => {
  const { theme, mode, setThemeMode, hydrated } = useTheme();
  const navigation = useNavigation<NavigationProp<OfficerStackParamList>>();
  const authProfile = useAuthStore((state) => state.profile) as OfficerProfile | null;
  const updateProfile = useAuthStore((state) => state.actions.updateProfile);

  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    profile: true,
    security: true,
    preferences: true,
  });
  const [form, setForm] = useState<FormValues>({
    name: authProfile?.name ?? '',
    mobile: authProfile?.mobile ?? '',
    email: authProfile?.email ?? '',
    designation: authProfile?.designation ?? '',
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [frequency, setFrequency] = useState<Frequency>('realtime');
  const [themePref, setThemePref] = useState<ThemePref>('light');
  const [language, setLanguage] = useState<LanguageCode>('en');

  useEffect(() => {
    if (!hydrated) return;
    setThemePref(mode);
  }, [mode, hydrated]);

  useEffect(() => {
    // Keep form in sync if profile changes elsewhere.
    if (!authProfile) return;
    setForm({
      name: authProfile.name ?? '',
      mobile: authProfile.mobile ?? '',
      email: authProfile.email ?? '',
      designation: authProfile.designation ?? '',
    });
    setDirty(false);
  }, [authProfile]);

  const securityStatus = useMemo(() => {
    if (biometricEnabled && twoFactorEnabled) return { label: 'Secure', tone: 'success' as SecurityTone };
    if (biometricEnabled || twoFactorEnabled) return { label: 'Moderate', tone: 'warning' as SecurityTone };
    return { label: 'Weak', tone: 'error' as SecurityTone };
  }, [biometricEnabled, twoFactorEnabled]);

  const toggleSection = (key: SectionKey) => setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSaveProfile = async () => {
    const nextProfile: OfficerProfile = {
      id: authProfile?.id ?? 'OFF-LOCAL',
      role: 'officer',
      name: form.name.trim() || authProfile?.name || 'Officer',
      mobile: form.mobile.trim() || authProfile?.mobile || '',
      email: form.email.trim() || authProfile?.email,
      designation: form.designation.trim() || authProfile?.designation || 'Field Officer',
      department: authProfile?.department ?? 'District Administration',
      region: authProfile?.region ?? 'Assigned Region',
    };

    setSaving(true);
    try {
      updateProfile(nextProfile);
      await new Promise((resolve) => setTimeout(resolve, 250));
      setDirty(false);
      setSnackbar(true);
      setTimeout(() => setSnackbar(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleBiometricToggle = async (next: boolean) => {
    if (next) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert('Device not supported', 'This device cannot use biometrics.');
        return;
      }
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert('Setup required', 'Add fingerprint or face unlock in device settings first.');
        return;
      }
    }
    setBiometricEnabled(next);
  };

  const handleTwoFactorToggle = (next: boolean) => setTwoFactorEnabled(next);
  const handleThemeSelect = (next: ThemeMode) => {
    setThemePref(next);
    setThemeMode(next);
  };

  const handleManageDevices = () => navigation.navigate('ActiveSessions');
  const handleChangePassword = () => navigation.navigate('ChangePassword');

  const profileCompletion = useMemo(() => {
    const total = 4;
    const filled = [form.name, form.mobile, form.email, form.designation].filter(Boolean).length;
    return Math.round((filled / total) * 100);
  }, [form]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <WaveHeader title="Settings" subtitle="Fewer taps • clearer actions" height={HEADER_HEIGHT} />
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.content, { paddingTop: HEADER_HEIGHT - 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}> 
          <View style={styles.profileTopRow}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}> 
              <AppText variant="titleLarge" weight="800" color="primary">
                {form.name?.charAt(0) || 'O'}
              </AppText>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="titleMedium" weight="700" color="text">{form.name || 'Officer'}</AppText>
              <AppText variant="bodySmall" color="muted">{form.designation || 'Field Officer'}</AppText>
              <AppText variant="bodySmall" color="muted">{form.email || 'email@domain.com'}</AppText>
            </View>
            <AppButton
              label="Edit"
              icon="account-edit"
              compact
              onPress={() => toggleSection('profile')}
              style={{ minWidth: 92 }}
              accessibilityLabel="Edit profile details"
            />
          </View>
          <View style={{ marginTop: 12, gap: 6 }}>
            <View style={styles.completionRow}>
              <AppText variant="bodySmall" color="muted">Profile completeness</AppText>
              <AppText variant="bodySmall" weight="700" color="text">{profileCompletion}%</AppText>
            </View>
            <ProgressBar value={profileCompletion} />
          </View>
        </View>

        <CollapsibleCard
          title="Profile"
          icon="account"
          open={sections.profile}
          onToggle={() => toggleSection('profile')}
          badge={dirty ? 'Unsaved' : undefined}
          badgeTone="warning"
        >
          <View style={{ gap: 12 }}>
            <InputField
              label="Full name"
              value={form.name}
              placeholder="Enter your full name"
              onChangeText={(text) => {
                setForm((p) => ({ ...p, name: text }));
                setDirty(true);
              }}
              accessibilityLabel="Full name"
            />
            <InputField
              label="Mobile"
              value={form.mobile}
              keyboardType="phone-pad"
              placeholder="10-digit mobile"
              onChangeText={(text) => {
                setForm((p) => ({ ...p, mobile: text }));
                setDirty(true);
              }}
              helperText="Used for login and alerts"
              accessibilityLabel="Mobile number"
            />
            <InputField
              label="Email"
              value={form.email}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Official email"
              onChangeText={(text) => {
                setForm((p) => ({ ...p, email: text }));
                setDirty(true);
              }}
              helperText="For reports and receipts"
              accessibilityLabel="Email"
            />
            <InputField
              label="Designation"
              value={form.designation}
              placeholder="e.g. District Officer"
              onChangeText={(text) => {
                setForm((p) => ({ ...p, designation: text }));
                setDirty(true);
              }}
              accessibilityLabel="Designation"
            />
            {dirty ? (
              <AppButton
                label={saving ? 'Saving…' : 'Save changes'}
                icon="content-save"
                onPress={handleSaveProfile}
                loading={saving}
                disabled={saving}
                tone="gradientStart"
              />
            ) : null}
          </View>
        </CollapsibleCard>

        <CollapsibleCard
          title="Security"
          icon="shield-lock"
          open={sections.security}
          onToggle={() => toggleSection('security')}
          badge={securityStatus.label}
          badgeTone={securityStatus.tone}
        >
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" weight="700" color="text">Biometric login</AppText>
              <AppText variant="bodySmall" color="muted">Faster unlock with device biometrics</AppText>
            </View>
            <Switch value={biometricEnabled} onValueChange={handleBiometricToggle} />
          </View>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" weight="700" color="text">Two-factor authentication</AppText>
              <AppText variant="bodySmall" color="muted">Adds OTP for sensitive actions</AppText>
            </View>
            <Switch value={twoFactorEnabled} onValueChange={handleTwoFactorToggle} />
          </View>
          <AppButton
            label="Change password / PIN"
            icon="lock-reset"
            variant="ghost"
            onPress={handleChangePassword}
            accessibilityLabel="Change password"
          />
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" weight="700" color="text">Active sessions</AppText>
              <AppText variant="bodySmall" color="muted">Devices currently logged in: 2</AppText>
            </View>
            <TouchableOpacity onPress={handleManageDevices} accessibilityRole="button" accessibilityLabel="Manage devices">
              <AppText variant="bodyMedium" weight="700" color="primary">Manage</AppText>
            </TouchableOpacity>
          </View>
        </CollapsibleCard>

        <CollapsibleCard
          title="Preferences"
          icon="tune-variant"
          open={sections.preferences}
          onToggle={() => toggleSection('preferences')}
        >
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" weight="700" color="text">Language</AppText>
              <AppText variant="bodySmall" color="muted">Pick app language</AppText>
            </View>
            <TouchableOpacity
              onPress={() =>
                setLanguage((prev) => (prev === 'en' ? 'hi' : prev === 'hi' ? 'bn' : prev === 'bn' ? 'te' : 'en'))
              }
            >
              <AppText variant="bodyMedium" weight="700" color="primary">{language.toUpperCase()}</AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" weight="700" color="text">Notifications</AppText>
              <AppText variant="bodySmall" color="muted">Enable alerts for tasks</AppText>
              <AppText variant="bodySmall" color="muted">
                Frequency: {frequency === 'realtime' ? 'Instant' : frequency === 'daily' ? 'Daily summary' : 'Off'}
              </AppText>
            </View>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
          </View>
          <View style={styles.frequencyRow}>
            <AppButton
              label="Instant"
              compact
              variant={frequency === 'realtime' ? 'primary' : 'outline'}
              onPress={() => setFrequency('realtime')}
            />
            <AppButton
              label="Daily"
              compact
              variant={frequency === 'daily' ? 'primary' : 'outline'}
              onPress={() => setFrequency('daily')}
            />
            <AppButton
              label="Off"
              compact
              variant={frequency === 'off' ? 'primary' : 'outline'}
              onPress={() => setFrequency('off')}
            />
          </View>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMedium" weight="700" color="text">Theme</AppText>
              <AppText variant="bodySmall" color="muted">Current: {themePref === 'light' ? 'Light' : 'Dark'}</AppText>
              <AppText variant="bodySmall" color="muted">Auto-saves for your device</AppText>
            </View>
            <View style={styles.themeRow}>
              <AppButton
                label="Light"
                compact
                variant={themePref === 'light' ? 'primary' : 'outline'}
                onPress={() => handleThemeSelect('light')}
                disabled={!hydrated}
              />
              <AppButton
                label="Dark"
                compact
                variant={themePref === 'dark' ? 'primary' : 'outline'}
                onPress={() => handleThemeSelect('dark')}
                disabled={!hydrated}
              />
            </View>
          </View>
        </CollapsibleCard>

        
      </ScrollView>
      <Snackbar visible={snackbar} message="Saved successfully" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 48 },
  profileCard: {
    borderRadius: 18,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    gap: 8,
  },
  profileTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  completionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 6 },
  frequencyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingVertical: 6 },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  snackbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
});

export default SettingsScreen;
