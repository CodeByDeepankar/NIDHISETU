import { useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { StackActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { useDeviceFingerprint } from '@/hooks/useDeviceFingerprint';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuthStore } from '@/state/authStore';
import type { AuthStackParamList } from '@/navigation/types';

// Screen props typing tied to Auth stack.
export type SetPinScreenProps = NativeStackScreenProps<AuthStackParamList, 'SetPin'>;

export const SetPinScreen = ({ navigation }: SetPinScreenProps) => {
  // Theme for colors.
  const theme = useAppTheme();
  // Current logged-in profile (to persist fingerprint against beneficiary id).
  const profile = useAuthStore((state) => state.profile);
  const completeOnboarding = useAuthStore((state) => state.actions.completeOnboarding);
  // Local PIN entry state.
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { savePin, persistFingerprint } = useDeviceFingerprint();
  // Ref to focus the first input.
  const pinRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  // Validate and persist PIN + fingerprint.
  const handleSave = async () => {
    // Ensure 6 digits and match.
    if (pin.length !== 6 || confirmPin.length !== 6) {
      Alert.alert('PIN must be 6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('PINs do not match.');
      return;
    }
    setSubmitting(true);
    try {
      // Hash + store PIN securely.
      await savePin(pin);
      // Persist fingerprint if beneficiary id exists.
      if (profile?.id) {
        await persistFingerprint(profile.id);
      }
      if (profile) {
        completeOnboarding(profile);
      }
      Alert.alert('PIN set', 'Your PIN and device fingerprint are saved.', [
        {
          text: 'Continue',
          onPress: () => navigation.getParent()?.dispatch(StackActions.replace('AppFlow')),
        },
      ]);
    } catch (error) {
      console.error('Failed to set PIN', error);
      Alert.alert('Error', 'Could not save PIN. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppText variant="titleLarge" style={styles.title}>Set a 6-digit PIN</AppText>
      <AppText variant="bodyMedium" color="muted" style={styles.subtitle}>
        This PIN secures your account on this device. It stays on your device and is never uploaded.
      </AppText>

      <AppText variant="labelMedium" style={styles.label}>Enter PIN</AppText>
      <TextInput
        ref={pinRef}
        style={[styles.pinInput, { borderColor: theme.colors.border }]}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        value={pin}
        onChangeText={setPin}
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />

      <AppText variant="labelMedium" style={styles.label}>Confirm PIN</AppText>
      <TextInput
        ref={confirmRef}
        style={[styles.pinInput, { borderColor: theme.colors.border }]}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        value={confirmPin}
        onChangeText={setConfirmPin}
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />

      <AppButton
        label={submitting ? 'Saving…' : 'Save PIN'}
        onPress={handleSave}
        loading={submitting}
        disabled={submitting}
        style={styles.saveButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  label: {
    marginTop: 8,
  },
  pinInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    letterSpacing: 6,
  },
  saveButton: {
    marginTop: 12,
  },
});
