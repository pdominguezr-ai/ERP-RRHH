'use client';

import { useState } from 'react';
import { Edit2, Play, AlertCircle } from 'lucide-react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import { formatMoneda } from '@/lib/utils';
import type { Nomina, DetalleNomina } from '@/types/nomina';
import { updateDetalleNominaAction, procesarNominaAction } from '../actions';

interface NominaDetalleClientProps {
  nomina: Nomina;
  detalles: (DetalleNomina & {
    empleado?: {
      nombres: string;
      apellidos: string;
      codigo: string;
      departamento: string;
      puesto: string;
      estado: string;
    };
  })[];
}

export default function NominaDetalleClient({ nomina, detalles }: NominaDetalleClientProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Procesar Nómina Dialog
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);

  // Edit Detail Dialog
  const [editDetail, setEditDetail] = useState<(DetalleNomina & { empleadoName?: string }) | null>(null);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [formData, setFormData] = useState({
    bonificaciones: '0',
    deducciones: '0',
    retenciones: '0',
    observaciones: ''
  });

  function openEditModal(row: any) {
    if (nomina.estado !== 'BORRADOR') return;
    setEditDetail({
      ...row,
      empleadoName: `${row.empleado?.nombres} ${row.empleado?.apellidos}`
    });
    setFormData({
      bonificaciones: String(row.bonificaciones),
      deducciones: String(row.deducciones),
      retenciones: String(row.retenciones),
      observaciones: row.observaciones || ''
    });
    setErrorMsg(null);
    setSuccessMsg(null);
  }

  async function handleSaveDetail(e: React.FormEvent) {
    e.preventDefault();
    if (!editDetail) return;
    setIsSavingDetail(true);
    setErrorMsg(null);

    const bonusVal = parseFloat(formData.bonificaciones);
    const dedVal = parseFloat(formData.deducciones);
    const retVal = parseFloat(formData.retenciones);

    if (isNaN(bonusVal) || bonusVal < 0) {
      setErrorMsg('Las bonificaciones deben ser un número mayor o igual a cero.');
      setIsSavingDetail(false);
      return;
    }
    if (isNaN(dedVal) || dedVal < 0) {
      setErrorMsg('Las deducciones deben ser un número mayor o igual a cero.');
      setIsSavingDetail(false);
      return;
    }
    if (isNaN(retVal) || retVal < 0) {
      setErrorMsg('Las retenciones deben ser un número mayor o igual a cero.');
      setIsSavingDetail(false);
      return;
    }

    const netValue = Number(editDetail.salario_base) + bonusVal - dedVal - retVal;
    if (netValue < 0) {
      setErrorMsg('El salario neto resultante no puede ser negativo.');
      setIsSavingDetail(false);
      return;
    }

    const res = await updateDetalleNominaAction(editDetail.id, nomina.id, {
      bonificaciones: bonusVal,
      deducciones: dedVal,
      retenciones: retVal,
      observaciones: formData.observaciones
    });

    if (res.success) {
      setSuccessMsg('Detalle actualizado exitosamente.');
      setEditDetail(null);
    } else {
      setErrorMsg(res.error || 'Error al actualizar el detalle.');
    }
    setIsSavingDetail(false);
  }

  async function handleConfirmProcess() {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await procesarNominaAction(nomina.id);
    if (res.success) {
      setSuccessMsg('Nómina procesada correctamente.');
      setShowProcessDialog(false);
    } else {
      setErrorMsg(res.error || 'Error al procesar la nómina.');
      setShowProcessDialog(false);
    }
    setIsProcessing(false);
  }

  const columns: Column<any>[] = [
    {
      key: 'empleado',
      header: 'Empleado',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">
            {row.empleado?.nombres} {row.empleado?.apellidos}
          </div>
          <div className="text-xs text-gray-500">
            {row.empleado?.codigo} — {row.empleado?.puesto}
          </div>
        </div>
      ),
    },
    {
      key: 'salario_base',
      header: 'Salario Base',
      render: (row) => <span className="font-medium text-gray-700">{formatMoneda(row.salario_base)}</span>,
    },
    {
      key: 'bonificaciones',
      header: 'Bonificaciones',
      render: (row) => <span className="text-green-600 font-medium">+{formatMoneda(row.bonificaciones)}</span>,
    },
    {
      key: 'deducciones',
      header: 'Deducciones',
      render: (row) => <span className="text-red-500">-{formatMoneda(row.deducciones)}</span>,
    },
    {
      key: 'retenciones',
      header: 'Retenciones',
      render: (row) => <span className="text-red-600 font-medium">-{formatMoneda(row.retenciones)}</span>,
    },
    {
      key: 'salario_neto',
      header: 'Neto a Pagar',
      render: (row) => <span className="font-bold text-blue-700">{formatMoneda(row.salario_neto)}</span>,
    },
    {
      key: 'observaciones',
      header: 'Observaciones',
      render: (row) => <span className="text-xs text-gray-500 truncate max-w-[150px] block" title={row.observaciones}>{row.observaciones || '—'}</span>,
    },
    ...(nomina.estado === 'BORRADOR'
      ? [
          {
            key: 'acciones',
            header: 'Acciones',
            className: 'text-right',
            render: (row: any) => (
              <button
                onClick={() => openEditModal(row)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition"
              >
                <Edit2 className="w-3 h-3" />
                Editar
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Botón de Acción Principal y Alertas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Resumen y Desglose</h2>
          <p className="text-sm text-gray-500">
            Estado de Nómina: <span className="font-semibold">{nomina.estado}</span>
          </p>
        </div>

        {nomina.estado === 'BORRADOR' && (
          <button
            onClick={() => setShowProcessDialog(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <Play className="w-4 h-4" />
            Procesar Nómina
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3 text-green-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Tarjetas de Resumen Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transition hover:shadow-md">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Bruto (Salarios Base)</p>
          <p className="text-2xl font-bold text-gray-900">{formatMoneda(nomina.total_bruto)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transition hover:shadow-md">
          <p className="text-sm font-medium text-gray-400 mb-1">Deducciones/Retenciones Totales</p>
          <p className="text-2xl font-bold text-red-600">-{formatMoneda(nomina.total_deducciones)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transition hover:shadow-md">
          <p className="text-sm font-medium text-gray-400 mb-1">Bonificaciones Totales</p>
          <p className="text-2xl font-bold text-green-600">+{formatMoneda(nomina.total_bonificaciones)}</p>
        </div>
        <div className="bg-blue-600 p-5 rounded-2xl border border-blue-700 shadow-sm text-white transition hover:shadow-md">
          <p className="text-sm font-medium text-blue-100 mb-1">Total Neto a Pagar</p>
          <p className="text-3xl font-extrabold">{formatMoneda(nomina.total_neto)}</p>
        </div>
      </div>

      {/* Tabla Desglose */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Desglose de Pago por Colaborador</h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-200/60 rounded-full text-gray-600">
            {detalles.length} Empleados
          </span>
        </div>
        <div className="p-0">
          <DataTable
            data={detalles}
            columns={columns}
            searchable={true}
            searchKeys={['empleado.nombres', 'empleado.apellidos', 'empleado.codigo']}
            keyExtractor={(row) => row.id}
          />
        </div>
      </div>

      {/* Modal para Editar Detalle de Nómina */}
      {editDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900">Editar Detalle Financiero</h3>
                <p className="text-xs text-gray-500">{editDetail.empleadoName}</p>
              </div>
              <button
                onClick={() => setEditDetail(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold px-2 py-1 rounded"
              >
                Cerrar
              </button>
            </div>
            
            <form onSubmit={handleSaveDetail} className="p-6 space-y-4">
              <div className="text-sm font-medium text-gray-600 bg-gray-100 p-3 rounded-lg flex justify-between">
                <span>Salario Base:</span>
                <span className="font-bold text-gray-800">{formatMoneda(editDetail.salario_base)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput
                  label="Bonos (+)"
                  name="bonificaciones"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.bonificaciones}
                  onChange={(e) => setFormData({ ...formData, bonificaciones: e.target.value })}
                  required
                />
                <FormInput
                  label="Deducciones (-)"
                  name="deducciones"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deducciones}
                  onChange={(e) => setFormData({ ...formData, deducciones: e.target.value })}
                  required
                />
                <FormInput
                  label="Retenciones (-)"
                  name="retenciones"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.retenciones}
                  onChange={(e) => setFormData({ ...formData, retenciones: e.target.value })}
                  required
                />
              </div>

              <FormTextarea
                label="Observaciones"
                name="observaciones"
                placeholder="Ej. Bono por puntualidad o Descuento de ley..."
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditDetail(null)}
                  disabled={isSavingDetail}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingDetail}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-55"
                >
                  {isSavingDetail ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación para Procesar Nómina */}
      <ConfirmDialog
        open={showProcessDialog}
        title="Procesar Nómina"
        description="¿Estás seguro de que deseas procesar esta nómina? Esto cambiará su estado a PROCESADA, validará que todos los empleados de los detalles estén ACTIVOS, y ya no permitirá modificar sus montos."
        confirmLabel={isProcessing ? 'Procesando...' : 'Sí, Procesar'}
        variant="warning"
        loading={isProcessing}
        onConfirm={handleConfirmProcess}
        onCancel={() => setShowProcessDialog(false)}
      />
    </div>
  );
}
