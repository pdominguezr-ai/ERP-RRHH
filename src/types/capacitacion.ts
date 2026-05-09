export type EstadoCapacitacion = 'PROGRAMADA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA';
export interface Capacitacion { id: string; nombre: string; descripcion?: string; instructor?: string; fecha_inicio: string; fecha_fin?: string; modalidad: string; estado: EstadoCapacitacion; created_at: string; updated_at: string; }
export interface CapacitacionEmpleado { id: string; capacitacion_id: string; empleado_id: string; completada: boolean; calificacion?: number; created_at: string; empleado?: { nombres: string; apellidos: string; codigo: string; departamento: string; puesto: string }; }
export interface CapacitacionFormData { nombre: string; descripcion?: string; instructor?: string; fecha_inicio: string; fecha_fin?: string; modalidad: string; estado: EstadoCapacitacion; }
