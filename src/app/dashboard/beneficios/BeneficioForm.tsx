'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import { createBeneficio } from './actions';
import type { BeneficioFormData } from '@/types/beneficio';

const schema = z.object({
  nombre: z.string().min(3, 'Requerido'),
  descripcion: z.string().optional(),
  tipo: z.string().min(2, 'Requerido'),
  monto: z.coerce.number().min(0, 'No puede ser negativo').optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO']),
});

type FormData = z.infer<typeof schema>;

export default function BeneficioForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      estado: 'ACTIVO',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    try {
      const res = await createBeneficio(data as BeneficioFormData);
      if (!res.success) throw new Error(res.error);
      
      router.push('/dashboard/beneficios');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al guardar el beneficio');
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Nombre del Beneficio" registration={register('nombre')} error={errors.nombre?.message} required />
          <FormSelect
            label="Tipo"
            options={[
              { value: 'SALUD', label: 'Salud / Médico' },
              { value: 'ECONOMICO', label: 'Económico / Bono' },
              { value: 'ALIMENTACION', label: 'Alimentación' },
              { value: 'TRANSPORTE', label: 'Transporte' },
              { value: 'OTRO', label: 'Otro' },
            ]}
            registration={register('tipo')}
            error={errors.tipo?.message}
            required
          />
          
          <FormInput label="Monto o Valor (Si aplica)" type="number" step="0.01" registration={register('monto')} error={errors.monto?.message} />
          
          <FormSelect
            label="Estado"
            options={[
              { value: 'ACTIVO', label: 'Activo' },
              { value: 'INACTIVO', label: 'Inactivo' },
            ]}
            registration={register('estado')}
            error={errors.estado?.message}
            required
          />

          <div className="md:col-span-2">
            <FormTextarea label="Descripción detallada" rows={3} registration={register('descripcion')} error={errors.descripcion?.message} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/beneficios')}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Beneficio'}
        </button>
      </div>
    </form>
  );
}
