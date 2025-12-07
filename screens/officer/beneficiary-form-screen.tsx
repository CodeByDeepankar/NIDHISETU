import { useCallback, useMemo, useState } from 'react';
import type { Control, RegisterOptions } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { InputField, type InputFieldProps } from '@/components/atoms/input-field';
import { FormSectionCard } from '@/components/molecules/form-section-card';
import { AddressAutocompleteField } from '@/components/ui/address-autocomplete-field';
import { BeneficiaryFormHeader } from '@/components/organisms/beneficiary-form-header';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { OfficerStackParamList } from '@/navigation/types';
import { beneficiaryRepository } from '@/services/api/beneficiaryRepository';
import type { AddressDetails } from '@/services/googlePlaces';
import { useAuthStore } from '@/state/authStore';
import type { BeneficiaryFormPayload, BeneficiaryFormValues, BeneficiaryMetadata, OfficerContext } from '@/types/beneficiary';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type BeneficiaryFormScreenProps = NativeStackScreenProps<OfficerStackParamList, 'BeneficiaryForm'>;

const requiredFieldKeys: (keyof BeneficiaryFormValues)[] = [
  'fullName',
  'aadhaar',
  'address',
  'assetName',
  'assetValue',
  'bankName',
  'sanctionAmount',
  'village',
  'mobile',
];

type GeoStatus = 'idle' | 'fetching' | 'success' | 'error';

