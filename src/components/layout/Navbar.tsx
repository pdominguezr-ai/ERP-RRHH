'use client';

import { Bell, User, Menu } from 'lucide-react';
import type { UsuarioRol } from '@/types/usuario';

const rolLabels: Record<UsuarioRol, string> = {
  ADMIN_RRHH:     'Administrador RRHH',
  JEFE_INMEDIATO: 'Jefe Inmediato',
  RECLUTADOR:     'Reclutador',
  EMPLEADO:       'Empleado',
};

const rolColors: Record<UsuarioRol, string> = {
  ADMIN_RRHH:     'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  JEFE_INMEDIATO: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  RECLUTADOR:     'bg-green-500/20 text-green-700 dark:text-green-300',
  EMPLEADO:       'bg-slate-500/20 text-slate-700 dark:text-slate-300',
};

interface NavbarProps {
  userRol: UsuarioRol;
  userEmail: string;
  onMenuClick: () => void;
}

export default function Navbar({ userRol, userEmail, onMenuClick }: NavbarProps) {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ease-in-out">
      {/* Dynamic left section: Hamburger menu on mobile, empty/dynamic title space on desktop */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div />
      </div>

      {/* Profile and Actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="block">
            <p className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[120px] sm:max-w-[180px]">
              {userEmail || 'Usuario'}
            </p>
            <span className={`inline-block text-[10px] px-2 py-0.5 mt-0.5 rounded-full font-medium ${rolColors[userRol]}`}>
              {rolLabels[userRol]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

