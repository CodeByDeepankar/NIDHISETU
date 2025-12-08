import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Control, RegisterOptions } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { InputField, type InputFieldProps } from '@/components/atoms/input-field';
import { FormSectionCard } from '@/components/molecules/form-section-card';
import { BeneficiaryFormHeader } from '@/components/organisms/beneficiary-form-header';
import { AddressAutocompleteField } from '@/components/ui/address-autocomplete-field';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { OfficerStackParamList } from '@/navigation/types';
import { beneficiaryRepository } from '@/services/api/beneficiaryRepository';
import type { AddressDetails } from '@/services/googlePlaces';
import { useAuthStore } from '@/state/authStore';
import type {
	BeneficiaryFormPayload,
	BeneficiaryFormValues,
	BeneficiaryMetadata,
	OfficerContext,
} from '@/types/beneficiary';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type BeneficiaryFormScreenProps = NativeStackScreenProps<
	OfficerStackParamList,
	'BeneficiaryForm'
>;

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

type ChipOption = {
	label: string;
	value: string;
};

type UploadableField = 'beneficiaryPhoto' | 'invoiceUpload';
type GeoStatus = 'idle' | 'fetching' | 'ready' | 'error';

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
	{ label: 'Stand-Up India', value: 'standup' },
	{ label: 'Mudra', value: 'mudra' },
	{ label: 'CMEGP', value: 'cmegp' },
];

const loanTypeOptions: ChipOption[] = [
	{ label: 'Term Loan', value: 'term' },
	{ label: 'Working Capital', value: 'wc' },
	{ label: 'Equipment', value: 'equipment' },
	{ label: 'Personal', value: 'personal' },
];

const businessTypeOptions: ChipOption[] = [
	{ label: 'Manufacturing', value: 'manufacturing' },
	{ label: 'Services', value: 'services' },
	{ label: 'Trading', value: 'trading' },
	{ label: 'Agri Allied', value: 'agri' },
];

