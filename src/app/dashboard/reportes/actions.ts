'use server';

import { revalidatePath } from 'next/cache';
import { createReporte as createDbReporte } from '@/services/reporteService';
import type { ReporteFormData } from '@/types/reporte';

export async function createReporte(data: ReporteFormData) {
  try {
    const result = await createDbReporte(data);
    revalidatePath('/dashboard/reportes');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
