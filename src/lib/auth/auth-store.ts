"use client";

import { create } from "zustand";

import type { AuthSession } from "@/types/common";

const STORAGE_KEY = "freelink.auth.session";

interface AuthState {
  session: AuthSession | null;
  isHydrated: boolean;
  hydrate: () => void;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

function parseSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as AuthSession;
    if (stored.expiresAt <= Date.now()) return null;
    return {
      ...stored,
      user: { ...stored.user, createdAt: new Date(stored.user.createdAt) },
    };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isHydrated: false,
  hydrate: () => {
    const session = parseSession(window.localStorage.getItem(STORAGE_KEY));
    if (!session) window.localStorage.removeItem(STORAGE_KEY);
    set({ session, isHydrated: true });
  },
  setSession: (session) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    set({ session });
  },
  clearSession: () => {
    window.localStorage.removeItem(STORAGE_KEY);
    set({ session: null });
  },
}));
