import { HttpResponse, delay } from "msw";

import { env } from "@/lib/config/env";
import { normalizeUserRole } from "@/lib/auth/role-normalizer";
import { db, type MockUser } from "@/mocks/data/database";
import type { UserRole } from "@/types/common";

export async function mockDelay() {
  const duration = env.mockScenario === "slow" ? 1800 : env.mockDelay;
  await delay(duration);
}

export function errorScenario() {
  return env.mockScenario === "error";
}

function encode(value: object) {
  return btoa(JSON.stringify(value)).replaceAll("=", "");
}

export function createFakeJwt(user: MockUser) {
  const role = normalizeUserRole(user.userType);
  const now = Math.floor(Date.now() / 1000);
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
    sub: String(user.userId), userId: user.userId, email: user.email, role, userType: role, iat: now, exp: now + 60 * 60 * 8,
  })}.mock-signature`;
}

export function authenticatedUser(request: Request): MockUser | null {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    const payload = JSON.parse(atob(authorization.slice(7).split(".")[1])) as { userId: number; exp: number };
    if (payload.exp * 1000 <= Date.now()) return null;
    return db.users.find((user) => user.userId === payload.userId && user.isActive) ?? null;
  } catch {
    return null;
  }
}

export function unauthorized() {
  return HttpResponse.json({ code: "AUTH_REQUIRED", message: "Inicia sesion para continuar." }, { status: 401 });
}

export function forbidden() {
  return HttpResponse.json({ code: "FORBIDDEN", message: "No tienes permisos para realizar esta accion." }, { status: 403 });
}

export function hasRole(user: MockUser | null, role: UserRole) {
  return user !== null && normalizeUserRole(user.userType) === role;
}
