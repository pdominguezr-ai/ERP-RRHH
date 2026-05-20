import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { AuditoriaCambio, AuditoriaCambioFormData } from '@/types/auditoria';

export async function registrarAuditoria(data: AuditoriaCambioFormData) {
  try {
    const supabase = await createSupabaseServerClient();
    
    let usuario_id = data.usuario_id || null;

    // Si no se proporciona un usuario_id, intentamos resolverlo a partir de la sesión actual
    if (!usuario_id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: usuarioSistema } = await supabase
          .from('usuarios_sistema')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (usuarioSistema) {
          usuario_id = usuarioSistema.id;
        }
      }
    }

    const { data: newRecord, error } = await supabase
      .from('auditoria_cambios')
      .insert([{
        tabla: data.tabla,
        registro_id: data.registro_id,
        operacion: data.operacion,
        datos_antes: data.datos_antes || null,
        datos_despues: data.datos_despues || null,
        usuario_id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting auditoria log:', error);
      return null;
    }

    return newRecord as AuditoriaCambio;
  } catch (error) {
    console.error('Exception in registrarAuditoria:', error);
    return null;
  }
}

export async function getAuditorias(filters?: { tabla?: string; usuarioId?: string }) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('auditoria_cambios')
    .select(`
      *,
      usuario:usuarios_sistema(correo, rol)
    `)
    .order('created_at', { ascending: false });

  if (filters?.tabla) {
    query = query.eq('tabla', filters.tabla);
  }
  if (filters?.usuarioId) {
    query = query.eq('usuario_id', filters.usuarioId);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    console.error('Error fetching auditorias:', error);
    throw new Error('Error al obtener la bitácora de auditoría');
  }

  return data as AuditoriaCambio[];
}
