import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar />
      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
