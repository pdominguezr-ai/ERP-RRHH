import { NextRequest, NextResponse } from 'next/server';
import { EmpleadoModel } from '@/models/EmpleadoModel';
import { generarCodigoEmpleado } from '@/lib/utils';
import { z } from 'zod';

const EmpleadoCreateSchema = z.object({
  nombres: z.string().min(2, 'Los nombres son requeridos'),
  apellidos: z.string().min(2, 'Los apellidos son requeridos'),
  email: z.string().email('Correo electrónico inválido'),
  dpi: z.string().length(13, 'El DPI debe contener exactamente 13 dígitos numéricos'),
  departamento: z.string().min(2, 'El departamento es requerido'),
  puesto: z.string().min(2, 'El puesto es requerido'),
  salario_base: z.number().min(3384.59, 'El salario base no puede ser inferior al mínimo legal de Q 3,384.59'),
  fecha_contratacion: z.string().min(10, 'Fecha de contratación requerida'),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']).default('ACTIVO'),
});

export class EmpleadoController {
  static async handleGet(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const estado = searchParams.get('estado') || undefined;
      const departamento = searchParams.get('departamento') || undefined;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const offset = (page - 1) * limit;

      const { data, total } = await EmpleadoModel.findAll({ estado, departamento, limit, offset });

      return NextResponse.json(
        {
          success: true,
          data,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('[EmpleadoController.handleGet] Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Error al obtener la lista de colaboradores',
          },
        },
        { status: 500 }
      );
    }
  }

  static async handlePost(req: NextRequest) {
    try {
      const body = await req.json();
      
      // Validación DTO con Zod
      const parseResult = EmpleadoCreateSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Los datos enviados no cumplen las reglas de negocio',
              details: parseResult.error.flatten().fieldErrors,
            },
          },
          { status: 400 }
        );
      }

      const validatedData = parseResult.data;
      const codigo = generarCodigoEmpleado();

      const newEmpleado = await EmpleadoModel.create({
        ...validatedData,
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
      console.error('[EmpleadoController.handlePost] Error:', error);
      const status = error.message.includes('23505') || error.message.includes('duplicate') ? 400 : 500;
      return NextResponse.json(
        {
          success: false,
          error: {
            code: status === 400 ? 'DUPLICATE_RESOURCE' : 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Error al registrar el colaborador',
          },
        },
        { status }
      );
    }
  }
}
