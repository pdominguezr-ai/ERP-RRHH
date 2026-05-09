import { getEvaluaciones } from '@/services/evaluacionService';
import PageHeader from '@/components/layout/PageHeader';
import EvaluacionesClient from './EvaluacionesClient';

export default async function EvaluacionesPage() {
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
