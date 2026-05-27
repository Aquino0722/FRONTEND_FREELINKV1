import { BriefcaseBusiness, CreditCard, LayoutDashboard, ShieldCheck, UserCircle, UsersRound, Waves } from "lucide-react";

import type { UserRole } from "@/types/common";

export const navigationByRole: Record<UserRole, { href: string; label: string; icon: typeof LayoutDashboard }[]> = {
  Cliente: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Proyectos", icon: BriefcaseBusiness },
    { href: "/activity", label: "Actividad", icon: Waves },
    { href: "/payments", label: "Pagos", icon: CreditCard },
    { href: "/profile", label: "Perfil", icon: UserCircle },
  ],
  Freelancer: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Marketplace", icon: BriefcaseBusiness },
    { href: "/applications", label: "Postulaciones", icon: Waves },
    { href: "/profile", label: "Perfil profesional", icon: UserCircle },
  ],
  Administrador: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Usuarios", icon: UsersRound },
    { href: "/profile", label: "Perfil", icon: ShieldCheck },
  ],
};
