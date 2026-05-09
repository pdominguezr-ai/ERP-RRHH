import PageHeader from '@/components/layout/PageHeader';
import EmpleadoForm from '../EmpleadoForm';
import { getEmpleados } from '@/services/empleadoService';

export default async function NuevoEmpleadoPage() {
  const empleados = await getEmpleados();
  const jefesPotenciales = empleados.filter((e) => e.estado === 'ACTIVO').map((e) => ({
    id: e.id,
    nombres: e.nombres,
    apellidos: e.apellidos,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Nuevo Empleado"
        description="Registra un nuevo colaborador en el sistema"
      />
      <EmpleadoForm jefesPotenciales={jefesPotenciales} />
    </div>
  );
}
