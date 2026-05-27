import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Ingresa un correo valido."),
  password: z.string().min(1, "La contrasena es requerida."),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, "Ingresa tu nombre."),
  lastName: z.string().min(2, "Ingresa tu apellido."),
  email: z.email("Ingresa un correo valido."),
  password: z.string().min(8, "Usa al menos 8 caracteres.").regex(/[A-Z]/, "Incluye una mayuscula.").regex(/[0-9]/, "Incluye un numero."),
  phoneNumber: z.string().min(7, "Ingresa un telefono valido."),
  country: z.string().min(2, "Selecciona tu pais."),
  city: z.string().min(2, "Ingresa tu ciudad."),
  userType: z.enum(["Cliente", "Freelancer"]),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
