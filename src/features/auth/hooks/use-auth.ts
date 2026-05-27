"use client";

import { useMutation } from "@tanstack/react-query";

import { authService } from "@/features/auth/api/auth.service";
import { useAuthStore } from "@/lib/auth/auth-store";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (session) => setSession(session),
  });
}

export function useRegister() {
  return useMutation({ mutationFn: authService.register });
}
