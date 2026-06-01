"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, CalendarDays, Check, Download, DollarSign, FileText, Loader2, MessageSquare, Paperclip, Plus, Send, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState, LoadingCards } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { useProjectActivity } from "@/features/activity/hooks/use-activity";
import { useApplicationDecision, useFreelancerApplications, useProjectApplications, useSubmitApplication } from "@/features/applications/hooks/use-applications";
import { applicationSchema, type ApplicationFormInput, type ApplicationFormValues } from "@/features/applications/schemas/application.schema";
import { useDeliverables, useDeliverableSummary, useReviewDeliverable, useUploadDeliverable } from "@/features/milestones/hooks/use-deliverables";
import { useProjectMessages, useMarkProjectMessageRead, useSendProjectMessage } from "@/features/projects/hooks/use-project-messages";
import { useProject, useProjectLifecycle } from "@/features/projects/hooks/use-projects";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { ProjectDeliverable } from "@/types/common";

type WorkspaceTab = "overview" | "deliverables" | "messages" | "activity";

function formatFileSize(size: number | null) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function DeliverableUploadDialog({ pending, onSubmit }: { pending: boolean; onSubmit: (input: { title: string; description?: string; dueDate?: string; files?: File[] }, done: () => void) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((current) => [...current, ...Array.from(list)]);
  };
  const reset = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setFiles([]);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nuevo entregable
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-white p-6 shadow-xl focus:outline-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold">Nuevo entregable</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">Sube archivos, contexto y fecha objetivo para revision del cliente.</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Cerrar" className="text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit({ title, description, dueDate, files }, reset);
            }}
          >
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="deliverable-title">Titulo</label>
              <Input id="deliverable-title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Implementacion frontend final" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="deliverable-description">Descripcion opcional</label>
              <Textarea id="deliverable-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Notas de entrega, alcance cubierto o instrucciones de revision." />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="deliverable-due">Fecha limite</label>
              <Input id="deliverable-due" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </div>
            <label
              className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50 px-4 py-6 text-center transition hover:border-indigo-200 hover:bg-indigo-50/40"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                addFiles(event.dataTransfer.files);
              }}
            >
              <UploadCloud className="mb-3 h-7 w-7 text-indigo-600" />
              <span className="text-sm font-medium text-slate-800">Arrastra archivos o haz clic para seleccionarlos</span>
              <span className="mt-1 text-xs text-slate-500">Imagenes, PDFs, ZIPs o documentos de soporte</span>
              <input multiple className="sr-only" type="file" onChange={(event) => addFiles(event.target.files)} />
            </label>
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm" key={`${file.name}-${index}`}>
                    <span className="truncate">{file.name}</span>
                    <button className="text-slate-400 hover:text-rose-600" type="button" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild><Button type="button" variant="secondary">Cancelar</Button></Dialog.Close>
              <Button disabled={pending || !title.trim()} type="submit">{pending ? "Enviando..." : "Enviar entregable"}</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DeliverableCard({ delivery, isOwner, reviewPending, onReview }: { delivery: ProjectDeliverable; isOwner: boolean; reviewPending: boolean; onReview: (decision: "approve" | "reject") => void }) {
  return (
    <Card className="p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="font-medium">{delivery.title}</p>
          <p className="mt-1 text-xs text-slate-500">Entrega {delivery.dueDate ? formatDate(delivery.dueDate) : "por confirmar"}</p>
          {delivery.description && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{delivery.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={delivery.status} />
          {isOwner && (delivery.status === "En revision" || delivery.status === "Enviado") && (
            <>
              <Button size="sm" disabled={reviewPending} onClick={() => onReview("approve")}>Aprobar</Button>
              <Button size="sm" variant="danger" disabled={reviewPending} onClick={() => onReview("reject")}>Rechazar</Button>
            </>
          )}
        </div>
      </div>
      {delivery.files.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {delivery.files.map((file) => (
            <a className="flex items-center justify-between gap-3 rounded-xl border bg-slate-50 px-3 py-2 text-sm transition hover:border-indigo-200 hover:bg-indigo-50/40" href={file.fileUrl} download key={file.id}>
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-indigo-600" />
                <span className="truncate">{file.fileName}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                {formatFileSize(file.fileSize)}
                <Download className="h-3.5 w-3.5" />
              </span>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function ProjectDetailPage() {
  const projectId = Number(useParams<{ projectId: string }>().projectId);
  const user = useAuthStore((state) => state.session?.user);
  const [tab, setTab] = useState<WorkspaceTab>("overview");
  const [message, setMessage] = useState("");
  const [messageFiles, setMessageFiles] = useState<File[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const project = useProject(projectId);
  const isOwner = user?.role === "Cliente" && project.data?.clientId === user.id;
  const isAssigned = user?.role === "Freelancer" && project.data?.assignedFreelancerId === user.id;
  const canSeeWorkspace = Boolean(isOwner || isAssigned);

  const applications = useProjectApplications(projectId, Boolean(isOwner));
  const activity = useProjectActivity(projectId, canSeeWorkspace);
  const deliverables = useDeliverables(projectId, canSeeWorkspace);
  const summary = useDeliverableSummary(projectId, canSeeWorkspace);
  const messages = useProjectMessages(projectId, canSeeWorkspace && tab === "messages");
  const sendMessage = useSendProjectMessage(projectId);
  const markRead = useMarkProjectMessageRead(projectId);

  const uploadDeliverable = useUploadDeliverable(projectId);
  const reviewDeliverable = useReviewDeliverable(projectId);
  const apply = useSubmitApplication(projectId);
  const decision = useApplicationDecision(projectId);
  const lifecycle = useProjectLifecycle(projectId);
  const freelancerApps = useFreelancerApplications(user?.id ?? 0, Boolean(user && user.role === "Freelancer"));
  const alreadyApplied = freelancerApps.data?.find((a) => a.projectId === projectId);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApplicationFormInput, unknown, ApplicationFormValues>({ resolver: zodResolver(applicationSchema) });

  useEffect(() => {
    if (tab === "messages") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data, tab]);

  useEffect(() => {
    if (tab !== "messages" || !user || !messages.data) return;
    messages.data.filter((item) => item.senderId !== user.id && !item.readAt).forEach((item) => markRead.mutate(item.id));
  }, [messages.data, markRead, tab, user]);

  if (project.isLoading) return <LoadingCards />;
  if (project.isError || !project.data) return <ErrorState title="Proyecto no encontrado" detail="No pudimos obtener la informacion de este proyecto." retry={() => project.refetch()} />;

  const item = project.data;
  const submitApplication = handleSubmit((values) => {
    if (!user) return;
    apply.mutate({ ...values, freelancerId: user.id }, {
      onSuccess: () => {
        toast.success("Postulacion enviada correctamente.");
        reset();
        freelancerApps.refetch();
      },
      onError: (error) => toast.error(error.message),
    });
  });

  return (
    <>
      <PageHeader eyebrow="Proyecto" title={item.title} description={`Publicado el ${formatDate(item.createdAt)}`} action={<StatusBadge status={item.status} />} />
      <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
        <div>
          <div className="mb-5 grid gap-1 rounded-xl border bg-white p-1 sm:grid-cols-4">
            {(["overview", "deliverables", "messages", "activity"] as const).map((name) => (
              <button className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tab === name ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-950"}`} key={name} onClick={() => setTab(name)}>
                {name === "overview" ? "Resumen" : name === "deliverables" ? "Entregables" : name === "messages" ? "Mensajes" : "Actividad"}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <Card className="p-6">
              <h2 className="mb-4 font-medium">Alcance del proyecto</h2>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{item.description}</p>
              <div className="mt-7 flex flex-wrap gap-2">{item.requiredSkills.map((skill) => <span className="rounded-lg border bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600" key={skill}>{skill}</span>)}</div>
            </Card>
          )}

          {tab === "deliverables" && (
            !canSeeWorkspace ? <Card className="p-6 text-sm text-slate-500">Los entregables estan disponibles unicamente para el cliente y el freelancer asignado.</Card> :
            deliverables.isError ? <ErrorState title="Error al cargar entregables" detail="Hubo un problema al consultar los entregables." retry={() => deliverables.refetch()} /> :
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-medium">Entregables</h2>
                  <p className="text-sm text-slate-500">Archivos, fechas y revisiones del workspace.</p>
                </div>
                {isAssigned && <DeliverableUploadDialog pending={uploadDeliverable.isPending} onSubmit={(input, done) => uploadDeliverable.mutate(input, { onSuccess: () => { toast.success("Entregable enviado."); done(); }, onError: (error) => toast.error(error.message) })} />}
              </div>
              {deliverables.isLoading ? <p className="text-sm text-slate-500">Cargando entregables...</p> :
              deliverables.data?.length === 0 ? <Card className="p-6 text-center text-sm text-slate-500">No se han registrado entregables en este proyecto.</Card> :
              deliverables.data?.map((delivery) => <DeliverableCard delivery={delivery} isOwner={Boolean(isOwner)} reviewPending={reviewDeliverable.isPending} key={delivery.id} onReview={(review) => reviewDeliverable.mutate({ deliverableId: delivery.id, decision: review }, { onSuccess: () => toast.success(review === "approve" ? "Entregable aprobado." : "Revision solicitada.") })} />)}
            </div>
          )}

          {tab === "messages" && (
            !canSeeWorkspace ? <Card className="p-6 text-sm text-slate-500">El chat esta disponible unicamente para los participantes del proyecto.</Card> :
            messages.isError ? <ErrorState title="Error al cargar mensajes" detail="No pudimos consultar el historial del workspace." retry={() => messages.refetch()} /> :
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h2 className="font-medium">Mensajes del workspace</h2>
                  <p className="text-sm text-slate-500">Historial compartido entre cliente y freelancer.</p>
                </div>
                {messages.isFetching && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
              </div>
              <div className="max-h-[520px] min-h-80 space-y-4 overflow-y-auto bg-slate-50/70 p-5">
                {messages.isLoading ? <p className="text-sm text-slate-500">Cargando mensajes...</p> :
                messages.data?.length === 0 ? <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-500"><MessageSquare className="mx-auto mb-2 h-6 w-6 text-slate-400" />Aun no hay mensajes en este workspace.</div> :
                messages.data?.map((entry) => {
                  const mine = entry.senderId === user?.id;
                  return (
                    <div className={`flex ${mine ? "justify-end" : "justify-start"}`} key={entry.id}>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${mine ? "bg-slate-950 text-white" : "border bg-white text-slate-800"}`}>
                        <div className={`mb-1 flex items-center gap-2 text-xs ${mine ? "text-white/60" : "text-slate-400"}`}>
                          <span>{entry.senderName ?? `Usuario #${entry.senderId}`}</span>
                          <span>{formatDate(entry.createdAt)}</span>
                        </div>
                        {entry.content && <p className="whitespace-pre-wrap text-sm leading-6">{entry.content}</p>}
                        {entry.attachments.length > 0 && <div className="mt-3 space-y-2">{entry.attachments.map((file) => <a className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${mine ? "bg-white/10 text-white" : "bg-slate-50 text-slate-700"}`} href={file.fileUrl} download key={file.id}><Paperclip className="h-3.5 w-3.5" />{file.fileName}</a>)}</div>}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form className="border-t p-4" onSubmit={(event) => {
                event.preventDefault();
                sendMessage.mutate({ content: message, files: messageFiles }, { onSuccess: () => { setMessage(""); setMessageFiles([]); }, onError: (error) => toast.error(error.message) });
              }}>
                {messageFiles.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{messageFiles.map((file, index) => <span className="inline-flex items-center gap-2 rounded-lg bg-brand-soft px-3 py-1.5 text-xs text-brand" key={`${file.name}-${index}`}>{file.name}<button type="button" onClick={() => setMessageFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X className="h-3 w-3" /></button></span>)}</div>}
                <div className="flex gap-2">
                  <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border bg-white px-3 text-slate-600 hover:bg-slate-50">
                    <Paperclip className="h-4 w-4" />
                    <input multiple className="sr-only" type="file" onChange={(event) => setMessageFiles((current) => [...current, ...Array.from(event.target.files ?? [])])} />
                  </label>
                  <Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escribe un mensaje..." />
                  <Button disabled={sendMessage.isPending || (!message.trim() && messageFiles.length === 0)} type="submit"><Send className="h-4 w-4" /></Button>
                </div>
              </form>
            </Card>
          )}

          {tab === "activity" && (
            !canSeeWorkspace ? <Card className="p-6 text-sm text-slate-500">La actividad es privada para los participantes del proyecto.</Card> :
            activity.isError ? <ErrorState title="Error al cargar actividad" detail="Hubo un problema al consultar el registro de actividad." retry={() => activity.refetch()} /> :
            <Card className="p-6">{activity.isLoading ? <p className="text-sm text-slate-500">Cargando actividad...</p> : activity.data?.length === 0 ? <p className="text-sm text-slate-500">Aun no hay actividad registrada en este proyecto.</p> : <div className="space-y-5">{activity.data?.map((event) => <div className="relative border-l pl-5" key={event.id}><span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-900" /><p className="text-sm font-medium text-slate-800">{event.description}</p><p className="mt-1 text-xs text-slate-400">{formatDate(event.createdAt)}</p></div>)}</div>}</Card>
          )}
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between"><span className="flex items-center gap-2 text-slate-500"><DollarSign className="h-4 w-4" />Presupuesto</span><strong>{formatCurrency(item.budget)}</strong></div>
              <div className="flex justify-between"><span className="flex items-center gap-2 text-slate-500"><CalendarDays className="h-4 w-4" />Fecha limite</span><strong>{formatDate(item.deadlineDate)}</strong></div>
              {summary.data && <div className="border-t pt-4 text-xs text-slate-500">{summary.data.approved} aprobados / {summary.data.pending + summary.data.inReview + summary.data.sent} en revision</div>}
            </div>
          </Card>
          {isOwner && item.status === "Asignado" && <Button className="w-full" onClick={() => lifecycle.mutate("start", { onSuccess: () => toast.success("Proyecto iniciado.") })}>Iniciar proyecto</Button>}
          {isOwner && item.status === "En Proceso" && <ConfirmationDialog title="Finalizar proyecto" description="El proyecto quedara marcado como completado y cerrado para nuevas entregas." confirmLabel="Confirmar finalizacion" pending={lifecycle.isPending} onConfirm={() => lifecycle.mutate("complete", { onSuccess: () => toast.success("Proyecto completado.") })} trigger={<Button className="w-full" variant="secondary">Marcar completado</Button>} />}

          {user?.role === "Freelancer" && item.status === "Publicado" && (
            alreadyApplied ? <Card className="border-indigo-100 bg-indigo-50/10 p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-medium text-indigo-950">Tu postulacion</h2><StatusBadge status={alreadyApplied.status} /></div><p className="mb-3 text-xs text-slate-400">Enviada el {formatDate(alreadyApplied.appliedAt)}</p>{alreadyApplied.coverLetter && <p className="mb-4 rounded-lg border bg-white p-3 text-xs italic leading-relaxed text-slate-600">&ldquo;{alreadyApplied.coverLetter}&rdquo;</p>}<div className="grid grid-cols-2 gap-4 border-t pt-3 text-sm"><div><span className="block text-xs text-slate-400">Tarifa propuesta</span><strong>{alreadyApplied.proposedRate ? formatCurrency(alreadyApplied.proposedRate) : "Por acordar"}</strong></div><div><span className="block text-xs text-slate-400">Tiempo estimado</span><strong>{alreadyApplied.estimatedDuration ? `${alreadyApplied.estimatedDuration} dias` : "--"}</strong></div></div></Card> :
            <Card className="p-5"><h2 className="mb-4 font-medium">Enviar postulacion</h2><form className="space-y-3" onSubmit={submitApplication}><Textarea placeholder="Explica tu experiencia y enfoque..." {...register("coverLetter")} />{errors.coverLetter && <p className="text-xs text-rose-600">{errors.coverLetter.message}</p>}<div className="grid grid-cols-2 gap-3"><Input type="number" placeholder="Tarifa USD" {...register("proposedRate")} /><Input type="number" placeholder="Dias" {...register("estimatedDuration")} /></div><Button className="w-full" disabled={apply.isPending}><Send className="mr-2 h-4 w-4" />Postularme</Button></form></Card>
          )}

          {isOwner && (
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between"><h2 className="font-medium text-slate-900">Candidatos</h2>{applications.data && applications.data.length > 0 && <Link href={`/projects/${projectId}/applications`} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800 hover:underline">Ver todos ({applications.data.length})<ArrowRight className="h-3.5 w-3.5" /></Link>}</div>
              {applications.isLoading ? <p className="text-sm text-slate-500">Cargando candidatos...</p> :
              applications.isError ? <ErrorState title="Error al cargar candidatos" detail="No pudimos cargar la lista de postulantes." retry={() => applications.refetch()} /> :
              applications.data?.length === 0 ? <p className="py-4 text-center text-sm text-slate-500">Aun no hay candidatos postulados.</p> :
              <div className="space-y-4">{applications.data?.slice(0, 3).map((candidate) => <div className="rounded-xl border p-4 transition hover:border-slate-300" key={candidate.id}><div className="mb-2 flex items-start justify-between gap-2 text-sm"><span className="line-clamp-1 font-semibold text-slate-800">{candidate.freelancerName || `Freelancer #${candidate.freelancerId}`}</span><StatusBadge status={candidate.status} /></div>{candidate.coverLetter && <p className="mb-2 line-clamp-2 rounded bg-slate-50 p-2 text-xs leading-relaxed text-slate-500">&ldquo;{candidate.coverLetter}&rdquo;</p>}<div className="mb-3 flex items-center justify-between text-xs text-slate-600"><span>Tarifa: <strong>{candidate.proposedRate ? formatCurrency(candidate.proposedRate) : "Por acordar"}</strong></span><span>Duracion: <strong>{candidate.estimatedDuration ? `${candidate.estimatedDuration} dias` : "--"}</strong></span></div>{candidate.status === "Pendiente" && <div className="flex gap-2"><ConfirmationDialog title="Aceptar candidato" description="Al aceptar esta postulacion, se le asignara el proyecto al freelancer y las demas postulaciones pendientes seran rechazadas." confirmLabel="Aceptar y asignar" pending={decision.isPending} onConfirm={() => decision.mutate({ id: candidate.id, accept: true }, { onSuccess: () => toast.success("Freelancer seleccionado correctamente.") })} trigger={<Button size="sm" className="flex-1"><Check className="mr-1 h-3.5 w-3.5" />Aceptar</Button>} /><Button size="sm" variant="danger" disabled={decision.isPending} onClick={() => decision.mutate({ id: candidate.id, accept: false }, { onSuccess: () => toast.success("Postulacion rechazada.") })}><X className="h-4 w-4" /></Button></div>}</div>)}{applications.data && applications.data.length > 3 && <Button asChild variant="secondary" className="w-full text-xs"><Link href={`/projects/${projectId}/applications`}>Ver los {applications.data.length - 3} restantes</Link></Button>}</div>}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
