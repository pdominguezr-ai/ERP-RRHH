import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('🔍 Buscando a Paul Dominguez o empleados en la base de datos...');
  
  const { data: empleados, error } = await supabase
    .from('empleados')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching employees:', error);
    return;
  }

  console.log('--- EMPLEADOS ENCONTRADOS ---');
  empleados.forEach(emp => {
    console.log(`ID: ${emp.id}, Código: ${emp.codigo}, Nombre: ${emp.nombres} ${emp.apellidos}, Correo: ${emp.correo}, UsuarioID: ${emp.usuario_id}`);
  });
}

run();
