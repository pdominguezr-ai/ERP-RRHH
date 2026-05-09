import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { 
  Candidato, CandidatoFormData, 
  ProcesoReclutamiento, ProcesoReclutamientoFormData 
} from '@/types/reclutamiento';

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
  const { data: newCandidato, error } = await supabase
    .from('candidatos')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating candidato:', error);
    throw new Error(error.message || 'Error al crear el candidato');
  }

  return newCandidato as Candidato;
}

export async function updateCandidato(id: string, data: Partial<CandidatoFormData>) {
  const supabase = await createSupabaseServerClient();
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

export async function createProcesoReclutamiento(data: ProcesoReclutamientoFormData) {
  const supabase = await createSupabaseServerClient();
  const { data: newProceso, error } = await supabase
    .from('procesos_reclutamiento')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating proceso:', error);
    throw new Error(error.message || 'Error al crear el proceso');
  }

  return newProceso as ProcesoReclutamiento;
}

export async function updateProcesoReclutamiento(id: string, data: Partial<ProcesoReclutamientoFormData>) {
  const supabase = await createSupabaseServerClient();
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

  return updatedProceso as ProcesoReclutamiento;
}
