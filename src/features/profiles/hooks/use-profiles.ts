"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { freelancersService, type UpdateFreelancerInput } from "@/features/profiles/api/freelancers.service";
import { usersService, type UpdateUserInput } from "@/features/profiles/api/users.service";
import { queryKeys } from "@/lib/query/query-keys";
import type { FreelancerProfile } from "@/types/common";

export function useUserProfile(userId: number) {
  return useQuery({ queryKey: queryKeys.users.profile(userId), queryFn: () => usersService.getProfile(userId) });
}

export function useFreelancerProfile(userId: number, enabled = true) {
  return useQuery({ queryKey: queryKeys.freelancers.profile(userId), queryFn: () => freelancersService.getProfile(userId), enabled });
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
