'use client';

import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatFecha } from '@/lib/utils';
import type { Asistencia } from '@/types/asistencia';

interface AsistenciaClientProps {
  initialData: Asistencia[];
}

export default function AsistenciaClient({ initialData }: AsistenciaClientProps) {
  const columns: Column<Asistencia>[] = [
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
      key: 'fecha',
      header: 'Fecha',
      render: (row) => formatFecha(row.fecha),
    },
    {
      key: 'hora_entrada',
      header: 'Entrada',
      render: (row) => (
        <span className={row.hora_entrada ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {row.hora_entrada || '—'}
        </span>
      ),
    },
    {
      key: 'hora_salida',
      header: 'Salida',
      render: (row) => (
        <span className={row.hora_salida ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {row.hora_salida || '—'}
        </span>
      ),
    },
    {
      key: 'horas_trabajadas',
      header: 'Horas Totales',
      render: (row) => (
        <span className="font-semibold text-blue-700">
          {row.horas_trabajadas ? `${row.horas_trabajadas} h` : '—'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => {
        if (!row.hora_entrada) return <StatusBadge status="PENDIENTE" label="Ausente" />;
        if (!row.hora_salida) return <StatusBadge status="EN_CURSO" label="En Turno" />;
        return <StatusBadge status="COMPLETADO" label="Completado" />;
      },
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <DataTable
        data={initialData}
        columns={columns}
        searchKeys={['fecha', 'hora_entrada']} // In a real app we'd map nested keys or flatten them before passing to DataTable
        keyExtractor={(row) => row.id}
        emptyTitle="Sin registros"
        emptyDescription="No hay registros de asistencia."
      />
    </div>
  );
}
