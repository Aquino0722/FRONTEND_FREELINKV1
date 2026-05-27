import { z } from "zod";

export const freelancerProfileSchema = z.object({
  title: z.string().min(3, "Describe tu especialidad."),
  hourlyRate: z.coerce.number().min(0, "La tarifa no puede ser negativa."),
  yearsOfExperience: z.coerce.number().int().min(0, "Los anos no pueden ser negativos."),
  availabilityStatus: z.enum(["Disponible", "Ocupado", "No disponible"]),
});

export type FreelancerProfileInput = z.input<typeof freelancerProfileSchema>;
export type FreelancerProfileValues = z.output<typeof freelancerProfileSchema>;
