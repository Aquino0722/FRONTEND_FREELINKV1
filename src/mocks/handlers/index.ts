import { activityHandlers } from "@/mocks/handlers/activity.handlers";
import { applicationsHandlers } from "@/mocks/handlers/applications.handlers";
import { authHandlers } from "@/mocks/handlers/auth.handlers";
import { freelancersHandlers } from "@/mocks/handlers/freelancers.handlers";
import { paymentsHandlers } from "@/mocks/handlers/payments.handlers";
import { projectsHandlers } from "@/mocks/handlers/projects.handlers";
import { usersHandlers } from "@/mocks/handlers/users.handlers";

export const handlers = [
  ...authHandlers,
  ...usersHandlers,
  ...freelancersHandlers,
  ...projectsHandlers,
  ...applicationsHandlers,
  ...activityHandlers,
  ...paymentsHandlers,
];
