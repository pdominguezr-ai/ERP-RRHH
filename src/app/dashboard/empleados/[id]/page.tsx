import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import PageHeader from '@/components/layout/PageHeader';
import EmpleadoForm from '../EmpleadoForm';
import { getEmpleado, getEmpleados } from '@/services/empleadoService';

interface EditEmpleadoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmpleadoPage({ params }: EditEmpleadoPageProps) {
  await requireRole(['ADMIN_RRHH', 'JEFE_INMEDIATO']);
  const resolvedParams = await params;
  const empleado = await getEmpleado(resolvedParams.id).catch(() => null);


  if (!empleado) {
    notFound();
  }

  const empleados = await getEmpleados();
  const jefesPotenciales = empleados
    .filter((e) => e.estado === 'ACTIVO' && e.id !== empleado.id)
    .map((e) => ({
      id: e.id,
      nombres: e.nombres,
      apellidos: e.apellidos,
    }));

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Editar Empleado"
        description={`Actualizando información de ${empleado.nombres} ${empleado.apellidos}`}
      />
      <EmpleadoForm initialData={empleado} jefesPotenciales={jefesPotenciales} />
    </div>
  );
}
