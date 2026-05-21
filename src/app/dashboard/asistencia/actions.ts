'use server';

import { registrarEntrada, registrarSalida } from '@/services/asistenciaService';
import { revalidatePath } from 'next/cache';

export async function marcarEntradaAction(empleadoId: string) {
  try {
    const now = new Date();
    
    // Formatear fecha y hora local del servidor
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const fecha = `${year}-${month}-${day}`;

    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const hora_entrada = `${hours}:${minutes}`;

    await registrarEntrada(empleadoId, fecha, hora_entrada);
    
    revalidatePath('/dashboard/asistencia');
    return { success: true };
  } catch (error: any) {
    console.error('Error in marcarEntradaAction:', error);
    return { success: false, error: error.message || 'Error al registrar la entrada.' };
  }
}

export async function marcarSalidaAction(asistenciaId: string) {
  try {
    const now = new Date();
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const hora_salida = `${hours}:${minutes}`;

    await registrarSalida(asistenciaId, hora_salida);
    
    revalidatePath('/dashboard/asistencia');
    return { success: true };
  } catch (error: any) {
    console.error('Error in marcarSalidaAction:', error);
    return { success: false, error: error.message || 'Error al registrar la salida.' };
  }
}
