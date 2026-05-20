'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  LayoutDashboard,
  DollarSign,
  Clock,
  CalendarOff,
  UserSearch,
  BookUser,
  Star,
  GraduationCap,
  Gift,
  BarChart3,
  ShieldCheck,
  LogOut,
  ChevronRight,
  History
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',       href: '/dashboard',                icon: LayoutDashboard },
  { label: 'Empleados',       href: '/dashboard/empleados',      icon: Users },
  { label: 'Nómina',          href: '/dashboard/nomina',         icon: DollarSign },
  { label: 'Asistencia',      href: '/dashboard/asistencia',     icon: Clock },
  { label: 'Solicitudes',     href: '/dashboard/solicitudes',    icon: CalendarOff },
  { label: 'Reclutamiento',   href: '/dashboard/reclutamiento',  icon: UserSearch },
  { label: 'Onboarding',      href: '/dashboard/onboarding',     icon: BookUser },
  { label: 'Evaluaciones',    href: '/dashboard/evaluaciones',   icon: Star },
  { label: 'Capacitaciones',  href: '/dashboard/capacitaciones', icon: GraduationCap },
  { label: 'Beneficios',      href: '/dashboard/beneficios',     icon: Gift },
  { label: 'Reportes',        href: '/dashboard/reportes',       icon: BarChart3 },
  { label: 'Cumplimiento',    href: '/dashboard/cumplimiento',   icon: ShieldCheck },
  { label: 'Auditoría',       href: '/dashboard/auditoria',      icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 flex-shrink-0">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">RRHH</p>
          <p className="text-xs text-slate-500 truncate">Recursos Humanos</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
