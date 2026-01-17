export type CloudConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

const readEnv = (key: string) => import.meta.env[key] as string | undefined;

export const getCloudConfig = (): CloudConfig | null => {
  const apiKey = readEnv('VITE_FIREBASE_API_KEY');
  const authDomain = readEnv('VITE_FIREBASE_AUTH_DOMAIN');
  const projectId = readEnv('VITE_FIREBASE_PROJECT_ID');
  const storageBucket = readEnv('VITE_FIREBASE_STORAGE_BUCKET');
  const messagingSenderId = readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID');
  const appId = readEnv('VITE_FIREBASE_APP_ID');

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null;
  }

  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
};

export const cloudStatus = () => {
  const config = getCloudConfig();
  return {
    available: Boolean(config),
    missingKeys: config
      ? []
      : [
          'VITE_FIREBASE_API_KEY',
          'VITE_FIREBASE_AUTH_DOMAIN',
          'VITE_FIREBASE_PROJECT_ID',
          'VITE_FIREBASE_STORAGE_BUCKET',
          'VITE_FIREBASE_MESSAGING_SENDER_ID',
          'VITE_FIREBASE_APP_ID'
        ]
  };
};
