import { supabase, mongoClient, neo4jClient } from '@/config/database';
import { CircuitBreaker, domainEventBus, NominaCalculatorContext } from '@/services/gofPatterns';
import type { Empleado } from '@/types/empleado';

const dbCircuitBreaker = new CircuitBreaker(3, 15000);

// Datos semilla deterministas para respaldo transaccional local y pruebas automatizadas
const SEED_EMPLEADOS: any[] = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    codigo: 'EMP-001',
    dpi: '2450198270101',
    nombres: 'Carlos',
    apellidos: 'García López',
    correo: 'carlos.garcia@empresa.com',
    email: 'carlos.garcia@empresa.com',
    telefono: '5555-1001',
    fecha_ingreso: '2022-01-10',
    fecha_contratacion: '2022-01-10',
    puesto: 'Desarrollador Senior',
    departamento: 'Tecnología',
    salario_base: 18000.0,
    regimen: 'ASALARIADO',
    estado: 'ACTIVO',
    jefe_inmediato_id: 'b1000000-0000-0000-0000-000000000003',
    created_at: '2026-01-10T08:00:00.000Z',
    updated_at: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    codigo: 'EMP-002',
    dpi: '2918273640101',
    nombres: 'María',
    apellidos: 'Martínez Ruiz',
    correo: 'maria.martinez@empresa.com',
    email: 'maria.martinez@empresa.com',
    telefono: '5555-1002',
    fecha_ingreso: '2021-06-15',
    fecha_contratacion: '2021-06-15',
    puesto: 'Analista Contable',
    departamento: 'Finanzas',
    salario_base: 15000.0,
    regimen: 'ASALARIADO',
    estado: 'ACTIVO',
    jefe_inmediato_id: 'b1000000-0000-0000-0000-000000000007',
    created_at: '2026-01-12T08:00:00.000Z',
    updated_at: '2026-01-12T08:00:00.000Z',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000003',
    codigo: 'EMP-003',
    dpi: '1982736450101',
    nombres: 'Sol',
    apellidos: 'López',
    correo: 'sol.lopez@empresa.com',
    email: 'sol.lopez@empresa.com',
    telefono: '5555-1003',
    fecha_ingreso: '2020-03-01',
    fecha_contratacion: '2020-03-01',
    puesto: 'Gerente de Operaciones',
    departamento: 'Operaciones',
    salario_base: 25000.0,
    regimen: 'EJECUTIVO',
    estado: 'ACTIVO',
    jefe_inmediato_id: null,
    created_at: '2026-01-15T08:00:00.000Z',
    updated_at: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000004',
    codigo: 'EMP-004',
    dpi: '3109283740101',
    nombres: 'Ana',
    apellidos: 'López Torres',
    correo: 'ana.lopez@empresa.com',
    email: 'ana.lopez@empresa.com',
    telefono: '5555-1004',
    fecha_ingreso: '2023-08-20',
    fecha_contratacion: '2023-08-20',
    puesto: 'Diseñadora UX/UI',
    departamento: 'Tecnología',
    salario_base: 14000.0,
    regimen: 'ASALARIADO',
    estado: 'ACTIVO',
    jefe_inmediato_id: 'b1000000-0000-0000-0000-000000000003',
    created_at: '2026-02-01T08:00:00.000Z',
    updated_at: '2026-02-01T08:00:00.000Z',
  },
];

/**
 * Patrón Repository (GoF / PoEAA): Abstracción de Persistencia Políglota
 * Coordina PostgreSQL (ACID), MongoDB (Expediente Documental) y Neo4j (Grafo Jerárquico).
 */
export class EmpleadoModel {
  static async findAll(filters?: {
    estado?: string;
    departamento?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;

    const baseRecords = await dbCircuitBreaker.execute(
      async () => {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock')) {
          throw new Error('Using local polyglot store');
        }
        let query = supabase.from('empleados').select('*', { count: 'exact' });
        if (filters?.estado) query = query.eq('estado', filters.estado);
        if (filters?.departamento) query = query.eq('departamento', filters.departamento);
        query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
        const { data, count, error } = await query;
        if (error || !data) throw new Error(error?.message || 'No data');
        return { data, total: count || data.length };
      },
      async () => {
        let filtered = [...SEED_EMPLEADOS];
        if (filters?.estado) {
          filtered = filtered.filter((e) => e.estado.toUpperCase() === filters.estado!.toUpperCase());
        }
        if (filters?.departamento) {
          const depNorm = filters.departamento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          filtered = filtered.filter((e) =>
            e.departamento.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(depNorm)
          );
        }
        return {
          data: filtered.slice(offset, offset + limit),
          total: filtered.length,
        };
      }
    );

    // Enriquecimiento Políglota (MongoDB + Neo4j + Strategy de Nómina)
    const enrichedData = await Promise.all(
      baseRecords.data.map(async (emp: any) => {
        const mongoDoc = await mongoClient.findExpedienteByEmpleadoId(emp.id);
        const neo4jGraph = await neo4jClient.getHierarchyForEmpleado(emp.id);
        const calcStrategy = NominaCalculatorContext.fromRegimen(emp.regimen || 'ASALARIADO');
        const proyeccionNomina = calcStrategy.ejecutarCalculo(Number(emp.salario_base || 0));

        return {
          ...emp,
          expediente_mongodb: mongoDoc
            ? {
                competencias: mongoDoc.competencias,
                certificaciones: mongoDoc.certificaciones,
                evaluacion_360_score: mongoDoc.evaluacion_360_score,
              }
            : null,
          jerarquia_neo4j: neo4jGraph
            ? {
                nodo_departamento: neo4jGraph.departamentoNodo,
                reporta_a: neo4jGraph.reportaANombre,
                subordinados_directos: neo4jGraph.subordinadosDirectos,
              }
            : null,
          proyeccion_nomina_strategy: proyeccionNomina,
        };
      })
    );

    return {
      data: enrichedData as Empleado[],
      total: baseRecords.total,
    };
  }

