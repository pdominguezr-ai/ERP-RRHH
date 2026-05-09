'use server';

import { revalidatePath } from 'next/cache';
import { createCumplimiento as createDbCumplimiento, updateCumplimiento as updateDbCumplimiento } from '@/services/cumplimientoService';
import type { CumplimientoFormData } from '@/types/cumplimiento';

export async function createCumplimiento(data: CumplimientoFormData) {
  try {
    const result = await createDbCumplimiento(data);
    revalidatePath('/dashboard/cumplimiento');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function updateCumplimiento(id: string, data: Partial<CumplimientoFormData>) {
  try {
    const result = await updateDbCumplimiento(id, data);
    revalidatePath('/dashboard/cumplimiento');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
