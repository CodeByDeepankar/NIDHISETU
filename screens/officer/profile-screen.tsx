import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { WaveHeader } from '@/components/molecules/wave-header';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuthStore } from '@/state/authStore';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export const ProfileScreen = () => {
  const theme = useAppTheme();
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.actions.logout);
  const officerProfile = profile?.role === 'officer' ? profile : undefined;
  const officerId = profile?.id ?? 'OFC-1022';
  const designation = officerProfile?.designation ?? profile?.role ?? 'District Officer';
  const department = officerProfile?.department;
  const primaryBadge = designation ?? 'Field Officer';
  const secondaryBadge = officerProfile?.region ? `${officerProfile.region} Division` : 'Bhopal Division';
  const phoneNumber = profile?.mobile ?? '+91 98765 43210';

  const handleLogout = () => {
    logout();
  };

  const handleEditProfile = () => {
    // TODO: navigate to edit screen when available
  };

  const handleRequestUpdate = (fieldLabel: string) => {
    Alert.alert(
      'Request Admin Update',
      `Please reach out to your district admin to update ${fieldLabel}.`,
      [{ text: 'OK', style: 'default' }],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WaveHeader
        title="My Profile"
        subtitle="Manage your account and settings"
        height={200}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.avatarHeader}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                <AppText variant="headlineMedium" color="primary">
                  {profile?.name?.charAt(0) ?? 'O'}
                </AppText>
              </View>
              <View style={styles.profileInfo}>
                <AppText variant="titleLarge" color="text" weight="600">
                  {profile?.name ?? 'Officer Name'}
                </AppText>
                <AppText variant="bodyMedium" color="muted">
                  {designation}
                </AppText>
                <View style={styles.lockRow}>
                  <AppIcon name="lock-outline" size={14} color="muted" />
                  <AppText variant="labelSmall" color="muted">
                    Managed by admin
                  </AppText>
                  <TouchableOpacity onPress={() => handleRequestUpdate('designation')}>
                    <AppText style={styles.requestLink}>Request update</AppText>
                  </TouchableOpacity>
                </View>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
                    <AppIcon name="shield-account" size={14} color="primary" />
                    <AppText variant="labelSmall" color="primary" weight="600">
                      {primaryBadge}
                    </AppText>
                  </View>
                  <View style={[styles.badge, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <AppIcon name="map-marker" size={14} color="muted" />
                    <AppText variant="labelSmall" color="muted" weight="600">
                      {secondaryBadge}
                    </AppText>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              style={[styles.editButton, { borderColor: theme.colors.border }]}
              onPress={handleEditProfile}
            >
              <AppIcon name="pencil" size={18} color="primary" />
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

          <InfoField
            icon="badge-account"
            label="Officer ID"
            value={officerId}
          />
          <InfoField
            icon="briefcase"
            label="Department"
            value={department ?? 'Rural Development Department'}
          />
          {officerProfile ? (
            <InfoField
              icon="medal"
              label="Designation"
              value={designation}
              readOnly
              onRequestUpdate={() => handleRequestUpdate('designation')}
            />
          ) : null}
          <InfoField
            icon="phone"
            label="Phone"
            value={phoneNumber}
            readOnly
            onRequestUpdate={() => handleRequestUpdate('phone number')}
          />
          <InfoField
            icon="email"
            label="Email"
            value="officer@nidhisetu.gov.in"
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <AppText variant="titleMedium" color="text" style={styles.sectionTitle}>
            Account Settings
          </AppText>
          
          <SettingItem icon="bell" label="Notifications" value="On" />
          <SettingItem icon="lock" label="Change Password" />
          <SettingItem icon="translate" label="Language" value="English" />
          <SettingItem icon="help-circle" label="Help & Support" />
        </View>

        <View style={styles.actionContainer}>
          <AppButton
            label="Edit Profile"
            icon="pencil"
            variant="secondary"
            onPress={handleEditProfile}
            style={styles.editProfileButton}
          />
          <AppButton
            label="Logout"
            icon="logout"
            variant="outline"
            onPress={handleLogout}
            style={{ borderColor: theme.colors.error }}
            textStyle={{ color: theme.colors.error }}
          />
        </View>
        
        <AppText variant="labelSmall" color="muted" style={styles.version}>
          Version 1.0.0 (Build 2024.10.25)
        </AppText>
      </ScrollView>
    </View>
  );
};

const SettingItem = ({ icon, label, value }: { icon: string; label: string; value?: string }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceVariant }]}>
          <AppIcon name={icon as any} size={20} color="primary" />
        </View>
        <AppText variant="bodyMedium" color="text">
          {label}
        </AppText>
      </View>
      {value ? (
        <AppText variant="bodySmall" color="muted">
          {value}
        </AppText>
      ) : (
        <AppIcon name="chevron-right" size={20} color="muted" />
      )}
    </View>
  );
};

const InfoField = ({
  icon,
  label,
  value,
  readOnly,
  onRequestUpdate,
}: {
  icon: string;
  label: string;
  value: string;
  readOnly?: boolean;
  onRequestUpdate?: () => void;
}) => {
  const theme = useAppTheme();
  const isInteractive = Boolean(readOnly && onRequestUpdate);
  return (
    <TouchableOpacity
      activeOpacity={isInteractive ? 0.8 : 1}
      disabled={!isInteractive}
      onPress={isInteractive ? onRequestUpdate : undefined}
      style={[styles.infoFieldRow, readOnly ? styles.infoFieldLockedRow : null]}
    >
      <View style={styles.infoFieldIconBox}>
        <AppIcon name={icon as any} size={18} color="primary" />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="labelSmall" color="muted">
          {label}
        </AppText>
        <AppText variant="bodyMedium" color="text" weight="500">
          {value}
        </AppText>
        {readOnly ? (
          <View style={styles.infoFieldMeta}>
            <AppIcon name="lock-outline" size={12} color="muted" />
            <AppText variant="labelSmall" color="muted">
              Locked by admin
            </AppText>
            {isInteractive ? (
              <AppText style={styles.requestLink}>Tap to request update</AppText>
            ) : null}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
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
  card: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  requestLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  infoFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoFieldLockedRow: {
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  infoFieldIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  infoFieldMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContainer: {
    marginTop: 8,
    gap: 12,
  },
  editProfileButton: {
    borderWidth: 1,
  },
  version: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.6,
  },
});
