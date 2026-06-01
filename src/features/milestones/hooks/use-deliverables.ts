"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deliverablesService } from "@/features/milestones/api/deliverables.service";
import { queryKeys } from "@/lib/query/query-keys";

export function useDeliverables(projectId: number, enabled = true) {
  return useQuery({ queryKey: queryKeys.projects.deliverables(projectId), queryFn: () => deliverablesService.getByProject(projectId), enabled });
}

export function useDeliverableSummary(projectId: number, enabled = true) {
  return useQuery({ queryKey: queryKeys.projects.deliverableSummary(projectId), queryFn: () => deliverablesService.getSummary(projectId), enabled });
}

export function useUploadDeliverable(projectId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; description?: string; dueDate?: string; files?: File[] }) => deliverablesService.upload(projectId, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.projects.deliverables(projectId) });
      client.invalidateQueries({ queryKey: queryKeys.projects.deliverableSummary(projectId) });
      client.invalidateQueries({ queryKey: queryKeys.projects.activity(projectId) });
    },
  });
}

export function useReviewDeliverable(projectId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ deliverableId, decision }: { deliverableId: number; decision: "approve" | "reject" | "review" }) => deliverablesService.review(deliverableId, decision),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.projects.deliverables(projectId) });
      client.invalidateQueries({ queryKey: queryKeys.projects.deliverableSummary(projectId) });
      client.invalidateQueries({ queryKey: queryKeys.projects.activity(projectId) });
    },
  });
}
