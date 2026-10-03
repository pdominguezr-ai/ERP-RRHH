import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('El correo electrónico debe ser válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export class AuthController {
  static async handleLogin(req: NextRequest) {
    try {
      const body = await req.json();
      const parseResult = LoginSchema.safeParse(body);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Correo o contraseña no válidos',
              details: parseResult.error.flatten().fieldErrors,
            },
          },
          { status: 400 }
        );
      }

      const { email, password } = parseResult.data;

      // Simulación o verificación de credenciales de prueba para el cascarón API
      if (email === 'admin.rrhh@empresa.com' && password === 'Password123!') {
        return NextResponse.json(
          {
            success: true,
            message: 'Autenticación exitosa',
            data: {
              user: {
                id: 'usr-admin-001',
                email: 'admin.rrhh@empresa.com',
                nombre: 'Administrador de RRHH',
                rol: 'ADMIN',
              },
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItYWRtaW4tMDAxIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNTE2MjM5MDIyfQ.sample_jwt_token',
              expiresIn: 3600,
            },
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Credenciales inválidas. Por favor verifique su correo y contraseña.',
          },
        },
        { status: 401 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Error en el servidor de autenticación',
          },
        },
        { status: 500 }
      );
    }
  }
}
