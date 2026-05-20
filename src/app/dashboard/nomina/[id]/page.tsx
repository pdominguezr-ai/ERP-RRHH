import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatFecha } from '@/lib/utils';
import type { Nomina, DetalleNomina } from '@/types/nomina';
import NominaDetalleClient from './NominaDetalleClient';

async function getNominaCompleta(id: string) {
  const supabase = await createSupabaseServerClient();
  
  // 1. Cabecera
  const { data: nomina, error: errNom } = await supabase
    .from('nominas')
    .select('*')
    .eq('id', id)
    .single();

  if (errNom || !nomina) return null;

  // 2. Detalles
  const { data: detalles } = await supabase
    .from('detalle_nomina')
    .select(`
      *,
      empleado:empleados(nombres, apellidos, codigo, departamento, puesto, estado)
    `)
    .eq('nomina_id', id);

  return { 
    nomina: nomina as Nomina, 
    detalles: (detalles || []) as (DetalleNomina & { 
      empleado?: { 
        nombres: string; 
        apellidos: string; 
        codigo: string; 
        departamento: string; 
        puesto: string; 
        estado: string; 
      } 
    })[] 
  };
}

export default async function DetalleNominaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const data = await getNominaCompleta(resolvedParams.id);

  if (!data) notFound();

  const { nomina, detalles } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalle de Nómina"
        description={`Período: ${formatFecha(nomina.periodo_inicio)} al ${formatFecha(nomina.periodo_fin)}`}
        actions={<StatusBadge status={nomina.estado} className="text-sm px-3 py-1" />}
      />

      <NominaDetalleClient nomina={nomina} detalles={detalles} />
    </div>
  );
}
