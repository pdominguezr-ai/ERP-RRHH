import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('🚀 Vinculando usuario empleado@rrhh.com con un único empleado libre...');

  // 1. Obtener usuarios_sistema para empleado@rrhh.com y jefe@rrhh.com
  const { data: empleadoUser, error: empUserErr } = await supabase
    .from('usuarios_sistema')
    .select('id, correo, rol')
    .eq('correo', 'empleado@rrhh.com')
    .single();

  if (empUserErr || !empleadoUser) {
    console.error('❌ No se encontró el usuario empleado@rrhh.com en usuarios_sistema:', empUserErr?.message);
    return;
  }

  // Asegurar que el rol en usuarios_sistema sea exactamente EMPLEADO
  if (empleadoUser.rol !== 'EMPLEADO') {
    await supabase
      .from('usuarios_sistema')
      .update({ rol: 'EMPLEADO', activo: true })
      .eq('id', empleadoUser.id);
  }

  const empleadoUsuarioId = empleadoUser.id;
  const solEmpleadoId = '0d2e9fdd-9dd9-41e8-9cb4-10dc456d758b'; // Sol López (Jefa)
  const jefeUsuarioId = 'b07da8e6-98ef-44ab-aaa6-e5913c5d56d6'; // jefe@rrhh.com

  // 2. Asegurar que Sol López tenga su usuario_id de jefe@rrhh.com
  await supabase
    .from('empleados')
    .update({ usuario_id: jefeUsuarioId })
    .eq('id', solEmpleadoId);

  // 3. Limpiar cualquier vínculo previo duplicado de empleado@rrhh.com en empleados
  const { error: unlinkErr } = await supabase
    .from('empleados')
    .update({ usuario_id: null })
    .eq('usuario_id', empleadoUsuarioId);

  if (unlinkErr) {
    console.error('❌ Error al limpiar vínculos previos:', unlinkErr.message);
    return;
  }
  console.log('🧹 Vínculos duplicados anteriores limpiados.');

  // 4. Vincular a Carlos García López (EMP-001) como único empleado de empleado@rrhh.com
  const targetEmpleadoId = 'b1000000-0000-0000-0000-000000000001'; // Carlos García López (EMP-001)
  const { data: linkedEmp, error: linkErr } = await supabase
    .from('empleados')
    .update({
      usuario_id: empleadoUsuarioId,
      jefe_inmediato_id: solEmpleadoId,
      estado: 'ACTIVO',
    })
    .eq('id', targetEmpleadoId)
    .select('id, codigo, nombres, apellidos, correo, puesto, departamento, usuario_id, jefe_inmediato_id')
    .single();

  if (linkErr || !linkedEmp) {
    console.error('❌ Error al vincular empleado:', linkErr?.message);
    return;
  }

  console.log(`✅ Empleado vinculado exitosamente: ${linkedEmp.nombres} ${linkedEmp.apellidos} (${linkedEmp.codigo})`);

  // 5. Asegurar datos de muestra para este empleado (asistencias, solicitudes, beneficios, capacitaciones, evaluación)
  // 5.1 Asistencias
  await supabase.from('asistencias').upsert(
    [
      {
        empleado_id: targetEmpleadoId,
        fecha: '2026-05-21',
        hora_entrada: '08:00:00',
        hora_salida: '17:00:00',
        observaciones: 'Jornada regular completa',
      },
      {
        empleado_id: targetEmpleadoId,
        fecha: '2026-05-22',
        hora_entrada: '08:05:00',
        hora_salida: '17:10:00',
        observaciones: 'Jornada regular completa',
      },
    ],
    { onConflict: 'empleado_id,fecha' }
  );

  // 5.2 Solicitudes de ausencia (si no tiene aún)
  const { count: solCount } = await supabase
    .from('solicitudes_ausencia')
    .select('*', { count: 'exact', head: true })
    .eq('empleado_id', targetEmpleadoId);

  if (!solCount || solCount === 0) {
    await supabase.from('solicitudes_ausencia').insert([
      {
        empleado_id: targetEmpleadoId,
        tipo: 'VACACIONES',
        fecha_inicio: '2026-06-15',
        fecha_fin: '2026-06-19',
        motivo: 'Vacaciones anuales programadas',
        estado: 'APROBADA',
        aprobado_por: jefeUsuarioId,
        fecha_aprobacion: new Date().toISOString(),
        observaciones: 'Aprobado por supervisión',
      },
      {
        empleado_id: targetEmpleadoId,
        tipo: 'PERMISO',
        fecha_inicio: '2026-06-25',
        fecha_fin: '2026-06-25',
        motivo: 'Diligencia personal médica',
        estado: 'PENDIENTE',
      },
    ]);
  }

  // 5.3 Beneficios activos
  const { data: beneficiosActivos } = await supabase
    .from('beneficios')
    .select('id')
    .eq('estado', 'ACTIVO')
    .limit(2);

  if (beneficiosActivos && beneficiosActivos.length > 0) {
    for (const ben of beneficiosActivos) {
      await supabase.from('empleado_beneficios').upsert(
        {
          empleado_id: targetEmpleadoId,
          beneficio_id: ben.id,
          fecha_asignacion: '2026-01-15',
          activo: true,
        },
        { onConflict: 'empleado_id,beneficio_id' }
      );
    }
  }

  // 5.4 Capacitaciones inscritas
  const { data: capacitacionesList } = await supabase
    .from('capacitaciones')
    .select('id, estado')
    .limit(2);

  if (capacitacionesList && capacitacionesList.length > 0) {
    for (const cap of capacitacionesList) {
      const completada = cap.estado === 'FINALIZADA';
      await supabase.from('capacitacion_empleados').upsert(
        {
          capacitacion_id: cap.id,
          empleado_id: targetEmpleadoId,
          completada,
          calificacion: completada ? 92 : null,
        },
        { onConflict: 'capacitacion_id,empleado_id' }
      );
    }
  }

  // 5.5 Evaluación de desempeño
  const { count: evalCount } = await supabase
    .from('evaluaciones_desempeno')
    .select('*', { count: 'exact', head: true })
    .eq('empleado_id', targetEmpleadoId);

  if (!evalCount || evalCount === 0) {
    await supabase.from('evaluaciones_desempeno').insert({
      empleado_id: targetEmpleadoId,
      evaluador_id: jefeUsuarioId,
      periodo: '2026-S1',
      calificacion: 90,
      comentarios: 'Excelente compromiso técnico y colaboración con el equipo.',
      metas_cumplidas: 'Entrega puntual de módulos asignados y cumplimiento de estándares de calidad.',
      areas_mejora: 'Continuar fortaleciendo habilidades de liderazgo técnico.',
      estado: 'FINALIZADA',
    });
  }

  console.log('🎉 ¡Vinculación y datos del portal de empleado configurados correctamente!');
}

run();
