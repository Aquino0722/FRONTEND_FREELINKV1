import { apiClient } from "@/lib/api/axios-client";
import { adaptApplication } from "@/lib/api/adapters";
import { endpoints } from "@/lib/api/endpoints";
import type { ApplicationDto } from "@/types/api";
import type { Application } from "@/types/common";

export interface CreateApplicationInput {
  freelancerId: number;
  coverLetter: string;
  proposedRate?: number | null;
  estimatedDuration?: number | null;
}

export const applicationsService = {
  async submit(projectId: number, input: CreateApplicationInput): Promise<Application> {
    const { data } = await apiClient.post<ApplicationDto>(endpoints.projects.applications(projectId), input);
    return adaptApplication(data);
  },
  async getByProject(projectId: number): Promise<Application[]> {
    const { data } = await apiClient.get<ApplicationDto[]>(endpoints.projects.applications(projectId));
    return data.map(adaptApplication);
  },
  async getByFreelancer(freelancerId: number): Promise<Application[]> {
    const { data } = await apiClient.get<ApplicationDto[]>(endpoints.freelancers.applications(freelancerId));
    return data.map(adaptApplication);
  },
  async accept(applicationId: number): Promise<void> {
    await apiClient.post(endpoints.applications.accept(applicationId));
  },
  async reject(applicationId: number): Promise<void> {
    await apiClient.post(endpoints.applications.reject(applicationId));
  },
};
