import { ArrowRight, BriefcaseBusiness, ChartNoAxesColumnIncreasing, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const benefits = [
  { title: "Proyectos precisos", text: "Publica objetivos, presupuesto y habilidades.", icon: BriefcaseBusiness },
  { title: "Progreso visible", text: "Actividad y entregables en una sola vista.", icon: ChartNoAxesColumnIncreasing },
  { title: "Confianza operativa", text: "Roles y permisos preparados para escalar.", icon: ShieldCheck },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6"><p className="flex items-center gap-3 text-lg font-semibold"><span className="rounded-xl bg-brand px-3 py-2 text-white">F</span>FreeLink</p><Link className="text-sm font-medium text-slate-600" href="/login">Iniciar sesion</Link></header>
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
        <span className="rounded-full border bg-brand-soft px-4 py-2 text-sm font-medium text-brand">Talento freelance, gestionado con claridad</span>
        <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-slate-950 md:text-7xl">Del proyecto publicado a la entrega aprobada.</h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-500">FreeLink conecta equipos ambiciosos con especialistas verificados y un workspace que mantiene cada entrega bajo control.</p>
        <div className="mt-10 flex justify-center gap-3"><Button asChild size="lg"><Link href="/login">Explorar demo <ArrowRight className="h-4 w-4" /></Link></Button><Button asChild size="lg" variant="secondary"><Link href="/register">Crear cuenta</Link></Button></div>
        <section className="mt-24 grid gap-4 text-left md:grid-cols-3">{benefits.map(({ title, text, icon: Icon }) => <div className="rounded-2xl border p-7" key={title}><Icon className="mb-6 h-5 w-5 text-brand" /><h2 className="font-medium">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>)}</section>
      </main>
    </div>
  );
}
