export type AuthStackParamList = {
  Welcome: undefined;
  MobileInput: undefined;
  OtpVerification: { mobile?: string } | undefined;
  Onboarding: undefined;
  SetPin: undefined;
  EnterPin: { reason?: string; mobile?: string } | undefined;
};

export type BeneficiaryDrawerParamList = {
  BeneficiaryRoot: undefined;
  BeneficiaryDashboard: undefined;
  UploadEvidence: { requirementId?: string; requirementName?: string } | undefined;
  PreviousSubmissions: undefined;
  SubmissionDetail: { submission: any };
  BeneficiaryProfile: undefined;
  EditProfile: undefined;
  SyncStatus: undefined;
  LoanAssistant: undefined;
  LoanDetails: undefined;
  LoanEvidenceCamera: { requirementId?: string; requirementName?: string; loanId?: string } | undefined;
  EmiCalculator: undefined;
  SubsidyCalculator: undefined;
  EligibilityPrediction: undefined;
  Notifications: undefined;
  ContactOfficer: undefined;
};

export type OfficerStackParamList = {
  OfficerRoot: undefined;
  OfficerDashboard: undefined;
  Beneficiaries: { filter?: string } | undefined;
  BeneficiaryForm: undefined;
  VerificationTasks: undefined;
  VerificationDetail: { beneficiaryId: string } | undefined;
  OfficerSubmissionDetail: { submission: any; beneficiaryId: string };
  Reports: undefined;
  Notifications: undefined;
  Settings: undefined;
  Support: undefined;
  ActiveSessions: undefined;
  ChangePassword: undefined;
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
