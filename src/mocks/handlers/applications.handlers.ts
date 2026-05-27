import { http, HttpResponse } from "msw";

import { db } from "@/mocks/data/database";
import { authenticatedUser, forbidden, hasRole, mockDelay, unauthorized } from "@/mocks/utils";
import type { ApplicationDto } from "@/types/api";

export const applicationsHandlers = [
  http.post("*/api/projects/:projectId/applications", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    if (!hasRole(user, "Freelancer")) return forbidden();
    const projectId = Number(params.projectId);
    const project = db.projects.find((item) => item.projectId === projectId);
    if (!project) return HttpResponse.json({ message: "Proyecto no encontrado." }, { status: 404 });
    if (project.projectStatus !== "Publicado") return HttpResponse.json({ message: "Este proyecto ya no recibe postulaciones." }, { status: 400 });
    if (db.applications.some((item) => item.projectId === projectId && item.freelancerId === user.userId)) {
      return HttpResponse.json({ code: "DUPLICATE_APPLICATION", message: "Ya te postulaste a este proyecto." }, { status: 409 });
    }
    const input = (await request.json()) as Pick<ApplicationDto, "freelancerId" | "coverLetter" | "proposedRate" | "estimatedDuration">;
    if (input.freelancerId !== user.userId) return forbidden();
    const application: ApplicationDto = { ...input, applicationId: Math.max(...db.applications.map((item) => item.applicationId)) + 1, projectId, applicationStatus: "Pendiente", appliedAt: new Date().toISOString() };
    db.applications.unshift(application);
    return HttpResponse.json(application);
  }),
  http.get("*/api/projects/:projectId/applications", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const project = db.projects.find((item) => item.projectId === Number(params.projectId));
    if (!project || (!hasRole(user, "Administrador") && project.clientId !== user.userId)) return forbidden();
    return HttpResponse.json(db.applications.filter((item) => item.projectId === project.projectId));
  }),
  http.get("*/api/freelancers/:id/applications", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const id = Number(params.id);
    if (user.userId !== id && !hasRole(user, "Administrador")) return forbidden();
    return HttpResponse.json(db.applications.filter((item) => item.freelancerId === id));
  }),
  http.post("*/api/applications/:id/accept", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const selected = db.applications.find((item) => item.applicationId === Number(params.id));
    const project = db.projects.find((item) => item.projectId === selected?.projectId);
    if (!selected || !project) return HttpResponse.json({ message: "Postulacion no encontrada." }, { status: 404 });
    if (!hasRole(user, "Cliente") || project.clientId !== user.userId) return forbidden();
    selected.applicationStatus = "Aceptada";
    db.applications.filter((item) => item.projectId === project.projectId && item.applicationId !== selected.applicationId).forEach((item) => { item.applicationStatus = "Rechazada"; });
    project.projectStatus = "Asignado";
    project.assignedFreelancerId = selected.freelancerId;
    return HttpResponse.json({ message: "Postulacion aceptada." });
  }),
  http.post("*/api/applications/:id/reject", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const application = db.applications.find((item) => item.applicationId === Number(params.id));
    const project = db.projects.find((item) => item.projectId === application?.projectId);
    if (!application || !project) return HttpResponse.json({ message: "Postulacion no encontrada." }, { status: 404 });
    if (!hasRole(user, "Cliente") || project.clientId !== user.userId) return forbidden();
    application.applicationStatus = "Rechazada";
    return HttpResponse.json({ message: "Postulacion rechazada." });
  }),
];
