import { NextRequest } from 'next/server';
import { AuthController } from '@/controllers/AuthController';

export async function POST(req: NextRequest) {
  return AuthController.handleLogin(req);
}
