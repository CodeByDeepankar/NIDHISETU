import { useCallback, useEffect, useMemo, useState } from 'react';

import { officerRepository } from '@/services/api/officerRepository';
import { useAuthStore } from '@/state/authStore';
import type { OfficerProfile } from '@/types/entities';

export const useOfficerProfile = () => {
  const baseProfile = useAuthStore((state) => state.profile);
  const updateProfileInStore = useAuthStore((state) => state.actions.updateProfile);
  const [profile, setProfile] = useState<OfficerProfile | null>(
    baseProfile?.role === 'officer' ? (baseProfile as OfficerProfile) : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!baseProfile || baseProfile.role !== 'officer' || !baseProfile.id) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const profileId = baseProfile.id;
    let isMounted = true;
    const unsubscribe = officerRepository.subscribeToProfile(
      profileId,
      (next) => {
        if (!isMounted) {
          return;
        }
        if (next) {
          setProfile(next);
          updateProfileInStore(next);
          setIsLoading(false);
        }
      },
      (err) => {
        if (!isMounted) {
          return;
        }
        setError(err.message);
        setIsLoading(false);
      }
    );

    const ensureProfileDocument = async () => {
      try {
        const existing = await officerRepository.getProfile(profileId);
        if (!existing) {
          await officerRepository.upsertProfile(baseProfile as OfficerProfile);
          if (isMounted) {
            setProfile(baseProfile as OfficerProfile);
            updateProfileInStore(baseProfile);
          }
        } else if (isMounted) {
          setProfile(existing);
          updateProfileInStore(existing);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load officer profile.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    ensureProfileDocument();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [baseProfile?.id, baseProfile?.role, baseProfile, updateProfileInStore]);

  const saveProfile = useCallback(
    async (updates: Partial<OfficerProfile>) => {
      if (!baseProfile || baseProfile.role !== 'officer' || !baseProfile.id) {
        throw new Error('Officer profile is not available.');
      }
      setIsSaving(true);
      setError(undefined);
      try {
        const patched = await officerRepository.updateProfile(baseProfile.id, updates);
        if (patched) {
          setProfile(patched);
          updateProfileInStore(patched);
        }
        return patched;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to update profile.';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [baseProfile, updateProfileInStore]
  );

  const canEdit = useMemo(() => Boolean(baseProfile?.role === 'officer'), [baseProfile?.role]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    canEdit,
    saveProfile,
  };
};
