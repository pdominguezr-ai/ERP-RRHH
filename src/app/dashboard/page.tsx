import { getUserInfo } from '@/lib/auth';
import { 
  getDashboardMetrics, 
  getJefeDashboardMetrics, 
  getReclutadorDashboardMetrics, 
  getEmpleadoDashboardMetrics 
} from '@/services/dashboardService';
import PageHeader from '@/components/layout/PageHeader';
import { 
  Users, 
  Briefcase, 
  CalendarClock, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Gift, 
  Clock, 
  User, 
  CheckCircle2, 
  ArrowRight,
  ClipboardList,
  Building
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const { id: dbUserId, correo, rol } = await getUserInfo();

  // Render dependiente del rol
  switch (rol) {
    case 'ADMIN_RRHH':
      return <AdminDashboard />;
    case 'JEFE_INMEDIATO':
      return <JefeDashboard dbUserId={dbUserId} userEmail={correo} />;
    case 'RECLUTADOR':
      return <ReclutadorDashboard userEmail={correo} />;
    case 'EMPLEADO':
      return <EmpleadoDashboard dbUserId={dbUserId} userEmail={correo} />;
    default:
      return <EmpleadoDashboard dbUserId={dbUserId} userEmail={correo} />;
  }
}

// -------------------------------------------------------------
// 1. DASHBOARD ADMINISTRADOR RRHH
// -------------------------------------------------------------
async function AdminDashboard() {
  const metrics = await getDashboardMetrics();

  const stats = [
    {
      name: 'Empleados Activos',
      value: metrics.totalEmpleados.toString(),
      change: 'Ver listado activo',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-600',
      href: '/dashboard/empleados'
    },
    {
      name: 'Procesos Abiertos',
      value: metrics.procesosAbiertos.toString(),
      change: 'Vacantes de reclutamiento',
      trend: 'neutral',
      icon: Briefcase,
      color: 'bg-indigo-600',
      href: '/dashboard/reclutamiento'
    },
    {
      name: 'Solicitudes Pendientes',
      value: metrics.solicitudesPendientes.toString(),
      change: metrics.solicitudesPendientes > 0 ? 'Requieren atención' : 'Al día',
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
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Dashboard Administrativo" 
        description="Resumen global de los indicadores clave e información operativa de Recursos Humanos."
      />

      {/* Grid de Métricas */}
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
              <dd className="ml-16 flex items-baseline pb-1">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`ml-2 flex items-baseline text-xs font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-amber-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </p>
              </dd>
            </div>
          </Link>
        ))}
      </div>

      {/* Detalle y Atajos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos empleados contratados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Últimas Contrataciones
            </h3>
            <div className="space-y-4">
              {metrics.ultimosEmpleados.length === 0 ? (
                <p className="text-sm text-gray-500">No hay contrataciones recientes registradas.</p>
              ) : (
                metrics.ultimosEmpleados.map((empleado) => (
                  <div key={empleado.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {empleado.nombres.charAt(0)}{empleado.apellidos.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{empleado.nombres} {empleado.apellidos}</p>
                        <p className="text-xs text-gray-500">{empleado.puesto}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      Ingreso: {new Date(empleado.fecha_ingreso).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link href="/dashboard/empleados" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 transition">
            Ver todos los empleados <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Atajos Rápidos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Atajos Rápidos Administrativos
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/empleados/nuevo" className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition group flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">Alta de Empleado</span>
            </Link>
            <Link href="/dashboard/nomina/nuevo" className="p-4 border border-gray-100 rounded-xl hover:border-green-200 hover:bg-green-50/50 transition group flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-green-100 text-green-600 rounded-full group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700">Generar Nómina</span>
            </Link>
            <Link href="/dashboard/solicitudes" className="p-4 border border-gray-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/50 transition group flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-full group-hover:scale-110 transition-transform">
                <CalendarClock className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-amber-700">Resolver Solicitudes</span>
            </Link>
            <Link href="/dashboard/reclutamiento/procesos/nuevo" className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition group flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700">Nuevo Proceso</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. DASHBOARD JEFE INMEDIATO (SUPERVISOR)
// -------------------------------------------------------------
async function JefeDashboard({ dbUserId, userEmail }: { dbUserId: string; userEmail: string }) {
  const metrics = await getJefeDashboardMetrics(dbUserId);

  const stats = [
    {
      name: 'Miembros del Equipo',
      value: metrics.totalEquipo.toString(),
      change: 'Subordinados directos',
      icon: Users,
      color: 'bg-blue-600',
      href: '/dashboard/empleados'
    },
    {
      name: 'Ausencias por Autorizar',
      value: metrics.solicitudesPendientesEquipo.toString(),
      change: metrics.solicitudesPendientesEquipo > 0 ? 'Requieren tu firma' : 'Sin pendientes',
      icon: CalendarClock,
      color: 'bg-amber-500',
      href: '/dashboard/solicitudes'
    },
    {
      name: 'Evaluaciones Borrador',
      value: metrics.evaluacionesBorradorEquipo.toString(),
      change: 'Pendientes por finalizar',
      icon: Award,
      color: 'bg-purple-600',
      href: '/dashboard/evaluaciones'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Portal de Supervisor" 
        description="Gestiona las solicitudes de tu departamento, supervisa la asistencia y evalúa a tu equipo."
      />

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="block transition-transform hover:-translate-y-1">
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <dt>
                <div className={`absolute rounded-xl ${stat.color} p-3`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="ml-2 flex items-baseline text-xs font-medium text-gray-500">
                  {stat.change}
                </p>
              </dd>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integrantes del Equipo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Miembros del Equipo
            </h3>
            <div className="space-y-3">
              {metrics.integrantesEquipo.length === 0 ? (
                <p className="text-sm text-gray-500">No tienes subordinados asignados actualmente.</p>
              ) : (
                metrics.integrantesEquipo.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {emp.nombres.charAt(0)}{emp.apellidos.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{emp.nombres} {emp.apellidos}</p>
                        <p className="text-xs text-gray-500">{emp.puesto} • {emp.codigo}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      emp.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {emp.estado}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link href="/dashboard/empleados" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 transition">
            Ver equipo de trabajo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Solicitudes de Ausencia del Equipo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-blue-600" />
              Solicitudes Recientes del Equipo
            </h3>
            <div className="space-y-3">
              {metrics.solicitudesRecientesEquipo.length === 0 ? (
                <p className="text-sm text-gray-500">No hay solicitudes recientes de tu equipo.</p>
              ) : (
                metrics.solicitudesRecientesEquipo.map((sol) => (
                  <div key={sol.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{sol.empleado_nombre}</p>
                      <p className="text-xs text-gray-500">{sol.tipo} • {sol.dias_solicitados} día(s)</p>
                      <p className="text-[10px] text-gray-400">Del {new Date(sol.fecha_inicio).toLocaleDateString()} al {new Date(sol.fecha_fin).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      sol.estado === 'APROBADA' ? 'bg-green-100 text-green-800' :
                      sol.estado === 'RECHAZADA' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sol.estado}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link href="/dashboard/solicitudes" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 transition">
            Gestionar solicitudes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Atajos Rápidos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          Atajos Rápidos de Gestión
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/solicitudes" className="p-4 border border-gray-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/50 transition group flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-full group-hover:scale-110 transition-transform">
              <CalendarClock className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-amber-700">Autorizar Ausencias</span>
          </Link>
          <Link href="/dashboard/evaluaciones/nuevo" className="p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition group flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">Evaluar Desempeño</span>
          </Link>
          <Link href="/dashboard/asistencia" className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition group flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">Monitorear Asistencia</span>
          </Link>
          <Link href="/dashboard/reportes" className="p-4 border border-gray-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/50 transition group flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700">Ver Reportes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. DASHBOARD RECLUTADOR
// -------------------------------------------------------------
async function ReclutadorDashboard({ userEmail }: { userEmail: string }) {
  const metrics = await getReclutadorDashboardMetrics();

  const stats = [
    {
      name: 'Procesos Activos',
      value: metrics.procesosAbiertos.toString(),
      change: 'Vacantes abiertas',
      icon: Briefcase,
      color: 'bg-indigo-600',
      href: '/dashboard/reclutamiento'
    },
    {
      name: 'Candidatos en Selección',
      value: metrics.totalCandidatos.toString(),
      change: 'Postulantes vigentes',
      icon: Users,
      color: 'bg-blue-600',
      href: '/dashboard/reclutamiento'
    },
    {
      name: 'Planes de Onboarding',
      value: metrics.onboardingsActivos.toString(),
      change: 'Ingresos pendientes/proceso',
      icon: CheckCircle2,
      color: 'bg-emerald-600',
      href: '/dashboard/onboarding'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Portal de Selección y Atracción" 
        description="Publica vacantes, avanza candidatos en el embudo de selección e inicia planes de inducción."
      />

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="block transition-transform hover:-translate-y-1">
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <dt>
                <div className={`absolute rounded-xl ${stat.color} p-3`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="ml-2 flex items-baseline text-xs font-medium text-gray-500">
                  {stat.change}
                </p>
              </dd>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Procesos de Selección Activos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Procesos de Reclutamiento Recientes
            </h3>
            <div className="space-y-3">
              {metrics.procesosRecientes.length === 0 ? (
                <p className="text-sm text-gray-500">No hay procesos de selección activos.</p>
              ) : (
                metrics.procesosRecientes.map((proceso) => (
                  <Link href={`/dashboard/reclutamiento/procesos/${proceso.id}`} key={proceso.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition block">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{proceso.titulo}</p>
                      <p className="text-xs text-gray-500">{proceso.puesto} • {proceso.departamento}</p>
                      <p className="text-[10px] text-gray-400">Apertura: {new Date(proceso.fecha_apertura).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      proceso.estado === 'EN_PROCESO' ? 'bg-indigo-100 text-indigo-800' :
                      proceso.estado === 'ABIERTO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {proceso.estado}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
          <Link href="/dashboard/reclutamiento" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition">
            Ver todos los procesos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Candidatos Recientes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Últimos Candidatos Registrados
            </h3>
            <div className="space-y-3">
              {metrics.candidatosRecientes.length === 0 ? (
                <p className="text-sm text-gray-500">No hay candidatos registrados recientemente.</p>
              ) : (
                metrics.candidatosRecientes.map((cand) => (
                  <div key={cand.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{cand.nombres} {cand.apellidos}</p>
                      <p className="text-xs text-gray-500">Aplica a: {cand.puesto_aplicado}</p>
                      <p className="text-[10px] text-gray-400">Registrado el {new Date(cand.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      cand.estado === 'SELECCIONADO' ? 'bg-green-100 text-green-800' :
                      cand.estado === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {cand.estado}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link href="/dashboard/reclutamiento" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 transition">
            Gestionar candidatos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Atajos Rápidos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          Atajos Rápidos de Reclutamiento
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/reclutamiento/procesos/nuevo" className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition group flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700">Crear Vacante</span>
          </Link>
          <Link href="/dashboard/reclutamiento/candidatos/nuevo" className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition group flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">Nuevo Candidato</span>
          </Link>
          <Link href="/dashboard/onboarding" className="p-4 border border-gray-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/50 transition group flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700">Gestionar Onboarding</span>
          </Link>
          <Link href="/dashboard/capacitaciones" className="p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition group flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">Ver Capacitaciones</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. DASHBOARD EMPLEADO (COLABORADOR)
// -------------------------------------------------------------
async function EmpleadoDashboard({ dbUserId, userEmail }: { dbUserId: string; userEmail: string }) {
  const metrics = await getEmpleadoDashboardMetrics(dbUserId);

  if (!metrics.empleado) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader 
          title="Portal de Colaborador" 
          description="Bienvenido al portal de autoservicio para empleados."
        />
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Falta Vínculo de Empleado</h3>
          <p className="text-sm text-gray-500 mt-2">
            Tu usuario de sistema ({userEmail}) no está asociado a ningún registro en la base de datos de Empleados. Solicita a Recursos Humanos que vincule tu código en tu expediente laboral.
          </p>
        </div>
      </div>
    );
  }

  const { empleado } = metrics;

  const stats = [
    {
      name: 'Vacaciones Aprobadas',
      value: `${metrics.diasVacacionesAprobados} día(s)`,
      change: 'Consumidas este periodo',
      icon: CalendarClock,
      color: 'bg-emerald-500',
      href: '/dashboard/solicitudes'
    },
    {
      name: 'Solicitudes Pendientes',
      value: metrics.solicitudesPendientes.toString(),
      change: 'En espera de aprobación',
      icon: Clock,
      color: 'bg-amber-500',
      href: '/dashboard/solicitudes'
    },
    {
      name: 'Beneficios Activos',
      value: metrics.beneficiosActivosCount.toString(),
      change: 'Seguros, bonos y vales',
      icon: Gift,
      color: 'bg-blue-600',
      href: '/dashboard/beneficios'
    },
    {
      name: 'Capacitaciones',
      value: metrics.capacitacionesInscritasCount.toString(),
      change: 'Cursos asignados',
      icon: BookOpen,
      color: 'bg-purple-600',
      href: '/dashboard/capacitaciones'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de Bienvenida */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 md:p-8 text-white shadow-lg border border-white/5">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/15">
              Portal del Colaborador
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
              ¡Hola, {empleado.nombres} {empleado.apellidos}!
            </h2>
            <p className="text-slate-300 text-sm max-w-lg">
              Desde tu portal puedes consultar tus asistencias registradas, solicitar vacaciones y revisar tus capacitaciones activas.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 text-xs border-t border-white/10">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Building className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>{empleado.departamento}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Briefcase className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>{empleado.puesto}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>Código: {empleado.codigo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Métricas del Empleado */}
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
              <dd className="ml-16 flex items-baseline pb-1">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="ml-2 flex items-baseline text-[10px] font-medium text-gray-400">
                  {stat.change}
                </p>
              </dd>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mis Asistencias Recientes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between lg:col-span-1">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Asistencias Recientes
            </h3>
            <div className="space-y-3">
              {metrics.asistenciasRecientes.length === 0 ? (
                <p className="text-sm text-gray-500">No hay asistencias registradas recientemente.</p>
              ) : (
                metrics.asistenciasRecientes.map((asis) => (
                  <div key={asis.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(asis.fecha).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        Entrada: {asis.hora_entrada}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">
                      {asis.hora_salida ? `Salida: ${asis.hora_salida}` : 'Activo'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link href="/dashboard/asistencia" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 transition">
            Marcar Entrada/Salida <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mis Capacitaciones Inscritas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between lg:col-span-1">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Mis Capacitaciones
            </h3>
            <div className="space-y-3">
              {metrics.capacitacionesInscritas.length === 0 ? (
                <p className="text-sm text-gray-500">No estás inscrito en ninguna capacitación actualmente.</p>
              ) : (
                metrics.capacitacionesInscritas.map((cap) => (
                  <div key={cap.id} className="p-3 rounded-xl border border-gray-100 space-y-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{cap.nombre}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{cap.modalidad}</span>
                      <span className={`font-semibold ${
                        cap.completada ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {cap.completada ? `Calificación: ${cap.calificacion ?? 'S/N'}` : 'En Curso'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link href="/dashboard/capacitaciones" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-500 transition">
            Ver todas mis capacitaciones <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Última Evaluación y Atajos */}
        <div className="space-y-6 lg:col-span-1">
          {/* Evaluación Desempeño */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Última Evaluación
            </h3>
            {metrics.evaluacionReciente ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm font-semibold text-gray-600">Periodo: {metrics.evaluacionReciente.periodo}</span>
                  <span className="text-lg font-extrabold text-blue-600">{metrics.evaluacionReciente.calificacion}/100</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500">Metas Cumplidas:</p>
                  <p className="text-xs text-gray-600 line-clamp-2 italic">{metrics.evaluacionReciente.metas_cumplidas || 'Sin comentarios registrados'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500">Comentarios:</p>
                  <p className="text-xs text-gray-600 line-clamp-2 italic">{metrics.evaluacionReciente.comentarios || 'Sin comentarios registrados'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aún no se ha cerrado ninguna evaluación formal para ti en este periodo.</p>
            )}
          </div>

          {/* Atajos Rápidos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-md font-bold text-gray-900 mb-3">Acciones de Empleado</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/solicitudes/nuevo" className="p-3 border border-gray-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/50 transition flex flex-col items-center text-center gap-1.5">
                <CalendarClock className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-semibold text-gray-700">Solicitar Vacaciones</span>
              </Link>
              <Link href="/dashboard/asistencia" className="p-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition flex flex-col items-center text-center gap-1.5">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-semibold text-gray-700">Ver Asistencia</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
