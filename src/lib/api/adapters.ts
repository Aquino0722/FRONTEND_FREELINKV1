import { normalizeUserRole } from "@/lib/auth/role-normalizer";
import type {
  ApplicationDto,
  BackendFreelancerProfileDto,
  BackendProjectDto,
  BackendUserDto,
  BackendUserProfileDto,
  DeliverableStatusSummaryDto,
  PaginatedTransactionsResponse,
  ProjectActivityDto,
  ProjectDeliverableDto,
} from "@/types/api";
import type {
  Application,
  AuthSession,
  FreelancerProfile,
  Paginated,
  Project,
  ProjectActivity,
  ProjectDeliverable,
  Transaction,
  User,
  UserProfile,
} from "@/types/common";

export function adaptUser(dto: BackendUserDto): User {
  return {
    id: dto.userId,
    email: dto.email,
    role: normalizeUserRole(dto.userType),
    isActive: dto.isActive,
    isVerified: dto.isVerified,
    createdAt: new Date(dto.createdAt),
  };
}

export function adaptSession(token: string, dto: BackendUserDto): AuthSession {
  const payload = JSON.parse(atob(token.split(".")[1])) as { exp: number };
  return { token, user: adaptUser(dto), expiresAt: payload.exp * 1000 };
}

export function adaptUserProfile(dto: BackendUserProfileDto): UserProfile {
  return { ...adaptUser(dto), ...dto, id: dto.userId, role: normalizeUserRole(dto.userType), createdAt: new Date(dto.createdAt) };
}

export function adaptFreelancerProfile(dto: BackendFreelancerProfileDto): FreelancerProfile {
  return {
    id: dto.freelancerProfileId,
    userId: dto.userId,
    title: dto.title,
    hourlyRate: dto.hourlyRate,
    yearsOfExperience: dto.yearsOfExperience,
    availabilityStatus: dto.availabilityStatus,
    averageRating: dto.averageRating,
    totalReviews: dto.totalReviews ?? 0,
    skills: dto.skills.map((skill) => ({
      id: skill.skillId,
      name: skill.skillName,
      category: skill.category,
      proficiencyLevel: skill.proficiencyLevel,
    })),
    workExperiences: dto.workExperiences.map((item) => ({
      id: item.experienceId,
      jobTitle: item.jobTitle,
      company: item.company,
      startDate: new Date(item.startDate),
      endDate: item.endDate ? new Date(item.endDate) : null,
      isCurrent: Boolean(item.isCurrent),
      description: item.description,
    })),
    portfolioItems: dto.portfolioItems.map((item) => ({
      id: item.portfolioId,
      title: item.title,
      description: item.description,
      projectUrl: item.projectUrl,
      thumbnailUrl: item.thumbnailUrl,
      completionDate: item.completionDate ? new Date(item.completionDate) : null,
    })),
  };
}

export function adaptProject(dto: BackendProjectDto): Project {
  return {
    id: dto.projectId,
    clientId: dto.clientId,
    title: dto.title,
    description: dto.description,
    budget: dto.budget,
    deadlineDate: new Date(dto.deadlineDate),
    status: dto.projectStatus ?? "Publicado",
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
    assignedFreelancerId: dto.assignedFreelancerId,
    startDate: dto.startDate ? new Date(dto.startDate) : null,
    completionDate: dto.completionDate ? new Date(dto.completionDate) : null,
    requiredSkills: dto.requiredSkills?.split(",").map((skill) => skill.trim()).filter(Boolean) ?? [],
  };
}

export function adaptApplication(dto: ApplicationDto): Application {
  return {
    id: dto.applicationId,
    projectId: dto.projectId,
    freelancerId: dto.freelancerId,
    coverLetter: dto.coverLetter,
    proposedRate: dto.proposedRate,
    estimatedDuration: dto.estimatedDuration,
    status: dto.applicationStatus,
    appliedAt: new Date(dto.appliedAt),
  };
}

export function adaptActivity(dto: ProjectActivityDto): ProjectActivity {
  return {
    id: dto.activityId,
    projectId: dto.projectId,
    userId: dto.userId,
    type: dto.activityType,
    description: dto.activityDescription,
    createdAt: new Date(dto.createdAt),
  };
}

export function adaptDeliverable(dto: ProjectDeliverableDto): ProjectDeliverable {
  const allowed = ["Pendiente", "Enviado", "En revision", "Aprobado", "Rechazado"];
  return {
    id: dto.deliverableId,
    projectId: dto.projectId,
    title: dto.title,
    description: dto.description,
    status: allowed.includes(dto.deliverableStatus ?? "") ? (dto.deliverableStatus as ProjectDeliverable["status"]) : "Pendiente",
    submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : null,
    reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : null,
    reviewComments: dto.reviewComments,
    dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    files: (dto.deliverablefiles ?? []).map((file) => ({
      id: file.fileId,
      deliverableId: file.deliverableId,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      fileType: file.fileType,
      fileSize: file.fileSize,
      uploadedAt: new Date(file.uploadedAt),
    })),
  };
}

export function adaptSummary(dto: DeliverableStatusSummaryDto) {
  return dto;
}

export function adaptTransactions(dto: PaginatedTransactionsResponse): Paginated<Transaction> {
  return {
    total: dto.total,
    page: dto.page,
    pageSize: dto.pageSize,
    items: dto.items.map((item) => ({
      id: item.transactionId,
      type: item.transactionType,
      status: item.transactionStatus,
      amount: item.amount,
      fromUserId: item.fromUserId,
      toUserId: item.toUserId,
      createdAt: new Date(item.createdAt),
      description: item.description,
    })),
  };
}
