import { requireRole } from '@/lib/auth';
import PageHeader from '@/components/layout/PageHeader';
import SolicitudForm from '../SolicitudForm';

export default async function NuevaSolicitudPage() {
  await requireRole(['ADMIN_RRHH', 'JEFE_INMEDIATO', 'RECLUTADOR', 'EMPLEADO']);

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Nueva Solicitud de Ausencia"
        description="Ingresa los detalles para solicitar vacaciones, permisos o enfermedad"
      />
      <SolicitudForm />
    </div>
  );
}
