import { NextRequest } from 'next/server';
import { EmpleadoController } from '@/controllers/EmpleadoController';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return EmpleadoController.handleGetById(req, id);
}
