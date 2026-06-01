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
    if (typeof window !== "undefined") {
      try {
        if (input.profilePictureUrl !== undefined) {
          if (input.profilePictureUrl) {
            localStorage.setItem(`profile_avatar_${userId}`, input.profilePictureUrl);
          } else {
            localStorage.removeItem(`profile_avatar_${userId}`);
          }
        }
        const existingExtrasStr = localStorage.getItem(`profile_extras_${userId}`);
        const existingExtras = existingExtrasStr ? JSON.parse(existingExtrasStr) : {};
        const updatedExtras = {
          ...existingExtras,
          ...(input.companyName !== undefined && { companyName: input.companyName }),
          ...(input.industry !== undefined && { industry: input.industry }),
          ...(input.companySize !== undefined && { companySize: input.companySize }),
          ...(input.website !== undefined && { website: input.website }),
          ...(input.linkedIn !== undefined && { linkedIn: input.linkedIn }),
          ...(input.bio !== undefined && { bio: input.bio }),
        };
        localStorage.setItem(`profile_extras_${userId}`, JSON.stringify(updatedExtras));
      } catch (e) {
        console.error("Failed to save profile updates to local storage", e);
      }
    }

    const { profilePictureUrl, ...rest } = input;
    let profilePictureToSend = profilePictureUrl;
    if (profilePictureUrl && (profilePictureUrl.startsWith("data:") || profilePictureUrl.startsWith("blob:"))) {
      profilePictureToSend = "/uploads/avatar-placeholder.png";
    }

    const payload = {
      ...rest,
      profilePicture: profilePictureToSend,
    };

    await apiClient.put<MutationResponse>(endpoints.users.byId(userId), payload);
  },
};
