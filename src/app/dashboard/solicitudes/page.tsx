import { requireRole } from '@/lib/auth';
import { puedeAprobarSolicitudes } from '@/lib/permissions';
import { getSolicitudes } from '@/services/solicitudService';
import PageHeader from '@/components/layout/PageHeader';
import SolicitudesClient from './SolicitudesClient';

export default async function SolicitudesPage() {
  const { rol } = await requireRole(['ADMIN_RRHH', 'JEFE_INMEDIATO', 'RECLUTADOR', 'EMPLEADO']);
  const solicitudes = await getSolicitudes();
  const canApprove = puedeAprobarSolicitudes(rol);

  return (
    <div>
      <PageHeader
        title="Solicitudes de Ausencia"
        description={
          rol === 'EMPLEADO'
            ? 'Consulta tus solicitudes de vacaciones, permisos y descansos médicos'
            : 'Gestiona las vacaciones, permisos y descansos médicos del personal'
        }
      />
      <SolicitudesClient initialData={solicitudes} canApprove={canApprove} />
    </div>
  );
}
