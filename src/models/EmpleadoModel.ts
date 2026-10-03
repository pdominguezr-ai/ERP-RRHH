import { supabase } from '@/config/database';
import type { Empleado, EmpleadoFormData } from '@/types/empleado';

export class EmpleadoModel {
  static async findAll(filters?: { estado?: string; departamento?: string; limit?: number; offset?: number }) {
    let query = supabase.from('empleados').select('*', { count: 'exact' });

    if (filters?.estado) {
      query = query.eq('estado', filters.estado);
    }
    if (filters?.departamento) {
      query = query.eq('departamento', filters.departamento);
    }

    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw new Error(`[EmpleadoModel.findAll] ${error.message}`);

    return {
      data: (data || []) as Empleado[],
      total: count || 0,
    };
  }

  static async findById(id: string) {
    const { data, error } = await supabase.from('empleados').select('*').eq('id', id).single();
    if (error) throw new Error(`[EmpleadoModel.findById] ${error.message}`);
    return data as Empleado;
  }

  static async create(empleadoData: Partial<Empleado>) {
    const { data, error } = await supabase.from('empleados').insert([empleadoData]).select().single();
    if (error) throw new Error(`[EmpleadoModel.create] ${error.message}`);
    return data as Empleado;
  }

  static async update(id: string, empleadoData: Partial<Empleado>) {
    const { data, error } = await supabase.from('empleados').update(empleadoData).eq('id', id).select().single();
    if (error) throw new Error(`[EmpleadoModel.update] ${error.message}`);
    return data as Empleado;
  }
}
