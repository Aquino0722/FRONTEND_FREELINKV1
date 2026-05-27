export type UserRole = "Cliente" | "Freelancer" | "Administrador";

export type ProjectStatus =
  | "Publicado"
  | "Asignado"
  | "En Proceso"
  | "Completado"
  | "Cancelado";

export type ApplicationStatus = "Pendiente" | "Aceptada" | "Rechazada";

export type DeliverableStatus =
  | "Pendiente"
  | "Enviado"
  | "En revision"
  | "Aprobado"
  | "Rechazado";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
}

export interface UserProfile extends User {
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  balance: number;
  pendingBalance: number;
}

export interface FreelancerSkill {
  id: number;
  name: string;
  category: string | null;
  proficiencyLevel: string | null;
}

export interface WorkExperience {
  id: number;
  jobTitle: string;
  company: string | null;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  description: string | null;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string | null;
  projectUrl: string | null;
  thumbnailUrl: string | null;
  completionDate: Date | null;
}

export interface FreelancerProfile {
  id: number;
  userId: number;
  title: string | null;
  hourlyRate: number | null;
  yearsOfExperience: number | null;
  availabilityStatus: string | null;
  averageRating: number | null;
  totalReviews: number;
  skills: FreelancerSkill[];
  workExperiences: WorkExperience[];
  portfolioItems: PortfolioItem[];
}

export interface Project {
  id: number;
  clientId: number;
  title: string;
  description: string;
  budget: number;
  deadlineDate: Date;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedFreelancerId: number | null;
  startDate: Date | null;
  completionDate: Date | null;
  requiredSkills: string[];
}

export interface Application {
  id: number;
  projectId: number;
  freelancerId: number;
  coverLetter: string;
  proposedRate: number | null;
  estimatedDuration: number | null;
  status: ApplicationStatus;
  appliedAt: Date;
}

export interface ProjectActivity {
  id: number;
  projectId: number;
  userId: number | null;
  type: string;
  description: string | null;
  createdAt: Date;
}

export interface DeliverableFile {
  id: number;
  deliverableId: number;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  uploadedAt: Date;
}

export interface ProjectDeliverable {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  reviewComments: string | null;
  dueDate: Date | null;
  files: DeliverableFile[];
}

export interface DeliverableSummary {
  pending: number;
  sent: number;
  inReview: number;
  approved: number;
  rejected: number;
}

export interface Transaction {
  id: number;
  type: string;
  status: string;
  amount: number;
  fromUserId: number | null;
  toUserId: number | null;
  createdAt: Date;
  description: string | null;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: number;
}

export interface ProjectFilters {
  searchText?: string;
  skills?: string;
  ownerId?: number;
  assignedFreelancerId?: number;
}

export interface TransactionFilters {
  type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
