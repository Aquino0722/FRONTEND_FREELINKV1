"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState, LoadingCards } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/features/projects/components/project-card";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function ProjectsPage() {
  const user = useAuthStore((state) => state.session?.user);
  const [searchText, setSearchText] = useState("");
  const [skill, setSkill] = useState("");
  const mine = user?.role === "Cliente" ? user.id : undefined;
  const query = useProjects({ searchText, skills: skill || undefined, ownerId: mine });
  if (!user) return null;
  return (
    <>
      <PageHeader eyebrow={user.role === "Cliente" ? "Portfolio" : "Marketplace"} title={user.role === "Cliente" ? "Tus proyectos" : "Encuentra tu proximo proyecto"} description={user.role === "Cliente" ? "Publica y gestiona el trabajo contratado." : "Oportunidades seleccionadas para profesionales independientes."} action={user.role === "Cliente" ? <Button asChild><Link href="/projects/new"><Plus className="h-4 w-4" />Nuevo proyecto</Link></Button> : undefined} />
      <div className="mb-7 flex flex-col gap-3 rounded-2xl border bg-white p-3 md:flex-row">
        <label className="relative flex-1"><span className="sr-only">Buscar proyectos</span><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className="border-0 pl-9" placeholder="Buscar por titulo o necesidad..." value={searchText} onChange={(event) => setSearchText(event.target.value)} /></label>
        <select aria-label="Filtrar por habilidad" className="h-11 rounded-xl border bg-white px-4 text-sm" value={skill} onChange={(event) => setSkill(event.target.value)}><option value="">Todas las habilidades</option><option>Next.js</option><option>React</option><option>Figma</option><option>Python</option><option>Shopify</option></select>
      </div>
      {query.isLoading && <LoadingCards />}
      {query.isError && <ErrorState retry={() => query.refetch()} />}
      {query.data?.length === 0 && <EmptyState title="No hay proyectos para mostrar" detail="Ajusta los filtros o crea el primer proyecto para comenzar." />}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{query.data?.map((project, index) => <ProjectCard index={index} key={project.id} project={project} />)}</div>
    </>
  );
}
