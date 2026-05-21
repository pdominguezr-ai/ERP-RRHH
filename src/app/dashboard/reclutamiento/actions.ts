'use server';

import { revalidatePath } from 'next/cache';
import {
  createCandidato as createDbCandidato,
  updateCandidato as updateDbCandidato,
  createProcesoReclutamiento as createDbProceso,
  updateProcesoReclutamiento as updateDbProceso,
  vincularCandidatoAProceso,
  actualizarEtapaCandidatoProceso,
  seleccionarCandidato
} from '@/services/reclutamientoService';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { CandidatoFormData, ProcesoReclutamientoFormData, ProcesoReclutamiento } from '@/types/reclutamiento';

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

export async function updateProceso(id: string, data: Partial<ProcesoReclutamiento>) {
  try {
    const result = await updateDbProceso(id, data);
    revalidatePath('/dashboard/reclutamiento');
    revalidatePath(`/dashboard/reclutamiento/procesos/${id}`);
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function vincularCandidatoAction(procesoId: string, candidatoId: string, observaciones?: string) {
  try {
    const result = await vincularCandidatoAProceso(procesoId, candidatoId, 'POSTULACION', observaciones);
    revalidatePath(`/dashboard/reclutamiento/procesos/${procesoId}`);
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function actualizarEtapaAction(procesoId: string, candidatoId: string, etapa: string, observaciones?: string) {
  try {
    const result = await actualizarEtapaCandidatoProceso(procesoId, candidatoId, etapa, observaciones);
    revalidatePath(`/dashboard/reclutamiento/procesos/${procesoId}`);
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al cambiar etapa' };
  }
}

export async function contratarCandidatoAction(candidatoId: string, procesoId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let responsableId = undefined;
    if (user) {
      const { data: systemUser } = await supabase
        .from('usuarios_sistema')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      if (systemUser) {
        responsableId = systemUser.id;
      }
    }

    const result = await seleccionarCandidato(candidatoId, procesoId, responsableId);
    
    revalidatePath('/dashboard/reclutamiento');
    revalidatePath('/dashboard/empleados');
    revalidatePath('/dashboard/onboarding');
    revalidatePath(`/dashboard/reclutamiento/procesos/${procesoId}`);
    
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido al contratar candidato' };
  }
}
