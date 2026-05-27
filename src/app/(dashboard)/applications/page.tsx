"use client";

import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, LoadingCards } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { useFreelancerApplications } from "@/features/applications/hooks/use-applications";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

export default function ApplicationsPage() {
  const user = useAuthStore((state) => state.session?.user);
  const query = useFreelancerApplications(user?.id ?? 0, user?.role === "Freelancer");
  if (!user || user.role !== "Freelancer") return <Card className="p-7">Esta vista esta disponible para freelancers.</Card>;
  return (
    <>
      <PageHeader eyebrow="Pipeline" title="Mis postulaciones" description="Sigue el estado de las propuestas enviadas a clientes." />
      {query.isLoading && <LoadingCards />}
      {query.data?.length === 0 && <EmptyState title="Aun no tienes postulaciones" detail="Explora proyectos publicados y envia tu primera propuesta." />}
      <Card className="overflow-hidden">
        {query.data?.map((item) => <Link href={`/projects/${item.projectId}`} className="grid gap-3 border-b p-5 last:border-b-0 hover:bg-slate-50 md:grid-cols-[1fr_auto_auto] md:items-center" key={item.id}><div><p className="font-medium">Proyecto #{item.projectId}</p><p className="mt-1 text-xs text-slate-500">Enviada {formatDate(item.appliedAt)} - {item.estimatedDuration ?? "--"} dias</p></div><p className="text-sm font-medium">{item.proposedRate ? formatCurrency(item.proposedRate) : "Por acordar"}</p><StatusBadge status={item.status} /></Link>)}
      </Card>
    </>
  );
}
