import type { ProjectFilters, TransactionFilters } from "@/types/common";

export const queryKeys = {
  auth: { session: ["auth", "session"] as const },
  users: { profile: (userId: number) => ["users", userId, "profile"] as const },
  freelancers: {
    profile: (userId: number) => ["freelancers", userId, "profile"] as const,
    skills: (category?: string) => ["freelancers", "skills", category] as const,
  },
  projects: {
    all: ["projects"] as const,
    search: (filters: ProjectFilters) => ["projects", "search", filters] as const,
    detail: (projectId: number) => ["projects", projectId] as const,
    activity: (projectId: number) => ["projects", projectId, "activity"] as const,
    deliverables: (projectId: number) => ["projects", projectId, "deliverables"] as const,
    deliverableSummary: (projectId: number) => ["projects", projectId, "deliverables", "summary"] as const,
    messages: (projectId: number) => ["projects", projectId, "messages"] as const,
  },
  applications: {
    byProject: (projectId: number) => ["applications", "project", projectId] as const,
    byFreelancer: (freelancerId: number) => ["applications", "freelancer", freelancerId] as const,
  },
  payments: {
    transactions: (filters: TransactionFilters) => ["payments", "transactions", filters] as const,
  },
  dashboard: { role: (role: string) => ["dashboard", role] as const },
};
