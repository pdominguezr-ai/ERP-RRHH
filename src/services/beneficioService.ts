import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { Beneficio, BeneficioFormData, EmpleadoBeneficio } from '@/types/beneficio';

export async function getBeneficios() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('beneficios')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching beneficios:', error);
    throw new Error('Error al obtener los beneficios');
  }

  return data as Beneficio[];
}

export async function createBeneficio(data: BeneficioFormData) {
  const supabase = await createSupabaseServerClient();
  const { data: newBeneficio, error } = await supabase
    .from('beneficios')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating beneficio:', error);
    throw new Error(error.message || 'Error al crear el beneficio');
  }

  return newBeneficio as Beneficio;
}

export async function updateBeneficio(id: string, data: Partial<BeneficioFormData>) {
  const supabase = await createSupabaseServerClient();
  const { data: updatedBeneficio, error } = await supabase
    .from('beneficios')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating beneficio:', error);
    throw new Error(error.message || 'Error al actualizar el beneficio');
  }

  return updatedBeneficio as Beneficio;
}

export async function getAsignaciones() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('empleado_beneficios')
    .select(`
      *,
      empleado:empleados(nombres, apellidos, departamento),
      beneficio:beneficios(nombre, monto)
    `)
    .order('fecha_asignacion', { ascending: false });

  if (error) {
    console.error('Error fetching asignaciones:', error);
    throw new Error('Error al obtener asignaciones');
  }

  return data as EmpleadoBeneficio[];
}
