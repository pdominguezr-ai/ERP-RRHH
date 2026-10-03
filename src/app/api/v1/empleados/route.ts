import { NextRequest } from 'next/server';
import { EmpleadoController } from '@/controllers/EmpleadoController';

export async function GET(req: NextRequest) {
  return EmpleadoController.handleGet(req);
}

export async function POST(req: NextRequest) {
  return EmpleadoController.handlePost(req);
}
