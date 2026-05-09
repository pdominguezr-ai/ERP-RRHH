import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { CumplimientoLaboral, CumplimientoFormData } from '@/types/cumplimiento';

export async function getCumplimientos() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('cumplimiento_laboral')
    .select('*')
    .order('fecha_limite', { ascending: true });

  if (error) {
    console.error('Error fetching cumplimientos:', error);
    throw new Error('Error al obtener los registros de cumplimiento');
  }

  return data as CumplimientoLaboral[];
}

export async function createCumplimiento(data: CumplimientoFormData) {
  const supabase = await createSupabaseServerClient();
  const { data: newCumplimiento, error } = await supabase
    .from('cumplimiento_laboral')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating cumplimiento:', error);
    throw new Error(error.message || 'Error al crear el registro de cumplimiento');
  }

  return newCumplimiento as CumplimientoLaboral;
}

export async function updateCumplimiento(id: string, data: Partial<CumplimientoFormData>) {
  const supabase = await createSupabaseServerClient();
  const { data: updatedCumplimiento, error } = await supabase
    .from('cumplimiento_laboral')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating cumplimiento:', error);
    throw new Error(error.message || 'Error al actualizar el registro de cumplimiento');
  }

  return updatedCumplimiento as CumplimientoLaboral;
}
