import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RecursoModel } from '@/models/RecursoModel';
import { cacheAsideService } from '@/services/gofPatterns';
import { createProblemDetailsResponse } from '@/middlewares/problemDetails';
import { generarCodigoEmpleado } from '@/lib/utils';

const RecursoCreateSchema = z.object({
  nombres: z.string().min(2, 'Los nombres del recurso/colaborador son obligatorios'),
  apellidos: z.string().min(2, 'Los apellidos son obligatorios').default('Corporativo'),
  email: z.string().email('El correo electrónico debe ser válido').optional(),
  correo: z.string().email('El correo electrónico debe ser válido').optional(),
  dpi: z.string().length(13, 'El DPI debe contener exactamente 13 dígitos numéricos'),
  departamento: z.string().min(2, 'El departamento funcional es requerido'),
  puesto: z.string().min(2, 'El puesto o rol del recurso es requerido').default('Especialista RRHH'),
  salario_base: z
    .number()
    .min(3384.59, 'El salario base no puede ser inferior al mínimo legal vigente de Q 3,384.59'),
  fecha_contratacion: z.string().optional(),
  fecha_ingreso: z.string().optional(),
  regimen: z.enum(['ASALARIADO', 'SERVICIOS_PROFESIONALES', 'EJECUTIVO']).default('ASALARIADO'),
  competencias: z.array(z.string()).optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']).default('ACTIVO'),
});

