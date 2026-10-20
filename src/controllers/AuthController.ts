import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createProblemDetailsResponse } from '@/middlewares/problemDetails';
import { redisClient } from '@/config/database';
import { domainEventBus } from '@/services/gofPatterns';

const LoginSchema = z.object({
  email: z.string().email('El correo electrónico debe tener un formato válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

interface RegisteredUser {
  id: string;
  email: string;
  password: string;
  nombre: string;
  rol: 'ADMIN' | 'ADMIN_RRHH' | 'JEFE_INMEDIATO' | 'RECLUTADOR' | 'EMPLEADO';
  estado: 'ACTIVO' | 'INACTIVO';
}

const VALID_USERS: RegisteredUser[] = [
  {
    id: 'usr-admin-001',
    email: 'admin.rrhh@empresa.com',
    password: 'Password123!',
    nombre: 'Administrador de RRHH',
    rol: 'ADMIN',
    estado: 'ACTIVO',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    email: 'admin@rrhh.com',
    password: 'Admin1234!',
    nombre: 'Administrador General RRHH',
    rol: 'ADMIN_RRHH',
    estado: 'ACTIVO',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    email: 'jefe@rrhh.com',
    password: 'Jefe1234!',
    nombre: 'Sol López - Jefe Inmediato',
    rol: 'JEFE_INMEDIATO',
    estado: 'ACTIVO',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000004',
    email: 'empleado@rrhh.com',
    password: 'Empleado1234!',
    nombre: 'Carlos García - Colaborador',
    rol: 'EMPLEADO',
    estado: 'ACTIVO',
  },
  {
    id: 'usr-inactive-099',
    email: 'inactivo.rrhh@empresa.com',
    password: 'Password123!',
    nombre: 'Colaborador Retirado',
    rol: 'EMPLEADO',
    estado: 'INACTIVO',
  },
];

export class AuthController {
  static async handleLogin(req: NextRequest) {
    const instance = '/api/v1/auth/login';
    try {
      const body = await req.json();
      const parseResult = LoginSchema.safeParse(body);

      if (!parseResult.success) {
        return createProblemDetailsResponse({
          type: 'https://erp-rrhh.umg.edu.gt/probs/validation-error',
          title: 'Solicitud de Autenticación Inválida (RFC 9110 / RFC 9457)',
          status: 400,
          detail: 'Correo electrónico o contraseña no cumplen el formato requerido.',
          instance,
          code: 'VALIDATION_ERROR',
          errors: parseResult.error.flatten().fieldErrors,
        });
      }

      const { email, password } = parseResult.data;
      const foundUser = VALID_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (foundUser && foundUser.estado === 'INACTIVO') {
        await domainEventBus.publish({
          type: 'LOGIN_FALLIDO',
          aggregateId: foundUser.id,
          payload: { email, reason: 'ACCOUNT_INACTIVE' },
          occurredAt: new Date().toISOString(),
        });

        return createProblemDetailsResponse({
          type: 'https://erp-rrhh.umg.edu.gt/probs/account-inactive',
          title: 'Cuenta de Usuario Inactiva',
          status: 403,
          detail: 'Su cuenta se encuentra inactiva o suspendida. Contacte al departamento de RRHH.',
          instance,
          code: 'ACCOUNT_INACTIVE',
        });
      }

      if (foundUser && foundUser.password === password) {
        const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(
          JSON.stringify({ sub: foundUser.id, email: foundUser.email, role: foundUser.rol })
        ).toString('base64url')}.signature_erp_rrhh_2026`;

        // Almacenar sesión en Redis con TTL = 3600s
        await redisClient.setex(
          `auth:jwt:session:${foundUser.id}`,
          3600,
          JSON.stringify({ userId: foundUser.id, rol: foundUser.rol, loginAt: new Date().toISOString() })
        );

        // Registrar auditoría en MongoDB vía Observer
        await domainEventBus.publish({
          type: 'LOGIN_EXITOSO',
          aggregateId: foundUser.id,
          payload: { email: foundUser.email, rol: foundUser.rol },
          occurredAt: new Date().toISOString(),
        });

        return NextResponse.json(
          {
            success: true,
            code: 'AUTH_SUCCESS',
            message: 'Autenticación exitosa',
            data: {
              user: {
                id: foundUser.id,
                email: foundUser.email,
                nombre: foundUser.nombre,
                rol: foundUser.rol,
              },
              token,
              expiresIn: 3600,
            },
          },
          { status: 200 }
        );
      }

      await domainEventBus.publish({
        type: 'LOGIN_FALLIDO',
        aggregateId: email,
        payload: { email, reason: 'INVALID_CREDENTIALS' },
        occurredAt: new Date().toISOString(),
      });

      return createProblemDetailsResponse({
        type: 'https://erp-rrhh.umg.edu.gt/probs/unauthorized',
        title: 'Credenciales de Acceso Inválidas',
        status: 401,
        detail: 'Credenciales inválidas. Por favor verifique su correo institucional y contraseña.',
        instance,
        code: 'UNAUTHORIZED',
      });
    } catch (error: any) {
      return createProblemDetailsResponse({
        type: 'https://erp-rrhh.umg.edu.gt/probs/internal-server-error',
        title: 'Error Interno en el Servidor de Autenticación',
        status: 500,
        detail: error.message || 'Error inesperado al procesar la solicitud de inicio de sesión.',
        instance,
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  }
}
