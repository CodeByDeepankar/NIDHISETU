import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { StackActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { useDeviceFingerprint } from '@/hooks/useDeviceFingerprint';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuthStore } from '@/state/authStore';
import type { AuthStackParamList } from '@/navigation/types';

// Screen props typed to Auth stack.
export type EnterPinScreenProps = NativeStackScreenProps<AuthStackParamList, 'EnterPin'>;

export const EnterPinScreen = ({ navigation, route }: EnterPinScreenProps) => {
  // Theme palette.
  const theme = useAppTheme();
  // Current profile for beneficiary id.
  const profile = useAuthStore((state) => state.profile);
  const completeOnboarding = useAuthStore((state) => state.actions.completeOnboarding);
  // Hook helpers for PIN and fingerprint.
  const { verifyPin, persistFingerprint, hasPin } = useDeviceFingerprint();
  // PIN text state.
  const [pin, setPin] = useState('');
  // Track failed attempts locally for UI messaging.
  const [attempts, setAttempts] = useState(0);
  // Input ref for focus.
  const inputRef = useRef<TextInput>(null);
  // Optional reason text from navigation.
  const reason = route.params?.reason ?? 'New device detected. Please enter your PIN to continue.';

  // Check if PIN exists on this device.
  useEffect(() => {
    const checkPin = async () => {
      const exists = await hasPin();
      if (!exists) {
        // No PIN found, redirect to SetPin screen
        navigation.replace('SetPin');
      } else {
        // Only focus if PIN exists, otherwise we're navigating away
        inputRef.current?.focus();
      }
    };
    checkPin();
  }, []);

  // Run verification; handle lock and success flows.
  const handleVerify = async () => {
    if (pin.length !== 6) {
      return;
    }

    const result = await verifyPin(pin);

    if (result.ok) {
      if (profile?.id) {
        await persistFingerprint(profile.id);
      }
      if (profile) {
        completeOnboarding(profile);
      }
      navigation.getParent()?.dispatch(StackActions.replace('AppFlow'));
      return;
    }

    setAttempts(result.attempts);
    if (result.locked || result.attempts >= 3) {
      Alert.alert(
        'Too many attempts',
        'PIN attempts exceeded. We will send you back to OTP verification.',
        [{ text: 'OK', onPress: () => navigation.replace('OtpVerification', { mobile: profile?.mobile }) }]
      );
      return;
    }
    Alert.alert('Incorrect PIN', `You have ${3 - result.attempts} attempts left.`);
    setPin('');
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <AppText variant="titleLarge" style={styles.title}>Enter PIN</AppText>
      <AppText variant="bodyMedium" color="muted" style={styles.subtitle}>{reason}</AppText>
      <AppText variant="labelMedium" color="muted" style={styles.subtitleSmall}>
        PIN stays on your device. If you changed devices, enter your PIN once and we will trust this device next time.
      </AppText>

      <TextInput
        ref={inputRef}
        style={[styles.pinInput, { borderColor: theme.colors.border }]}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        value={pin}
        onChangeText={(value) => {
          const digitsOnly = value.replace(/[^0-9]/g, '');
          setPin(digitsOnly);
        }}
        onSubmitEditing={handleVerify}
      />

      <AppButton
        label="Unlock"
        onPress={handleVerify}
        disabled={pin.length !== 6}
        style={styles.unlockButton}
      />

      <AppButton
        label="Use OTP instead"
        variant="secondary"
        onPress={() => navigation.replace('OtpVerification', { mobile: profile?.mobile })}
        style={styles.otpButton}
      />

      {attempts > 0 ? (
        <AppText variant="labelSmall" color={attempts >= 2 ? 'error' : 'muted'}>
          Attempts: {attempts} / 3
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  subtitleSmall: {
    textAlign: 'center',
    marginBottom: 8,
  },
  pinInput: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 20,
    letterSpacing: 4,
    textAlign: 'center',
  },
  unlockButton: {
    marginTop: 12,
  },
  otpButton: {
    marginTop: 4,
  },
});
