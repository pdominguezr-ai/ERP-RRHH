import { getAsistencias } from '@/services/asistenciaService';
import PageHeader from '@/components/layout/PageHeader';
import AsistenciaClient from './AsistenciaClient';

export default async function AsistenciaPage() {
  const asistencias = await getAsistencias();

  return (
    <div>
      <PageHeader
        title="Control de Asistencia"
        description="Registro y monitoreo de entradas y salidas del personal"
      />
      <AsistenciaClient initialData={asistencias} />
    </div>
  );
}
