'use server';

import { revalidatePath } from 'next/cache';
import { createCapacitacion as createDbCapacitacion, updateCapacitacion as updateDbCapacitacion } from '@/services/capacitacionService';
import type { CapacitacionFormData } from '@/types/capacitacion';

export async function createCapacitacion(data: CapacitacionFormData) {
  try {
    const result = await createDbCapacitacion(data);
    revalidatePath('/dashboard/capacitaciones');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function updateCapacitacion(id: string, data: Partial<CapacitacionFormData>) {
  try {
    const result = await updateDbCapacitacion(id, data);
    revalidatePath('/dashboard/capacitaciones');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
