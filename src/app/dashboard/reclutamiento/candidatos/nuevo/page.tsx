import PageHeader from '@/components/layout/PageHeader';
import CandidatoForm from '../../CandidatoForm';

export default function NuevoCandidatoPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Registrar Candidato"
        description="Ingresa la información de un nuevo candidato"
      />
      <CandidatoForm />
    </div>
  );
}
