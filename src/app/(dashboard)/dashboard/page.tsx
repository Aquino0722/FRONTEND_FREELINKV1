"use client";

import { BriefcaseBusiness, ClipboardCheck, FileClock, Search, UsersRound } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { LoadingCards, ErrorState } from "@/components/shared/states";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdminUsers } from "@/features/admin/hooks/use-admin";
import { useFreelancerApplications } from "@/features/applications/hooks/use-applications";
import { useDeliverableSummary } from "@/features/milestones/hooks/use-deliverables";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useAuthStore } from "@/lib/auth/auth-store";

function ClientDashboard({ userId }: { userId: number }) {
  const projects = useProjects({ ownerId: userId });
  const active = projects.data?.find((project) => project.status === "En Proceso");
  const summary = useDeliverableSummary(active?.id ?? 0, Boolean(active));
  if (projects.isLoading) return <LoadingCards />;
  if (projects.isError) return <ErrorState retry={() => projects.refetch()} />;
  const pending = projects.data?.filter((project) => project.status === "Publicado").length ?? 0;
  return <>
    <PageHeader eyebrow="Cliente" title="Control de tus proyectos" description="Revisa candidatos, avances y entregas en un solo workspace." action={<Button asChild><Link href="/projects/new">Crear proyecto</Link></Button>} />
    <div className="grid gap-4 lg:grid-cols-4"><StatCard label="Proyectos" value={projects.data?.length ?? 0} helper="En tu cartera" icon={BriefcaseBusiness} /><StatCard label="Activos" value={projects.data?.filter((p) => p.status === "En Proceso").length ?? 0} helper="En ejecucion" icon={ClipboardCheck} /><StatCard label="En busqueda" value={pending} helper="Aceptando talento" icon={UsersRound} /><StatCard label="Entregables pendientes" value={summary.data?.pending ?? 0} helper="Del proyecto activo" icon={FileClock} /></div>
    <Card className="mt-7 p-5"><h2 className="mb-5 font-medium">Proyectos recientes</h2><div className="space-y-4">{projects.data?.slice(0, 3).map((project) => <Link className="flex items-center justify-between rounded-xl border p-4 hover:bg-slate-50" href={`/projects/${project.id}`} key={project.id}><div><p className="text-sm font-medium">{project.title}</p><p className="mt-1 text-xs text-slate-500">Abrir workspace y entregables</p></div><StatusBadge status={project.status} /></Link>)}</div></Card>
  </>;
}

function FreelancerDashboard({ userId }: { userId: number }) {
  const marketplace = useProjects({});
  const assigned = useProjects({ assignedFreelancerId: userId });
  const applications = useFreelancerApplications(userId);

  if (marketplace.isLoading || applications.isLoading || assigned.isLoading) return <LoadingCards />;
  
  if (marketplace.isError) {
    return <ErrorState title="Error al cargar marketplace" detail="No pudimos obtener la lista de proyectos disponibles." retry={() => marketplace.refetch()} />;
  }
  if (applications.isError) {
    return <ErrorState title="Error al cargar postulaciones" detail="No pudimos consultar tus postulaciones recientes." retry={() => applications.refetch()} />;
  }
  if (assigned.isError) {
    return <ErrorState title="Error al cargar asignaciones" detail="No pudimos obtener la lista de proyectos asignados." retry={() => assigned.refetch()} />;
  }

  return (
    <>
      <PageHeader 
        eyebrow="Freelancer" 
        title="Buenas oportunidades te esperan" 
        description="Mantente al día con proyectos, postulaciones y entregas." 
        action={<Button asChild><Link href="/projects">Explorar proyectos</Link></Button>} 
      />
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Disponibles" value={marketplace.data?.length ?? 0} helper="Proyectos publicados" icon={Search} />
        <StatCard label="Postulaciones" value={applications.data?.length ?? 0} helper="Enviadas" icon={BriefcaseBusiness} />
        <StatCard label="Asignados" value={assigned.data?.length ?? 0} helper="Trabajos seleccionados" icon={ClipboardCheck} />
        <StatCard label="Perfil" value="--" helper="Rating profesional" icon={UsersRound} />
      </div>
      <Card className="mt-7 p-5">
        <h2 className="mb-5 font-medium">Postulaciones recientes</h2>
        {applications.data?.length === 0 ? (
          <p className="text-sm text-slate-500 py-2">No tienes postulaciones recientes.</p>
        ) : (
          <div className="space-y-3">
            {applications.data?.slice(0, 3).map((item) => (
              <Link 
                className="flex justify-between items-center rounded-xl border p-4 hover:bg-slate-50 transition" 
                href={`/projects/${item.projectId}`} 
                key={item.id}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">
                    {item.projectTitle || `Proyecto #${item.projectId}`}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">Ver detalles de la postulación</span>
                </div>
                <StatusBadge status={item.status} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

function AdminDashboard() {
  const users = useAdminUsers();
  if (users.isLoading) return <LoadingCards />;
  if (users.isError) {
    return <ErrorState title="Error al cargar usuarios" detail="No pudimos consultar la base de datos de usuarios." retry={() => users.refetch()} />;
  }
  
  return (
    <>
      <PageHeader 
        eyebrow="Administrador" 
        title="Operación de la plataforma" 
        description="Vista inicial para gestionar las cuentas de FreeLink." 
        action={<Button asChild><Link href="/admin/users">Gestionar usuarios</Link></Button>} 
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Usuarios activos" value={users.data?.filter((user) => user.isActive).length ?? 0} helper="Cuentas habilitadas" icon={UsersRound} />
        <StatCard label="Clientes" value={users.data?.filter((user) => user.role === "Cliente").length ?? 0} helper="Organizaciones" icon={BriefcaseBusiness} />
        <StatCard label="Freelancers" value={users.data?.filter((user) => user.role === "Freelancer").length ?? 0} helper="Profesionales" icon={ClipboardCheck} />
      </div>
    </>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.session?.user);
  if (!user) return null;
  if (user.role === "Cliente") return <ClientDashboard userId={user.id} />;
  if (user.role === "Freelancer") return <FreelancerDashboard userId={user.id} />;
  return <AdminDashboard />;
}
