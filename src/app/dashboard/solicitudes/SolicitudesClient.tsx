'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Check, X, AlertCircle } from 'lucide-react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatFecha } from '@/lib/utils';
import type { SolicitudAusencia } from '@/types/solicitudAusencia';
import { resolverSolicitud } from './actions';

interface SolicitudesClientProps {
  initialData: SolicitudAusencia[];
}

export default function SolicitudesClient({ initialData }: SolicitudesClientProps) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    open: boolean;
    solicitud: SolicitudAusencia | null;
    action: 'APROBADA' | 'RECHAZADA' | null;
  }>({
    open: false,
    solicitud: null,
    action: null,
  });

  const [observaciones, setObservaciones] = useState('');

  function openResolverDialog(solicitud: SolicitudAusencia, action: 'APROBADA' | 'RECHAZADA') {
    setDialog({ open: true, solicitud, action });
    setObservaciones('');
    setErrorMsg(null);
  }

  async function handleConfirm() {
    if (!dialog.solicitud || !dialog.action) return;
    setLoadingAction(true);
    setErrorMsg(null);
    try {
      const res = await resolverSolicitud(dialog.solicitud.id, dialog.action, observaciones);
      if (!res.success) {
        setErrorMsg(res.error || 'Error al resolver la solicitud');
      } else {
        setDialog({ open: false, solicitud: null, action: null });
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Ocurrió un error inesperado al procesar la solicitud.');
    } finally {
      setLoadingAction(false);
    }
  }

  const columns: Column<SolicitudAusencia>[] = [
    {
      key: 'empleado',
      header: 'Empleado',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">
            {row.empleado?.nombres} {row.empleado?.apellidos}
          </div>
          <div className="text-xs text-gray-500">{row.empleado?.departamento}</div>
        </div>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (row) => (
        <span className="font-semibold text-gray-700 px-2 py-0.5 bg-gray-100 rounded-md text-xs">
          {row.tipo}
        </span>
      ),
    },
    {
      key: 'fechas',
      header: 'Fechas',
      render: (row) => (
        <div className="text-sm">
          <div className="text-gray-800 font-medium">{formatFecha(row.fecha_inicio)} al {formatFecha(row.fecha_fin)}</div>
          <div className="text-xs text-blue-600 font-semibold">{row.dias_solicitados} días</div>
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
      key: 'observaciones',
      header: 'Observaciones Resolutor',
      render: (row) => <span className="text-xs text-gray-500 max-w-[150px] truncate block" title={row.observaciones}>{row.observaciones || '—'}</span>,
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
                onClick={() => openResolverDialog(row, 'APROBADA')}
                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-200 transition"
                title="Aprobar Solicitud"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => openResolverDialog(row, 'RECHAZADA')}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200 transition"
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Solicitudes de Permiso y Vacaciones</h2>
          <p className="text-sm text-gray-500">Historial completo y solicitudes pendientes.</p>
        </div>
        <Link
          href="/dashboard/solicitudes/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Solicitud
        </Link>
      </div>

      <DataTable
        data={initialData}
        columns={columns}
        searchKeys={['tipo', 'estado', 'motivo', 'empleado.nombres', 'empleado.apellidos']}
        keyExtractor={(row) => row.id}
        emptyTitle="Sin solicitudes"
        emptyDescription="No hay solicitudes de ausencia registradas."
      />

      {/* Modal interactivo de Aprobación/Rechazo con observaciones */}
      {dialog.open && dialog.solicitud && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className={`px-6 py-4 flex items-center justify-between border-b ${
              dialog.action === 'APROBADA' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'
            }`}>
              <div>
                <h3 className="font-bold text-gray-900">
                  {dialog.action === 'APROBADA' ? 'Aprobar Solicitud de Ausencia' : 'Rechazar Solicitud de Ausencia'}
                </h3>
                <p className="text-xs text-gray-500">
                  Colaborador: {dialog.solicitud.empleado?.nombres} {dialog.solicitud.empleado?.apellidos}
                </p>
              </div>
              <button
                onClick={() => setDialog({ open: false, solicitud: null, action: null })}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg space-y-1">
                <div><strong>Tipo:</strong> {dialog.solicitud.tipo}</div>
                <div><strong>Período:</strong> {formatFecha(dialog.solicitud.fecha_inicio)} al {formatFecha(dialog.solicitud.fecha_fin)} ({dialog.solicitud.dias_solicitados} días)</div>
                <div><strong>Motivo original:</strong> {dialog.solicitud.motivo}</div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Observaciones / Justificación
                </label>
                <textarea
                  className="w-full min-h-[100px] p-3 text-sm text-gray-700 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder={dialog.action === 'APROBADA' ? 'Escribe aquí observaciones opcionales...' : 'Indica obligatoriamente el motivo del rechazo...'}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDialog({ open: false, solicitud: null, action: null })}
                  disabled={loadingAction}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loadingAction || (dialog.action === 'RECHAZADA' && !observaciones.trim())}
                  className={`px-5 py-2 text-white rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-55 ${
                    dialog.action === 'APROBADA'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loadingAction ? 'Procesando...' : dialog.action === 'APROBADA' ? 'Aprobar' : 'Rechazar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
