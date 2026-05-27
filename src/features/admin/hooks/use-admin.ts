"use client";

import { useQuery } from "@tanstack/react-query";

import { adminService } from "@/features/admin/api/admin.service";

export function useAdminUsers(enabled = true) {
  return useQuery({ queryKey: ["admin", "users"], queryFn: adminService.users, enabled });
}
