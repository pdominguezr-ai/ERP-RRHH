import { NextRequest, NextResponse } from 'next/server';
import { EmpleadoModel } from '@/models/EmpleadoModel';
import { generarCodigoEmpleado } from '@/lib/utils';
import { cacheAsideService } from '@/services/gofPatterns';
import { createProblemDetailsResponse } from '@/middlewares/problemDetails';
import { z } from 'zod';

const EmpleadoCreateSchema = z.object({
  nombres: z.string().min(2, 'Los nombres son requeridos'),
  apellidos: z.string().min(2, 'Los apellidos son requeridos'),
  email: z.string().email('Correo electrónico inválido').optional(),
  correo: z.string().email('Correo electrónico inválido').optional(),
  dpi: z.string().length(13, 'El DPI debe contener exactamente 13 dígitos numéricos'),
  departamento: z.string().min(2, 'El departamento es requerido'),
  puesto: z.string().min(2, 'El puesto es requerido'),
  salario_base: z.number().min(3384.59, 'El salario base no puede ser inferior al mínimo legal de Q 3,384.59'),
  fecha_contratacion: z.string().min(10, 'Fecha de contratación requerida').optional(),
  fecha_ingreso: z.string().min(10, 'Fecha de ingreso requerida').optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']).default('ACTIVO'),
});

export class EmpleadoController {
  static async handleGet(req: NextRequest) {
    const instance = '/api/v1/empleados';
    try {
      const { searchParams } = new URL(req.url);
      const estado = searchParams.get('estado') || undefined;
      const departamento = searchParams.get('departamento') || undefined;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const offset = (page - 1) * limit;

      const cacheKey = `cache:empleados:list:dept=${departamento || 'ALL'}:estado=${estado || 'ALL'}:p=${page}:l=${limit}`;
      const cachedResult = await cacheAsideService.getOrSet(
        cacheKey,
        async () => EmpleadoModel.findAll({ estado, departamento, limit, offset }),
        300
      );

      return NextResponse.json(
        {
          success: true,
          data: cachedResult.data.data,
          pagination: {
            total: cachedResult.data.total,
            page,
            limit,
            totalPages: Math.ceil(cachedResult.data.total / limit) || 1,
          },
          cache_metadata: {
            status: cachedResult.cacheStatus,
            ttl_seconds: cachedResult.ttlRemainingSeconds,
          },
        },
        {
          status: 200,
          headers: {
            'X-Cache': cachedResult.cacheStatus,
          },
        }
      );
    } catch (error: any) {
      return createProblemDetailsResponse({
        title: 'Error al Obtener Colaboradores',
        status: 500,
        detail: error.message || 'Error al obtener la lista de colaboradores',
        instance,
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  }

  static async handlePost(req: NextRequest) {
    const instance = '/api/v1/empleados';
    try {
      const body = await req.json();

      const parseResult = EmpleadoCreateSchema.safeParse(body);
      if (!parseResult.success) {
        return createProblemDetailsResponse({
          title: 'Error de Validación DTO en Registro de Colaborador',
          status: 400,
          detail: 'Los datos enviados no cumplen las reglas de negocio',
          instance,
          code: 'VALIDATION_ERROR',
          errors: parseResult.error.flatten().fieldErrors,
        });
      }

      const validatedData = parseResult.data;
      const codigo = generarCodigoEmpleado();
      const emailFinal = validatedData.email || validatedData.correo || 'colaborador@empresa.com';

      const newEmpleado = await EmpleadoModel.create({
        ...validatedData,
        email: emailFinal,
        correo: emailFinal,
        codigo,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Colaborador registrado exitosamente',
          data: newEmpleado,
        },
        { status: 201 }
      );
    } catch (error: any) {
      const isDuplicate = error.message?.includes('23505') || error.message?.includes('duplicate');
      return createProblemDetailsResponse({
        title: isDuplicate ? 'Recurso Duplicado' : 'Error Interno del Servidor',
        status: isDuplicate ? 400 : 500,
        detail: error.message || 'Error al registrar el colaborador',
        instance,
        code: isDuplicate ? 'DUPLICATE_RESOURCE' : 'INTERNAL_SERVER_ERROR',
      });
    }
  }

  static async handleGetById(req: NextRequest, id: string) {
    const instance = `/api/v1/empleados/${id}`;
    const found = await EmpleadoModel.findById(id);
    if (!found) {
      return createProblemDetailsResponse({
        title: 'Colaborador No Encontrado',
        status: 404,
        detail: `No se encontró ningún colaborador con el ID o código '${id}'.`,
        instance,
        code: 'RESOURCE_NOT_FOUND',
      });
    }
    return NextResponse.json({ success: true, data: found }, { status: 200 });
  }
}
