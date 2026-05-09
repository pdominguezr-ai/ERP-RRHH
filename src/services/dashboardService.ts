import { createSupabaseServerClient } from '@/lib/supabaseServer';

export interface DashboardMetrics {
  totalEmpleados: number;
  procesosAbiertos: number;
  solicitudesPendientes: number;
  ultimosEmpleados: Array<{
    id: string;
    nombres: string;
    apellidos: string;
    puesto: string;
    fecha_ingreso: string;
  }>;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createSupabaseServerClient();
  
  // 1. Total Empleados Activos
  const { count: empleadosCount } = await supabase
    .from('empleados')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'ACTIVO');

  // 2. Procesos de Reclutamiento Abiertos
  const { count: procesosCount } = await supabase
    .from('procesos_reclutamiento')
    .select('*', { count: 'exact', head: true })
    .in('estado', ['ABIERTO', 'EN_PROCESO']);

  // 3. Solicitudes de Ausencia Pendientes
  const { count: solicitudesCount } = await supabase
    .from('solicitudes_ausencia')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'PENDIENTE');

  // 4. Últimas contrataciones (últimos 5 empleados)
  const { data: ultimosEmpleados } = await supabase
    .from('empleados')
    .select('id, nombres, apellidos, puesto, fecha_ingreso')
    .order('fecha_ingreso', { ascending: false })
    .limit(5);

  return {
    totalEmpleados: empleadosCount || 0,
    procesosAbiertos: procesosCount || 0,
    solicitudesPendientes: solicitudesCount || 0,
    ultimosEmpleados: (ultimosEmpleados as DashboardMetrics['ultimosEmpleados']) || [],
  };
}
