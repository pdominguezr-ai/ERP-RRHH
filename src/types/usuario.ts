export type UsuarioRol = 'ADMIN_RRHH' | 'JEFE_INMEDIATO' | 'RECLUTADOR' | 'EMPLEADO';
export interface UsuarioSistema { id: string; auth_user_id: string; correo: string; rol: UsuarioRol; activo: boolean; created_at: string; updated_at: string; }
export interface UsuarioSesion { id: string; correo: string; rol: UsuarioRol; nombre?: string; }
