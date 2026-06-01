"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Award, BriefcaseBusiness, Check, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { LoadingCards } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { useAddFreelancerSkill, useAddWorkExperience, useDeleteWorkExperience, useFreelancerProfile, useFreelancerSkills, useUpdateFreelancer, useUpdateWorkExperience, useUserProfile } from "@/features/profiles/hooks/use-profiles";
import { freelancerProfileSchema, type FreelancerProfileInput, type FreelancerProfileValues } from "@/features/profiles/schemas/profile.schemas";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { ProficiencyLevel, WorkExperience } from "@/types/common";

const levels: ProficiencyLevel[] = ["Basico", "Intermedio", "Avanzado", "Experto"];
const availability = ["Disponible", "Ocupado", "No disponible"] as const;

interface WorkDraft {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

const emptyWork: WorkDraft = { jobTitle: "", company: "", startDate: "", endDate: "", isCurrent: false, description: "" };

function toDateInput(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.session?.user);
  const profile = useUserProfile(user?.id ?? 0);
  const professional = useFreelancerProfile(user?.id ?? 0, user?.role === "Freelancer");
  const skills = useFreelancerSkills();
  const update = useUpdateFreelancer(user?.id ?? 0);
  const addSkill = useAddFreelancerSkill(user?.id ?? 0);
  const addWork = useAddWorkExperience(user?.id ?? 0);
  const updateWork = useUpdateWorkExperience(user?.id ?? 0);
  const deleteWork = useDeleteWorkExperience(user?.id ?? 0);
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [skillLevel, setSkillLevel] = useState<ProficiencyLevel>("Avanzado");
  const [workDraft, setWorkDraft] = useState<WorkDraft>(emptyWork);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FreelancerProfileInput, unknown, FreelancerProfileValues>({ resolver: zodResolver(freelancerProfileSchema) });
  const currentAvailability = watch("availabilityStatus");

  useEffect(() => {
    if (professional.data) reset({
      title: professional.data.title ?? "",
      hourlyRate: professional.data.hourlyRate ?? 0,
      yearsOfExperience: professional.data.yearsOfExperience ?? 0,
      availabilityStatus: (professional.data.availabilityStatus as FreelancerProfileValues["availabilityStatus"]) ?? "Disponible",
    });
  }, [professional.data, reset]);

  const filteredSkills = useMemo(() => {
    const existing = new Set(professional.data?.skills.map((skill) => skill.id) ?? []);
    const query = skillSearch.toLowerCase();
    return (skills.data ?? []).filter((skill) => !existing.has(skill.id) && (!query || `${skill.name} ${skill.category ?? ""}`.toLowerCase().includes(query))).slice(0, 6);
  }, [professional.data?.skills, skillSearch, skills.data]);

  if (!user || profile.isLoading) return <LoadingCards />;

  const submitProfile = handleSubmit((input) => update.mutate(input, { onSuccess: () => toast.success("Perfil profesional actualizado."), onError: (error) => toast.error(error.message) }));
  const visibleExperience = professional.data?.workExperiences ?? [];

  const submitWork = () => {
    if (!workDraft.jobTitle.trim() || !workDraft.startDate) {
      toast.error("Cargo y fecha de inicio son requeridos.");
      return;
    }
    const input = {
      jobTitle: workDraft.jobTitle.trim(),
      company: workDraft.company.trim() || null,
      startDate: workDraft.startDate,
      endDate: workDraft.isCurrent ? null : workDraft.endDate || null,
      isCurrent: workDraft.isCurrent,
      description: workDraft.description.trim() || null,
    };
    const options = {
      onSuccess: () => {
        toast.success(editingExperience ? "Experiencia actualizada." : "Experiencia agregada.");
        setWorkDraft(emptyWork);
        setEditingExperience(null);
      },
      onError: (error: Error) => toast.error(error.message),
    };
    if (editingExperience) updateWork.mutate({ experienceId: editingExperience.id, input }, options);
    else addWork.mutate(input, options);
  };

