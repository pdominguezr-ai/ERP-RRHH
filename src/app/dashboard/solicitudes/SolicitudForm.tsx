'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import { createSolicitud } from './actions';
import { supabase } from '@/lib/supabaseClient';

const schema = z.object({
  empleado_id: z.string().min(1, 'Debe seleccionar un empleado'),
  tipo: z.enum(['PERMISO', 'VACACIONES', 'ENFERMEDAD', 'OTRO']),
  fecha_inicio: z.string().min(1, 'Requerida'),
  fecha_fin: z.string().min(1, 'Requerida'),
  motivo: z.string().min(5, 'El motivo es muy corto'),
});

type FormData = z.infer<typeof schema>;

export default function SolicitudForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [misEmpleados, setMisEmpleados] = useState<{ value: string; label: string }[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      tipo: 'PERMISO',
      fecha_inicio: '',
      fecha_fin: '',
      motivo: '',
    },
  });

  // Para demostración: traemos todos los empleados activos (en el futuro se filtra según el rol/usuario)
  useEffect(() => {
    supabase.from('empleados')
      .select('id, nombres, apellidos')
      .eq('estado', 'ACTIVO')
      .then(({ data }) => {
        if (data) {
          setMisEmpleados(data.map(e => ({ value: e.id, label: `${e.nombres} ${e.apellidos}` })));
        }
      });
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    try {
      const res = await createSolicitud(data);
      if (!res.success) throw new Error(res.error);
      
      router.push('/dashboard/solicitudes');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al enviar la solicitud');
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
              options={misEmpleados}
              placeholder="Seleccione el empleado que solicita"
              registration={register('empleado_id')}
              error={errors.empleado_id?.message}
              required
            />
          </div>

          <FormSelect
            label="Tipo de Ausencia"
            options={[
              { value: 'PERMISO', label: 'Permiso' },
              { value: 'VACACIONES', label: 'Vacaciones' },
              { value: 'ENFERMEDAD', label: 'Enfermedad' },
              { value: 'OTRO', label: 'Otro' },
            ]}
            registration={register('tipo')}
            error={errors.tipo?.message}
            required
          />

          <div className="hidden md:block"></div> {/* Espaciador */}

          <FormInput label="Fecha de Inicio" type="date" registration={register('fecha_inicio')} error={errors.fecha_inicio?.message} required />
          <FormInput label="Fecha de Fin" type="date" registration={register('fecha_fin')} error={errors.fecha_fin?.message} required />

          <div className="md:col-span-2">
            <FormTextarea label="Motivo de la solicitud" rows={4} registration={register('motivo')} error={errors.motivo?.message} required />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/solicitudes')}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Solicitud'}
        </button>
      </div>
    </form>
  );
}
