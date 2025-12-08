import type { BeneficiaryProfile } from './entities';

export interface BeneficiaryFormValues {
  fullName: string;
  aadhaar: string;
  address: string;
  assetName: string;
  assetValue: string;
  bankName: string;
  sanctionAmount: string;
  village: string;
  mobile: string;
  
  // Optional / Legacy fields
  guardianName?: string;
  dateOfBirth?: string;
  gender?: string;
  pan?: string;
  caste?: string;
  maritalStatus?: string;
  beneficiaryPhoto?: string;
  alternateNumber?: string;
  email?: string;
  state?: string;
  district?: string;
  block?: string;
  pin?: string;
  geoLocation?: string;
  loanId?: string;
  schemeName?: string;
  loanType?: string;
  branchName?: string;
  ifsc?: string;
  disbursedAmount?: string;
  sanctionDate?: string;
  disbursementDate?: string;
  emiStartDate?: string;
  emiAmount?: string;
  loanPurpose?: string;
  businessName?: string;
  businessType?: string;
  invoiceUpload?: string;
  businessAddress?: string;
  businessGeoLocation?: string;
  licenseNumber?: string;
  requiredPhotos?: string[];
  requiredVideos?: string[];
  requiredDocuments?: string[];
  deadline?: string;
  assignedOfficer?: string;
  priorityLevel?: string;
  notes?: string;
  tags?: string[];
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

export interface BeneficiaryTimelineEntry {
  status: string;
  reason?: string;
  timestamp: string;
}

export interface BeneficiaryNoteEntry {
  text: string;
  author?: string;
  timestamp: string;
}

export interface BeneficiaryMetadata {
  beneficiaryUid: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  statusReason?: string;
  timeline?: BeneficiaryTimelineEntry[];
  notes?: BeneficiaryNoteEntry[];
  docCount: number;
  completionPercent: number;
  createdBy?: OfficerContext;
  avatarUrl?: string;
}

export interface BeneficiaryRecord extends BeneficiaryFormPayload {
  id: string;
  metadata: BeneficiaryMetadata;
}

export type BeneficiaryProfileLookup = BeneficiaryProfile;
