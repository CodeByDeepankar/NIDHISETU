import { useMutation } from '@tanstack/react-query';

import { beneficiaryRepository } from '@/services/api/beneficiaryRepository';
import { officerRepository } from '@/services/api/officerRepository';
import { reviewerRepository } from '@/services/api/reviewerRepository';
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
  '9348441103': {
    id: 'officer-2',
    name: 'Nodal Officer',
    mobile: '9348441103',
    role: 'officer',
    department: 'MSME Directorate',
    designation: 'Nodal Officer',
    region: 'Odisha Division',
  },
  '9777569415': {
    id: 'officer-3',
    name: 'Field Officer',
    mobile: '9777569415',
    role: 'officer',
    department: 'MSME Directorate',
    designation: 'Field Officer',
    region: 'Chhattisgarh Circle',
  },
  '9009001234': {
    id: 'reviewer-1',
    name: 'Lead Reviewer',
    mobile: '9009001234',
    role: 'reviewer',
    institution: 'National Bank',
    branch: 'Bhopal HQ',
  },
  '7894558720': {
    id: 'officer-4',
    name: 'Test Officer',
    mobile: '7894558720',
    role: 'officer',
    department: 'MSME Directorate',
    designation: 'General Officer',
    region: 'General',
  },
};

const resolveProfile = async (mobile: string): Promise<UserProfile> => {
  const normalized = beneficiaryRepository.normalizeMobile(mobile);
  if (!normalized) {
    throw new Error('Please provide a valid mobile number.');
  }
  
  // 1. Check Beneficiary DB (Prioritize DB over static for beneficiaries)
  const beneficiaryProfile = await beneficiaryRepository.getProfileByMobile(normalized);
  if (beneficiaryProfile) {
    return beneficiaryProfile;
  }

  // 2. Check Static (Legacy/Dev)
  if (staticProfiles[normalized]) {
    return staticProfiles[normalized];
  }

  // 3. Check Officer DB
  const officerProfile = await officerRepository.getProfileByMobile(normalized);
  if (officerProfile) {
    return officerProfile;
  }

  // 4. Check Reviewer DB
  const reviewerProfile = await reviewerRepository.getProfileByMobile(normalized);
  if (reviewerProfile) {
    return reviewerProfile;
  }

  throw new Error('This number is not linked to a user record. Please contact your administrator.');
};

export const useAuthActions = () => {
  const { requestOtp, verifyOtp, completeOnboarding, logout, updateProfile, switchRole } = useAuthStore((state) => state.actions);
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

      // Sync to Supabase
      try {
        if (profile.role === 'officer') {
          await officerRepository.upsertProfile(profile);
        } else if (profile.role === 'reviewer') {
          await reviewerRepository.upsertProfile(profile);
        }
      } catch (err) {
        console.warn('Failed to sync user profile to Supabase:', err);
      }

      return { profile, mobile: targetMobile };
    },
    onSuccess: (data) => {
      verifyOtp(data.mobile);
      if (data.profile) {
        // Set profile and role, but defer onboarding completion until PIN/fingerprint flow.
        updateProfile(data.profile);
        switchRole(data.profile.role);
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
