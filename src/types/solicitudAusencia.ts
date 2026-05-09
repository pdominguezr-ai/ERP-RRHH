export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
export type TipoAusencia = 'PERMISO' | 'VACACIONES' | 'ENFERMEDAD' | 'OTRO';
export interface SolicitudAusencia { id: string; empleado_id: string; tipo: TipoAusencia; fecha_inicio: string; fecha_fin: string; dias_solicitados: number; motivo: string; estado: EstadoSolicitud; aprobado_por?: string; fecha_aprobacion?: string; observaciones?: string; created_at: string; updated_at: string; empleado?: { nombres: string; apellidos: string; codigo: string; departamento: string }; }
export interface SolicitudAusenciaFormData { empleado_id: string; tipo: TipoAusencia; fecha_inicio: string; fecha_fin: string; motivo: string; }
