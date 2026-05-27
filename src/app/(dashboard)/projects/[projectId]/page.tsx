"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Check, DollarSign, Send, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { ErrorState, LoadingCards } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { useProjectActivity } from "@/features/activity/hooks/use-activity";
import { useApplicationDecision, useProjectApplications, useSubmitApplication } from "@/features/applications/hooks/use-applications";
import { applicationSchema, type ApplicationFormInput, type ApplicationFormValues } from "@/features/applications/schemas/application.schema";
import { useDeliverables, useDeliverableSummary, useReviewDeliverable, useUploadDeliverable } from "@/features/milestones/hooks/use-deliverables";
import { useProject, useProjectLifecycle } from "@/features/projects/hooks/use-projects";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

export default function ProjectDetailPage() {
  const projectId = Number(useParams<{ projectId: string }>().projectId);
  const user = useAuthStore((state) => state.session?.user);
  const [tab, setTab] = useState<"overview" | "deliverables" | "activity">("overview");
  const [deliverableTitle, setDeliverableTitle] = useState("");
  const project = useProject(projectId);
  const isOwner = user?.role === "Cliente" && project.data?.clientId === user.id;
  const isAssigned = user?.role === "Freelancer" && project.data?.assignedFreelancerId === user.id;
  const canSeeWorkspace = Boolean(isOwner || isAssigned);
  const applications = useProjectApplications(projectId, Boolean(isOwner));
  const activity = useProjectActivity(projectId, canSeeWorkspace);
  const deliverables = useDeliverables(projectId, canSeeWorkspace);
  const summary = useDeliverableSummary(projectId, canSeeWorkspace);
  const uploadDeliverable = useUploadDeliverable(projectId);
  const reviewDeliverable = useReviewDeliverable(projectId);
  const apply = useSubmitApplication(projectId);
  const decision = useApplicationDecision(projectId);
  const lifecycle = useProjectLifecycle(projectId);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApplicationFormInput, unknown, ApplicationFormValues>({ resolver: zodResolver(applicationSchema) });

  if (project.isLoading) return <LoadingCards />;
  if (project.isError || !project.data) return <ErrorState retry={() => project.refetch()} />;
  const item = project.data;
  const submit = handleSubmit((values) => {
    if (!user) return;
    apply.mutate({ ...values, freelancerId: user.id }, { onSuccess: () => { toast.success("Postulacion enviada."); reset(); }, onError: (error) => toast.error(error.message) });
  });
  return (
    <>
      <PageHeader eyebrow="Proyecto" title={item.title} description={`Publicado el ${formatDate(item.createdAt)}`} action={<StatusBadge status={item.status} />} />
      <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
        <div>
          <div className="mb-5 flex gap-1 rounded-xl border bg-white p-1">{(["overview", "deliverables", "activity"] as const).map((name) => <button className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${tab === name ? "bg-slate-950 text-white" : "text-slate-500"}`} key={name} onClick={() => setTab(name)}>{name === "overview" ? "Resumen" : name === "deliverables" ? "Entregables" : "Actividad"}</button>)}</div>
          {tab === "overview" && <Card className="p-6"><h2 className="mb-4 font-medium">Alcance del proyecto</h2><p className="text-sm leading-7 text-slate-600">{item.description}</p><div className="mt-7 flex flex-wrap gap-2">{item.requiredSkills.map((skill) => <span className="rounded-lg border bg-slate-50 px-3 py-1.5 text-xs" key={skill}>{skill}</span>)}</div></Card>}
          {tab === "deliverables" && (!canSeeWorkspace ? <Card className="p-6 text-sm text-slate-500">Los entregables estan disponibles para el cliente y el freelancer asignado.</Card> : <div className="space-y-3">
            {isAssigned && <Card className="p-5"><h2 className="mb-3 font-medium">Nuevo entregable</h2><form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); uploadDeliverable.mutate({ title: deliverableTitle }, { onSuccess: () => { toast.success("Entregable enviado."); setDeliverableTitle(""); }, onError: (error) => toast.error(error.message) }); }}><Input required placeholder="Ej. Implementacion frontend final" value={deliverableTitle} onChange={(event) => setDeliverableTitle(event.target.value)} /><Button disabled={uploadDeliverable.isPending}>Enviar</Button></form></Card>}
            {deliverables.data?.map((delivery) => <Card className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center" key={delivery.id}><div><p className="font-medium">{delivery.title}</p><p className="mt-1 text-xs text-slate-500">Entrega {delivery.dueDate ? formatDate(delivery.dueDate) : "por confirmar"}</p></div><div className="flex items-center gap-2"><StatusBadge status={delivery.status} />{isOwner && (delivery.status === "En revision" || delivery.status === "Enviado") && <><Button size="sm" onClick={() => reviewDeliverable.mutate({ deliverableId: delivery.id, decision: "approve" }, { onSuccess: () => toast.success("Entregable aprobado.") })}>Aprobar</Button><Button size="sm" variant="danger" onClick={() => reviewDeliverable.mutate({ deliverableId: delivery.id, decision: "reject" }, { onSuccess: () => toast.success("Revision solicitada.") })}>Rechazar</Button></>}</div></Card>)}
          </div>)}
          {tab === "activity" && (!canSeeWorkspace ? <Card className="p-6 text-sm text-slate-500">La actividad es privada para participantes del proyecto.</Card> : <Card className="p-6"><div className="space-y-5">{activity.data?.map((event) => <div className="relative border-l pl-5" key={event.id}><span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-brand" /><p className="text-sm font-medium">{event.description}</p><p className="mt-1 text-xs text-slate-500">{formatDate(event.createdAt)}</p></div>)}</div></Card>)}
        </div>
        <div className="space-y-5">
          <Card className="p-5"><div className="space-y-4 text-sm"><div className="flex justify-between"><span className="flex items-center gap-2 text-slate-500"><DollarSign className="h-4 w-4" />Presupuesto</span><strong>{formatCurrency(item.budget)}</strong></div><div className="flex justify-between"><span className="flex items-center gap-2 text-slate-500"><CalendarDays className="h-4 w-4" />Fecha limite</span><strong>{formatDate(item.deadlineDate)}</strong></div>{summary.data && <div className="border-t pt-4 text-xs text-slate-500">{summary.data.approved} aprobados / {summary.data.pending + summary.data.inReview + summary.data.sent} pendientes de revision</div>}</div></Card>
          {isOwner && item.status === "Asignado" && <Button className="w-full" onClick={() => lifecycle.mutate("start", { onSuccess: () => toast.success("Proyecto iniciado.") })}>Iniciar proyecto</Button>}
          {isOwner && item.status === "En Proceso" && <ConfirmationDialog title="Finalizar proyecto" description="El proyecto quedara marcado como completado y cerrado para nuevas entregas." confirmLabel="Confirmar finalizacion" pending={lifecycle.isPending} onConfirm={() => lifecycle.mutate("complete", { onSuccess: () => toast.success("Proyecto completado.") })} trigger={<Button className="w-full" variant="secondary">Marcar completado</Button>} />}
          {user?.role === "Freelancer" && item.status === "Publicado" && <Card className="p-5"><h2 className="mb-4 font-medium">Enviar postulacion</h2><form className="space-y-3" onSubmit={submit}><Textarea placeholder="Explica tu experiencia y enfoque..." {...register("coverLetter")} />{errors.coverLetter && <p className="text-xs text-rose-600">{errors.coverLetter.message}</p>}<div className="grid grid-cols-2 gap-3"><Input type="number" placeholder="Tarifa USD" {...register("proposedRate")} /><Input type="number" placeholder="Dias" {...register("estimatedDuration")} /></div><Button className="w-full" disabled={apply.isPending}><Send className="h-4 w-4" />Postularme</Button></form></Card>}
          {isOwner && <Card className="p-5"><h2 className="mb-4 font-medium">Candidatos</h2>{applications.isLoading ? <p className="text-sm text-slate-500">Cargando...</p> : <div className="space-y-4">{applications.data?.map((candidate) => <div className="rounded-xl border p-4" key={candidate.id}><div className="mb-3 flex justify-between text-sm"><span>Freelancer #{candidate.freelancerId}</span><StatusBadge status={candidate.status} /></div>{candidate.status === "Pendiente" && <div className="flex gap-2"><Button size="sm" onClick={() => decision.mutate({ id: candidate.id, accept: true }, { onSuccess: () => toast.success("Freelancer seleccionado.") })}><Check className="h-4 w-4" />Aceptar</Button><Button size="sm" variant="danger" onClick={() => decision.mutate({ id: candidate.id, accept: false }, { onSuccess: () => toast.success("Postulacion rechazada.") })}><X className="h-4 w-4" /></Button></div>}</div>)}</div>}</Card>}
        </div>
      </div>
    </>
  );
}
