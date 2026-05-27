"use client";

import { useQuery } from "@tanstack/react-query";

import { activityService } from "@/features/activity/api/activity.service";
import { queryKeys } from "@/lib/query/query-keys";

export function useProjectActivity(projectId: number, enabled = true) {
  return useQuery({ queryKey: queryKeys.projects.activity(projectId), queryFn: () => activityService.getByProject(projectId), enabled });
}
