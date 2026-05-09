import { type LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export default function EmptyState({
  title = 'Sin resultados',
  description = 'No se encontraron registros.',
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <p className="text-sm text-gray-400 mt-0.5 max-w-xs">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
