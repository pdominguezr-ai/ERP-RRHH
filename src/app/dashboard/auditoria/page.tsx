import PageHeader from '@/components/layout/PageHeader';
import DataTable, { type Column } from '@/components/tables/DataTable';
import { getAuditorias } from '@/services/auditoriaService';
import { formatFecha } from '@/lib/utils';
import type { AuditoriaCambio } from '@/types/auditoria';

export const dynamic = 'force-dynamic';

export default async function AuditoriaPage() {
  const logs = await getAuditorias();

  const columns: Column<AuditoriaCambio>[] = [
    {
      key: 'created_at',
      header: 'Fecha / Hora',
      render: (row) => (
        <span className="text-sm font-medium text-gray-900">
          {new Date(row.created_at).toLocaleString('es-ES', {
            dateStyle: 'medium',
            timeStyle: 'medium'
          })}
        </span>
      ),
    },
    {
      key: 'usuario',
      header: 'Usuario',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-800">
            {row.usuario?.correo || 'Sistema / Automático'}
          </div>
          {row.usuario?.rol && (
            <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">
              {row.usuario.rol}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'tabla',
      header: 'Tabla Afectada',
      render: (row) => (
        <span className="text-xs font-mono font-bold bg-gray-100 border border-gray-200 px-2 py-1 rounded text-gray-700">
          {row.tabla}
        </span>
      ),
    },
    {
      key: 'operacion',
      header: 'Operación',
      render: (row) => {
        let colors = 'bg-gray-50 text-gray-700 border-gray-200';
        if (row.operacion === 'INSERT') colors = 'bg-green-50 text-green-700 border-green-200';
        if (row.operacion === 'UPDATE') colors = 'bg-blue-50 text-blue-700 border-blue-200';
        if (row.operacion === 'DELETE') colors = 'bg-red-50 text-red-700 border-red-200';

        return (
          <span className={`text-xs font-extrabold px-2 py-0.5 border rounded ${colors}`}>
            {row.operacion}
          </span>
        );
      },
    },
    {
      key: 'registro_id',
      header: 'Registro ID',
      render: (row) => (
        <span className="text-xs text-gray-400 font-mono" title={row.registro_id}>
          {row.registro_id.substring(0, 8)}...
        </span>
      ),
    },
    {
      key: 'detalle',
      header: 'Cambios (Antes vs Después)',
      render: (row) => {
        const changes = [];
        if (row.operacion === 'UPDATE' && row.datos_antes && row.datos_despues) {
          // Detect basic changes
          for (const key of Object.keys(row.datos_despues)) {
            const antes = row.datos_antes[key];
            const despues = row.datos_despues[key];
            if (JSON.stringify(antes) !== JSON.stringify(despues) && key !== 'updated_at') {
              changes.push(`${key}: "${antes ?? ''}" ➔ "${despues ?? ''}"`);
            }
          }
        } else if (row.operacion === 'INSERT' && row.datos_despues) {
          // List main fields
          const desp = row.datos_despues;
          const keys = ['codigo', 'nombres', 'apellidos', 'estado', 'tipo', 'total_neto', 'titulo'].filter(k => k in desp);
          keys.forEach(k => changes.push(`${k}: "${desp[k]}"`));
        }

        return (
          <div className="max-w-xs sm:max-w-sm overflow-hidden text-xs text-gray-600 font-mono space-y-1 py-1">
            {changes.length > 0 ? (
              changes.slice(0, 3).map((ch, idx) => <div key={idx} className="truncate">• {ch}</div>)
            ) : (
              <span className="text-gray-400 italic">Sin datos descriptivos</span>
            )}
            {changes.length > 3 && <div className="text-gray-400 italic text-[10px]">+ {changes.length - 3} campos más...</div>}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bitácora de Auditoría"
        description="Registro histórico de inserciones, actualizaciones y acciones críticas del sistema para cumplimiento y trazabilidad."
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Historial de Cambios Recientes</h3>
        </div>
        
        <DataTable
          data={logs}
          columns={columns}
          searchKeys={['tabla', 'operacion', 'registro_id', 'usuario.correo']}
          keyExtractor={(row) => row.id}
          emptyTitle="Sin registros de auditoría"
          emptyDescription="No se han registrado operaciones auditables en el sistema."
        />
      </div>
    </div>
  );
}
