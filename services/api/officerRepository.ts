import {
    doc,
    getDoc,
    onSnapshot,
    setDoc,
    type DocumentData,
    type DocumentSnapshot,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { OfficerProfile } from '@/types/entities';

const COLLECTION_NAME = 'officers';

const buildDocRef = (id: string) => doc(db, COLLECTION_NAME, id);

const materializeProfile = (snapshot: DocumentSnapshot<DocumentData>) => {
  const data = snapshot.data() as Omit<OfficerProfile, 'id'> | undefined;
  if (!data) {
    return null;
  }
  return { ...data, id: snapshot.id } satisfies OfficerProfile;
};

const getProfile = async (officerId: string): Promise<OfficerProfile | null> => {
  const snapshot = await getDoc(buildDocRef(officerId));
  if (!snapshot.exists()) {
    return null;
  }
  return materializeProfile(snapshot);
};

const upsertProfile = async (profile: OfficerProfile) => {
  const { id, ...persistable } = profile;
  await setDoc(buildDocRef(id), persistable, { merge: true });
  return profile;
};

const updateProfile = async (officerId: string, updates: Partial<OfficerProfile>) => {
  const { id: _ignored, ...safeUpdates } = updates;
  const sanitized = { ...safeUpdates, role: 'officer' as const };
  await setDoc(buildDocRef(officerId), sanitized, { merge: true });
  return getProfile(officerId);
};

const subscribeToProfile = (
  officerId: string,
  onData: (profile: OfficerProfile | null) => void,
  onError?: (error: Error) => void
) =>
  onSnapshot(
    buildDocRef(officerId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(materializeProfile(snapshot));
    },
    (error) => onError?.(error as Error)
  );

export const officerRepository = {
  getProfile,
  upsertProfile,
  updateProfile,
  subscribeToProfile,
};
