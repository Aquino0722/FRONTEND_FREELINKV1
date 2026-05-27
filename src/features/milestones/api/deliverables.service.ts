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
  async upload(projectId: number, input: { title: string; description?: string; dueDate?: string }): Promise<ProjectDeliverable> {
    const form = new FormData();
    form.append("title", input.title);
    if (input.description) form.append("description", input.description);
    if (input.dueDate) form.append("dueDate", input.dueDate);
    const { data } = await apiClient.post<ProjectDeliverableDto>(endpoints.projects.deliverables(projectId), form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return adaptDeliverable(data);
  },
  async review(deliverableId: number, decision: "approve" | "reject" | "review", comments?: string): Promise<void> {
    await apiClient.put(`/Projects/deliverables/${deliverableId}/review`, { decision, comments });
  },
};
