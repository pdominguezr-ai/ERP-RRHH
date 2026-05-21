'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Download } from 'lucide-react';
import DataTable, { type Column } from '@/components/tables/DataTable';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import { formatFecha } from '@/lib/utils';
import type { ReporteRH } from '@/types/reporte';
import { createReporte, obtenerDatosReporteAction } from './actions';

interface ReportesClientProps {
  initialData: ReporteRH[];
}

const schema = z.object({
  titulo: z.string().min(3, 'Requerido'),
  tipo: z.enum(['EMPLEADOS_ACTIVOS', 'NOMINA', 'ASISTENCIA', 'ROTACION', 'EVALUACIONES', 'BENEFICIOS']),
});

type FormData = z.infer<typeof schema>;

export default function ReportesClient({ initialData }: ReportesClientProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { tipo: 'EMPLEADOS_ACTIVOS' },
  });

  const handleDownload = async (id: string, tipo: string, titulo: string) => {
    setDownloadingId(id);
    try {
      const res = await obtenerDatosReporteAction(tipo as any);
      if (!res.success || !res.headers || !res.data) {
        throw new Error(res.error || 'No se pudieron obtener los datos de la base de datos');
      }

      // Escapar comillas dobles y comas en campos de texto para CSV
      const escaparCSV = (val: any) => {
        const texto = val === null || val === undefined ? '' : String(val);
        if (texto.includes(',') || texto.includes('"') || texto.includes('\n')) {
          return `"${texto.replace(/"/g, '""')}"`;
        }
        return texto;
      };

      const cabeceraCSV = res.headers.map(escaparCSV).join(',');
      const filasCSV = res.data.map(fila => fila.map(escaparCSV).join(',')).join('\n');
      const contenidoCSV = `${cabeceraCSV}\n${filasCSV}`;

      // Crear un blob con UTF-8 BOM e iniciar descarga
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), contenidoCSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${titulo.toLowerCase().replace(/[^a-z0-9]/g, '_')}_reporte.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(error);
      alert('Error al descargar el reporte: ' + error.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const columns: Column<ReporteRH>[] = [
    {
      key: 'titulo',
      header: 'Título del Reporte',
      render: (row) => <span className="font-medium text-gray-900">{row.titulo}</span>,
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (row) => <span className="text-sm text-gray-600">{row.tipo.replace('_', ' ')}</span>,
    },
    {
      key: 'fecha',
      header: 'Fecha de Generación',
      render: (row) => <span className="text-sm text-gray-500">{formatFecha(row.created_at)}</span>,
    },
    {
      key: 'generador',
      header: 'Generado por',
      render: (row) => <span className="text-sm text-gray-500">{row.generador?.correo || 'Sistema'}</span>,
    },
    {
      key: 'acciones',
      header: 'Descargar',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end">
          <button 
            onClick={() => handleDownload(row.id, row.tipo, row.titulo)}
            disabled={downloadingId === row.id}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50" 
            title="Descargar CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await createReporte({ ...data, parametros: {} });
      if (!res.success) throw new Error(res.error);
      setShowModal(false);
      reset();
    } catch (e) {
      console.error(e);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
        >
          <FileText className="w-4 h-4" />
          Generar Reporte
        </button>
      </div>

      <DataTable
        data={initialData}
        columns={columns}
        searchKeys={['titulo', 'tipo']}
        keyExtractor={(row) => row.id}
        emptyTitle="Sin reportes"
        emptyDescription="No se han generado reportes en el sistema."
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">Nuevo Reporte</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">×</button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <FormInput label="Título del Reporte" placeholder="Ej. Empleados Q3 2026" registration={register('titulo')} error={errors.titulo?.message} required />
              
              <FormSelect
                label="Tipo de Reporte"
                options={[
                  { value: 'EMPLEADOS_ACTIVOS', label: 'Empleados Activos' },
                  { value: 'NOMINA', label: 'Nóminas Procesadas' },
                  { value: 'ASISTENCIA', label: 'Control de Asistencia' },
                  { value: 'ROTACION', label: 'Índice de Rotación' },
                  { value: 'EVALUACIONES', label: 'Evaluaciones de Desempeño' },
                  { value: 'BENEFICIOS', label: 'Beneficios Asignados' },
                ]}
                registration={register('tipo')}
                error={errors.tipo?.message}
                required
              />

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Generando...' : 'Generar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
