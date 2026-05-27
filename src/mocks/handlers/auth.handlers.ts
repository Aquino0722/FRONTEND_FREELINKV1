import { http, HttpResponse } from "msw";

import { db } from "@/mocks/data/database";
import { createFakeJwt, mockDelay } from "@/mocks/utils";
import type { LoginRequest, RegisterRequest } from "@/types/api";

export const authHandlers = [
  http.post("*/api/Auth/login", async ({ request }) => {
    await mockDelay();
    const input = (await request.json()) as LoginRequest;
    const user = db.users.find((item) => item.email.toLowerCase() === input.email.toLowerCase() && item.password === input.password);
    if (!user || !user.isActive) {
      return HttpResponse.json({ success: false, message: "Correo o contrasena incorrectos." }, { status: 401 });
    }
    return HttpResponse.json({
      success: true,
      message: "Bienvenido a FreeLink.",
      token: createFakeJwt(user),
      user: {
        userId: user.userId, email: user.email, userType: user.userType, isActive: user.isActive,
        isVerified: user.isVerified, createdAt: user.createdAt,
      },
    });
  }),
  http.post("*/api/Auth/register", async ({ request }) => {
    await mockDelay();
    const input = (await request.json()) as RegisterRequest;
    if (db.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
      return HttpResponse.json({ success: false, message: "Este correo ya tiene una cuenta." }, { status: 409 });
    }
    const userId = Math.max(...db.users.map((user) => user.userId)) + 1;
    db.users.push({
      userId, email: input.email, password: input.password, userType: input.userType, isActive: true, isVerified: false,
      createdAt: new Date().toISOString(), firstName: input.firstName, lastName: input.lastName, phoneNumber: input.phoneNumber,
      country: input.country, city: input.city, bio: null, profilePictureUrl: null, balance: 0, pendingBalance: 0,
    });
    return HttpResponse.json({ success: true, message: "Cuenta creada correctamente.", data: { userId, email: input.email, userType: input.userType } });
  }),
];