  const startEditExperience = (work: WorkExperience) => {
    setEditingExperience(work);
    setWorkDraft({
      jobTitle: work.jobTitle,
      company: work.company ?? "",
      startDate: toDateInput(work.startDate),
      endDate: toDateInput(work.endDate),
      isCurrent: work.isCurrent,
      description: work.description ?? "",
    });
  };

  return (
    <>
      <PageHeader eyebrow="Perfil" title={profile.data ? `${profile.data.firstName} ${profile.data.lastName}` : user.email} description="Tu identidad profesional dentro de FreeLink." />
      <div className="grid gap-6 xl:grid-cols-[330px_1fr]">
        <Card className="p-6">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-xl font-semibold text-brand">{user.email.charAt(0).toUpperCase()}</div>
          <p className="font-medium">{profile.data?.email}</p>
          <p className="mt-1 text-sm text-slate-500">{user.role}</p>
          <div className="mt-7 space-y-4 border-t pt-5 text-sm text-slate-600">
            <p className="flex gap-2"><MapPin className="h-4 w-4" />{profile.data?.city}, {profile.data?.country}</p>
            {professional.data && <>
              <p className="flex gap-2"><Award className="h-4 w-4" />{professional.data.averageRating} rating ({professional.data.totalReviews})</p>
              <p className="flex gap-2"><BriefcaseBusiness className="h-4 w-4" />{formatCurrency(professional.data.hourlyRate ?? 0)} / hora</p>
            </>}
          </div>
        </Card>

        {user.role === "Freelancer" ? (
          <div className="space-y-5">
            <Card className="p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-medium">Perfil profesional</h2>
                  <p className="mt-1 text-sm text-slate-500">Tarifa, posicionamiento y disponibilidad laboral.</p>
                </div>
                <Button disabled={update.isPending} form="professional-form">{update.isPending ? "Guardando..." : "Guardar cambios"}</Button>
              </div>
              <form id="professional-form" className="grid gap-5 md:grid-cols-2" onSubmit={submitProfile}>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm" htmlFor="title">Titulo profesional</label>
                  <Input id="title" {...register("title")} />
                  {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
                </div>
                <div><label className="mb-2 block text-sm" htmlFor="hourlyRate">Tarifa por hora (USD)</label><Input id="hourlyRate" type="number" {...register("hourlyRate")} /></div>
                <div><label className="mb-2 block text-sm" htmlFor="years">Anos de experiencia</label><Input id="years" type="number" {...register("yearsOfExperience")} /></div>
                <div className="md:col-span-2">
                  <p className="mb-2 text-sm">Disponibilidad</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {availability.map((option) => <button className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${currentAvailability === option ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "bg-white text-slate-600 hover:bg-slate-50"}`} key={option} type="button" onClick={() => setValue("availabilityStatus", option, { shouldDirty: true })}>{option}</button>)}
                  </div>
                </div>
              </form>
            </Card>

            <Card className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-medium">Habilidades</h2>
                  <p className="mt-1 text-sm text-slate-500">Agrega habilidades con nivel de dominio.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {professional.data?.skills.map((skill) => <span className="rounded-lg bg-brand-soft px-3 py-2 text-sm text-brand" key={skill.id}>{skill.name} - {skill.proficiencyLevel}</span>)}
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_auto]">
                <div className="relative">
                  <Input value={skillSearch} onChange={(event) => { setSkillSearch(event.target.value); setSelectedSkillId(null); }} placeholder="Buscar habilidad..." />
                  {skillSearch && filteredSkills.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-lg">
                      {filteredSkills.map((skill) => <button className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 ${selectedSkillId === skill.id ? "bg-indigo-50 text-indigo-700" : ""}`} key={skill.id} type="button" onClick={() => { setSelectedSkillId(skill.id); setSkillSearch(skill.name); }}><span>{skill.name}</span><span className="text-xs text-slate-400">{skill.category}</span></button>)}
                    </div>
                  )}
                </div>
                <select className="h-11 rounded-xl border bg-white px-3 text-sm" value={skillLevel} onChange={(event) => setSkillLevel(event.target.value as ProficiencyLevel)}>
                  {levels.map((level) => <option key={level}>{level}</option>)}
                </select>
                <Button disabled={addSkill.isPending || !selectedSkillId} onClick={() => selectedSkillId && addSkill.mutate({ skillId: selectedSkillId, proficiencyLevel: skillLevel }, { onSuccess: () => { toast.success("Habilidad agregada."); setSelectedSkillId(null); setSkillSearch(""); }, onError: (error) => toast.error(error.message) })}>
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-medium">Experiencia laboral</h2>
                  <p className="mt-1 text-sm text-slate-500">Crea nuevas entradas o usa editar para guardar una version actualizada.</p>
                </div>
                {editingExperience && <Button variant="ghost" onClick={() => { setEditingExperience(null); setWorkDraft(emptyWork); }}><X className="h-4 w-4" />Cancelar edicion</Button>}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3 rounded-2xl border bg-slate-50/70 p-4">
                  <Input value={workDraft.jobTitle} onChange={(event) => setWorkDraft((current) => ({ ...current, jobTitle: event.target.value }))} placeholder="Cargo" />
                  <Input value={workDraft.company} onChange={(event) => setWorkDraft((current) => ({ ...current, company: event.target.value }))} placeholder="Empresa" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="date" value={workDraft.startDate} onChange={(event) => setWorkDraft((current) => ({ ...current, startDate: event.target.value }))} />
                    <Input disabled={workDraft.isCurrent} type="date" value={workDraft.endDate} onChange={(event) => setWorkDraft((current) => ({ ...current, endDate: event.target.value }))} />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input checked={workDraft.isCurrent} type="checkbox" onChange={(event) => setWorkDraft((current) => ({ ...current, isCurrent: event.target.checked, endDate: event.target.checked ? "" : current.endDate }))} />Trabajo actual</label>
                  <Textarea value={workDraft.description} onChange={(event) => setWorkDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Responsabilidades y logros principales." />
                  <Button className="w-full" disabled={addWork.isPending || updateWork.isPending} onClick={submitWork}>{editingExperience ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editingExperience ? "Guardar cambios" : "Agregar experiencia"}</Button>
                </div>
                <div className="space-y-3">
                  {visibleExperience.length === 0 ? <div className="rounded-2xl border p-5 text-sm text-slate-500">Aun no hay experiencia visible.</div> :
                  visibleExperience.map((work) => <div className="rounded-2xl border p-4 transition hover:border-indigo-200 hover:bg-indigo-50/20" key={work.id}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">{work.jobTitle}</p><p className="mt-1 text-xs text-slate-500">{work.company ?? "Independiente"} · {formatDate(work.startDate)} - {work.isCurrent ? "Actual" : work.endDate ? formatDate(work.endDate) : "Sin cierre"}</p></div><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => startEditExperience(work)}><Pencil className="h-3.5 w-3.5" /></Button><Button size="sm" variant="ghost" disabled={deleteWork.isPending} onClick={() => deleteWork.mutate(work.id, { onSuccess: () => toast.success("Experiencia eliminada."), onError: (error) => toast.error(error.message) })}><Trash2 className="h-3.5 w-3.5" /></Button></div></div>{work.description && <p className="mt-3 text-sm leading-6 text-slate-600">{work.description}</p>}</div>)}
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-7"><h2 className="font-medium">Informacion de cuenta</h2><p className="mt-3 text-sm leading-7 text-slate-500">{profile.data?.bio ?? "Tu cuenta se encuentra activa y lista para operar en FreeLink."}</p></Card>
        )}
      </div>
    </>
  );
}
