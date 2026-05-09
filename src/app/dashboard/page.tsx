import { getDashboardMetrics } from '@/services/dashboardService';
import PageHeader from '@/components/layout/PageHeader';
import { Users, Briefcase, CalendarClock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  const stats = [
    {
      name: 'Empleados Activos',
      value: metrics.totalEmpleados.toString(),
      change: '+2 este mes',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
      href: '/dashboard/empleados'
    },
    {
      name: 'Procesos Abiertos',
      value: metrics.procesosAbiertos.toString(),
      change: '1 por cerrar',
      trend: 'neutral',
      icon: Briefcase,
      color: 'bg-indigo-500',
      href: '/dashboard/reclutamiento'
    },
    {
      name: 'Solicitudes Pendientes',
      value: metrics.solicitudesPendientes.toString(),
      change: 'Requieren atención',
      trend: metrics.solicitudesPendientes > 0 ? 'down' : 'neutral',
      icon: CalendarClock,
      color: 'bg-amber-500',
      href: '/dashboard/solicitudes'
    },
    {
      name: 'Índice de Retención',
      value: '94%',
      change: '+1.2% vs año pasado',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-emerald-500',
      href: '/dashboard/reportes'
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard General" 
        description="Resumen en tiempo real de los indicadores de Recursos Humanos."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="block transition-transform hover:-translate-y-1">
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <dt>
                <div className={`absolute rounded-xl ${stat.color} p-3`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </p>
              </dd>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Contrataciones</h3>
          <div className="space-y-4">
            {metrics.ultimosEmpleados.length === 0 ? (
              <p className="text-sm text-gray-500">No hay contrataciones recientes.</p>
            ) : (
              metrics.ultimosEmpleados.map((empleado, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {empleado.nombres.charAt(0)}{empleado.apellidos.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{empleado.nombres} {empleado.apellidos}</p>
                      <p className="text-xs text-gray-500">{empleado.puesto}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    Ingreso: {new Date(empleado.fecha_ingreso).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atajos Rápidos</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/empleados/nuevo" className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition group flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Alta de Empleado</span>
            </Link>
            <Link href="/dashboard/nomina/nuevo" className="p-4 border border-gray-100 rounded-xl hover:border-green-200 hover:bg-green-50 transition group flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-green-100 text-green-600 rounded-full group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Generar Nómina</span>
            </Link>
            <Link href="/dashboard/solicitudes/nuevo" className="p-4 border border-gray-100 rounded-xl hover:border-amber-200 hover:bg-amber-50 transition group flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-full group-hover:scale-110 transition-transform">
                <CalendarClock className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700">Registrar Ausencia</span>
            </Link>
            <Link href="/dashboard/reclutamiento/procesos/nuevo" className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition group flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">Nuevo Proceso</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
