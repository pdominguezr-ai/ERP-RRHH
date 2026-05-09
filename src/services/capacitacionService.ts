import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { Capacitacion, CapacitacionFormData, CapacitacionEmpleado } from '@/types/capacitacion';

export async function getCapacitaciones() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('capacitaciones')
    .select('*')
    .order('fecha_inicio', { ascending: false });

  if (error) {
    console.error('Error fetching capacitaciones:', error);
    throw new Error('Error al obtener las capacitaciones');
  }

  return data as Capacitacion[];
}

export async function createCapacitacion(data: CapacitacionFormData) {
  const supabase = await createSupabaseServerClient();
  const { data: newCapacitacion, error } = await supabase
    .from('capacitaciones')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating capacitacion:', error);
    throw new Error(error.message || 'Error al crear la capacitación');
  }

  return newCapacitacion as Capacitacion;
}

export async function updateCapacitacion(id: string, data: Partial<CapacitacionFormData>) {
  const supabase = await createSupabaseServerClient();
  const { data: updatedCapacitacion, error } = await supabase
    .from('capacitaciones')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating capacitacion:', error);
    throw new Error(error.message || 'Error al actualizar la capacitación');
  }

  return updatedCapacitacion as Capacitacion;
}

export async function getParticipantes(capacitacionId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('capacitacion_empleados')
    .select(`
      *,
      empleado:empleados(nombres, apellidos, departamento, puesto)
    `)
    .eq('capacitacion_id', capacitacionId);

  if (error) {
    console.error('Error fetching participantes:', error);
    throw new Error('Error al obtener participantes');
  }

  return data as CapacitacionEmpleado[];
}
