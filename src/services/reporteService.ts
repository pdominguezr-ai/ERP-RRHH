import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { ReporteRH, ReporteFormData } from '@/types/reporte';

export async function getReportes() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('reportes_rh')
    .select(`
      *,
      generador:usuarios_sistema(correo)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reportes:', error);
    throw new Error('Error al obtener los reportes');
  }

  return data as ReporteRH[];
}

export async function createReporte(data: ReporteFormData) {
  const supabase = await createSupabaseServerClient();
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('No estás autenticado');

  const { data: usuarioSistema } = await supabase
    .from('usuarios_sistema')
    .select('id')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (!usuarioSistema) throw new Error('Usuario del sistema no encontrado');

  const { data: newReporte, error } = await supabase
    .from('reportes_rh')
    .insert([{ ...data, generado_por: usuarioSistema.id }])
    .select()
    .single();

  if (error) {
    console.error('Error creating reporte:', error);
    throw new Error(error.message || 'Error al generar el reporte');
  }

  return newReporte as ReporteRH;
}
