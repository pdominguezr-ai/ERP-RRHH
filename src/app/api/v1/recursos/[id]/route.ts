import { NextRequest } from 'next/server';
import { RecursoController } from '@/controllers/RecursoController';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return RecursoController.handleGetRecursoById(req, id);
}
