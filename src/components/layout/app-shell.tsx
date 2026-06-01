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
        <Link 
          key={href} 
          href={href} 
          onClick={close} 
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition border border-transparent", 
            pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)) 
              ? "bg-brand/10 text-brand border-brand/20 shadow-sm" 
              : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
          )}
        >
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
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Validando sesión...</div>;
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-panel p-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand font-semibold text-white shadow-lg shadow-brand/20">F</span>
          <span className="text-lg font-semibold tracking-tight text-slate-100">FreeLink</span>
        </Link>
        <p className="mb-4 mt-9 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
        <Navigation />
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-line bg-background/50 p-4">
          <p className="truncate text-sm font-medium text-slate-200">{session.user.email}</p>
          <p className="mb-3 mt-1 text-xs text-slate-400">{session.user.role}</p>
          <Button className="w-full text-slate-400 hover:text-slate-200" size="sm" variant="ghost" onClick={() => { clearSession(); router.push("/login"); }}>
            <LogOut className="h-4 w-4" />Salir
          </Button>
        </div>
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-background/80 px-5 backdrop-blur lg:ml-64 lg:px-8">
        <button aria-label="Abrir menú" className="rounded-lg p-2 text-slate-400 hover:text-slate-200 lg:hidden" onClick={() => setMobileOpen(true)}>
          <Menu />
        </button>
        <div className="hidden text-sm text-slate-400 lg:block">
          FreeLink <span className="mx-2 text-slate-700">/</span> Workspace
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-medium text-brand sm:block">
            {session.user.role}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-line text-sm font-medium text-slate-200">
            {session.user.email.charAt(0).toUpperCase()}
          </span>
        </div>
      </header>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="h-full w-72 bg-panel border-r border-line p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <p className="text-lg font-semibold text-slate-200">FreeLink</p>
              <button aria-label="Cerrar menú" className="text-slate-400 hover:text-slate-200" onClick={() => setMobileOpen(false)}>
                <X />
              </button>
            </div>
            <Navigation close={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
      <main className="px-5 py-7 lg:ml-64 lg:px-8 lg:py-9">{children}</main>
    </div>
  );
}
