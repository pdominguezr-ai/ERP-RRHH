'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatFecha } from '@/lib/utils';
import type { Candidato, ProcesoReclutamiento } from '@/types/reclutamiento';
import { Users, Briefcase } from 'lucide-react';

interface ReclutamientoClientProps {
  initialCandidatos: Candidato[];
  initialProcesos: ProcesoReclutamiento[];
}

export default function ReclutamientoClient({ initialCandidatos, initialProcesos }: ReclutamientoClientProps) {
  const [tab, setTab] = useState<'CANDIDATOS' | 'PROCESOS'>('CANDIDATOS');

  const candidatoColumns: Column<Candidato>[] = [
    {
      key: 'candidato',
      header: 'Candidato',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.nombres} {row.apellidos}</div>
          <div className="text-xs text-gray-500">{row.correo}</div>
        </div>
      ),
    },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'puesto_aplicado', header: 'Puesto Aplicado' },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => <StatusBadge status={row.estado} />,
    },
    {
      key: 'fecha',
      header: 'Fecha Registro',
      render: (row) => <span className="text-gray-500">{formatFecha(row.created_at)}</span>,
    },
  ];

  const procesoColumns: Column<ProcesoReclutamiento>[] = [
    {
      key: 'proceso',
      header: 'Proceso',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.titulo}</div>
          <div className="text-xs text-gray-500">{row.departamento}</div>
        </div>
      ),
    },
    { key: 'puesto', header: 'Puesto' },
    {
      key: 'estado',
      header: 'Estado',
      render: (row) => <StatusBadge status={row.estado} />,
    },
    {
      key: 'fechas',
      header: 'Apertura / Cierre',
      render: (row) => (
        <div className="text-sm">
          <div><span className="text-gray-400 mr-1">A:</span> {formatFecha(row.fecha_apertura)}</div>
          {row.fecha_cierre && <div><span className="text-gray-400 mr-1">C:</span> {formatFecha(row.fecha_cierre)}</div>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl max-w-md w-full sm:w-auto">
          <button
            onClick={() => setTab('CANDIDATOS')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${
              tab === 'CANDIDATOS'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Candidatos
          </button>
          <button
            onClick={() => setTab('PROCESOS')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${
              tab === 'PROCESOS'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Procesos
          </button>
        </div>

        <div>
          {tab === 'CANDIDATOS' ? (
            <a
              href="/dashboard/reclutamiento/candidatos/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              Nuevo Candidato
            </a>
          ) : (
            <a
              href="/dashboard/reclutamiento/procesos/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              Nuevo Proceso
            </a>
          )}
        </div>
      </div>

      {tab === 'CANDIDATOS' && (
        <DataTable
          data={initialCandidatos}
          columns={candidatoColumns}
          searchKeys={['nombres', 'apellidos', 'correo', 'puesto_aplicado']}
          keyExtractor={(row) => row.id}
          emptyTitle="Sin candidatos"
          emptyDescription="No se encontraron candidatos registrados."
        />
      )}

      {tab === 'PROCESOS' && (
        <DataTable
          data={initialProcesos}
          columns={procesoColumns}
          searchKeys={['titulo', 'puesto', 'departamento']}
          keyExtractor={(row) => row.id}
          emptyTitle="Sin procesos"
          emptyDescription="No hay procesos de reclutamiento activos."
        />
      )}
    </div>
  );
}
