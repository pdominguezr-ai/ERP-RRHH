import { redisClient, mongoClient, neo4jClient } from '@/config/database';

/**
 * IMPLEMENTACIÓN EXPLÍCITA DE PATRONES GoF Y PATRONES ARQUITECTÓNICOS
 * 1. Strategy Pattern (Cálculo polimórfico de nómina e impuestos)
 * 2. Observer Pattern (Bus de eventos para consistencia eventual en persistencia políglota)
 * 3. Circuit Breaker Pattern (Tolerancia a fallos y prevención de cascada)
 * 4. Gateway Pattern (Integración desacoplada con sistemas externos IGSS / Bancos)
 * 5. Cache-Aside Pattern con TTL (Aceleración de lecturas sobre Redis)
 * (El patrón Repository se implementa en src/models/RecursoModel.ts y src/models/EmpleadoModel.ts)
 */

// ============================================================================
// 1. PATRÓN STRATEGY (GoF Comportamiento): Cálculo de Nómina por Régimen
// ============================================================================
export interface DesgloseSalarialDTO {
  regimen: string;
  salarioBase: number;
  bonificacionIncentivo: number;
  igssLaboral: number;
  igssPatronal: number;
  isrRetenido: number;
  salarioNeto: number;
}

export interface ICalculoNominaStrategy {
  readonly nombreRegimen: string;
  calcular(salarioBase: number): DesgloseSalarialDTO;
}

export class RegimenAsalariadoStrategy implements ICalculoNominaStrategy {
  public readonly nombreRegimen = 'ASALARIADO';
  private readonly TASA_IGSS_LABORAL = 0.0483;
  private readonly TASA_IGSS_PATRONAL = 0.1267;
  private readonly BONO_DECRETO_37_2001 = 250.0;

  calcular(salarioBase: number): DesgloseSalarialDTO {
    const igssLaboral = Number((salarioBase * this.TASA_IGSS_LABORAL).toFixed(2));
    const igssPatronal = Number((salarioBase * this.TASA_IGSS_PATRONAL).toFixed(2));
    const rentaImponibleMensual = Math.max(0, salarioBase + this.BONO_DECRETO_37_2001 - igssLaboral - 4000);
    const isrRetenido = Number((rentaImponibleMensual * 0.05).toFixed(2));
    const salarioNeto = Number(
      (salarioBase + this.BONO_DECRETO_37_2001 - igssLaboral - isrRetenido).toFixed(2)
    );

    return {
      regimen: this.nombreRegimen,
      salarioBase,
      bonificacionIncentivo: this.BONO_DECRETO_37_2001,
      igssLaboral,
      igssPatronal,
      isrRetenido,
      salarioNeto,
    };
  }
}

export class RegimenServiciosProfesionalesStrategy implements ICalculoNominaStrategy {
  public readonly nombreRegimen = 'SERVICIOS_PROFESIONALES';
  private readonly TASA_ISR_FACTURA = 0.05;

  calcular(salarioBase: number): DesgloseSalarialDTO {
    const isrRetenido = Number((salarioBase * this.TASA_ISR_FACTURA).toFixed(2));
    const salarioNeto = Number((salarioBase - isrRetenido).toFixed(2));
    return {
      regimen: this.nombreRegimen,
      salarioBase,
      bonificacionIncentivo: 0,
      igssLaboral: 0,
      igssPatronal: 0,
      isrRetenido,
      salarioNeto,
    };
  }
}

export class RegimenEjecutivoStrategy implements ICalculoNominaStrategy {
  public readonly nombreRegimen = 'EJECUTIVO';
  private readonly TASA_IGSS_LABORAL = 0.0483;
  private readonly TASA_IGSS_PATRONAL = 0.1267;
  private readonly BONO_DECRETO_37_2001 = 250.0;

