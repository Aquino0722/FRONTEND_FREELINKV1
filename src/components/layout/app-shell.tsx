"use client";

import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth/auth-store";
import { navigationByRole } from "@/lib/config/navigation";
import { cn } from "@/lib/utils/cn";

function Navigation({ close }: { close?: () => void }) {
  const pathname = usePathname();
  const session = useAuthStore((state) => state.session);
  if (!session) return null;
  return (
    <nav className="space-y-1">
      {navigationByRole[session.user.role].map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} onClick={close} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)) ? "bg-brand-soft text-brand" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")}>
          <Icon className="h-[18px] w-[18px]" />{label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const hydrated = useAuthStore((state) => state.isHydrated);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !session) router.replace("/login");
  }, [hydrated, router, session]);

  if (!hydrated || !session) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Validando sesion...</div>;
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white p-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand font-semibold text-white">F</span><span className="text-lg font-semibold tracking-tight">FreeLink</span></Link>
        <p className="mb-4 mt-9 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
        <Navigation />
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border bg-slate-50 p-4">
          <p className="truncate text-sm font-medium">{session.user.email}</p><p className="mb-3 mt-1 text-xs text-slate-500">{session.user.role}</p>
          <Button className="w-full" size="sm" variant="ghost" onClick={() => { clearSession(); router.push("/login"); }}><LogOut className="h-4 w-4" />Salir</Button>
        </div>
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/90 px-5 backdrop-blur lg:ml-64 lg:px-8">
        <button aria-label="Abrir menu" className="rounded-lg p-2 text-slate-600 lg:hidden" onClick={() => setMobileOpen(true)}><Menu /></button>
        <div className="hidden text-sm text-slate-500 lg:block">FreeLink <span className="mx-2 text-slate-300">/</span> Workspace</div>
        <div className="ml-auto flex items-center gap-3"><span className="hidden rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium text-brand sm:block">{session.user.role}</span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">{session.user.email.charAt(0).toUpperCase()}</span></div>
      </header>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setMobileOpen(false)}><aside className="h-full w-72 bg-white p-5" onClick={(event) => event.stopPropagation()}><div className="mb-8 flex items-center justify-between"><p className="text-lg font-semibold">FreeLink</p><button aria-label="Cerrar menu" onClick={() => setMobileOpen(false)}><X /></button></div><Navigation close={() => setMobileOpen(false)} /></aside></div>}
      <main className="px-5 py-7 lg:ml-64 lg:px-8 lg:py-9">{children}</main>
    </div>
  );
}
