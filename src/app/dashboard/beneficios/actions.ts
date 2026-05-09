'use server';

import { revalidatePath } from 'next/cache';
import { createBeneficio as createDbBeneficio, updateBeneficio as updateDbBeneficio } from '@/services/beneficioService';
import type { BeneficioFormData } from '@/types/beneficio';

export async function createBeneficio(data: BeneficioFormData) {
  try {
    const result = await createDbBeneficio(data);
    revalidatePath('/dashboard/beneficios');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function updateBeneficio(id: string, data: Partial<BeneficioFormData>) {
  try {
    const result = await updateDbBeneficio(id, data);
    revalidatePath('/dashboard/beneficios');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
