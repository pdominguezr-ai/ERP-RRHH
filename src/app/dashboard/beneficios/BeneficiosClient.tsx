'use client';

import { useState } from 'react';
import Link from 'next/link';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatMoneda, formatFecha } from '@/lib/utils';
import type { Beneficio, EmpleadoBeneficio } from '@/types/beneficio';
import { Gift, Users } from 'lucide-react';

interface BeneficiosClientProps {
  initialBeneficios: Beneficio[];
  initialAsignaciones: EmpleadoBeneficio[];
}

export default function BeneficiosClient({ initialBeneficios, initialAsignaciones }: BeneficiosClientProps) {
  const [tab, setTab] = useState<'CATALOGO' | 'ASIGNACIONES'>('CATALOGO');

  const beneficioColumns: Column<Beneficio>[] = [
    {
      key: 'nombre',
      header: 'Beneficio',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.nombre}</div>
          <div className="text-xs text-gray-500">{row.tipo}</div>
        </div>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (row) => <span className="text-sm text-gray-600 max-w-[200px] truncate block">{row.descripcion || '—'}</span>,
    },
    {
      key: 'monto',
      header: 'Monto/Valor',
      render: (row) => row.monto ? formatMoneda(row.monto) : '—',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => <StatusBadge status={row.estado} />,
    },
  ];

  const asignacionColumns: Column<EmpleadoBeneficio>[] = [
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
      key: 'beneficio',
      header: 'Beneficio',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.beneficio?.nombre}</div>
          <div className="text-xs text-gray-500">{row.beneficio?.monto ? formatMoneda(row.beneficio.monto) : 'No monetario'}</div>
        </div>
      ),
    },
    {
      key: 'fecha_asignacion',
      header: 'Fecha Asignación',
      render: (row) => formatFecha(row.fecha_asignacion),
    },
    {
      key: 'activo',
      header: 'Estado',
      render: (row) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.activo ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20'}`}>
          {row.activo ? 'ACTIVO' : 'INACTIVO'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl max-w-md w-full sm:w-auto">
          <button
            onClick={() => setTab('CATALOGO')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${
              tab === 'CATALOGO'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <Gift className="w-4 h-4" />
            Catálogo
          </button>
          <button
            onClick={() => setTab('ASIGNACIONES')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${
              tab === 'ASIGNACIONES'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Asignaciones
          </button>
        </div>

        <div>
          {tab === 'CATALOGO' && (
            <Link
              href="/dashboard/beneficios/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              Nuevo Beneficio
            </Link>
          )}
        </div>
      </div>

      {tab === 'CATALOGO' && (
        <DataTable
          data={initialBeneficios}
          columns={beneficioColumns}
          searchKeys={['nombre', 'tipo']}
          keyExtractor={(row) => row.id}
          emptyTitle="Sin beneficios"
          emptyDescription="El catálogo de beneficios está vacío."
        />
      )}

      {tab === 'ASIGNACIONES' && (
        <DataTable
          data={initialAsignaciones}
          columns={asignacionColumns}
          searchKeys={['fecha_asignacion']}
          keyExtractor={(row) => row.id}
          emptyTitle="Sin asignaciones"
          emptyDescription="Ningún empleado tiene beneficios asignados."
        />
      )}
    </div>
  );
}
