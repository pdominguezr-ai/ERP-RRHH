import { requireRole, getUserInfo } from '@/lib/auth';
import { getAsistencias } from '@/services/asistenciaService';
import { createSupabaseAdminClient } from '@/lib/supabaseServer';
import PageHeader from '@/components/layout/PageHeader';
import AsistenciaClient from './AsistenciaClient';

export default async function AsistenciaPage() {
  await requireRole(['ADMIN_RRHH', 'JEFE_INMEDIATO', 'EMPLEADO']);
  const asistencias = await getAsistencias();
  const { id: usuarioId } = await getUserInfo();

  // Obtener el registro del empleado asociado (si lo tiene)
  const adminClient = createSupabaseAdminClient();
  const { data: empRecord } = await adminClient
    .from('empleados')
    .select('id')
    .eq('usuario_id', usuarioId)
    .maybeSingle();

  const empleadoId = empRecord?.id ?? null;

  // Buscar si ya tiene marcación el día de hoy (fecha del servidor)
  let hoyAsistencia = null;
  if (empleadoId) {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fechaHoy = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const { data: asistenciaHoy } = await adminClient
      .from('asistencias')
      .select('*')
      .eq('empleado_id', empleadoId)
      .eq('fecha', fechaHoy)
      .maybeSingle();

    hoyAsistencia = asistenciaHoy ?? null;
  }

  return (
    <div>
      <PageHeader
        title="Control de Asistencia"
        description="Registro y monitoreo de entradas y salidas del personal"
      />
      <div className="space-y-6">
        <AsistenciaClient 
          initialData={asistencias} 
          empleadoId={empleadoId}
          hoyAsistencia={hoyAsistencia}
        />
      </div>
    </div>
  );
}
