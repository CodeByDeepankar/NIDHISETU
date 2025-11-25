export type AuthStackParamList = {
  Welcome: undefined;
  MobileInput: undefined;
  OtpVerification: { mobile?: string } | undefined;
  Onboarding: undefined;
};

export type BeneficiaryDrawerParamList = {
  BeneficiaryDashboard: undefined;
  UploadEvidence: { requirementId?: string; requirementName?: string } | undefined;
  PreviousSubmissions: undefined;
  BeneficiaryProfile: undefined;
  SyncStatus: undefined;
  LoanAssistant: undefined;
  LoanDetails: undefined;
  LoanEvidenceCamera: { requirementId?: string; requirementName?: string; loanId?: string } | undefined;
};

export type OfficerStackParamList = {
  OfficerDashboard: undefined;
  Beneficiaries: undefined;
  BeneficiaryForm: undefined;
  VerificationTasks: undefined;
  Reports: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
  Support: undefined;
};

export type ReviewerStackParamList = {
  ReviewerDashboard: undefined;
  ReviewerSubmissions: undefined;
  ReviewDetail: { submissionId: string };
};

export type RootStackParamList = {
  AuthFlow: undefined;
  AppFlow: undefined;
};
