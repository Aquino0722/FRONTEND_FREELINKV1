import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 w-full rounded-xl border border-line bg-panel/50 px-4 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 w-full rounded-xl border border-line bg-panel/50 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all", className)} {...props} />;
}
