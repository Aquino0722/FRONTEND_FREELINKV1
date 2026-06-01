"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, LoadingCards } from "@/components/shared/states";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useProjectActivity } from "@/features/activity/hooks/use-activity";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useDeliverables } from "@/features/milestones/hooks/use-deliverables";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatDate } from "@/lib/utils/formatters";
import { motion, Variants } from "framer-motion";
import {
  FileText,
  CheckCircle,
  PlayCircle,
  FolderPlus,
  Send,
  Calendar,
  Clock,
  Briefcase,
  Activity,
  FileIcon,
  CreditCard,
  Edit3,
  CheckSquare
} from "lucide-react";

const STAGGER_CHILD: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.5 } }
};

const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function getIconForActivity(type: string) {
  switch (type) {
    case "project_created": return <FolderPlus className="h-4 w-4 text-brand" />;
    case "project_started": return <PlayCircle className="h-4 w-4 text-emerald-500" />;
    case "application_accepted": return <Briefcase className="h-4 w-4 text-blue-500" />;
    case "deliverable_sent": return <Send className="h-4 w-4 text-indigo-500" />;
    case "deliverable_approved": return <CheckCircle className="h-4 w-4 text-emerald-600" />;
    case "payment_released": return <CreditCard className="h-4 w-4 text-amber-500" />;
    case "review": return <Activity className="h-4 w-4 text-orange-500" />;
    case "changes_requested": return <Edit3 className="h-4 w-4 text-rose-500" />;
    default: return <FileText className="h-4 w-4 text-slate-400" />;
  }
}

