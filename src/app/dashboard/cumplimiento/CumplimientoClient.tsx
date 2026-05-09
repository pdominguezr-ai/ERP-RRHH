'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatFecha } from '@/lib/utils';
import type { CumplimientoLaboral } from '@/types/cumplimiento';

interface CumplimientoClientProps {
  initialData: CumplimientoLaboral[];
}

export default function CumplimientoClient({ initialData }: CumplimientoClientProps) {
  const columns: Column<CumplimientoLaboral>[] = [
    {
      key: 'normativa',
      header: 'Normativa / Política',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.nombre}</div>
          <div className="text-xs text-gray-500">{row.categoria}</div>
        </div>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (row) => <span className="text-sm text-gray-600 truncate max-w-[250px] block" title={row.descripcion}>{row.descripcion || '—'}</span>,
    },
    {
      key: 'fecha_limite',
      header: 'Fecha Límite',
      render: (row) => <span className="text-sm text-gray-700">{row.fecha_limite ? formatFecha(row.fecha_limite) : 'Sin límite'}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => <StatusBadge status={row.estado} />,
    },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link
          href="/dashboard/cumplimiento/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Registrar Política
        </Link>
      </div>

      <DataTable
        data={initialData}
        columns={columns}
        searchKeys={['nombre', 'categoria', 'estado']}
        keyExtractor={(row) => row.id}
        emptyTitle="Sin registros"
        emptyDescription="No hay políticas de cumplimiento registradas."
      />
    </>
  );
}
