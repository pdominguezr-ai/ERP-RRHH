'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import { createNomina } from './actions';

const schema = z.object({
  periodo_inicio: z.string().min(1, 'Requerido'),
  periodo_fin: z.string().min(1, 'Requerido'),
  observaciones: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NominaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      periodo_inicio: '',
      periodo_fin: '',
      observaciones: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    try {
      const res = await createNomina(data);
      if (!res.success) throw new Error(res.error);
      
      router.push('/dashboard/nomina');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al generar la nómina');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-6 border border-blue-100">
          <strong>Nota:</strong> Al generar la nómina, el sistema tomará a todos los empleados en estado <strong>ACTIVO</strong> y calculará el Total Bruto en base a su salario registrado.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Período Inicio" type="date" registration={register('periodo_inicio')} error={errors.periodo_inicio?.message} required />
          <FormInput label="Período Fin" type="date" registration={register('periodo_fin')} error={errors.periodo_fin?.message} required />
          
          <div className="md:col-span-2">
            <FormTextarea label="Observaciones (Opcional)" rows={3} registration={register('observaciones')} error={errors.observaciones?.message} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/nomina')}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Generar Nómina'}
        </button>
      </div>
    </form>
  );
}
