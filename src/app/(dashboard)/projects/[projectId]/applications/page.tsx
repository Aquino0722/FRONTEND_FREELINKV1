"use client";

import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
  if (project.data && !owner) return <Card className="p-7">Solo el cliente propietario puede revisar candidatos.</Card>;
  return <>
    <PageHeader eyebrow="Seleccion" title="Candidatos del proyecto" description={project.data?.title} action={<Button asChild variant="ghost"><Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" />Proyecto</Link></Button>} />
    <div className="space-y-4">{query.data?.map((candidate) => <Card className="p-5" key={candidate.id}><div className="flex flex-col justify-between gap-4 md:flex-row"><div><div className="flex items-center gap-3"><h2 className="font-medium">Freelancer #{candidate.freelancerId}</h2><StatusBadge status={candidate.status} /></div><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{candidate.coverLetter}</p><p className="mt-4 text-sm font-medium">{candidate.proposedRate ? formatCurrency(candidate.proposedRate) : "Precio a convenir"} - {candidate.estimatedDuration} dias</p></div>{candidate.status === "Pendiente" && <div className="flex gap-2"><Button onClick={() => decision.mutate({ id: candidate.id, accept: true }, { onSuccess: () => toast.success("Postulacion aceptada.") })}><Check className="h-4 w-4" />Aceptar</Button><Button variant="danger" onClick={() => decision.mutate({ id: candidate.id, accept: false }, { onSuccess: () => toast.success("Postulacion rechazada.") })}><X className="h-4 w-4" />Rechazar</Button></div>}</div></Card>)}</div>
  </>;
}
