import axios from "axios";

import { useAuthStore } from "@/lib/auth/auth-store";
import { env } from "@/lib/config/env";
import { normalizeApiError } from "@/lib/api/api-error";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().session?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = normalizeApiError(error);
    if (normalized.status === 401 && typeof window !== "undefined") {
      useAuthStore.getState().clearSession();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(normalized);
  },
);
