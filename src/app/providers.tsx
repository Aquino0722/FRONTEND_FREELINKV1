"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import { useAuthStore } from "@/lib/auth/auth-store";
import { env } from "@/lib/config/env";
import { createQueryClient } from "@/lib/query/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [ready, setReady] = useState(env.apiMode === "real");
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
    if (env.apiMode === "mock") {
      import("@/mocks/browser").then(({ worker }) =>
        worker.start({ onUnhandledRequest: "bypass", quiet: true }).then(() => setReady(true)),
      );
    }
  }, [hydrate]);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Preparando entorno seguro de demostracion...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
