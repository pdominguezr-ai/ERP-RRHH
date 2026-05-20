export function esCorreoValido(correo: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
}

export function esCodigoEmpleadoValido(codigo: string): boolean {
  return codigo.trim().length >= 3 && codigo.trim().length <= 20;
}

export interface ValidadorResultado {
  valido: boolean;
  error?: string;
}

export const Validators = {
  empleado: (data: { codigo: string; correo: string; salario_base: number; estado: string }): ValidadorResultado => {
    if (!esCodigoEmpleadoValido(data.codigo)) {
      return { valido: false, error: 'El código del empleado debe tener entre 3 y 20 caracteres.' };
    }
    if (!esCorreoValido(data.correo)) {
      return { valido: false, error: 'El correo electrónico no tiene un formato válido.' };
    }
    if (data.salario_base < 0) {
      return { valido: false, error: 'El salario base no puede ser negativo.' };
    }
    const estadosPermitidos = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'];
    if (!estadosPermitidos.includes(data.estado)) {
      return { valido: false, error: `Estado inválido. Valores permitidos: ${estadosPermitidos.join(', ')}` };
    }
    return { valido: true };
  },

  nomina: (data: { periodo_inicio: string; periodo_fin: string; total_bruto?: number; total_neto?: number }): ValidadorResultado => {
    const inicio = new Date(data.periodo_inicio);
    const fin = new Date(data.periodo_fin);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return { valido: false, error: 'Las fechas del período de nómina no son válidas.' };
    }
    if (fin < inicio) {
      return { valido: false, error: 'La fecha de fin no puede ser anterior a la fecha de inicio.' };
    }
    return { valido: true };
  },

  detalleNomina: (data: { salario_base: number; bonificaciones: number; deducciones: number; retenciones: number }): ValidadorResultado => {
    if (data.salario_base < 0) return { valido: false, error: 'El salario base no puede ser negativo.' };
    if (data.bonificaciones < 0) return { valido: false, error: 'Las bonificaciones no pueden ser negativas.' };
    if (data.deducciones < 0) return { valido: false, error: 'Las deducciones no pueden ser negativas.' };
    if (data.retenciones < 0) return { valido: false, error: 'Las retenciones no pueden ser negativas.' };
    
    const neto = data.salario_base + data.bonificaciones - data.deducciones - data.retenciones;
    if (neto < 0) {
      return { valido: false, error: 'El salario neto calculado no puede ser negativo.' };
    }
    return { valido: true };
  },

  asistencia: (data: { fecha: string; hora_entrada?: string | null; hora_salida?: string | null }): ValidadorResultado => {
    if (!data.fecha) return { valido: false, error: 'La fecha es obligatoria.' };
    if (data.hora_entrada && data.hora_salida) {
      const [hEntrada, mEntrada] = data.hora_entrada.split(':').map(Number);
      const [hSalida, mSalida] = data.hora_salida.split(':').map(Number);
      const entradaMinutos = hEntrada * 60 + mEntrada;
      const salidaMinutos = hSalida * 60 + mSalida;
      if (salidaMinutos < entradaMinutos) {
        return { valido: false, error: 'La hora de salida no puede ser anterior a la de entrada.' };
      }
    }
    return { valido: true };
  },

  solicitudAusencia: (data: { fecha_inicio: string; fecha_fin: string; tipo: string }): ValidadorResultado => {
    const inicio = new Date(data.fecha_inicio);
    const fin = new Date(data.fecha_fin);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return { valido: false, error: 'Las fechas especificadas no son válidas.' };
    }
    if (fin < inicio) {
      return { valido: false, error: 'La fecha de fin no puede ser anterior a la fecha de inicio.' };
    }
    const tiposPermitidos = ['PERMISO', 'VACACIONES', 'ENFERMEDAD', 'OTRO'];
    if (!tiposPermitidos.includes(data.tipo)) {
      return { valido: false, error: `Tipo de ausencia no permitido. Valores válidos: ${tiposPermitidos.join(', ')}` };
    }
    return { valido: true };
  },

  evaluacionDesempeno: (data: { calificacion: number; estado: string }): ValidadorResultado => {
    if (data.calificacion < 0 || data.calificacion > 100) {
      return { valido: false, error: 'La calificación debe estar entre 0 y 100.' };
    }
    const estadosPermitidos = ['BORRADOR', 'FINALIZADA'];
    if (!estadosPermitidos.includes(data.estado)) {
      return { valido: false, error: `Estado de evaluación no permitido. Valores: ${estadosPermitidos.join(', ')}` };
    }
    return { valido: true };
  },

  capacitacion: (data: { fecha_inicio: string; fecha_fin?: string | null; estado: string }): ValidadorResultado => {
    const inicio = new Date(data.fecha_inicio);
    if (isNaN(inicio.getTime())) return { valido: false, error: 'La fecha de inicio no es válida.' };
    
    if (data.fecha_fin) {
      const fin = new Date(data.fecha_fin);
      if (!isNaN(fin.getTime()) && fin < inicio) {
        return { valido: false, error: 'La fecha de finalización no puede ser anterior a la de inicio.' };
      }
    }
    const estadosPermitidos = ['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'];
    if (!estadosPermitidos.includes(data.estado)) {
      return { valido: false, error: `Estado de capacitación no permitido. Valores: ${estadosPermitidos.join(', ')}` };
    }
    return { valido: true };
  },

  beneficio: (data: { monto: number; estado: string }): ValidadorResultado => {
    if (data.monto < 0) return { valido: false, error: 'El monto del beneficio no puede ser negativo.' };
    const estadosPermitidos = ['ACTIVO', 'INACTIVO'];
    if (!estadosPermitidos.includes(data.estado)) {
      return { valido: false, error: `Estado de beneficio no permitido. Valores: ${estadosPermitidos.join(', ')}` };
    }
    return { valido: true };
  }
};
