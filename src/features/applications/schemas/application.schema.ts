import { z } from "zod";

export const applicationSchema = z.object({
  coverLetter: z.string().min(40, "Explica tu enfoque en al menos 40 caracteres."),
  proposedRate: z.coerce.number().min(0, "La tarifa no puede ser negativa.").optional(),
  estimatedDuration: z.coerce.number().int().positive("Indica una duracion positiva.").optional(),
});

export type ApplicationFormInput = z.input<typeof applicationSchema>;
export type ApplicationFormValues = z.output<typeof applicationSchema>;
