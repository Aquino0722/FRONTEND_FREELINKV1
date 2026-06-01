import { http, HttpResponse } from "msw";

import { db } from "@/mocks/data/database";
import { authenticatedUser, forbidden, hasRole, mockDelay, unauthorized } from "@/mocks/utils";

export const freelancersHandlers = [
  http.get("*/api/Freelancers/skills", async ({ request }) => {
    await mockDelay();
    const category = new URL(request.url).searchParams.get("category");
    const skills = category ? db.skills.filter((skill) => skill.category === category) : db.skills;
    return HttpResponse.json({ success: true, message: "Habilidades disponibles.", skills });
  }),
  http.get("*/api/Freelancers/:id/profile", async ({ request, params }) => {
    await mockDelay();
    if (!authenticatedUser(request)) return unauthorized();
    const profile = db.freelancers.find((item) => item.userId === Number(params.id));
    if (!profile) return HttpResponse.json({ message: "Perfil freelancer no encontrado." }, { status: 404 });
    return HttpResponse.json({ success: true, message: "Perfil encontrado.", profile });
  }),
  http.put("*/api/Freelancers/:id/profile", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const id = Number(params.id);
    if (user.userId !== id && !hasRole(user, "Administrador")) return forbidden();
    const profile = db.freelancers.find((item) => item.userId === id);
    if (!profile) return HttpResponse.json({ message: "Perfil freelancer no encontrado." }, { status: 404 });
    Object.assign(profile, (await request.json()) as object);
    return HttpResponse.json({ success: true, message: "Perfil profesional actualizado." });
  }),
  http.post("*/api/Freelancers/:id/skills", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const id = Number(params.id);
    if (user.userId !== id && !hasRole(user, "Administrador")) return forbidden();
    const profile = db.freelancers.find((item) => item.userId === id);
    const input = (await request.json()) as { skillId: number; proficiencyLevel?: string };
    const skill = db.skills.find((item) => item.skillId === input.skillId);
    if (!profile || !skill) return HttpResponse.json({ message: "Habilidad no encontrada." }, { status: 404 });
    if (!profile.skills.some((item) => item.skillId === skill.skillId)) profile.skills.push({ ...skill, proficiencyLevel: input.proficiencyLevel ?? null });
    return HttpResponse.json({ success: true, message: "Habilidad agregada." });
  }),
  http.post("*/api/Freelancers/:id/work-experience", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const id = Number(params.id);
    if (user.userId !== id && !hasRole(user, "Administrador")) return forbidden();
    const profile = db.freelancers.find((item) => item.userId === id);
    if (!profile) return HttpResponse.json({ message: "Perfil freelancer no encontrado." }, { status: 404 });
    const input = (await request.json()) as { jobTitle: string; company?: string | null; startDate: string; endDate?: string | null; isCurrent: boolean; description?: string | null };
    if (!input.jobTitle || !input.startDate) return HttpResponse.json({ message: "Cargo y fecha de inicio son requeridos." }, { status: 400 });
    profile.workExperiences.unshift({
      experienceId: Math.max(0, ...profile.workExperiences.map((item) => item.experienceId)) + 1,
      jobTitle: input.jobTitle,
      company: input.company ?? null,
      startDate: input.startDate,
      endDate: input.isCurrent ? null : input.endDate ?? null,
      isCurrent: input.isCurrent,
      description: input.description ?? null,
    });
    return HttpResponse.json({ success: true, message: "Experiencia agregada." });
  }),
  http.put("*/api/Freelancers/:id/work-experience/:experienceId", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const id = Number(params.id);
    if (user.userId !== id && !hasRole(user, "Administrador")) return forbidden();
    const profile = db.freelancers.find((item) => item.userId === id);
    const experience = profile?.workExperiences.find((item) => item.experienceId === Number(params.experienceId));
    if (!profile || !experience) return HttpResponse.json({ message: "Experiencia no encontrada." }, { status: 404 });
    const input = (await request.json()) as { jobTitle: string; company?: string | null; startDate: string; endDate?: string | null; isCurrent: boolean; description?: string | null };
    Object.assign(experience, {
      jobTitle: input.jobTitle,
      company: input.company ?? null,
      startDate: input.startDate,
      endDate: input.isCurrent ? null : input.endDate ?? null,
      isCurrent: input.isCurrent,
      description: input.description ?? null,
    });
    return HttpResponse.json({ success: true, message: "Experiencia actualizada." });
  }),
  http.delete("*/api/Freelancers/:id/work-experience/:experienceId", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const id = Number(params.id);
    if (user.userId !== id && !hasRole(user, "Administrador")) return forbidden();
    const profile = db.freelancers.find((item) => item.userId === id);
    if (!profile) return HttpResponse.json({ message: "Perfil freelancer no encontrado." }, { status: 404 });
    profile.workExperiences = profile.workExperiences.filter((item) => item.experienceId !== Number(params.experienceId));
    return HttpResponse.json({ success: true, message: "Experiencia eliminada." });
  }),
  http.delete("*/api/Freelancers/:id/skills/:skillId", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const id = Number(params.id);
    if (user.userId !== id && !hasRole(user, "Administrador")) return forbidden();
    const profile = db.freelancers.find((item) => item.userId === id);
    if (!profile) return HttpResponse.json({ message: "Perfil freelancer no encontrado." }, { status: 404 });
    const skillId = Number(params.skillId);
    profile.skills = profile.skills.filter((item) => item.skillId !== skillId);
    return HttpResponse.json({ success: true, message: "Habilidad eliminada." });
  }),
];
