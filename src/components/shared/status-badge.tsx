import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const colorByStatus: Record<string, string> = {
  Publicado: "border-blue-100 bg-blue-50 text-blue-700",
  Asignado: "border-violet-100 bg-violet-50 text-violet-700",
  "En Proceso": "border-amber-100 bg-amber-50 text-amber-700",
  Completado: "border-emerald-100 bg-emerald-50 text-emerald-700",
  Pendiente: "border-amber-100 bg-amber-50 text-amber-700",
  Aceptada: "border-emerald-100 bg-emerald-50 text-emerald-700",
  Rechazada: "border-rose-100 bg-rose-50 text-rose-700",
  Aprobado: "border-emerald-100 bg-emerald-50 text-emerald-700",
  "En revision": "border-blue-100 bg-blue-50 text-blue-700",
  Cancelado: "border-slate-100 bg-slate-50 text-slate-700",
  Enviado: "border-blue-100 bg-blue-50 text-blue-700",
  Postulado: "border-indigo-100 bg-indigo-50 text-indigo-700",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={cn(colorByStatus[status] ?? "bg-slate-50 text-slate-700")}>{status}</Badge>;
}
