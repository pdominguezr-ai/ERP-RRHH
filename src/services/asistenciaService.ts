import { createSupabaseAdminClient } from '@/lib/supabaseServer';
import { getUserInfo } from '@/lib/auth';
import type { Asistencia } from '@/types/asistencia';

export async function getAsistencias() {
  const { id: usuarioId, rol } = await getUserInfo();
  if (!usuarioId) {
    return [];
  }

  const adminClient = createSupabaseAdminClient();

  let query = adminClient
    .from('asistencias')
    .select(`
      *,
      empleado:empleados(nombres, apellidos, codigo, jefe_inmediato_id)
    `);

  if (rol === 'ADMIN_RRHH') {
    // Admin RRHH sees all records
  } else if (rol === 'JEFE_INMEDIATO') {
    // 1. Fetch Jefe's employee ID
    const { data: jefeRel, error: jefeRelErr } = await adminClient
      .from('jefes_inmediatos')
      .select('empleado_id')
      .eq('usuario_id', usuarioId)
      .maybeSingle();

    if (jefeRelErr) {
      console.error('Error fetching jefe relation:', jefeRelErr);
      throw new Error('Error al obtener datos del jefe');
    }

    const jefeEmpleadoId = jefeRel?.empleado_id;

    if (!jefeEmpleadoId) {
      // If Jefe is not linked to any employee record, they can see nothing
      return [];
    }

    // 2. Fetch subordinate employee IDs
    const { data: subordinates, error: subErr } = await adminClient
      .from('empleados')
      .select('id')
      .eq('jefe_inmediato_id', jefeEmpleadoId);

    if (subErr) {
      console.error('Error fetching subordinates:', subErr);
      throw new Error('Error al obtener subordinados');
    }

    const employeeIds = [jefeEmpleadoId, ...subordinates.map(s => s.id)];

    // 3. Filter asistencias where empleado_id in employeeIds
    query = query.in('empleado_id', employeeIds);
  } else if (rol === 'EMPLEADO') {
    // 1. Fetch Employee's employee ID
    const { data: empRecord, error: empErr } = await adminClient
      .from('empleados')
      .select('id')
      .eq('usuario_id', usuarioId)
      .maybeSingle();

    if (empErr) {
      console.error('Error fetching employee record:', empErr);
      throw new Error('Error al obtener datos del empleado');
    }

    const empleadoId = empRecord?.id;

    if (!empleadoId) {
      return [];
    }

    query = query.eq('empleado_id', empleadoId);
  } else {
    // Default fallback: empty (Reclutador, etc.)
    return [];
  }

  const { data, error } = await query.order('fecha', { ascending: false });

  if (error) {
    console.error('Error fetching filtered asistencias:', error);
    throw new Error('Error al obtener la asistencia');
  }

  return data as Asistencia[];
}

export async function registrarEntrada(empleado_id: string, fecha: string, hora_entrada: string) {
  const adminClient = createSupabaseAdminClient();

  // Validación para evitar duplicados en el mismo día
  const { data: existing, error: existErr } = await adminClient
    .from('asistencias')
    .select('id')
    .eq('empleado_id', empleado_id)
    .eq('fecha', fecha)
    .maybeSingle();

  if (existErr) {
    console.error('Error al comprobar asistencia existente:', existErr);
  }

  if (existing) {
    throw new Error('Ya se ha registrado una entrada para el día de hoy.');
  }

  const { data, error } = await adminClient
    .from('asistencias')
    .insert([{ empleado_id, fecha, hora_entrada }])
    .select()
    .single();

  if (error) {
    console.error('Error registrar entrada:', error);
    throw new Error(error.message || 'Error al registrar entrada');
  }

  return data as Asistencia;
}

export async function registrarSalida(id: string, hora_salida: string) {
  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from('asistencias')
    .update({ hora_salida })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error registrar salida:', error);
    throw new Error(error.message || 'Error al registrar salida');
  }

  return data as Asistencia;
}
