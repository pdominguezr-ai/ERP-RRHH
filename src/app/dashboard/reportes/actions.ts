'use server';

import { revalidatePath } from 'next/cache';
import { createReporte as createDbReporte } from '@/services/reporteService';
import type { ReporteFormData, TipoReporte } from '@/types/reporte';

import { getEmpleados } from '@/services/empleadoService';
import { getNominas } from '@/services/nominaService';
import { getAsistencias } from '@/services/asistenciaService';
import { getEvaluaciones } from '@/services/evaluacionService';
import { getBeneficios } from '@/services/beneficioService';

export async function createReporte(data: ReporteFormData) {
  try {
    const result = await createDbReporte(data);
    revalidatePath('/dashboard/reportes');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function obtenerDatosReporteAction(tipo: TipoReporte) {
  try {
    switch (tipo) {
      case 'EMPLEADOS_ACTIVOS': {
        const empleados = await getEmpleados();
        const activos = empleados.filter(e => e.estado === 'ACTIVO');
        return {
          success: true,
          headers: ['Codigo', 'Nombres', 'Apellidos', 'Correo', 'Telefono', 'Puesto', 'Departamento', 'Salario Base', 'Fecha Ingreso'],
          data: activos.map(e => [
            e.codigo,
            e.nombres,
            e.apellidos,
            e.correo,
            e.telefono || '',
            e.puesto,
            e.departamento,
            e.salario_base.toString(),
            e.fecha_ingreso
          ])
        };
      }
      case 'NOMINA': {
        const nominas = await getNominas();
        return {
          success: true,
          headers: ['ID Nomina', 'Periodo Inicio', 'Periodo Fin', 'Estado', 'Total Bruto', 'Total Deducciones', 'Total Bonificaciones', 'Total Neto'],
          data: nominas.map(n => [
            n.id.substring(0, 8),
            n.periodo_inicio,
            n.periodo_fin,
            n.estado,
            n.total_bruto.toString(),
            n.total_deducciones.toString(),
            n.total_bonificaciones.toString(),
            n.total_neto.toString()
          ])
        };
      }
      case 'ASISTENCIA': {
        const asistencias = await getAsistencias();
        return {
          success: true,
          headers: ['Empleado', 'Codigo', 'Fecha', 'Hora Entrada', 'Hora Salida', 'Horas Trabajadas'],
          data: asistencias.map(a => [
            a.empleado ? `${a.empleado.nombres} ${a.empleado.apellidos}` : 'Desconocido',
            a.empleado ? a.empleado.codigo : '',
            a.fecha,
            a.hora_entrada || '',
            a.hora_salida || '',
            a.horas_trabajadas ? a.horas_trabajadas.toString() : ''
          ])
        };
      }
      case 'EVALUACIONES': {
        const evaluaciones = await getEvaluaciones();
        return {
          success: true,
          headers: ['Empleado', 'Codigo', 'Periodo', 'Calificacion', 'Estado', 'Comentarios', 'Metas Cumplidas', 'Areas de Mejora'],
          data: evaluaciones.map(ev => [
            ev.empleado ? `${ev.empleado.nombres} ${ev.empleado.apellidos}` : 'Desconocido',
            ev.empleado ? ev.empleado.codigo : '',
            ev.periodo,
            ev.calificacion.toString(),
            ev.estado,
            ev.comentarios || '',
            ev.metas_cumplidas || '',
            ev.areas_mejora || ''
          ])
        };
      }
      case 'BENEFICIOS': {
        const beneficios = await getBeneficios();
        return {
          success: true,
          headers: ['Nombre', 'Descripcion', 'Tipo', 'Monto', 'Estado'],
          data: beneficios.map(b => [
            b.nombre,
            b.descripcion || '',
            b.tipo,
            b.monto ? b.monto.toString() : '0',
            b.estado
          ])
        };
      }
      case 'ROTACION': {
        const empleados = await getEmpleados();
        const activos = empleados.filter(e => e.estado === 'ACTIVO').length;
        const inactivos = empleados.filter(e => e.estado === 'INACTIVO').length;
        const total = empleados.length;
        const tasaRotacion = total > 0 ? ((inactivos / total) * 100).toFixed(2) + '%' : '0%';
        return {
          success: true,
          headers: ['Metrica', 'Cantidad / Valor'],
          data: [
            ['Total Historico de Empleados', total.toString()],
            ['Empleados Activos', activos.toString()],
            ['Empleados Inactivos (Bajas)', inactivos.toString()],
            ['Tasa de Rotacion Estimada', tasaRotacion]
          ]
        };
      }
      default:
        throw new Error('Tipo de reporte no soportado');
    }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al obtener datos' };
  }
}