export class RecursoController {
  /**
   * GET /api/v1/recursos
   * Consulta de catálogo aplicando Patrón Cache-Aside sobre Redis (TTL = 300s)
   * y enriquecimiento desde PostgreSQL + MongoDB + Neo4j.
   */
  static async handleGetCatalogo(req: NextRequest) {
    const instance = '/api/v1/recursos';
    try {
      const { searchParams } = new URL(req.url);
      const estado = searchParams.get('estado') || undefined;
      const departamento = searchParams.get('departamento') || undefined;
      const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
      const offset = (page - 1) * limit;

      const cacheKey = `cache:recursos:list:dept=${departamento || 'ALL'}:estado=${estado || 'ALL'}:p=${page}:l=${limit}`;

      const cacheResult = await cacheAsideService.getOrSet(
        cacheKey,
        async () => {
          return RecursoModel.findAll({ estado, departamento, limit, offset });
        },
        300 // TTL = 300 segundos (5 minutos)
      );

      return NextResponse.json(
        {
          success: true,
          data: cacheResult.data.data,
          pagination: {
            total: cacheResult.data.total,
            page,
            limit,
            totalPages: Math.ceil(cacheResult.data.total / limit) || 1,
          },
          cache_metadata: {
            pattern: 'Cache-Aside',
            engine: 'Redis 7.x + MongoDB + PostgreSQL',
            status: cacheResult.cacheStatus,
            ttl_seconds: cacheResult.ttlRemainingSeconds,
            key: cacheResult.cacheKey,
          },
        },
        {
          status: 200,
          headers: {
            'X-Cache': cacheResult.cacheStatus,
            'X-Cache-TTL': String(cacheResult.ttlRemainingSeconds),
          },
        }
      );
    } catch (error: any) {
      return createProblemDetailsResponse({
        type: 'https://erp-rrhh.umg.edu.gt/probs/catalog-query-error',
        title: 'Error al Consultar el Catálogo de Recursos',
        status: 500,
        detail: error.message || 'Error interno al consultar los motores de persistencia.',
        instance,
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  }

  /**
   * POST /api/v1/recursos
   * Registro transaccional en PostgreSQL + propagación asíncrona a Neo4j y MongoDB
   * + invalidación automática de caché en Redis.
   */
  static async handleCreateRecurso(req: NextRequest) {
    const instance = '/api/v1/recursos';
    try {
      const body = await req.json();
      const parseResult = RecursoCreateSchema.safeParse(body);

      if (!parseResult.success) {
        return createProblemDetailsResponse({
          type: 'https://erp-rrhh.umg.edu.gt/probs/validation-error',
          title: 'Violación de Reglas de Validación de Negocio (RFC 9457)',
          status: 400,
          detail: 'Uno o más campos del recurso no cumplen las restricciones del contrato OpenAPI 3.0.3.',
          instance,
          code: 'VALIDATION_ERROR',
          errors: parseResult.error.flatten().fieldErrors,
        });
      }

      const validatedData = parseResult.data;
      const codigo = body.codigo || generarCodigoEmpleado();
      const emailFinal =
        validatedData.email ||
        validatedData.correo ||
        `${validatedData.nombres.toLowerCase().replace(/\s+/g, '.')}@empresa.com`;

      const created = await RecursoModel.create({
        ...validatedData,
        email: emailFinal,
        correo: emailFinal,
        codigo,
      });

      return NextResponse.json(
        {
          success: true,
          code: 'CREATED',
          message: 'Recurso registrado exitosamente en PostgreSQL, Neo4j y MongoDB',
          data: created,
          polyglot_sync: {
            postgresql: 'COMMITTED_ACID',
            neo4j_graph: 'NODE_AND_RELATIONS_MERGED',
            mongodb_audit: 'DOCUMENT_INSERTED',
            redis_cache: 'INVALIDATED_LIST_KEYS',
          },
        },
        {
          status: 201,
          headers: {
            Location: `/api/v1/recursos/${created.id}`,
          },
        }
      );
    } catch (error: any) {
      const isDuplicate = error.message?.includes('23505') || error.message?.includes('duplicate');
      return createProblemDetailsResponse({
        type: isDuplicate
          ? 'https://erp-rrhh.umg.edu.gt/probs/duplicate-resource'
          : 'https://erp-rrhh.umg.edu.gt/probs/internal-server-error',
        title: isDuplicate ? 'Conflicto de Identidad Única (DPI o Código Duplicado)' : 'Error Interno del Servidor',
        status: isDuplicate ? 400 : 500,
        detail: error.message || 'Error al registrar el recurso en la capa de persistencia.',
        instance,
        code: isDuplicate ? 'DUPLICATE_RESOURCE' : 'INTERNAL_SERVER_ERROR',
      });
    }
  }

  /**
   * GET /api/v1/recursos/:id
   * Consulta de detalle por ID (UUID o código EMP-XXX) con caché Redis (TTL = 600s).
   */
  static async handleGetRecursoById(req: NextRequest, id: string) {
    const instance = `/api/v1/recursos/${id}`;
    try {
      const cacheKey = `cache:recursos:id:${id}`;
      let cacheStatus: 'HIT' | 'MISS' = 'MISS';
      let ttlRemaining = 600;

      const recurso = await cacheAsideService.getOrSet(
        cacheKey,
        async () => {
          return RecursoModel.findById(id);
        },
        600
      );

      cacheStatus = recurso.cacheStatus;
      ttlRemaining = recurso.ttlRemainingSeconds;

      if (!recurso.data) {
        return createProblemDetailsResponse({
          type: 'https://erp-rrhh.umg.edu.gt/probs/resource-not-found',
          title: 'Recurso o Colaborador No Encontrado',
          status: 404,
          detail: `No existe ningún recurso registrado con el identificador '${id}' en PostgreSQL.`,
          instance,
          code: 'RESOURCE_NOT_FOUND',
        });
      }

      return NextResponse.json(
        {
          success: true,
          data: recurso.data,
          cache_metadata: {
            pattern: 'Cache-Aside',
            status: cacheStatus,
            ttl_seconds: ttlRemaining,
            key: cacheKey,
          },
        },
        {
          status: 200,
          headers: {
            'X-Cache': cacheStatus,
            'X-Cache-TTL': String(ttlRemaining),
          },
        }
      );
    } catch (error: any) {
      return createProblemDetailsResponse({
        type: 'https://erp-rrhh.umg.edu.gt/probs/internal-server-error',
        title: 'Error al Consultar Detalle del Recurso',
        status: 500,
        detail: error.message || 'Error inesperado al recuperar el recurso por ID.',
        instance,
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  }
}
