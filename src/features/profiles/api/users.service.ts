import { apiClient } from "@/lib/api/axios-client";
import { adaptUserProfile } from "@/lib/api/adapters";
import { endpoints } from "@/lib/api/endpoints";
import type { BackendUserProfileDto, MutationResponse } from "@/types/api";
import type { UserProfile } from "@/types/common";

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  country?: string | null;
  city?: string | null;
  bio?: string | null;
  profilePictureUrl?: string | null;
  companyName?: string | null;
  industry?: string | null;
  companySize?: string | null;
  website?: string | null;
  linkedIn?: string | null;
}

export const usersService = {
  async getProfile(userId: number): Promise<UserProfile> {
    const { data } = await apiClient.get<{ profile: BackendUserProfileDto }>(endpoints.users.profile(userId));
    return adaptUserProfile(data.profile);
  },
  async update(userId: number, input: UpdateUserInput): Promise<void> {
    await apiClient.put<MutationResponse>(endpoints.users.byId(userId), input);
  },
};
