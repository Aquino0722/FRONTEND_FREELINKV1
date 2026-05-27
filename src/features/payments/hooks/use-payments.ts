"use client";

import { useQuery } from "@tanstack/react-query";

import { paymentsService } from "@/features/payments/api/payments.service";
import { queryKeys } from "@/lib/query/query-keys";
import type { TransactionFilters } from "@/types/common";

export function useTransactions(filters: TransactionFilters, enabled = true) {
  return useQuery({ queryKey: queryKeys.payments.transactions(filters), queryFn: () => paymentsService.transactions(filters), enabled });
}
