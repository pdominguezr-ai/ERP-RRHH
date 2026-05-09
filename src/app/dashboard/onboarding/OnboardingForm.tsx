'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import { supabase } from '@/lib/supabaseClient';
import { createOnboardingAction } from './actions';

const schema = z.object({
  empleado_id: z.string().min(1, 'Debe seleccionar un empleado'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin_estimada: z.string().optional(),
  observaciones: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function OnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [empleados, setEmpleados] = useState<{ value: string; label: string }[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      fecha_inicio: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    supabase
      .from('empleados')
      .select('id, nombres, apellidos, departamento')
      .eq('estado', 'ACTIVO')
      .then(({ data }) => {
        if (data) {
          setEmpleados(
            data.map((e) => ({
              value: e.id,
              label: `${e.nombres} ${e.apellidos} — ${e.departamento}`,
            }))
          );
        }
      });
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await createOnboardingAction({
        ...data,
        fecha_fin_estimada: data.fecha_fin_estimada || undefined,
      });
      if (!res.success) throw new Error(res.error);
      router.push('/dashboard/onboarding');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear el onboarding');
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
              label="Empleado"
              options={empleados}
              placeholder="Seleccione el empleado"
              registration={register('empleado_id')}
              error={errors.empleado_id?.message}
              required
            />
          </div>

          <FormInput
            label="Fecha de Inicio"
            type="date"
            registration={register('fecha_inicio')}
            error={errors.fecha_inicio?.message}
            required
          />
          <FormInput
            label="Fecha Fin Estimada (Opcional)"
            type="date"
            registration={register('fecha_fin_estimada')}
            error={errors.fecha_fin_estimada?.message}
          />

          <div className="md:col-span-2">
            <FormTextarea
              label="Observaciones"
              rows={3}
              registration={register('observaciones')}
              error={errors.observaciones?.message}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/onboarding')}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear Onboarding'}
        </button>
      </div>
    </form>
  );
}
