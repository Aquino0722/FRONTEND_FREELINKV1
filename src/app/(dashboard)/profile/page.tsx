"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Inbox,
  MapPin,
  Pencil,
  Plus,
  PlusCircle,
  Settings,
  Star,
  Trash2,
  Upload,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { useProjects } from "@/features/projects/hooks/use-projects";
import {
  useAddFreelancerSkill,
  useAddWorkExperience,
  useDeleteFreelancerSkill,
  useDeleteWorkExperience,
  useFreelancerProfile,
  useFreelancerSkills,
  useUpdateFreelancer,
  useUpdateWorkExperience,
  useUserProfile,
  useUpdateUser
} from "@/features/profiles/hooks/use-profiles";
import type { UpdateFreelancerInput } from "@/features/profiles/api/freelancers.service";
import type { UpdateUserInput } from "@/features/profiles/api/users.service";
import { freelancerProfileSchema, type FreelancerProfileInput, type FreelancerProfileValues } from "@/features/profiles/schemas/profile.schemas";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { Certification, PortfolioItem, ProficiencyLevel, WorkExperience } from "@/types/common";

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const levels: ProficiencyLevel[] = ["Basico", "Intermedio", "Avanzado", "Experto"];
const availabilityOptions = ["Disponible", "Ocupado", "No disponible"] as const;
const workModes = ["Remoto", "Hibrido", "Presencial"] as const;

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
  try {
    return new Date(date).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.session?.user);
  const profile = useUserProfile(user?.id ?? 0);
  const professional = useFreelancerProfile(user?.id ?? 0, user?.role === "Freelancer");
  const skills = useFreelancerSkills();
  
  const updateUser = useUpdateUser(user?.id ?? 0);
  const updateFreelancer = useUpdateFreelancer(user?.id ?? 0);
  const addSkill = useAddFreelancerSkill(user?.id ?? 0);
  const deleteSkill = useDeleteFreelancerSkill(user?.id ?? 0);
  const addWork = useAddWorkExperience(user?.id ?? 0);
  const updateWork = useUpdateWorkExperience(user?.id ?? 0);
  const deleteWork = useDeleteWorkExperience(user?.id ?? 0);

  // Client History queries
  const clientProjects = useProjects({ ownerId: user?.id ?? 0 });

  // Dialog / Modal states
  const [isProfFormOpen, setIsProfFormOpen] = useState(false);
  const [isBioOpen, setIsBioOpen] = useState(false);
  const [isWorkOpen, setIsWorkOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isSocialsOpen, setIsSocialsOpen] = useState(false);

  // Skill Search autocomplete state
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [skillLevel, setSkillLevel] = useState<ProficiencyLevel>("Avanzado");

  // Work Experience draft state
  const [workDraft, setWorkDraft] = useState<WorkDraft>(emptyWork);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);

  // Certification draft state
  const [certDraft, setCertDraft] = useState({ name: "", institution: "", issueDate: "", pdfFile: null as File | null });

  // Portfolio Item draft state
  const [portfolioDraft, setPortfolioDraft] = useState({ title: "", description: "", projectUrl: "", imageFile: null as File | null, technologies: "" });
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);

  // Tab state for client history
  const [clientTab, setClientTab] = useState<"projects" | "freelancers">("projects");

  // React Hook Form for Professional details
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FreelancerProfileInput, unknown, FreelancerProfileValues>({
    resolver: zodResolver(freelancerProfileSchema)
  });
  const currentAvailability = watch("availabilityStatus");

  useEffect(() => {
    if (professional.data) {
      reset({
        title: professional.data.title ?? "",
        hourlyRate: professional.data.hourlyRate ?? 0,
        yearsOfExperience: professional.data.yearsOfExperience ?? 0,
        availabilityStatus: (professional.data.availabilityStatus as FreelancerProfileValues["availabilityStatus"]) ?? "Disponible",
      });
    }
  }, [professional.data, reset]);

  // Skill autocomplete logic
  const filteredSkills = useMemo(() => {
    const existing = new Set(professional.data?.skills.map((skill) => skill.id) ?? []);
    const query = skillSearch.toLowerCase();
    return (skills.data ?? []).filter((skill) => !existing.has(skill.id) && (!query || `${skill.name} ${skill.category ?? ""}`.toLowerCase().includes(query))).slice(0, 6);
  }, [professional.data?.skills, skillSearch, skills.data]);

  // Calculate Completion Percentages
  const freelancerCompletion = useMemo(() => {
    if (!user || user.role !== "Freelancer" || !professional.data) return 0;
    let score = 0;
    if (profile.data?.profilePictureUrl) score += 15;
    if (profile.data?.bio && profile.data.bio.trim().length > 10) score += 15;
    if (professional.data.skills.length > 0) score += 15;
    if (professional.data.workExperiences.length > 0) score += 15;
    if (professional.data.certifications && professional.data.certifications.length > 0) score += 15;
    if (professional.data.resumeUrl) score += 10;
    if (professional.data.portfolioItems.length > 0) score += 15;
    return score;
  }, [user, profile.data, professional.data]);

  const clientCompletion = useMemo(() => {
    if (!user || user.role !== "Cliente" || !profile.data) return 0;
    let score = 0;
    if (profile.data.companyName) score += 20;
    if (profile.data.industry) score += 15;
    if (profile.data.companySize) score += 15;
    if (profile.data.bio && profile.data.bio.trim().length > 10) score += 20;
    if (profile.data.website) score += 15;
    if (profile.data.linkedIn) score += 15;
    return score;
  }, [user, profile.data]);

  // Derived Client history lists
  const clientHiredFreelancers = useMemo(() => {
    if (!user || user.role !== "Cliente" || !clientProjects.data) return [];
    const hired = new Map<number, { id: number; name: string; role: string; avatarInitial: string; rating: number; completedProjects: number; projectTitle: string }>();
    clientProjects.data.forEach((p) => {
      if (p.assignedFreelancerId && p.status !== "Publicado") {
        hired.set(p.assignedFreelancerId, {
          id: p.assignedFreelancerId,
          name: p.assignedFreelancerId === 2 ? "Mateo Sanchez" : p.assignedFreelancerId === 4 ? "Laura Gil" : "Freelancer Contratado",
          role: p.assignedFreelancerId === 2 ? "Senior Frontend & Product Engineer" : p.assignedFreelancerId === 4 ? "Diseñadora UX/UI Senior" : "Desarrollador Fullstack",
          avatarInitial: p.assignedFreelancerId === 2 ? "M" : p.assignedFreelancerId === 4 ? "L" : "F",
          rating: p.assignedFreelancerId === 2 ? 4.9 : p.assignedFreelancerId === 4 ? 4.8 : 4.7,
          completedProjects: p.assignedFreelancerId === 2 ? 32 : p.assignedFreelancerId === 4 ? 18 : 8,
          projectTitle: p.title,
        });
      }
    });
    return Array.from(hired.values());
  }, [user, clientProjects.data]);

  if (!user) return null;

  if (profile.isLoading || (user.role === "Freelancer" && professional.isLoading)) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          <div className="col-span-2 h-96 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (profile.isError || (user.role === "Freelancer" && professional.isError)) {
    return (
      <ErrorState
        title="Error al cargar el perfil"
        detail="Ocurrió un error al cargar la información. Inténtalo nuevamente."
        retry={() => {
          profile.refetch();
          if (user.role === "Freelancer") professional.refetch();
        }}
      />
    );
  }

  // --- Handlers ---

  // Update Main User Profile (Bio, Names, Location, Company Info)
  const handleUpdateUserProfile = async (data: UpdateUserInput, successMsg = "Perfil actualizado correctamente.") => {
    try {
      await updateUser.mutateAsync(data);
      toast.success(successMsg);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Error al actualizar.");
    }
  };

  // Update Freelancer Preferences & Arrays
  const handleUpdateFreelancerProfile = async (data: UpdateFreelancerInput, successMsg = "Perfil profesional actualizado.") => {
    try {
      await updateFreelancer.mutateAsync(data);
      toast.success(successMsg);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Error al guardar los cambios.");
    }
  };

  // Submit main professional form
  const submitProfessionalForm = handleSubmit((input) => {
    handleUpdateFreelancerProfile(input, "Preferencias de perfil actualizadas.");
    setIsProfFormOpen(false);
  });

  // Avatar Upload Handler
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const mockUrl = URL.createObjectURL(file);
      handleUpdateUserProfile({ profilePictureUrl: mockUrl }, "Imagen de perfil actualizada.");
    }
  };

  // Skills handlers
  const handleAddSkill = () => {
    if (!selectedSkillId) return;
    addSkill.mutate(
      { skillId: selectedSkillId, proficiencyLevel: skillLevel },
      {
        onSuccess: () => {
          toast.success("Habilidad agregada.");
          setSelectedSkillId(null);
          setSkillSearch("");
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  const handleDeleteSkill = (skillId: number) => {
    deleteSkill.mutate(skillId, {
      onSuccess: () => toast.success("Habilidad eliminada."),
      onError: (error) => toast.error(error.message),
    });
  };

  // Work Experience handlers
  const openAddWork = () => {
    setEditingExperience(null);
    setWorkDraft(emptyWork);
    setIsWorkOpen(true);
  };

  const openEditWork = (work: WorkExperience) => {
    setEditingExperience(work);
    setWorkDraft({
      jobTitle: work.jobTitle,
      company: work.company ?? "",
      startDate: toDateInput(work.startDate),
      endDate: toDateInput(work.endDate),
      isCurrent: work.isCurrent,
      description: work.description ?? "",
    });
    setIsWorkOpen(true);
  };

  const handleSaveWork = () => {
    if (!workDraft.jobTitle.trim() || !workDraft.startDate) {
      toast.error("El cargo y la fecha de inicio son requeridos.");
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
        toast.success(editingExperience ? "Experiencia laboral actualizada." : "Experiencia laboral agregada.");
        setIsWorkOpen(false);
      },
      onError: (err: Error) => toast.error(err.message),
    };

    if (editingExperience) {
      updateWork.mutate({ experienceId: editingExperience.id, input }, options);
    } else {
      addWork.mutate(input, options);
    }
  };

  const handleDeleteWork = (experienceId: number) => {
    deleteWork.mutate(experienceId, {
      onSuccess: () => toast.success("Experiencia laboral eliminada."),
      onError: (err: Error) => toast.error(err.message),
    });
  };

  // Certifications handlers
  const handleAddCert = () => {
    if (!certDraft.name.trim() || !certDraft.institution.trim() || !certDraft.issueDate) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }
    const newCert: Certification = {
      id: Date.now(),
      name: certDraft.name.trim(),
      institution: certDraft.institution.trim(),
      issueDate: new Date(certDraft.issueDate),
      pdfUrl: certDraft.pdfFile ? URL.createObjectURL(certDraft.pdfFile) : null,
      pdfName: certDraft.pdfFile ? certDraft.pdfFile.name : null,
    };

    const currentCerts = professional.data?.certifications ?? [];
    handleUpdateFreelancerProfile({ certifications: [newCert, ...currentCerts] }, "Certificación agregada.");
    setCertDraft({ name: "", institution: "", issueDate: "", pdfFile: null });
    setIsCertOpen(false);
  };

  const handleDeleteCert = (id: number) => {
    const currentCerts = professional.data?.certifications ?? [];
    const updated = currentCerts.filter((c) => c.id !== id);
    handleUpdateFreelancerProfile({ certifications: updated }, "Certificación eliminada.");
  };

  // CV / Resume upload
  const handleCvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Por favor sube únicamente archivos PDF.");
        return;
      }
      const mockUrl = URL.createObjectURL(file);
      handleUpdateFreelancerProfile({ resumeUrl: mockUrl, resumeName: file.name }, "Currículum (CV) subido con éxito.");
    }
  };

  const handleDeleteCv = () => {
    handleUpdateFreelancerProfile({ resumeUrl: null, resumeName: null }, "Currículum eliminado.");
  };

  // Portfolio handlers
  const openAddPortfolio = () => {
    setEditingPortfolio(null);
    setPortfolioDraft({ title: "", description: "", projectUrl: "", imageFile: null, technologies: "" });
    setIsPortfolioOpen(true);
  };

  const openEditPortfolio = (item: PortfolioItem) => {
    setEditingPortfolio(item);
    setPortfolioDraft({
      title: item.title,
      description: item.description ?? "",
      projectUrl: item.projectUrl ?? "",
      imageFile: null,
      technologies: item.technologies?.join(", ") ?? "",
    });
    setIsPortfolioOpen(true);
  };

  const handleSavePortfolio = () => {
    if (!portfolioDraft.title.trim()) {
      toast.error("El nombre del proyecto es requerido.");
      return;
    }
    const currentList = professional.data?.portfolioItems ?? [];

    const newItem: PortfolioItem = {
      id: editingPortfolio ? editingPortfolio.id : Date.now(),
      title: portfolioDraft.title.trim(),
      description: portfolioDraft.description.trim() || null,
      projectUrl: portfolioDraft.projectUrl.trim() || null,
      thumbnailUrl: portfolioDraft.imageFile
        ? URL.createObjectURL(portfolioDraft.imageFile)
        : (editingPortfolio ? editingPortfolio.thumbnailUrl : null),
      completionDate: editingPortfolio ? editingPortfolio.completionDate : new Date(),
      technologies: portfolioDraft.technologies.split(",").map((t) => t.trim()).filter(Boolean),
    };

    let updatedList;
    if (editingPortfolio) {
      updatedList = currentList.map((item) => item.id === editingPortfolio.id ? newItem : item);
    } else {
      updatedList = [newItem, ...currentList];
    }

    handleUpdateFreelancerProfile({ portfolioItems: updatedList }, editingPortfolio ? "Proyecto de portafolio actualizado." : "Proyecto agregado al portafolio.");
    setIsPortfolioOpen(false);
  };

  const handleDeletePortfolio = (id: number) => {
    const currentList = professional.data?.portfolioItems ?? [];
    const updated = currentList.filter((item) => item.id !== id);
    handleUpdateFreelancerProfile({ portfolioItems: updated }, "Proyecto de portafolio eliminado.");
  };

  // Calculations are set up above the early returns.

  return (
    <>
      <PageHeader
        eyebrow="Configuración de Cuenta"
        title="Tu Perfil Profesional"
        description="Gestiona tu identidad, credenciales y preferencias para la plataforma."
      />

      <AnimatePresence mode="wait">
        {user.role === "Freelancer" && professional.data ? (
          <motion.div
            key="freelancer-profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {/* LEFT COLUMN: Hero & Preferences */}
            <div className="space-y-6 lg:col-span-1">
              {/* Profile Completion Meter */}
              <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/20 to-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Completitud del Perfil</h3>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {freelancerCompletion}%
                  </span>
                </div>
                <div className="mt-3 overflow-hidden rounded-full bg-slate-100 h-2.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${freelancerCompletion}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-2.5 text-xs text-slate-500 leading-relaxed">
                  {freelancerCompletion < 100
                    ? "Completa las secciones restantes para tener mayor visibilidad ante potenciales clientes."
                    : "¡Felicidades! Tu perfil está 100% completo y optimizado."}
                </p>
              </Card>

              {/* Hero Profile Card */}
              <Card className="relative overflow-hidden p-6 text-center">
                <div className="absolute right-3 top-3">
                  <Dialog.Root open={isProfFormOpen} onOpenChange={setIsProfFormOpen}>
                    <Dialog.Trigger asChild>
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition">
                        <Settings className="h-4 w-4" />
                      </button>
                    </Dialog.Trigger>
                    <AnimatePresence>
                      {isProfFormOpen && (
                        <Dialog.Portal forceMount>
                          <Dialog.Overlay asChild>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm"
                            />
                          </Dialog.Overlay>
                          <Dialog.Content asChild>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl focus:outline-none"
                            >
                              <div className="flex justify-between gap-4">
                                <Dialog.Title className="text-lg font-semibold text-slate-900">Editar Preferencias Profesionales</Dialog.Title>
                                <Dialog.Close className="text-slate-400 hover:text-slate-600">
                                  <X className="h-5 w-5" />
                                </Dialog.Close>
                              </div>
                              <form onSubmit={submitProfessionalForm} className="mt-4 space-y-4">
                                <div>
                                  <label className="mb-1 block text-sm font-medium text-slate-700">Título profesional</label>
                                  <Input {...register("title")} />
                                  {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Tarifa (USD/hora)</label>
                                    <Input type="number" {...register("hourlyRate")} />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Años de experiencia</label>
                                    <Input type="number" {...register("yearsOfExperience")} />
                                  </div>
                                </div>
                                <div>
                                  <label className="mb-1 block text-sm font-medium text-slate-700">Disponibilidad semanal (horas)</label>
                                  <Input
                                    type="number"
                                    placeholder="40"
                                    defaultValue={professional.data?.weeklyAvailability || 40}
                                    onChange={(e) => handleUpdateFreelancerProfile({ weeklyAvailability: Number(e.target.value) })}
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-sm font-medium text-slate-700">Modalidad de trabajo</label>
                                  <select
                                    className="h-11 w-full rounded-xl border bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    defaultValue={professional.data?.workMode || "Remoto"}
                                    onChange={(e) => handleUpdateFreelancerProfile({ workMode: e.target.value })}
                                  >
                                    {workModes.map((mode) => (
                                      <option key={mode} value={mode}>{mode}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-1 block text-sm font-medium text-slate-700">Estado de disponibilidad</label>
                                  <div className="grid grid-cols-3 gap-2">
                                    {availabilityOptions.map((option) => (
                                      <button
                                        type="button"
                                        key={option}
                                        onClick={() => setValue("availabilityStatus", option)}
                                        className={`rounded-lg py-2 text-xs font-semibold transition border ${
                                          currentAvailability === option
                                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                                        }`}
                                      >
                                        {option}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-3">
                                  <Dialog.Close asChild>
                                    <Button variant="secondary">Cancelar</Button>
                                  </Dialog.Close>
                                  <Button type="submit">Guardar</Button>
                                </div>
                              </form>
                            </motion.div>
                          </Dialog.Content>
                        </Dialog.Portal>
                      )}
                    </AnimatePresence>
                  </Dialog.Root>
                </div>

                <div className="group relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border bg-slate-50 flex items-center justify-center">
                  {profile.data?.profilePictureUrl ? (
                    <img
                      src={profile.data.profilePictureUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-indigo-600">
                      {profile.data?.firstName?.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-slate-950/40 opacity-0 transition group-hover:opacity-100">
                    <Upload className="h-5 w-5 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  {profile.data?.firstName} {profile.data?.lastName}
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-0.5">
                  {professional.data.title || "Añadir título profesional"}
                </p>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{profile.data?.city || "Sin ciudad"}, {profile.data?.country || "Sin país"}</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-5 text-center text-sm">
                  <div>
                    <span className="block text-xs text-slate-400 font-semibold uppercase">Rating Promedio</span>
                    <div className="mt-1 flex items-center justify-center gap-1 font-bold text-slate-800">
                      <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                      {professional.data.averageRating || "N/A"}
                      <span className="text-xs font-normal text-slate-400">({professional.data.totalReviews})</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-semibold uppercase">Proyectos OK</span>
                    <span className="mt-1 block font-bold text-slate-800">
                      {professional.data.workExperiences.length + (professional.data.portfolioItems?.length || 0)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-400 border-t pt-3">
                  Miembro desde el {profile.data ? formatDate(profile.data.createdAt) : ""}
                </div>
              </Card>

              {/* Work Preferences Widget */}
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 border-b pb-3 mb-4">Preferencias Laborales</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-500"><DollarSign className="h-4.5 w-4.5 text-slate-400" />Tarifa por hora</span>
                    <strong className="text-slate-800">{formatCurrency(professional.data.hourlyRate ?? 0)} / hr</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-500"><Clock className="h-4.5 w-4.5 text-slate-400" />Horas semanales</span>
                    <strong className="text-slate-800">{professional.data.weeklyAvailability || 40} horas</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-500"><Building2 className="h-4.5 w-4.5 text-slate-400" />Modalidad</span>
                    <strong className="text-slate-800">{professional.data.workMode || "Remoto"}</strong>
                  </div>
                </div>
              </Card>

              {/* Resume / CV Section */}
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 border-b pb-3 mb-4">Currículum / CV</h3>
                {professional.data.resumeUrl ? (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-slate-900">
                            {professional.data.resumeName || "curriculum.pdf"}
                          </p>
                          <span className="text-[10px] text-slate-400">PDF Documento</span>
                        </div>
                      </div>
                      <button
                        onClick={handleDeleteCv}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button asChild variant="secondary" size="sm" className="w-full text-xs">
                        <a href={professional.data.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Descargar
                        </a>
                      </Button>
                      <label className="flex-1">
                        <span className="flex h-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                          Reemplazar
                        </span>
                        <input type="file" accept=".pdf" className="hidden" onChange={handleCvChange} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:bg-slate-50 transition duration-200">
                    <Upload className="mb-2 h-8 w-8 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">Subir tu Currículum (CV)</span>
                    <span className="mt-1 text-[10px] text-slate-400">Solo archivos PDF (máx 5MB)</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={handleCvChange} />
                  </label>
                )}
              </Card>
            </div>

            {/* RIGHT COLUMN: About, Skills, Experiences, Certifications, Portfolio */}
            <div className="space-y-6 lg:col-span-2">
              {/* About Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                  <h3 className="font-semibold text-slate-900">Sobre mí</h3>
                  <Dialog.Root open={isBioOpen} onOpenChange={setIsBioOpen}>
                    <Dialog.Trigger asChild>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                    </Dialog.Trigger>
                    <AnimatePresence>
                      {isBioOpen && (
                        <Dialog.Portal forceMount>
                          <Dialog.Overlay asChild>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm"
                            />
                          </Dialog.Overlay>
                          <Dialog.Content asChild>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl focus:outline-none"
                            >
                              <div className="flex justify-between gap-4">
                                <Dialog.Title className="text-lg font-semibold text-slate-900">Editar Biografía</Dialog.Title>
                                <Dialog.Close className="text-slate-400 hover:text-slate-600">
                                  <X className="h-5 w-5" />
                                </Dialog.Close>
                              </div>
                              <div className="mt-4 space-y-4">
                                <div>
                                  <label className="mb-1 block text-sm font-medium text-slate-700">
                                    Sobre mí (Biografía)
                                  </label>
                                  <Textarea
                                    rows={6}
                                    maxLength={1000}
                                    defaultValue={profile.data?.bio || ""}
                                    id="bio-textarea"
                                    placeholder="Describe tu enfoque, habilidades principales y experiencia laboral..."
                                    onChange={(e) => {
                                      // Local text counter helper
                                      const label = document.getElementById("bio-counter");
                                      if (label) label.textContent = `${e.target.value.length}/1000`;
                                    }}
                                  />
                                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                                    <span>Máximo 1000 caracteres</span>
                                    <span id="bio-counter">{(profile.data?.bio || "").length}/1000</span>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                  <Dialog.Close asChild>
                                    <Button variant="secondary">Cancelar</Button>
                                  </Dialog.Close>
                                  <Button
                                    onClick={() => {
                                      const val = (document.getElementById("bio-textarea") as HTMLTextAreaElement)?.value;
                                      handleUpdateUserProfile({ bio: val }, "Biografía actualizada.");
                                      setIsBioOpen(false);
                                    }}
                                  >
                                    Guardar
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          </Dialog.Content>
                        </Dialog.Portal>
                      )}
                    </AnimatePresence>
                  </Dialog.Root>
                </div>
                <p className="text-sm leading-6 text-slate-600 whitespace-pre-line">
                  {profile.data?.bio || "Aún no has agregado una biografía. Cuéntale a tus clientes acerca de tu experiencia laboral y áreas de dominio."}
                </p>
              </Card>

              {/* Skills Card */}
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 border-b pb-3 mb-4">Habilidades & Dominio</h3>
                
                {professional.data.skills.length === 0 ? (
                  <p className="text-sm text-slate-500">Agrega habilidades para completar tu perfil.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {professional.data.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/20 px-3.5 py-1.5 text-xs font-semibold text-indigo-700"
                      >
                        {skill.name}
                        <span className="text-[10px] font-normal text-slate-400">({skill.proficiencyLevel || "Avanzado"})</span>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="text-indigo-400 hover:text-rose-600 transition"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto] border-t pt-5">
                  <div className="relative">
                    <Input
                      value={skillSearch}
                      onChange={(event) => {
                        setSkillSearch(event.target.value);
                        setSelectedSkillId(null);
                      }}
                      placeholder="Buscar habilidad (Next.js, Figma, React...)"
                    />
                    {skillSearch && filteredSkills.length > 0 && (
                      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-lg">
                        {filteredSkills.map((skill) => (
                          <button
                            className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-slate-50 transition ${
                              selectedSkillId === skill.id ? "bg-indigo-50 text-indigo-700" : "text-slate-700"
                            }`}
                            key={skill.id}
                            type="button"
                            onClick={() => {
                              setSelectedSkillId(skill.id);
                              setSkillSearch(skill.name);
                            }}
                          >
                            <span>{skill.name}</span>
                            <span className="text-xs text-slate-400">{skill.category}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <select
                    className="h-11 rounded-xl border bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={skillLevel}
                    onChange={(event) => setSkillLevel(event.target.value as ProficiencyLevel)}
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <Button
                    disabled={addSkill.isPending || !selectedSkillId}
                    onClick={handleAddSkill}
                  >
                    <Plus className="mr-1.5 h-4 w-4" /> Agregar
                  </Button>
                </div>
              </Card>

              {/* Experiences Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between border-b pb-3 mb-5">
                  <h3 className="font-semibold text-slate-900">Experiencia Laboral</h3>
                  <Button onClick={openAddWork} size="sm" variant="secondary">
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Agregar
                  </Button>
                </div>

                {professional.data.workExperiences.length === 0 ? (
                  <EmptyState
                    title="No hay experiencia visible"
                    detail="Añade experiencias pasadas para respaldar tus habilidades."
                  />
                ) : (
                  <div className="space-y-6 relative border-l-2 border-slate-100 pl-5 ml-2.5">
                    {professional.data.workExperiences.map((work) => (
                      <div className="relative group" key={work.id}>
                        {/* Timeline point */}
                        <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-600" />
                        
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{work.jobTitle}</h4>
                            <p className="mt-0.5 text-xs text-slate-500">
                              <span className="font-semibold text-slate-700">{work.company || "Freelance"}</span>
                              <span className="mx-2">•</span>
                              {formatDate(work.startDate)} - {work.isCurrent ? "Actual" : work.endDate ? formatDate(work.endDate) : "Sin fecha"}
                            </p>
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition duration-200">
                            <button
                              onClick={() => openEditWork(work)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteWork(work.id)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {work.description && (
                          <p className="mt-2.5 text-xs leading-relaxed text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            {work.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Certifications Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between border-b pb-3 mb-5">
                  <h3 className="font-semibold text-slate-900">Certificaciones</h3>
                  <Button onClick={() => setIsCertOpen(true)} size="sm" variant="secondary">
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Agregar
                  </Button>
                </div>

                {(!professional.data.certifications || professional.data.certifications.length === 0) ? (
                  <EmptyState
                    title="Sin certificaciones"
                    detail="Agrega tus diplomas, cursos o certificaciones oficiales."
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {professional.data.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="group flex flex-col justify-between rounded-xl border p-4 hover:border-indigo-100 hover:bg-indigo-50/5 transition duration-200"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                              {cert.name}
                            </h4>
                            <button
                              onClick={() => handleDeleteCert(cert.id)}
                              className="rounded p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-rose-600 transition ml-auto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{cert.institution}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Emitido: {formatDate(cert.issueDate)}
                          </p>
                        </div>
                        {cert.pdfUrl && (
                          <div className="mt-3.5 border-t pt-3 flex items-center justify-between">
                            <a
                              href={cert.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                            >
                              <FileText className="h-3.5 w-3.5" /> Ver PDF
                            </a>
                            <span className="truncate max-w-[120px] text-[9px] text-slate-400" title={cert.pdfName || ""}>
                              {cert.pdfName}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Portfolio Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between border-b pb-3 mb-5">
                  <h3 className="font-semibold text-slate-900">Portafolio</h3>
                  <Button onClick={openAddPortfolio} size="sm" variant="secondary">
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Agregar
                  </Button>
                </div>

                {professional.data.portfolioItems.length === 0 ? (
                  <EmptyState
                    title="Portafolio Vacío"
                    detail="Muestra tus mejores proyectos y las tecnologías que usaste."
                  />
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {professional.data.portfolioItems.map((project) => (
                      <div
                        key={project.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                      >
                        <div>
                          {project.thumbnailUrl ? (
                            <img
                              src={project.thumbnailUrl}
                              alt={project.title}
                              className="h-40 w-full object-cover border-b"
                            />
                          ) : (
                            <div className="h-40 w-full bg-slate-100 flex items-center justify-center text-slate-400 border-b">
                              <Inbox className="h-10 w-10" />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{project.title}</h4>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition duration-200 ml-auto">
                                <button
                                  onClick={() => openEditPortfolio(project)}
                                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePortfolio(project.id)}
                                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {project.description}
                            </p>
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="mt-3.5 flex flex-wrap gap-1">
                                {project.technologies.map((t) => (
                                  <span key={t} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-semibold">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {project.projectUrl && (
                          <div className="border-t bg-slate-50/50 px-4 py-2.5 flex items-center justify-end">
                            <a
                              href={project.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                            >
                              Ver proyecto <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Radix Modals for Freelancer Forms */}
            {/* Experience Dialog */}
            <Dialog.Root open={isWorkOpen} onOpenChange={setIsWorkOpen}>
              <AnimatePresence>
                {isWorkOpen && (
                  <Dialog.Portal forceMount>
                    <Dialog.Overlay asChild>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm"
                      />
                    </Dialog.Overlay>
                    <Dialog.Content asChild>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl focus:outline-none"
                      >
                        <div className="flex justify-between gap-4">
                          <Dialog.Title className="text-lg font-semibold text-slate-900">
                            {editingExperience ? "Editar Experiencia" : "Agregar Experiencia"}
                          </Dialog.Title>
                          <Dialog.Close className="text-slate-400 hover:text-slate-600">
                            <X className="h-5 w-5" />
                          </Dialog.Close>
                        </div>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Cargo *</label>
                            <Input
                              placeholder="Ej. Senior Frontend Developer"
                              value={workDraft.jobTitle}
                              onChange={(e) => setWorkDraft({ ...workDraft, jobTitle: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Empresa *</label>
                            <Input
                              placeholder="Ej. Acme Inc."
                              value={workDraft.company}
                              onChange={(e) => setWorkDraft({ ...workDraft, company: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-sm font-medium text-slate-700">Fecha de inicio *</label>
                              <Input
                                type="date"
                                value={workDraft.startDate}
                                onChange={(e) => setWorkDraft({ ...workDraft, startDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-medium text-slate-700">Fecha de fin</label>
                              <Input
                                type="date"
                                disabled={workDraft.isCurrent}
                                value={workDraft.endDate}
                                onChange={(e) => setWorkDraft({ ...workDraft, endDate: e.target.value })}
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={workDraft.isCurrent}
                              onChange={(e) => setWorkDraft({ ...workDraft, isCurrent: e.target.checked, endDate: e.target.checked ? "" : workDraft.endDate })}
                            />
                            Trabajo actual
                          </label>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
                            <Textarea
                              placeholder="Responsabilidades, logros y tecnologías utilizadas..."
                              rows={3}
                              value={workDraft.description}
                              onChange={(e) => setWorkDraft({ ...workDraft, description: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end gap-3 pt-3">
                            <Dialog.Close asChild>
                              <Button variant="secondary">Cancelar</Button>
                            </Dialog.Close>
                            <Button onClick={handleSaveWork}>Guardar</Button>
                          </div>
                        </div>
                      </motion.div>
                    </Dialog.Content>
                  </Dialog.Portal>
                )}
              </AnimatePresence>
            </Dialog.Root>

            {/* Certifications Dialog */}
            <Dialog.Root open={isCertOpen} onOpenChange={setIsCertOpen}>
              <AnimatePresence>
                {isCertOpen && (
                  <Dialog.Portal forceMount>
                    <Dialog.Overlay asChild>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm"
                      />
                    </Dialog.Overlay>
                    <Dialog.Content asChild>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl focus:outline-none"
                      >
                        <div className="flex justify-between gap-4">
                          <Dialog.Title className="text-lg font-semibold text-slate-900">Agregar Certificación</Dialog.Title>
                          <Dialog.Close className="text-slate-400 hover:text-slate-600">
                            <X className="h-5 w-5" />
                          </Dialog.Close>
                        </div>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Nombre de la Certificación *</label>
                            <Input
                              placeholder="Ej. AWS Certified Solutions Architect"
                              value={certDraft.name}
                              onChange={(e) => setCertDraft({ ...certDraft, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Institución emisora *</label>
                            <Input
                              placeholder="Ej. Amazon Web Services"
                              value={certDraft.institution}
                              onChange={(e) => setCertDraft({ ...certDraft, institution: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Fecha de emisión *</label>
                            <Input
                              type="date"
                              value={certDraft.issueDate}
                              onChange={(e) => setCertDraft({ ...certDraft, issueDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Adjuntar PDF (Opcional)</label>
                            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 hover:bg-slate-100 transition">
                              <div className="text-center">
                                <Upload className="mx-auto h-6 w-6 text-slate-400" />
                                <span className="mt-1 block text-xs font-semibold text-slate-700">
                                  {certDraft.pdfFile ? certDraft.pdfFile.name : "Subir PDF de la certificación"}
                                </span>
                              </div>
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => setCertDraft({ ...certDraft, pdfFile: e.target.files?.[0] || null })}
                              />
                            </label>
                          </div>
                          <div className="flex justify-end gap-3 pt-3">
                            <Dialog.Close asChild>
                              <Button variant="secondary">Cancelar</Button>
                            </Dialog.Close>
                            <Button onClick={handleAddCert}>Guardar</Button>
                          </div>
                        </div>
                      </motion.div>
                    </Dialog.Content>
                  </Dialog.Portal>
                )}
              </AnimatePresence>
            </Dialog.Root>

            {/* Portfolio Dialog */}
            <Dialog.Root open={isPortfolioOpen} onOpenChange={setIsPortfolioOpen}>
              <AnimatePresence>
                {isPortfolioOpen && (
                  <Dialog.Portal forceMount>
                    <Dialog.Overlay asChild>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm"
                      />
                    </Dialog.Overlay>
                    <Dialog.Content asChild>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl focus:outline-none"
                      >
                        <div className="flex justify-between gap-4">
                          <Dialog.Title className="text-lg font-semibold text-slate-900">
                            {editingPortfolio ? "Editar Proyecto" : "Agregar Proyecto al Portafolio"}
                          </Dialog.Title>
                          <Dialog.Close className="text-slate-400 hover:text-slate-600">
                            <X className="h-5 w-5" />
                          </Dialog.Close>
                        </div>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Nombre del Proyecto *</label>
                            <Input
                              placeholder="Ej. Ecommerce redesign"
                              value={portfolioDraft.title}
                              onChange={(e) => setPortfolioDraft({ ...portfolioDraft, title: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
                            <Textarea
                              placeholder="Describe el propósito y las principales funcionalidades del proyecto..."
                              rows={3}
                              value={portfolioDraft.description}
                              onChange={(e) => setPortfolioDraft({ ...portfolioDraft, description: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">URL del Proyecto</label>
                            <Input
                              placeholder="Ej. https://mi-proyecto.com"
                              value={portfolioDraft.projectUrl}
                              onChange={(e) => setPortfolioDraft({ ...portfolioDraft, projectUrl: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Tecnologías (separadas por comas)</label>
                            <Input
                              placeholder="Ej. Next.js, React, Tailwind, Redux"
                              value={portfolioDraft.technologies}
                              onChange={(e) => setPortfolioDraft({ ...portfolioDraft, technologies: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Imagen de Portada (Opcional)</label>
                            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 hover:bg-slate-100 transition">
                              <div className="text-center">
                                <Upload className="mx-auto h-6 w-6 text-slate-400" />
                                <span className="mt-1 block text-xs font-semibold text-slate-700">
                                  {portfolioDraft.imageFile ? portfolioDraft.imageFile.name : "Subir captura de pantalla"}
                                </span>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setPortfolioDraft({ ...portfolioDraft, imageFile: e.target.files?.[0] || null })}
                              />
                            </label>
                          </div>
                          <div className="flex justify-end gap-3 pt-3">
                            <Dialog.Close asChild>
                              <Button variant="secondary">Cancelar</Button>
                            </Dialog.Close>
                            <Button onClick={handleSavePortfolio}>Guardar</Button>
                          </div>
                        </div>
                      </motion.div>
                    </Dialog.Content>
                  </Dialog.Portal>
                )}
              </AnimatePresence>
            </Dialog.Root>
          </motion.div>
        ) : (
          /* CLIENT PROFILE VIEW */
          <motion.div
            key="client-profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {/* LEFT COLUMN: Hero Company, Socials, Completion Meter */}
            <div className="space-y-6 lg:col-span-1">
              {/* Profile Completion Meter */}
              <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/20 to-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Completitud Corporativa</h3>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {clientCompletion}%
                  </span>
                </div>
                <div className="mt-3 overflow-hidden rounded-full bg-slate-100 h-2.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${clientCompletion}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-2.5 text-xs text-slate-500 leading-relaxed">
                  Completa todos los detalles de tu empresa para inspirar máxima confianza y atraer mejores perfiles a tus convocatorias.
                </p>
              </Card>

              {/* Company Hero Card */}
              <Card className="relative p-6 text-center">
                <div className="absolute right-3 top-3">
                  <Dialog.Root open={isCompanyOpen} onOpenChange={setIsCompanyOpen}>
                    <Dialog.Trigger asChild>
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </Dialog.Trigger>
                    <AnimatePresence>
                      {isCompanyOpen && (
                        <Dialog.Portal forceMount>
                          <Dialog.Overlay asChild>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm"
                            />
                          </Dialog.Overlay>
                          <Dialog.Content asChild>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl focus:outline-none"
                            >
                              <div className="flex justify-between gap-4">
                                <Dialog.Title className="text-lg font-semibold text-slate-900">Editar Información Empresa</Dialog.Title>
                                <Dialog.Close className="text-slate-400 hover:text-slate-600">
                                  <X className="h-5 w-5" />
                                </Dialog.Close>
                              </div>
                              <div className="mt-4 space-y-4">
                                <div>
                                  <label className="mb-1 block text-sm font-medium text-slate-700">Nombre de la Empresa</label>
                                  <Input id="comp-name" defaultValue={profile.data?.companyName || ""} />
                                </div>
                                <div>
                                  <label className="mb-1 block text-sm font-medium text-slate-700">Industria</label>
                                  <Input id="comp-industry" defaultValue={profile.data?.industry || ""} />
                                </div>
                                <div>
                                  <label className="mb-1 block text-sm font-medium text-slate-700">Tamaño de la Empresa</label>
                                  <Input id="comp-size" placeholder="Ej. 11-50 empleados" defaultValue={profile.data?.companySize || ""} />
                                </div>
                                <div className="flex justify-end gap-3 pt-3">
                                  <Dialog.Close asChild>
                                    <Button variant="secondary">Cancelar</Button>
                                  </Dialog.Close>
                                  <Button
                                    onClick={() => {
                                      const n = (document.getElementById("comp-name") as HTMLInputElement)?.value;
                                      const ind = (document.getElementById("comp-industry") as HTMLInputElement)?.value;
                                      const s = (document.getElementById("comp-size") as HTMLInputElement)?.value;
                                      handleUpdateUserProfile({ companyName: n, industry: ind, companySize: s }, "Información empresarial actualizada.");
                                      setIsCompanyOpen(false);
                                    }}
                                  >
                                    Guardar
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          </Dialog.Content>
                        </Dialog.Portal>
                      )}
                    </AnimatePresence>
                  </Dialog.Root>
                </div>

                <div className="mx-auto mb-4 h-20 w-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Building2 className="h-10 w-10" />
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  {profile.data?.companyName || "Añadir nombre de empresa"}
                </h2>
                <p className="text-sm font-semibold text-indigo-600 mt-1">
                  {profile.data?.industry || "Definir industria"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {profile.data?.companySize || "Indicar tamaño"}
                </p>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-500 border-t pt-4">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{profile.data?.city || "Sin ciudad"}, {profile.data?.country || "Sin país"}</span>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  Contacto: {profile.data?.firstName} {profile.data?.lastName}
                </div>
              </Card>

              {/* Web & Social Links Card */}
              <Card className="relative p-6">
                <div className="absolute right-3 top-3">
                  <Dialog.Root open={isSocialsOpen} onOpenChange={setIsSocialsOpen}>
                    <Dialog.Trigger asChild>
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </Dialog.Trigger>
                    <AnimatePresence>
                      {isSocialsOpen && (
                        <Dialog.Portal forceMount>
                          <Dialog.Overlay asChild>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm"
                            />
                          </Dialog.Overlay>
                          <Dialog.Content asChild>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl focus:outline-none"
                            >
                              <div className="flex justify-between gap-4">
                                <Dialog.Title className="text-lg font-semibold text-slate-900">Editar Enlaces Corporativos</Dialog.Title>
                                <Dialog.Close className="text-slate-400 hover:text-slate-600">
                                  <X className="h-5 w-5" />
                                </Dialog.Close>
                              </div>
                              <div className="mt-4 space-y-4">
                                <div>
                                  <label className="mb-1 block text-sm font-medium text-slate-700">Sitio Web</label>
                                  <Input id="comp-website" placeholder="Ej. https://mi-empresa.com" defaultValue={profile.data?.website || ""} />
                                </div>
                                <div>
                                  <label className="mb-1 block text-sm font-medium text-slate-700">LinkedIn</label>
                                  <Input id="comp-linkedin" placeholder="Ej. https://linkedin.com/company/mi-empresa" defaultValue={profile.data?.linkedIn || ""} />
                                </div>
                                <div className="flex justify-end gap-3 pt-3">
                                  <Dialog.Close asChild>
                                    <Button variant="secondary">Cancelar</Button>
                                  </Dialog.Close>
                                  <Button
                                    onClick={() => {
                                      const w = (document.getElementById("comp-website") as HTMLInputElement)?.value;
                                      const li = (document.getElementById("comp-linkedin") as HTMLInputElement)?.value;
                                      handleUpdateUserProfile({ website: w, linkedIn: li }, "Enlaces actualizados correctamente.");
                                      setIsSocialsOpen(false);
                                    }}
                                  >
                                    Guardar
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          </Dialog.Content>
                        </Dialog.Portal>
                      )}
                    </AnimatePresence>
                  </Dialog.Root>
                </div>

                <h3 className="font-semibold text-slate-900 border-b pb-3 mb-4">Canales Oficiales</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-500">
                      <Globe className="h-4.5 w-4.5 text-slate-400" /> Web
                    </span>
                    {profile.data?.website ? (
                      <a href={profile.data.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:underline inline-flex items-center gap-0.5">
                        Ir al sitio <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">No definido</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-500">
                      <LinkedInIcon className="h-4.5 w-4.5 text-slate-400" /> LinkedIn
                    </span>
                    {profile.data?.linkedIn ? (
                      <a href={profile.data.linkedIn} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:underline inline-flex items-center gap-0.5">
                        Ver empresa <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">No definido</span>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* RIGHT COLUMN: About Company, and History (Projects / Freelancers) */}
            <div className="space-y-6 lg:col-span-2">
              {/* About Company Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                  <h3 className="font-semibold text-slate-900">Sobre la Empresa</h3>
                  <Dialog.Root open={isBioOpen} onOpenChange={setIsBioOpen}>
                    <Dialog.Trigger asChild>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                    </Dialog.Trigger>
                    <AnimatePresence>
                      {isBioOpen && (
                        <Dialog.Portal forceMount>
                          <Dialog.Overlay asChild>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm"
                            />
                          </Dialog.Overlay>
                          <Dialog.Content asChild>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl focus:outline-none"
                            >
                              <div className="flex justify-between gap-4">
                                <Dialog.Title className="text-lg font-semibold text-slate-900">Editar Sobre la Empresa</Dialog.Title>
                                <Dialog.Close className="text-slate-400 hover:text-slate-600">
                                  <X className="h-5 w-5" />
                                </Dialog.Close>
                              </div>
                              <div className="mt-4 space-y-4">
                                <div>
                                  <label className="mb-1 block text-sm font-medium text-slate-700">
                                    Sobre la Empresa (Biografía)
                                  </label>
                                  <Textarea
                                    rows={5}
                                    maxLength={1000}
                                    defaultValue={profile.data?.bio || ""}
                                    id="comp-bio-textarea"
                                    placeholder="Describe la misión, objetivos y qué hace tu empresa especial..."
                                    onChange={(e) => {
                                      const label = document.getElementById("comp-bio-counter");
                                      if (label) label.textContent = `${e.target.value.length}/1000`;
                                    }}
                                  />
                                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                                    <span>Máximo 1000 caracteres</span>
                                    <span id="comp-bio-counter">{(profile.data?.bio || "").length}/1000</span>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                  <Dialog.Close asChild>
                                    <Button variant="secondary">Cancelar</Button>
                                  </Dialog.Close>
                                  <Button
                                    onClick={() => {
                                      const val = (document.getElementById("comp-bio-textarea") as HTMLTextAreaElement)?.value;
                                      handleUpdateUserProfile({ bio: val }, "Biografía empresarial actualizada.");
                                      setIsBioOpen(false);
                                    }}
                                  >
                                    Guardar
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          </Dialog.Content>
                        </Dialog.Portal>
                      )}
                    </AnimatePresence>
                  </Dialog.Root>
                </div>
                <p className="text-sm leading-6 text-slate-600 whitespace-pre-line">
                  {profile.data?.bio || "Añadir descripción de la empresa. Cuéntales a los profesionales sobre tus proyectos, cultura y propósito corporativo."}
                </p>
              </Card>

              {/* History Tabs Card */}
              <Card className="p-6">
                <div className="flex items-center gap-4 border-b pb-1 mb-5">
                  <button
                    onClick={() => setClientTab("projects")}
                    className={`pb-3 text-sm font-bold transition border-b-2 -mb-[6px] ${
                      clientTab === "projects"
                        ? "border-indigo-600 text-slate-900"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Proyectos Publicados ({clientProjects.data?.length || 0})
                  </button>
                  <button
                    onClick={() => setClientTab("freelancers")}
                    className={`pb-3 text-sm font-bold transition border-b-2 -mb-[6px] ${
                      clientTab === "freelancers"
                        ? "border-indigo-600 text-slate-900"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Freelancers Contratados ({clientHiredFreelancers.length})
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {clientTab === "projects" ? (
                    <motion.div
                      key="client-projects-list"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      {clientProjects.isLoading ? (
                        <p className="text-sm text-slate-500 py-2">Cargando historial...</p>
                      ) : !clientProjects.data || clientProjects.data.length === 0 ? (
                        <EmptyState
                          title="Sin proyectos publicados"
                          detail="Aún no has publicado convocatorias. Abre tu primera vacante."
                        />
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {clientProjects.data.map((proj) => (
                            <Link href={`/projects/${proj.id}`} key={proj.id} className="block group">
                              <div className="h-full rounded-xl border p-4 hover:border-indigo-100 hover:bg-indigo-50/5 transition duration-200 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                      proj.status === "Completado"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : proj.status === "En Proceso"
                                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                                        : "bg-slate-100 text-slate-600 border border-slate-200"
                                    }`}>
                                      {proj.status}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-900">{formatCurrency(proj.budget)}</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition">
                                    {proj.title}
                                  </h4>
                                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                    {proj.description}
                                  </p>
                                </div>
                                <div className="mt-3.5 border-t pt-3 flex items-center justify-between text-[10px] text-slate-400">
                                  <span>Publicado el {formatDate(proj.createdAt)}</span>
                                  <span className="font-semibold text-indigo-600 group-hover:underline">Ver detalles →</span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="client-freelancers-list"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      {clientHiredFreelancers.length === 0 ? (
                        <EmptyState
                          title="Sin contrataciones"
                          detail="Aún no has contratado freelancers en la plataforma."
                        />
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {clientHiredFreelancers.map((fl) => (
                            <div
                              key={fl.id}
                              className="rounded-xl border p-4 transition duration-200 flex items-start gap-3.5"
                            >
                              <div className="h-11 w-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 shrink-0">
                                {fl.avatarInitial}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-slate-900 truncate">{fl.name}</h4>
                                <p className="text-xs text-slate-500 truncate">{fl.role}</p>
                                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                                  <span className="font-bold text-slate-800">{fl.rating}</span>
                                  <span className="text-slate-400">({fl.completedProjects} proyectos)</span>
                                </div>
                                <div className="mt-3 border-t pt-2.5 text-[10px] text-slate-400">
                                  Proyecto: <span className="font-semibold text-slate-700">{fl.projectTitle}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
