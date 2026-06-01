"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { projectMessagesService, type SendProjectMessageInput } from "@/features/projects/api/project-messages.service";
import { queryKeys } from "@/lib/query/query-keys";

export function useProjectMessages(projectId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.projects.messages(projectId),
    queryFn: () => projectMessagesService.getByProject(projectId),
    enabled,
    refetchInterval: enabled ? 15000 : false,
  });
}

export function useSendProjectMessage(projectId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: SendProjectMessageInput) => projectMessagesService.send(projectId, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.projects.messages(projectId) });
      client.invalidateQueries({ queryKey: queryKeys.projects.activity(projectId) });
    },
  });
}

export function useMarkProjectMessageRead(projectId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (messageId: number) => projectMessagesService.markRead(messageId),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.projects.messages(projectId) }),
  });
}
