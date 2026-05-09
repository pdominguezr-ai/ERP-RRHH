import PageHeader from '@/components/layout/PageHeader';
import NominaForm from '../NominaForm';

export default function NuevaNominaPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Generar Nómina"
        description="Crea un borrador de nómina para un nuevo período"
      />
      <NominaForm />
    </div>
  );
}
