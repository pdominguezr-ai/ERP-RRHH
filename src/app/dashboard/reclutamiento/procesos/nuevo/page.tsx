import PageHeader from '@/components/layout/PageHeader';
import ProcesoForm from '../../ProcesoForm';

export default function NuevoProcesoPage() {
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
