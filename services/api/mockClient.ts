import type {
    AnalyticsSummary,
    BeneficiaryFormPayload,
    BeneficiaryLoan,
    NewSubmissionPayload,
    OfficerProfile,
    SubmissionEvidence,
    UserProfile
} from '@/types/entities';

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

const mockProfile: UserProfile = {
  id: 'user-1',
  name: 'Field Beneficiary',
  mobile: '9876543210',
  role: 'beneficiary',
  village: 'Rampur',
  district: 'Kanpur',
  bank: 'SBI',
  scheme: 'PMEGP',
};

const mockLoan: BeneficiaryLoan = {
  id: 'loan-1',
  loanId: 'PMEGP/2024/123',
  name: mockProfile.name,
  mobile: mockProfile.mobile,
  bank: mockProfile.bank,
  scheme: mockProfile.scheme,
  loanAmount: 250000,
  sanctionDate: '2024-06-01',
  status: 'disbursed',
};

const mockSubmissions: SubmissionEvidence[] = new Array(4).fill(null).map((_, index) => ({
  id: `submission-${index}`,
  assetName: `Asset ${index + 1}`,
  mediaType: index % 2 === 0 ? 'photo' : 'video',
  capturedAt: new Date(Date.now() - index * 86_400_000).toISOString(),
  submittedAt: index % 2 === 0 ? new Date(Date.now() - index * 43_200_000).toISOString() : undefined,
  location: { latitude: 23.2 + index * 0.01, longitude: 77.1 + index * 0.01 },
  status: index % 3 === 0 ? 'approved' : 'pending',
}));

const analytics: AnalyticsSummary = {
  approved: 24,
  pending: 4,
  rejected: 2,
  total: 30,
};

const officerProfile: OfficerProfile = {
  id: 'officer-1',
  name: 'District Officer',
  mobile: '8260045617',
  role: 'officer',
  department: 'MSME Directorate',
  designation: 'District Lead',
  region: 'Bhopal Division',
};

const profileDirectory: Record<string, UserProfile> = {
  [mockProfile.mobile]: mockProfile,
  [officerProfile.mobile]: officerProfile,
};

export const mockApi = {
  async loginWithMobile(mobile: string) {
    await delay();
    return { success: true, otpToken: 'mock-otp-token', mobile };
  },
  async getBeneficiary() {
    await delay();
    return { loan: mockLoan, profile: mockProfile };
  },
  async getProfileByMobile(mobile: string) {
    await delay();
    const sanitized = mobile.replace(/[^0-9]/g, '');
    const profile = profileDirectory[sanitized] ?? mockProfile;
    return { profile };
  },
  async getSubmissions() {
    await delay();
    return mockSubmissions;
  },
  async submitEvidence(payload: NewSubmissionPayload): Promise<SubmissionEvidence> {
    await delay();
    return {
      id: `server-${Date.now()}`,
      assetName: payload.assetName,
      mediaType: payload.mediaType,
      capturedAt: payload.capturedAt ?? new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      location: payload.location,
      thumbnailUrl: payload.thumbnailUrl,
      mediaUrl: payload.mediaUrl,
      remarks: payload.remarks,
      status: payload.status ?? 'submitted',
      offlineId: undefined,
    };
  },
  async syncPending(queue: SubmissionEvidence[]) {
    await delay(1000);
    return queue.map((item, index) => ({
      ...item,
      id: `synced-${Date.now()}-${index}`,
      offlineId: undefined,
      status: 'submitted' as const,
      submittedAt: new Date().toISOString(),
    }));
  },
  async addBeneficiary(payload: BeneficiaryFormPayload) {
    await delay();
    return { ...payload, id: `benef-${Date.now()}` };
  },
  async reviewSubmission(submissionId: string, decision: 'approve' | 'reject', remarks?: string) {
    await delay();
    return { submissionId, status: decision === 'approve' ? 'approved' : 'rejected', remarks };
  },
  async getAnalytics() {
    await delay();
    return analytics;
  },
};
