import { getNominas } from '@/services/nominaService';
import PageHeader from '@/components/layout/PageHeader';
import NominaClient from './NominaClient';

export default async function NominaPage() {
  const nominas = await getNominas();

  return (
    <div>
      <PageHeader
        title="Gestión de Nóminas"
        description="Administración de pagos, deducciones y bonificaciones"
      />
      <NominaClient initialData={nominas} />
    </div>
  );
}