export const BeneficiaryFormScreen = ({ navigation }: BeneficiaryFormScreenProps) => {
  const theme = useAppTheme();
  const profile = useAuthStore((state) => state.profile);
  const officerName = profile?.name ?? 'Field Officer';
  const officerRegion = profile && 'region' in profile ? profile.region : undefined;

  const defaultValues = useMemo<BeneficiaryFormValues>(
    () => ({
      fullName: '',
      aadhaar: '',
      address: '',
      assetName: '',
      assetValue: '',
      bankName: '',
      sanctionAmount: '',
      village: '',
      mobile: '',
      // Default empty values for optional fields to satisfy type requirements if any remain
      guardianName: '',
      dateOfBirth: '',
      gender: '',
      pan: '',
      caste: '',
      maritalStatus: '',
      beneficiaryPhoto: '',
      alternateNumber: '',
      email: '',
      state: '',
      district: '',
      block: '',
      pin: '',
      geoLocation: '',
      loanId: '',
      schemeName: '',
      loanType: '',
      branchName: '',
      ifsc: '',
      disbursedAmount: '',
      sanctionDate: '',
      disbursementDate: '',
      emiStartDate: '',
      emiAmount: '',
      loanPurpose: '',
      businessName: '',
      businessType: '',
      invoiceUpload: '',
      businessAddress: '',
      businessGeoLocation: '',
      licenseNumber: '',
      requiredPhotos: [],
      requiredVideos: [],
      requiredDocuments: [],
      deadline: '',
      assignedOfficer: officerName,
      priorityLevel: 'Normal',
      notes: '',
      tags: [],
    }),
    [officerName]
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BeneficiaryFormValues>({ defaultValues, mode: 'onBlur' });

  const metadataSeed = useMemo(
    () => ({
      beneficiaryUid: `BEN-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: 'Active',
    }),
    []
  );

  const values = watch();
  const completionPercent = useMemo(() => {
    const filled = requiredFieldKeys.filter((key) => {
      const value = values[key];
      return Boolean(value && value.toString().trim().length);
    }).length;
    return Math.round((filled / requiredFieldKeys.length) * 100);
  }, [values]);

  const officerContext = useMemo<OfficerContext>(
    () => ({
      id: profile?.id,
      name: officerName,
      mobile: profile?.mobile,
      region: officerRegion,
    }),
    [profile, officerName, officerRegion]
  );

  const [locationError, setLocationError] = useState<{ field: string; message: string } | null>(null);
  const [bizGeoStatus, setBizGeoStatus] = useState<GeoStatus>('idle');

  const handleMockUpload = useCallback(
    (field: keyof BeneficiaryFormValues) => {
      const mockFileName = `${field}-${Date.now().toString(36)}.jpg`;
      setValue(field, mockFileName as any, { shouldDirty: true });
    },
    [setValue]
  );

  const applyAddressDetails = useCallback(
    (details: AddressDetails | null | undefined, geoField: keyof BeneficiaryFormValues) => {
      if (!details) {
        return;
      }

      if (details.latitude && details.longitude) {
        const coordinates = `${details.latitude.toFixed(4)}, ${details.longitude.toFixed(4)}`;
        setValue(geoField, coordinates as any, { shouldDirty: true });
      }

      const components = details.components ?? [];
      const match = (type: string) => components.find((component) => component.types.includes(type))?.longName;

      const state = match('administrative_area_level_1');
      if (state) {
        setValue('state', state, { shouldDirty: true });
      }

      const district = match('administrative_area_level_2');
      if (district) {
        setValue('district', district, { shouldDirty: true });
      }

      const block = match('locality') || match('administrative_area_level_3') || match('sublocality_level_1');
      if (block) {
        setValue('block', block, { shouldDirty: true });
      }

      const pin = match('postal_code');
      if (pin) {
        setValue('pin', pin, { shouldDirty: true });
      }
    },
    [setValue]
  );

  const handleGpsFetch = useCallback(
    async (field: keyof BeneficiaryFormValues, updateStatus?: (status: GeoStatus) => void) => {
      try {
        updateStatus?.('fetching');
        setLocationError(null);
        await new Promise((resolve) => setTimeout(resolve, 800));
        const coordinates = '21.1702, 72.8311';
        setValue(field, coordinates as any, { shouldDirty: true });
        updateStatus?.('success');
      } catch (error) {
        console.warn('GPS fetch failed', error);
        updateStatus?.('error');
        setLocationError({ field: field as string, message: 'Unable to fetch GPS coordinates' });
      } finally {
        setTimeout(() => updateStatus?.('idle'), 2000);
      }
    },
    [setLocationError, setValue]
  );

  const metadata: BeneficiaryMetadata = {
    ...metadataSeed,
    updatedAt: new Date().toISOString(),
    docCount: 0,
    completionPercent,
    createdBy: officerContext,
  };

  const onSubmit = handleSubmit(async (formValues) => {
    const payload: BeneficiaryFormPayload = {
      ...formValues,
      sanctionAmount: Number(formValues.sanctionAmount || 0),
      assetValue: Number(formValues.assetValue || 0),
      disbursedAmount: Number(formValues.disbursedAmount || 0),
      emiAmount: Number(formValues.emiAmount || 0),
    };

    try {
      const record = await beneficiaryRepository.saveDraft(payload, metadata);
      Alert.alert('Beneficiary saved', `UID ${record.metadata.beneficiaryUid}`, [
        { text: 'Continue editing' },
        {
          text: 'Save & Close',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save beneficiary right now. Please retry.';
      Alert.alert('Save failed', message);
    }
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <BeneficiaryFormHeader onBack={() => navigation.goBack()} completionPercent={completionPercent} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <FormSectionCard
          title="Beneficiary Details"
          subtitle="Basic information"
          icon={<AppIcon name="account" size={24} color="primary" />}
        >
          <ControlledInput
            control={control}
            name="fullName"
            label="Full Name"
            placeholder="Applicant name"
            rules={{ required: 'Full name is required' }}
            errorText={errors.fullName?.message}
          />
          <ControlledInput
            control={control}
 
            name="guardianName"
            label="Father/Husband Name"
            placeholder="Guardian name"
            rules={{ required: 'Guardian name is required' }}
            errorText={errors.guardianName?.message}
          />
          <ControlledInput
            control={control}
            name="dateOfBirth"
            label="Date of Birth"
            placeholder="YYYY-MM-DD"
            helperText="Must be 18+"
            rules={{
              required: 'Date of birth is required',
              validate: (value) => validateAdult(value),
            }}
            errorText={errors.dateOfBirth?.message}
          />
          <Controller
            control={control}
            name="gender"
            rules={{ required: 'Select a gender' }}
            render={({ field }) => (
              <ChipSelector
                label="Gender"
                options={genderOptions}
                multiple={false}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.gender?.message}
              />
            )}
          />
          <ControlledInput
            control={control}
            name="aadhaar"
            label="Aadhaar Number"
            placeholder="12 digit"
            keyboardType="number-pad"
            rules={{
              required: 'Enter Aadhaar number',
              pattern: { value: /^\d{12}$/, message: 'Enter 12 digit Aadhaar' },
            }}
            errorText={errors.aadhaar?.message}
          />
          <ControlledInput
            control={control}
            name="pan"
            label="PAN Number"
            placeholder="ABCDE1234F"
            autoCapitalize="characters"
            rules={{
              required: 'PAN is required',
              pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]$/i, message: 'Invalid PAN format' },
            }}
            errorText={errors.pan?.message}
          />
          <Controller
            control={control}
            name="caste"
            render={({ field }) => (
              <ChipSelector label="Caste / Category" options={casteOptions} multiple={false} value={field.value ?? ''} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="maritalStatus"
            render={({ field }) => (
              <ChipSelector label="Marital Status" options={maritalOptions} multiple={false} value={field.value ?? ''} onChange={field.onChange} />
            )}
          />
          <AttachmentField
            label="Beneficiary Photo"
            value={values.beneficiaryPhoto}
            helper="Optional image upload"
            onUpload={() => handleMockUpload('beneficiaryPhoto')}
          />
        </FormSectionCard>

        <FormSectionCard
          title="Contact Details"
          subtitle="Reachability and serviceable address"
          icon={<AppIcon name="phone" size={24} color="primary" />}
        >
          <ControlledInput
            control={control}
            name="mobile"
            label="Mobile Number"
            keyboardType="number-pad"
            placeholder="10 digit mobile number"
            rules={{
              required: 'Mobile number required',
              pattern: { value: /^\d{10}$/, message: 'Enter 10 digit mobile number' },
            }}
            errorText={errors.mobile?.message}
          />
          <ControlledInput
            control={control}
            name="alternateNumber"
            label="Alternate Contact"
            placeholder="Optional secondary number"
            keyboardType="number-pad"
            rules={{
              pattern: { value: /^\d{10}$/, message: 'Enter 10 digit number' },
            }}
            errorText={errors.alternateNumber?.message}
          />
          <ControlledInput
            control={control}
            name="address"
            label="Address"
            placeholder="Full address"
            rules={{ required: 'Address is required' }}
            errorText={errors.address?.message}
          />
          <ControlledInput
            control={control}
            name="village"
            label="Village"
            placeholder="Village name"
            rules={{ required: 'Village is required' }}
            errorText={errors.village?.message}
          />
        </FormSectionCard>

        <FormSectionCard
          title="Asset & Loan Details"
          subtitle="Financial information"
          icon={<AppIcon name="cash" size={24} color="primary" />}
        >
          <ControlledInput
            control={control}
            name="loanId"
            label="Loan ID / Application No."
            placeholder="LN-0001"
            rules={{ required: 'Loan/Application ID required' }}
            errorText={errors.loanId?.message}
          />
          <Controller
            control={control}
            name="schemeName"
            rules={{ required: 'Scheme required' }}
            render={({ field }) => (
              <ChipSelector
                label="Scheme Name"
                options={schemeOptions}
                multiple={false}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.schemeName?.message}
              />
            )}
          />
          <ControlledInput
            control={control}
            name="assetName"
            label="Asset Name"
            placeholder="e.g. Tractor, Shop, etc."
            rules={{ required: 'Asset name required' }}
            errorText={errors.assetName?.message}
          />
          <ControlledInput
            control={control}
            name="assetValue"
            label="Asset Value"
            keyboardType="numeric"
            placeholder="₹"
            rules={{ required: 'Asset value required' }}
            errorText={errors.assetValue?.message}
          />
          <Controller
            control={control}
            name="loanType"
            rules={{ required: 'Loan type required' }}
            render={({ field }) => (
              <ChipSelector
                label="Loan Type"
                options={loanTypeOptions}
                multiple={false}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.loanType?.message}
              />
            )}
          />
          <ControlledInput
            control={control}
            name="bankName"
            label="Bank Name"
            placeholder="Bank name"
            rules={{ required: 'Bank is required' }}
            errorText={errors.bankName?.message}
          />
          <ControlledInput
            control={control}
            name="branchName"
            label="Branch Name"
            placeholder="Branch handling the loan"
            errorText={errors.branchName?.message}
          />
          <ControlledInput
            control={control}
            name="sanctionAmount"
            label="Sanction Amount"
            keyboardType="numeric"
            placeholder="₹"
            rules={{ required: 'Sanction amount required' }}
            errorText={errors.sanctionAmount?.message}
          />
 
          <ControlledInput
            control={control}
            name="disbursedAmount"
            label="Disbursed Amount"
            keyboardType="numeric"
            placeholder="₹"
            rules={{ required: 'Disbursed amount required' }}
            errorText={errors.disbursedAmount?.message}
          />
          <ControlledInput
            control={control}
            name="sanctionDate"
            label="Sanction Date"
            placeholder="YYYY-MM-DD"
            rules={{ required: 'Sanction date required' }}
            errorText={errors.sanctionDate?.message}
          />
          <ControlledInput
            control={control}
            name="disbursementDate"
            label="Disbursement Date"
            placeholder="YYYY-MM-DD"
            errorText={errors.disbursementDate?.message}
          />
          <ControlledInput
            control={control}
            name="emiStartDate"
            label="EMI Start Date"
            placeholder="YYYY-MM-DD"
            errorText={errors.emiStartDate?.message}
          />
          <ControlledInput
            control={control}
            name="emiAmount"
            label="Monthly EMI"
            keyboardType="numeric"
            placeholder="₹"
            errorText={errors.emiAmount?.message}
          />
          <ControlledInput
            control={control}
            name="loanPurpose"
            label="Loan Purpose"
            placeholder="Describe business need"
            multiline
            numberOfLines={4}
            rules={{ required: 'Loan purpose required' }}
            errorText={errors.loanPurpose?.message}
          />
        </FormSectionCard>

        <FormSectionCard
          title="Business / Asset Details"
          subtitle="Grounding for utilization"
          icon={<AppIcon name="briefcase-outline" size={24} color="primary" />}
        >
          <ControlledInput
            control={control}
            name="businessName"
            label="Business Name"
            placeholder="Registered entity"
            rules={{ required: 'Business name required' }}
            errorText={errors.businessName?.message}
          />
          <Controller
            control={control}
            name="businessType"
            rules={{ required: 'Business type required' }}
            render={({ field }) => (
              <ChipSelector
                label="Business Type"
                options={businessTypeOptions}
                multiple={false}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.businessType?.message}
              />
            )}
          />
          <AttachmentField
            label="Invoice / Bill"
            value={values.invoiceUpload}
            helper="Upload PDF or image"
            onUpload={() => handleMockUpload('invoiceUpload')}
          />
          <ControlledInput
            control={control}
            name="licenseNumber"
            label="License / Registration Number"
            placeholder="Optional registration ID"
            errorText={errors.licenseNumber?.message}
          />
          <Controller
            control={control}
            name="businessAddress"
            rules={{ required: 'Business address required' }}
            render={({ field: { value, onChange } }) => (
              <AddressAutocompleteField
                label="Business Address"
                placeholder="Where asset operates"
                value={value}
                helperText="Search powered by Google Places"
                errorText={errors.businessAddress?.message}
                onChange={(text: string) => onChange(text)}
                onResolved={({ details }: { details?: AddressDetails | null }) =>
                  applyAddressDetails(details ?? null, 'businessGeoLocation')
                }
              />
            )}
          />
          <View style={styles.gpsRow}>
            <ControlledInput
              control={control}
              name="businessGeoLocation"
              label="Business Geo Location"
              placeholder="Lat, Long"
              containerStyle={{ flex: 1 }}
              editable={false}
              errorText={locationError?.field === 'businessGeoLocation' ? locationError.message : errors.businessGeoLocation?.message}
            />
            <AppButton
              label={
                bizGeoStatus === 'fetching'
                  ? 'Fetching...'
                  : bizGeoStatus === 'success'
                  ? 'Fetched'
                  : bizGeoStatus === 'error'
                  ? 'Retry'
                  : 'Fetch'
              }
              variant="secondary"
              icon="crosshairs-gps"
              onPress={() => handleGpsFetch('businessGeoLocation', setBizGeoStatus)}
              disabled={bizGeoStatus === 'fetching'}
              style={styles.gpsButton}
            />
          </View>
          <ControlledInput
            control={control}
            name="notes"
            label="Officer Notes"
            placeholder="Additional observations"
            multiline
            numberOfLines={3}
            errorText={errors.notes?.message}
          />
 
        </FormSectionCard>

        <View style={styles.footer}>
          <AppButton
            label={isSubmitting ? 'Saving...' : 'Save Beneficiary'}
            onPress={onSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
    </View>
  );
};

// Helper components
type AttachmentFieldProps = {
  label: string;
  value?: string;
  helper?: string;
  onUpload: () => void;
};

const AttachmentField = ({ label, value, helper, onUpload }: AttachmentFieldProps) => {
  return (
    <View style={styles.attachmentField}>
      <View style={styles.attachmentInfo}>
        <Text style={styles.attachmentLabel}>{label}</Text>
        <Text style={[styles.attachmentValue, !value && styles.attachmentPlaceholder]}>
          {value || 'No file selected'}
        </Text>
        {helper ? <Text style={styles.attachmentHelper}>{helper}</Text> : null}
      </View>
      <AppButton
        label={value ? 'Replace' : 'Upload'}
        variant="secondary"
        icon="paperclip"
        onPress={onUpload}
        style={styles.attachmentButton}
      />
    </View>
  );
};

type ChipOption = { label: string; value: string };

type ChipSelectorProps = {
  label: string;
  options: ChipOption[];
  multiple?: boolean;
  value?: string | string[];
  onChange: (next: any) => void;
  error?: string;
  helper?: string;
};

const ChipSelector = ({ label, options, multiple, value, onChange, error, helper }: ChipSelectorProps) => {
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const handleSelect = (chipValue: string) => {
    if (multiple) {
      const next = selectedValues.includes(chipValue)
        ? selectedValues.filter((item) => item !== chipValue)
        : [...selectedValues, chipValue];
      onChange(next);
    } else {
      onChange(chipValue);
    }
  };

  return (
    <View style={styles.chipSection}>
      <Text style={styles.chipLabel}>{label}</Text>
      {helper ? <Text style={styles.chipHelper}>{helper}</Text> : null}
      <View style={styles.chipRow}>
        {options.map((option) => {
          const active = selectedValues.includes(option.value);
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.chipError}>{error}</Text> : null}
    </View>
  );
};

const ControlledInput = ({
  control,
  name,
  rules,
  errorText,
  ...props
}: InputFieldProps & { control: Control<any>; name: string; rules?: RegisterOptions }) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => (
        <InputField
          {...props}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          errorText={errorText}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  footer: {
    padding: 16,
  },
  chipSection: {
    gap: 6,
  },
  chipLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chipHelper: {
    fontSize: 13,
    color: '#6b7280',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  chipText: {
    color: '#374151',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#0369a1',
  },
  chipError: {
    fontSize: 12,
    color: '#dc2626',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  gpsButton: {
    minWidth: 110,
  },
  attachmentField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  attachmentValue: {
    marginTop: 4,
    fontSize: 13,
    color: '#1f2937',
  },
  attachmentPlaceholder: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  attachmentHelper: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  attachmentButton: {
    minWidth: 110,
  },
});

const validateAdult = (value?: string) => {
  if (!value) {
    return 'Date of birth required';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Enter valid date (YYYY-MM-DD)';
  }
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  return age >= 18 || 'Beneficiary must be 18+';
};

const genderOptions: ChipOption[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const casteOptions: ChipOption[] = [
  { label: 'General', value: 'general' },
  { label: 'OBC', value: 'obc' },
  { label: 'SC', value: 'sc' },
  { label: 'ST', value: 'st' },
];

const maritalOptions: ChipOption[] = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Widowed', value: 'widowed' },
  { label: 'Divorced', value: 'divorced' },
];

const schemeOptions: ChipOption[] = [
  { label: 'PMEGP', value: 'pmegp' },
  { label: 'PMFME', value: 'pmfme' },
  { label: 'NRLM', value: 'nrlm' },
  { label: 'State Subsidy', value: 'state-subsidy' },
];

const loanTypeOptions: ChipOption[] = [
  { label: 'Term Loan', value: 'term' },
  { label: 'Working Capital', value: 'working-capital' },
  { label: 'Equipment Finance', value: 'equipment' },
  { label: 'Murabaha', value: 'murabaha' },
];

const businessTypeOptions: ChipOption[] = [
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Trading', value: 'trading' },
  { label: 'Services', value: 'services' },
  { label: 'Agri Allied', value: 'agri' },
];
