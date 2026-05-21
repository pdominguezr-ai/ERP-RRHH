import { requireRole } from '@/lib/auth';
import PageHeader from '@/components/layout/PageHeader';
import EvaluacionForm from '../EvaluacionForm';

export default async function NuevaEvaluacionPage() {
  await requireRole(['ADMIN_RRHH', 'JEFE_INMEDIATO', 'EMPLEADO']);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Registrar Evaluación"
        description="Ingresa los resultados del desempeño del empleado"
      />
      <EvaluacionForm />
    </div>
  );
}
