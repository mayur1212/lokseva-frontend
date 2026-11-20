"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { backend, sessionExpired } from "@/services/api";
import type { Officer } from "@/types/auth";

const AuthContext = createContext<{
  ready: boolean; officer: Officer | null;
  signIn: (email: string, password: string) => Promise<void>; signOut: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [ready, setReady] = useState(false);
  const restore = useRef<AbortController>(null);

  useEffect(() => {
    const controller = new AbortController();
    restore.current = controller;
    const expire = () => setOfficer(null);
    window.addEventListener(sessionExpired, expire);
    backend.me(controller.signal).then(value => {
      if (!controller.signal.aborted) setOfficer(value);
    }).catch(() => {
      if (!controller.signal.aborted) setOfficer(null);
    }).finally(() => {
      if (!controller.signal.aborted) setReady(true);
    });
    return () => {
      controller.abort();
      window.removeEventListener(sessionExpired, expire);
    };
  }, []);

  return <AuthContext.Provider value={{
    ready, officer,
    async signIn(email, password) {
      restore.current?.abort();
      try { setOfficer(await backend.login(email, password)); }
      finally { setReady(true); }
    },
    async signOut() {
      await backend.logout();
      setOfficer(null);
    },
  }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Missing auth provider");
  return context;
}
