'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, UserX, UserCheck } from 'lucide-react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Empleado } from '@/types/empleado';
import { formatMoneda } from '@/lib/utils';
import { deactivateEmpleado, reactivateEmpleado } from './actions';

interface EmpleadosClientProps {
  initialData: Empleado[];
}

export default function EmpleadosClient({ initialData }: EmpleadosClientProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    empleado: Empleado | null;
    action: 'deactivate' | 'reactivate' | null;
  }>({ open: false, empleado: null, action: null });

  async function handleConfirmAction() {
    if (!confirmDialog.empleado || !confirmDialog.action) return;
    setLoadingAction(true);
    
    try {
      if (confirmDialog.action === 'deactivate') {
        await deactivateEmpleado(confirmDialog.empleado.id);
      } else {
        await reactivateEmpleado(confirmDialog.empleado.id);
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error al realizar la acción');
    } finally {
      setLoadingAction(false);
      setConfirmDialog({ open: false, empleado: null, action: null });
    }
  }

  const columns: Column<Empleado>[] = [
    { key: 'codigo', header: 'Código' },
    {
      key: 'nombres',
      header: 'Empleado',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.nombres} {row.apellidos}</div>
          <div className="text-xs text-gray-500">{row.correo}</div>
        </div>
      ),
    },
    {
      key: 'puesto',
      header: 'Puesto / Depto',
      render: (row) => (
        <div>
          <div className="text-gray-900">{row.puesto}</div>
          <div className="text-xs text-gray-500">{row.departamento}</div>
        </div>
      ),
    },
    {
      key: 'salario_base',
      header: 'Salario',
      render: (row) => formatMoneda(row.salario_base),
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
          <Link
            href={`/dashboard/empleados/${row.id}`}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Editar empleado"
          >
            <Edit className="w-4 h-4" />
          </Link>
          
          {row.estado === 'ACTIVO' ? (
            <button
              onClick={() => setConfirmDialog({ open: true, empleado: row, action: 'deactivate' })}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Desactivar empleado"
            >
              <UserX className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setConfirmDialog({ open: true, empleado: row, action: 'reactivate' })}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Reactivar empleado"
            >
              <UserCheck className="w-4 h-4" />
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
          href="/dashboard/empleados/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Empleado
        </Link>
      </div>

      <DataTable
        data={initialData}
        columns={columns}
        searchKeys={['codigo', 'nombres', 'apellidos', 'correo', 'departamento']}
        keyExtractor={(row) => row.id}
        emptyTitle="Sin empleados"
        emptyDescription="Aún no hay empleados registrados en el sistema."
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.action === 'deactivate' ? 'Desactivar empleado' : 'Reactivar empleado'}
        description={`¿Estás seguro de que deseas ${confirmDialog.action === 'deactivate' ? 'desactivar' : 'reactivar'} a ${confirmDialog.empleado?.nombres} ${confirmDialog.empleado?.apellidos}?`}
        confirmLabel={confirmDialog.action === 'deactivate' ? 'Desactivar' : 'Reactivar'}
        variant={confirmDialog.action === 'deactivate' ? 'danger' : 'warning'}
        loading={loadingAction}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ open: false, empleado: null, action: null })}
      />
    </>
  );
}
