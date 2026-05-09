import { getOnboardings } from '@/services/onboardingService';
import OnboardingClient from './OnboardingClient';
import PageHeader from '@/components/layout/PageHeader';

export default async function OnboardingPage() {
  const onboardings = await getOnboardings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding"
        description="Gestiona los procesos de incorporación de nuevos colaboradores"
      />
      <OnboardingClient initialData={onboardings} />
    </div>
  );
}
