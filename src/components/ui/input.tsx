import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-brand", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 w-full rounded-xl border bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-brand", className)} {...props} />;
}
