import { createSupabaseServerClient } from '@/lib/supabaseServer';

export interface AdminDashboardMetrics {
  totalEmpleados: number;
  procesosAbiertos: number;
  solicitudesPendientes: number;
  ultimosEmpleados: Array<{
    id: string;
    nombres: string;
    apellidos: string;
    puesto: string;
    fecha_ingreso: string;
  }>;
}

export interface JefeDashboardMetrics {
  totalEquipo: number;
  solicitudesPendientesEquipo: number;
  evaluacionesBorradorEquipo: number;
  integrantesEquipo: Array<{
    id: string;
    codigo: string;
    nombres: string;
    apellidos: string;
    puesto: string;
    departamento: string;
    estado: string;
  }>;
  solicitudesRecientesEquipo: Array<{
    id: string;
    empleado_nombre: string;
    tipo: string;
    fecha_inicio: string;
    fecha_fin: string;
    dias_solicitados: number;
    estado: string;
  }>;
}

export interface ReclutadorDashboardMetrics {
  procesosAbiertos: number;
  totalCandidatos: number;
  onboardingsActivos: number;
  procesosRecientes: Array<{
    id: string;
    titulo: string;
    puesto: string;
    departamento: string;
    estado: string;
    fecha_apertura: string;
  }>;
  candidatosRecientes: Array<{
    id: string;
    nombres: string;
    apellidos: string;
    puesto_aplicado: string;
    estado: string;
    created_at: string;
  }>;
}

export interface EmpleadoDashboardMetrics {
  empleado: {
    id: string;
    codigo: string;
    nombres: string;
    apellidos: string;
    puesto: string;
    departamento: string;
    fecha_ingreso: string;
    salario_base: number;
  } | null;
  diasVacacionesAprobados: number;
  solicitudesPendientes: number;
  beneficiosActivosCount: number;
  capacitacionesInscritasCount: number;
  asistenciasRecientes: Array<{
    id: string;
    fecha: string;
    hora_entrada: string;
    hora_salida: string | null;
  }>;
  capacitacionesInscritas: Array<{
    id: string;
    nombre: string;
    modalidad: string;
    estado: string;
    completada: boolean;
    calificacion: number | null;
  }>;
  evaluacionReciente: {
    periodo: string;
    calificacion: number;
    comentarios: string | null;
    metas_cumplidas: string | null;
  } | null;
}

// 1. ADMIN_RRHH Metrics
export async function getDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const supabase = await createSupabaseServerClient();
  
  const { count: empleadosCount } = await supabase
    .from('empleados')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'ACTIVO');

  const { count: procesosCount } = await supabase
    .from('procesos_reclutamiento')
    .select('*', { count: 'exact', head: true })
    .in('estado', ['ABIERTO', 'EN_PROCESO']);

  const { count: solicitudesCount } = await supabase
    .from('solicitudes_ausencia')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'PENDIENTE');

  const { data: ultimosEmpleados } = await supabase
    .from('empleados')
    .select('id, nombres, apellidos, puesto, fecha_ingreso')
    .order('fecha_ingreso', { ascending: false })
    .limit(5);

  return {
    totalEmpleados: empleadosCount || 0,
    procesosAbiertos: procesosCount || 0,
    solicitudesPendientes: solicitudesCount || 0,
    ultimosEmpleados: (ultimosEmpleados as AdminDashboardMetrics['ultimosEmpleados']) || [],
  };
}

// 2. JEFE_INMEDIATO Metrics
export async function getJefeDashboardMetrics(jefeUsuarioId: string): Promise<JefeDashboardMetrics> {
  const supabase = await createSupabaseServerClient();

  // Encontrar el registro de jefe
  const { data: jefeRecord } = await supabase
    .from('jefes_inmediatos')
    .select('empleado_id')
    .eq('usuario_id', jefeUsuarioId)
    .maybeSingle();

  const jefeEmpleadoId = jefeRecord?.empleado_id;

  if (!jefeEmpleadoId) {
    return {
      totalEquipo: 0,
      solicitudesPendientesEquipo: 0,
      evaluacionesBorradorEquipo: 0,
      integrantesEquipo: [],
      solicitudesRecientesEquipo: [],
    };
  }

  // Obtener integrantes del equipo (subordinados)
  const { data: integrantes } = await supabase
    .from('empleados')
    .select('id, codigo, nombres, apellidos, puesto, departamento, estado')
    .eq('jefe_inmediato_id', jefeEmpleadoId);

  const teamIds = integrantes?.map(emp => emp.id) || [];

  let solicitudesPendientesCount = 0;
  let solicitudesRecientes: any[] = [];

  if (teamIds.length > 0) {
    const { count } = await supabase
      .from('solicitudes_ausencia')
      .select('*', { count: 'exact', head: true })
      .in('empleado_id', teamIds)
      .eq('estado', 'PENDIENTE');
    solicitudesPendientesCount = count || 0;

    const { data: sols } = await supabase
      .from('solicitudes_ausencia')
      .select('id, tipo, fecha_inicio, fecha_fin, dias_solicitados, estado, empleados(nombres, apellidos)')
      .in('empleado_id', teamIds)
      .order('created_at', { ascending: false })
      .limit(5);
    
    solicitudesRecientes = (sols || []).map(s => {
      const emp = s.empleados as any;
      return {
        id: s.id,
        empleado_nombre: emp ? `${emp.nombres} ${emp.apellidos}` : 'Empleado',
        tipo: s.tipo,
        fecha_inicio: s.fecha_inicio,
        fecha_fin: s.fecha_fin,
        dias_solicitados: s.dias_solicitados,
        estado: s.estado,
      };
    });
  }

  // Evaluaciones en borrador hechas por este jefe
  const { count: evaluacionesCount } = await supabase
    .from('evaluaciones_desempeno')
    .select('*', { count: 'exact', head: true })
    .eq('evaluador_id', jefeUsuarioId)
    .eq('estado', 'BORRADOR');

  return {
    totalEquipo: teamIds.length,
    solicitudesPendientesEquipo: solicitudesPendientesCount,
    evaluacionesBorradorEquipo: evaluacionesCount || 0,
    integrantesEquipo: integrantes || [],
    solicitudesRecientesEquipo: solicitudesRecientes,
  };
}

