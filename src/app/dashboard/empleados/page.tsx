import { getEmpleados } from '@/services/empleadoService';
import EmpleadosClient from './EmpleadosClient';
import PageHeader from '@/components/layout/PageHeader';

export default async function EmpleadosPage() {
  const empleados = await getEmpleados();

  return (
    <div>
      <PageHeader
        title="Directorio de Empleados"
        description="Gestiona la información de todos los colaboradores de la empresa"
      />
      <EmpleadosClient initialData={empleados} />
    </div>
  );
}
