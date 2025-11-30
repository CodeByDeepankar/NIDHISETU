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
  mobile: string;
}

export type MobileInputScreenProps = NativeStackScreenProps<AuthStackParamList, 'MobileInput'>;

export const MobileInputScreen = ({ navigation }: MobileInputScreenProps) => {
  const {
    handleSubmit,
    formState: { errors: formErrors },
    setValue,
  } = useForm<FormValues>({ defaultValues: { mobile: '' } });
  const { requestOtp: sendOtp, status, errors: authErrors } = useAuthActions();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await sendOtp(values.mobile);
      navigation.navigate('OtpVerification', { mobile: values.mobile });
    } catch {
      // error handled via hook state
    }
  });

  return (
    <View style={styles.container}>
      <BrandLogo size={72} align="left" showTagline={false} />
      <AppText variant="headlineMedium" color="text">
        Verify your mobile
      </AppText>
      <AppText variant="bodyMedium" color="muted">
        We'll send a one time password to the entered number.
      </AppText>
      <InputField
        label="Mobile Number"
        keyboardType="phone-pad"
        placeholder="Enter 10 digit mobile number"
        helperText="Required for OTP login"
        errorText={formErrors.mobile?.message}
        onChangeText={(text) => setValue('mobile', text)}
        maxLength={10}
      />
      {authErrors.requestOtp ? (
        <AppText variant="bodySmall" color="error">
          {authErrors.requestOtp}
        </AppText>
      ) : null}
      <AppButton label="Send OTP" onPress={onSubmit} loading={status.requestingOtp} disabled={status.requestingOtp} />
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
