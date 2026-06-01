import { AlertCircle, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCards() {
  return <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((value) => <Skeleton className="h-40" key={value} />)}</div>;
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <Card className="flex flex-col items-center px-6 py-14 text-center"><Inbox className="mb-4 h-8 w-8 text-slate-600" /><h3 className="font-medium text-slate-200">{title}</h3><p className="mt-2 max-w-md text-sm text-slate-400 leading-relaxed">{detail}</p></Card>;
}

export function ErrorState({ 
  retry, 
  title = "No pudimos cargar esta información", 
  detail = "El servicio no respondió correctamente. Puedes intentarlo nuevamente.", 
  errorCode 
}: { 
  retry: () => void; 
  title?: string; 
  detail?: string; 
  errorCode?: string; 
}) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center">
      <AlertCircle className="mb-4 h-8 w-8 text-rose-500/80" />
      <h3 className="font-medium text-slate-200">{title}</h3>
      <p className="mt-2 mb-5 text-sm text-slate-400 max-w-md leading-relaxed">
        {detail} {errorCode ? `(${errorCode})` : ""}
      </p>
      <Button variant="secondary" onClick={retry}>Reintentar</Button>
    </Card>
  );
}
