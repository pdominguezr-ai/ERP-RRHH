'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, CheckCircle, XCircle } from 'lucide-react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatMoneda, formatFecha } from '@/lib/utils';
import type { Nomina } from '@/types/nomina';
import { setNominaEstado } from './actions';

interface NominaClientProps {
  initialData: Nomina[];
}

export default function NominaClient({ initialData }: NominaClientProps) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [dialog, setDialog] = useState<{ open: boolean; nomina: Nomina | null; action: 'PAGADA' | 'ANULADA' | null }>({
    open: false, nomina: null, action: null
  });

  async function handleConfirm() {
    if (!dialog.nomina || !dialog.action) return;
    setLoadingAction(true);
    try {
      await setNominaEstado(dialog.nomina.id, dialog.action);
    } catch (e) {
      console.error(e);
      alert('Error al actualizar la nómina');
    } finally {
      setLoadingAction(false);
      setDialog({ open: false, nomina: null, action: null });
    }
  }

  const columns: Column<Nomina>[] = [
    {
      key: 'periodo',
      header: 'Período',
      render: (row) => (
        <div className="font-medium text-gray-900">
          {formatFecha(row.periodo_inicio)} al {formatFecha(row.periodo_fin)}
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => <StatusBadge status={row.estado} />,
    },
    {
      key: 'total_bruto',
      header: 'Total Bruto',
      render: (row) => <span className="text-gray-600">{formatMoneda(row.total_bruto)}</span>,
    },
    {
      key: 'total_neto',
      header: 'Total Neto',
      render: (row) => <span className="font-semibold text-gray-900">{formatMoneda(row.total_neto)}</span>,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.estado === 'BORRADOR' && (
            <button
              onClick={() => setDialog({ open: true, nomina: row, action: 'PAGADA' })}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Marcar como Pagada"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {row.estado !== 'ANULADA' && row.estado !== 'PAGADA' && (
            <button
              onClick={() => setDialog({ open: true, nomina: row, action: 'ANULADA' })}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Anular Nómina"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
          <Link
            href={`/dashboard/nomina/${row.id}`}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Ver Detalles"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link
          href="/dashboard/nomina/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Generar Nómina
        </Link>
      </div>

      <DataTable
        data={initialData}
        columns={columns}
        searchKeys={['periodo_inicio', 'periodo_fin', 'estado']}
        keyExtractor={(row) => row.id}
        emptyTitle="Sin nóminas"
        emptyDescription="No se han generado nóminas en el sistema."
      />

      <ConfirmDialog
        open={dialog.open}
        title={dialog.action === 'PAGADA' ? 'Pagar Nómina' : 'Anular Nómina'}
        description={
          dialog.action === 'PAGADA'
            ? '¿Estás seguro de que deseas marcar esta nómina como PAGADA? Esta acción no se puede deshacer.'
            : '¿Estás seguro de que deseas ANULAR esta nómina? Los registros quedarán invalidados.'
        }
        confirmLabel={dialog.action === 'PAGADA' ? 'Sí, pagar' : 'Sí, anular'}
        variant={dialog.action === 'PAGADA' ? 'warning' : 'danger'}
        loading={loadingAction}
        onConfirm={handleConfirm}
        onCancel={() => setDialog({ open: false, nomina: null, action: null })}
      />
    </>
  );
}
