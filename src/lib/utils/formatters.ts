import { format } from "date-fns";
import { es } from "date-fns/locale";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return "";
  return format(date, "dd MMM yyyy", { locale: es });
};
