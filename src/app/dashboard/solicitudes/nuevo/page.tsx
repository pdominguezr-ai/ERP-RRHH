import PageHeader from '@/components/layout/PageHeader';
import SolicitudForm from '../SolicitudForm';

export default function NuevaSolicitudPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Nueva Solicitud de Ausencia"
        description="Ingresa los detalles para solicitar vacaciones, permisos o enfermedad"
      />
      <SolicitudForm />
    </div>
  );
}
