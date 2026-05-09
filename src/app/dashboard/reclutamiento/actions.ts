'use server';

import { revalidatePath } from 'next/cache';
import {
  createCandidato as createDbCandidato,
  updateCandidato as updateDbCandidato,
  createProcesoReclutamiento as createDbProceso,
  updateProcesoReclutamiento as updateDbProceso,
} from '@/services/reclutamientoService';
import type { CandidatoFormData, ProcesoReclutamientoFormData } from '@/types/reclutamiento';

export async function createCandidato(data: CandidatoFormData) {
  try {
    const result = await createDbCandidato(data);
    revalidatePath('/dashboard/reclutamiento');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function updateCandidato(id: string, data: Partial<CandidatoFormData>) {
  try {
    const result = await updateDbCandidato(id, data);
    revalidatePath('/dashboard/reclutamiento');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function createProceso(data: ProcesoReclutamientoFormData) {
  try {
    const result = await createDbProceso(data);
    revalidatePath('/dashboard/reclutamiento');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function updateProceso(id: string, data: Partial<ProcesoReclutamientoFormData>) {
  try {
    const result = await updateDbProceso(id, data);
    revalidatePath('/dashboard/reclutamiento');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
