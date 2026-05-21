import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { Nomina, NominaFormData, DetalleNomina } from '@/types/nomina';
import { Validators } from '@/lib/validators';
import { registrarAuditoria } from './auditoriaService';

export async function getNominas() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('nominas')
    .select(`
      *,
      usuario:usuarios_sistema(correo)
    `)
    .order('periodo_inicio', { ascending: false });

  if (error) {
    console.error('Error fetching nominas:', error);
    throw new Error('Error al obtener las nóminas');
  }

  return data as Nomina[];
}

export async function getNominaDetalles(nominaId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('detalle_nomina')
    .select(`
      *,
      empleado:empleados(nombres, apellidos, codigo, departamento, puesto, estado)
    `)
    .eq('nomina_id', nominaId);

  if (error) {
    console.error('Error fetching nomina detalles:', error);
    throw new Error('Error al obtener los detalles de la nómina');
  }

  return data as (DetalleNomina & { empleado?: { nombres: string; apellidos: string; codigo: string; departamento: string; puesto: string; estado: string } })[];
}

export async function createNomina(data: NominaFormData) {
  const supabase = await createSupabaseServerClient();
  
  // Validar periodo
  const valPeriodo = Validators.nomina({ periodo_inicio: data.periodo_inicio, periodo_fin: data.periodo_fin });
  if (!valPeriodo.valido) {
    throw new Error(valPeriodo.error);
  }

  // 1. Obtener empleados activos
  const { data: empleadosActivos, error: empError } = await supabase
    .from('empleados')
    .select('id, salario_base')
    .eq('estado', 'ACTIVO');

  if (empError || !empleadosActivos) throw new Error('Error al obtener empleados activos para la nómina');
  if (empleadosActivos.length === 0) throw new Error('No hay empleados activos en el sistema para generar una nómina');

  // 2. Calcular totales pre-procesados
  let total_bruto = 0;
  empleadosActivos.forEach(e => total_bruto += Number(e.salario_base));

  // 3. Crear cabecera de nómina
  const { data: nuevaNomina, error: nomError } = await supabase
    .from('nominas')
    .insert([{ 
      periodo_inicio: data.periodo_inicio,
      periodo_fin: data.periodo_fin,
      observaciones: data.observaciones,
      estado: 'BORRADOR',
      total_bruto,
      total_deducciones: 0,
      total_bonificaciones: 0,
      total_neto: total_bruto,
    }])
    .select()
    .single();

  if (nomError) throw new Error(nomError.message || 'Error al crear la nómina');

  // 4. Crear detalles (salarios base)
  const detalles = empleadosActivos.map(e => ({
    nomina_id: nuevaNomina.id,
    empleado_id: e.id,
    salario_base: e.salario_base,
    bonificaciones: 0,
    deducciones: 0,
    retenciones: 0,
  }));

  const { error: detError } = await supabase.from('detalle_nomina').insert(detalles);

  if (detError) throw new Error('Error al generar los detalles de la nómina');

  // Registrar en auditoría la creación
  await registrarAuditoria({
    tabla: 'nominas',
    registro_id: nuevaNomina.id,
    operacion: 'INSERT',
    datos_despues: nuevaNomina
  });

  return nuevaNomina as Nomina;
}

export async function updateDetalleNomina(
  detalleId: string,
  data: { bonificaciones: number; deducciones: number; retenciones: number; observaciones?: string }
) {
  const supabase = await createSupabaseServerClient();

  // Obtener el detalle actual para validar
  const { data: detalleActual, error: fetchErr } = await supabase
    .from('detalle_nomina')
    .select('*')
    .eq('id', detalleId)
    .single();

  if (fetchErr || !detalleActual) {
    throw new Error('No se encontró el detalle de nómina especificado.');
  }

  // Obtener nómina para verificar que esté en BORRADOR
  const { data: nomina, error: nomErr } = await supabase
    .from('nominas')
    .select('estado')
    .eq('id', detalleActual.nomina_id)
    .single();

  if (nomErr || !nomina) {
    throw new Error('No se encontró la nómina asociada.');
  }

  if (nomina.estado !== 'BORRADOR') {
    throw new Error('Únicamente se pueden editar detalles de una nómina en estado BORRADOR.');
  }

  // Validar negocio
  const valDetalle = Validators.detalleNomina({
    salario_base: Number(detalleActual.salario_base),
    bonificaciones: data.bonificaciones,
    deducciones: data.deducciones,
    retenciones: data.retenciones
  });

  if (!valDetalle.valido) {
    throw new Error(valDetalle.error);
  }

  // Actualizar detalle
  const { data: detalleActualizado, error: updateErr } = await supabase
    .from('detalle_nomina')
    .update({
      bonificaciones: data.bonificaciones,
      deducciones: data.deducciones,
      retenciones: data.retenciones,
      observaciones: data.observaciones || null
    })
    .eq('id', detalleId)
    .select()
    .single();

  if (updateErr) {
    throw new Error('Error al actualizar el detalle de nómina: ' + updateErr.message);
  }

  // Registrar auditoría de la modificación
  await registrarAuditoria({
    tabla: 'detalle_nomina',
    registro_id: detalleId,
    operacion: 'UPDATE',
    datos_antes: detalleActual,
    datos_despues: detalleActualizado
  });

  // Recalcular totales de la nómina
  await recalcularTotalesNomina(detalleActual.nomina_id);

  return detalleActualizado;
}

