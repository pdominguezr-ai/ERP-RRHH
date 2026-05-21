import type { UsuarioRol } from '@/types/usuario';

export const PERMISOS: Record<UsuarioRol, string[]> = {
  ADMIN_RRHH:     ['empleados:gestionar','nomina:gestionar','beneficios:gestionar','reportes:ver','cumplimiento:gestionar','solicitudes:aprobar','evaluaciones:ver','capacitaciones:gestionar','asistencia:gestionar','reclutamiento:ver','onboarding:ver','auditoria:ver'],
  JEFE_INMEDIATO: ['solicitudes:aprobar','evaluaciones:registrar','empleados:ver','asistencia:ver','reportes:ver','capacitaciones:ver'],
  RECLUTADOR:     ['candidatos:gestionar','reclutamiento:gestionar','onboarding:registrar','solicitudes:ver','capacitaciones:ver'],
  EMPLEADO:       ['perfil:ver','solicitudes:crear','asistencia:ver','beneficios:ver','capacitaciones:ver','evaluaciones:ver'],
};

/** Qué roles pueden acceder a cada ruta del dashboard */
export const RUTAS_ROLES: Record<string, UsuarioRol[]> = {
  '/dashboard':                  ['ADMIN_RRHH', 'JEFE_INMEDIATO', 'RECLUTADOR', 'EMPLEADO'],
  '/dashboard/empleados':        ['ADMIN_RRHH', 'JEFE_INMEDIATO'],
  '/dashboard/nomina':           ['ADMIN_RRHH'],
  '/dashboard/asistencia':       ['ADMIN_RRHH', 'JEFE_INMEDIATO', 'EMPLEADO'],
  '/dashboard/solicitudes':      ['ADMIN_RRHH', 'JEFE_INMEDIATO', 'RECLUTADOR', 'EMPLEADO'],
  '/dashboard/reclutamiento':    ['ADMIN_RRHH', 'RECLUTADOR'],
  '/dashboard/onboarding':       ['ADMIN_RRHH', 'RECLUTADOR'],
  '/dashboard/evaluaciones':     ['ADMIN_RRHH', 'JEFE_INMEDIATO', 'EMPLEADO'],
  '/dashboard/capacitaciones':   ['ADMIN_RRHH', 'JEFE_INMEDIATO', 'RECLUTADOR', 'EMPLEADO'],
  '/dashboard/beneficios':       ['ADMIN_RRHH', 'EMPLEADO'],
  '/dashboard/reportes':         ['ADMIN_RRHH', 'JEFE_INMEDIATO'],
  '/dashboard/cumplimiento':     ['ADMIN_RRHH'],
  '/dashboard/auditoria':        ['ADMIN_RRHH'],
};

export function tienePermiso(rol: UsuarioRol, permiso: string): boolean {
  return PERMISOS[rol]?.includes(permiso) ?? false;
}

export function puedeAccederRuta(rol: UsuarioRol, ruta: string): boolean {
  // Buscar la ruta más específica que coincida
  const rutasOrdenadas = Object.keys(RUTAS_ROLES).sort((a, b) => b.length - a.length);
  const rutaMatch = rutasOrdenadas.find(r => ruta === r || ruta.startsWith(r + '/'));
  if (!rutaMatch) return true; // rutas no definidas son públicas dentro del dashboard
  return RUTAS_ROLES[rutaMatch]?.includes(rol) ?? false;
}

export function puedeGestionarEmpleados(rol: UsuarioRol) { return tienePermiso(rol, 'empleados:gestionar'); }
export function puedeAprobarSolicitudes(rol: UsuarioRol) { return tienePermiso(rol, 'solicitudes:aprobar'); }
