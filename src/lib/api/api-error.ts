import axios from "axios";

export interface ApiError {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export class AppApiError extends Error implements ApiError {
  status: number;
  code: string;
  fieldErrors?: Record<string, string[]>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "AppApiError";
    this.status = error.status;
    this.code = error.code;
    this.fieldErrors = error.fieldErrors;
  }
}

interface ErrorPayload {
  message?: string;
  error?: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}

export function normalizeApiError(error: unknown): AppApiError {
  if (error instanceof AppApiError) return error;
  if (axios.isAxiosError<ErrorPayload>(error)) {
    const status = error.response?.status ?? 500;
    const payload = error.response?.data;
    const fallback: Record<number, string> = {
      400: "Revisa la informacion enviada.",
      401: "Tu sesion expiro. Inicia sesion de nuevo.",
      403: "No tienes permisos para realizar esta accion.",
      404: "No encontramos el recurso solicitado.",
      409: "Esta accion entra en conflicto con datos existentes.",
      500: "Ocurrio un error inesperado. Intenta de nuevo.",
    };
    return new AppApiError({
      status,
      code: payload?.code ?? `HTTP_${status}`,
      message: payload?.message ?? payload?.error ?? fallback[status] ?? fallback[500],
      fieldErrors: payload?.fieldErrors,
    });
  }
  return new AppApiError({
    status: 500,
    code: "UNKNOWN_ERROR",
    message: "Ocurrio un error inesperado. Intenta de nuevo.",
  });
}
