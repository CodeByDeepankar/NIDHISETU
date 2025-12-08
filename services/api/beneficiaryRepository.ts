import { supabase } from '@/lib/supabaseClient';
import type {
  BeneficiaryFormPayload,
  BeneficiaryMetadata,
  BeneficiaryRecord,
  OfficerContext,
} from '@/types/beneficiary';
import type { BeneficiaryProfile } from '@/types/entities';

const COLLECTION_NAME = 'beneficiaries';

const cleanContext = (context?: OfficerContext): OfficerContext | undefined => {
  if (!context) {
    return undefined;
  }
  const entries = Object.entries(context).filter(([, value]) => Boolean(value));
  return entries.length ? (Object.fromEntries(entries) as OfficerContext) : undefined;
};

const normalizeMobile = (mobile: string) => mobile.replace(/[^0-9]/g, '');

const toDbPayload = (payload: BeneficiaryFormPayload & { id: string; metadata: BeneficiaryMetadata }) => ({
  id: payload.id,
  full_name: payload.fullName,
  aadhaar: payload.aadhaar,
  address: payload.address,
  asset_name: payload.assetName,
  asset_value: payload.assetValue,
  bank_name: payload.bankName,
  sanction_amount: payload.sanctionAmount,
  village: payload.village,
  mobile: payload.mobile,
  metadata: payload.metadata,
});

const fromDbRecord = (record: any): BeneficiaryRecord => ({
  id: record.id,
  fullName: record.full_name,
  aadhaar: record.aadhaar,
  address: record.address,
  assetName: record.asset_name,
  assetValue: Number(record.asset_value) || 0,
  bankName: record.bank_name,
  sanctionAmount: Number(record.sanction_amount) || 0,
  disbursedAmount: Number(record.disbursed_amount) || 0,
  emiAmount: Number(record.emi_amount) || 0,
  village: record.village,
  mobile: record.mobile,
  metadata: (record.metadata || {}) as BeneficiaryMetadata,
  schemeName: record.scheme_name,
  district: record.district,
});

const saveDraft = async (
  formValues: BeneficiaryFormPayload,
  metadata: BeneficiaryMetadata,
): Promise<BeneficiaryRecord> => {
  if (!supabase) throw new Error('Supabase not initialized');

  const normalizedMobile = normalizeMobile(formValues.mobile);
  if (!normalizedMobile) {
    throw new Error('Beneficiary mobile number is required before saving.');
  }

  const sanitizedValues: BeneficiaryFormPayload = {
    ...formValues,
    mobile: normalizedMobile,
  };

  const context = cleanContext(metadata.createdBy);
  const metadataToPersist: BeneficiaryMetadata = {
    ...metadata,
    ...(context ? { createdBy: context } : {}),
  };

  const recordToSave = {
    ...sanitizedValues,
    id: normalizedMobile,
    metadata: metadataToPersist,
  };

  const dbPayload = toDbPayload(recordToSave);

  const { error } = await supabase.from(COLLECTION_NAME).upsert(dbPayload);

  if (error) throw error;
  return { ...recordToSave, id: normalizedMobile };
};

const getRecordByMobile = async (mobile: string): Promise<BeneficiaryRecord | null> => {
  if (!supabase) throw new Error('Supabase not initialized');

  const normalizedMobile = normalizeMobile(mobile);
  if (!normalizedMobile) {
    return null;
  }

  const { data, error } = await supabase
    .from(COLLECTION_NAME)
    .select('*')
    .eq('id', normalizedMobile)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return fromDbRecord(data);
};

const getProfileByMobile = async (mobile: string): Promise<BeneficiaryProfile | null> => {
  const record = await getRecordByMobile(mobile);
  if (!record) {
    return null;
  }

  return {
    id: record.metadata?.beneficiaryUid ?? record.id,
    name: record.fullName,
    mobile: record.mobile,
    role: 'beneficiary',
    village: record.village ?? '',
    district: record.district ?? '',
    bank: record.bankName ?? '',
    scheme: record.schemeName ?? '',
    village: record.village,
    district: record.district || '',
    bank: record.bankName,
    scheme: record.schemeName || '',
    avatarUrl: record.metadata?.avatarUrl,
  };
};

