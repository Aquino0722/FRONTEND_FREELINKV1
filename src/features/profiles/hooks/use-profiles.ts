"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { freelancersService, type UpdateFreelancerInput, type WorkExperienceInput } from "@/features/profiles/api/freelancers.service";
import { usersService, type UpdateUserInput } from "@/features/profiles/api/users.service";
import { queryKeys } from "@/lib/query/query-keys";
import type { FreelancerProfile, ProficiencyLevel } from "@/types/common";

export function useUserProfile(userId: number) {
  return useQuery({ queryKey: queryKeys.users.profile(userId), queryFn: () => usersService.getProfile(userId) });
}

export function useFreelancerProfile(userId: number, enabled = true) {
  return useQuery({ queryKey: queryKeys.freelancers.profile(userId), queryFn: () => freelancersService.getProfile(userId), enabled });
}

export function useFreelancerSkills(category?: string) {
  return useQuery({ queryKey: queryKeys.freelancers.skills(category), queryFn: () => freelancersService.getSkills(category) });
}

export function useUpdateUser(userId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserInput) => usersService.update(userId, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.users.profile(userId) }),
  });
}

export function useUpdateFreelancer(userId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateFreelancerInput) => freelancersService.update(userId, input),
    onMutate: async (input) => {
      await client.cancelQueries({ queryKey: queryKeys.freelancers.profile(userId) });
      const previous = client.getQueryData<FreelancerProfile>(queryKeys.freelancers.profile(userId));
      client.setQueryData<FreelancerProfile>(queryKeys.freelancers.profile(userId), (current) => current ? { ...current, ...input } : current);
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) client.setQueryData(queryKeys.freelancers.profile(userId), context.previous);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.freelancers.profile(userId) }),
  });
}

export function useAddFreelancerSkill(userId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, proficiencyLevel }: { skillId: number; proficiencyLevel: ProficiencyLevel }) => freelancersService.addSkill(userId, skillId, proficiencyLevel),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.freelancers.profile(userId) }),
  });
}

export function useAddWorkExperience(userId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkExperienceInput) => freelancersService.addWorkExperience(userId, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.freelancers.profile(userId) }),
  });
}

export function useUpdateWorkExperience(userId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ experienceId, input }: { experienceId: number; input: WorkExperienceInput }) => freelancersService.updateWorkExperience(userId, experienceId, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.freelancers.profile(userId) }),
  });
}

export function useDeleteWorkExperience(userId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (experienceId: number) => freelancersService.deleteWorkExperience(userId, experienceId),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.freelancers.profile(userId) }),
  });
}
