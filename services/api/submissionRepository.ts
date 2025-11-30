import {
    addDoc,
    collection,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where,
    type DocumentData,
    type DocumentSnapshot,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { NewSubmissionPayload, SubmissionEvidence } from '@/types/entities';

const COLLECTION_NAME = 'submissions';
const submissionsCollection = collection(db, COLLECTION_NAME);

type SubmissionDocument = Omit<SubmissionEvidence, 'id'> & {
  beneficiaryId: string;
  createdAt?: unknown;
};

const ensureLocation = (location?: SubmissionEvidence['location']) => {
  if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
    return location;
  }
  return { latitude: 0, longitude: 0 } satisfies SubmissionEvidence['location'];
};

const toIsoString = (value?: unknown) => {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
};

const materializeSubmission = (snapshot: DocumentSnapshot<DocumentData>) => {
  const data = snapshot.data() as SubmissionDocument | undefined;
  if (!data) {
    throw new Error('Submission payload missing.');
  }
  return {
    id: snapshot.id,
    assetName: data.assetName ?? 'Evidence',
    mediaType: data.mediaType ?? 'photo',
    thumbnailUrl: data.thumbnailUrl,
    mediaUrl: data.mediaUrl,
    capturedAt: toIsoString(data.capturedAt),
    submittedAt: data.submittedAt ? toIsoString(data.submittedAt) : undefined,
    location: ensureLocation(data.location),
    remarks: data.remarks,
    status: data.status ?? 'pending',
    isDraft: data.isDraft,
    offlineId: data.offlineId,
  } satisfies SubmissionEvidence;
};

const listByBeneficiary = async (beneficiaryId: string): Promise<SubmissionEvidence[]> => {
  const q = query(
    submissionsCollection,
    where('beneficiaryId', '==', beneficiaryId),
    orderBy('capturedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(materializeSubmission);
};

const subscribeToBeneficiarySubmissions = (
  beneficiaryId: string,
  onData: (submissions: SubmissionEvidence[]) => void,
  onError?: (error: Error) => void
) => {
  if (!beneficiaryId) {
    onData([]);
    return () => undefined;
  }
  const q = query(
    submissionsCollection,
    where('beneficiaryId', '==', beneficiaryId),
    orderBy('capturedAt', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const submissions = snapshot.docs.map(materializeSubmission);
      onData(submissions);
    },
    (error) => onError?.(error as Error)
  );
};

const buildDocPayload = (beneficiaryId: string, payload: NewSubmissionPayload): SubmissionDocument => {
  return {
    beneficiaryId,
    assetName: payload.assetName ?? 'Evidence',
    mediaType: payload.mediaType ?? 'photo',
    capturedAt: payload.capturedAt ?? new Date().toISOString(),
    submittedAt: payload.submittedAt ?? new Date().toISOString(),
    location: ensureLocation(payload.location),
    remarks: payload.remarks,
    thumbnailUrl: payload.thumbnailUrl,
    mediaUrl: payload.mediaUrl,
    status: payload.status ?? 'submitted',
    isDraft: payload.isDraft,
    offlineId: payload.offlineId,
    createdAt: serverTimestamp(),
  } satisfies SubmissionDocument;
};

const createSubmission = async (beneficiaryId: string, payload: NewSubmissionPayload): Promise<SubmissionEvidence> => {
  const docPayload = buildDocPayload(beneficiaryId, payload);
  const docRef = await addDoc(submissionsCollection, docPayload);
  return {
    id: docRef.id,
    assetName: docPayload.assetName,
    mediaType: docPayload.mediaType,
    thumbnailUrl: docPayload.thumbnailUrl,
    mediaUrl: docPayload.mediaUrl,
    capturedAt: docPayload.capturedAt,
    submittedAt: docPayload.submittedAt,
    location: docPayload.location,
    remarks: docPayload.remarks,
    status: docPayload.status,
    isDraft: docPayload.isDraft,
    offlineId: docPayload.offlineId,
  } satisfies SubmissionEvidence;
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

export const submissionRepository = {
  listByBeneficiary,
  subscribeToBeneficiarySubmissions,
  createSubmission,
  createSubmissions,
};
