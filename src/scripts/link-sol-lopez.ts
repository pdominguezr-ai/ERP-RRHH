import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('🚀 Iniciando vinculación de Sol López como Jefe...');

  // 1. ID de usuario_sistema del jefe (jefe@rrhh.com)
  const jefeUsuarioId = 'b07da8e6-98ef-44ab-aaa6-e5913c5d56d6';

  // 2. Buscar si ya existe el empleado 'sol Lopez' (EMP-193813)
  const { data: solEmp, error: findError } = await supabase
    .from('empleados')
    .select('id')
    .eq('codigo', 'EMP-193813')
    .maybeSingle();

  let solEmpleadoId = '';

  if (solEmp) {
    solEmpleadoId = solEmp.id;
    console.log(`ℹ️ Encontrado empleado 'sol Lopez' con ID: ${solEmpleadoId}`);

    // Actualizar datos de Sol López
    const { error: updateError } = await supabase
      .from('empleados')
      .update({
        nombres: 'Sol',
        apellidos: 'López',
        correo: 'sol.lopez@empresa.com',
        usuario_id: jefeUsuarioId
      })
      .eq('id', solEmpleadoId);

    if (updateError) {
      console.error('❌ Error al actualizar empleado Sol López:', updateError.message);
      return;
    }
    console.log('✅ Empleado Sol López actualizado y vinculado con jefe@rrhh.com.');
  } else {
    // Si no existe, crear un registro para Sol López
    const { data: newSolEmp, error: insertError } = await supabase
      .from('empleados')
      .insert({
        codigo: 'EMP-003',
        nombres: 'Sol',
        apellidos: 'López',
        correo: 'sol.lopez@empresa.com',
        fecha_ingreso: '2020-03-01',
        puesto: 'Gerente de Operaciones',
        departamento: 'Operaciones',
        salario_base: 25000.00,
        estado: 'ACTIVO',
        usuario_id: jefeUsuarioId
      })
      .select('id')
      .single();

    if (insertError || !newSolEmp) {
      console.error('❌ Error al insertar empleado Sol López:', insertError?.message);
      return;
    }
    solEmpleadoId = newSolEmp.id;
    console.log(`✅ Creado y vinculado nuevo empleado Sol López con ID: ${solEmpleadoId}`);
  }

  // 3. Registrar en jefes_inmediatos
  const { data: existingJefeRel, error: findRelErr } = await supabase
    .from('jefes_inmediatos')
    .select('id')
    .eq('usuario_id', jefeUsuarioId)
    .maybeSingle();

  if (!existingJefeRel) {
    const { error: insertJefeRelErr } = await supabase
      .from('jefes_inmediatos')
      .insert({
        usuario_id: jefeUsuarioId,
        empleado_id: solEmpleadoId
      });

    if (insertJefeRelErr) {
      console.error('❌ Error al registrar en jefes_inmediatos:', insertJefeRelErr.message);
      return;
    }
    console.log('✅ Relación jefe_inmediato creada en jefes_inmediatos.');
  } else {
    // Actualizar por si acaso
    const { error: updateRelErr } = await supabase
      .from('jefes_inmediatos')
      .update({ empleado_id: solEmpleadoId })
      .eq('usuario_id', jefeUsuarioId);

    if (updateRelErr) {
      console.error('❌ Error al actualizar en jefes_inmediatos:', updateRelErr.message);
      return;
    }
    console.log('✅ Relación jefe_inmediato actualizada en jefes_inmediatos.');
  }

  // 4. Configurar Sol López como jefe de Paul Dominguez (EMP) y Samuel Lopez (EMP-557634)
  const { error: setJefeErr } = await supabase
    .from('empleados')
    .update({ jefe_inmediato_id: solEmpleadoId })
    .in('codigo', ['EMP', 'EMP-557634']);

  if (setJefeErr) {
    console.error('❌ Error al establecer jefe inmediato para los empleados:', setJefeErr.message);
    return;
  }
  console.log('✅ Sol López establecida como jefe de Carlos (Paul Dominguez) y Samuel López.');

  console.log('🎉 ¡Vinculación completada con éxito!');
}

run();
