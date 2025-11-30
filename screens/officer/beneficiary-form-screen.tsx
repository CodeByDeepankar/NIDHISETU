import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Control, RegisterOptions } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { Chip } from '@/components/atoms/chip';
import { InputField, type InputFieldProps } from '@/components/atoms/input-field';
import { FormSectionCard } from '@/components/molecules/form-section-card';
import { BeneficiaryFormHeader } from '@/components/organisms/beneficiary-form-header';
import { AddressAutocompleteField } from '@/components/ui/address-autocomplete-field';
import { SearchableDropdown } from '@/components/ui/searchable-dropdown';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { OfficerStackParamList } from '@/navigation/types';
import { beneficiaryRepository } from '@/services/api/beneficiaryRepository';
import type { AddressDetails } from '@/services/googlePlaces';
import { locationService, type LocationOption } from '@/services/locationHierarchy';
import { useAuthStore } from '@/state/authStore';
import type { BeneficiaryFormPayload, BeneficiaryFormValues, BeneficiaryMetadata, OfficerContext } from '@/types/beneficiary';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ExpoLocation from 'expo-location';

export type BeneficiaryFormScreenProps = NativeStackScreenProps<OfficerStackParamList, 'BeneficiaryForm'>;

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const casteOptions = [
  { label: 'General', value: 'general' },
  { label: 'OBC', value: 'obc' },
  { label: 'SC', value: 'sc' },
  { label: 'ST', value: 'st' },
];

const maritalOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Widowed', value: 'widowed' },
];

const schemeOptions = [
  { label: 'PMEGP', value: 'PMEGP' },
  { label: 'Stand-Up India', value: 'StandUp' },
  { label: 'Mudra', value: 'Mudra' },
];

const loanTypeOptions = [
  { label: 'Term Loan', value: 'term' },
  { label: 'Working Capital', value: 'working' },
];

const businessTypeOptions = [
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Service', value: 'service' },
  { label: 'Trading', value: 'trading' },
];

const priorityOptions = [
  { label: 'Low', value: 'Low' },
  { label: 'Normal', value: 'Normal' },
  { label: 'High', value: 'High' },
];

const tagOptions = [
  { label: 'Women', value: 'women' },
  { label: 'Youth', value: 'youth' },
  { label: 'Minority', value: 'minority' },
  { label: 'Rural', value: 'rural' },
];

const photoChecklist = [
  { label: 'Asset Photo', value: 'asset-photo' },
  { label: 'Beneficiary Selfie', value: 'selfie' },
  { label: 'Invoice Copy', value: 'invoice' },
  { label: 'Shop Front', value: 'shop' },
];

const videoChecklist = [
  { label: 'Asset Walk-around', value: 'asset-walk' },
  { label: 'Shop Tour', value: 'shop-tour' },
];

const docChecklist = [
  { label: 'Invoice PDF', value: 'invoice-pdf' },
  { label: 'Stock Register', value: 'stock-register' },
  { label: 'Utility Bill', value: 'utility-bill' },
];

const requiredFieldKeys: (keyof BeneficiaryFormValues)[] = [
  'fullName',
  'guardianName',
  'dateOfBirth',
  'gender',
  'aadhaar',
  'pan',
  'mobile',
  'address',
  'state',
  'district',
  'block',
  'village',
  'pin',
  'loanId',
  'schemeName',
  'loanType',
  'bankName',
  'branchName',
  'ifsc',
  'sanctionAmount',
  'disbursedAmount',
  'sanctionDate',
  'loanPurpose',
  'businessName',
  'businessType',
  'assetName',
  'assetValue',
  'businessAddress',
  'requiredPhotos',
  'deadline',
  'assignedOfficer',
  'priorityLevel',
];

