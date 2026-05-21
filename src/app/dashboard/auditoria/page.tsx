import { requireRole } from '@/lib/auth';
import PageHeader from '@/components/layout/PageHeader';
import { getAuditorias } from '@/services/auditoriaService';
import AuditoriaClient from './AuditoriaClient';

export const dynamic = 'force-dynamic';

export default async function AuditoriaPage() {
  await requireRole(['ADMIN_RRHH']);
  const logs = await getAuditorias();


  return (
    <div className="space-y-6">
      <PageHeader
        title="Bitácora de Auditoría"
        description="Registro histórico de inserciones, actualizaciones y acciones críticas del sistema para cumplimiento y trazabilidad."
      />
      <AuditoriaClient logs={logs} />
    </div>
  );
}
