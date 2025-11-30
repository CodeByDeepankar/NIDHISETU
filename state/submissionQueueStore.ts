import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { submissionRepository } from '@/services/api/submissionRepository';
import type { NewSubmissionPayload, SubmissionEvidence, SubmissionStatus } from '@/types/entities';

export interface PendingSubmission extends SubmissionEvidence {
  offlineId: string;
  status: Extract<SubmissionStatus, 'pending' | 'syncing' | 'failed'>;
  beneficiaryId: string;
}

interface SubmissionQueueState {
  pending: PendingSubmission[];
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncedAt?: string;
  error?: string;
  actions: {
    enqueue: (payload: NewSubmissionPayload) => PendingSubmission;
    remove: (offlineId: string) => void;
    resetError: () => void;
    syncPendingWithServer: (beneficiaryId: string) => Promise<SubmissionEvidence[]>;
  };
}

const buildPendingSubmission = (payload: NewSubmissionPayload): PendingSubmission => {
  const timestamp = Date.now();
  const offlineId = payload.offlineId ?? `offline-${timestamp}`;
  if (!payload.beneficiaryId) {
    throw new Error('Missing beneficiary context for pending submission.');
  }

  return {
    id: offlineId,
    offlineId,
    assetName: payload.assetName ?? 'Untitled Asset',
    mediaType: payload.mediaType ?? 'photo',
    capturedAt: payload.capturedAt ?? new Date(timestamp).toISOString(),
    location: payload.location ?? { latitude: 0, longitude: 0 },
    status: payload.status === 'failed' ? 'failed' : 'pending',
    thumbnailUrl: payload.thumbnailUrl,
    mediaUrl: payload.mediaUrl,
    remarks: payload.remarks,
    submittedAt: payload.submittedAt,
    beneficiaryId: payload.beneficiaryId,
  } as PendingSubmission;
};

export const useSubmissionQueueStore = create<SubmissionQueueState>()(
  persist(
    (set, get) => ({
      pending: [],
      syncStatus: 'idle',
      actions: {
      enqueue: (payload) => {
          const pendingSubmission = buildPendingSubmission(payload);
          set((state) => ({ pending: [pendingSubmission, ...state.pending] }));
          return pendingSubmission;
        },
        remove: (offlineId) =>
          set((state) => ({ pending: state.pending.filter((item) => item.offlineId !== offlineId) })),
        resetError: () => set({ error: undefined }),
        syncPendingWithServer: async (beneficiaryId: string) => {
          const { pending } = get();
          if (!pending.length) {
            return [];
          }
          if (!beneficiaryId) {
            throw new Error('Missing beneficiary context for syncing submissions.');
          }
          set({ syncStatus: 'syncing', error: undefined });
          try {
            const payloads = pending.map((item) => ({
              assetName: item.assetName,
              mediaType: item.mediaType,
              capturedAt: item.capturedAt,
              submittedAt: item.submittedAt,
              location: item.location,
              remarks: item.remarks,
              mediaUrl: item.mediaUrl,
              thumbnailUrl: item.thumbnailUrl,
              status: 'submitted' as SubmissionStatus,
              beneficiaryId: item.beneficiaryId,
            }));
            const synced = await submissionRepository.createSubmissions(beneficiaryId, payloads);
            set({
              pending: [],
              syncStatus: 'idle',
              lastSyncedAt: new Date().toISOString(),
            });
            return synced;
          } catch (error) {
            set({
              syncStatus: 'error',
              error: error instanceof Error ? error.message : 'Failed to sync submissions',
            });
            throw error;
          }
        },
      },
    }),
    {
      name: 'nidhisetu-submission-queue',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ pending: state.pending, lastSyncedAt: state.lastSyncedAt }),
    }
  )
);
