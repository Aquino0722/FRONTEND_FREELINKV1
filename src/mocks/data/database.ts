import type {
  ApplicationDto,
  BackendFreelancerProfileDto,
  BackendProjectDto,
  BackendUserProfileDto,
  ProjectActivityDto,
  ProjectDeliverableDto,
  ProjectMessageDto,
  SkillDto,
  TransactionDto,
} from "@/types/api";

export interface MockUser extends BackendUserProfileDto {
  password: string;
}

export interface MockDatabase {
  users: MockUser[];
  freelancers: BackendFreelancerProfileDto[];
  skills: SkillDto[];
  projects: BackendProjectDto[];
  applications: ApplicationDto[];
  activities: ProjectActivityDto[];
  deliverables: ProjectDeliverableDto[];
  messages: ProjectMessageDto[];
  transactions: TransactionDto[];
}

const createdAt = "2026-02-01T14:00:00.000Z";

function createDatabase(): MockDatabase {
  const users: MockUser[] = [
    {
      userId: 1, email: "cliente@freelink.dev", password: "Demo123!", userType: "Cliente", isActive: true, isVerified: true, createdAt,
      firstName: "Valentina", lastName: "Rojas", phoneNumber: "+57 310 555 0188", country: "Colombia", city: "Bogota",
      bio: "Lider de producto en una empresa de retail digital.", profilePictureUrl: null, balance: 8400, pendingBalance: 1800,
    },
    {
      userId: 2, email: "freelancer@freelink.dev", password: "Demo123!", userType: "Freelancer", isActive: true, isVerified: true, createdAt,
      firstName: "Mateo", lastName: "Sanchez", phoneNumber: "+57 301 555 0224", country: "Colombia", city: "Medellin",
      bio: "Product engineer especializado en Next.js, design systems y plataformas SaaS.", profilePictureUrl: null, balance: 12600, pendingBalance: 2400,
    },
    {
      userId: 3, email: "admin@freelink.dev", password: "Demo123!", userType: "Administrador", isActive: true, isVerified: true, createdAt,
      firstName: "Camila", lastName: "Torres", phoneNumber: null, country: "Colombia", city: "Bogota",
      bio: "Operations lead de FreeLink.", profilePictureUrl: null, balance: 0, pendingBalance: 0,
    },
    {
      userId: 4, email: "design@studio.co", password: "Demo123!", userType: "Freelancer", isActive: true, isVerified: true, createdAt,
      firstName: "Laura", lastName: "Gil", phoneNumber: null, country: "Mexico", city: "CDMX", bio: null, profilePictureUrl: null, balance: 5300, pendingBalance: 0,
    },
  ];
  const skills: SkillDto[] = [
    { skillId: 1, skillName: "React", category: "Desarrollo web" },
    { skillId: 2, skillName: "Next.js", category: "Desarrollo web" },
    { skillId: 3, skillName: "TypeScript", category: "Desarrollo web" },
    { skillId: 4, skillName: "Figma", category: "Diseno UX/UI" },
    { skillId: 5, skillName: ".NET", category: "Backend" },
    { skillId: 6, skillName: "Python", category: "Automatizacion" },
    { skillId: 7, skillName: "Power BI", category: "Data analytics" },
    { skillId: 8, skillName: "Shopify", category: "E-commerce" },
    { skillId: 9, skillName: "SEO", category: "Marketing digital" },
    { skillId: 10, skillName: "AWS", category: "Cloud" },
  ];
  const projects: BackendProjectDto[] = [
    { projectId: 101, clientId: 1, title: "Redisenar checkout para tienda de moda", description: "Optimizar el flujo de compra mobile, reducir abandono e implementar un checkout accesible en Next.js.", budget: 4200, deadlineDate: "2026-07-18", projectStatus: "En Proceso", createdAt: "2026-04-10T10:00:00Z", updatedAt: "2026-05-25T13:30:00Z", assignedFreelancerId: 2, startDate: "2026-05-01T09:00:00Z", completionDate: null, requiredSkills: "Next.js, TypeScript, Figma" },
    { projectId: 102, clientId: 1, title: "Dashboard de inventario omnicanal", description: "Construir panel de analitica para inventario, alertas de reposicion y exportacion de reportes.", budget: 6800, deadlineDate: "2026-08-28", projectStatus: "Publicado", createdAt: "2026-05-18T09:00:00Z", updatedAt: "2026-05-18T09:00:00Z", assignedFreelancerId: null, startDate: null, completionDate: null, requiredSkills: "React, Power BI, SQL" },
    { projectId: 103, clientId: 1, title: "Automatizacion de conciliacion financiera", description: "Automatizar importacion de extractos y conciliacion diaria con trazabilidad para operaciones.", budget: 5100, deadlineDate: "2026-07-30", projectStatus: "Asignado", createdAt: "2026-05-03T12:00:00Z", updatedAt: "2026-05-24T12:00:00Z", assignedFreelancerId: 4, startDate: null, completionDate: null, requiredSkills: "Python, SQL, AWS" },
    { projectId: 104, clientId: 5, title: "Portal B2B de pedidos recurrentes", description: "Experiencia web para distribuidores con catalogo personalizado y pedidos recurrentes.", budget: 7600, deadlineDate: "2026-09-12", projectStatus: "Publicado", createdAt: "2026-05-20T10:00:00Z", updatedAt: "2026-05-20T10:00:00Z", assignedFreelancerId: null, startDate: null, completionDate: null, requiredSkills: "Next.js, TypeScript, AWS" },
    { projectId: 105, clientId: 6, title: "Sistema visual para fintech emergente", description: "Crear biblioteca UI, tokens y prototipos de onboarding para una app financiera regional.", budget: 3900, deadlineDate: "2026-07-25", projectStatus: "Publicado", createdAt: "2026-05-21T10:00:00Z", updatedAt: "2026-05-21T10:00:00Z", assignedFreelancerId: null, startDate: null, completionDate: null, requiredSkills: "Figma, React" },
    { projectId: 106, clientId: 7, title: "Migracion de catalogo a Shopify Plus", description: "Migrar 2500 productos, configurar mercados internacionales y mejorar SEO tecnico.", budget: 5800, deadlineDate: "2026-08-04", projectStatus: "Publicado", createdAt: "2026-05-17T10:00:00Z", updatedAt: "2026-05-17T10:00:00Z", assignedFreelancerId: null, startDate: null, completionDate: null, requiredSkills: "Shopify, SEO" },
    { projectId: 107, clientId: 8, title: "API de reservas para hospitality", description: "Desarrollar servicios seguros para disponibilidad, reservas y conciliacion de pagos.", budget: 9200, deadlineDate: "2026-09-22", projectStatus: "Publicado", createdAt: "2026-05-15T10:00:00Z", updatedAt: "2026-05-15T10:00:00Z", assignedFreelancerId: null, startDate: null, completionDate: null, requiredSkills: ".NET, AWS, SQL" },
    { projectId: 108, clientId: 9, title: "Modelo de forecasting comercial", description: "Preparar pipeline de datos y tablero ejecutivo con proyeccion mensual de demanda.", budget: 4700, deadlineDate: "2026-08-10", projectStatus: "Publicado", createdAt: "2026-05-12T10:00:00Z", updatedAt: "2026-05-12T10:00:00Z", assignedFreelancerId: null, startDate: null, completionDate: null, requiredSkills: "Python, Power BI, SQL" },
    { projectId: 109, clientId: 10, title: "Aplicacion movil para agenda medica", description: "Construir experiencia de reserva y recordatorios para pacientes de una red de clinicas.", budget: 8500, deadlineDate: "2026-10-02", projectStatus: "Publicado", createdAt: "2026-05-09T10:00:00Z", updatedAt: "2026-05-09T10:00:00Z", assignedFreelancerId: null, startDate: null, completionDate: null, requiredSkills: "React, TypeScript" },
    { projectId: 110, clientId: 11, title: "Landing de lanzamiento para plataforma HR", description: "Landing optimizada para conversion con CMS y medicion de experimentos de adquisicion.", budget: 2600, deadlineDate: "2026-06-28", projectStatus: "Publicado", createdAt: "2026-05-23T10:00:00Z", updatedAt: "2026-05-23T10:00:00Z", assignedFreelancerId: null, startDate: null, completionDate: null, requiredSkills: "Next.js, SEO, Figma" },
    { projectId: 111, clientId: 12, title: "Integracion ERP para e-commerce", description: "Sincronizar ordenes, stock y facturacion entre tienda online y sistema administrativo.", budget: 7100, deadlineDate: "2026-09-01", projectStatus: "Publicado", createdAt: "2026-05-11T10:00:00Z", updatedAt: "2026-05-11T10:00:00Z", assignedFreelancerId: null, startDate: null, completionDate: null, requiredSkills: ".NET, Shopify, SQL" },
  ];
  const applications: ApplicationDto[] = [
    { applicationId: 201, projectId: 102, freelancerId: 2, coverLetter: "Puedo estructurar el dashboard con componentes escalables y visualizaciones accionables para operaciones.", proposedRate: 6100, estimatedDuration: 30, applicationStatus: "Pendiente", appliedAt: "2026-05-24T13:00:00Z" },
    { applicationId: 202, projectId: 102, freelancerId: 4, coverLetter: "He trabajado en tableros de retail y propongo validar la jerarquia visual antes de desarrollo.", proposedRate: 6400, estimatedDuration: 27, applicationStatus: "Pendiente", appliedAt: "2026-05-25T11:00:00Z" },
    { applicationId: 203, projectId: 101, freelancerId: 2, coverLetter: "Implementare el checkout con accesibilidad, observabilidad y una entrega incremental.", proposedRate: 4200, estimatedDuration: 35, applicationStatus: "Aceptada", appliedAt: "2026-04-18T12:00:00Z" },
    { applicationId: 204, projectId: 104, freelancerId: 2, coverLetter: "Mi experiencia en portales B2B permite acelerar catalogos y pedidos recurrentes robustos.", proposedRate: 7350, estimatedDuration: 42, applicationStatus: "Pendiente", appliedAt: "2026-05-26T10:00:00Z" },
    { applicationId: 205, projectId: 110, freelancerId: 2, coverLetter: "Puedo entregar una landing veloz y medible con SEO tecnico desde el primer release.", proposedRate: 2500, estimatedDuration: 14, applicationStatus: "Pendiente", appliedAt: "2026-05-25T16:00:00Z" },
  ];
  const activities: ProjectActivityDto[] = [
    { activityId: 301, projectId: 101, userId: 1, activityType: "project_created", activityDescription: "Valentina publico el proyecto.", createdAt: "2026-04-10T10:00:00Z" },
    { activityId: 302, projectId: 101, userId: 2, activityType: "application_accepted", activityDescription: "Mateo fue seleccionado para el proyecto.", createdAt: "2026-04-24T10:00:00Z" },
    { activityId: 303, projectId: 101, userId: 1, activityType: "project_started", activityDescription: "El trabajo comenzo oficialmente.", createdAt: "2026-05-01T09:00:00Z" },
    { activityId: 304, projectId: 101, userId: 2, activityType: "deliverable_sent", activityDescription: "Se envio auditoria del checkout actual.", createdAt: "2026-05-09T12:00:00Z" },
    { activityId: 305, projectId: 101, userId: 1, activityType: "deliverable_approved", activityDescription: "Auditoria aprobada con comentarios positivos.", createdAt: "2026-05-10T15:00:00Z" },
    { activityId: 306, projectId: 101, userId: 2, activityType: "deliverable_sent", activityDescription: "Se entregaron wireframes mobile.", createdAt: "2026-05-18T12:00:00Z" },
    { activityId: 307, projectId: 101, userId: 1, activityType: "review", activityDescription: "Wireframes en revision por producto.", createdAt: "2026-05-20T10:00:00Z" },
    { activityId: 308, projectId: 101, userId: 2, activityType: "progress", activityDescription: "Implementacion frontend alcanzo 62%.", createdAt: "2026-05-25T11:00:00Z" },
    { activityId: 309, projectId: 102, userId: 1, activityType: "project_created", activityDescription: "Se abrio la busqueda de especialista.", createdAt: "2026-05-18T09:00:00Z" },
    { activityId: 310, projectId: 102, userId: 2, activityType: "application_received", activityDescription: "Nueva postulacion recibida.", createdAt: "2026-05-24T13:00:00Z" },
    { activityId: 311, projectId: 102, userId: 4, activityType: "application_received", activityDescription: "Nueva postulacion recibida.", createdAt: "2026-05-25T11:00:00Z" },
  ];
  const deliverables: ProjectDeliverableDto[] = [
    { deliverableId: 401, projectId: 101, title: "Auditoria UX y performance", description: "Hallazgos priorizados y baseline.", deliverableStatus: "Aprobado", submittedAt: "2026-05-09T12:00:00Z", reviewedAt: "2026-05-10T15:00:00Z", reviewComments: "Excelente priorizacion.", dueDate: "2026-05-10", deliverablefiles: [{ fileId: 901, deliverableId: 401, fileName: "auditoria-checkout.pdf", fileUrl: "/mock-files/auditoria-checkout.pdf", fileType: "application/pdf", fileSize: 1240000, uploadedAt: "2026-05-09T12:00:00Z" }] },
    { deliverableId: 402, projectId: 101, title: "Wireframes mobile checkout", description: "Flujos para invitado y cliente recurrente.", deliverableStatus: "En revision", submittedAt: "2026-05-18T12:00:00Z", reviewedAt: null, reviewComments: null, dueDate: "2026-05-20", deliverablefiles: [{ fileId: 902, deliverableId: 402, fileName: "wireframes-mobile.fig", fileUrl: "/mock-files/wireframes-mobile.fig", fileType: "application/octet-stream", fileSize: 3820000, uploadedAt: "2026-05-18T12:00:00Z" }] },
    { deliverableId: 403, projectId: 101, title: "Implementacion y QA final", description: "Componentes, pruebas y metricas.", deliverableStatus: "Pendiente", submittedAt: null, reviewedAt: null, reviewComments: null, dueDate: "2026-06-18", deliverablefiles: [] },
  ];
  const messages: ProjectMessageDto[] = [
    { messageId: 801, projectId: 101, senderId: 1, senderName: "Valentina Rojas", content: "Mateo, prioricemos checkout invitado esta semana.", createdAt: "2026-05-24T14:20:00Z", readAt: "2026-05-24T14:45:00Z", attachments: [] },
    { messageId: 802, projectId: 101, senderId: 2, senderName: "Mateo Sanchez", content: "Perfecto. Dejo adjunto el plan de QA para validar estados de pago.", createdAt: "2026-05-24T15:05:00Z", readAt: null, attachments: [{ attachmentId: 851, messageId: 802, fileName: "qa-checkout-plan.pdf", fileUrl: "/mock-files/qa-checkout-plan.pdf", fileType: "application/pdf", fileSize: 540000, uploadedAt: "2026-05-24T15:05:00Z" }] },
  ];
  const transactions: TransactionDto[] = Array.from({ length: 8 }, (_, index) => ({
    transactionId: 501 + index, transactionType: index % 2 ? "EscrowRelease" : "Deposit", transactionStatus: index < 2 ? "Pendiente" : "Completada",
    amount: 450 + index * 180, fromUserId: 1, toUserId: index % 2 ? 2 : null, escrowId: 701, createdAt: `2026-05-${String(10 + index).padStart(2, "0")}T10:00:00Z`,
    completedAt: index < 2 ? null : `2026-05-${String(11 + index).padStart(2, "0")}T10:00:00Z`, receiptUrl: null, description: "Movimiento asociado al proyecto de checkout.",
  }));
  const freelancers: BackendFreelancerProfileDto[] = [{
    freelancerProfileId: 20, userId: 2, title: "Senior Frontend & Product Engineer", hourlyRate: 68, yearsOfExperience: 7, availabilityStatus: "Disponible", averageRating: 4.9, totalReviews: 32,
    skills: [{ skillId: 1, skillName: "React", category: "Desarrollo web", proficiencyLevel: "Experto" }, { skillId: 2, skillName: "Next.js", category: "Desarrollo web", proficiencyLevel: "Experto" }, { skillId: 3, skillName: "TypeScript", category: "Desarrollo web", proficiencyLevel: "Avanzado" }],
    workExperiences: [{ experienceId: 1, jobTitle: "Senior Product Engineer", company: "Northstar Commerce", startDate: "2022-01-01", endDate: null, isCurrent: true, description: "Liderazgo de frontend y design system." }, { experienceId: 2, jobTitle: "Frontend Developer", company: "Orbit Labs", startDate: "2019-02-01", endDate: "2021-12-15", isCurrent: false, description: "Aplicaciones B2B." }],
    portfolioItems: [{ portfolioId: 1, title: "Commerce analytics suite", description: "Dashboard de performance comercial.", projectUrl: "https://example.com", thumbnailUrl: null, completionDate: "2025-11-10", files: [] }, { portfolioId: 2, title: "Banking onboarding", description: "Flujo KYC accesible.", projectUrl: null, thumbnailUrl: null, completionDate: "2025-07-01", files: [] }],
  }];
  return { users, freelancers, skills, projects, applications, activities, deliverables, messages, transactions };
}

export let db = createDatabase();

export function resetDatabase() {
  db = createDatabase();
}
