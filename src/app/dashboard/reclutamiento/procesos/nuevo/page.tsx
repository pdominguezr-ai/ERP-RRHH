import { requireRole } from '@/lib/auth';
import PageHeader from '@/components/layout/PageHeader';
import ProcesoForm from '../../ProcesoForm';

export default async function NuevoProcesoPage() {
  await requireRole(['ADMIN_RRHH', 'RECLUTADOR']);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Crear Proceso de Reclutamiento"
        description="Define los parámetros para una nueva búsqueda de talento"
      />
      <ProcesoForm />
    </div>
  );
}
