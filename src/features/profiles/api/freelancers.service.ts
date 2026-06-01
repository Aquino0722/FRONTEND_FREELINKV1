import { apiClient } from "@/lib/api/axios-client";
import { adaptFreelancerProfile } from "@/lib/api/adapters";
import { endpoints } from "@/lib/api/endpoints";
import type { BackendFreelancerProfileDto, SkillDto, WorkExperienceRequest } from "@/types/api";
import type { FreelancerProfile, FreelancerSkill, ProficiencyLevel } from "@/types/common";

export interface UpdateFreelancerInput {
  title?: string | null;
  hourlyRate?: number | null;
  yearsOfExperience?: number | null;
  availabilityStatus?: string | null;
}

export type WorkExperienceInput = WorkExperienceRequest;

export const freelancersService = {
  async getProfile(userId: number): Promise<FreelancerProfile> {
    const { data } = await apiClient.get<{ profile: BackendFreelancerProfileDto }>(endpoints.freelancers.profile(userId));
    return adaptFreelancerProfile(data.profile);
  },
  async update(userId: number, input: UpdateFreelancerInput): Promise<void> {
    await apiClient.put(endpoints.freelancers.profile(userId), input);
  },
  async getSkills(category?: string): Promise<FreelancerSkill[]> {
    const { data } = await apiClient.get<{ skills: SkillDto[] }>(endpoints.freelancers.skills, { params: { category } });
    return data.skills.map((skill) => ({ id: skill.skillId, name: skill.skillName, category: skill.category, proficiencyLevel: null }));
  },
  async addSkill(userId: number, skillId: number, proficiencyLevel: ProficiencyLevel): Promise<void> {
    await apiClient.post(endpoints.freelancers.addSkill(userId), { skillId, proficiencyLevel });
  },
  async addWorkExperience(userId: number, input: WorkExperienceInput): Promise<void> {
    await apiClient.post(endpoints.freelancers.experience(userId), input);
  },
  async updateWorkExperience(userId: number, experienceId: number, input: WorkExperienceInput): Promise<void> {
    await apiClient.put(endpoints.freelancers.experienceById(userId, experienceId), input);
  },
  async deleteWorkExperience(userId: number, experienceId: number): Promise<void> {
    await apiClient.delete(endpoints.freelancers.experienceById(userId, experienceId));
  },
};
