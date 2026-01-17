import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getCloudConfig } from '../../config/env';

export const firebaseConfig = getCloudConfig();

export const firebaseApp = () => {
  if (!firebaseConfig) return null;
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  return getApps()[0] ?? null;
};

export const firebaseAuth = () => {
  const app = firebaseApp();
  return app ? getAuth(app) : null;
};

export const firestoreDb = () => {
  const app = firebaseApp();
  return app ? getFirestore(app) : null;
};

export const firebaseStorage = () => {
  const app = firebaseApp();
  return app ? getStorage(app) : null;
};
