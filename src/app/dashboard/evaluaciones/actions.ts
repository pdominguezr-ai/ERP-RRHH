'use server';

import { revalidatePath } from 'next/cache';
import { createEvaluacion as createDbEvaluacion, updateEvaluacion as updateDbEvaluacion } from '@/services/evaluacionService';
import type { EvaluacionFormData } from '@/types/evaluacion';

export async function createEvaluacion(data: EvaluacionFormData) {
  try {
    const result = await createDbEvaluacion(data);
    revalidatePath('/dashboard/evaluaciones');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function updateEvaluacion(id: string, data: Partial<EvaluacionFormData>) {
  try {
    const result = await updateDbEvaluacion(id, data);
    revalidatePath('/dashboard/evaluaciones');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
