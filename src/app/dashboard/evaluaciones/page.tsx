import { requireRole } from '@/lib/auth';
import { tienePermiso } from '@/lib/permissions';
import { getEvaluaciones } from '@/services/evaluacionService';
import PageHeader from '@/components/layout/PageHeader';
import EvaluacionesClient from './EvaluacionesClient';

export default async function EvaluacionesPage() {
  const { rol } = await requireRole(['ADMIN_RRHH', 'JEFE_INMEDIATO', 'EMPLEADO']);
  const evaluaciones = await getEvaluaciones();
  const canCreate = tienePermiso(rol, 'evaluaciones:registrar') || rol === 'ADMIN_RRHH';

  return (
    <div>
      <PageHeader
        title="Evaluaciones de Desempeño"
        description={
          rol === 'EMPLEADO'
            ? 'Consulta tus resultados y retroalimentación de evaluaciones de desempeño'
            : 'Gestiona las calificaciones, metas y feedback del personal'
        }
      />
      <EvaluacionesClient initialData={evaluaciones} canCreate={canCreate} />
    </div>
  );
}
