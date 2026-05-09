export type TipoReporte = 'EMPLEADOS_ACTIVOS' | 'NOMINA' | 'ASISTENCIA' | 'ROTACION' | 'EVALUACIONES' | 'BENEFICIOS';
export interface ReporteRH { id: string; tipo: TipoReporte; titulo: string; parametros?: Record<string, unknown>; generado_por: string; created_at: string; generador?: { correo: string }; }
export interface ResumenReporte { tipo: TipoReporte; titulo: string; total: number; datos: Record<string, unknown>[]; }
export interface ReporteFormData { tipo: TipoReporte; titulo: string; parametros?: Record<string, unknown>; }
