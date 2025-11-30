import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuthStore } from '@/state/authStore';
import { StyleSheet, View } from 'react-native';

export const ProfileScreen = () => {
  const theme = useAppTheme();
  const profile = useAuthStore((s) => s.profile);
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <AppText variant="headlineMedium" color="text">Profile</AppText>
      <AppText variant="titleMedium" color="text">{profile?.name ?? 'Officer'}</AppText>
      <AppText variant="bodyMedium" color="muted">{profile?.mobile}</AppText>
      <View style={{ marginTop: 16 }}>
        <AppButton label="Edit Profile" icon="pencil" />
        <AppButton label="Activity Logs" icon="history" variant="secondary" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
