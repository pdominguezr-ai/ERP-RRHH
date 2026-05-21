import { requireRole } from '@/lib/auth';
import { getSolicitudes } from '@/services/solicitudService';
import PageHeader from '@/components/layout/PageHeader';
import SolicitudesClient from './SolicitudesClient';

export default async function SolicitudesPage() {
  await requireRole(['ADMIN_RRHH', 'JEFE_INMEDIATO', 'RECLUTADOR', 'EMPLEADO']);
  const solicitudes = await getSolicitudes();


  return (
    <div>
      <PageHeader
        title="Solicitudes de Ausencia"
        description="Gestiona las vacaciones, permisos y descansos médicos del personal"
      />
      <SolicitudesClient initialData={solicitudes} />
    </div>
  );
}
