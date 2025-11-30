import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';

interface OfficerDashboardHeaderProps {
  name: string;
  notificationCount?: number;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
}

export const OfficerDashboardHeader = ({
  name,
  notificationCount = 0,
  onPressNotifications,
  onPressProfile,
}: OfficerDashboardHeaderProps) => {
  const theme = useAppTheme();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={[styles.container, { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg }]}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onPressProfile} style={[styles.profileContainer, { borderColor: theme.colors.secondary }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
            <AppText variant="titleMedium" color="primary">
              {name.charAt(0)}
            </AppText>
          </View>
        </TouchableOpacity>

        <View style={styles.greetingContainer}>
          <AppText variant="bodyMedium" color="muted">
            Good Morning,
          </AppText>
          <AppText variant="titleLarge" color="text" weight="600">
            Officer {name.split(' ')[0]}
          </AppText>
        </View>

        <TouchableOpacity onPress={onPressNotifications} style={styles.notificationButton}>
          <AppIcon name="bell-outline" size={24} color="text" />
          {notificationCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
              <AppText variant="labelSmall" color="onPrimary" style={{ fontSize: 10 }}>
                {notificationCount}
              </AppText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.dateChip, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.text }]}>
          <AppIcon name="calendar" size={14} color="primary" />
          <AppText variant="labelSmall" color="text">
            {currentDate}
          </AppText>
        </View>
        <View style={styles.locationIndicator}>
          <AppText variant="labelSmall" color="success">
            📍 You are online & location enabled
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileContainer: {
    borderWidth: 2,
    borderRadius: 24,
    padding: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
