export type OperacionAuditoria = 'INSERT' | 'UPDATE' | 'DELETE';

export interface AuditoriaCambio {
  id: string;
  tabla: string;
  registro_id: string;
  operacion: OperacionAuditoria;
  datos_antes: Record<string, any> | null;
  datos_despues: Record<string, any> | null;
  usuario_id: string | null;
  created_at: string;
  usuario?: {
    correo: string;
    rol: string;
  };
}

export interface AuditoriaCambioFormData {
  tabla: string;
  registro_id: string;
  operacion: OperacionAuditoria;
  datos_antes?: Record<string, any> | null;
  datos_despues?: Record<string, any> | null;
  usuario_id?: string | null;
}