export const BeneficiaryFormScreen = ({ navigation }: BeneficiaryFormScreenProps) => {
  const theme = useAppTheme();
  const profile = useAuthStore((state) => state.profile);
  const officerName = profile?.name ?? 'Field Officer';
  const officerRegion = profile && 'region' in profile ? profile.region : undefined;

  const defaultValues = useMemo<BeneficiaryFormValues>(
    () => ({
      fullName: '',
      guardianName: '',
      dateOfBirth: '',
      gender: '',
      aadhaar: '',
      pan: '',
      caste: '',
      maritalStatus: '',
      beneficiaryPhoto: '',
      mobile: '',
      alternateNumber: '',
      email: '',
      state: '',
      address: '',
      district: officerRegion ?? '',
      block: '',
      village: '',
      pin: '',
      geoLocation: '',
      loanId: '',
      schemeName: 'PMEGP',
      loanType: 'term',
      bankName: '',
      branchName: '',
      ifsc: '',
      sanctionAmount: '',
      disbursedAmount: '',
      sanctionDate: '',
      disbursementDate: '',
      emiStartDate: '',
      emiAmount: '',
      loanPurpose: '',
      businessName: '',
      businessType: '',
      assetName: '',
      assetValue: '',
      invoiceUpload: '',
      businessAddress: '',
      businessGeoLocation: '',
      licenseNumber: '',
      requiredPhotos: ['asset-photo', 'selfie'],
      requiredVideos: [],
      requiredDocuments: [],
      deadline: '',
      assignedOfficer: officerName,
      priorityLevel: 'Normal',
      notes: '',
      tags: officerRegion ? [officerRegion.toLowerCase()] : [],
    }),
    [officerName, officerRegion]
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    register,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<BeneficiaryFormValues>({ defaultValues, mode: 'onBlur' });

  const [geoStatus, setGeoStatus] = useState<'idle' | 'fetching' | 'ready'>('idle');
  const [bizGeoStatus, setBizGeoStatus] = useState<'idle' | 'fetching' | 'ready'>('idle');
  const [stateOptions, setStateOptions] = useState<LocationOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<LocationOption[]>([]);
  const [blockOptions, setBlockOptions] = useState<LocationOption[]>([]);
  const [villageOptions, setVillageOptions] = useState<LocationOption[]>([]);
  const [stateLoading, setStateLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [villageLoading, setVillageLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<LocationOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<LocationOption | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<LocationOption | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<LocationOption | null>(null);
  const [pinStatus, setPinStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<{ field: 'geoLocation' | 'businessGeoLocation'; message: string }>();

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
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return Boolean(value && value.toString().trim().length);
    }).length;
    return Math.round((filled / requiredFieldKeys.length) * 100);
  }, [values]);

  const docCount = (values.requiredPhotos?.length ?? 0) + (values.requiredVideos?.length ?? 0) + (values.requiredDocuments?.length ?? 0);

  const officerContext = useMemo<OfficerContext>(
    () => ({
      id: profile?.id,
      name: officerName,
      mobile: profile?.mobile,
      region: officerRegion,
    }),
    [profile, officerName, officerRegion]
  );

  const metadata: BeneficiaryMetadata = {
    ...metadataSeed,
    updatedAt: new Date().toISOString(),
    docCount,
    completionPercent,
    createdBy: officerContext,
  };

  const loadStates = useCallback(async (query?: string) => {
    setStateLoading(true);
    try {
      const list = await locationService.getStates(query);
      setStateOptions(list);
    } catch (error) {
      console.warn('Unable to load states', error);
      setStateOptions([]);
    } finally {
      setStateLoading(false);
    }
  }, []);

  const loadDistricts = useCallback(async (stateOption?: LocationOption | null, query?: string) => {
    if (!stateOption) {
      setDistrictOptions([]);
      return;
    }
    setDistrictLoading(true);
    try {
      const list = await locationService.getDistricts(stateOption, query);
      setDistrictOptions(list);
    } catch (error) {
      console.warn('Unable to load districts', error);
      setDistrictOptions([]);
    } finally {
      setDistrictLoading(false);
    }
  }, []);

  const loadBlocks = useCallback(async (
    stateOption?: LocationOption | null,
    districtOption?: LocationOption | null,
    query?: string
  ) => {
    if (!stateOption || !districtOption) {
      setBlockOptions([]);
      return;
    }
    setBlockLoading(true);
    try {
      const list = await locationService.getBlocks(stateOption, districtOption, query);
      setBlockOptions(list);
    } catch (error) {
      console.warn('Unable to load blocks', error);
      setBlockOptions([]);
    } finally {
      setBlockLoading(false);
    }
  }, []);

  const loadVillages = useCallback(async (
    stateOption?: LocationOption | null,
    districtOption?: LocationOption | null,
    blockOption?: LocationOption | null,
    query?: string
  ) => {
    if (!stateOption || !districtOption || !blockOption) {
      setVillageOptions([]);
      return;
    }
    setVillageLoading(true);
    try {
      const list = await locationService.getVillages(stateOption, districtOption, blockOption, query);
      setVillageOptions(list);
    } catch (error) {
      console.warn('Unable to load villages', error);
      setVillageOptions([]);
    } finally {
      setVillageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStates();
  }, [loadStates]);

  const handleStateSelect = useCallback(
    async (option: LocationOption, userInitiated = true) => {
      setSelectedState(option);
      setSelectedDistrict(null);
      setSelectedBlock(null);
      setVillageOptions([]);
      if (userInitiated) {
        setValue('state', option.name, { shouldDirty: true, shouldValidate: true });
      } else {
        setValue('state', option.name);
      }
      setValue('district', '');
      setValue('block', '');
      setValue('village', '');
      await loadDistricts(option);
    },
    [loadDistricts, setValue]
  );

  const handleDistrictSelect = useCallback(
    async (
      option: LocationOption,
      userInitiated = true,
      ctx?: { state?: LocationOption | null }
    ) => {
      const parentState = ctx?.state ?? selectedState;
      setSelectedDistrict(option);
      setSelectedBlock(null);
      setVillageOptions([]);
      if (userInitiated) {
        setValue('district', option.name, { shouldDirty: true, shouldValidate: true });
      } else {
        setValue('district', option.name);
      }
      setValue('block', '');
      setValue('village', '');
      if (parentState) {
        await loadBlocks(parentState, option);
      } else {
        setBlockOptions([]);
      }
    },
    [loadBlocks, selectedState, setValue]
  );

  const handleBlockSelect = useCallback(
    async (
      option: LocationOption,
      userInitiated = true,
      ctx?: { state?: LocationOption | null; district?: LocationOption | null }
    ) => {
      const parentState = ctx?.state ?? selectedState;
      const parentDistrict = ctx?.district ?? selectedDistrict;
      setSelectedBlock(option);
      if (userInitiated) {
        setValue('block', option.name, { shouldDirty: true, shouldValidate: true });
      } else {
        setValue('block', option.name);
      }
      setSelectedVillage(null);
      setValue('village', '');
      if (parentState && parentDistrict) {
        await loadVillages(parentState, parentDistrict, option);
      } else {
        setVillageOptions([]);
      }
    },
    [loadVillages, selectedDistrict, selectedState, setValue]
  );

  const handleVillageSelect = useCallback(
    (option: LocationOption) => {
      setSelectedVillage(option);
      setValue('village', option.name, { shouldDirty: true, shouldValidate: true });
    },
    [setValue]
  );

  const handleGpsFetch = async (
    field: 'geoLocation' | 'businessGeoLocation',
    setter: typeof setGeoStatus
  ) => {
    setter('fetching');
    setLocationError(undefined);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== ExpoLocation.PermissionStatus.GRANTED) {
        setLocationError({ field, message: 'Location permission denied. Enable GPS to auto-fill coordinates.' });
        setter('idle');
        return;
      }
      const position = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced });
      const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
      setValue(field, coords, { shouldDirty: true, shouldValidate: true });
      setter('ready');
    } catch (error) {
      setLocationError({ field, message: 'Unable to fetch current location.' });
      setter('idle');
    }
  };

  const applyAddressDetails = useCallback(
    (details: AddressDetails | null | undefined, field: 'geoLocation' | 'businessGeoLocation') => {
      if (!details) {
        return;
      }
      if (typeof details.latitude === 'number' && typeof details.longitude === 'number') {
        const coords = `${details.latitude.toFixed(4)}, ${details.longitude.toFixed(4)}`;
        setValue(field, coords, { shouldDirty: true, shouldValidate: true });
        if (field === 'geoLocation') {
          setGeoStatus('ready');
        } else {
          setBizGeoStatus('ready');
        }
      }
      const postalCode = details.components?.find((component) => component.types.includes('postal_code'))?.longName;
      if (postalCode && getValues('pin') !== postalCode) {
        setValue('pin', postalCode, { shouldDirty: true, shouldValidate: true });
      }
    },
    [getValues, setValue]
  );

  useEffect(() => {
    register('state', { required: 'State is required' });
    register('district', { required: 'District is required' });
    register('block', { required: 'Block is required' });
    register('village', { required: 'Village is required' });
  }, [register]);

  useEffect(() => {
    if (!stateOptions.length || !values.state || selectedState) {
      return;
    }
    const match = stateOptions.find((option) => option.name === values.state);
    if (match) {
      handleStateSelect(match, false);
    }
  }, [stateOptions, values.state, selectedState, handleStateSelect]);

  useEffect(() => {
    if (!districtOptions.length || !values.district || selectedDistrict || !selectedState) {
      return;
    }
    const match = districtOptions.find((option) => option.name === values.district);
    if (match) {
      handleDistrictSelect(match, false, { state: selectedState });
    }
  }, [districtOptions, values.district, selectedDistrict, selectedState, handleDistrictSelect]);

  useEffect(() => {
    if (!blockOptions.length || !values.block || selectedBlock || !selectedState || !selectedDistrict) {
      return;
    }
    const match = blockOptions.find((option) => option.name === values.block);
    if (match) {
      handleBlockSelect(match, false, { state: selectedState, district: selectedDistrict });
    }
  }, [blockOptions, values.block, selectedBlock, selectedState, selectedDistrict, handleBlockSelect]);

  useEffect(() => {
    if (!villageOptions.length || !values.village || selectedVillage) {
      return;
    }
    const match = villageOptions.find((option) => option.name === values.village);
    if (match) {
      handleVillageSelect(match);
    }
  }, [villageOptions, values.village, selectedVillage, handleVillageSelect]);

  useEffect(() => {
    const pin = values.pin?.trim();
    if (!pin || pin.length !== 6) {
      setPinStatus('idle');
      return;
    }
    let cancelled = false;
    setPinStatus('searching');
    (async () => {
      try {
        const match = await locationService.lookupPincode(pin);
        if (cancelled) {
          return;
        }
        if (match?.state) {
          await handleStateSelect(match.state, false);
          setValue('state', match.state.name, { shouldValidate: true });
          if (match.district) {
            await handleDistrictSelect(match.district, false, { state: match.state });
            setValue('district', match.district.name, { shouldValidate: true });
          }
          setPinStatus('success');
        } else {
          setPinStatus('error');
        }
      } catch {
        if (!cancelled) {
          setPinStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [values.pin, handleDistrictSelect, handleStateSelect, setValue]);

  const pinHelperText = useMemo(() => {
    if (pinStatus === 'searching') {
      return 'Detecting region from PIN...';
    }
    if (pinStatus === 'success') {
      return 'Region detected from PIN.';
    }
    if (pinStatus === 'error') {
      return 'PIN not mapped. Select region manually.';
    }
    return 'Enter 6 digit PIN';
  }, [pinStatus]);

  const handleMockUpload = (field: 'beneficiaryPhoto' | 'invoiceUpload') => {
    const filename = `${field}-${Date.now()}.jpg`;
    setValue(field, filename);
  };

  const onSubmit = handleSubmit(async (formValues) => {
    const payload: BeneficiaryFormPayload = {
      ...formValues,
      sanctionAmount: Number(formValues.sanctionAmount || 0),
      disbursedAmount: Number(formValues.disbursedAmount || 0),
      emiAmount: Number(formValues.emiAmount || 0),
      assetValue: Number(formValues.assetValue || 0),
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
          title="Personal Details"
          subtitle="Identity, demographics, and government IDs"
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
                value={field.value}
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
              <ChipSelector label="Caste / Category" options={casteOptions} multiple={false} value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="maritalStatus"
            render={({ field }) => (
              <ChipSelector label="Marital Status" options={maritalOptions} multiple={false} value={field.value} onChange={field.onChange} />
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
            placeholder="10 digit"
            rules={{
              required: 'Mobile number required',
              pattern: { value: /^\d{10}$/, message: 'Enter 10 digit mobile number' },
            }}
            errorText={errors.mobile?.message}
          />
          <ControlledInput
            control={control}
            name="alternateNumber"
            label="Alternate Number"
            keyboardType="number-pad"
            placeholder="Optional"
          />
          <ControlledInput
            control={control}
            name="email"
            label="Email"
            keyboardType="email-address"
            placeholder="applicant@email.com"
            rules={{
              pattern: { value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i, message: 'Invalid email' },
            }}
            errorText={errors.email?.message}
          />
          <Controller
            control={control}
            name="address"
            rules={{ required: 'Address is required' }}
            render={({ field: { value, onChange } }) => (
              <AddressAutocompleteField
                label="Residential Address"
                placeholder="House, Street"
                value={value}
                helperText="Search powered by Google Places"
                errorText={errors.address?.message}
                onChange={(text: string) => onChange(text)}
                onResolved={({ details }: { details?: AddressDetails | null }) =>
                  applyAddressDetails(details ?? null, 'geoLocation')
                }
              />
            )}
          />
          <View style={[styles.locationCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant }]}
            accessibilityLabel="Location hierarchy selector"
          >
            <AppText variant="titleSmall" color="text" style={styles.locationCardTitle}>
              Location Hierarchy
            </AppText>
            <AppText variant="bodySmall" color="muted">
              Tap each level to search. Child dropdowns unlock once the parent is selected.
            </AppText>
            <View style={styles.locationDropdownStack}>
              <SearchableDropdown
                label="State"
                placeholder="Select state"
                value={values.state}
                options={stateOptions}
                loading={stateLoading}
                onSelect={handleStateSelect}
                onSearch={loadStates}
                helperText="Search all available states"
                errorText={errors.state?.message}
              />
              <SearchableDropdown
                label="District"
                placeholder={selectedState ? 'Select district' : 'Select state to continue'}
                value={values.district}
                options={districtOptions}
                loading={districtLoading}
                disabled={!selectedState}
                onSelect={handleDistrictSelect}
                onSearch={(query: string) => {
                  if (selectedState) {
                    loadDistricts(selectedState, query);
                  }
                }}
                helperText={selectedState ? 'Showing districts for selected state' : 'Select a state first'}
                errorText={errors.district?.message}
              />
              <SearchableDropdown
                label="Block / Subdivision"
                placeholder={selectedDistrict ? 'Select block' : 'Select district to continue'}
                value={values.block}
                options={blockOptions}
                loading={blockLoading}
                disabled={!selectedDistrict}
                onSelect={handleBlockSelect}
                onSearch={(query: string) => {
                  if (selectedState && selectedDistrict) {
                    loadBlocks(selectedState, selectedDistrict, query);
                  }
                }}
                helperText={selectedDistrict ? 'Blocks filtered for chosen district' : 'Select a district first'}
                errorText={errors.block?.message}
              />
              <SearchableDropdown
                label="Village / Ward"
                placeholder={selectedBlock ? 'Select village' : 'Select block to continue'}
                value={values.village}
                options={villageOptions}
                loading={villageLoading}
                disabled={!selectedBlock}
                onSelect={handleVillageSelect}
                onSearch={(query: string) => {
                  if (selectedState && selectedDistrict && selectedBlock) {
                    loadVillages(selectedState, selectedDistrict, selectedBlock, query);
                  }
                }}
                helperText={selectedBlock ? 'Villages filtered for chosen block' : 'Select a block first'}
                errorText={errors.village?.message}
              />
            </View>
          </View>
          <ControlledInput
            control={control}
            name="pin"
            label="Pincode"
            keyboardType="number-pad"
            placeholder="6 digit PIN"
            maxLength={6}
            helperText={pinHelperText}
            rules={{
              required: 'Pincode is required',
              pattern: { value: /^\d{6}$/, message: 'Enter 6 digit PIN' },
            }}
            errorText={errors.pin?.message}
          />
          <View style={styles.gpsRow}>
            <ControlledInput
              control={control}
              name="geoLocation"
              label="GPS Coordinates"
              placeholder="Lat, Long"
              editable={false}
              containerStyle={{ flex: 1 }}
              errorText={locationError?.field === 'geoLocation' ? locationError.message : errors.geoLocation?.message}
            />
            <AppButton
              label={geoStatus === 'fetching' ? '...' : 'Fetch'}
              variant="secondary"
              icon="crosshairs-gps"
              onPress={() => handleGpsFetch('geoLocation', setGeoStatus)}
              disabled={geoStatus === 'fetching'}
              style={styles.gpsButton}
            />
          </View>
        </FormSectionCard>

        <FormSectionCard
          title="Loan Details"
          subtitle="Sanction, disbursement, and purpose"
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
                value={field.value}
                onChange={field.onChange}
                error={errors.schemeName?.message}
              />
            )}
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
                value={field.value}
                onChange={field.onChange}
                error={errors.loanType?.message}
              />
            )}
          />
          <ControlledInput
            control={control}
            name="bankName"
            label="Bank Name"
            placeholder="Select bank"
            rules={{ required: 'Bank is required' }}
            errorText={errors.bankName?.message}
          />
          <ControlledInput
            control={control}
            name="branchName"
            label="Branch Name"
            placeholder="Branch"
            rules={{ required: 'Branch name required' }}
            errorText={errors.branchName?.message}
          />
          <ControlledInput
            control={control}
            name="ifsc"
            label="IFSC Code"
            placeholder="SBIN0001234"
            autoCapitalize="characters"
            rules={{
              required: 'IFSC required',
              pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/i, message: 'Invalid IFSC' },
            }}
            errorText={errors.ifsc?.message}
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
                value={field.value}
                onChange={field.onChange}
                error={errors.businessType?.message}
              />
            )}
          />
          <ControlledInput
            control={control}
            name="assetName"
            label="Asset Name"
            placeholder="Machine, vehicle"
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
          <AttachmentField
            label="Invoice / Bill"
            value={values.invoiceUpload}
            helper="Upload PDF or image"
            onUpload={() => handleMockUpload('invoiceUpload')}
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
              label={bizGeoStatus === 'fetching' ? '...' : 'Fetch'}
              variant="secondary"
              icon="crosshairs-gps"
              onPress={() => handleGpsFetch('businessGeoLocation', setBizGeoStatus)}
              disabled={bizGeoStatus === 'fetching'}
              style={styles.gpsButton}
            />
          </View>
        </FormSectionCard>

        <View style={styles.footer}>
          <AppButton
            label={isSubmitting ? 'Saving...' : 'Save Draft'}
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

const ChipSelector = ({
  label,
  options,
  value,
  onChange,
  error,
  multiple = false,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string | string[];
  onChange: (val: string | string[]) => void;
  error?: string;
  multiple?: boolean;
}) => {
  const theme = useAppTheme();
  
  const handlePress = (optionValue: string) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      if (current.includes(optionValue)) {
        onChange(current.filter((v) => v !== optionValue));
      } else {
        onChange([...current, optionValue]);
      }
    } else {
      onChange(optionValue);
    }
  };

  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <View style={styles.chipSelector}>
      <AppText variant="labelMedium" color="text">
        {label}
      </AppText>
      <View style={styles.chipRow}>
        {options.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            tone={isSelected(opt.value) ? 'primary' : 'outline'}
            onPress={() => handlePress(opt.value)}
          />
        ))}
      </View>
      {error && (
        <AppText variant="labelSmall" color="error">
          {error}
        </AppText>
      )}
    </View>
  );
};