export async function recalcularTotalesNomina(nominaId: string) {
  const supabase = await createSupabaseServerClient();

  // Obtener todos los detalles actuales
  const { data: detalles, error: detErr } = await supabase
    .from('detalle_nomina')
    .select('salario_base, bonificaciones, deducciones, retenciones, salario_neto')
    .eq('nomina_id', nominaId);

  if (detErr || !detalles) {
    throw new Error('Error al obtener los detalles para recalcular: ' + (detErr?.message || ''));
  }

  let total_bruto = 0;
  let total_bonificaciones = 0;
  let total_deducciones = 0;
  let total_neto = 0;

  detalles.forEach(d => {
    total_bruto += Number(d.salario_base);
    total_bonificaciones += Number(d.bonificaciones);
    total_deducciones += Number(d.deducciones) + Number(d.retenciones);
    total_neto += Number(d.salario_neto);
  });

  const { data: nominaActualizada, error: nomErr } = await supabase
    .from('nominas')
    .update({
      total_bruto,
      total_bonificaciones,
      total_deducciones,
      total_neto
    })
    .eq('id', nominaId)
    .select()
    .single();

  if (nomErr) {
    throw new Error('Error al actualizar los totales de la nómina: ' + nomErr.message);
  }

  return nominaActualizada as Nomina;
}

export async function procesarNomina(nominaId: string) {
  const supabase = await createSupabaseServerClient();

  // 1. Obtener cabecera
  const { data: nomina, error: nomErr } = await supabase
    .from('nominas')
    .select('*')
    .eq('id', nominaId)
    .single();

  if (nomErr || !nomina) {
    throw new Error('No se encontró la nómina especificada.');
  }

  // 2. Verificar estado actual
  if (nomina.estado !== 'BORRADOR') {
    throw new Error(`No se puede procesar una nómina en estado ${nomina.estado}. Solo se permiten nóminas en BORRADOR.`);
  }

  // 3. Obtener detalles y verificar existencia
  const detalles = await getNominaDetalles(nominaId);
  if (detalles.length === 0) {
    throw new Error('No se puede procesar una nómina sin detalles de empleados.');
  }

  // 4. Validar que todos los empleados de los detalles estén ACTIVOS
  for (const det of detalles) {
    if (!det.empleado || det.empleado.estado !== 'ACTIVO') {
      throw new Error(`No se puede procesar la nómina porque el empleado ${det.empleado?.nombres || ''} ${det.empleado?.apellidos || ''} (${det.empleado?.codigo || 'Sin código'}) no está en estado ACTIVO.`);
    }
  }

  // 5. Recalcular totales para asegurar consistencia
  await recalcularTotalesNomina(nominaId);

  // 6. Cambiar estado a PROCESADA
  const { data: nominaProcesada, error: updateErr } = await supabase
    .from('nominas')
    .update({ estado: 'PROCESADA' })
    .eq('id', nominaId)
    .select()
    .single();

  if (updateErr) {
    throw new Error('Error al procesar la nómina: ' + updateErr.message);
  }

  // 7. Registrar auditoría del cambio de estado
  await registrarAuditoria({
    tabla: 'nominas',
    registro_id: nominaId,
    operacion: 'UPDATE',
    datos_antes: nomina,
    datos_despues: nominaProcesada
  });

  return nominaProcesada as Nomina;
}

export async function updateNominaEstado(id: string, estado: 'BORRADOR' | 'PROCESADA' | 'PAGADA' | 'ANULADA') {
  const supabase = await createSupabaseServerClient();

  // Obtener estado anterior para auditoria
  const { data: antes } = await supabase
    .from('nominas')
    .select('*')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('nominas')
    .update({ estado })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error('Error al actualizar el estado de la nómina');

  // Registrar auditoria
  await registrarAuditoria({
    tabla: 'nominas',
    registro_id: id,
    operacion: 'UPDATE',
    datos_antes: antes,
    datos_despues: data
  });

  return data as Nomina;
}
