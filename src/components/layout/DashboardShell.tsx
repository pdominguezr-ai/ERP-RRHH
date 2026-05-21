'use client';

import { useState } from 'react';
import type { UsuarioRol } from '@/types/usuario';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface DashboardShellProps {
  userRol: UsuarioRol;
  userEmail: string;
  children: React.ReactNode;
}

export default function DashboardShell({ userRol, userEmail, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <Sidebar 
        userRol={userRol} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64 transition-all duration-300 ease-in-out">
        {/* Navbar Component */}
        <Navbar 
          userRol={userRol} 
          userEmail={userEmail} 
          onMenuClick={() => setSidebarOpen(true)} 
        />

        {/* Content Body */}
        <main className="flex-1 pt-16 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
