import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { requireRole } from '@/lib/auth';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatFecha } from '@/lib/utils';
import type { ProcesoReclutamiento, Candidato } from '@/types/reclutamiento';
import ProcesoDetalleClient from './ProcesoDetalleClient';
import { getCandidatosPorProceso, getProcesoReclutamiento, getCandidatos } from '@/services/reclutamientoService';

async function getProcesoCompleto(id: string) {
  try {
    const proceso = await getProcesoReclutamiento(id);
    const vinculados = await getCandidatosPorProceso(id);
    const todosCandidatos = await getCandidatos();
    
    // Filtrar candidatos disponibles (que no estén ya seleccionados ni vinculados)
    const vinculadosIds = vinculados.map(v => v.candidato.id);
    const candidatosDisponibles = todosCandidatos.filter(
      c => c.estado !== 'SELECCIONADO' && !vinculadosIds.includes(c.id)
    );

    return {
      proceso,
      vinculados,
      candidatosDisponibles
    };
  } catch (error) {
    console.error('Error fetching process detail data:', error);
    return null;
  }
}

export default async function ProcesoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(['ADMIN_RRHH', 'RECLUTADOR']);
  const resolvedParams = await params;
  const data = await getProcesoCompleto(resolvedParams.id);


  if (!data) notFound();

  const { proceso, vinculados, candidatosDisponibles } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={proceso.titulo}
        description={`Puesto: ${proceso.puesto} — Departamento: ${proceso.departamento}`}
        actions={<StatusBadge status={proceso.estado} className="text-sm px-3 py-1" />}
      />

      <ProcesoDetalleClient 
        proceso={proceso} 
        vinculados={vinculados} 
        candidatosDisponibles={candidatosDisponibles} 
      />
    </div>
  );
}
