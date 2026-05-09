'use client';

import Link from 'next/link';
import { Plus, Eye } from 'lucide-react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatFecha } from '@/lib/utils';
import type { Capacitacion } from '@/types/capacitacion';

interface CapacitacionesClientProps {
  initialData: Capacitacion[];
}

export default function CapacitacionesClient({ initialData }: CapacitacionesClientProps) {
  const columns: Column<Capacitacion>[] = [
    {
      key: 'nombre',
      header: 'Curso / Taller',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.nombre}</div>
          <div className="text-xs text-gray-500">Inst: {row.instructor || 'Por definir'}</div>
        </div>
      ),
    },
    {
      key: 'modalidad',
      header: 'Modalidad',
      render: (row) => <span className="text-sm text-gray-600">{row.modalidad}</span>,
    },
    {
      key: 'fechas',
      header: 'Fechas',
      render: (row) => (
        <div className="text-sm">
          <div><span className="text-gray-400 mr-1">I:</span> {formatFecha(row.fecha_inicio)}</div>
          {row.fecha_fin && <div><span className="text-gray-400 mr-1">F:</span> {formatFecha(row.fecha_fin)}</div>}
        </div>
      ),
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
          {/* Aquí podríamos agregar un enlace a los detalles/participantes */}
          <Link
            href={`/dashboard/capacitaciones/${row.id}`}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Ver Participantes"
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
          href="/dashboard/capacitaciones/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Capacitación
        </Link>
      </div>

      <DataTable
        data={initialData}
        columns={columns}
        searchKeys={['nombre', 'instructor', 'modalidad']}
        keyExtractor={(row) => row.id}
        emptyTitle="Sin capacitaciones"
        emptyDescription="No hay programas de formación registrados."
      />
    </>
  );
}
