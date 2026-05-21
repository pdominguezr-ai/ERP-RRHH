import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('🔍 Inspeccionando jefes_inmediatos...');
  
  const { data: jefes, error: jefesError } = await supabase
    .from('jefes_inmediatos')
    .select('*');

  if (jefesError) {
    console.error('Error fetching jefes:', jefesError);
  } else {
    console.log('--- JEFES REGISTRADOS ---');
    jefes.forEach(j => {
      console.log(`ID: ${j.id}, UsuarioID: ${j.usuario_id}, EmpleadoID: ${j.empleado_id}`);
    });
  }

  const { data: dbUsers, error: dbError } = await supabase
    .from('usuarios_sistema')
    .select('*');

  if (dbError) {
    console.error('Error fetching system users:', dbError);
  } else {
    console.log('--- USUARIOS SISTEMA ---');
    dbUsers.forEach(u => {
      console.log(`ID: ${u.id}, Correo: ${u.correo}, Rol: ${u.rol}`);
    });
  }
}

run();