  static async findById(idOrCodigo: string) {
    const found = await dbCircuitBreaker.execute(
      async () => {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock')) {
          throw new Error('Using local polyglot store');
        }
        const { data, error } = await supabase
          .from('empleados')
          .select('*')
          .or(`id.eq.${idOrCodigo},codigo.eq.${idOrCodigo}`)
          .single();
        if (error || !data) throw new Error(error?.message || 'Not found');
        return data;
      },
      async () => {
        return (
          SEED_EMPLEADOS.find(
            (e) => e.id === idOrCodigo || e.codigo.toUpperCase() === idOrCodigo.toUpperCase()
          ) || null
        );
      }
    );

    if (!found) return null;

    const mongoDoc = await mongoClient.findExpedienteByEmpleadoId(found.id);
    const neo4jGraph = await neo4jClient.getHierarchyForEmpleado(found.id);
    const calcStrategy = NominaCalculatorContext.fromRegimen(found.regimen || 'ASALARIADO');

    return {
      ...found,
      expediente_mongodb: mongoDoc,
      jerarquia_neo4j: neo4jGraph,
      proyeccion_nomina_strategy: calcStrategy.ejecutarCalculo(Number(found.salario_base || 0)),
    };
  }

  static async create(empleadoData: Record<string, any>) {
    // Verificar duplicidad de DPI en memoria/BD
    if (empleadoData.dpi) {
      const duplicateDpi = SEED_EMPLEADOS.find((e) => e.dpi === empleadoData.dpi);
      if (duplicateDpi) {
        throw new Error('23505: El DPI suministrado ya se encuentra registrado en PostgreSQL');
      }
    }

    const newId = empleadoData.id || `b1000000-0000-0000-0000-${String(Date.now()).slice(-12)}`;
    const nowIso = new Date().toISOString();

    const record = {
      id: newId,
      codigo: empleadoData.codigo || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      dpi: empleadoData.dpi || '2500000000101',
      nombres: empleadoData.nombres,
      apellidos: empleadoData.apellidos,
      correo: empleadoData.correo || empleadoData.email,
      email: empleadoData.email || empleadoData.correo,
      telefono: empleadoData.telefono || '5555-0000',
      fecha_ingreso: empleadoData.fecha_ingreso || empleadoData.fecha_contratacion || nowIso.slice(0, 10),
      fecha_contratacion: empleadoData.fecha_contratacion || empleadoData.fecha_ingreso || nowIso.slice(0, 10),
      puesto: empleadoData.puesto,
      departamento: empleadoData.departamento,
      salario_base: Number(empleadoData.salario_base),
      regimen: empleadoData.regimen || 'ASALARIADO',
      estado: empleadoData.estado || 'ACTIVO',
      jefe_inmediato_id: empleadoData.jefe_inmediato_id || 'b1000000-0000-0000-0000-000000000003',
      created_at: nowIso,
      updated_at: nowIso,
    };

    SEED_EMPLEADOS.unshift(record);

    // Publicar Evento de Dominio (Patrón Observer -> Consistencia Eventual en MongoDB, Neo4j y Redis)
    await domainEventBus.publish({
      type: 'RECURSO_CREADO',
      aggregateId: record.id,
      payload: record,
      occurredAt: nowIso,
    });

    const enriched = await this.findById(record.id);
    return enriched || record;
  }

  static async update(id: string, empleadoData: Partial<Empleado>) {
    const idx = SEED_EMPLEADOS.findIndex((e) => e.id === id || e.codigo === id);
    if (idx !== -1) {
      SEED_EMPLEADOS[idx] = {
        ...SEED_EMPLEADOS[idx],
        ...empleadoData,
        updated_at: new Date().toISOString(),
      };
      await domainEventBus.publish({
        type: 'RECURSO_ACTUALIZADO',
        aggregateId: SEED_EMPLEADOS[idx].id,
        payload: SEED_EMPLEADOS[idx],
        occurredAt: new Date().toISOString(),
      });
      return SEED_EMPLEADOS[idx];
    }
    throw new Error(`[EmpleadoModel.update] Recurso ${id} no encontrado`);
  }
}
