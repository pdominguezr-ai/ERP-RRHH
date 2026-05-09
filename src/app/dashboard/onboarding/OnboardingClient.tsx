'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatFecha } from '@/lib/utils';
import type { Onboarding } from '@/types/onboarding';
import { updateEstadoAction } from './actions';

interface OnboardingClientProps {
  initialData: Onboarding[];
}

export default function OnboardingClient({ initialData }: OnboardingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleEstado(id: string, estado: string) {
    setLoading(id);
    await updateEstadoAction(id, estado);
    setLoading(null);
  }

  const columns: Column<Onboarding>[] = [
    {
      key: 'empleado',
      header: 'Empleado',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.empleado?.nombres} {row.empleado?.apellidos}
          </div>
          <div className="text-xs text-gray-500">{row.empleado?.codigo}</div>
        </div>
      ),
    },
    {
      key: 'fecha_inicio',
      header: 'Fecha Inicio',
      render: (row) => <span className="text-sm text-gray-700">{formatFecha(row.fecha_inicio)}</span>,
    },
    {
      key: 'fecha_fin_estimada',
      header: 'Fecha Fin Est.',
      render: (row) => (
        <span className="text-sm text-gray-500">
          {row.fecha_fin_estimada ? formatFecha(row.fecha_fin_estimada) : '—'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => <StatusBadge status={row.estado} />,
    },
    {
      key: 'acciones',
      header: 'Avanzar Estado',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.estado === 'PENDIENTE' && (
            <button
              onClick={() => handleEstado(row.id, 'EN_PROCESO')}
              disabled={loading === row.id}
              className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
            >
              {loading === row.id ? '...' : 'Iniciar'}
            </button>
          )}
          {row.estado === 'EN_PROCESO' && (
            <button
              onClick={() => handleEstado(row.id, 'COMPLETADO')}
              disabled={loading === row.id}
              className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
            >
              {loading === row.id ? '...' : 'Completar'}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link
          href="/dashboard/onboarding/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Onboarding
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <DataTable
          data={initialData}
          columns={columns}
          searchKeys={['fecha_inicio', 'estado']}
          keyExtractor={(row) => row.id}
          emptyTitle="Sin procesos de onboarding"
          emptyDescription="No hay procesos de onboarding registrados."
        />
      </div>
    </>
  );
}
