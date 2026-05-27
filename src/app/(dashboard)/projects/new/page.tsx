"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { useCreateProject } from "@/features/projects/hooks/use-projects";
import { projectSchema, type ProjectFormInput, type ProjectFormValues } from "@/features/projects/schemas/project.schema";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function NewProjectPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.session?.user);
  const mutation = useCreateProject();
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormInput, unknown, ProjectFormValues>({ resolver: zodResolver(projectSchema) });
  if (!user || user.role !== "Cliente") return <Card className="p-8">Solo clientes pueden publicar proyectos.</Card>;
  const submit = handleSubmit((input) => mutation.mutate({ ...input, clientId: user.id }, {
    onSuccess: (project) => { toast.success("Proyecto publicado."); router.push(`/projects/${project.id}`); },
    onError: (error) => toast.error(error.message),
  }));
  return (
    <>
      <PageHeader eyebrow="Nuevo proyecto" title="Describe el trabajo que necesitas" description="Un brief claro atrae mejores especialistas." action={<Button asChild variant="ghost"><Link href="/projects"><ArrowLeft className="h-4 w-4" />Volver</Link></Button>} />
      <Card className="max-w-3xl p-6">
        <form className="space-y-5" onSubmit={submit}>
          <div><label className="mb-2 block text-sm font-medium" htmlFor="title">Titulo</label><Input id="title" placeholder="Ej. Dashboard de ventas para operacion regional" {...register("title")} />{errors.title && <p className="mt-2 text-xs text-rose-600">{errors.title.message}</p>}</div>
          <div><label className="mb-2 block text-sm font-medium" htmlFor="description">Descripcion y entregables</label><Textarea id="description" placeholder="Objetivo, alcance y resultado que esperas recibir..." {...register("description")} />{errors.description && <p className="mt-2 text-xs text-rose-600">{errors.description.message}</p>}</div>
          <div className="grid gap-5 md:grid-cols-2">
            <div><label className="mb-2 block text-sm font-medium" htmlFor="budget">Presupuesto (USD)</label><Input id="budget" type="number" {...register("budget")} />{errors.budget && <p className="mt-2 text-xs text-rose-600">{errors.budget.message}</p>}</div>
            <div><label className="mb-2 block text-sm font-medium" htmlFor="deadlineDate">Fecha limite</label><Input id="deadlineDate" type="date" {...register("deadlineDate")} />{errors.deadlineDate && <p className="mt-2 text-xs text-rose-600">{errors.deadlineDate.message}</p>}</div>
          </div>
          <div><label className="mb-2 block text-sm font-medium" htmlFor="requiredSkills">Habilidades (separadas por coma)</label><Input id="requiredSkills" placeholder="Next.js, TypeScript, Figma" {...register("requiredSkills")} /></div>
          <div className="flex justify-end gap-3 border-t pt-5"><Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button><Button disabled={mutation.isPending}>{mutation.isPending ? "Publicando..." : "Publicar proyecto"}</Button></div>
        </form>
      </Card>
    </>
  );
}
