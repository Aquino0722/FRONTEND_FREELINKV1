import { apiClient } from "@/lib/api/axios-client";
import { adaptUser } from "@/lib/api/adapters";
import { endpoints } from "@/lib/api/endpoints";
import type { BackendUserDto } from "@/types/api";
import type { User } from "@/types/common";

export const adminService = {
  async users(): Promise<User[]> {
    const { data } = await apiClient.get<BackendUserDto[]>(endpoints.admin.users);
    return data.map(adaptUser);
  },
};
