'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import type { ProcesoReclutamiento, ProcesoReclutamientoFormData } from '@/types/reclutamiento';
import { createProceso, updateProceso } from './actions';

const schema = z.object({
  titulo: z.string().min(3, 'Requerido'),
  descripcion: z.string().optional(),
  puesto: z.string().min(2, 'Requerido'),
  departamento: z.string().min(2, 'Requerido'),
  estado: z.enum(['ABIERTO', 'EN_PROCESO', 'CERRADO', 'CANCELADO']),
  fecha_apertura: z.string().min(1, 'Requerida'),
  fecha_cierre: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ProcesoFormProps {
  initialData?: ProcesoReclutamiento | null;
}

export default function ProcesoForm({ initialData }: ProcesoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: initialData ? {
      titulo: initialData.titulo,
      descripcion: initialData.descripcion || '',
      puesto: initialData.puesto,
      departamento: initialData.departamento,
      estado: initialData.estado,
      fecha_apertura: initialData.fecha_apertura,
      fecha_cierre: initialData.fecha_cierre || '',
    } : {
      estado: 'ABIERTO',
      fecha_apertura: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    const payload: ProcesoReclutamientoFormData = {
      ...data,
      fecha_cierre: data.fecha_cierre || undefined,
    };

    try {
      if (initialData) {
        const res = await updateProceso(initialData.id, payload);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createProceso(payload);
        if (!res.success) throw new Error(res.error);
      }
      
      router.push('/dashboard/reclutamiento');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al guardar el proceso');
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
            <FormInput label="Título del Proceso" registration={register('titulo')} error={errors.titulo?.message} required />
          </div>
          
          <FormInput label="Puesto a cubrir" registration={register('puesto')} error={errors.puesto?.message} required />
          <FormInput label="Departamento" registration={register('departamento')} error={errors.departamento?.message} required />
          
          <FormInput label="Fecha de Apertura" type="date" registration={register('fecha_apertura')} error={errors.fecha_apertura?.message} required />
          <FormInput label="Fecha de Cierre (Opcional)" type="date" registration={register('fecha_cierre')} error={errors.fecha_cierre?.message} />

          <FormSelect
            label="Estado"
            options={[
              { value: 'ABIERTO', label: 'Abierto' },
              { value: 'EN_PROCESO', label: 'En Proceso' },
              { value: 'CERRADO', label: 'Cerrado' },
              { value: 'CANCELADO', label: 'Cancelado' },
            ]}
            registration={register('estado')}
            error={errors.estado?.message}
            required
          />

          <div className="md:col-span-2">
            <FormTextarea label="Descripción detallada" rows={4} registration={register('descripcion')} error={errors.descripcion?.message} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/reclutamiento')}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Proceso')}
        </button>
      </div>
    </form>
  );
}
