import type { UsuarioRol } from '@/types/usuario';
export const PERMISOS: Record<UsuarioRol, string[]> = {
  ADMIN_RRHH: ['empleados:gestionar','nomina:gestionar','beneficios:gestionar','reportes:ver','cumplimiento:gestionar','solicitudes:aprobar','evaluaciones:ver','capacitaciones:gestionar','asistencia:gestionar','reclutamiento:ver','onboarding:ver'],
  JEFE_INMEDIATO: ['solicitudes:aprobar','evaluaciones:registrar','empleados:ver','asistencia:ver'],
  RECLUTADOR: ['candidatos:gestionar','reclutamiento:gestionar','onboarding:registrar'],
  EMPLEADO: ['perfil:ver','solicitudes:crear','asistencia:ver','beneficios:ver','capacitaciones:ver','evaluaciones:ver'],
};
export function tienePermiso(rol: UsuarioRol, permiso: string): boolean { return PERMISOS[rol]?.includes(permiso) ?? false; }
export function puedeGestionarEmpleados(rol: UsuarioRol) { return tienePermiso(rol, 'empleados:gestionar'); }
export function puedeAprobarSolicitudes(rol: UsuarioRol) { return tienePermiso(rol, 'solicitudes:aprobar'); }
