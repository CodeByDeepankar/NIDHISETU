import { useCallback, useEffect, useMemo, useState } from 'react';

import { submissionRepository } from '@/services/api/submissionRepository';
import { useAuthStore } from '@/state/authStore';
import { useSubmissionQueueStore } from '@/state/submissionQueueStore';
import type { NewSubmissionPayload, SubmissionEvidence, SyncState } from '@/types/entities';
import { useNetworkStatus } from './use-network-status';

export const useSubmissions = () => {
  const profile = useAuthStore((state) => state.profile);
  const beneficiaryId = profile?.id;
  const isOnline = useNetworkStatus();

  const pending = useSubmissionQueueStore((state) => state.pending);
  const syncStatus = useSubmissionQueueStore((state) => state.syncStatus);
  const lastSyncedAt = useSubmissionQueueStore((state) => state.lastSyncedAt);
  const error = useSubmissionQueueStore((state) => state.error);
  const enqueuePending = useSubmissionQueueStore((state) => state.actions.enqueue);
  const syncPendingWithServer = useSubmissionQueueStore((state) => state.actions.syncPendingWithServer);
  const resetError = useSubmissionQueueStore((state) => state.actions.resetError);
  const [serverSubmissions, setServerSubmissions] = useState<SubmissionEvidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>();

  useEffect(() => {
    if (!beneficiaryId) {
      setServerSubmissions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = submissionRepository.subscribeToBeneficiarySubmissions(
      beneficiaryId,
      (next) => {
        setServerSubmissions(next);
        setIsLoading(false);
        setFetchError(undefined);
      },
      (err) => {
        setFetchError(err.message);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [beneficiaryId]);

  const refresh = useCallback(async () => {
    if (!beneficiaryId) {
      setServerSubmissions([]);
      return;
    }
    try {
      const latest = await submissionRepository.listByBeneficiary(beneficiaryId);
      setServerSubmissions(latest);
      setFetchError(undefined);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Unable to refresh submissions.');
    }
  }, [beneficiaryId]);

  const submitEvidence = useCallback(
    async (payload: NewSubmissionPayload) => {
      if (!beneficiaryId) {
        throw new Error('Missing beneficiary context.');
      }
      const enhancedPayload: NewSubmissionPayload = { ...payload, beneficiaryId };
      if (!isOnline) {
        return enqueuePending({ ...enhancedPayload, status: 'pending' });
      }
      try {
        return await submissionRepository.createSubmission(beneficiaryId, enhancedPayload);
      } catch (err) {
        enqueuePending({ ...enhancedPayload, status: 'failed' });
        throw err;
      }
    },
    [beneficiaryId, enqueuePending, isOnline]
  );

  useEffect(() => {
    if (!isOnline || !pending.length || syncStatus === 'syncing' || !beneficiaryId) {
      return;
    }

    let cancelled = false;

    const sync = async () => {
      try {
        const synced = await syncPendingWithServer(beneficiaryId);
        if (!synced.length || cancelled) {
          return;
        }
        resetError();
      } catch {
        // handled in store
      }
    };

    sync();

    return () => {
      cancelled = true;
    };
  }, [beneficiaryId, isOnline, pending.length, resetError, syncPendingWithServer, syncStatus]);

  const submissions = useMemo(() => {
    const pendingMap = new Set(pending.map((item) => item.offlineId));
    const filteredServer = serverSubmissions.filter((submission) =>
      submission.offlineId ? !pendingMap.has(submission.offlineId) : true
    );
    return [...pending, ...filteredServer];
  }, [pending, serverSubmissions]);

  const syncState: SyncState = useMemo(() => {
    const derivedStatus: SyncState['status'] =
      syncStatus === 'error'
        ? 'error'
        : syncStatus === 'syncing'
          ? 'in-progress'
          : pending.length
            ? 'in-progress'
            : lastSyncedAt
              ? 'success'
              : 'idle';

    return {
      status: derivedStatus,
      pendingCount: pending.length || undefined,
      lastSyncedAt,
      errorMessage: error,
    };
  }, [error, lastSyncedAt, pending.length, syncStatus]);

  return {
    submissions,
    submitEvidence,
    refresh,
    isLoading,
    syncState,
    isOnline,
    error: fetchError,
  };
};
