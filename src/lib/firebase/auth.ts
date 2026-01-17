import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { firebaseAuth } from './client';
import { upsertUserProfile } from './firestore';

export type AuthState = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<{
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const auth = firebaseAuth();
    if (!auth) {
      setState({ user: null, loading: false });
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setState({ user, loading: false });
      if (user) {
        await upsertUserProfile(user);
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const auth = firebaseAuth();
    if (!auth) return;
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const auth = firebaseAuth();
    if (!auth) return;
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const googleSignIn = async () => {
    const auth = firebaseAuth();
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const resetPassword = async (email: string) => {
    const auth = firebaseAuth();
    if (!auth) return;
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    const auth = firebaseAuth();
    if (!auth) return;
    await signOut(auth);
  };

  const value = useMemo(
    () => ({ state, signIn, signUp, googleSignIn, resetPassword, logout }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
