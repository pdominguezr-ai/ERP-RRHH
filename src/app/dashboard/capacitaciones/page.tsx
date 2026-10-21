import { requireRole } from '@/lib/auth';
import { tienePermiso } from '@/lib/permissions';
import { getCapacitaciones } from '@/services/capacitacionService';
import PageHeader from '@/components/layout/PageHeader';
import CapacitacionesClient from './CapacitacionesClient';

export default async function CapacitacionesPage() {
  const { rol } = await requireRole(['ADMIN_RRHH', 'JEFE_INMEDIATO', 'RECLUTADOR', 'EMPLEADO']);
  const capacitaciones = await getCapacitaciones();
  const canManage = tienePermiso(rol, 'capacitaciones:gestionar');

  return (
    <div>
      <PageHeader
        title="Capacitaciones y Desarrollo"
        description={
          rol === 'EMPLEADO'
            ? 'Consulta los cursos, talleres y programas de formación disponibles'
            : 'Gestiona los cursos, talleres y programas de formación del personal'
        }
      />
      <CapacitacionesClient initialData={capacitaciones} canManage={canManage} />
    </div>
  );
}
