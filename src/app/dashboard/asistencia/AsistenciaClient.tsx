'use client';

import { useState, useEffect } from 'react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatFecha } from '@/lib/utils';
import type { Asistencia } from '@/types/asistencia';
import { Toaster, toast } from 'react-hot-toast';
import { Clock, Play, LogOut, CheckCircle, Calendar, UserCheck } from 'lucide-react';
import { marcarEntradaAction, marcarSalidaAction } from './actions';
import { useRouter } from 'next/navigation';

interface AsistenciaClientProps {
  initialData: Asistencia[];
  empleadoId: string | null;
  hoyAsistencia: Asistencia | null;
}

export default function AsistenciaClient({ initialData, empleadoId, hoyAsistencia }: AsistenciaClientProps) {
  const router = useRouter();
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(
        now.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEntrada = async () => {
    if (!empleadoId) return;
    setLoading(true);
    const res = await marcarEntradaAction(empleadoId);
    setLoading(false);
    if (res.success) {
      toast.success('¡Entrada registrada con éxito!');
      router.refresh();
    } else {
      toast.error(res.error || 'Error al registrar entrada');
    }
  };

  const handleSalida = async () => {
    if (!hoyAsistencia) return;
    setLoading(true);
    const res = await marcarSalidaAction(hoyAsistencia.id);
    setLoading(false);
    if (res.success) {
      toast.success('¡Salida registrada con éxito!');
      router.refresh();
    } else {
      toast.error(res.error || 'Error al registrar salida');
    }
  };

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
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Cabecera Interactiva de Marcación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta de Reloj Digital */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold tracking-wider uppercase">
            <Clock size={16} className="text-indigo-400 animate-pulse" />
            <span>Hora del Servidor / Local</span>
          </div>
          <div className="my-2">
            <span className="text-4xl md:text-5xl font-extrabold tracking-wider font-mono text-indigo-300 drop-shadow-[0_0_10px_rgba(129,140,248,0.2)]">
              {time || '00:00:00'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300 capitalize border-t border-slate-800 pt-3">
            <Calendar size={14} className="text-slate-400" />
            <span>{dateStr || '...'}</span>
          </div>
        </div>

        {/* Tarjeta de Acciones */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col justify-center items-center text-center min-h-[180px]">
          {empleadoId === null ? (
            <div className="flex flex-col items-center">
              <div className="p-3 bg-slate-50 rounded-full mb-3 text-slate-400">
                <UserCheck size={28} />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Modo de Visualización</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                Estás conectado como Administrador o Reclutador. Tienes acceso a visualizar los registros globales pero no cuentas con marcación activa.
              </p>
            </div>
          ) : hoyAsistencia === null ? (
            <div className="flex flex-col items-center w-full">
              <h3 className="text-base font-bold text-gray-800">¡Hola! Registra tu entrada</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Haz clic en el botón para iniciar tu jornada laboral de hoy.
              </p>
              <button
                onClick={handleEntrada}
                disabled={loading}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Play size={18} fill="currentColor" />
                    <span>Registrar Entrada</span>
                  </>
                )}
              </button>
            </div>
          ) : !hoyAsistencia.hora_salida ? (
            <div className="flex flex-col items-center w-full">
              <h3 className="text-base font-bold text-amber-600">Jornada en Curso</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4 flex items-center gap-1 justify-center">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
                Marcaste entrada hoy a las <span className="font-semibold text-gray-800">{hoyAsistencia.hora_entrada?.slice(0, 5) || '—'}</span>.
              </p>
              <button
                onClick={handleSalida}
                disabled={loading}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogOut size={18} />
                    <span>Registrar Salida</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="p-2 bg-emerald-50 rounded-full mb-2 text-emerald-500">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-base font-bold text-emerald-600">¡Asistencia Completada!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Entrada: <span className="font-medium text-gray-800">{hoyAsistencia.hora_entrada?.slice(0, 5) || '—'}</span> | Salida: <span className="font-medium text-gray-800">{hoyAsistencia.hora_salida?.slice(0, 5) || '—'}</span>
              </p>
              {hoyAsistencia.horas_trabajadas && (
                <span className="text-xs font-semibold text-indigo-600 mt-3 bg-indigo-50 py-1 px-4 rounded-full border border-indigo-100">
                  Horas trabajadas hoy: {hoyAsistencia.horas_trabajadas} h
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabla de registros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <DataTable
          data={initialData}
          columns={columns}
          searchKeys={['fecha', 'hora_entrada']}
          keyExtractor={(row) => row.id}
          emptyTitle="Sin registros"
          emptyDescription="No hay registros de asistencia."
        />
      </div>
    </div>
  );
}
