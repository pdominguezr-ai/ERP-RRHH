'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import { createEvaluacion } from './actions';
import { supabase } from '@/lib/supabaseClient';
import type { EvaluacionFormData } from '@/types/evaluacion';

const schema = z.object({
  empleado_id: z.string().min(1, 'Debe seleccionar un empleado'),
  periodo: z.string().min(3, 'Requerido (Ej. Q1-2026, Anual 2025)'),
  calificacion: z.coerce.number().min(0, 'Mínimo 0').max(100, 'Máximo 100'),
  comentarios: z.string().optional(),
  metas_cumplidas: z.string().optional(),
  areas_mejora: z.string().optional(),
  estado: z.enum(['BORRADOR', 'FINALIZADA']),
});

type FormData = z.infer<typeof schema>;

export default function EvaluacionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [misEmpleados, setMisEmpleados] = useState<{ value: string; label: string }[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      estado: 'BORRADOR',
    },
  });

  useEffect(() => {
    supabase.from('empleados')
      .select('id, nombres, apellidos, departamento')
      .eq('estado', 'ACTIVO')
      .then(({ data }) => {
        if (data) {
          setMisEmpleados(data.map(e => ({ value: e.id, label: `${e.nombres} ${e.apellidos} - ${e.departamento}` })));
        }
      });
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    try {
      const res = await createEvaluacion(data as EvaluacionFormData);
      if (!res.success) throw new Error(res.error);
      
      router.push('/dashboard/evaluaciones');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al guardar la evaluación');
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
            <FormSelect
              label="Empleado a Evaluar"
              options={misEmpleados}
              placeholder="Seleccione el empleado"
              registration={register('empleado_id')}
              error={errors.empleado_id?.message}
              required
            />
          </div>

          <FormInput label="Período Evaluado" placeholder="Ej. Q3 2026" registration={register('periodo')} error={errors.periodo?.message} required />
          <FormInput label="Calificación (0 - 100)" type="number" registration={register('calificacion')} error={errors.calificacion?.message} required />
          
          <div className="md:col-span-2">
            <FormSelect
              label="Estado"
              options={[
                { value: 'BORRADOR', label: 'Borrador (Editable)' },
                { value: 'FINALIZADA', label: 'Finalizada (Cerrada)' },
              ]}
              registration={register('estado')}
              error={errors.estado?.message}
              required
            />
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
            <FormTextarea label="Metas Cumplidas" rows={3} registration={register('metas_cumplidas')} error={errors.metas_cumplidas?.message} />
          </div>
          
          <div className="md:col-span-2">
            <FormTextarea label="Áreas de Mejora" rows={3} registration={register('areas_mejora')} error={errors.areas_mejora?.message} />
          </div>

          <div className="md:col-span-2">
            <FormTextarea label="Comentarios Generales" rows={3} registration={register('comentarios')} error={errors.comentarios?.message} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/evaluaciones')}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Evaluación'}
        </button>
      </div>
    </form>
  );
}
