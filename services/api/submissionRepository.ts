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
    assetName: data.asset_name ?? 'Evidence',
    mediaType: data.media_type ?? 'photo',
    thumbnailUrl: data.thumbnail_url,
    mediaUrl: data.media_url,
    capturedAt: data.captured_at,
    submittedAt: data.submitted_at,
    location: ensureLocation(data.location),
    deviceDetails: data.device_details,
    aiAnalysis: data.ai_analysis,
    remarks: data.remarks,
    rejectionReason: data.rejection_reason,
    status: data.status ?? 'pending',
    isDraft: data.is_draft,
    offlineId: data.offline_id,
    requirementId: data.requirement_id,
  };
};

const listByBeneficiary = async (beneficiaryId: string): Promise<SubmissionEvidence[]> => {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const { data, error } = await supabase
    .from(COLLECTION_NAME)
    .select('*')
    .eq('beneficiary_id', beneficiaryId)
    .order('captured_at', { ascending: false });

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
        filter: `beneficiary_id=eq.${beneficiaryId}`,
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
    beneficiary_id: beneficiaryId,
    asset_name: payload.assetName ?? 'Evidence',
    media_type: payload.mediaType ?? 'photo',
    captured_at: payload.capturedAt ?? new Date().toISOString(),
    submitted_at: payload.submittedAt ?? new Date().toISOString(),
    location: ensureLocation(payload.location),
    device_details: payload.deviceDetails ?? null,
    ai_analysis: payload.aiAnalysis ?? null,
    remarks: payload.remarks ?? null,
    thumbnail_url: payload.thumbnailUrl ?? null,
    media_url: payload.mediaUrl ?? null,
    status: payload.status ?? 'submitted',
    is_draft: payload.isDraft ?? false,
    offline_id: payload.offlineId ?? null,
    requirement_id: payload.requirementId ?? null,
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
    updates.rejection_reason = rejectionReason;
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
    .update({ ai_analysis: aiAnalysis })
    .eq('id', id);

  if (error) throw error;
};

const listAllPending = async (): Promise<(SubmissionEvidence & { beneficiary?: any })[]> => {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from(COLLECTION_NAME)
    .select('*, beneficiary:beneficiaries(*)')
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true });

  if (error) throw error;
  
  return (data || []).map((item: any) => ({
    ...materializeSubmission(item),
    beneficiaryId: item.beneficiary_id,
    beneficiary: item.beneficiary,
  }));
};

export const submissionRepository = {
  listByBeneficiary,
  subscribeToBeneficiarySubmissions,
  createSubmission,
  createSubmissions,
  updateStatus,
  updateAIAnalysis,
  listAllPending,
};
