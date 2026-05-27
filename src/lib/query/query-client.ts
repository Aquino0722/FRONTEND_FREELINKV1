import { QueryClient } from "@tanstack/react-query";

import { AppApiError } from "@/lib/api/api-error";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) =>
          error instanceof AppApiError && error.status < 500 ? false : failureCount < 1,
        staleTime: 30_000,
      },
      mutations: { retry: false },
    },
  });
}
