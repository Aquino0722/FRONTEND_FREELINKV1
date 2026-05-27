"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/features/auth/hooks/use-auth";
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas/auth.schemas";

export default function RegisterPage() {
  const router = useRouter();
  const mutation = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), defaultValues: { userType: "Cliente" } });
  const submit = handleSubmit((input) => mutation.mutate(input, { onSuccess: () => { toast.success("Cuenta creada. Ya puedes iniciar sesion."); router.push("/login"); }, onError: (error) => toast.error(error.message) }));
  const fields: { name: keyof RegisterFormValues; label: string; span?: boolean }[] = [{ name: "firstName", label: "Nombre" }, { name: "lastName", label: "Apellido" }, { name: "email", label: "Correo", span: true }, { name: "phoneNumber", label: "Telefono" }, { name: "country", label: "Pais" }, { name: "city", label: "Ciudad" }];
  return (
    <div className="w-full max-w-md">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Crear cuenta</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Empieza en FreeLink</h1>
      <form className="mt-7 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        {fields.map(({ name, label, span }) => <div className={span ? "sm:col-span-2" : ""} key={name}><label className="mb-2 block text-sm font-medium" htmlFor={name}>{label}</label><Input id={name} {...register(name)} />{errors[name] && <p className="mt-1 text-xs text-rose-600">{errors[name]?.message}</p>}</div>)}
        <div className="sm:col-span-2"><label className="mb-2 block text-sm font-medium" htmlFor="password">Contrasena</label><Input id="password" type="password" {...register("password")} /><p className="mt-2 text-xs text-slate-500">Minimo 8 caracteres, una mayuscula y un numero.</p>{errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}</div>
        <div className="sm:col-span-2"><label className="mb-2 block text-sm font-medium" htmlFor="userType">Quiero usar FreeLink como</label><select id="userType" className="h-11 w-full rounded-xl border bg-white px-3 text-sm" {...register("userType")}><option value="Cliente">Cliente</option><option value="Freelancer">Freelancer</option></select></div>
        <Button className="mt-2 w-full sm:col-span-2" size="lg" disabled={mutation.isPending}>{mutation.isPending ? "Creando..." : "Crear cuenta"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">Ya tienes cuenta? <Link className="font-medium text-brand" href="/login">Inicia sesion</Link></p>
    </div>
  );
}
