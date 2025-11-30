import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    type DocumentData,
    type DocumentSnapshot,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type {
    BeneficiaryFormPayload,
    BeneficiaryMetadata,
    BeneficiaryRecord,
    OfficerContext,
} from '@/types/beneficiary';
import type { BeneficiaryProfile } from '@/types/entities';

const COLLECTION_NAME = 'beneficiaries';
const beneficiariesCollection = collection(db, COLLECTION_NAME);

const cleanContext = (context?: OfficerContext): OfficerContext | undefined => {
  if (!context) {
    return undefined;
  }
  const entries = Object.entries(context).filter(([, value]) => Boolean(value));
  return entries.length ? (Object.fromEntries(entries) as OfficerContext) : undefined;
};

const normalizeMobile = (mobile: string) => mobile.replace(/[^0-9]/g, '');

const buildDocRef = (id: string) => doc(beneficiariesCollection, id);

const materializeRecord = (snapshot: DocumentSnapshot<DocumentData>) => {
  const data = snapshot.data() as Omit<BeneficiaryRecord, 'id'> | undefined;
  if (!data) {
    throw new Error('Beneficiary record is missing payload');
  }
  return { ...data, id: snapshot.id };
};

const saveDraft = async (formValues: BeneficiaryFormPayload, metadata: BeneficiaryMetadata): Promise<BeneficiaryRecord> => {
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
  const record: BeneficiaryRecord = {
    ...sanitizedValues,
    id: normalizedMobile,
    metadata: metadataToPersist,
  };
  const { id, ...persistable } = record;
  await setDoc(buildDocRef(normalizedMobile), persistable, { merge: true });
  return { ...record, id };
};

const getRecordByMobile = async (mobile: string): Promise<BeneficiaryRecord | null> => {
  const normalizedMobile = normalizeMobile(mobile);
  if (!normalizedMobile) {
    return null;
  }
  const snapshot = await getDoc(buildDocRef(normalizedMobile));
  if (!snapshot.exists()) {
    return null;
  }
  return materializeRecord(snapshot);
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
    village: record.village,
    district: record.district,
    bank: record.bankName,
    scheme: record.schemeName,
  };
};

const buildListQuery = () => query(beneficiariesCollection, orderBy('metadata.createdAt', 'desc'));

const listRecords = async (): Promise<BeneficiaryRecord[]> => {
  const snapshot = await getDocs(buildListQuery());
  return snapshot.docs.map(materializeRecord);
};

const subscribeToRecords = (onData: (records: BeneficiaryRecord[]) => void, onError?: (error: Error) => void) => {
  return onSnapshot(
    buildListQuery(),
    (snapshot) => {
      const records = snapshot.docs.map(materializeRecord);
      onData(records);
    },
    (error) => {
      onError?.(error as Error);
    }
  );
};

const subscribeToRecord = (
  recordId: string,
  onData: (record: BeneficiaryRecord | null) => void,
  onError?: (error: Error) => void
) => {
  if (!recordId) {
    onData(null);
    return () => undefined;
  }
  return onSnapshot(
    buildDocRef(recordId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(materializeRecord(snapshot));
    },
    (error) => onError?.(error as Error)
  );
};

export const beneficiaryRepository = {
  normalizeMobile,
  saveDraft,
  getRecordByMobile,
  getProfileByMobile,
  listRecords,
  subscribeToRecords,
  subscribeToRecord,
};
