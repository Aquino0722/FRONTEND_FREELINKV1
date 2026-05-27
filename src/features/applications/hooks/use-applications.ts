"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { applicationsService, type CreateApplicationInput } from "@/features/applications/api/applications.service";
import { queryKeys } from "@/lib/query/query-keys";

export function useProjectApplications(projectId: number, enabled = true) {
  return useQuery({ queryKey: queryKeys.applications.byProject(projectId), queryFn: () => applicationsService.getByProject(projectId), enabled });
}

export function useFreelancerApplications(freelancerId: number, enabled = true) {
  return useQuery({ queryKey: queryKeys.applications.byFreelancer(freelancerId), queryFn: () => applicationsService.getByFreelancer(freelancerId), enabled });
}

export function useSubmitApplication(projectId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApplicationInput) => applicationsService.submit(projectId, input),
    onSuccess: (_, input) => {
      client.invalidateQueries({ queryKey: queryKeys.applications.byFreelancer(input.freelancerId) });
      client.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
}

export function useApplicationDecision(projectId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) =>
      accept ? applicationsService.accept(id) : applicationsService.reject(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.applications.byProject(projectId) });
      client.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      client.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
