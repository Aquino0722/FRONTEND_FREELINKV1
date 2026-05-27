"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { projectsService, type CreateProjectInput } from "@/features/projects/api/projects.service";
import { queryKeys } from "@/lib/query/query-keys";
import type { ProjectFilters } from "@/types/common";

export function useProjects(filters: ProjectFilters) {
  return useQuery({ queryKey: queryKeys.projects.search(filters), queryFn: () => projectsService.search(filters) });
}

export function useProject(projectId: number) {
  return useQuery({ queryKey: queryKeys.projects.detail(projectId), queryFn: () => projectsService.getById(projectId) });
}

export function useCreateProject() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsService.create(input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.projects.all });
      client.invalidateQueries({ queryKey: ["projects", "search"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useProjectLifecycle(projectId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (action: "start" | "complete") => action === "start" ? projectsService.start(projectId) : projectsService.complete(projectId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      client.invalidateQueries({ queryKey: ["projects", "search"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
