import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('🚀 Iniciando configuración completa de vinculación y jerarquía...');

  // 1. IDs de usuarios_sistema
  const jefeUsuarioId = 'b07da8e6-98ef-44ab-aaa6-e5913c5d56d6'; // jefe@rrhh.com
  const empleadoUsuarioId = '1b57f11b-e309-4f34-988d-2fc8d25d258e'; // empleado@rrhh.com
  const paulEmpleadoId = '9e9c3ffa-ac47-4efc-bac8-7be99968462c'; // Primer Paul Dominguez

  // 2. Crear o buscar empleado para el jefe Luis Pérez Sánchez en 'empleados'
  let jefeEmpleadoRecordId = '';
  
  // Buscar si ya existe Luis Pérez Sánchez o un empleado con el correo jefe@rrhh.com
  const { data: existingJefeEmp, error: findJefeErr } = await supabase
    .from('empleados')
    .select('id')
    .eq('correo', 'jefe@rrhh.com')
    .maybeSingle();

  if (existingJefeEmp) {
    jefeEmpleadoRecordId = existingJefeEmp.id;
    console.log(`ℹ️ Empleado para jefe ya existe con ID: ${jefeEmpleadoRecordId}`);
  } else {
    // Insertar empleado Luis Pérez Sánchez
    const { data: newJefeEmp, error: insertJefeErr } = await supabase
      .from('empleados')
      .insert({
        codigo: 'EMP-BOSS',
        nombres: 'Luis',
        apellidos: 'Pérez Sánchez',
        correo: 'jefe@rrhh.com',
        fecha_ingreso: '2020-03-01',
        puesto: 'Gerente de Operaciones',
        departamento: 'Operaciones',
        salario_base: 25000.00,
        estado: 'ACTIVO',
        usuario_id: jefeUsuarioId
      })
      .select('id')
      .single();

    if (insertJefeErr || !newJefeEmp) {
      console.error('❌ Error al crear empleado para el jefe:', insertJefeErr?.message);
      return;
    }
    jefeEmpleadoRecordId = newJefeEmp.id;
    console.log(`✅ Empleado para jefe creado con ID: ${jefeEmpleadoRecordId}`);
  }

  // 3. Crear registro en 'jefes_inmediatos' si no existe
  const { data: existingJefeRel, error: findJefeRelErr } = await supabase
    .from('jefes_inmediatos')
    .select('id')
    .eq('usuario_id', jefeUsuarioId)
    .maybeSingle();

  if (!existingJefeRel) {
    const { error: insertJefeRelErr } = await supabase
      .from('jefes_inmediatos')
      .insert({
        usuario_id: jefeUsuarioId,
        empleado_id: jefeEmpleadoRecordId
      });
    
    if (insertJefeRelErr) {
      console.error('❌ Error al registrar en jefes_inmediatos:', insertJefeRelErr.message);
      return;
    }
    console.log('✅ Relación jefe_inmediato creada en jefes_inmediatos.');
  } else {
    console.log('ℹ️ Registro de jefe ya existe en jefes_inmediatos.');
  }

  // 4. Desvincular usuario_id del empleado de prueba anterior (para evitar conflictos de unicidad)
  const { error: unlinkError } = await supabase
    .from('empleados')
    .update({ usuario_id: null })
    .eq('usuario_id', empleadoUsuarioId);
  
  if (unlinkError) {
    console.warn('⚠️ Advertencia desvinculando previos:', unlinkError.message);
  }

  // 5. Vincular a Paul Dominguez (9e9c3ffa-ac47-4efc-bac8-7be99968462c) al usuario empleado y asignarle el jefe inmediato
  const { error: linkError } = await supabase
    .from('empleados')
    .update({
      usuario_id: empleadoUsuarioId,
      jefe_inmediato_id: jefeEmpleadoRecordId
    })
    .eq('id', paulEmpleadoId);

  if (linkError) {
    console.error('❌ Error al vincular Paul Dominguez:', linkError.message);
    return;
  }

  console.log('✅ Paul Dominguez vinculado con éxito.');

  // 6. Verificar
  const { data: result, error: resultErr } = await supabase
    .from('empleados')
    .select('id, nombres, apellidos, correo, codigo, usuario_id, jefe_inmediato_id')
    .eq('id', paulEmpleadoId)
    .single();

  if (resultErr) {
    console.error('❌ Error al verificar resultado final:', resultErr.message);
  } else {
    console.log('--- RESULTADO DE LA VINCULACIÓN ---');
    console.log(`Nombre: ${result.nombres} ${result.apellidos}`);
    console.log(`Código: ${result.codigo}`);
    console.log(`UsuarioID (usuarios_sistema): ${result.usuario_id}`);
    console.log(`Jefe Inmediato Empleado ID: ${result.jefe_inmediato_id}`);
  }
}

run();
