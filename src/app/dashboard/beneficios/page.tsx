import { requireRole } from '@/lib/auth';
import { tienePermiso } from '@/lib/permissions';
import { getBeneficios, getAsignaciones } from '@/services/beneficioService';
import PageHeader from '@/components/layout/PageHeader';
import BeneficiosClient from './BeneficiosClient';

export default async function BeneficiosPage() {
  const { rol } = await requireRole(['ADMIN_RRHH', 'EMPLEADO']);
  const [beneficios, asignaciones] = await Promise.all([
    getBeneficios(),
    getAsignaciones(),
  ]);
  const canManage = tienePermiso(rol, 'beneficios:gestionar');

  return (
    <div>
      <PageHeader
        title="Beneficios Corporativos"
        description={
          rol === 'EMPLEADO'
            ? 'Consulta el catálogo de beneficios corporativos y tus beneficios asignados'
            : 'Gestiona el catálogo de beneficios y las asignaciones a empleados'
        }
      />
      <BeneficiosClient
        initialBeneficios={beneficios}
        initialAsignaciones={asignaciones}
        canManage={canManage}
      />
    </div>
  );
}
