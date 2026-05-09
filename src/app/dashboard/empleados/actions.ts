'use server';

import { revalidatePath } from 'next/cache';
import {
  createEmpleado as createDbEmpleado,
  updateEmpleado as updateDbEmpleado,
  deactivateEmpleado as deactivateDbEmpleado,
  reactivateEmpleado as reactivateDbEmpleado,
} from '@/services/empleadoService';
import type { EmpleadoFormData } from '@/types/empleado';

export async function createEmpleado(data: EmpleadoFormData) {
  try {
    const result = await createDbEmpleado(data);
    revalidatePath('/dashboard/empleados');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function updateEmpleado(id: string, data: Partial<EmpleadoFormData>) {
  try {
    const result = await updateDbEmpleado(id, data);
    revalidatePath('/dashboard/empleados');
    revalidatePath(`/dashboard/empleados/${id}`);
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function deactivateEmpleado(id: string) {
  try {
    const result = await deactivateDbEmpleado(id);
    revalidatePath('/dashboard/empleados');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function reactivateEmpleado(id: string) {
  try {
    const result = await reactivateDbEmpleado(id);
    revalidatePath('/dashboard/empleados');
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