const updateProfile = async (mobile: string, updates: Partial<BeneficiaryProfile>): Promise<void> => {
  if (!supabase) throw new Error('Supabase not initialized');
  
  const normalizedMobile = normalizeMobile(mobile);
  if (!normalizedMobile) {
      console.warn('Invalid mobile number provided to updateProfile');
      return;
  }

  // Fetch current metadata first to merge
  const { data: currentRecord, error: fetchError } = await supabase
    .from(COLLECTION_NAME)
    .select('metadata')
    .eq('id', normalizedMobile)
    .single();

  if (fetchError || !currentRecord) {
    console.warn(`Beneficiary not found for mobile: ${normalizedMobile}. Creating new record.`);
    // If record doesn't exist, we create a minimal one
    const metadata = {
        beneficiaryUid: normalizedMobile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        docCount: 0,
        completionPercent: 0,
        avatarUrl: updates.avatarUrl
    };
    
    const { error: insertError } = await supabase
        .from(COLLECTION_NAME)
        .insert({
            id: normalizedMobile,
            mobile: normalizedMobile,
            full_name: updates.name || 'Unknown',
            metadata: metadata
        });
        
    if (insertError) throw insertError;
    return;
  }

  const updatedMetadata = {
    ...currentRecord.metadata,
    ...(updates.avatarUrl ? { avatarUrl: updates.avatarUrl } : {}),
    updatedAt: new Date().toISOString(),
  };

  const dbUpdates: any = {
    metadata: updatedMetadata,
  };
  
  if (updates.name) dbUpdates.full_name = updates.name;
  if (updates.village) dbUpdates.village = updates.village;

  const { error } = await supabase
    .from(COLLECTION_NAME)
    .update(dbUpdates)
    .eq('id', normalizedMobile);

  if (error) throw error;
};

const listRecords = async (): Promise<BeneficiaryRecord[]> => {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from(COLLECTION_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(fromDbRecord);
};

const updateStatus = async (mobile: string, status: string, reason?: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase not initialized');

  const record = await getRecordByMobile(mobile);
  if (!record) throw new Error('Beneficiary not found');

  const updatedMetadata = {
    ...record.metadata,
    status,
    statusReason: reason,
    updatedAt: new Date().toISOString(),
    timeline: [
      ...(record.metadata.timeline || []),
      { status, reason, timestamp: new Date().toISOString() },
    ],
  };

  const { error } = await supabase
    .from(COLLECTION_NAME)
    .update({ metadata: updatedMetadata })
    .eq('id', mobile);

  if (error) throw error;
};

const addNote = async (mobile: string, note: string, author: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase not initialized');

  const record = await getRecordByMobile(mobile);
  if (!record) throw new Error('Beneficiary not found');

  const updatedMetadata = {
    ...record.metadata,
    notes: [
      ...(record.metadata.notes || []),
      { text: note, author, timestamp: new Date().toISOString() },
    ],
  };

  const { error } = await supabase
    .from(COLLECTION_NAME)
    .update({ metadata: updatedMetadata })
    .eq('id', mobile);

  if (error) throw error;
};

const subscribeToRecords = (
  onData: (records: BeneficiaryRecord[]) => void,
  onError?: (error: Error) => void,
) => {
  const client = supabase;
  if (!client) {
    onData([]);
    return () => undefined;
  }

  listRecords()
    .then(onData)
    .catch((err) => onError?.(err instanceof Error ? err : new Error(String(err))));

  const channel = client
    .channel('public:beneficiaries')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: COLLECTION_NAME,
      },
      () => {
        listRecords()
          .then(onData)
          .catch((err) => onError?.(err instanceof Error ? err : new Error(String(err))));
      },
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
};

const subscribeToRecord = (
  recordId: string,
  onData: (record: BeneficiaryRecord | null) => void,
  onError?: (error: Error) => void,
) => {
  const client = supabase;
  if (!recordId || !client) {
    onData(null);
    return () => undefined;
  }

  getRecordByMobile(recordId)
    .then(onData)
    .catch((err) => onError?.(err instanceof Error ? err : new Error(String(err))));

  const channel = client
    .channel(`public:beneficiaries:${recordId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: COLLECTION_NAME,
        filter: `id=eq.${recordId}`,
      },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onData(null);
        } else {
          onData(fromDbRecord(payload.new));
        }
      },
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
};

export const beneficiaryRepository = {
  normalizeMobile,
  saveDraft,
  getRecordByMobile,
  getProfileByMobile,
  updateProfile,
  listRecords,
  updateStatus,
  addNote,
  subscribeToRecords,
  subscribeToRecord,
};