const validateAdult = (value?: string) => {
	if (!value) {
		return 'Date of birth is required';
	}
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return 'Enter a valid date (YYYY-MM-DD)';
	}
	const today = new Date();
	const adultThreshold = new Date(
		today.getFullYear() - 18,
		today.getMonth(),
		today.getDate()
	);
	return parsed <= adultThreshold || 'Beneficiary must be at least 18 years old';
};

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

	const [bizGeoStatus, setBizGeoStatus] = useState<GeoStatus>('idle');

	const metadata: BeneficiaryMetadata = {
		...metadataSeed,
		updatedAt: new Date().toISOString(),
		docCount: 0,
		completionPercent,
		createdBy: officerContext,
	};

	const handleMockUpload = useCallback(
		(field: UploadableField) => {
			const fakePath = `${field}-${Date.now()}.jpg`;
			setValue(field, fakePath as BeneficiaryFormValues[UploadableField], {
				shouldDirty: true,
			});
			Alert.alert(
				'Attachment added',
				'A placeholder reference was saved for preview purposes.'
			);
		},
		[setValue]
	);

	const applyAddressDetails = useCallback(
		(
			details: AddressDetails | null,
			geoField: keyof Pick<BeneficiaryFormValues, 'businessGeoLocation'>
		) => {
			if (!details) {
				return;
			}

			if (details.formattedAddress) {
				setValue('businessAddress', details.formattedAddress, {
					shouldDirty: true,
				});
			}

			if (
				typeof details.latitude === 'number' &&
				typeof details.longitude === 'number'
			) {
				const coords = `${details.latitude.toFixed(6)}, ${details.longitude.toFixed(6)}`;
				setValue(geoField, coords as BeneficiaryFormValues[typeof geoField], {
					shouldDirty: true,
					shouldValidate: true,
				});
			}
		},
		[setValue]
	);

	const handleGpsFetch = useCallback(
		async (
			geoField: keyof Pick<BeneficiaryFormValues, 'businessGeoLocation'>,
			setStatus: (status: GeoStatus) => void
		) => {
			setStatus('fetching');
			const getCoords = () =>
				new Promise<string>((resolve, reject) => {
					const geolocation = (globalThis as any)?.navigator?.geolocation;
					if (geolocation?.getCurrentPosition) {
						geolocation.getCurrentPosition(
							(position: { coords: { latitude: number; longitude: number } }) => {
								resolve(
									`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
								);
							},
							(error: unknown) => reject(error),
							{ enableHighAccuracy: true, timeout: 10000 }
						);
					} else {
						resolve('17.385000, 78.486700');
					}
				});

			try {
				const coords = await getCoords();
				setValue(geoField, coords as BeneficiaryFormValues[typeof geoField], {
					shouldDirty: true,
					shouldValidate: true,
				});
				setStatus('ready');
			} catch (error) {
				console.warn('GPS fetch failed', error);
				Alert.alert(
					'GPS unavailable',
					'Unable to fetch live coordinates. Please try again later.'
				);
				setStatus('error');
			}
		},
		[setValue]
	);

	useEffect(() => {
		if (values.businessGeoLocation) {
			setBizGeoStatus((status) => (status === 'fetching' ? status : 'ready'));
		}
	}, [values.businessGeoLocation]);

	const gpsButtonLabel =
		bizGeoStatus === 'fetching'
			? 'Locating…'
			: bizGeoStatus === 'ready'
			? 'Refetch GPS'
			: 'Fetch GPS';

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
			const message =
				error instanceof Error
					? error.message
					: 'Unable to save beneficiary right now. Please retry.';
			Alert.alert('Save failed', message);
		}
	});

	return (
		<View style={styles.container}>
			<BeneficiaryFormHeader
				onBack={() => navigation.goBack()}
				completionPercent={completionPercent}
			/>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingHorizontal: 16 },
				]}
				showsVerticalScrollIndicator={false}
			>
				<View
					style={[
						styles.sectionCard,
						{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.border,
						},
					]}
				>
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
								pattern: {
									value: /^\d{12}$/,
									message: 'Enter 12 digit Aadhaar',
								},
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
								pattern: {
									value: /^[A-Z]{5}[0-9]{4}[A-Z]$/i,
									message: 'Invalid PAN format',
								},
							}}
							errorText={errors.pan?.message}
						/>
						<Controller
							control={control}
							name="caste"
							render={({ field }) => (
								<ChipSelector
									label="Caste / Category"
									options={casteOptions}
									multiple={false}
									value={field.value ?? ''}
									onChange={field.onChange}
									error={errors.caste?.message}
								/>
							)}
						/>
						<Controller
							control={control}
							name="maritalStatus"
							render={({ field }) => (
								<ChipSelector
									label="Marital Status"
									options={maritalOptions}
									multiple={false}
									value={field.value ?? ''}
									onChange={field.onChange}
									error={errors.maritalStatus?.message}
								/>
							)}
						/>
						<AttachmentField
							label="Beneficiary Photo"
							value={values.beneficiaryPhoto}
							helper="Optional image upload"
							onUpload={() => handleMockUpload('beneficiaryPhoto')}
						/>
					</FormSectionCard>
				</View>

				<View
					style={[
						styles.sectionCard,
						{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.border,
						},
					]}
				>
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
								pattern: {
									value: /^\d{10}$/,
									message: 'Enter 10 digit mobile number',
								},
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
				</View>

				<View
					style={[
						styles.sectionCard,
						{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.border,
						},
					]}
				>
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
							name="assetValue"
							label="Asset Value"
							keyboardType="numeric"
							placeholder="₹"
							rules={{ required: 'Asset value required' }}
							errorText={errors.assetValue?.message}
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
				</View>

				<View
					style={[
						styles.sectionCard,
						{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.border,
						},
					]}
				>
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
								errorText={errors.businessGeoLocation?.message}
							/>
							<AppButton
								label={gpsButtonLabel}
								variant="secondary"
								icon="crosshairs-gps"
								onPress={() => handleGpsFetch('businessGeoLocation', setBizGeoStatus)}
								disabled={bizGeoStatus === 'fetching'}
								style={styles.gpsButton}
							/>
						</View>
					</FormSectionCard>
				</View>

				<View
					style={[
						styles.sectionCard,
						{
							backgroundColor: theme.colors.surface,
							borderColor: theme.colors.border,
						},
					]}
				>
					<FormSectionCard
						title="Officer Notes"
						subtitle="Additional observations"
						icon={<AppIcon name="note-text-outline" size={24} color="primary" />}
					>
						<ControlledInput
							control={control}
							name="notes"
							label="Notes"
							placeholder="Add comments, observations, or follow-ups"
							multiline
							numberOfLines={3}
							errorText={errors.notes?.message}
						/>
					</FormSectionCard>
				</View>

				<View style={styles.footer}>
					<AppButton
						label={isSubmitting ? 'Saving...' : 'Save Beneficiary'}
						onPress={onSubmit}
						loading={isSubmitting}
						disabled={isSubmitting}
						style={styles.saveButton}
					/>
				</View>
			</ScrollView>
		</View>
	);
};

// Helper components

type AttachmentFieldProps = {
	label: string;
	value?: string | string[];
	helper?: string;
	onUpload?: () => void;
};

const AttachmentField = ({ label, value, helper, onUpload }: AttachmentFieldProps) => {
	const theme = useAppTheme();
	const attachments = useMemo(() => {
		if (!value) return [] as string[];
		const normalized = Array.isArray(value) ? value : [value];
		return normalized
			.map((item) => (item ?? '').toString().trim())
			.filter((item) => item.length > 0);
	}, [value]);

	const hasAttachments = attachments.length > 0;

	return (
		<View
			style={[
				styles.attachmentField,
				{
					borderColor: theme.colors.border,
					backgroundColor: theme.colors.surfaceVariant,
				},
			]}
		>
			<View style={styles.attachmentHeader}>
				<AppText variant="titleSmall" color="text">
					{label}
				</AppText>
				<AppButton
					label={hasAttachments ? 'Replace File' : 'Upload File'}
					icon="paperclip"
					variant={hasAttachments ? 'secondary' : 'outline'}
					compact
					style={styles.attachmentButton}
					onPress={onUpload}
				/>
			</View>
			{helper ? (
				<AppText variant="labelSmall" color="muted">
					{helper}
				</AppText>
			) : null}
			{hasAttachments ? (
				<View style={styles.attachmentFiles}>
					{attachments.map((file, index) => (
						<View
							key={`${file}-${index}`}
							style={[
								styles.attachmentChip,
								{ backgroundColor: theme.colors.secondaryContainer },
							]}
						>
							<AppIcon name="file-outline" size={16} color="secondary" />
							<AppText
								variant="bodySmall"
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{formatAttachmentLabel(file, index)}
							</AppText>
						</View>
					))}
				</View>
			) : (
				<View
					style={[
						styles.attachmentPlaceholder,
						{ borderColor: theme.colors.border },
					]}
				>
					<AppIcon name="image-outline" size={18} color="muted" />
					<AppText variant="bodySmall" color="muted">
						No attachment added yet
					</AppText>
				</View>
			)}
		</View>
	);
};

const formatAttachmentLabel = (value: string, fallbackIndex: number) => {
	const parts = value.split(/[\\/]/);
	const name = parts[parts.length - 1]?.trim();
	if (name) {
		return name;
	}
	return `Attachment ${fallbackIndex + 1}`;
};

type ChipSelectorProps = {
	label: string;
	options: ChipOption[];
	value?: string | string[];
	multiple?: boolean;
	onChange: (next: string | string[]) => void;
	error?: string;
};

const ChipSelector = ({
	label,
	options,
	value,
	multiple = false,
	onChange,
	error,
}: ChipSelectorProps) => {
	const theme = useAppTheme();
	const selectedValues = multiple
		? Array.isArray(value)
			? value
			: value
			? [value]
			: []
		: [typeof value === 'string' ? value : ''];

	const toggle = (nextValue: string) => {
		if (multiple) {
			const current = new Set(selectedValues);
			if (current.has(nextValue)) {
				current.delete(nextValue);
			} else {
				current.add(nextValue);
			}
			onChange(Array.from(current));
		} else {
			onChange(nextValue);
		}
	};

	return (
		<View style={styles.chipSelector}>
			<View style={styles.chipSelectorHeader}>
				<AppText variant="labelMedium" color="text">
					{label}
				</AppText>
				{error ? (
					<AppText variant="labelSmall" color="error">
						{error}
					</AppText>
				) : null}
			</View>
			<View style={styles.chipSelectorRow}>
				{options.map((option) => {
					const isSelected = multiple
						? selectedValues.includes(option.value)
						: selectedValues[0] === option.value;
					return (
						<TouchableOpacity
							key={option.value}
							style={[
								styles.selectableChip,
								{
									borderColor: theme.colors.gradientEnd,
									backgroundColor: isSelected
										? theme.colors.gradientStart
										: 'transparent',
								},
							]}
							onPress={() => toggle(option.value)}
							activeOpacity={0.85}
						>
							<AppText
								variant="labelMedium"
								style={[
									styles.selectableChipLabel,
									{
										color: isSelected ? theme.colors.onPrimary : theme.colors.text,
									},
								]}
							>
								{option.label}
							</AppText>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
};

const ControlledInput = ({
	control,
	name,
	rules,
	errorText,
	containerStyle,
	...props
}: InputFieldProps & { control: Control<any>; name: string; rules?: RegisterOptions }) => {
	const mergedContainerStyle = StyleSheet.flatten([
		styles.inputContainer,
		containerStyle,
	]);

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
					containerStyle={mergedContainerStyle}
				/>
			)}
		/>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5F5F5',
	},
	scrollView: {
		flex: 1,
		backgroundColor: '#F5F5F5',
	},
	scrollContent: {
		paddingTop: 16,
		paddingBottom: 40,
		gap: 16,
	},
	sectionCard: {
		borderRadius: 16,
		padding: 12,
		marginBottom: 16,
		borderWidth: 1,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		elevation: 3,
	},
	inputContainer: {
		marginTop: 12,
	},
	footer: {
		paddingHorizontal: 4,
		paddingVertical: 16,
	},
	saveButton: {
		backgroundColor: '#008080',
		borderColor: '#008080',
		borderWidth: 1,
	},
	gpsRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 12,
		marginTop: 12,
	},
	gpsButton: {
		minWidth: 120,
	},
	attachmentField: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 12,
		gap: 8,
		marginTop: 16,
	},
	attachmentHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
	attachmentButton: {
		alignSelf: 'flex-start',
		paddingHorizontal: 12,
	},
	attachmentFiles: {
		gap: 8,
	},
	attachmentChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 10,
	},
	attachmentPlaceholder: {
		borderWidth: 1,
		borderStyle: 'dashed',
		borderRadius: 10,
		paddingVertical: 12,
		alignItems: 'center',
		gap: 6,
		marginTop: 8,
	},
	chipSelector: {
		marginTop: 16,
		gap: 8,
	},
	chipSelectorHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	chipSelectorRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	selectableChip: {
		borderWidth: 1,
		borderRadius: 999,
		paddingVertical: 8,
		paddingHorizontal: 16,
	},
	selectableChipLabel: {
		fontSize: 14,
	},
});