export default function ActivityPage() {
  const user = useAuthStore((state) => state.session?.user);
  const filter = user?.role === "Cliente" ? { ownerId: user.id } : { assignedFreelancerId: user?.id };
  const projects = useProjects(filter);
  
  const activeProjectInit = projects.data?.find((project) => project.status === "En Proceso") ?? projects.data?.[0];
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const activeProjectId = selectedProjectId ?? activeProjectInit?.id;
  const active = projects.data?.find(p => p.id === activeProjectId);

  const activity = useProjectActivity(activeProjectId ?? 0, Boolean(activeProjectId));
  const deliverablesQuery = useDeliverables(activeProjectId ?? 0, Boolean(activeProjectId));

  const { progress, phase } = useMemo(() => {
    if (!active) return { progress: 0, phase: "Contratación" };
    if (active.status === "Completado") return { progress: 100, phase: "Entrega Final" };
    if (active.status === "Publicado" || active.status === "Asignado") return { progress: 20, phase: "Contratación" };
    
    const deliverables = deliverablesQuery.data ?? [];
    if (deliverables.length === 0) return { progress: 30, phase: "Kickoff" };
    
    const hasReview = deliverables.some(d => d.status === "En revision" || d.status === "Rechazado");
    if (hasReview) return { progress: 80, phase: "Revisión" };
    
    return { progress: 50, phase: "Desarrollo" };
  }, [active, deliverablesQuery.data]);

  const timelineEvents = useMemo(() => {
    return activity.data?.filter(a => a.type !== "work_diary_entry") ?? [];
  }, [activity.data]);

  const diaryEvents = useMemo(() => {
    return activity.data?.filter(a => a.type === "work_diary_entry") ?? [];
  }, [activity.data]);

  const deliverables = deliverablesQuery.data ?? [];

  if (!user || projects.isLoading) return <LoadingCards />;

  return (
    <>
      <PageHeader 
        eyebrow="Actividad" 
        title="Workspace Activity" 
        description="Seguimiento de hitos, entregables y progreso del proyecto" 
      />

      {!active ? (
        <EmptyState 
          title="Sin proyectos activos" 
          detail="Cuando tengas un proyecto asignado, sus eventos y reportes de progreso apareceran aqui." 
        />
      ) : (
        <motion.div 
          className="mt-6 flex flex-col gap-6"
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
        >
          {/* Top Control & Progress Section */}
          <motion.div variants={STAGGER_CHILD} className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-line bg-panel/40 backdrop-blur p-6 shadow-md">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-400">Proyecto Activo</label>
              <select
                value={activeProjectId ?? ""}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                className="w-full lg:w-80 rounded-lg border border-line bg-slate-950/40 px-3 py-2 text-sm font-medium text-slate-200 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {projects.data?.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">{p.title}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 max-w-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-200">Progreso: {phase}</span>
                <span className="text-sm font-medium text-brand">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-950/60 border border-line overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-brand rounded-full"
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500 font-medium">
                <span>Contratación</span>
                <span>Kickoff</span>
                <span>Desarrollo</span>
                <span>Revisión</span>
                <span>Entrega</span>
              </div>
            </div>
          </motion.div>

          {/* Weekly Summary Row */}
          <motion.div variants={STAGGER_CONTAINER} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-400">Entregables Enviados</span>
              <span className="text-2xl font-bold text-slate-100">{deliverables.length}</span>
            </Card>
            <Card className="p-5 flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-400">Archivos Subidos</span>
              <span className="text-2xl font-bold text-slate-100">
                {deliverables.reduce((acc, d) => acc + (d.files?.length ?? 0), 0)}
              </span>
            </Card>
            <Card className="p-5 flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-400">Cambios Solicitados</span>
              <span className="text-2xl font-bold text-slate-100">
                {timelineEvents.filter(e => e.type === "changes_requested").length}
              </span>
            </Card>
            <Card className="p-5 flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-400">Última Actividad</span>
              <span className="text-lg font-bold text-slate-100 truncate">
                {timelineEvents[timelineEvents.length - 1] ? formatDate(timelineEvents[timelineEvents.length - 1].createdAt) : "N/A"}
              </span>
            </Card>
          </motion.div>

          {/* Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Col 1: Main Timeline */}
            <motion.div variants={STAGGER_CHILD} className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-slate-200">Project Timeline</h3>
              <Card className="p-6">
                {activity.isLoading ? (
                  <div className="space-y-6">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-800/40 rounded animate-pulse" />)}
                  </div>
                ) : timelineEvents.length === 0 ? (
                  <div className="py-10 text-center text-slate-500">No hay eventos relevantes aún.</div>
                ) : (
                  <div className="relative pl-4 space-y-8">
                    {/* Timeline vertical line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-px bg-line" />
                    
                    {timelineEvents.map((event) => (
                      <motion.div 
                        key={event.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative z-10 flex gap-4"
                      >
                        <div className="flex-shrink-0 mt-1 h-10 w-10 rounded-full bg-slate-950/60 border border-line flex items-center justify-center">
                          {getIconForActivity(event.type)}
                        </div>
                        <div className="flex-1 bg-panel/40 rounded-xl p-4 border border-line">
                          <p className="text-sm font-semibold text-slate-200">{event.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Calendar className="w-3 h-3" /> {formatDate(event.createdAt)}
                            </span>
                            <span className="capitalize px-2 py-0.5 rounded-full bg-slate-900/60 border border-line text-slate-400">
                              {event.type.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Col 2: Side Widgets */}
            <motion.div variants={STAGGER_CHILD} className="flex flex-col gap-6">
                      {/* Work Diary */}
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand" /> Work Diary
                </h3>
                <Card className="p-4 flex flex-col gap-4 max-h-[400px] overflow-y-auto">
                  {user.role === "Freelancer" && (
                    <div className="flex gap-2">
                      <Input placeholder="Registra tu tarea de hoy..." className="text-sm" />
                      <Button size="sm">Add</Button>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {diaryEvents.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No hay entradas en la bitácora.</p>
                    ) : (
                      diaryEvents.map((entry) => (
                        <div key={entry.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                          <p className="text-sm text-slate-300 leading-relaxed">{entry.description}</p>
                          <span className="text-xs text-slate-500 mt-1 block">
                            {formatDate(entry.createdAt)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
 
              {/* Deliverables Feed */}
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-brand" /> Entregables
                </h3>
                <Card className="p-0 overflow-hidden">
                  {deliverablesQuery.isLoading ? (
                    <div className="p-4 space-y-3">
                      {[1,2].map(i => <div key={i} className="h-10 bg-slate-800/40 rounded animate-pulse" />)}
                    </div>
                  ) : deliverables.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      No hay archivos entregados.
                    </div>
                  ) : (
                    <div className="divide-y divide-line">
                      {deliverables.map((del) => (
                        <div key={del.id} className="p-4 hover:bg-slate-800/20 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-200">{del.title}</p>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{del.description}</p>
                            </div>
                            <Badge className="text-[10px] bg-slate-900/60 border border-line text-slate-300 hover:bg-slate-800/60">{del.status as string}</Badge>
                          </div>
                          
                          {del.files && del.files.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {del.files.map(file => (
                                <div key={file.id} className="flex items-center gap-2 p-2 rounded bg-slate-950/40 border border-line">
                                  <FileIcon className="w-4 h-4 text-slate-500" />
                                  <span className="text-xs font-medium text-slate-300 truncate flex-1">{file.fileName}</span>
                                  <span className="text-[10px] text-slate-500">{((file.fileSize ?? 0) / 1024 / 1024).toFixed(1)}MB</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  );
}
