'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth, firebaseInitialized } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  redirectPath: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setRedirectPath: (path: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [redirectPath, setRedirectPath] = useLocalStorage<string | null>('redirectPath', null);

  useEffect(() => {
    if (!firebaseInitialized) return;
    const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const token = await fbUser.getIdTokenResult(true);
          const roles = (token.claims.roles as string[]) || [];
          setUser({
            id: fbUser.uid,
            email: fbUser.email || '',
            username: fbUser.displayName || '',
            nickname: fbUser.displayName || '',
            name: fbUser.displayName || '',
            isAdmin: roles.includes('admin'),
          });
        } catch (e) {
          setError(e as Error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    error,
    redirectPath,
    login,
    logout,
    setUser,
    setRedirectPath,
  }), [user, isAuthenticated, isLoading, error, redirectPath, login, logout, setRedirectPath]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

