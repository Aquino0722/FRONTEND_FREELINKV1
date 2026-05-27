import type { UserRole } from "@/types/common";

export function normalizeUserRole(role: string): UserRole {
  if (role === "Admin") return "Administrador";
  if (role === "Cliente" || role === "Freelancer" || role === "Administrador") {
    return role;
  }
  return "Cliente";
}
