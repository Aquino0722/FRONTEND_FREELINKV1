"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Award, BriefcaseBusiness, MapPin } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { LoadingCards } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFreelancerProfile, useUpdateFreelancer, useUserProfile } from "@/features/profiles/hooks/use-profiles";
import { freelancerProfileSchema, type FreelancerProfileInput, type FreelancerProfileValues } from "@/features/profiles/schemas/profile.schemas";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatCurrency } from "@/lib/utils/formatters";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.session?.user);
  const profile = useUserProfile(user?.id ?? 0);
  const professional = useFreelancerProfile(user?.id ?? 0, user?.role === "Freelancer");
  const update = useUpdateFreelancer(user?.id ?? 0);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FreelancerProfileInput, unknown, FreelancerProfileValues>({ resolver: zodResolver(freelancerProfileSchema) });

  useEffect(() => {
    if (professional.data) reset({
      title: professional.data.title ?? "", hourlyRate: professional.data.hourlyRate ?? 0,
      yearsOfExperience: professional.data.yearsOfExperience ?? 0, availabilityStatus: (professional.data.availabilityStatus as FreelancerProfileValues["availabilityStatus"]) ?? "Disponible",
    });
  }, [professional.data, reset]);

  if (!user || profile.isLoading) return <LoadingCards />;
  const submit = handleSubmit((input) => update.mutate(input, { onSuccess: () => toast.success("Perfil profesional actualizado."), onError: (error) => toast.error(error.message) }));
  return (
    <>
      <PageHeader eyebrow="Perfil" title={profile.data ? `${profile.data.firstName} ${profile.data.lastName}` : user.email} description="Tu identidad profesional dentro de FreeLink." />
      <div className="grid gap-6 xl:grid-cols-[330px_1fr]">
        <Card className="p-6"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-xl font-semibold text-brand">{user.email.charAt(0).toUpperCase()}</div><p className="font-medium">{profile.data?.email}</p><p className="mt-1 text-sm text-slate-500">{user.role}</p><div className="mt-7 space-y-4 border-t pt-5 text-sm text-slate-600"><p className="flex gap-2"><MapPin className="h-4 w-4" />{profile.data?.city}, {profile.data?.country}</p>{professional.data && <><p className="flex gap-2"><Award className="h-4 w-4" />{professional.data.averageRating} rating ({professional.data.totalReviews})</p><p className="flex gap-2"><BriefcaseBusiness className="h-4 w-4" />{formatCurrency(professional.data.hourlyRate ?? 0)} / hora</p></>}</div></Card>
        {user.role === "Freelancer" ? <div className="space-y-5"><Card className="p-6"><h2 className="mb-5 font-medium">Perfil profesional</h2><form className="grid gap-5 md:grid-cols-2" onSubmit={submit}><div className="md:col-span-2"><label className="mb-2 block text-sm" htmlFor="title">Titulo profesional</label><Input id="title" {...register("title")} />{errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}</div><div><label className="mb-2 block text-sm" htmlFor="hourlyRate">Tarifa por hora (USD)</label><Input id="hourlyRate" type="number" {...register("hourlyRate")} /></div><div><label className="mb-2 block text-sm" htmlFor="years">Anos de experiencia</label><Input id="years" type="number" {...register("yearsOfExperience")} /></div><div><label className="mb-2 block text-sm" htmlFor="available">Disponibilidad</label><select id="available" className="h-11 w-full rounded-xl border bg-white px-3 text-sm" {...register("availabilityStatus")}><option>Disponible</option><option>Ocupado</option><option>No disponible</option></select></div><div className="flex items-end justify-end"><Button disabled={update.isPending}>{update.isPending ? "Guardando..." : "Guardar cambios"}</Button></div></form></Card><Card className="p-6"><h2 className="mb-5 font-medium">Habilidades</h2><div className="flex flex-wrap gap-2">{professional.data?.skills.map((skill) => <span className="rounded-lg bg-brand-soft px-3 py-2 text-sm text-brand" key={skill.id}>{skill.name} - {skill.proficiencyLevel}</span>)}</div><h2 className="mb-4 mt-8 font-medium">Experiencia</h2>{professional.data?.workExperiences.map((work) => <div className="mb-4 border-l-2 pl-4" key={work.id}><p className="text-sm font-medium">{work.jobTitle}</p><p className="text-xs text-slate-500">{work.company}</p></div>)}</Card></div> : <Card className="p-7"><h2 className="font-medium">Informacion de cuenta</h2><p className="mt-3 text-sm leading-7 text-slate-500">{profile.data?.bio ?? "Tu cuenta se encuentra activa y lista para operar en FreeLink."}</p></Card>}
      </div>
    </>
  );
}
