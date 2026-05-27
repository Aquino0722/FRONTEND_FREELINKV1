"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { useTransactions } from "@/features/payments/hooks/use-payments";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

export default function PaymentsPage() {
  const user = useAuthStore((state) => state.session?.user);
  const query = useTransactions({ page: 1, pageSize: 20 }, user?.role === "Cliente");
  if (user?.role !== "Cliente") return <Card className="p-7">Esta vista financiera esta disponible para clientes.</Card>;
  return <>
    <PageHeader eyebrow="Pagos" title="Movimientos del proyecto" description="Vista secundaria preparada para la integracion financiera final." />
    <Card className="overflow-hidden"><div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b bg-slate-50 p-4 text-xs font-semibold uppercase tracking-wide text-slate-500"><span>Movimiento</span><span>Monto</span><span>Estado</span></div>{query.data?.items.map((tx) => <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b p-4 text-sm last:border-0" key={tx.id}><div><p className="font-medium">{tx.type}</p><p className="text-xs text-slate-500">{formatDate(tx.createdAt)}</p></div><strong>{formatCurrency(tx.amount)}</strong><StatusBadge status={tx.status} /></div>)}</Card>
  </>;
}
