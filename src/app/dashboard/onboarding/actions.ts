'use server';

import { revalidatePath } from 'next/cache';
import { createOnboarding, updateOnboardingEstado } from '@/services/onboardingService';
import type { OnboardingFormData } from '@/types/onboarding';

export async function createOnboardingAction(data: OnboardingFormData) {
  try {
    await createOnboarding(data);
    revalidatePath('/dashboard/onboarding');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function updateEstadoAction(id: string, estado: string) {
  try {
    await updateOnboardingEstado(id, estado);
    revalidatePath('/dashboard/onboarding');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
