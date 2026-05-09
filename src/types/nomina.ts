export type EstadoNomina = 'BORRADOR' | 'PROCESADA' | 'PAGADA' | 'ANULADA';
export interface Nomina { id: string; periodo_inicio: string; periodo_fin: string; estado: EstadoNomina; total_bruto: number; total_deducciones: number; total_bonificaciones: number; total_neto: number; observaciones?: string; created_by?: string; created_at: string; updated_at: string; }
export interface DetalleNomina { id: string; nomina_id: string; empleado_id: string; salario_base: number; bonificaciones: number; deducciones: number; retenciones: number; salario_neto: number; observaciones?: string; created_at: string; updated_at: string; empleado?: { nombres: string; apellidos: string; codigo: string; puesto: string }; }
export interface NominaFormData { periodo_inicio: string; periodo_fin: string; observaciones?: string; }
export interface DetalleNominaFormData { empleado_id: string; salario_base: number; bonificaciones: number; deducciones: number; retenciones: number; observaciones?: string; }
