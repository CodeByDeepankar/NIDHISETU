import { supabase } from '@/lib/supabaseClient';

export type EvidenceRequirementRecord = {
  id: string;
  beneficiary_id: string;
  label: string;
  instructions?: string;
  response_type?: string;
  model?: string;
  permissions?: {
    camera: boolean;
    fileUpload: boolean;
  };
  image_quality?: 'best' | 'good' | 'low';
  status?: 'required' | 'pending' | 'submitted';
  created_at?: string;
};

const TABLE = 'evidence_requirements';
const SUBMISSIONS_TABLE = 'evidence_submissions';

export const evidenceRequirementApi = {
  async list(beneficiaryId: string): Promise<EvidenceRequirementRecord[]> {
    if (!beneficiaryId) return [];
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .order('created_at', { ascending: false });
    if (error) {
        console.error('fetch reqs error:', JSON.stringify(error, null, 2));
        throw error;
    }
    return data ?? [];
  },

  async create(payload: Omit<EvidenceRequirementRecord, 'id' | 'created_at'>) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...payload })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async recordSubmission(input: {
    requirementId?: string;
    beneficiaryId: string;
    mediaUrl: string;
    thumbnailUrl?: string;
    assetName: string;
    location?: { latitude: number; longitude: number };
  }) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from(SUBMISSIONS_TABLE).insert({
      requirement_id: input.requirementId ?? null,
      beneficiary_id: input.beneficiaryId,
      media_url: input.mediaUrl,
      thumbnail_url: input.thumbnailUrl ?? input.mediaUrl,
      asset_name: input.assetName,
      location: input.location ?? null,
    });

    if (error) throw error;
    
    if (input.requirementId) {
      await supabase
        .from(TABLE)
        .update({ status: 'submitted' })
        .eq('id', input.requirementId);
    }
  },
};