// 3. RECLUTADOR Metrics
export async function getReclutadorDashboardMetrics(): Promise<ReclutadorDashboardMetrics> {
  const supabase = await createSupabaseServerClient();

  const { count: procesosCount } = await supabase
    .from('procesos_reclutamiento')
    .select('*', { count: 'exact', head: true })
    .in('estado', ['ABIERTO', 'EN_PROCESO']);

  const { count: candidatosCount } = await supabase
    .from('candidatos')
    .select('*', { count: 'exact', head: true })
    .in('estado', ['REGISTRADO', 'EN_PROCESO', 'SELECCIONADO']);

  const { count: onboardingCount } = await supabase
    .from('onboarding')
    .select('*', { count: 'exact', head: true })
    .in('estado', ['PENDIENTE', 'EN_PROCESO']);

  const { data: procesosRecientes } = await supabase
    .from('procesos_reclutamiento')
    .select('id, titulo, puesto, departamento, estado, fecha_apertura')
    .order('fecha_apertura', { ascending: false })
    .limit(5);

  const { data: candidatosRecientes } = await supabase
    .from('candidatos')
    .select('id, nombres, apellidos, puesto_aplicado, estado, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    procesosAbiertos: procesosCount || 0,
    totalCandidatos: candidatosCount || 0,
    onboardingsActivos: onboardingCount || 0,
    procesosRecientes: procesosRecientes || [],
    candidatosRecientes: candidatosRecientes || [],
  };
}

// 4. EMPLEADO Metrics
export async function getEmpleadoDashboardMetrics(empleadoUsuarioId: string): Promise<EmpleadoDashboardMetrics> {
  const supabase = await createSupabaseServerClient();

  // Encontrar el registro de empleado asociado a este usuario_id de sistema
  const { data: empleado } = await supabase
    .from('empleados')
    .select('id, codigo, nombres, apellidos, puesto, departamento, fecha_ingreso, salario_base')
    .eq('usuario_id', empleadoUsuarioId)
    .maybeSingle();

  if (!empleado) {
    return {
      empleado: null,
      diasVacacionesAprobados: 0,
      solicitudesPendientes: 0,
      beneficiosActivosCount: 0,
      capacitacionesInscritasCount: 0,
      asistenciasRecientes: [],
      capacitacionesInscritas: [],
      evaluacionReciente: null,
    };
  }

  // 1. Días de vacaciones aprobados
  const { data: solicitudesVacaciones } = await supabase
    .from('solicitudes_ausencia')
    .select('dias_solicitados')
    .eq('empleado_id', empleado.id)
    .eq('tipo', 'VACACIONES')
    .eq('estado', 'APROBADA');

  const diasVacaciones = (solicitudesVacaciones || []).reduce((acc, s) => acc + s.dias_solicitados, 0);

  // 2. Solicitudes de ausencia pendientes
  const { count: solPendientesCount } = await supabase
    .from('solicitudes_ausencia')
    .select('*', { count: 'exact', head: true })
    .eq('empleado_id', empleado.id)
    .eq('estado', 'PENDIENTE');

  // 3. Beneficios activos
  const { count: beneficiosCount } = await supabase
    .from('empleado_beneficios')
    .select('*', { count: 'exact', head: true })
    .eq('empleado_id', empleado.id)
    .eq('activo', true);

  // 4. Capacitaciones inscritas y completadas
  const { count: capacitacionesCount } = await supabase
    .from('capacitacion_empleados')
    .select('*', { count: 'exact', head: true })
    .eq('empleado_id', empleado.id);

  // Listar capacitaciones inscritas
  const { data: inscripciones } = await supabase
    .from('capacitacion_empleados')
    .select(`
      completada,
      calificacion,
      capacitaciones (
        id,
        nombre,
        modalidad,
        estado
      )
    `)
    .eq('empleado_id', empleado.id)
    .limit(5);

  const capacitacionesInscritas = (inscripciones || []).map((ins: any) => {
    const cap = ins.capacitaciones;
    return {
      id: cap?.id || '',
      nombre: cap?.nombre || 'Capacitación',
      modalidad: cap?.modalidad || 'VIRTUAL',
      estado: cap?.estado || 'PROGRAMADA',
      completada: ins.completada,
      calificacion: ins.calificacion,
    };
  });

  // 5. Asistencias recientes
  const { data: asistencias } = await supabase
    .from('asistencias')
    .select('id, fecha, hora_entrada, hora_salida')
    .eq('empleado_id', empleado.id)
    .order('fecha', { ascending: false })
    .limit(5);

  // 6. Evaluación de desempeño reciente
  const { data: evalReciente } = await supabase
    .from('evaluaciones_desempeno')
    .select('periodo, calificacion, comentarios, metas_cumplidas')
    .eq('empleado_id', empleado.id)
    .eq('estado', 'FINALIZADA')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    empleado,
    diasVacacionesAprobados: diasVacaciones,
    solicitudesPendientes: solPendientesCount || 0,
    beneficiosActivosCount: beneficiosCount || 0,
    capacitacionesInscritasCount: capacitacionesCount || 0,
    asistenciasRecientes: asistencias || [],
    capacitacionesInscritas,
    evaluacionReciente: evalReciente || null,
  };
}
