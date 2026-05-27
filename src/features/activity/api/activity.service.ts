import { apiClient } from "@/lib/api/axios-client";
import { adaptActivity } from "@/lib/api/adapters";
import { endpoints } from "@/lib/api/endpoints";
import type { ProjectActivityDto } from "@/types/api";
import type { ProjectActivity } from "@/types/common";

export const activityService = {
  async getByProject(projectId: number): Promise<ProjectActivity[]> {
    const { data } = await apiClient.get<ProjectActivityDto[]>(endpoints.projects.activity(projectId));
    return data.map(adaptActivity);
  },
};