const AttachmentField = ({
  label,
  value,
  helper,
  onUpload,
}: {
  label: string;
  value?: string;
  helper?: string;
  onUpload: () => void;
}) => {
  const theme = useAppTheme();
  return (
    <View style={styles.attachmentField}>
      <AppText variant="labelMedium" color="text">
        {label}
      </AppText>
      <View style={[styles.attachmentBox, { borderColor: theme.colors.outline }]}>
        {value ? (
          <View style={styles.attachmentPreview}>
            <AppIcon name="image" size={24} color="primary" />
            <AppText variant="bodySmall" color="text" numberOfLines={1} style={{ flex: 1 }}>
              {value}
            </AppText>
            <AppIcon name="check-circle" size={20} color="success" />
          </View>
        ) : (
          <AppButton
            label="Upload"
            variant="ghost"
            icon="cloud-upload"
            onPress={onUpload}
            style={{ alignSelf: 'flex-start' }}
          />
        )}
      </View>
      {helper && (
        <AppText variant="labelSmall" color="muted">
          {helper}
        </AppText>
      )}
    </View>
  );
};

// Validation helper
const validateAdult = (dateString: string) => {
  const birth = new Date(dateString);
  if (isNaN(birth.getTime())) return 'Invalid date';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 18 || 'Beneficiary must be 18+';
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
  chipSelector: {
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  locationCardTitle: {
    marginBottom: 4,
  },
  locationDropdownStack: {
    gap: 12,
    marginTop: 8,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  gpsButton: {
    marginBottom: 24, // Align with input
    height: 56,
  },
  attachmentField: {
    gap: 8,
  },
  attachmentBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
