'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
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
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let aprobado_por = undefined;
    if (user) {
      // Get internal user ID from auth user
      const { data: userData } = await supabase
        .from('usuarios_sistema')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
        
      if (userData) {
        aprobado_por = userData.id;
      }
    }

    const result = await updateSolicitudEstado(id, estado, observaciones, aprobado_por);
    revalidatePath('/dashboard/solicitudes');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
