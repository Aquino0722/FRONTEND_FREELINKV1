import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const colorByStatus: Record<string, string> = {
  Publicado: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  Asignado: "border-violet-500/20 bg-violet-500/10 text-violet-400",
  "En Proceso": "border-amber-500/20 bg-amber-500/10 text-amber-400",
  Completado: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Pendiente: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  Aceptada: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Rechazada: "border-rose-500/20 bg-rose-500/10 text-rose-400",
  Aprobado: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  "En revision": "border-blue-500/20 bg-blue-500/10 text-blue-400",
  Cancelado: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  Enviado: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  Postulado: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
  Paid: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  "In Review": "border-blue-500/20 bg-blue-500/10 text-blue-400",
  Escrow: "border-violet-500/20 bg-violet-500/10 text-violet-400",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={cn(colorByStatus[status] ?? "bg-slate-50 text-slate-700")}>{status}</Badge>;
}
