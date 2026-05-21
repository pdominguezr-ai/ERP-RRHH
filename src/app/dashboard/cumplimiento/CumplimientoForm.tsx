'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import { createCumplimiento } from './actions';
import type { CumplimientoFormData } from '@/types/cumplimiento';

const schema = z.object({
  nombre: z.string().min(3, 'Requerido'),
  descripcion: z.string().optional(),
  categoria: z.string().min(2, 'Requerido'),
  fecha_limite: z.string().optional(),
  estado: z.enum(['PENDIENTE', 'CUMPLIDO', 'INCUMPLIDO']),
  observaciones: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CumplimientoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      estado: 'PENDIENTE',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    try {
      const payload: CumplimientoFormData = {
        ...data,
        fecha_limite: data.fecha_limite || undefined,
      };
      const res = await createCumplimiento(payload);
      if (!res.success) throw new Error(res.error);
      
      router.push('/dashboard/cumplimiento');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al guardar el registro de cumplimiento');
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
          <div className="md:col-span-2">
            <FormInput label="Nombre de la Normativa/Política" registration={register('nombre')} error={errors.nombre?.message} required />
          </div>

          <FormSelect
            label="Categoría"
            options={[
              { value: 'LEGAL', label: 'Legal / Normativa Estatal' },
              { value: 'SEGURIDAD', label: 'Seguridad Laboral' },
              { value: 'INTERNA', label: 'Política Interna RRHH' },
              { value: 'CERTIFICACION', label: 'Certificación / Auditoría' },
            ]}
            registration={register('categoria')}
            error={errors.categoria?.message}
            required
          />

          <FormInput label="Fecha Límite (Opcional)" type="date" registration={register('fecha_limite')} error={errors.fecha_limite?.message} />

          <div className="md:col-span-2">
            <FormSelect
              label="Estado"
              options={[
                { value: 'PENDIENTE', label: 'Pendiente' },
                { value: 'CUMPLIDO', label: 'Cumplido' },
                { value: 'INCUMPLIDO', label: 'Incumplido' },
              ]}
              registration={register('estado')}
              error={errors.estado?.message}
              required
            />
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
            <FormTextarea label="Descripción" rows={3} registration={register('descripcion')} error={errors.descripcion?.message} />
          </div>
          
          <div className="md:col-span-2">
            <FormTextarea label="Observaciones" rows={2} registration={register('observaciones')} error={errors.observaciones?.message} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/cumplimiento')}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Registro'}
        </button>
      </div>
    </form>
  );
}
