import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { BrandLogo } from '@/components/atoms/brand-logo';
import { InputField } from '@/components/atoms/input-field';
import { useAuthActions } from '@/hooks/use-auth-actions';
import type { AuthStackParamList } from '@/navigation/types';

interface FormValues {
  otp: string;
}

export type OtpVerificationScreenProps = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export const OtpVerificationScreen = ({ navigation, route }: OtpVerificationScreenProps) => {
  const { mobile } = route.params ?? {};
  const { verifyOtp, status, errors: authErrors } = useAuthActions();
  const {
    setValue,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<FormValues>({ defaultValues: { otp: '' } });

  const onSubmit = handleSubmit(async ({ otp }) => {
    try {
      await verifyOtp(otp, mobile);
      navigation.navigate('Onboarding');
    } catch {
      // handled via hook errors
    }
  });

  return (
    <View style={styles.container}>
      <BrandLogo size={64} align="left" showTagline={false} />
      <AppText variant="headlineMedium" color="text">
        Enter OTP
      </AppText>
      <AppText variant="bodyMedium" color="muted">
        Code sent to {mobile ?? 'your number'}
      </AppText>
      <InputField
        label="One Time Password"
        placeholder="6 digit code"
        keyboardType="number-pad"
        maxLength={6}
        errorText={formErrors.otp?.message}
        onChangeText={(text) => setValue('otp', text)}
      />
      {authErrors.verifyOtp ? (
        <AppText variant="bodySmall" color="error">
          {authErrors.verifyOtp}
        </AppText>
      ) : null}
      <AppButton label="Verify" onPress={onSubmit} loading={status.verifyingOtp} disabled={status.verifyingOtp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: 'center',
  },
});
