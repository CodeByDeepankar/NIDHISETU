import { StackActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { InputField } from '@/components/atoms/input-field';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { useDeviceFingerprint } from '@/hooks/useDeviceFingerprint';
import { useAuthStore } from '@/state/authStore';
import type { AuthStackParamList } from '@/navigation/types';

interface FormValues {
  otp: string;
}

export type OtpVerificationScreenProps = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export const OtpVerificationScreen = ({ navigation, route }: OtpVerificationScreenProps) => {
  const { mobile } = route.params ?? {};
  const { verifyOtp, requestOtp, status, errors: authErrors } = useAuthActions();
  const { evaluateFingerprintTrust } = useDeviceFingerprint();
  const completeOnboarding = useAuthStore((state) => state.actions.completeOnboarding);
  const {
    setValue,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<FormValues>({ defaultValues: { otp: '' } });

  const [timer, setTimer] = useState(59);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = handleSubmit(async ({ otp }) => {
    try {
      const result = await verifyOtp(otp, mobile);

      // After OTP success, decide whether to auto-login, prompt PIN, or set PIN.
      const beneficiaryId = result?.profile?.id;

      if (!beneficiaryId) {
        navigation.replace('Onboarding');
        return;
      }

      let trust: Awaited<ReturnType<typeof evaluateFingerprintTrust>> | null = null;
      try {
        trust = await evaluateFingerprintTrust(beneficiaryId);
      } catch (err) {
        console.warn('Fingerprint trust evaluation failed; defaulting to SetPin', err);
      }

      if (!trust || !trust.stored) {
        // No fingerprint stored yet or evaluation failed -> first-time PIN setup.
        navigation.replace('SetPin');
        return;
      }

      if (trust.isTrusted) {
        // Known device -> proceed without PIN.
        if (result.profile) {
          completeOnboarding(result.profile);
        }
        navigation.getParent()?.dispatch(StackActions.replace('AppFlow'));
        return;
      }

      // New/mismatched device -> ask for PIN.
      navigation.replace('EnterPin', {
        reason: 'New device detected. Please enter your PIN to continue.',
        mobile: mobile ?? result?.mobile,
      });
    } catch {
      // handled via hook errors
    }
  });

  const handleResend = async () => {
    if (timer === 0 && mobile) {
      try {
        await requestOtp(mobile);
        setTimer(59);
      } catch {
        // error handled via hook
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <AppIcon name="arrow-left" size={24} color="text" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationCircle}>
            <AppIcon name="cellphone-message" size={64} color="#7C3AED" />
          </View>
        </View>

        <AppText style={styles.title}>Verify Phone Number</AppText>

        <AppText style={styles.description}>
          A 6-digit code has been sent to the {'\n'} + 91{mobile}
        </AppText>

        <AppText style={styles.instruction}>Kindly enter the code to continue.</AppText>

        <View style={styles.inputContainer}>
          <InputField
            placeholder="0 0 0 0 0 0"
            keyboardType="number-pad"
            maxLength={6}
            errorText={formErrors.otp?.message}
            onChangeText={(text) => setValue('otp', text)}
            inputStyle={styles.otpInput}
            containerStyle={styles.otpInputContainer}
          />
        </View>

        <View style={styles.resendContainer}>
          <AppText style={styles.resendText}>Resend OTP</AppText>
          <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
            <AppText style={[styles.timerText, timer === 0 && styles.timerActive]}>
              00:{timer.toString().padStart(2, '0')}
            </AppText>
          </TouchableOpacity>
        </View>

        {authErrors.verifyOtp ? (
          <AppText variant="bodySmall" color="error" style={styles.errorText}>
            {authErrors.verifyOtp}
          </AppText>
        ) : null}

        <AppButton
          label="Next"
          onPress={onSubmit}
          loading={status.verifyingOtp}
          disabled={status.verifyingOtp}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  backButton: {
    marginTop: 24,
    marginBottom: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  illustrationContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  instruction: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  otpInputContainer: {
    // Style to make it look like boxes or centered
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  timerText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  timerActive: {
    color: '#7C3AED',
  },
  errorText: {
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#7C3AED',
  },
});
