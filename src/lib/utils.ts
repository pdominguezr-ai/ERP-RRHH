import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatFecha(fecha: string, pattern = 'dd/MM/yyyy'): string { try { return format(parseISO(fecha), pattern, { locale: es }); } catch { return fecha; } }
export function formatMoneda(valor: number, moneda = 'GTQ'): string { return new Intl.NumberFormat('es-GT', { style: 'currency', currency: moneda }).format(valor); }
export function generarCodigoEmpleado(prefijo = 'EMP'): string { return `${prefijo}-${Date.now().toString().slice(-6)}`; }
export function calcularDias(inicio: string, fin: string): number { return Math.ceil((new Date(fin).getTime() - new Date(inicio).getTime()) / 86400000); }
export function calcularHorasTrabajadas(entrada: string, salida: string): number { const [hE, mE] = entrada.split(':').map(Number); const [hS, mS] = salida.split(':').map(Number); return Math.max(0, parseFloat(((hS * 60 + mS - hE * 60 - mE) / 60).toFixed(2))); }
