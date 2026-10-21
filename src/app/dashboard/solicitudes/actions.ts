'use server';

import { revalidatePath } from 'next/cache';
import { getUserInfo } from '@/lib/auth';
import { puedeAprobarSolicitudes } from '@/lib/permissions';
import { createSolicitud as createDbSolicitud, updateSolicitudEstado } from '@/services/solicitudService';
import type { SolicitudAusenciaFormData } from '@/types/solicitudAusencia';

export async function createSolicitud(data: SolicitudAusenciaFormData) {
  try {
    const result = await createDbSolicitud(data);
    revalidatePath('/dashboard/solicitudes');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function resolverSolicitud(id: string, estado: 'APROBADA' | 'RECHAZADA', observaciones?: string) {
  try {
    const { id: usuarioId, rol } = await getUserInfo();

    if (!puedeAprobarSolicitudes(rol)) {
      return { success: false, error: 'No tienes permisos para aprobar o rechazar solicitudes.' };
    }

    const aprobado_por = usuarioId || undefined;
    const result = await updateSolicitudEstado(id, estado, observaciones, aprobado_por);
    revalidatePath('/dashboard/solicitudes');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
