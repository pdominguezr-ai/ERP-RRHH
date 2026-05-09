'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import type { Candidato } from '@/types/reclutamiento';
import { createCandidato, updateCandidato } from './actions';

const schema = z.object({
  nombres: z.string().min(2, 'Requerido'),
  apellidos: z.string().min(2, 'Requerido'),
  correo: z.string().email('Correo inválido'),
  telefono: z.string().optional(),
  puesto_aplicado: z.string().min(2, 'Requerido'),
  estado: z.enum(['REGISTRADO', 'EN_PROCESO', 'SELECCIONADO', 'RECHAZADO']),
  observaciones: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CandidatoFormProps {
  initialData?: Candidato | null;
}

export default function CandidatoForm({ initialData }: CandidatoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: initialData ? {
      nombres: initialData.nombres,
      apellidos: initialData.apellidos,
      correo: initialData.correo,
      telefono: initialData.telefono || '',
      puesto_aplicado: initialData.puesto_aplicado,
      estado: initialData.estado,
      observaciones: initialData.observaciones || '',
    } : {
      estado: 'REGISTRADO',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    try {
      if (initialData) {
        const res = await updateCandidato(initialData.id, data);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createCandidato(data);
        if (!res.success) throw new Error(res.error);
      }
      
      router.push('/dashboard/reclutamiento');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al guardar el candidato');
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
          <FormInput label="Nombres" registration={register('nombres')} error={errors.nombres?.message} required />
          <FormInput label="Apellidos" registration={register('apellidos')} error={errors.apellidos?.message} required />
          <FormInput label="Correo" type="email" registration={register('correo')} error={errors.correo?.message} required />
          <FormInput label="Teléfono" registration={register('telefono')} error={errors.telefono?.message} />
          
          <div className="md:col-span-2 border-t pt-4 mt-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Información del Proceso</h3>
          </div>
          
          <FormInput label="Puesto Aplicado" registration={register('puesto_aplicado')} error={errors.puesto_aplicado?.message} required />
          <FormSelect
            label="Estado"
            options={[
              { value: 'REGISTRADO', label: 'Registrado' },
              { value: 'EN_PROCESO', label: 'En Proceso' },
              { value: 'SELECCIONADO', label: 'Seleccionado' },
              { value: 'RECHAZADO', label: 'Rechazado' },
            ]}
            registration={register('estado')}
            error={errors.estado?.message}
            required
          />
          <div className="md:col-span-2">
            <FormTextarea label="Observaciones" registration={register('observaciones')} error={errors.observaciones?.message} />
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
          {loading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Registrar Candidato')}
        </button>
      </div>
    </form>
  );
}
