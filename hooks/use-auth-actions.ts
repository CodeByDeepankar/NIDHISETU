import { useMutation } from '@tanstack/react-query';

import { beneficiaryRepository } from '@/services/api/beneficiaryRepository';
import { twilioVerifyClient } from '@/services/twilioVerify';
import { useAuthStore } from '@/state/authStore';
import type { UserProfile } from '@/types/entities';

const staticProfiles: Record<string, UserProfile> = {
  '8260045617': {
    id: 'officer-1',
    name: 'District Officer',
    mobile: '8260045617',
    role: 'officer',
    department: 'MSME Directorate',
    designation: 'District Lead',
    region: 'Bhopal Division',
  },
  '9009001234': {
    id: 'reviewer-1',
    name: 'Lead Reviewer',
    mobile: '9009001234',
    role: 'reviewer',
    institution: 'National Bank',
    branch: 'Bhopal HQ',
  },
};

const resolveProfile = async (mobile: string): Promise<UserProfile> => {
  const normalized = beneficiaryRepository.normalizeMobile(mobile);
  if (!normalized) {
    throw new Error('Please provide a valid mobile number.');
  }
  if (staticProfiles[normalized]) {
    return staticProfiles[normalized];
  }
  const beneficiaryProfile = await beneficiaryRepository.getProfileByMobile(normalized);
  if (beneficiaryProfile) {
    return beneficiaryProfile;
  }
  throw new Error('This number is not linked to a beneficiary record. Please contact your officer.');
};

export const useAuthActions = () => {
  const { requestOtp, verifyOtp, completeOnboarding, logout } = useAuthStore((state) => state.actions);
  const storedMobile = useAuthStore((state) => state.mobile);

  const requestOtpMutation = useMutation({
    mutationFn: async (mobile: string) => {
      if (!mobile) {
        throw new Error('Please enter a mobile number.');
      }
      await twilioVerifyClient.sendVerification(mobile);
      return mobile;
    },
    onSuccess: (_, mobile) => {
      requestOtp(mobile);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ otp, mobile }: { otp: string; mobile?: string }) => {
      const targetMobile = mobile ?? storedMobile;
      if (!targetMobile) {
        throw new Error('Missing mobile number for verification.');
      }
      const approved = await twilioVerifyClient.checkVerification(targetMobile, otp);
      if (!approved) {
        throw new Error('Invalid code. Please retry.');
      }
      const profile = await resolveProfile(targetMobile);
      return { profile, mobile: targetMobile };
    },
    onSuccess: (data) => {
      verifyOtp(data.mobile);
      if (data.profile) {
        completeOnboarding(data.profile);
      }
    },
  });

  return {
    requestOtp: requestOtpMutation.mutateAsync,
    verifyOtp: (otp: string, mobile?: string) => verifyOtpMutation.mutateAsync({ otp, mobile }),
    logout,
    status: {
      requestingOtp: requestOtpMutation.isPending,
      verifyingOtp: verifyOtpMutation.isPending,
    },
    errors: {
      requestOtp: requestOtpMutation.error instanceof Error ? requestOtpMutation.error.message : undefined,
      verifyOtp: verifyOtpMutation.error instanceof Error ? verifyOtpMutation.error.message : undefined,
    },
  };
};
