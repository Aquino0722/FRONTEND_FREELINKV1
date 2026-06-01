import { http, HttpResponse } from "msw";

import { db } from "@/mocks/data/database";
import { authenticatedUser, hasRole, mockDelay, unauthorized } from "@/mocks/utils";

export const paymentsHandlers = [
  http.get("*/api/Payments/transactions", async ({ request }) => {
    await mockDelay();
    const user = authenticatedUser(request);
    if (!user) return unauthorized();
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
    let items = hasRole(user, "Administrador") ? db.transactions : db.transactions.filter((item) => item.fromUserId === user.userId || item.toUserId === user.userId);
    const status = url.searchParams.get("status");
    if (status) items = items.filter((item) => item.transactionStatus === status);
    
    // Sort by date descending
    items = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return HttpResponse.json({ total: items.length, page, pageSize, items: items.slice((page - 1) * pageSize, page * pageSize) });
  }),
];
