import { apiClient } from "@/lib/api/axios-client";
import { adaptProject } from "@/lib/api/adapters";
import { endpoints } from "@/lib/api/endpoints";
import type { BackendProjectDto } from "@/types/api";
import type { Project, ProjectFilters } from "@/types/common";

export interface CreateProjectInput {
  clientId: number;
  title: string;
  description: string;
  budget: number;
  deadlineDate: string;
  requiredSkills?: string | null;
}

export type UpdateProjectInput = Partial<Omit<CreateProjectInput, "clientId">>;

export const projectsService = {
  async search(filters: ProjectFilters): Promise<Project[]> {
    const { data } = await apiClient.get<BackendProjectDto[]>(endpoints.projects.root, {
      params: { skills: filters.skills, q: filters.searchText, ownerId: filters.ownerId, assignedFreelancerId: filters.assignedFreelancerId },
    });
    return data.map(adaptProject);
  },
  async getById(projectId: number): Promise<Project> {
    const { data } = await apiClient.get<BackendProjectDto>(endpoints.projects.byId(projectId));
    return adaptProject(data);
  },
  async create(input: CreateProjectInput): Promise<Project> {
    const { data } = await apiClient.post<BackendProjectDto>(endpoints.projects.root, input);
    return adaptProject(data);
  },
  async update(projectId: number, input: UpdateProjectInput): Promise<Project> {
    const { data } = await apiClient.put<BackendProjectDto>(endpoints.projects.byId(projectId), input);
    return adaptProject(data);
  },
  async remove(projectId: number): Promise<void> {
    await apiClient.delete(endpoints.projects.byId(projectId));
  },
  async start(projectId: number): Promise<void> {
    await apiClient.post(endpoints.projects.start(projectId));
  },
  async complete(projectId: number): Promise<void> {
    await apiClient.post(endpoints.projects.complete(projectId));
  },
};
