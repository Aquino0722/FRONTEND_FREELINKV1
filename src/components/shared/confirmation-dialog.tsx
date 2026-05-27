"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ConfirmationDialog({ trigger, title, description, confirmLabel, pending, onConfirm }: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl focus:outline-none">
          <div className="flex justify-between gap-4"><Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title><Dialog.Close aria-label="Cerrar" className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></Dialog.Close></div>
          <Dialog.Description className="mt-3 text-sm leading-6 text-slate-500">{description}</Dialog.Description>
          <div className="mt-7 flex justify-end gap-3"><Dialog.Close asChild><Button variant="secondary">Cancelar</Button></Dialog.Close><Dialog.Close asChild><Button disabled={pending} onClick={onConfirm}>{confirmLabel}</Button></Dialog.Close></div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
