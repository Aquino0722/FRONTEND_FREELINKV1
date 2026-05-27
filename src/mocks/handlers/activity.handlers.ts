import { http, HttpResponse } from "msw";

import { db } from "@/mocks/data/database";
import { authenticatedUser, forbidden, hasRole, mockDelay, unauthorized } from "@/mocks/utils";

function authorized(request: Request, projectId: number) {
  const user = authenticatedUser(request);
  const project = db.projects.find((item) => item.projectId === projectId);
  return user && project && (project.clientId === user.userId || project.assignedFreelancerId === user.userId || user.userType === "Administrador");
}

export const activityHandlers = [
  http.get("*/api/Projects/:id/activity", async ({ request, params }) => {
    await mockDelay();
    const id = Number(params.id);
    if (!authenticatedUser(request)) return unauthorized();
    if (!authorized(request, id)) return forbidden();
    return HttpResponse.json(db.activities.filter((item) => item.projectId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }),
  http.get("*/api/Projects/:id/deliverables", async ({ request, params }) => {
    await mockDelay();
    const id = Number(params.id);
    if (!authenticatedUser(request)) return unauthorized();
    if (!authorized(request, id)) return forbidden();
    return HttpResponse.json(db.deliverables.filter((item) => item.projectId === id));
  }),
  http.get("*/api/Projects/:id/deliverables/summary", async ({ request, params }) => {
    await mockDelay();
    const id = Number(params.id);
    if (!authenticatedUser(request)) return unauthorized();
    if (!authorized(request, id)) return forbidden();
    const items = db.deliverables.filter((item) => item.projectId === id);
    return HttpResponse.json({
      pending: items.filter((item) => item.deliverableStatus === "Pendiente").length,
      sent: items.filter((item) => item.deliverableStatus === "Enviado").length,
      inReview: items.filter((item) => item.deliverableStatus === "En revision").length,
      approved: items.filter((item) => item.deliverableStatus === "Aprobado").length,
      rejected: items.filter((item) => item.deliverableStatus === "Rechazado").length,
    });
  }),
  http.post("*/api/Projects/:id/deliverables", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const projectId = Number(params.id);
    const project = db.projects.find((item) => item.projectId === projectId);
    if (!project || !hasRole(user, "Freelancer") || project.assignedFreelancerId !== user.userId) return forbidden();
    const data = await request.formData();
    const title = String(data.get("title") ?? "");
    if (!title) return HttpResponse.json({ message: "El titulo del entregable es requerido." }, { status: 400 });
    const deliverable = {
      deliverableId: Math.max(...db.deliverables.map((item) => item.deliverableId)) + 1,
      projectId, title, description: String(data.get("description") ?? "") || null, deliverableStatus: "Enviado",
      submittedAt: new Date().toISOString(), reviewedAt: null, reviewComments: null,
      dueDate: String(data.get("dueDate") ?? "") || null, deliverablefiles: [],
    };
    db.deliverables.push(deliverable);
    db.activities.unshift({ activityId: Date.now(), projectId, userId: user.userId, activityType: "deliverable_sent", activityDescription: `Se envio ${title}.`, createdAt: new Date().toISOString() });
    return HttpResponse.json(deliverable);
  }),
  http.put("*/api/Projects/deliverables/:id/review", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const item = db.deliverables.find((deliverable) => deliverable.deliverableId === Number(params.id));
    const project = db.projects.find((entry) => entry.projectId === item?.projectId);
    if (!item || !project) return HttpResponse.json({ message: "Entregable no encontrado." }, { status: 404 });
    if (!hasRole(user, "Cliente") || project.clientId !== user.userId) return forbidden();
    const input = (await request.json()) as { decision: "approve" | "reject" | "review"; comments?: string };
    item.deliverableStatus = input.decision === "approve" ? "Aprobado" : input.decision === "reject" ? "Rechazado" : "En revision";
    item.reviewedAt = new Date().toISOString();
    item.reviewComments = input.comments ?? null;
    db.activities.unshift({ activityId: Date.now(), projectId: project.projectId, userId: user.userId, activityType: "deliverable_reviewed", activityDescription: `${item.title} marcado como ${item.deliverableStatus}.`, createdAt: new Date().toISOString() });
    return HttpResponse.json(item);
  }),
];
