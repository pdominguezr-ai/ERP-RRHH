'use server';

import { revalidatePath } from 'next/cache';
import { createNomina as createDbNomina, updateNominaEstado } from '@/services/nominaService';
import type { NominaFormData } from '@/types/nomina';

export async function createNomina(data: NominaFormData) {
  try {
    const result = await createDbNomina(data);
    revalidatePath('/dashboard/nomina');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function setNominaEstado(id: string, estado: 'BORRADOR' | 'PROCESADA' | 'PAGADA' | 'ANULADA') {
  try {
    const result = await updateNominaEstado(id, estado);
    revalidatePath('/dashboard/nomina');
    revalidatePath(`/dashboard/nomina/${id}`);
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
