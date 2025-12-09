import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { InputField } from '@/components/atoms/input-field';
import { WaveHeader } from '@/components/molecules/wave-header';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { OfficerStackParamList } from '@/navigation/types';
import type { NavigationProp } from '@react-navigation/native';

export const ChangePasswordScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<OfficerStackParamList>>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Incomplete', 'Please fill all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Too short', 'Use at least 6 characters.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Updated', 'Your password was changed successfully.', [{ text: 'Done', onPress: () => navigation.goBack() }]);
    }, 500);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <WaveHeader title="Change password" subtitle="Keep your account secured" height={150} />
      <View style={styles.headerAction}>
        <AppButton
          label="Close"
          compact
          variant="ghost"
          icon="close"
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 8 }}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]}> 
          <View style={styles.infoRow}>
            <AppIcon name="shield-key" size={18} color="primary" />
            <AppText variant="bodyMedium" weight="700" color="text">
              Strong passwords help prevent misuse.
            </AppText>
          </View>
          <AppText variant="bodySmall" color="muted">Use a mix of letters, numbers, and symbols.</AppText>
        </View>

        <InputField
          label="Current password / PIN"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="Enter current password"
        />
        <InputField
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Enter new password"
        />
        <InputField
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Re-enter new password"
        />

        <AppButton
          label={saving ? 'Updating…' : 'Update password'}
          icon="lock-reset"
          onPress={submit}
          loading={saving}
          disabled={saving}
          style={{ marginTop: 4 }}
        />
        <AppButton label="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerAction: { position: 'absolute', top: 48, right: 16 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  infoCard: { padding: 14, borderRadius: 14, gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

export default ChangePasswordScreen;
