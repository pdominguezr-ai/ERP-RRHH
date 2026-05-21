import { requireRole } from '@/lib/auth';
import PageHeader from '@/components/layout/PageHeader';
import CapacitacionForm from '../CapacitacionForm';

export default async function NuevaCapacitacionPage() {
  await requireRole(['ADMIN_RRHH']);

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Nueva Capacitación"
        description="Registra un nuevo programa de formación para los empleados"
      />
      <CapacitacionForm />
    </div>
  );
}
