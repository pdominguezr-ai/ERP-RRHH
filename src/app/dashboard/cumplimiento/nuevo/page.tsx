import { requireRole } from '@/lib/auth';
import PageHeader from '@/components/layout/PageHeader';
import CumplimientoForm from '../CumplimientoForm';

export default async function NuevoCumplimientoPage() {
  await requireRole(['ADMIN_RRHH']);

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Registrar Cumplimiento"
        description="Agrega una nueva política o normativa laboral para seguimiento"
      />
      <CumplimientoForm />
    </div>
  );
}
