import { requireRole } from '@/lib/auth';
import PageHeader from '@/components/layout/PageHeader';
import BeneficioForm from '../BeneficioForm';

export default async function NuevoBeneficioPage() {
  await requireRole(['ADMIN_RRHH']);

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Crear Beneficio"
        description="Agrega un nuevo beneficio corporativo al catálogo"
      />
      <BeneficioForm />
    </div>
  );
}
