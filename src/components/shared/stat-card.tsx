import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export function StatCard({ label, value, helper, icon: Icon }: { label: string; value: string | number; helper: string; icon: LucideIcon }) {
  return (
    <Card className="p-6 hover:-translate-y-1 hover:border-slate-800 transition-all duration-300 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <span className="rounded-xl bg-slate-950/60 border border-line p-2.5 text-slate-300 shadow-inner">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-slate-50 bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{helper}</p>
    </Card>
  );
}
