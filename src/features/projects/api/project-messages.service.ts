import { adaptProjectMessage } from "@/lib/api/adapters";
import { apiClient } from "@/lib/api/axios-client";
import { endpoints } from "@/lib/api/endpoints";
import type { ProjectMessageDto } from "@/types/api";
import type { ProjectMessage } from "@/types/common";

export interface SendProjectMessageInput {
  content?: string;
  files?: File[];
}

export const projectMessagesService = {
  async getByProject(projectId: number): Promise<ProjectMessage[]> {
    const { data } = await apiClient.get<ProjectMessageDto[]>(endpoints.projects.messages(projectId));
    return data.map(adaptProjectMessage);
  },
  async send(projectId: number, input: SendProjectMessageInput): Promise<ProjectMessage> {
    const form = new FormData();
    if (input.content?.trim()) form.append("MessageText", input.content.trim());
    input.files?.forEach((file) => form.append("Files", file));
    const { data } = await apiClient.post<ProjectMessageDto>(endpoints.projects.messages(projectId), form);
    return adaptProjectMessage(data);
  },
  async markRead(messageId: number): Promise<void> {
    await apiClient.put(endpoints.projects.messageRead(messageId));
  },
};
