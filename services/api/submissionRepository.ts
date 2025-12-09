import { supabase } from '@/lib/supabaseClient';
import type { NewSubmissionPayload, SubmissionEvidence } from '@/types/entities';

const COLLECTION_NAME = 'submissions';

const ensureLocation = (location?: SubmissionEvidence['location']) => {
  if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
    return location;
  }
  return { latitude: 0, longitude: 0 } satisfies SubmissionEvidence['location'];
};

const materializeSubmission = (data: any): SubmissionEvidence => {
  return {
    id: data.id,
    assetName: data.assetName ?? 'Evidence',
    mediaType: data.mediaType ?? 'photo',
    thumbnailUrl: data.thumbnailUrl,
    mediaUrl: data.mediaUrl,
    capturedAt: data.capturedAt,
    submittedAt: data.submittedAt,
    location: ensureLocation(data.location),
    deviceDetails: data.deviceDetails,
    aiAnalysis: data.aiAnalysis,
    remarks: data.remarks,
    rejectionReason: data.rejectionReason,
    status: data.status ?? 'pending',
    isDraft: data.isDraft,
    offlineId: data.offlineId,
  };
};

const listByBeneficiary = async (beneficiaryId: string): Promise<SubmissionEvidence[]> => {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { data, error } = await supabase
    .from(COLLECTION_NAME)
    .select('*')
    .eq('beneficiaryId', beneficiaryId)
    .order('capturedAt', { ascending: false });

  if (error) throw error;
  return (data || []).map(materializeSubmission);
};

const subscribeToBeneficiarySubmissions = (
  beneficiaryId: string,
  onData: (submissions: SubmissionEvidence[]) => void,
  onError?: (error: Error) => void
) => {
  if (!beneficiaryId || !supabase) {
    onData([]);
    return () => undefined;
  }

  // Initial fetch
  listByBeneficiary(beneficiaryId)
    .then(onData)
    .catch((err) => onError?.(err instanceof Error ? err : new Error(String(err))));

  const channel = supabase
    .channel('public:submissions')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: COLLECTION_NAME,
        filter: `beneficiaryId=eq.${beneficiaryId}`,
      },
      () => {
        // Refresh data on any change
        listByBeneficiary(beneficiaryId)
          .then(onData)
          .catch((err) => onError?.(err instanceof Error ? err : new Error(String(err))));
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
};

const createSubmission = async (beneficiaryId: string, payload: NewSubmissionPayload): Promise<SubmissionEvidence> => {
  if (!supabase) throw new Error('Supabase not initialized');

  const docPayload = {
    beneficiaryId,
    assetName: payload.assetName ?? 'Evidence',
    mediaType: payload.mediaType ?? 'photo',
    capturedAt: payload.capturedAt ?? new Date().toISOString(),
    submittedAt: payload.submittedAt ?? new Date().toISOString(),
    location: ensureLocation(payload.location),
    deviceDetails: payload.deviceDetails ?? null,
    aiAnalysis: payload.aiAnalysis ?? null,
    remarks: payload.remarks ?? null,
    thumbnailUrl: payload.thumbnailUrl ?? null,
    mediaUrl: payload.mediaUrl ?? null,
    status: payload.status ?? 'submitted',
    isDraft: payload.isDraft ?? false,
    offlineId: payload.offlineId ?? null,
    // requirementId: payload.requirementId ?? null, // Removed as column doesn't exist
  };

  const { data, error } = await supabase
    .from(COLLECTION_NAME)
    .insert(docPayload)
    .select()
    .single();

  if (error) throw error;
  return materializeSubmission(data);
};

const createSubmissions = async (
  beneficiaryId: string,
  payloads: NewSubmissionPayload[]
): Promise<SubmissionEvidence[]> => {
  if (!payloads.length) {
    return [];
  }
  const created: SubmissionEvidence[] = [];
  for (const payload of payloads) {
    const entry = await createSubmission(beneficiaryId, payload);
    created.push(entry);
  }
  return created;
};

const updateStatus = async (id: string, status: string, rejectionReason?: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase not initialized');

  const updates: any = { status };
  if (rejectionReason) {
    updates.rejectionReason = rejectionReason;
  }

  const { error } = await supabase
    .from(COLLECTION_NAME)
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

const updateAIAnalysis = async (id: string, aiAnalysis: any): Promise<void> => {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase
    .from(COLLECTION_NAME)
    .update({ aiAnalysis })
    .eq('id', id);

  if (error) throw error;
};

export const submissionRepository = {
  listByBeneficiary,
  subscribeToBeneficiarySubmissions,
  createSubmission,
  createSubmissions,
  updateStatus,
  updateAIAnalysis,
};
