'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Eye, EyeOff, Lock, Mail, Users } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: correo,
      password,
    });

    if (authError) {
      setError('Correo o contraseña incorrectos. Verifica tus credenciales.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Gestión de RRHH
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Correo */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="correo"
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition duration-200 shadow-lg shadow-blue-600/20 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Usuarios de prueba */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 text-center mb-3">Usuarios de prueba</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Admin RRHH', email: 'admin@rrhh.com', pass: 'Admin1234!' },
                { label: 'Jefe', email: 'jefe@rrhh.com', pass: 'Jefe1234!' },
                { label: 'Reclutador', email: 'reclutador@rrhh.com', pass: 'Recluta1234!' },
                { label: 'Empleado', email: 'empleado@rrhh.com', pass: 'Empleado1234!' },
              ].map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setCorreo(u.email); setPassword(u.pass); }}
                  className="text-xs text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 px-2 py-1.5 rounded-md transition text-left truncate border border-white/5"
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Sistema académico de Gestión de Recursos Humanos
        </p>
      </div>
    </div>
  );
}
