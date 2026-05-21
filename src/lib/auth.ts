import { createSupabaseServerClient, createSupabaseAdminClient } from './supabaseServer';
import { redirect } from 'next/navigation';
import type { UsuarioRol } from '@/types/usuario';

export async function getSession() {
  const sb = await createSupabaseServerClient();
  const { data: { session }, error } = await sb.auth.getSession();
  if (error) { console.error('[auth]', error.message); return null; }
  return session;
}

export async function getUser() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  return user ?? null;
}

export async function getUserRole(): Promise<UsuarioRol> {
  const user = await getUser();
  if (!user) return 'EMPLEADO';

  // Consultar la tabla usuarios_sistema para obtener el rol real usando el admin client
  const adminSb = createSupabaseAdminClient();
  const { data } = await adminSb
    .from('usuarios_sistema')
    .select('rol')
    .eq('auth_user_id', user.id)
    .single();

  return (data?.rol as UsuarioRol) ?? 'EMPLEADO';
}

export async function getUserInfo(): Promise<{ id: string; correo: string; rol: UsuarioRol }> {
  const user = await getUser();
  if (!user) return { id: '', correo: '', rol: 'EMPLEADO' };

  // Consultar la tabla usuarios_sistema para obtener datos del rol real usando el admin client
  const adminSb = createSupabaseAdminClient();
  const { data } = await adminSb
    .from('usuarios_sistema')
    .select('id, rol, correo')
    .eq('auth_user_id', user.id)
    .single();

  return {
    id: data?.id ?? '',
    correo: data?.correo ?? user.email ?? '',
    rol: (data?.rol as UsuarioRol) ?? 'EMPLEADO',
  };
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireRole(roles: UsuarioRol[]) {
  await requireAuth();
  const rol = await getUserRole();
  if (!roles.includes(rol)) redirect('/dashboard');
  return { rol };
}

