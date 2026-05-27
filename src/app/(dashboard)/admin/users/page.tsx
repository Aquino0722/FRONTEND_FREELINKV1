"use client";

import { PageHeader } from "@/components/shared/page-header";
import { LoadingCards } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { useAdminUsers } from "@/features/admin/hooks/use-admin";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatDate } from "@/lib/utils/formatters";

export default function AdminUsersPage() {
  const role = useAuthStore((state) => state.session?.user.role);
  const query = useAdminUsers(role === "Administrador");
  if (role !== "Administrador") return <Card className="p-7">No tienes permisos para acceder a administracion.</Card>;
  if (query.isLoading) return <LoadingCards />;
  return <>
    <PageHeader eyebrow="Administracion" title="Gestion de usuarios" description="Base inicial para supervision de cuentas y roles." />
    <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-4">Usuario</th><th className="p-4">Rol</th><th className="p-4">Estado</th><th className="p-4">Registro</th></tr></thead><tbody>{query.data?.map((user) => <tr className="border-t" key={user.id}><td className="p-4 font-medium">{user.email}</td><td className="p-4">{user.role}</td><td className="p-4"><StatusBadge status={user.isActive ? "Activo" : "Inactivo"} /></td><td className="p-4 text-slate-500">{formatDate(user.createdAt)}</td></tr>)}</tbody></table></Card>
  </>;
}
