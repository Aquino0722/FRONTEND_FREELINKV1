import { http, HttpResponse } from "msw";

import { env } from "@/lib/config/env";
import { db } from "@/mocks/data/database";
import { authenticatedUser, errorScenario, forbidden, hasRole, mockDelay, unauthorized } from "@/mocks/utils";
import type { BackendProjectDto } from "@/types/api";

export const projectsHandlers = [
  http.get("*/api/Projects", async ({ request }) => {
    await mockDelay();
    if (errorScenario()) return HttpResponse.json({ message: "No pudimos consultar proyectos." }, { status: 500 });
    if (env.mockScenario === "empty") return HttpResponse.json([]);
    const url = new URL(request.url);
    const ownerId = url.searchParams.get("ownerId");
    const assigned = url.searchParams.get("assignedFreelancerId");
    let projects = db.projects.filter((project) => project.projectStatus === "Publicado");
    if (ownerId) {
      const user = authenticatedUser(request);
      if (!user) return unauthorized();
      if (user.userId !== Number(ownerId) && !hasRole(user, "Administrador")) return forbidden();
      projects = db.projects.filter((project) => project.clientId === Number(ownerId));
    }
    if (assigned) {
      const user = authenticatedUser(request);
      if (!user) return unauthorized();
      if (user.userId !== Number(assigned) && !hasRole(user, "Administrador")) return forbidden();
      projects = db.projects.filter((project) => project.assignedFreelancerId === Number(assigned));
    }
    const query = url.searchParams.get("q")?.toLowerCase();
    const skill = url.searchParams.get("skills")?.toLowerCase();
    if (query) projects = projects.filter((project) => `${project.title} ${project.description}`.toLowerCase().includes(query));
    if (skill) projects = projects.filter((project) => project.requiredSkills?.toLowerCase().includes(skill));
    return HttpResponse.json(projects);
  }),
  http.get("*/api/Projects/:id", async ({ params }) => {
    await mockDelay();
    const project = db.projects.find((item) => item.projectId === Number(params.id));
    return project ? HttpResponse.json(project) : HttpResponse.json({ message: "Proyecto no encontrado." }, { status: 404 });
  }),
  http.post("*/api/Projects", async ({ request }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    if (!hasRole(user, "Cliente")) return forbidden();
    const input = (await request.json()) as Omit<BackendProjectDto, "projectId" | "createdAt" | "updatedAt" | "projectStatus">;
    if (input.clientId !== user.userId) return forbidden();
    if (!input.title || input.budget < 0 || new Date(input.deadlineDate) <= new Date()) {
      return HttpResponse.json({ code: "VALIDATION", message: "Verifica titulo, presupuesto y fecha limite." }, { status: 400 });
    }
    const now = new Date().toISOString();
    const project: BackendProjectDto = {
      ...input, projectId: Math.max(...db.projects.map((item) => item.projectId)) + 1, projectStatus: "Publicado",
      createdAt: now, updatedAt: now, assignedFreelancerId: null, startDate: null, completionDate: null,
    };
    db.projects.unshift(project);
    return HttpResponse.json(project, { status: 201 });
  }),
  http.put("*/api/Projects/:id", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const project = db.projects.find((item) => item.projectId === Number(params.id));
    if (!project) return HttpResponse.json({ message: "Proyecto no encontrado." }, { status: 404 });
    if (!hasRole(user, "Cliente") || project.clientId !== user.userId) return forbidden();
    Object.assign(project, (await request.json()) as Partial<BackendProjectDto>, { updatedAt: new Date().toISOString() });
    return HttpResponse.json(project);
  }),
  http.post("*/api/Projects/:id/start", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const project = db.projects.find((item) => item.projectId === Number(params.id));
    if (!project || project.clientId !== user.userId) return forbidden();
    if (project.projectStatus !== "Asignado") return HttpResponse.json({ message: "El proyecto no esta asignado." }, { status: 400 });
    project.projectStatus = "En Proceso";
    project.startDate = new Date().toISOString();
    db.activities.unshift({ activityId: Date.now(), projectId: project.projectId, userId: user.userId, activityType: "project_started", activityDescription: "El proyecto fue iniciado.", createdAt: new Date().toISOString() });
    return HttpResponse.json({ message: "Proyecto iniciado." });
  }),
  http.post("*/api/Projects/:id/complete", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const project = db.projects.find((item) => item.projectId === Number(params.id));
    if (!project || project.clientId !== user.userId) return forbidden();
    if (project.projectStatus !== "En Proceso") return HttpResponse.json({ message: "El proyecto no esta en proceso." }, { status: 400 });
    project.projectStatus = "Completado";
    project.completionDate = new Date().toISOString();
    db.activities.unshift({ activityId: Date.now(), projectId: project.projectId, userId: user.userId, activityType: "project_completed", activityDescription: "El proyecto fue completado.", createdAt: new Date().toISOString() });
    return HttpResponse.json({ message: "Proyecto completado." });
  }),
];
