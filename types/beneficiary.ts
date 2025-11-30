import type { BeneficiaryProfile } from './entities';

export interface BeneficiaryFormValues {
  fullName: string;
  guardianName: string;
  dateOfBirth: string;
  gender: string;
  aadhaar: string;
  pan: string;
  caste: string;
  maritalStatus: string;
  beneficiaryPhoto: string;
  mobile: string;
  alternateNumber: string;
  email: string;
  state: string;
  address: string;
  district: string;
  block: string;
  village: string;
  pin: string;
  geoLocation: string;
  loanId: string;
  schemeName: string;
  loanType: string;
  bankName: string;
  branchName: string;
  ifsc: string;
  sanctionAmount: string;
  disbursedAmount: string;
  sanctionDate: string;
  disbursementDate: string;
  emiStartDate: string;
  emiAmount: string;
  loanPurpose: string;
  businessName: string;
  businessType: string;
  assetName: string;
  assetValue: string;
  invoiceUpload: string;
  businessAddress: string;
  businessGeoLocation: string;
  licenseNumber: string;
  requiredPhotos: string[];
  requiredVideos: string[];
  requiredDocuments: string[];
  deadline: string;
  assignedOfficer: string;
  priorityLevel: string;
  notes: string;
  tags: string[];
}

export type BeneficiaryNumericFields = 'sanctionAmount' | 'disbursedAmount' | 'emiAmount' | 'assetValue';

export type BeneficiaryFormPayload = Omit<BeneficiaryFormValues, BeneficiaryNumericFields> & {
  sanctionAmount: number;
  disbursedAmount: number;
  emiAmount: number;
  assetValue: number;
};

export interface OfficerContext {
  id?: string;
  name?: string;
  mobile?: string;
  region?: string;
}

export interface BeneficiaryMetadata {
  beneficiaryUid: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  docCount: number;
  completionPercent: number;
  createdBy?: OfficerContext;
}

export interface BeneficiaryRecord extends BeneficiaryFormPayload {
  id: string;
  metadata: BeneficiaryMetadata;
}

export type BeneficiaryProfileLookup = BeneficiaryProfile;
