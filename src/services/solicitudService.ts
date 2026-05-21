import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { SolicitudAusencia, SolicitudAusenciaFormData } from '@/types/solicitudAusencia';
import { Validators } from '@/lib/validators';
import { registrarAuditoria } from './auditoriaService';

export async function getSolicitudes() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('solicitudes_ausencia')
    .select(`
      *,
      empleado:empleados(nombres, apellidos, codigo, departamento),
      aprobador:usuarios_sistema(correo)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching solicitudes:', error);
    throw new Error('Error al obtener las solicitudes');
  }

  return data as SolicitudAusencia[];
}

export async function createSolicitud(data: SolicitudAusenciaFormData) {
  const supabase = await createSupabaseServerClient();

  // Validaciones de negocio
  const val = Validators.solicitudAusencia({
    fecha_inicio: data.fecha_inicio,
    fecha_fin: data.fecha_fin,
    tipo: data.tipo
  });

  if (!val.valido) {
    throw new Error(val.error);
  }

  const { data: newSolicitud, error } = await supabase
    .from('solicitudes_ausencia')
    .insert([{
      ...data,
      estado: 'PENDIENTE',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating solicitud:', error);
    throw new Error(error.message || 'Error al crear la solicitud');
  }

  // Registrar auditoría de inserción
  await registrarAuditoria({
    tabla: 'solicitudes_ausencia',
    registro_id: newSolicitud.id,
    operacion: 'INSERT',
    datos_despues: newSolicitud
  });

  return newSolicitud as SolicitudAusencia;
}

export async function updateSolicitudEstado(
  id: string, 
  estado: 'APROBADA' | 'RECHAZADA', 
  observaciones?: string,
  aprobado_por?: string
) {
  const supabase = await createSupabaseServerClient();

  // 1. Obtener estado actual de la solicitud
  const { data: solicitudActual, error: fetchErr } = await supabase
    .from('solicitudes_ausencia')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !solicitudActual) {
    throw new Error('No se encontró la solicitud de ausencia.');
  }

  // 2. Validar que la solicitud esté PENDIENTE para ser procesada
  if (solicitudActual.estado !== 'PENDIENTE') {
    throw new Error(`Esta solicitud ya fue procesada y se encuentra en estado ${solicitudActual.estado}.`);
  }

  // 3. Proceder con la actualización de estado
  const { data: solicitudActualizada, error } = await supabase
    .from('solicitudes_ausencia')
    .update({ 
      estado, 
      observaciones: observaciones || null,
      aprobado_por: aprobado_por || null,
      fecha_aprobacion: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating solicitud:', error);
    throw new Error(error.message || 'Error al actualizar el estado de la solicitud');
  }

  // 4. Registrar auditoría del cambio de estado
  await registrarAuditoria({
    tabla: 'solicitudes_ausencia',
    registro_id: id,
    operacion: 'UPDATE',
    datos_antes: solicitudActual,
    datos_despues: solicitudActualizada
  });

  return solicitudActualizada as SolicitudAusencia;
}
