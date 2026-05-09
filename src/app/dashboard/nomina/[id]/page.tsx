import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable, { type Column } from '@/components/tables/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatMoneda, formatFecha } from '@/lib/utils';
import type { Nomina, DetalleNomina } from '@/types/nomina';

async function getNominaCompleta(id: string) {
  const supabase = await createSupabaseServerClient();
  
  // 1. Cabecera
  const { data: nomina, error: errNom } = await supabase
    .from('nominas')
    .select('*')
    .eq('id', id)
    .single();

  if (errNom || !nomina) return null;

  // 2. Detalles
  const { data: detalles } = await supabase
    .from('detalle_nomina')
    .select(`
      *,
      empleado:empleados(nombres, apellidos, codigo, departamento, puesto)
    `)
    .eq('nomina_id', id);

  return { nomina: nomina as Nomina, detalles: (detalles || []) as DetalleNomina[] };
}

export default async function DetalleNominaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const data = await getNominaCompleta(resolvedParams.id);

  if (!data) notFound();

  const { nomina, detalles } = data;

  const columns: Column<DetalleNomina>[] = [
    {
      key: 'empleado',
      header: 'Empleado',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.empleado?.nombres} {row.empleado?.apellidos}</div>
          <div className="text-xs text-gray-500">{row.empleado?.codigo} - {row.empleado?.puesto}</div>
        </div>
      ),
    },
    {
      key: 'salario_base',
      header: 'Salario Base',
      render: (row) => formatMoneda(row.salario_base),
    },
    {
      key: 'bonificaciones',
      header: 'Bonificaciones',
      render: (row) => <span className="text-green-600">+{formatMoneda(row.bonificaciones)}</span>,
    },
    {
      key: 'deducciones',
      header: 'Deducciones/Ret.',
      render: (row) => <span className="text-red-600">-{formatMoneda(Number(row.deducciones) + Number(row.retenciones))}</span>,
    },
    {
      key: 'salario_neto',
      header: 'Neto a Pagar',
      render: (row) => <span className="font-bold text-gray-900">{formatMoneda(row.salario_neto || 0)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalle de Nómina"
        description={`Período: ${formatFecha(nomina.periodo_inicio)} al ${formatFecha(nomina.periodo_fin)}`}
        actions={<StatusBadge status={nomina.estado} className="text-sm px-3 py-1" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Bruto</p>
          <p className="text-xl font-semibold text-gray-900">{formatMoneda(nomina.total_bruto)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Deducciones</p>
          <p className="text-xl font-semibold text-red-600">-{formatMoneda(nomina.total_deducciones)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Bonificaciones</p>
          <p className="text-xl font-semibold text-green-600">+{formatMoneda(nomina.total_bonificaciones)}</p>
        </div>
        <div className="bg-blue-600 p-4 rounded-xl border border-blue-700 shadow-sm text-white">
          <p className="text-sm text-blue-100 mb-1">Total Neto a Pagar</p>
          <p className="text-2xl font-bold">{formatMoneda(nomina.total_neto)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Desglose por Empleado</h3>
          <span className="text-sm text-gray-500">{detalles.length} empleados en nómina</span>
        </div>
        <div className="p-0">
          <DataTable
            data={detalles}
            columns={columns}
            searchable={false}
            keyExtractor={(row) => row.id}
          />
        </div>
      </div>
    </div>
  );
}
