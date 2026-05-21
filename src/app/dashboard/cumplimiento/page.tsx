import { requireRole } from '@/lib/auth';
import { getCumplimientos } from '@/services/cumplimientoService';
import PageHeader from '@/components/layout/PageHeader';
import CumplimientoClient from './CumplimientoClient';

export default async function CumplimientoPage() {
  await requireRole(['ADMIN_RRHH']);
  const cumplimientos = await getCumplimientos();


  return (
    <div>
      <PageHeader
        title="Cumplimiento Laboral"
        description="Gestión de normativas, certificaciones corporativas y políticas de RRHH"
      />
      <CumplimientoClient initialData={cumplimientos} />
    </div>
  );
}
