import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: { default: 'Gestión de RRHH', template: '%s | Gestión de RRHH' },
  description: 'Sistema académico de Gestión de Recursos Humanos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full`}>
      <body className="h-full bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
