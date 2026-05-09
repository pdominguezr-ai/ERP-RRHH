import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { EvaluacionDesempeno, EvaluacionFormData } from '@/types/evaluacion';

export async function getEvaluaciones() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('evaluaciones_desempeno')
    .select(`
      *,
      empleado:empleados(nombres, apellidos, codigo, departamento)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching evaluaciones:', error);
    throw new Error('Error al obtener las evaluaciones');
  }

  return data as EvaluacionDesempeno[];
}

export async function createEvaluacion(data: EvaluacionFormData) {
  const supabase = await createSupabaseServerClient();
  
  // Set the current user as the evaluator
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('No estás autenticado');

  const { data: usuarioSistema } = await supabase
    .from('usuarios_sistema')
    .select('id')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (!usuarioSistema) throw new Error('Usuario del sistema no encontrado');

  const { data: newEvaluacion, error } = await supabase
    .from('evaluaciones_desempeno')
    .insert([{ ...data, evaluador_id: usuarioSistema.id }])
    .select()
    .single();

  if (error) {
    console.error('Error creating evaluacion:', error);
    throw new Error(error.message || 'Error al crear la evaluación');
  }

  return newEvaluacion as EvaluacionDesempeno;
}

export async function updateEvaluacion(id: string, data: Partial<EvaluacionFormData>) {
  const supabase = await createSupabaseServerClient();
  const { data: updatedEvaluacion, error } = await supabase
    .from('evaluaciones_desempeno')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating evaluacion:', error);
    throw new Error(error.message || 'Error al actualizar la evaluación');
  }

  return updatedEvaluacion as EvaluacionDesempeno;
}
