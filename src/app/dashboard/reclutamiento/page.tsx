import { requireRole } from '@/lib/auth';
import { getCandidatos, getProcesosReclutamiento } from '@/services/reclutamientoService';
import PageHeader from '@/components/layout/PageHeader';
import ReclutamientoClient from './ReclutamientoClient';

export default async function ReclutamientoPage() {
  await requireRole(['ADMIN_RRHH', 'RECLUTADOR']);
  const [candidatos, procesos] = await Promise.all([

    getCandidatos(),
    getProcesosReclutamiento(),
  ]);

  return (
    <div>
      <PageHeader
        title="Reclutamiento y Selección"
        description="Gestiona candidatos y procesos de contratación activos"
      />
      <ReclutamientoClient initialCandidatos={candidatos} initialProcesos={procesos} />
    </div>
  );
}
