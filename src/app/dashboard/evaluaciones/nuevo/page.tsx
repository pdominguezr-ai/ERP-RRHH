import PageHeader from '@/components/layout/PageHeader';
import EvaluacionForm from '../EvaluacionForm';

export default function NuevaEvaluacionPage() {
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
