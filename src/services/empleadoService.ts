import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { Empleado, EmpleadoFormData } from '@/types/empleado';
import { generarCodigoEmpleado } from '@/lib/utils';

export async function getEmpleados() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('empleados')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching empleados:', error);
    throw new Error(`[Supabase] ${error.code} – ${error.message}`);
  }

  return data as Empleado[];
}

export async function getEmpleado(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('empleados')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching empleado:', error);
    throw new Error('Error al obtener el empleado');
  }

  return data as Empleado;
}

export async function createEmpleado(data: EmpleadoFormData) {
  const supabase = await createSupabaseServerClient();
  
  // Generar código si no viene
  const codigo = data.codigo || generarCodigoEmpleado();

  const { data: newEmpleado, error } = await supabase
    .from('empleados')
    .insert([{ ...data, codigo }])
    .select()
    .single();

  if (error) {
    console.error('Error creating empleado:', error);
    throw new Error(error.message || 'Error al crear el empleado');
  }

  return newEmpleado as Empleado;
}

export async function updateEmpleado(id: string, data: Partial<EmpleadoFormData>) {
  const supabase = await createSupabaseServerClient();
  const { data: updatedEmpleado, error } = await supabase
    .from('empleados')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating empleado:', error);
    throw new Error(error.message || 'Error al actualizar el empleado');
  }

  return updatedEmpleado as Empleado;
}

export async function deactivateEmpleado(id: string) {
  return updateEmpleado(id, { estado: 'INACTIVO' });
}

export async function reactivateEmpleado(id: string) {
  return updateEmpleado(id, { estado: 'ACTIVO' });
}
