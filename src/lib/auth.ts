import { createSupabaseServerClient } from './supabaseServer';
import { redirect } from 'next/navigation';
import type { UsuarioRol } from '@/types/usuario';
export async function getSession() { const sb = await createSupabaseServerClient(); const { data: { session }, error } = await sb.auth.getSession(); if (error) { console.error('[auth]', error.message); return null; } return session; }
export async function getUser() { const sb = await createSupabaseServerClient(); const { data: { user } } = await sb.auth.getUser(); return user ?? null; }
export async function getUserRole(): Promise<UsuarioRol> { const user = await getUser(); if (!user) return 'EMPLEADO'; return (user.user_metadata?.rol as UsuarioRol) ?? 'EMPLEADO'; }
export async function requireAuth() { const session = await getSession(); if (!session) redirect('/login'); return session; }
export async function requireRole(roles: UsuarioRol[]) { const session = await requireAuth(); const rol = (session.user.user_metadata?.rol as UsuarioRol) ?? 'EMPLEADO'; if (!roles.includes(rol)) redirect('/dashboard'); return { session, rol }; }
