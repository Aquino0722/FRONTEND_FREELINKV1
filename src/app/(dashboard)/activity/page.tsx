"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, LoadingCards } from "@/components/shared/states";
import { Card } from "@/components/ui/card";
import { useProjectActivity } from "@/features/activity/hooks/use-activity";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatDate } from "@/lib/utils/formatters";

export default function ActivityPage() {
  const user = useAuthStore((state) => state.session?.user);
  const filter = user?.role === "Cliente" ? { ownerId: user.id } : { assignedFreelancerId: user?.id };
  const projects = useProjects(filter);
  const active = projects.data?.find((project) => project.status === "En Proceso") ?? projects.data?.[0];
  const activity = useProjectActivity(active?.id ?? 0, Boolean(active));
  if (!user || projects.isLoading) return <LoadingCards />;
  return <>
    <PageHeader eyebrow="Actividad" title="Timeline de trabajo" description={active ? active.title : "Eventos recientes de tus proyectos"} />
    {!active && <EmptyState title="Sin actividad aun" detail="Cuando un proyecto se asigne, sus eventos apareceran aqui." />}
    {active && <Card className="max-w-3xl p-7">{activity.data?.map((event) => <div className="relative border-l pb-8 pl-7 last:pb-0" key={event.id}><span className="absolute -left-[7px] top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-brand" /><p className="text-sm font-medium">{event.description}</p><p className="mt-1 text-xs text-slate-500">{event.type} - {formatDate(event.createdAt)}</p></div>)}</Card>}
  </>;
}
