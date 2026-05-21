'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import { createCapacitacion } from './actions';
import type { CapacitacionFormData } from '@/types/capacitacion';

const schema = z.object({
  nombre: z.string().min(3, 'Requerido'),
  descripcion: z.string().optional(),
  instructor: z.string().optional(),
  fecha_inicio: z.string().min(1, 'Requerida'),
  fecha_fin: z.string().optional(),
  modalidad: z.string().min(2, 'Requerido'),
  estado: z.enum(['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA']),
});

type FormData = z.infer<typeof schema>;

export default function CapacitacionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      estado: 'PROGRAMADA',
      modalidad: 'PRESENCIAL',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    try {
      const payload: CapacitacionFormData = {
        ...data,
        fecha_fin: data.fecha_fin || undefined,
      };
      const res = await createCapacitacion(payload);
      if (!res.success) throw new Error(res.error);
      
      router.push('/dashboard/capacitaciones');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al guardar la capacitación');
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
            <FormInput label="Nombre del Curso/Taller" registration={register('nombre')} error={errors.nombre?.message} required />
          </div>
          
          <FormInput label="Instructor" registration={register('instructor')} error={errors.instructor?.message} />
          
          <FormSelect
            label="Modalidad"
            options={[
              { value: 'PRESENCIAL', label: 'Presencial' },
              { value: 'VIRTUAL', label: 'Virtual' },
              { value: 'HIBRIDO', label: 'Híbrido' },
            ]}
            registration={register('modalidad')}
            error={errors.modalidad?.message}
            required
          />
          
          <FormInput label="Fecha de Inicio" type="date" registration={register('fecha_inicio')} error={errors.fecha_inicio?.message} required />
          <FormInput label="Fecha de Fin (Opcional)" type="date" registration={register('fecha_fin')} error={errors.fecha_fin?.message} />

          <div className="md:col-span-2">
            <FormSelect
              label="Estado"
              options={[
                { value: 'PROGRAMADA', label: 'Programada' },
                { value: 'EN_CURSO', label: 'En Curso' },
                { value: 'FINALIZADA', label: 'Finalizada' },
                { value: 'CANCELADA', label: 'Cancelada' },
              ]}
              registration={register('estado')}
              error={errors.estado?.message}
              required
            />
          </div>

          <div className="md:col-span-2">
            <FormTextarea label="Descripción" rows={3} registration={register('descripcion')} error={errors.descripcion?.message} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/capacitaciones')}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Crear Capacitación'}
        </button>
      </div>
    </form>
  );
}
