import { http, HttpResponse } from "msw";

import { normalizeUserRole } from "@/lib/auth/role-normalizer";
import { db } from "@/mocks/data/database";
import { authenticatedUser, errorScenario, forbidden, hasRole, mockDelay, unauthorized } from "@/mocks/utils";

interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  country?: string | null;
  city?: string | null;
  bio?: string | null;
  profilePicture?: string | null;
  profilePictureUrl?: string | null;
  isActive?: boolean;
}

export const usersHandlers = [
  http.get("*/api/Users/:id/profile", async ({ request, params }) => {
    await mockDelay();
    if (errorScenario()) return HttpResponse.json({ message: "No fue posible cargar el perfil." }, { status: 500 });
    const session = authenticatedUser(request);
    if (!session) return unauthorized();
    const id = Number(params.id);
    if (session.userId !== id && !hasRole(session, "Administrador")) return forbidden();
    const profile = db.users.find((user) => user.userId === id);
    if (!profile) return HttpResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    return HttpResponse.json({ success: true, message: "Perfil encontrado.", profile: {
      userId: profile.userId, email: profile.email, userType: profile.userType, isActive: profile.isActive,
      isVerified: profile.isVerified, createdAt: profile.createdAt, firstName: profile.firstName,
      lastName: profile.lastName, phoneNumber: profile.phoneNumber, country: profile.country,
      city: profile.city, bio: profile.bio, profilePictureUrl: profile.profilePictureUrl,
      balance: profile.balance, pendingBalance: profile.pendingBalance,
      companyName: profile.companyName, industry: profile.industry, companySize: profile.companySize,
      website: profile.website, linkedIn: profile.linkedIn,
    } });
  }),
  http.get("*/api/Users/:id", async ({ request, params }) => {
    await mockDelay();
    const session = authenticatedUser(request);
    if (!session) return unauthorized();
    const id = Number(params.id);
    if (session.userId !== id && !hasRole(session, "Administrador")) return forbidden();
    const user = db.users.find((item) => item.userId === id);
    if (!user) return HttpResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    return HttpResponse.json({ success: true, message: "Usuario encontrado.", user });
  }),

  http.put("*/api/Users/:id", async ({ request, params }) => {
    await mockDelay();
    const session = authenticatedUser(request);
    if (!session) return unauthorized();
    const id = Number(params.id);
    if (session.userId !== id && !hasRole(session, "Administrador")) return forbidden();
    const input = (await request.json()) as UpdateUserPayload;
    const user = db.users.find((item) => item.userId === id);
    if (!user) return HttpResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    
    if (input.profilePicture !== undefined && input.profilePicture !== null) {
      user.profilePictureUrl = input.profilePicture;
    }
    
    Object.assign(user, input);
    return HttpResponse.json({ success: true, message: "Perfil actualizado.", userId: id });
  }),
  http.get("*/api/Admin/users", async ({ request }) => {
    await mockDelay();
    const session = authenticatedUser(request);
    if (!session) return unauthorized();
    if (!hasRole(session, "Administrador")) return forbidden();
    return HttpResponse.json(db.users.map((user) => ({
      userId: user.userId, email: user.email, userType: normalizeUserRole(user.userType), isActive: user.isActive,
      isVerified: user.isVerified, createdAt: user.createdAt,
    })));
  }),
];
