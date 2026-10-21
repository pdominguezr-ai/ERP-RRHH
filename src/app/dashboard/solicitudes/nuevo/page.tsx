import { requireRole, getUserInfo } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabaseServer';
import PageHeader from '@/components/layout/PageHeader';
import SolicitudForm from '../SolicitudForm';

export default async function NuevaSolicitudPage() {
  await requireRole(['ADMIN_RRHH', 'JEFE_INMEDIATO', 'RECLUTADOR', 'EMPLEADO']);
  const { id: usuarioId, rol } = await getUserInfo();

  let empleadoVinculado: { id: string; nombres: string; apellidos: string } | null = null;
  if (rol === 'EMPLEADO' && usuarioId) {
    const adminClient = createSupabaseAdminClient();
    const { data: emp } = await adminClient
      .from('empleados')
      .select('id, nombres, apellidos')
      .eq('usuario_id', usuarioId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (emp) {
      empleadoVinculado = emp;
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Nueva Solicitud de Ausencia"
        description="Ingresa los detalles para solicitar vacaciones, permisos o enfermedad"
      />
      <SolicitudForm empleadoFijo={empleadoVinculado} />
    </div>
  );
}
