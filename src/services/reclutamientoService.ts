import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { 
  Candidato, CandidatoFormData, 
  ProcesoReclutamiento, ProcesoReclutamientoFormData 
} from '@/types/reclutamiento';
import { registrarAuditoria } from './auditoriaService';
import { Validators } from '@/lib/validators';

// --- Candidatos ---

export async function getCandidatos() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('candidatos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching candidatos:', error);
    throw new Error('Error al obtener los candidatos');
  }

  return data as Candidato[];
}

export async function getCandidato(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('candidatos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching candidato:', error);
    throw new Error('Error al obtener el candidato');
  }

  return data as Candidato;
}

export async function createCandidato(data: CandidatoFormData) {
  const supabase = await createSupabaseServerClient();
  
  if (!data.nombres || !data.apellidos) throw new Error('Nombre y apellido son obligatorios');
  
  const { data: newCandidato, error } = await supabase
    .from('candidatos')
    .insert([{
      ...data,
      estado: 'REGISTRADO'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating candidato:', error);
    throw new Error(error.message || 'Error al crear el candidato');
  }

  // Auditoria
  await registrarAuditoria({
    tabla: 'candidatos',
    registro_id: newCandidato.id,
    operacion: 'INSERT',
    datos_despues: newCandidato
  });

  return newCandidato as Candidato;
}

export async function updateCandidato(id: string, data: Partial<CandidatoFormData>) {
  const supabase = await createSupabaseServerClient();

  const { data: antes } = await supabase
    .from('candidatos')
    .select('*')
    .eq('id', id)
    .single();

  const { data: updatedCandidato, error } = await supabase
    .from('candidatos')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating candidato:', error);
    throw new Error(error.message || 'Error al actualizar el candidato');
  }

  // Auditoria
  await registrarAuditoria({
    tabla: 'candidatos',
    registro_id: id,
    operacion: 'UPDATE',
    datos_antes: antes,
    datos_despues: updatedCandidato
  });

  return updatedCandidato as Candidato;
}

// --- Procesos de Reclutamiento ---

export async function getProcesosReclutamiento() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('procesos_reclutamiento')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching procesos:', error);
    throw new Error('Error al obtener los procesos');
  }

  return data as ProcesoReclutamiento[];
}

export async function getProcesoReclutamiento(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('procesos_reclutamiento')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching proceso:', error);
    throw new Error('Error al obtener el proceso de reclutamiento');
  }

  return data as ProcesoReclutamiento;
}