  calcular(salarioBase: number): DesgloseSalarialDTO {
    const igssLaboral = Number((salarioBase * this.TASA_IGSS_LABORAL).toFixed(2));
    const igssPatronal = Number((salarioBase * this.TASA_IGSS_PATRONAL).toFixed(2));
    const isrRetenido = Number((salarioBase * 0.048).toFixed(2));
    const salarioNeto = Number(
      (salarioBase + this.BONO_DECRETO_37_2001 - igssLaboral - isrRetenido).toFixed(2)
    );
    return {
      regimen: this.nombreRegimen,
      salarioBase,
      bonificacionIncentivo: this.BONO_DECRETO_37_2001,
      igssLaboral,
      igssPatronal,
      isrRetenido,
      salarioNeto,
    };
  }
}

export class NominaCalculatorContext {
  private strategy: ICalculoNominaStrategy;

  constructor(strategy?: ICalculoNominaStrategy) {
    this.strategy = strategy || new RegimenAsalariadoStrategy();
  }

  public setStrategy(strategy: ICalculoNominaStrategy): void {
    this.strategy = strategy;
  }

  public static fromRegimen(regimen: string): NominaCalculatorContext {
    switch (regimen.toUpperCase()) {
      case 'SERVICIOS_PROFESIONALES':
        return new NominaCalculatorContext(new RegimenServiciosProfesionalesStrategy());
      case 'EJECUTIVO':
        return new NominaCalculatorContext(new RegimenEjecutivoStrategy());
      default:
        return new NominaCalculatorContext(new RegimenAsalariadoStrategy());
    }
  }

  public ejecutarCalculo(salarioBase: number): DesgloseSalarialDTO {
    return this.strategy.calcular(salarioBase);
  }
}

// ============================================================================
// 2. PATRÓN OBSERVER (GoF Comportamiento): Consistencia Eventual Políglota
// ============================================================================
export interface DomainEvent {
  type: 'RECURSO_CREADO' | 'RECURSO_ACTUALIZADO' | 'LOGIN_EXITOSO' | 'LOGIN_FALLIDO';
  aggregateId: string;
  payload: Record<string, any>;
  occurredAt: string;
}

export interface IDomainEventObserver {
  readonly observerName: string;
  update(event: DomainEvent): Promise<void>;
}

export class AuditoriaMongoObserver implements IDomainEventObserver {
  public readonly observerName = 'AuditoriaMongoObserver';

  async update(event: DomainEvent): Promise<void> {
    await mongoClient.insertAuditEvent(event.type, event.aggregateId, event.payload);
    if (event.type === 'RECURSO_CREADO') {
      await mongoClient.upsertExpediente({
        empleado_id: event.aggregateId,
        codigo: event.payload.codigo || 'REC-NEW',
        competencias: event.payload.competencias || ['Gestión Corporativa', 'Cumplimiento ISO'],
        certificaciones: event.payload.certificaciones || ['Onboarding Completado'],
        evaluacion_360_score: 90.0,
        metadata_flexible: {
          modalidad: event.payload.modalidad || 'HIBRIDO',
          registrado_via: 'API_REST_V1',
        },
      });
    }
  }
}

export class OrganigramaNeo4jObserver implements IDomainEventObserver {
  public readonly observerName = 'OrganigramaNeo4jObserver';

  async update(event: DomainEvent): Promise<void> {
    if (event.type === 'RECURSO_CREADO') {
      await neo4jClient.mergeEmpleadoNode({
        empleadoId: event.aggregateId,
        codigo: event.payload.codigo || 'REC-NEW',
        nombre: `${event.payload.nombres || ''} ${event.payload.apellidos || ''}`.trim(),
        departamentoNodo: event.payload.departamento || 'General',
        reportaAId: event.payload.jefe_inmediato_id || 'b1000000-0000-0000-0000-000000000003',
        reportaANombre: 'Sol López (Gerente de Operaciones)',
        subordinadosDirectos: [],
      });
    }
  }
}

export class CacheInvalidationObserver implements IDomainEventObserver {
  public readonly observerName = 'CacheInvalidationObserver';

