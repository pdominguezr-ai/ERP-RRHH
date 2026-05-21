import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { requireRole } from '@/lib/auth';
import type { Capacitacion, CapacitacionEmpleado } from '@/types/capacitacion';
import CapacitacionDetalleClient from './CapacitacionDetalleClient';

async function getCapacitacionCompleta(id: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data: capacitacion, error: errCap } = await supabase
    .from('capacitaciones')
    .select('*')
    .eq('id', id)
    .single();

  if (errCap || !capacitacion) return null;

  const { data: participantes } = await supabase
    .from('capacitacion_empleados')
    .select(`
      *,
      empleado:empleados(nombres, apellidos, codigo, departamento, puesto)
    `)
    .eq('capacitacion_id', id);

  return { 
    capacitacion: capacitacion as Capacitacion, 
    participantes: (participantes || []) as CapacitacionEmpleado[] 
  };
}

export default async function DetalleCapacitacionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(['ADMIN_RRHH', 'JEFE_INMEDIATO', 'RECLUTADOR', 'EMPLEADO']);
  const resolvedParams = await params;
  const data = await getCapacitacionCompleta(resolvedParams.id);

  if (!data) notFound();

  const { capacitacion, participantes } = data;

  return (
    <CapacitacionDetalleClient 
      capacitacion={capacitacion} 
      participantes={participantes} 
    />
  );
}

