export type EstadoBeneficio = 'ACTIVO' | 'INACTIVO';
export interface Beneficio { id: string; nombre: string; descripcion?: string; tipo: string; monto?: number; estado: EstadoBeneficio; created_at: string; updated_at: string; }
export interface EmpleadoBeneficio { id: string; empleado_id: string; beneficio_id: string; fecha_asignacion: string; activo: boolean; created_at: string; beneficio?: Beneficio; empleado?: { nombres: string; apellidos: string; departamento: string }; }
export interface BeneficioFormData { nombre: string; descripcion?: string; tipo: string; monto?: number; estado: EstadoBeneficio; }
