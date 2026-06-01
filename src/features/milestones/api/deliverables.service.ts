import { apiClient } from "@/lib/api/axios-client";
import { adaptDeliverable, adaptSummary } from "@/lib/api/adapters";
import { endpoints } from "@/lib/api/endpoints";
import type { DeliverableStatusSummaryDto, ProjectDeliverableDto } from "@/types/api";
import type { DeliverableSummary, ProjectDeliverable } from "@/types/common";

export const deliverablesService = {
  async getByProject(projectId: number): Promise<ProjectDeliverable[]> {
    const { data } = await apiClient.get<ProjectDeliverableDto[]>(endpoints.projects.deliverables(projectId));
    return data.map(adaptDeliverable);
  },
  async getSummary(projectId: number): Promise<DeliverableSummary> {
    const { data } = await apiClient.get<DeliverableStatusSummaryDto>(endpoints.projects.summary(projectId));
    return adaptSummary(data);
  },
  async upload(projectId: number, input: { title: string; description?: string; dueDate?: string; files?: File[] }): Promise<ProjectDeliverable> {
    const form = new FormData();
    form.append("Title", input.title);
    if (input.description) form.append("Description", input.description);
    if (input.dueDate) form.append("DueDate", input.dueDate);
    input.files?.forEach((file) => form.append("Files", file));
    const { data } = await apiClient.post<ProjectDeliverableDto>(endpoints.projects.deliverables(projectId), form);
    return adaptDeliverable(data);
  },
  async review(deliverableId: number, decision: "approve" | "reject" | "review", comments?: string): Promise<void> {
    await apiClient.put(endpoints.projects.deliverableReview(deliverableId), { decision, comments });
  },
};