export async function createProcesoReclutamiento(data: ProcesoReclutamientoFormData) {
  const supabase = await createSupabaseServerClient();
  
  if (!data.titulo || !data.puesto || !data.departamento) throw new Error('Título, puesto y departamento son obligatorios');

  const { data: newProceso, error } = await supabase
    .from('procesos_reclutamiento')
    .insert([{
      ...data,
      estado: 'ABIERTO',
      fecha_apertura: data.fecha_apertura || new Date().toISOString().split('T')[0]
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating proceso:', error);
    throw new Error(error.message || 'Error al crear el proceso');
  }

  // Auditoria
  await registrarAuditoria({
    tabla: 'procesos_reclutamiento',
    registro_id: newProceso.id,
    operacion: 'INSERT',
    datos_despues: newProceso
  });

  return newProceso as ProcesoReclutamiento;
}

export async function updateProcesoReclutamiento(id: string, data: Partial<ProcesoReclutamiento>) {
  const supabase = await createSupabaseServerClient();

  const { data: antes } = await supabase
    .from('procesos_reclutamiento')
    .select('*')
    .eq('id', id)
    .single();

  const { data: updatedProceso, error } = await supabase
    .from('procesos_reclutamiento')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating proceso:', error);
    throw new Error(error.message || 'Error al actualizar el proceso');
  }

  // Auditoria
  await registrarAuditoria({
    tabla: 'procesos_reclutamiento',
    registro_id: id,
    operacion: 'UPDATE',
    datos_antes: antes,
    datos_despues: updatedProceso
  });

  return updatedProceso as ProcesoReclutamiento;
}

// --- Relación Proceso ↔ Candidato ---

export async function vincularCandidatoAProceso(
  procesoId: string, 
  candidatoId: string, 
  etapa = 'POSTULACION', 
  observaciones?: string
) {
  const supabase = await createSupabaseServerClient();

  // Validar si el proceso está cerrado o cancelado
  const proceso = await getProcesoReclutamiento(procesoId);
  if (proceso.estado === 'CERRADO' || proceso.estado === 'CANCELADO') {
    throw new Error('No se pueden vincular candidatos a un proceso que ya está CERRADO o CANCELADO.');
  }

  const { data, error } = await supabase
    .from('proceso_reclutamiento_candidatos')
    .insert([{
      proceso_id: procesoId,
      candidato_id: candidatoId,
      etapa,
      observaciones
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('El candidato ya está vinculado a este proceso.');
    }
    throw new Error('Error al vincular el candidato al proceso: ' + error.message);
  }

  // Cambiar el estado del candidato a 'EN_PROCESO'
  await updateCandidato(candidatoId, { estado: 'EN_PROCESO' });

  return data;
}

export async function getCandidatosPorProceso(procesoId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('proceso_reclutamiento_candidatos')
    .select(`
      etapa,
      observaciones,
      candidato:candidatos(*)
    `)
    .eq('proceso_id', procesoId);

  if (error) {
    console.error('Error fetching candidatos por proceso:', error);
    throw new Error('Error al obtener los candidatos del proceso');
  }

  return data as unknown as { etapa: string; observaciones: string; candidato: Candidato }[];
}

export async function actualizarEtapaCandidatoProceso(
  procesoId: string,
  candidatoId: string,
  etapa: string,
  observaciones?: string
) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('proceso_reclutamiento_candidatos')
    .update({ etapa, observaciones })
    .match({ proceso_id: procesoId, candidato_id: candidatoId })
    .select()
    .single();

  if (error) {
    throw new Error('Error al actualizar la etapa del candidato: ' + error.message);
  }

  return data;
}

// --- Selección de Candidato y Contratación / Onboarding ---

export async function seleccionarCandidato(
  candidatoId: string,
  procesoId: string,
  responsableId?: string
) {
  const supabase = await createSupabaseServerClient();

  // 1. Obtener Proceso y validar estado
  const proceso = await getProcesoReclutamiento(procesoId);
  if (proceso.estado === 'CERRADO' || proceso.estado === 'CANCELADO') {
    throw new Error('El proceso de reclutamiento ya se encuentra CERRADO o CANCELADO.');
  }

  // 2. Obtener Candidato
  const candidato = await getCandidato(candidatoId);
  if (candidato.estado === 'SELECCIONADO') {
    throw new Error('Este candidato ya ha sido seleccionado.');
  }

  // 3. Crear empleado en la tabla empleados
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const codEmpleado = `EMP-${randNum}`;

  const { data: nuevoEmpleado, error: empErr } = await supabase
    .from('empleados')
    .insert([{
      codigo: codEmpleado,
      nombres: candidato.nombres,
      apellidos: candidato.apellidos,
      correo: candidato.correo,
      telefono: candidato.telefono || null,
      fecha_ingreso: new Date().toISOString().split('T')[0],
      puesto: proceso.puesto,
      departamento: proceso.departamento,
      salario_base: 2000.00, // Salario base por defecto inicial
      estado: 'ACTIVO'
    }])
    .select()
    .single();

  if (empErr) {
    console.error('Error creando empleado al contratar:', empErr);
    throw new Error('Error al dar de alta al empleado: ' + empErr.message);
  }

  // Auditoria empleado nuevo
  await registrarAuditoria({
    tabla: 'empleados',
    registro_id: nuevoEmpleado.id,
    operacion: 'INSERT',
    datos_despues: nuevoEmpleado,
    usuario_id: responsableId
  });

  // 4. Crear Onboarding en estado PENDIENTE
  const { data: nuevoOnboarding, error: onbErr } = await supabase
    .from('onboarding')
    .insert([{
      empleado_id: nuevoEmpleado.id,
      fecha_inicio: new Date().toISOString().split('T')[0],
      estado: 'PENDIENTE',
      responsable_id: responsableId || null,
      observaciones: `Onboarding automatizado generado desde el proceso de reclutamiento: ${proceso.titulo}`
    }])
    .select()
    .single();

  if (onbErr) {
    console.error('Error creando onboarding al contratar:', onbErr);
    // Nota: preferimos no hacer rollback para no invalidar el empleado, o podemos advertir.
    throw new Error('Empleado registrado pero falló la creación de su onboarding: ' + onbErr.message);
  }

  // Auditoria onboarding
  await registrarAuditoria({
    tabla: 'onboarding',
    registro_id: nuevoOnboarding.id,
    operacion: 'INSERT',
    datos_despues: nuevoOnboarding,
    usuario_id: responsableId
  });

  // 5. Cambiar estado del candidato a SELECCIONADO
  const candidatoPrevio = { ...candidato };
  const candidatoActualizado = await updateCandidato(candidatoId, { estado: 'SELECCIONADO' });

  // 6. Cambiar estado de los OTROS candidatos vinculados a este proceso a RECHAZADO
  const { data: vinculaciones } = await supabase
    .from('proceso_reclutamiento_candidatos')
    .select('candidato_id')
    .eq('proceso_id', procesoId)
    .neq('candidato_id', candidatoId);

  if (vinculaciones && vinculaciones.length > 0) {
    const otrosIds = vinculaciones.map(v => v.candidato_id);
    // Cambiar estado a RECHAZADO para los otros
    for (const otId of otrosIds) {
      await updateCandidato(otId, { estado: 'RECHAZADO' });
    }
  }

  // 7. Cambiar estado del Proceso a CERRADO
  const procesoPrevio = { ...proceso };
  const procesoActualizado = await updateProcesoReclutamiento(procesoId, {
    estado: 'CERRADO',
    fecha_cierre: new Date().toISOString().split('T')[0]
  });

  return {
    empleado: nuevoEmpleado,
    onboarding: nuevoOnboarding,
    candidato: candidatoActualizado,
    proceso: procesoActualizado
  };
}
