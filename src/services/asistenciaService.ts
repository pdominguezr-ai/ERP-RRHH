import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { Asistencia } from '@/types/asistencia';

export async function getAsistencias() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('asistencias')
    .select(`
      *,
      empleado:empleados(nombres, apellidos, codigo)
    `)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error fetching asistencias:', error);
    throw new Error('Error al obtener la asistencia');
  }

  return data as Asistencia[];
}

export async function registrarEntrada(empleado_id: string, fecha: string, hora_entrada: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
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
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
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
