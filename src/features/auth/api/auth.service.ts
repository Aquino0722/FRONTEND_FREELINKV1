import { apiClient } from "@/lib/api/axios-client";
import { endpoints } from "@/lib/api/endpoints";
import { adaptSession } from "@/lib/api/adapters";
import { useAuthStore } from "@/lib/auth/auth-store";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/types/api";
import type { AuthSession, UserRole } from "@/types/common";

export interface RegisteredUser {
  id: number;
  email: string;
  role: UserRole;
}

export const authService = {
  async login(input: LoginRequest): Promise<AuthSession> {
    const { data } = await apiClient.post<LoginResponse>(endpoints.auth.login, input);
    return adaptSession(data.token, data.user);
  },
  async register(input: RegisterRequest): Promise<RegisteredUser> {
    const { data } = await apiClient.post<RegisterResponse>(endpoints.auth.register, input);
    return { id: data.data.userId, email: data.data.email, role: input.userType };
  },
  async logout(): Promise<void> {
    useAuthStore.getState().clearSession();
  },
};
