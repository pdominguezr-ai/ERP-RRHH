import { NextResponse } from 'next/server';

/**
 * Estándar RFC 9457: Problem Details for HTTP APIs (obsoleta RFC 7807)
 * y RFC 9110: HTTP Semantics.
 * Unifica todas las respuestas de error bajo el Media Type 'application/problem+json'.
 */
export interface ProblemDetails {
  /** URI de referencia que identifica el tipo de problema */
  type: string;
  /** Resumen breve y legible por humanos del tipo de problema */
  title: string;
  /** Código de estado HTTP según RFC 9110 */
  status: number;
  /** Explicación específica de esta ocurrencia del problema */
  detail: string;
  /** URI que identifica la instancia específica donde ocurrió el problema */
  instance: string;
  /** Extensión de dominio: Código interno de error */
  code: string;
  /** Extensión de dominio: Marca de tiempo ISO 8601 */
  timestamp: string;
  /** Extensión de dominio: Errores de validación por campo */
  errors?: Record<string, string[] | undefined>;
  /** Compatibilidad retroactiva con clientes legados */
  success?: false;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[] | undefined>;
  };
}

export class ProblemDetailsError extends Error {
  public readonly type: string;
  public readonly title: string;
  public readonly status: number;
  public readonly detail: string;
  public readonly instance: string;
  public readonly code: string;
  public readonly errors?: Record<string, string[] | undefined>;

  constructor(params: {
    type?: string;
    title: string;
    status: number;
    detail: string;
    instance: string;
    code: string;
    errors?: Record<string, string[] | undefined>;
  }) {
    super(params.detail);
    this.name = 'ProblemDetailsError';
    this.type = params.type || `https://erp-rrhh.umg.edu.gt/probs/${params.code.toLowerCase().replace(/_/g, '-')}`;
    this.title = params.title;
    this.status = params.status;
    this.detail = params.detail;
    this.instance = params.instance;
    this.code = params.code;
    this.errors = params.errors;
  }
}

export function buildProblemDetailsObject(params: {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  errors?: Record<string, string[] | undefined>;
}): ProblemDetails {
  const typeUri =
    params.type || `https://erp-rrhh.umg.edu.gt/probs/${params.code.toLowerCase().replace(/_/g, '-')}`;

  return {
    type: typeUri,
    title: params.title,
    status: params.status,
    detail: params.detail,
    instance: params.instance,
    code: params.code,
    timestamp: new Date().toISOString(),
    ...(params.errors ? { errors: params.errors } : {}),
    success: false,
    error: {
      code: params.code,
      message: params.detail,
      ...(params.errors ? { details: params.errors } : {}),
    },
  };
}

export function createProblemDetailsResponse(params: {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  errors?: Record<string, string[] | undefined>;
}): NextResponse {
  const body = buildProblemDetailsObject(params);
  return new NextResponse(JSON.stringify(body), {
    status: params.status,
    headers: {
      'Content-Type': 'application/problem+json; charset=utf-8',
      'X-Error-Standard': 'RFC-9457',
    },
  });
}
