import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(5, "Ingresa un titulo descriptivo."),
  description: z.string().min(30, "Describe el resultado esperado con mas detalle."),
  budget: z.coerce.number().min(0, "El presupuesto no puede ser negativo."),
  deadlineDate: z.string().refine((value) => new Date(value) > new Date(), "La fecha debe ser futura."),
  requiredSkills: z.string().optional(),
});

export type ProjectFormInput = z.input<typeof projectSchema>;
export type ProjectFormValues = z.output<typeof projectSchema>;
