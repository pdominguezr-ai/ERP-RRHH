import { getReportes } from '@/services/reporteService';
import PageHeader from '@/components/layout/PageHeader';
import ReportesClient from './ReportesClient';

export default async function ReportesPage() {
  const reportes = await getReportes();

  return (
    <div>
      <PageHeader
        title="Reportes y Estadísticas"
        description="Genera y visualiza informes clave del departamento de RRHH"
      />
      <ReportesClient initialData={reportes} />
    </div>
  );
}