  async update(event: DomainEvent): Promise<void> {
    if (event.type === 'RECURSO_CREADO' || event.type === 'RECURSO_ACTUALIZADO') {
      await redisClient.delByPrefix('cache:recursos:');
      await redisClient.delByPrefix('cache:empleados:');
    }
  }
}

export class DomainEventBus {
  private observers: IDomainEventObserver[] = [];

  constructor() {
    this.subscribe(new AuditoriaMongoObserver());
    this.subscribe(new OrganigramaNeo4jObserver());
    this.subscribe(new CacheInvalidationObserver());
  }

  public subscribe(observer: IDomainEventObserver): void {
    this.observers.push(observer);
  }

  public async publish(event: DomainEvent): Promise<void> {
    await Promise.all(this.observers.map((obs) => obs.update(event)));
  }

  public getSubscribedNames(): string[] {
    return this.observers.map((o) => o.observerName);
  }
}

export const domainEventBus = new DomainEventBus();

// ============================================================================
// 3. PATRÓN CIRCUIT BREAKER (Resiliencia / Estabilidad)
// ============================================================================
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(failureThreshold = 3, resetTimeoutMs = 15000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }

  public getState(): CircuitState {
    if (this.state === 'OPEN' && Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
      this.state = 'HALF_OPEN';
    }
    return this.state;
  }

  public async execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      if (fallback) {
        return fallback();
      }
      throw new Error('CircuitBreaker is OPEN: Servicio temporalmente aislado para evitar fallo en cascada');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      if (fallback) {
        return fallback();
      }
      throw err;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// ============================================================================
// 4. PATRÓN GATEWAY (Integración con Sistemas Externos)
// ============================================================================
export interface IExternalErpGateway {
  reportarPlanillaIGSS(planillaId: string, montoTotal: number): Promise<{ acuseRecibo: string; timestamp: string }>;
  dispersarPagoACH(cuentaDestino: string, monto: number): Promise<{ transaccionId: string; estado: string }>;
}

export class ExternalErpGateway implements IExternalErpGateway {
  async reportarPlanillaIGSS(planillaId: string, montoTotal: number) {
    return {
      acuseRecibo: `IGSS-GT-${planillaId.slice(0, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
    };
  }

  async dispersarPagoACH(cuentaDestino: string, monto: number) {
    return {
      transaccionId: `ACH-${Date.now()}`,
      estado: monto > 0 && cuentaDestino ? 'PROCESADO_EXITOSAMENTE' : 'RECHAZADO',
    };
  }
}

export const externalErpGateway = new ExternalErpGateway();

// ============================================================================
// 5. PATRÓN CACHE-ASIDE CON TTL (Redis In-Memory)
// ============================================================================
export interface CacheAsideResult<T> {
  data: T;
  cacheStatus: 'HIT' | 'MISS';
  ttlRemainingSeconds: number;
  cacheKey: string;
}

export class CacheAsideService {
  private readonly defaultTtlSeconds: number;

  constructor(defaultTtlSeconds = 300) {
    this.defaultTtlSeconds = defaultTtlSeconds;
  }

  public async getOrSet<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    ttlSeconds = this.defaultTtlSeconds
  ): Promise<CacheAsideResult<T>> {
    const cachedRaw = await redisClient.get(cacheKey);
    if (cachedRaw !== null) {
      const ttl = await redisClient.ttl(cacheKey);
      return {
        data: JSON.parse(cachedRaw) as T,
        cacheStatus: 'HIT',
        ttlRemainingSeconds: ttl > 0 ? ttl : ttlSeconds,
        cacheKey,
      };
    }

    const freshData = await fetcher();
    await redisClient.setex(cacheKey, ttlSeconds, JSON.stringify(freshData));

    return {
      data: freshData,
      cacheStatus: 'MISS',
      ttlRemainingSeconds: ttlSeconds,
      cacheKey,
    };
  }

  public async invalidateByPrefix(prefix: string): Promise<number> {
    return redisClient.delByPrefix(prefix);
  }
}

export const cacheAsideService = new CacheAsideService(300);
