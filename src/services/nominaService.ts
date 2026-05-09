import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { Nomina, NominaFormData } from '@/types/nomina';

export async function getNominas() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('nominas')
    .select(`
      *,
      usuario:usuarios_sistema(correo)
    `)
    .order('periodo_inicio', { ascending: false });

  if (error) {
    console.error('Error fetching nominas:', error);
    throw new Error('Error al obtener las nóminas');
  }

  return data as Nomina[];
}

export async function getNominaDetalles(nominaId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('detalle_nomina')
    .select(`
      *,
      empleado:empleados(nombres, apellidos, codigo, departamento, puesto)
    `)
    .eq('nomina_id', nominaId);

  if (error) {
    console.error('Error fetching nomina detalles:', error);
    throw new Error('Error al obtener los detalles de la nómina');
  }

  return data;
}

export async function createNomina(data: NominaFormData) {
  const supabase = await createSupabaseServerClient();
  
  // 1. Obtener empleados activos
  const { data: empleadosActivos, error: empError } = await supabase
    .from('empleados')
    .select('id, salario_base')
    .eq('estado', 'ACTIVO');

  if (empError || !empleadosActivos) throw new Error('Error al obtener empleados activos para la nómina');

  // 2. Calcular totales pre-procesados
  let total_bruto = 0;
  empleadosActivos.forEach(e => total_bruto += Number(e.salario_base));

  // 3. Crear cabecera de nómina
  const { data: nuevaNomina, error: nomError } = await supabase
    .from('nominas')
    .insert([{ 
      periodo_inicio: data.periodo_inicio,
      periodo_fin: data.periodo_fin,
      observaciones: data.observaciones,
      estado: 'BORRADOR',
      total_bruto,
      total_deducciones: 0,
      total_bonificaciones: 0,
      total_neto: total_bruto,
    }])
    .select()
    .single();

  if (nomError) throw new Error(nomError.message || 'Error al crear la nómina');

  // 4. Crear detalles (salarios base)
  const detalles = empleadosActivos.map(e => ({
    nomina_id: nuevaNomina.id,
    empleado_id: e.id,
    salario_base: e.salario_base,
    bonificaciones: 0,
    deducciones: 0,
    retenciones: 0,
  }));

  const { error: detError } = await supabase.from('detalle_nomina').insert(detalles);

  if (detError) throw new Error('Error al generar los detalles de la nómina');

  return nuevaNomina as Nomina;
}

export async function updateNominaEstado(id: string, estado: 'BORRADOR' | 'PROCESADA' | 'PAGADA' | 'ANULADA') {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('nominas')
    .update({ estado })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error('Error al actualizar el estado de la nómina');
  return data as Nomina;
}
