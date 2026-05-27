import { format } from "date-fns";
import { es } from "date-fns/locale";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export const formatDate = (value: Date) => format(value, "dd MMM yyyy", { locale: es });
