'use client';

import { useState } from 'react';
import { UserPlus, UserCheck, ArrowRight, AlertCircle, Calendar } from 'lucide-react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import { formatFecha } from '@/lib/utils';
import type { ProcesoReclutamiento, Candidato } from '@/types/reclutamiento';
import { vincularCandidatoAction, contratarCandidatoAction, actualizarEtapaAction } from '../../actions';

interface ProcesoDetalleClientProps {
  proceso: ProcesoReclutamiento;
  vinculados: {
    etapa: string;
    observaciones: string;
    candidato: Candidato;
  }[];
  candidatosDisponibles: Candidato[];
}

export default function ProcesoDetalleClient({ proceso, vinculados, candidatosDisponibles }: ProcesoDetalleClientProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Vincular candidato modal
  const [showVincularModal, setShowVincularModal] = useState(false);
  const [selectedCandidatoId, setSelectedCandidatoId] = useState('');
  const [vincularObservaciones, setVincularObservaciones] = useState('');

  // Contratar candidato confirm dialog
  const [hireCandidate, setHireCandidate] = useState<Candidato | null>(null);

  // Cambiar etapa modal
  const [etapaEdit, setEtapaEdit] = useState<{ candidato: Candidato; etapa: string; observaciones: string } | null>(null);

  async function handleVincular(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCandidatoId) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await vincularCandidatoAction(proceso.id, selectedCandidatoId, vincularObservaciones);
    if (res.success) {
      setSuccessMsg('Candidato vinculado al proceso exitosamente.');
      setShowVincularModal(false);
      setSelectedCandidatoId('');
      setVincularObservaciones('');
    } else {
      setErrorMsg(res.error || 'Error al vincular el candidato.');
    }
    setLoading(false);
  }

  async function handleConfirmContratar() {
    if (!hireCandidate) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await contratarCandidatoAction(hireCandidate.id, proceso.id);
    if (res.success) {
      setSuccessMsg(`¡Candidato ${hireCandidate.nombres} contratado con éxito! Se ha creado su perfil de Empleado y se ha iniciado su plan de Onboarding.`);
      setHireCandidate(null);
    } else {
      setErrorMsg(res.error || 'Error al contratar al candidato.');
    }
    setLoading(false);
  }

  async function handleSaveEtapa(e: React.FormEvent) {
    e.preventDefault();
    if (!etapaEdit) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await actualizarEtapaAction(proceso.id, etapaEdit.candidato.id, etapaEdit.etapa, etapaEdit.observaciones);
    if (res.success) {
      setSuccessMsg('Etapa y observaciones del candidato actualizadas.');
      setEtapaEdit(null);
    } else {
      setErrorMsg(res.error || 'Error al actualizar la etapa.');
    }
    setLoading(false);
  }

  const columns: Column<any>[] = [
    {
      key: 'candidato',
      header: 'Candidato',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.candidato.nombres} {row.candidato.apellidos}</div>
          <div className="text-xs text-gray-500">{row.candidato.correo}</div>
        </div>
      ),
    },
    {
      key: 'etapa',
      header: 'Etapa del Proceso',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 rounded-lg">
          {row.etapa}
        </span>
      ),
    },
    {
      key: 'estado_candidato',
      header: 'Estado Postulante',
      render: (row) => <StatusBadge status={row.candidato.estado} />,
    },
    {
      key: 'observaciones',
      header: 'Observaciones Etapa',
      render: (row) => <span className="text-xs text-gray-500 block max-w-[200px] truncate" title={row.observaciones}>{row.observaciones || '—'}</span>,
    },
    {
      key: 'acciones',
      header: 'Acciones de Candidato',
      className: 'text-right',
      render: (row) => {
        const canManage = proceso.estado !== 'CERRADO' && proceso.estado !== 'CANCELADO' && row.candidato.estado !== 'SELECCIONADO' && row.candidato.estado !== 'RECHAZADO';
        return (
          <div className="flex items-center justify-end gap-2">
            {canManage && (
              <>
                <button
                  onClick={() => setEtapaEdit({ candidato: row.candidato, etapa: row.etapa, observaciones: row.observaciones || '' })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  title="Cambiar Etapa"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Cambiar Etapa
                </button>
                <button
                  onClick={() => setHireCandidate(row.candidato)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition"
                  title="Seleccionar y Contratar"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Contratar
                </button>
              </>
            )}
            {!canManage && row.candidato.estado === 'SELECCIONADO' && (
              <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">Contratado</span>
            )}
            {!canManage && row.candidato.estado === 'RECHAZADO' && (
              <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">Descartado</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Resumen Proceso */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Abierto desde: {formatFecha(proceso.fecha_apertura)}</span>
            {proceso.fecha_cierre && <span>• Cerrado: {formatFecha(proceso.fecha_cierre)}</span>}
          </div>
          <p className="text-gray-600 text-sm max-w-2xl">{proceso.descripcion || 'Sin descripción disponible.'}</p>
        </div>

        {proceso.estado !== 'CERRADO' && proceso.estado !== 'CANCELADO' && (
          <button
            onClick={() => setShowVincularModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            Vincular Candidato
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Candidatos vinculados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Postulantes en este Proceso</h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-200 text-gray-700 rounded-full">
            {vinculados.length} Candidato(s)
          </span>
        </div>
        
        <DataTable
          data={vinculados}
          columns={columns}
          searchKeys={['candidato.nombres', 'candidato.apellidos', 'candidato.correo', 'etapa']}
          keyExtractor={(row) => row.candidato.id}
          emptyTitle="Sin candidatos vinculados"
          emptyDescription="Aún no hay candidatos en este proceso de reclutamiento. Presiona Vincular Candidato para añadir uno."
        />
      </div>

      {/* Modal Vincular Candidato */}
      {showVincularModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Vincular Candidato al Proceso</h3>
                <p className="text-xs text-gray-500">Selecciona un candidato registrado para iniciar su postulación</p>
              </div>
              <button
                onClick={() => setShowVincularModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleVincular} className="p-6 space-y-4">
              <FormSelect
                label="Candidato Disponible"
                name="candidatoId"
                value={selectedCandidatoId}
                onChange={(e) => setSelectedCandidatoId(e.target.value)}
                required
                options={[
                  { value: '', label: 'Selecciona un candidato...' },
                  ...candidatosDisponibles.map(c => ({
                    value: c.id,
                    label: `${c.nombres} ${c.apellidos} (${c.puesto_aplicado})`
                  }))
                ]}
              />

              <FormTextarea
                label="Observaciones Iniciales"
                name="observaciones"
                placeholder="Ej. Cumple con la mayoría de requisitos, se inicia fase de postulación..."
                value={vincularObservaciones}
                onChange={(e) => setVincularObservaciones(e.target.value)}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowVincularModal(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedCandidatoId}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-55"
                >
                  {loading ? 'Vinculando...' : 'Vincular Candidato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambiar Etapa */}
      {etapaEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Cambiar Etapa de Reclutamiento</h3>
                <p className="text-xs text-gray-500">{etapaEdit.candidato.nombres} {etapaEdit.candidato.apellidos}</p>
              </div>
              <button
                onClick={() => setEtapaEdit(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveEtapa} className="p-6 space-y-4">
              <FormSelect
                label="Nueva Etapa"
                name="etapa"
                value={etapaEdit.etapa}
                onChange={(e) => setEtapaEdit({ ...etapaEdit, etapa: e.target.value })}
                required
                options={[
                  { value: 'POSTULACION', label: 'Postulación' },
                  { value: 'ENTREVISTA', label: 'Entrevista' },
                  { value: 'PRUEBA_TECNICA', label: 'Prueba Técnica' },
                  { value: 'OFERTA', label: 'Oferta' }
                ]}
              />

              <FormTextarea
                label="Observaciones y Progreso"
                name="observaciones"
                placeholder="Detalla los comentarios de esta fase o puntuación..."
                value={etapaEdit.observaciones}
                onChange={(e) => setEtapaEdit({ ...etapaEdit, observaciones: e.target.value })}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEtapaEdit(null)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
                >
                  {loading ? 'Guardando...' : 'Actualizar Etapa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación Contratación */}
      <ConfirmDialog
        open={!!hireCandidate}
        title="Contratar Candidato"
        description={hireCandidate ? `¿Estás seguro de que deseas contratar a ${hireCandidate.nombres} ${hireCandidate.apellidos}? Esta acción cerrará el proceso de reclutamiento, marcará a los demás postulantes como descartados, registrará al candidato como empleado activo del sistema y creará un plan de Onboarding en estado PENDIENTE.` : ''}
        confirmLabel={loading ? 'Procesando...' : 'Sí, Contratar'}
        variant="warning"
        loading={loading}
        onConfirm={handleConfirmContratar}
        onCancel={() => setHireCandidate(null)}
      />
    </div>
  );
}
