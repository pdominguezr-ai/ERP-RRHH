'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import type { Empleado, EmpleadoFormData } from '@/types/empleado';
import { createEmpleado, updateEmpleado } from './actions';

const schema = z.object({
  codigo: z.string().optional(),
  nombres: z.string().min(2, 'Los nombres son requeridos'),
  apellidos: z.string().min(2, 'Los apellidos son requeridos'),
  correo: z.string().email('Correo inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  fecha_ingreso: z.string().min(1, 'Fecha de ingreso es requerida'),
  puesto: z.string().min(2, 'El puesto es requerido'),
  departamento: z.string().min(2, 'El departamento es requerido'),
  salario_base: z.coerce.number().min(0, 'El salario debe ser mayor o igual a 0'),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']),
  jefe_inmediato_id: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

interface EmpleadoFormProps {
  initialData?: Empleado | null;
  jefesPotenciales?: { id: string; nombres: string; apellidos: string }[];
}

export default function EmpleadoForm({ initialData, jefesPotenciales = [] }: EmpleadoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: initialData ? {
      codigo: initialData.codigo,
      nombres: initialData.nombres,
      apellidos: initialData.apellidos,
      correo: initialData.correo,
      telefono: initialData.telefono || '',
      direccion: initialData.direccion || '',
      fecha_nacimiento: initialData.fecha_nacimiento || '',
      fecha_ingreso: initialData.fecha_ingreso,
      puesto: initialData.puesto,
      departamento: initialData.departamento,
      salario_base: initialData.salario_base,
      estado: initialData.estado,
      jefe_inmediato_id: initialData.jefe_inmediato_id || '',
    } : {
      estado: 'ACTIVO',
      salario_base: 0,
      fecha_ingreso: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    const payload: EmpleadoFormData = {
      ...data,
      codigo: data.codigo || '',
      jefe_inmediato_id: data.jefe_inmediato_id || undefined,
    };

    try {
      if (initialData) {
        const res = await updateEmpleado(initialData.id, payload);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createEmpleado(payload);
        if (!res.success) throw new Error(res.error);
      }
      
      router.push('/dashboard/empleados');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al guardar el empleado');
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Datos Personales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Nombres"
            registration={register('nombres')}
            error={errors.nombres?.message}
            required
          />
          <FormInput
            label="Apellidos"
            registration={register('apellidos')}
            error={errors.apellidos?.message}
            required
          />
          <FormInput
            label="Correo Electrónico"
            type="email"
            registration={register('correo')}
            error={errors.correo?.message}
            required
          />
          <FormInput
            label="Teléfono"
            registration={register('telefono')}
            error={errors.telefono?.message}
          />
          <div className="md:col-span-2">
            <FormInput
              label="Dirección"
              registration={register('direccion')}
              error={errors.direccion?.message}
            />
          </div>
          <FormInput
            label="Fecha de Nacimiento"
            type="date"
            registration={register('fecha_nacimiento')}
            error={errors.fecha_nacimiento?.message}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Información Laboral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Código de Empleado (Auto si se deja en blanco)"
            registration={register('codigo')}
            error={errors.codigo?.message}
            disabled={!!initialData}
            placeholder="EMP-..."
          />
          <FormSelect
            label="Estado"
            options={[
              { value: 'ACTIVO', label: 'Activo' },
              { value: 'INACTIVO', label: 'Inactivo' },
              { value: 'SUSPENDIDO', label: 'Suspendido' },
            ]}
            registration={register('estado')}
            error={errors.estado?.message}
            required
          />
          <FormInput
            label="Puesto"
            registration={register('puesto')}
            error={errors.puesto?.message}
            required
          />
          <FormInput
            label="Departamento"
            registration={register('departamento')}
            error={errors.departamento?.message}
            required
          />
          <FormInput
            label="Fecha de Ingreso"
            type="date"
            registration={register('fecha_ingreso')}
            error={errors.fecha_ingreso?.message}
            required
          />
          <FormInput
            label="Salario Base"
            type="number"
            step="0.01"
            registration={register('salario_base')}
            error={errors.salario_base?.message}
            required
          />
          <div className="md:col-span-2">
            <FormSelect
              label="Jefe Inmediato"
              options={jefesPotenciales.map(j => ({ value: j.id, label: `${j.nombres} ${j.apellidos}` }))}
              placeholder="Seleccionar jefe..."
              registration={register('jefe_inmediato_id')}
              error={errors.jefe_inmediato_id?.message}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/dashboard/empleados')}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {initialData ? 'Guardar Cambios' : 'Crear Empleado'}
        </button>
      </div>
    </form>
  );
}
