export type UserRole = 'beneficiary' | 'officer' | 'reviewer';

export type SubmissionStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'syncing' | 'failed';

export type LoanStatus = 'pending' | 'sanctioned' | 'disbursed' | 'closed';

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

export interface DeviceDetails {
  brand?: string | null;
  model?: string | null;
  osName?: string | null;
  osVersion?: string | null;
}

export interface AIAnalysis {
  object?: string;
  secondary_objects?: string;
  image_quality_check?: string;
  document_check?: string;
  geo_timestamp_check?: string;
  compliance_status?: string;
  remarks?: string;
}

export interface BeneficiaryLoan {
  id: string;
  loanId: string;
  name: string;
  mobile: string;
  bank: string;
  scheme: string;
  loanAmount: number;
  sanctionDate: string;
  status: LoanStatus;
}

export interface SubmissionEvidence {
  id: string;
  assetName: string;
  mediaType: 'photo' | 'video';
  thumbnailUrl?: string;
  mediaUrl?: string;
  capturedAt: string;
  submittedAt?: string;
  location: LocationCoordinate;
  deviceDetails?: DeviceDetails;
  aiAnalysis?: AIAnalysis;
  remarks?: string;
  rejectionReason?: string;
  status: SubmissionStatus;
  isDraft?: boolean;
  offlineId?: string;
}

export type NewSubmissionPayload = Omit<SubmissionEvidence, 'id' | 'status'> & {
  status?: SubmissionStatus;
  offlineId?: string;
  beneficiaryId?: string;
};

export interface SyncState {
  status: 'idle' | 'in-progress' | 'error' | 'success';
  lastSyncedAt?: string;
  pendingCount?: number;
  errorMessage?: string;
}

export interface AnalyticsSummary {
  approved: number;
  pending: number;
  rejected: number;
  total: number;
}

export interface BaseProfile {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  email?: string;
  avatarUrl?: string;
}

export interface BeneficiaryProfile extends BaseProfile {
  role: 'beneficiary';
  village: string;
  district: string;
  bank: string;
  scheme: string;
}

export interface OfficerProfile extends BaseProfile {
  role: 'officer';
  department: string;
  designation: string;
  region: string;
}

export interface ReviewerProfile extends BaseProfile {
  role: 'reviewer';
  institution: string;
  branch: string;
}

export type UserProfile = BeneficiaryProfile | OfficerProfile | ReviewerProfile;

export interface BeneficiaryFormPayload {
  name: string;
  mobile: string;
  loanId: string;
  bank: string;
  dsc: string;
  scheme: string;
  loanAmount: number;
  sanctionDate: string;
}

export interface ReviewDecisionPayload {
  submissionId: string;
  decision: 'approve' | 'reject';
  remarks?: string;
}
