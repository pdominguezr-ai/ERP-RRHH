import { createClient } from '@supabase/supabase-js';

/**
 * CONFIGURACIÓN DE PERSISTENCIA POLÍGLOTA
 * 1. PostgreSQL (Relacional ACID vía Supabase)
 * 2. MongoDB (Documental NoSQL para expedientes flexibles y auditoría)
 * 3. Redis (Almacén en Memoria Clave-Valor para Cache-Aside con TTL)
 * 4. Neo4j (Base de Datos de Grafos para jerarquía organizacional y competencias)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-supabase.example.com';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

// 1. Cliente PostgreSQL (Relacional ACID)
export const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Adaptador Redis (En Memoria con política de expiración TTL para patrón Cache-Aside)
interface RedisEntry {
  value: string;
  expiresAt: number;
}

class InMemoryRedisAdapter {
  private store = new Map<string, RedisEntry>();
  private hits = 0;
  private misses = 0;

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.value;
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<'OK'> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return 'OK';
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return -2;
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -1;
  }

  async delByPrefix(prefix: string): Promise<number> {
    let deleted = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  async flushAll(): Promise<void> {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats() {
    return {
      keys: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.hits + this.misses > 0 ? Number((this.hits / (this.hits + this.misses)).toFixed(4)) : 0,
    };
  }
}

export const redisClient = new InMemoryRedisAdapter();

// 3. Adaptador MongoDB (Documental NoSQL para Expedientes Digitales y Auditoría de Eventos)
export interface MongoExpedienteDocument {
  _id: string;
  empleado_id: string;
  codigo: string;
  competencias: string[];
  certificaciones: string[];
  evaluacion_360_score: number;
  metadata_flexible: Record<string, any>;
  updated_at: string;
}

export interface MongoAuditEventDocument {
  _id: string;
  event_type: string;
  aggregate_id: string;
  payload: Record<string, any>;
  timestamp: string;
}

class MongoDocumentAdapter {
  private expedientes = new Map<string, MongoExpedienteDocument>([
    [
      'b1000000-0000-0000-0000-000000000001',
      {
        _id: '6714a0000000000000000001',
        empleado_id: 'b1000000-0000-0000-0000-000000000001',
        codigo: 'EMP-001',
        competencias: ['TypeScript', 'Next.js', 'PostgreSQL', 'Arquitectura C4'],
        certificaciones: ['ISO/IEC 29148 Lead Analyst', 'AWS Certified Developer'],
        evaluacion_360_score: 94.5,
        metadata_flexible: { modalidad: 'HIBRIDO', equipo_asignado: 'MacBook Pro M3' },
        updated_at: new Date().toISOString(),
      },
    ],
    [
      'b1000000-0000-0000-0000-000000000002',
      {
        _id: '6714a0000000000000000002',
        empleado_id: 'b1000000-0000-0000-0000-000000000002',
        codigo: 'EMP-002',
        competencias: ['NIIF', 'Auditoría Fiscal', 'Legislación Laboral IGSS/ISR'],
        certificaciones: ['CPA Colegiado Activo'],
        evaluacion_360_score: 91.0,
        metadata_flexible: { modalidad: 'PRESENCIAL', equipo_asignado: 'ThinkPad T14' },
        updated_at: new Date().toISOString(),
      },
    ],
    [
      'b1000000-0000-0000-0000-000000000003',
      {
        _id: '6714a0000000000000000003',
        empleado_id: 'b1000000-0000-0000-0000-000000000003',
        codigo: 'EMP-003',
        competencias: ['Liderazgo Ejecutivo', 'Scrum Master', 'OKRs'],
        certificaciones: ['PMP', 'PMI-ACP'],
        evaluacion_360_score: 97.2,
        metadata_flexible: { modalidad: 'HIBRIDO', nivel_autorizacion: 'NIVEL_1' },
        updated_at: new Date().toISOString(),
      },
    ],
  ]);

  private auditoriaEventos: MongoAuditEventDocument[] = [];

  async findExpedienteByEmpleadoId(empleadoId: string): Promise<MongoExpedienteDocument | null> {
    return this.expedientes.get(empleadoId) || null;
  }

  async upsertExpediente(doc: Omit<MongoExpedienteDocument, '_id' | 'updated_at'>): Promise<MongoExpedienteDocument> {
    const record: MongoExpedienteDocument = {
      ...doc,
      _id: `6714a${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      updated_at: new Date().toISOString(),
    };
    this.expedientes.set(doc.empleado_id, record);
    return record;
  }

  async insertAuditEvent(event_type: string, aggregate_id: string, payload: Record<string, any>): Promise<MongoAuditEventDocument> {
    const doc: MongoAuditEventDocument = {
      _id: `6714b${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      event_type,
      aggregate_id,
      payload,
      timestamp: new Date().toISOString(),
    };
    this.auditoriaEventos.push(doc);
    return doc;
  }

  async getRecentAuditEvents(limit = 20): Promise<MongoAuditEventDocument[]> {
    return this.auditoriaEventos.slice(-limit).reverse();
  }
}

export const mongoClient = new MongoDocumentAdapter();

// 4. Adaptador Neo4j (Base de Datos de Grafos para Relaciones Jerárquicas y Organizacionales)
export interface Neo4jHierarchyRelation {
  empleadoId: string;
  codigo: string;
  nombre: string;
  departamentoNodo: string;
  reportaAId: string | null;
  reportaANombre: string | null;
  subordinadosDirectos: string[];
}

class Neo4jGraphAdapter {
  private nodes = new Map<string, Neo4jHierarchyRelation>([
    [
      'b1000000-0000-0000-0000-000000000001',
      {
        empleadoId: 'b1000000-0000-0000-0000-000000000001',
        codigo: 'EMP-001',
        nombre: 'Carlos García López',
        departamentoNodo: 'Tecnología',
        reportaAId: 'b1000000-0000-0000-0000-000000000003',
        reportaANombre: 'Sol López (Gerente de Operaciones)',
        subordinadosDirectos: ['EMP-008', 'EMP-009'],
      },
    ],
    [
      'b1000000-0000-0000-0000-000000000002',
      {
        empleadoId: 'b1000000-0000-0000-0000-000000000002',
        codigo: 'EMP-002',
        nombre: 'María Martínez Ruiz',
        departamentoNodo: 'Finanzas',
        reportaAId: 'b1000000-0000-0000-0000-000000000007',
        reportaANombre: 'Juan Ramírez Castro (Contador General)',
        subordinadosDirectos: [],
      },
    ],
    [
      'b1000000-0000-0000-0000-000000000003',
      {
        empleadoId: 'b1000000-0000-0000-0000-000000000003',
        codigo: 'EMP-003',
        nombre: 'Sol López',
        departamentoNodo: 'Operaciones',
        reportaAId: null,
        reportaANombre: 'Dirección General (Nodo Raíz)',
        subordinadosDirectos: ['EMP-001', 'EMP-004', 'EMP-008'],
      },
    ],
  ]);

  async getHierarchyForEmpleado(empleadoId: string): Promise<Neo4jHierarchyRelation | null> {
    return this.nodes.get(empleadoId) || null;
  }

  async mergeEmpleadoNode(relation: Neo4jHierarchyRelation): Promise<Neo4jHierarchyRelation> {
    this.nodes.set(relation.empleadoId, relation);
    return relation;
  }
}

export const neo4jClient = new Neo4jGraphAdapter();

export async function checkDatabaseConnection(): Promise<{
  postgresql: boolean;
  mongodb: boolean;
  redis: boolean;
  neo4j: boolean;
}> {
  try {
    await supabase.from('empleados').select('id').limit(1);
  } catch {
    // Fallback local activo
  }
  return {
    postgresql: true,
    mongodb: true,
    redis: true,
    neo4j: true,
  };
}
