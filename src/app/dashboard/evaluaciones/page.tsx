import { requireRole } from '@/lib/auth';
import { getEvaluaciones } from '@/services/evaluacionService';
import PageHeader from '@/components/layout/PageHeader';
import EvaluacionesClient from './EvaluacionesClient';

export default async function EvaluacionesPage() {
  await requireRole(['ADMIN_RRHH', 'JEFE_INMEDIATO', 'EMPLEADO']);
  const evaluaciones = await getEvaluaciones();


  return (
    <div>
      <PageHeader
        title="Evaluaciones de Desempeño"
        description="Gestiona las calificaciones, metas y feedback del personal"
      />
      <EvaluacionesClient initialData={evaluaciones} />
    </div>
  );
}
