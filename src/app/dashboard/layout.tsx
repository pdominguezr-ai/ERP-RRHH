import { getUserInfo } from '@/lib/auth';
import DashboardShell from '@/components/layout/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { correo, rol } = await getUserInfo();

  return (
    <DashboardShell userRol={rol} userEmail={correo}>
      {children}
    </DashboardShell>
  );
}

