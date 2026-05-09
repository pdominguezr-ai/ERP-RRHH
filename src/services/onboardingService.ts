import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { Onboarding, OnboardingFormData } from '@/types/onboarding';

export async function getOnboardings(): Promise<Onboarding[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('onboarding')
    .select(`
      *,
      empleado:empleados(nombres, apellidos, codigo)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching onboardings:', error);
    throw new Error(`[Supabase] ${error.code} – ${error.message}`);
  }

  return (data ?? []) as Onboarding[];
}

export async function createOnboarding(data: OnboardingFormData): Promise<Onboarding> {
  const supabase = await createSupabaseServerClient();
  const { data: newRecord, error } = await supabase
    .from('onboarding')
    .insert([{ ...data, estado: 'PENDIENTE' }])
    .select()
    .single();

  if (error) {
    console.error('Error creating onboarding:', error);
    throw new Error(error.message || 'Error al crear el proceso de onboarding');
  }

  return newRecord as Onboarding;
}

export async function updateOnboardingEstado(id: string, estado: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('onboarding')
    .update({ estado })
    .eq('id', id);

  if (error) {
    console.error('Error updating onboarding:', error);
    throw new Error(error.message || 'Error al actualizar el estado');
  }
}
