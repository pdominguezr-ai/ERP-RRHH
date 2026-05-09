import { getCapacitaciones } from '@/services/capacitacionService';
import PageHeader from '@/components/layout/PageHeader';
import CapacitacionesClient from './CapacitacionesClient';

export default async function CapacitacionesPage() {
  const capacitaciones = await getCapacitaciones();

  return (
    <div>
      <PageHeader
        title="Capacitaciones y Desarrollo"
        description="Gestiona los cursos, talleres y programas de formación del personal"
      />
      <CapacitacionesClient initialData={capacitaciones} />
    </div>
  );
}
