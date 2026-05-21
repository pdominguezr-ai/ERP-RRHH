import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const usersToCreate = [
  { email: 'admin@rrhh.com',      password: 'Admin1234!',   rol: 'ADMIN_RRHH' },
  { email: 'jefe@rrhh.com',       password: 'Jefe1234!',    rol: 'JEFE_INMEDIATO' },
  { email: 'reclutador@rrhh.com',  password: 'Recluta1234!', rol: 'RECLUTADOR' },
  { email: 'empleado@rrhh.com',    password: 'Empleado1234!',rol: 'EMPLEADO' },
];

async function setup() {
  console.log('🚀 Iniciando creación/sincronización de usuarios en Supabase Auth...');

  // Obtener todos los usuarios de Auth primero para evitar depender de mensajes de error
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Error al listar usuarios de Auth:', listError.message);
    return;
  }

  for (const u of usersToCreate) {
    console.log(`--- Procesando: ${u.email} ---`);
    const existingUser = users.find(user => user.email === u.email);

    if (existingUser) {
      console.log(`ℹ️ El usuario ${u.email} ya existe en Auth con ID: ${existingUser.id}`);
      await syncUser(existingUser.id, u.email, u.rol);
    } else {
      // Crear en Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true
      });

      if (authError) {
        console.error(`❌ Error al crear ${u.email}:`, authError.message);
      } else if (authUser.user) {
        console.log(`✅ Usuario ${u.email} creado en Auth con ID: ${authUser.user.id}`);
        await syncUser(authUser.user.id, u.email, u.rol);
      }
    }
  }

  console.log('\n✨ Proceso finalizado.');
}

async function syncUser(authId: string, email: string, rol: string) {
  // 2. Sincronizar en la tabla usuarios_sistema
  const { error: dbError } = await supabase
    .from('usuarios_sistema')
    .upsert({
      auth_user_id: authId,
      correo: email,
      rol: rol
    }, { onConflict: 'correo' });

  if (dbError) {
    console.error(`❌ Error al sincronizar ${email} en la DB:`, dbError.message);
  } else {
    console.log(`🔗 Usuario ${email} vinculado correctamente en la DB.`);
  }
}

setup();
