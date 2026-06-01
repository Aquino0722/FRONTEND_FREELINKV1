import type {
  ApplicationStatus,
  DeliverableStatus,
  ProjectStatus,
  UserRole,
} from "@/types/common";

export interface BackendUserDto {
  userId: number;
  email: string;
  userType: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  message: string;
  token: string;
  user: BackendUserDto;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  city: string;
  userType: UserRole;
}

export interface RegisterResponse {
  success: true;
  message: string;
  data: { userId: number; email: string; userType: string };
}

export interface BackendUserProfileDto extends BackendUserDto {
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  balance: number;
  pendingBalance: number;
  companyName?: string | null;
  industry?: string | null;
  companySize?: string | null;
  website?: string | null;
  linkedIn?: string | null;
}

export interface CertificationDto {
  certificationId: number;
  name: string;
  institution: string;
  issueDate: string;
  pdfUrl: string | null;
  pdfName: string | null;
}

export interface BackendFreelancerProfileDto {
  freelancerProfileId: number;
  userId: number;
  title: string | null;
  hourlyRate: number | null;
  yearsOfExperience: number | null;
  availabilityStatus: string | null;
  averageRating: number | null;
  totalReviews: number | null;
  skills: FreelancerSkillDto[];
  workExperiences: WorkExperienceDto[];
  portfolioItems: PortfolioItemDto[];
  weeklyAvailability?: number | null;
  workMode?: string | null;
  resumeUrl?: string | null;
  resumeName?: string | null;
  certifications?: CertificationDto[];
}

export interface FreelancerSkillDto {
  skillId: number;
  skillName: string;
  category: string | null;
  proficiencyLevel: string | null;
}

export interface SkillDto {
  skillId: number;
  skillName: string;
  category: string | null;
}

export interface WorkExperienceDto {
  experienceId: number;
  jobTitle: string;
  company: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean | null;
  description: string | null;
}

export interface WorkExperienceRequest {
  jobTitle: string;
  company?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
}

export interface PortfolioItemDto {
  portfolioId: number;
  title: string;
  description: string | null;
  projectUrl: string | null;
  thumbnailUrl: string | null;
  completionDate: string | null;
  files: PortfolioFileDto[];
  technologies?: string[];
}


export interface PortfolioFileDto {
  fileId: number;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
}

export interface BackendProjectDto {
  projectId: number;
  clientId: number;
  title: string;
  description: string;
  budget: number;
  deadlineDate: string;
  projectStatus: ProjectStatus | null;
  createdAt: string;
  updatedAt: string;
  assignedFreelancerId: number | null;
  startDate: string | null;
  completionDate: string | null;
  requiredSkills?: string | null;
}

export interface ApplicationDto {
  applicationId: number;
  projectId: number;
  freelancerId: number;
  coverLetter: string;
  proposedRate: number | null;
  estimatedDuration: number | null;
  applicationStatus: ApplicationStatus;
  appliedAt: string;
  projectTitle?: string;
  freelancerName?: string;
  respondedAt?: string | null;
}

export interface ProjectActivityDto {
  activityId: number;
  projectId: number;
  userId: number | null;
  activityType: string;
  activityDescription: string | null;
  createdAt: string;
}

export interface ProjectDeliverableDto {
  deliverableId: number;
  projectId: number;
  title: string;
  description: string | null;
  deliverableStatus: DeliverableStatus | string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewComments: string | null;
  dueDate: string | null;
  deliverablefiles?: DeliverableFileDto[];
}

export interface DeliverableFileDto {
  fileId: number;
  deliverableId: number;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  uploadedAt: string;
}

export interface ProjectMessageDto {
  messageId: number;
  projectId: number;
  senderId: number;
  senderName: string | null;
  content: string | null;
  createdAt: string;
  readAt: string | null;
  attachments?: ProjectMessageAttachmentDto[];
}

export interface ProjectMessageAttachmentDto {
  attachmentId: number;
  messageId: number;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  uploadedAt: string;
}

export interface DeliverableStatusSummaryDto {
  pending: number;
  sent: number;
  inReview: number;
  approved: number;
  rejected: number;
}

export interface TransactionDto {
  transactionId: number;
  transactionType: string;
  transactionStatus: string;
  amount: number;
  fromUserId: number | null;
  toUserId: number | null;
  escrowId: number | null;
  createdAt: string;
  completedAt: string | null;
  receiptUrl: string | null;
  description: string | null;
}

export interface PaginatedTransactionsResponse {
  total: number;
  page: number;
  pageSize: number;
  items: TransactionDto[];
}

export interface MutationResponse {
  success: boolean;
  message: string;
  userId?: number | null;
}

export interface ApiFailureResponse {
  success: false;
  message: string;
}
