"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schemas";

const demos = [
  { label: "Cliente", email: "cliente@freelink.dev" },
  { label: "Freelancer", email: "freelancer@freelink.dev" },
  { label: "Administrador", email: "admin@freelink.dev" },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" },
  });
  const submit = handleSubmit((values) => login.mutate(values, {
    onSuccess: () => { toast.success("Sesion iniciada correctamente."); router.push("/dashboard"); },
    onError: (error) => toast.error(error.message),
  }));

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="mb-10 block text-lg font-semibold lg:hidden">FreeLink</Link>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Bienvenido</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Inicia sesion</h1>
      <p className="mt-2 text-sm text-slate-500">Accede al workspace de tu rol.</p>
      <form className="mt-8 space-y-5" onSubmit={submit}>
        <div><label className="mb-2 block text-sm font-medium" htmlFor="email">Correo</label><Input id="email" type="email" {...register("email")} aria-invalid={Boolean(errors.email)} />{errors.email && <p className="mt-2 text-xs text-rose-600">{errors.email.message}</p>}</div>
        <div><label className="mb-2 block text-sm font-medium" htmlFor="password">Contrasena</label><Input id="password" type="password" {...register("password")} aria-invalid={Boolean(errors.password)} />{errors.password && <p className="mt-2 text-xs text-rose-600">{errors.password.message}</p>}</div>
        <Button className="w-full" size="lg" disabled={login.isPending}>{login.isPending ? "Ingresando..." : "Ingresar"} <ArrowRight className="h-4 w-4" /></Button>
      </form>
      <div className="mt-8 rounded-2xl border bg-slate-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Cuentas demo - clave Demo123!</p>
        <div className="space-y-2">{demos.map((demo) => <button key={demo.email} type="button" className="flex w-full justify-between rounded-lg px-2 py-2 text-left text-xs hover:bg-white" onClick={() => { setValue("email", demo.email); setValue("password", "Demo123!"); }}><span className="font-medium">{demo.label}</span><span className="text-slate-500">{demo.email}</span></button>)}</div>
      </div>
      <p className="mt-7 text-center text-sm text-slate-500">No tienes cuenta? <Link className="font-medium text-brand" href="/register">Registrate</Link></p>
    </div>
  );
}
