import type { UserRole } from "@/types/common";

export const permissions = {
  canCreateProject: (role: UserRole) => role === "Cliente",
  canManageApplications: (role: UserRole) => role === "Cliente",
  canApply: (role: UserRole) => role === "Freelancer",
  canEditProfessionalProfile: (role: UserRole) => role === "Freelancer",
  canUploadDeliverables: (role: UserRole) => role === "Freelancer",
  canReviewDeliverables: (role: UserRole) => role === "Cliente",
  canManageUsers: (role: UserRole) => role === "Administrador",
};
