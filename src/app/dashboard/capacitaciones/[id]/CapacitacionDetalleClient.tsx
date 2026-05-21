'use client';

import PageHeader from '@/components/layout/PageHeader';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatFecha } from '@/lib/utils';
import type { Capacitacion, CapacitacionEmpleado } from '@/types/capacitacion';

interface CapacitacionDetalleClientProps {
  capacitacion: Capacitacion;
  participantes: CapacitacionEmpleado[];
}

export default function CapacitacionDetalleClient({ capacitacion, participantes }: CapacitacionDetalleClientProps) {
  const columns: Column<CapacitacionEmpleado>[] = [
    {
      key: 'empleado',
      header: 'Empleado',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.empleado?.nombres} {row.empleado?.apellidos}
          </div>
          <div className="text-xs text-gray-500">
            {row.empleado?.codigo} - {row.empleado?.puesto}
          </div>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.completada ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'}`}>
          {row.completada ? 'COMPLETADO' : 'PENDIENTE'}
        </span>
      ),
    },
    {
      key: 'calificacion',
      header: 'Calificación',
      render: (row) => <span className="font-medium text-gray-900">{row.calificacion || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={capacitacion.nombre}
        description={`Instructor: ${capacitacion.instructor || 'Por definir'} | Modalidad: ${capacitacion.modalidad}`}
        actions={<StatusBadge status={capacitacion.estado} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Fecha de Inicio</p>
          <p className="font-semibold text-gray-900">{formatFecha(capacitacion.fecha_inicio)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Fecha de Fin</p>
          <p className="font-semibold text-gray-900">{capacitacion.fecha_fin ? formatFecha(capacitacion.fecha_fin) : '—'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Participantes</p>
          <p className="font-semibold text-blue-600">{participantes.length} empleados</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Lista de Participantes</h3>
        </div>
        <div className="p-0">
          <DataTable
            data={participantes}
            columns={columns}
            searchable={false}
            keyExtractor={(row) => row.id}
            emptyTitle="Sin participantes"
            emptyDescription="No hay empleados inscritos en esta capacitación."
          />
        </div>
      </div>
    </div>
  );
}
