"use client";

import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState, LoadingCards } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { useFreelancerApplications } from "@/features/applications/hooks/use-applications";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

export default function ApplicationsPage() {
  const user = useAuthStore((state) => state.session?.user);
  const query = useFreelancerApplications(user?.id ?? 0, user?.role === "Freelancer");

  if (!user || user.role !== "Freelancer") {
    return <Card className="p-7 text-sm text-slate-500">Esta vista está disponible únicamente para freelancers.</Card>;
  }

  return (
    <>
      <PageHeader 
        eyebrow="Pipeline" 
        title="Mis postulaciones" 
        description="Sigue el estado de las propuestas enviadas a clientes." 
      />
      {query.isLoading && <LoadingCards />}
      {query.isError && (
        <ErrorState 
          title="Error al cargar postulaciones" 
          detail="No pudimos consultar el estado de tus postulaciones." 
          retry={() => query.refetch()} 
        />
      )}
      {!query.isLoading && !query.isError && query.data?.length === 0 && (
        <EmptyState 
          title="Aun no tienes postulaciones" 
          detail="Explora proyectos publicados y envía tu primera propuesta." 
        />
      )}
      {!query.isLoading && !query.isError && query.data && query.data.length > 0 && (
        <Card className="overflow-hidden">
          {query.data.map((item) => (
            <Link 
              href={`/projects/${item.projectId}`} 
              className="grid gap-3 border-b p-5 last:border-b-0 hover:bg-slate-50/80 transition md:grid-cols-[1fr_auto_auto] md:items-center" 
              key={item.id}
            >
              <div>
                <p className="font-medium text-slate-900">
                  {item.projectTitle || `Proyecto #${item.projectId}`}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Enviada el {formatDate(item.appliedAt)} - {item.estimatedDuration ?? "--"} días estimados
                </p>
                {item.status === "Pendiente" && (
                  <p className="mt-2 text-xs text-amber-600 font-medium">
                    → En espera de respuesta del cliente
                  </p>
                )}
                {item.status === "Aceptada" && (
                  <p className="mt-2 text-xs text-emerald-600 font-medium">
                    → ¡Postulación aceptada! Haz clic para ingresar al workspace
                  </p>
                )}
                {item.status === "Rechazada" && (
                  <p className="mt-2 text-xs text-rose-600 font-medium">
                    → Postulación rechazada por el cliente
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block mb-0.5">Propuesta</span>
                <strong className="text-sm font-semibold text-slate-800">
                  {item.proposedRate ? formatCurrency(item.proposedRate) : "Por acordar"}
                </strong>
              </div>
              <StatusBadge status={item.status} />
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
