'use server';

import { revalidatePath } from 'next/cache';
import { 
  createNomina as createDbNomina, 
  updateNominaEstado,
  updateDetalleNomina,
  procesarNomina
} from '@/services/nominaService';
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

export async function updateDetalleNominaAction(
  detalleId: string,
  nominaId: string,
  data: { bonificaciones: number; deducciones: number; retenciones: number; observaciones?: string }
) {
  try {
    const result = await updateDetalleNomina(detalleId, data);
    revalidatePath('/dashboard/nomina');
    revalidatePath(`/dashboard/nomina/${nominaId}`);
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar el detalle' };
  }
}

export async function procesarNominaAction(nominaId: string) {
  try {
    const result = await procesarNomina(nominaId);
    revalidatePath('/dashboard/nomina');
    revalidatePath(`/dashboard/nomina/${nominaId}`);
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido al procesar la nómina' };
  }
}
