import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { BrandLogo } from '@/components/atoms/brand-logo';
import { Chip } from '@/components/atoms/chip';
import { InputField } from '@/components/atoms/input-field';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AuthStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/state/authStore';
import type { BeneficiaryProfile, OfficerProfile, ReviewerProfile, UserRole } from '@/types/entities';

interface FormValues {
  name: string;
  mobile: string;
  village?: string;
  district?: string;
  bank?: string;
  department?: string;
  designation?: string;
  institution?: string;
}

export type OnboardingScreenProps = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const roleOptions: { label: string; value: UserRole; icon: string }[] = [
  { label: 'Beneficiary', value: 'beneficiary', icon: 'account' },
  { label: 'State Officer', value: 'officer', icon: 'account-badge' },
  { label: 'Reviewer', value: 'reviewer', icon: 'clipboard-check' },
];

export const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => {
  const mobile = useAuthStore((state) => state.mobile);
  const isOfficer = mobile === '8895796609';
  
  const availableRoles = roleOptions.filter((option) => {
    if (option.value === 'officer') {
      return isOfficer;
    }
    return true;
  });

  const [role, setRole] = useState<UserRole>(isOfficer ? 'officer' : 'beneficiary');
  const completeOnboarding = useAuthStore((state) => state.actions.completeOnboarding);
  const { setValue, handleSubmit } = useForm<FormValues>({ defaultValues: { name: '', mobile: '' } });
  const theme = useAppTheme();

  const buildProfile = (values: FormValues) => {
    const base = {
      id: Date.now().toString(),
      name: values.name,
      mobile: values.mobile,
      role,
    } as const;

    if (role === 'beneficiary') {
      return {
        ...base,
        role,
        village: values.village ?? '',
        district: values.district ?? '',
        bank: values.bank ?? '',
        scheme: 'PMEGP',
      } satisfies BeneficiaryProfile;
    }
    if (role === 'officer') {
      return {
        ...base,
        role,
        department: values.department ?? '',
        designation: values.designation ?? '',
        region: values.district ?? '',
      } satisfies OfficerProfile;
    }
    return {
      ...base,
      role,
      institution: values.institution ?? '',
      branch: values.district ?? '',
    } satisfies ReviewerProfile;
  };

  const onSubmit = handleSubmit((values) => {
    const profile = buildProfile(values);
    completeOnboarding(profile);
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: theme.spacing.xxl,
            gap: theme.spacing.lg,
          },
        ]}
        bounces={false}
      >
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { borderRadius: theme.radii.lg, padding: theme.spacing.lg }]}
        >
          <BrandLogo size={80} align="left" />
          <AppText variant="bodyMedium" color="surface" style={styles.heroCopy}>
            Mapping every rupee and keeping beneficiaries, officers, and reviewers perfectly in sync.
          </AppText>
        </LinearGradient>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="headlineMedium" color="text">
            Tell us about you
          </AppText>
          <AppText variant="bodyMedium" color="muted">
            Select your role so we can personalise the dashboard experience.
          </AppText>
        </View>

        <View style={[styles.rolesRow, { gap: theme.spacing.sm }]}>
          {availableRoles.map((option) => {
            const isActive = role === option.value;
            return (
              <Chip
                key={option.value}
                label={option.label}
                tone={isActive ? 'primary' : 'muted'}
                leftIcon={<AppIcon name={option.icon as any} color={isActive ? 'primary' : 'muted'} />}
                backgroundColor={isActive ? theme.colors.primaryContainer : theme.colors.surface}
                style={[styles.roleChip, { borderColor: isActive ? theme.colors.primary : theme.colors.border }]}
                onPress={() => setRole(option.value)}
              />
            );
          })}
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <InputField label="Full Name" placeholder="Your name" onChangeText={(text) => setValue('name', text)} />
          <InputField
            label="Mobile"
            placeholder="Registered mobile"
            keyboardType="phone-pad"
            onChangeText={(text) => setValue('mobile', text)}
          />
          {role === 'beneficiary' ? (
            <>
              <InputField label="Village" placeholder="Village" onChangeText={(text) => setValue('village', text)} />
              <InputField label="District" placeholder="District" onChangeText={(text) => setValue('district', text)} />
              <InputField label="Bank" placeholder="Bank" onChangeText={(text) => setValue('bank', text)} />
            </>
          ) : null}
          {role === 'officer' ? (
            <>
              <InputField label="Department" placeholder="Rural Dev" onChangeText={(text) => setValue('department', text)} />
              <InputField label="Designation" placeholder="Assistant Director" onChangeText={(text) => setValue('designation', text)} />
              <InputField label="Region" placeholder="State / District" onChangeText={(text) => setValue('district', text)} />
            </>
          ) : null}
          {role === 'reviewer' ? (
            <>
              <InputField label="Institution" placeholder="Bank" onChangeText={(text) => setValue('institution', text)} />
              <InputField label="Branch" placeholder="Branch" onChangeText={(text) => setValue('district', text)} />
            </>
          ) : null}
        </View>

        <AppButton label="Complete" onPress={onSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingTop: 24,
  },
  hero: {
    width: '100%',
    gap: 8,
  },
  heroCopy: {
    opacity: 0.9,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleChip: {
    borderWidth: 1,
  },
});
