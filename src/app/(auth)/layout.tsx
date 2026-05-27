import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_520px]">
      <div className="hidden flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
        <Link href="/" className="text-xl font-semibold"><span className="mr-3 rounded-xl bg-brand px-3 py-2">F</span>FreeLink</Link>
        <div><p className="mb-5 text-sm text-violet-300">Workspace freelance premium</p><h2 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight">Contrata, colabora y entrega con confianza.</h2><p className="mt-5 max-w-md text-slate-400">Un entorno operativo para clientes y profesionales que quieren trabajar sin perder contexto.</p></div>
        <p className="text-sm text-slate-500">FreeLink SaaS - entorno de demostracion</p>
      </div>
      <div className="flex items-center justify-center px-6 py-10">{children}</div>
    </div>
  );
}
