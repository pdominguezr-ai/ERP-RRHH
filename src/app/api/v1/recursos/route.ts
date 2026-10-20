import { NextRequest } from 'next/server';
import { RecursoController } from '@/controllers/RecursoController';

export async function GET(req: NextRequest) {
  return RecursoController.handleGetCatalogo(req);
}

export async function POST(req: NextRequest) {
  return RecursoController.handleCreateRecurso(req);
}
