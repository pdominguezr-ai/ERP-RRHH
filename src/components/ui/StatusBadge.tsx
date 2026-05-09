import { cn } from '@/lib/utils';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

const variantMap: Record<string, Variant> = {
  // Empleado
  ACTIVO:      'success',
  INACTIVO:    'neutral',
  SUSPENDIDO:  'warning',
  // Nómina
  BORRADOR:    'neutral',
  PROCESADA:   'info',
  PAGADA:      'success',
  ANULADA:     'danger',
  // Solicitud
  PENDIENTE:   'warning',
  APROBADA:    'success',
  RECHAZADA:   'danger',
  // Candidato
  REGISTRADO:  'info',
  EN_PROCESO:  'warning',
  SELECCIONADO:'success',
  // Proceso reclutamiento
  ABIERTO:     'success',
  CERRADO:     'neutral',
  CANCELADO:   'danger',
  // Onboarding
  COMPLETADO:  'success',
  // Evaluacion
  FINALIZADA:  'success',
  // Capacitacion
  PROGRAMADA:  'info',
  EN_CURSO:    'warning',
  // Beneficio
  // ACTIVO ya mapeado
  // Cumplimiento
  CUMPLIDO:    'success',
  INCUMPLIDO:  'danger',
};

const styles: Record<Variant, string> = {
  success: 'bg-green-50  text-green-700  ring-green-600/20',
  warning: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  danger:  'bg-red-50    text-red-700    ring-red-600/20',
  info:    'bg-blue-50   text-blue-700   ring-blue-600/20',
  neutral: 'bg-gray-100  text-gray-600   ring-gray-500/20',
  purple:  'bg-purple-50 text-purple-700 ring-purple-600/20',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export default function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const variant = variantMap[status] ?? 'neutral';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        styles[variant],
        className
      )}
    >
      {label ?? status}
    </span>
  );
}
