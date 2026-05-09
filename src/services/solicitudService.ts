import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { SolicitudAusencia, SolicitudAusenciaFormData } from '@/types/solicitudAusencia';

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

  return newSolicitud as SolicitudAusencia;
}

export async function updateSolicitudEstado(
  id: string, 
  estado: 'APROBADA' | 'RECHAZADA', 
  observaciones?: string,
  aprobado_por?: string
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('solicitudes_ausencia')
    .update({ 
      estado, 
      observaciones,
      aprobado_por,
      fecha_aprobacion: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating solicitud:', error);
    throw new Error(error.message || 'Error al actualizar el estado de la solicitud');
  }

  return data as SolicitudAusencia;
}
