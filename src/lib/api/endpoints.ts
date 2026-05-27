export const endpoints = {
  auth: { login: "/Auth/login", register: "/Auth/register" },
  users: {
    byId: (id: number) => `/Users/${id}`,
    profile: (id: number) => `/Users/${id}/profile`,
  },
  freelancers: {
    profile: (id: number) => `/Freelancers/${id}/profile`,
    skills: "/Freelancers/skills",
    addSkill: (id: number) => `/Freelancers/${id}/skills`,
    experience: (id: number) => `/Freelancers/${id}/work-experience`,
    applications: (id: number) => `/freelancers/${id}/applications`,
  },
  projects: {
    root: "/Projects",
    byId: (id: number) => `/Projects/${id}`,
    applications: (id: number) => `/projects/${id}/applications`,
    activity: (id: number) => `/Projects/${id}/activity`,
    deliverables: (id: number) => `/Projects/${id}/deliverables`,
    summary: (id: number) => `/Projects/${id}/deliverables/summary`,
    start: (id: number) => `/Projects/${id}/start`,
    complete: (id: number) => `/Projects/${id}/complete`,
  },
  applications: {
    accept: (id: number) => `/applications/${id}/accept`,
    reject: (id: number) => `/applications/${id}/reject`,
  },
  payments: { transactions: "/Payments/transactions" },
} as const;
