import { apiClient } from "@/lib/api/axios-client";
import { adaptTransactions } from "@/lib/api/adapters";
import { endpoints } from "@/lib/api/endpoints";
import type { PaginatedTransactionsResponse } from "@/types/api";
import type { Paginated, Transaction, TransactionFilters } from "@/types/common";

export const paymentsService = {
  async transactions(filters: TransactionFilters): Promise<Paginated<Transaction>> {
    const { data } = await apiClient.get<PaginatedTransactionsResponse>(endpoints.payments.transactions, { params: filters });
    return adaptTransactions(data);
  },
};
