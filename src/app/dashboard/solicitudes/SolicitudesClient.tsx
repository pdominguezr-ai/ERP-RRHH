'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Check, X } from 'lucide-react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatFecha } from '@/lib/utils';
import type { SolicitudAusencia } from '@/types/solicitudAusencia';
import { resolverSolicitud } from './actions';

interface SolicitudesClientProps {
  initialData: SolicitudAusencia[];
}

export default function SolicitudesClient({ initialData }: SolicitudesClientProps) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [dialog, setDialog] = useState<{ open: boolean; solicitud: SolicitudAusencia | null; action: 'APROBADA' | 'RECHAZADA' | null }>({
    open: false, solicitud: null, action: null
  });

  async function handleConfirm() {
    if (!dialog.solicitud || !dialog.action) return;
    setLoadingAction(true);
    try {
      await resolverSolicitud(dialog.solicitud.id, dialog.action);
    } catch (e) {
      console.error(e);
      alert('Error al resolver la solicitud');
    } finally {
      setLoadingAction(false);
      setDialog({ open: false, solicitud: null, action: null });
    }
  }

  const columns: Column<SolicitudAusencia>[] = [
    {
      key: 'empleado',
      header: 'Empleado',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.empleado?.nombres} {row.empleado?.apellidos}
          </div>
          <div className="text-xs text-gray-500">{row.empleado?.departamento}</div>
        </div>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (row) => <span className="font-medium text-gray-700">{row.tipo}</span>,
    },
    {
      key: 'fechas',
      header: 'Fechas',
      render: (row) => (
        <div className="text-sm">
          <div>{formatFecha(row.fecha_inicio)} al {formatFecha(row.fecha_fin)}</div>
          <div className="text-xs text-blue-600 font-medium">{row.dias_solicitados} días</div>
        </div>
      ),
    },
    {
      key: 'motivo',
      header: 'Motivo',
      render: (row) => <span className="text-sm text-gray-600 truncate max-w-[200px] block" title={row.motivo}>{row.motivo}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => <StatusBadge status={row.estado} />,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.estado === 'PENDIENTE' && (
            <>
              <button
                onClick={() => setDialog({ open: true, solicitud: row, action: 'APROBADA' })}
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                title="Aprobar Solicitud"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDialog({ open: true, solicitud: row, action: 'RECHAZADA' })}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Rechazar Solicitud"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link
          href="/dashboard/solicitudes/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Solicitud
        </Link>
      </div>

      <DataTable
        data={initialData}
        columns={columns}
        searchKeys={['tipo', 'estado', 'motivo']}
        keyExtractor={(row) => row.id}
        emptyTitle="Sin solicitudes"
        emptyDescription="No hay solicitudes de ausencia registradas."
      />

      <ConfirmDialog
        open={dialog.open}
        title={dialog.action === 'APROBADA' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
        description={
          dialog.action === 'APROBADA'
            ? '¿Estás seguro de que deseas aprobar esta solicitud de ausencia?'
            : '¿Estás seguro de que deseas rechazar esta solicitud de ausencia?'
        }
        confirmLabel={dialog.action === 'APROBADA' ? 'Sí, Aprobar' : 'Sí, Rechazar'}
        variant={dialog.action === 'APROBADA' ? 'warning' : 'danger'}
        loading={loadingAction}
        onConfirm={handleConfirm}
        onCancel={() => setDialog({ open: false, solicitud: null, action: null })}
      />
    </>
  );
}
