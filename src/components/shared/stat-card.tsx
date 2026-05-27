import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export function StatCard({ label, value, helper, icon: Icon }: { label: string; value: string | number; helper: string; icon: LucideIcon }) {
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><span className="rounded-lg bg-slate-50 p-2 text-slate-500"><Icon className="h-4 w-4" /></span></div>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{helper}</p>
    </Card>
  );
}
