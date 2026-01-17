import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { firestoreDb } from './client';

export type UserRoles = {
  instructor?: boolean;
  admin?: boolean;
};

export type UserProfile = {
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
  lastLogin?: string;
  roles?: UserRoles;
  settings?: Record<string, unknown>;
  currentBankVersion?: string;
};

export const upsertUserProfile = async (user: User) => {
  const db = firestoreDb();
  if (!db) return;
  const ref = doc(db, 'users', user.uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? '',
      roles: {},
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
  } else {
    await updateDoc(ref, { lastLogin: new Date().toISOString() });
  }
};

export const fetchUserProfile = async (uid: string) => {
  const db = firestoreDb();
  if (!db) return null;
  const ref = doc(db, 'users', uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
};

export const fetchBankVersions = async () => {
  const db = firestoreDb();
  if (!db) return [] as Array<{ version: string; publishedAt?: string; notes?: string }>;
  const snapshot = await getDocs(collection(db, 'banks'));
  return snapshot.docs.map((docItem) => ({ version: docItem.id, ...docItem.data() })) as Array<{
    version: string;
    publishedAt?: string;
    notes?: string;
  }>;
};

export const createAttempt = async (uid: string, data: Record<string, unknown>) => {
  const db = firestoreDb();
  if (!db) return;
  const ref = doc(collection(db, 'users', uid, 'attempts'));
  await setDoc(ref, { ...data, timestamp: serverTimestamp() });
};

export const deleteUserData = async (uid: string) => {
  const db = firestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, 'users', uid));
};
