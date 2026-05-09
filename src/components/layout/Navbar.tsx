'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bell, User } from 'lucide-react';
import type { UsuarioRol } from '@/types/usuario';

const rolLabels: Record<UsuarioRol, string> = {
  ADMIN_RRHH:     'Administrador RRHH',
  JEFE_INMEDIATO: 'Jefe Inmediato',
  RECLUTADOR:     'Reclutador',
  EMPLEADO:       'Empleado',
};

const rolColors: Record<UsuarioRol, string> = {
  ADMIN_RRHH:     'bg-purple-500/20 text-purple-300',
  JEFE_INMEDIATO: 'bg-blue-500/20 text-blue-300',
  RECLUTADOR:     'bg-green-500/20 text-green-300',
  EMPLEADO:       'bg-slate-500/20 text-slate-300',
};

export default function Navbar() {
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState<UsuarioRol>('EMPLEADO');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCorreo(user.email ?? '');
        setRol((user.user_metadata?.rol as UsuarioRol) ?? 'EMPLEADO');
      }
    });
  }, []);

  return (
    <header className="fixed top-0 right-0 left-64 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Título dinámico (lo hereda el layout) */}
      <div />

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800 leading-tight truncate max-w-[140px]">
              {correo || 'Usuario'}
            </p>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${rolColors[rol]}`}>
              {rolLabels[rol]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
