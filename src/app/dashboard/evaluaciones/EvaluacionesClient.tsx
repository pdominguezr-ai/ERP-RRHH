'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatFecha } from '@/lib/utils';
import type { EvaluacionDesempeno } from '@/types/evaluacion';

interface EvaluacionesClientProps {
  initialData: EvaluacionDesempeno[];
}

export default function EvaluacionesClient({ initialData }: EvaluacionesClientProps) {
  const columns: Column<EvaluacionDesempeno>[] = [
    {
      key: 'empleado',
      header: 'Empleado',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.empleado?.nombres} {row.empleado?.apellidos}</div>
          <div className="text-xs text-gray-500">{row.empleado?.departamento}</div>
        </div>
      ),
    },
    {
      key: 'periodo',
      header: 'Período',
      render: (row) => <span className="text-sm font-medium text-gray-700">{row.periodo}</span>,
    },
    {
      key: 'calificacion',
      header: 'Puntuación',
      render: (row) => (
        <span className={`font-semibold ${row.calificacion >= 80 ? 'text-green-600' : row.calificacion >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
          {row.calificacion}/100
        </span>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha Registro',
      render: (row) => <span className="text-sm text-gray-500">{formatFecha(row.created_at)}</span>,
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
          href="/dashboard/evaluaciones/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Evaluación
        </Link>
      </div>

      <DataTable
        data={initialData}
        columns={columns}
        searchKeys={['periodo', 'estado']}
        keyExtractor={(row) => row.id}
        emptyTitle="Sin evaluaciones"
        emptyDescription="No se han registrado evaluaciones de desempeño."
      />
    </>
  );
}
