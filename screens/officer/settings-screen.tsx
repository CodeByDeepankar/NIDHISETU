import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { InputField } from '@/components/atoms/input-field';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useOfficerProfile } from '@/hooks/use-officer-profile';
import { useAuthStore } from '@/state/authStore';

type FormValues = {
  name: string;
  mobile: string;
  designation: string;
};

export const SettingsScreen = () => {
  const theme = useAppTheme();
  const logout = useAuthStore((state) => state.actions.logout);
  const { profile, isLoading, isSaving, error, saveProfile } = useOfficerProfile();

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: {
      name: '',
      mobile: '',
      designation: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({ name: profile.name ?? '', mobile: profile.mobile ?? '', designation: profile.designation ?? '' });
    }
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await saveProfile(values);
      reset(values);
    } catch (err) {
      // error state already handled inside hook
    }
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
      style={{ backgroundColor: theme.colors.background }}
      keyboardShouldPersistTaps="handled"
    >
      <AppText variant="headlineMedium" color="text">Profile & Account</AppText>
      <AppText variant="bodyMedium" color="muted">
        Update your officer details. Changes sync in real time for all devices.
      </AppText>

      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <View style={{ gap: theme.spacing.md }}>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field: { onChange, value }, fieldState }) => (
                <InputField
                  label="Full Name"
                  placeholder="Officer name"
                  value={value}
                  onChangeText={onChange}
                  errorText={fieldState.error?.message}
                  leftIcon="account"
                />
              )}
            />
            <Controller
              control={control}
              name="mobile"
              rules={{
                required: 'Mobile number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Enter a 10-digit mobile number',
                },
              }}
              render={({ field: { onChange, value }, fieldState }) => (
                <InputField
                  label="Phone"
                  placeholder="Contact number"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  errorText={fieldState.error?.message}
                  leftIcon="phone"
                />
              )}
            />
            <Controller
              control={control}
              name="designation"
              rules={{ required: 'Designation is required' }}
              render={({ field: { onChange, value }, fieldState }) => (
                <InputField
                  label="Designation"
                  placeholder="District Lead"
                  value={value}
                  onChangeText={onChange}
                  errorText={fieldState.error?.message}
                  leftIcon="badge-account"
                />
              )}
            />
            {error ? (
              <AppText variant="labelSmall" color="error">
                {error}
              </AppText>
            ) : null}
            <AppButton
              label={isSaving ? 'Saving...' : 'Save Changes'}
              icon="content-save"
              onPress={onSubmit}
              disabled={!formState.isDirty || isSaving}
            />
          </View>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <AppText variant="titleMedium" color="text">Session</AppText>
        <AppText variant="bodySmall" color="muted">
          Securely sign out from this device.
        </AppText>
        <AppButton label="Logout" icon="logout" variant="outline" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
});
