import PageHeader from '@/components/layout/PageHeader';
import OnboardingForm from '../OnboardingForm';

export default function NuevoOnboardingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Proceso de Onboarding"
        description="Registra el proceso de incorporación para un nuevo colaborador"
      />
      <OnboardingForm />
    </div>
  );
}
