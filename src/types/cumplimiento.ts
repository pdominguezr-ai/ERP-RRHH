export type EstadoCumplimiento = 'CUMPLIDO' | 'PENDIENTE' | 'INCUMPLIDO';
export interface CumplimientoLaboral { id: string; nombre: string; descripcion?: string; categoria: string; fecha_limite?: string; estado: EstadoCumplimiento; responsable_id?: string; observaciones?: string; created_at: string; updated_at: string; }
export interface CumplimientoFormData { nombre: string; descripcion?: string; categoria: string; fecha_limite?: string; estado: EstadoCumplimiento; responsable_id?: string; observaciones?: string; }
