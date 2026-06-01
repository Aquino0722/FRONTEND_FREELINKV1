"use client";

import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState, LoadingCards } from "@/components/shared/states";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useApplicationDecision, useProjectApplications } from "@/features/applications/hooks/use-applications";
import { useProject } from "@/features/projects/hooks/use-projects";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatCurrency } from "@/lib/utils/formatters";

export default function CandidatesPage() {
  const projectId = Number(useParams<{ projectId: string }>().projectId);
  const user = useAuthStore((state) => state.session?.user);
  const project = useProject(projectId);
  const owner = user?.role === "Cliente" && project.data?.clientId === user.id;
  const query = useProjectApplications(projectId, Boolean(owner));
  const decision = useApplicationDecision(projectId);

  if (project.isLoading) return <LoadingCards />;
  if (project.isError || !project.data) {
    return (
      <ErrorState 
        title="Proyecto no encontrado" 
        detail="No pudimos cargar la información de este proyecto." 
        retry={() => project.refetch()} 
      />
    );
  }

  if (!owner) {
    return <Card className="p-7 text-sm text-slate-500">Solo el cliente propietario puede revisar candidatos.</Card>;
  }

  return (
    <>
      <PageHeader 
        eyebrow="Selección" 
        title="Candidatos del proyecto" 
        description={project.data.title} 
        action={
          <Button asChild variant="ghost">
            <Link href={`/projects/${projectId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al proyecto
            </Link>
          </Button>
        } 
      />
      {query.isLoading && <LoadingCards />}
      {query.isError && (
        <ErrorState 
          title="Error al cargar candidatos" 
          detail="Hubo un problema al cargar las postulaciones de este proyecto." 
          retry={() => query.refetch()} 
        />
      )}
      {!query.isLoading && !query.isError && query.data?.length === 0 && (
        <EmptyState 
          title="No hay candidatos aún" 
          detail="Tu proyecto está publicado. Los freelancers se postularán pronto." 
        />
      )}
      {!query.isLoading && !query.isError && query.data && query.data.length > 0 && (
        <div className="space-y-4">
          {query.data.map((candidate) => (
            <Card className="p-5" key={candidate.id}>
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-slate-900">
                      {candidate.freelancerName || `Freelancer #${candidate.freelancerId}`}
                    </h2>
                    <StatusBadge status={candidate.status} />
                  </div>
                  {candidate.coverLetter && (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 bg-slate-50 p-4 rounded-xl border italic">
                      &ldquo;{candidate.coverLetter}&rdquo;
                    </p>
                  )}
                  <p className="mt-4 text-sm font-medium text-slate-800">
                    Propuesta: {candidate.proposedRate ? formatCurrency(candidate.proposedRate) : "Precio a convenir"}
                    <span className="text-slate-400 mx-2">•</span>
                    Tiempo estimado: {candidate.estimatedDuration ?? "--"} días
                  </p>
                </div>
                {candidate.status === "Pendiente" && (
                  <div className="flex items-start gap-2">
                    <ConfirmationDialog
                      title="Aceptar candidato"
                      description="Al aceptar esta postulación, se le asignará el proyecto al freelancer y todas las demás postulaciones pendientes serán rechazadas de manera irreversible."
                      confirmLabel="Aceptar y asignar"
                      pending={decision.isPending}
                      onConfirm={() => 
                        decision.mutate(
                          { id: candidate.id, accept: true }, 
                          { onSuccess: () => toast.success("Postulación aceptada correctamente.") }
                        )
                      }
                      trigger={
                        <Button size="sm">
                          <Check className="mr-1.5 h-4 w-4" />
                          Aceptar
                        </Button>
                      }
                    />
                    <ConfirmationDialog
                      title="Rechazar candidato"
                      description="¿Seguro que deseas rechazar la postulación de este candidato? Esta acción es definitiva."
                      confirmLabel="Rechazar"
                      pending={decision.isPending}
                      onConfirm={() => 
                        decision.mutate(
                          { id: candidate.id, accept: false }, 
                          { onSuccess: () => toast.success("Postulación rechazada.") }
                        )
                      }
                      trigger={
                        <Button size="sm" variant="danger">
                          <X className="mr-1.5 h-4 w-4" />
                          Rechazar
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
