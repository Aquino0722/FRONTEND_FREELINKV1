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
    const files = data.getAll("files").filter((entry): entry is File => entry instanceof File);
    if (!title) return HttpResponse.json({ message: "El titulo del entregable es requerido." }, { status: 400 });
    const deliverableId = Math.max(...db.deliverables.map((item) => item.deliverableId)) + 1;
    const deliverable = {
      deliverableId,
      projectId, title, description: String(data.get("description") ?? "") || null, deliverableStatus: "Enviado",
      submittedAt: new Date().toISOString(), reviewedAt: null, reviewComments: null,
      dueDate: String(data.get("dueDate") ?? "") || null,
      deliverablefiles: files.map((file, index) => ({
        fileId: Date.now() + index,
        deliverableId,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type || null,
        fileSize: file.size || null,
        uploadedAt: new Date().toISOString(),
      })),
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
  http.get("*/api/Projects/:id/messages", async ({ request, params }) => {
    await mockDelay();
    const id = Number(params.id);
    if (!authenticatedUser(request)) return unauthorized();
    if (!authorized(request, id)) return forbidden();
    return HttpResponse.json(db.messages.filter((item) => item.projectId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
  }),
  http.post("*/api/Projects/:id/messages", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const projectId = Number(params.id);
    if (!authorized(request, projectId)) return forbidden();
    const data = await request.formData();
    const content = String(data.get("MessageText") ?? data.get("content") ?? "").trim();
    const files = data.getAll("files").filter((entry): entry is File => entry instanceof File);
    if (!content && files.length === 0) return HttpResponse.json({ message: "Escribe un mensaje o adjunta un archivo." }, { status: 400 });
    const now = new Date().toISOString();
    const messageId = Math.max(0, ...db.messages.map((item) => item.messageId)) + 1;
    const profile = db.users.find((item) => item.userId === user.userId);
    const message = {
      messageId,
      projectId,
      senderId: user.userId,
      senderName: profile ? `${profile.firstName} ${profile.lastName}` : user.email,
      content: content || null,
      createdAt: now,
      readAt: null,
      attachments: files.map((file, index) => ({
        attachmentId: Date.now() + index,
        messageId,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type || null,
        fileSize: file.size || null,
        uploadedAt: now,
      })),
    };
    db.messages.push(message);
    db.activities.unshift({ activityId: Date.now(), projectId, userId: user.userId, activityType: "message_sent", activityDescription: "Nuevo mensaje en el workspace.", createdAt: now });
    return HttpResponse.json(message);
  }),
  http.put("*/api/Projects/messages/:id/read", async ({ request, params }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const message = db.messages.find((item) => item.messageId === Number(params.id));
    if (!message) return HttpResponse.json({ message: "Mensaje no encontrado." }, { status: 404 });
    if (!authorized(request, message.projectId)) return forbidden();
    if (message.senderId !== user.userId) message.readAt = new Date().toISOString();
    return HttpResponse.json({ success: true, message: "Mensaje marcado como leido." });
  }),
];
