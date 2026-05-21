import { requireRole } from '@/lib/auth';
import { getBeneficios, getAsignaciones } from '@/services/beneficioService';
import PageHeader from '@/components/layout/PageHeader';
import BeneficiosClient from './BeneficiosClient';

export default async function BeneficiosPage() {
  await requireRole(['ADMIN_RRHH', 'EMPLEADO']);
  const [beneficios, asignaciones] = await Promise.all([

    getBeneficios(),
    getAsignaciones(),
  ]);

  return (
    <div>
      <PageHeader
        title="Beneficios Corporativos"
        description="Gestiona el catálogo de beneficios y las asignaciones a empleados"
      />
      <BeneficiosClient initialBeneficios={beneficios} initialAsignaciones={asignaciones} />
    </div>
  );
}
