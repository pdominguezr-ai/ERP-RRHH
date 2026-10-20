import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NominaCalculatorContext,
  RegimenAsalariadoStrategy,
  RegimenServiciosProfesionalesStrategy,
  RegimenEjecutivoStrategy,
  CircuitBreaker,
  CacheAsideService,
  externalErpGateway,
  domainEventBus,
} from '../../src/services/gofPatterns';
import { redisClient, mongoClient, neo4jClient } from '../../src/config/database';
import { buildProblemDetailsObject } from '../../src/middlewares/problemDetails';

test('Suite Unitaria 1: Patrón Strategy (Cálculo de Nómina por Régimen Laboral)', async (t) => {
  await t.test('CP-U01: Calcula IGSS (4.83%), Bono Q250 e ISR para Régimen Asalariado', () => {
    const calculator = new NominaCalculatorContext(new RegimenAsalariadoStrategy());
    const result = calculator.ejecutarCalculo(10000);
    assert.equal(result.regimen, 'ASALARIADO');
    assert.equal(result.igssLaboral, 483.0);
    assert.equal(result.bonificacionIncentivo, 250.0);
    assert.equal(result.salarioNeto, 9478.65);
  });

  await t.test('CP-U02: Calcula retención ISR 5% sin IGSS para Servicios Profesionales', () => {
    const calculator = new NominaCalculatorContext(new RegimenServiciosProfesionalesStrategy());
    const result = calculator.ejecutarCalculo(10000);
    assert.equal(result.regimen, 'SERVICIOS_PROFESIONALES');
    assert.equal(result.igssLaboral, 0);
    assert.equal(result.isrRetenido, 500.0);
    assert.equal(result.salarioNeto, 9500.0);
  });

  await t.test('CP-U03: Calcula desglose para Régimen Ejecutivo', () => {
    const calculator = NominaCalculatorContext.fromRegimen('EJECUTIVO');
    const result = calculator.ejecutarCalculo(25000);
    assert.equal(result.regimen, 'EJECUTIVO');
    assert.equal(result.igssLaboral, 1207.5);
    assert.equal(result.salarioNeto, 22842.5);
  });
});

test('Suite Unitaria 2: Patrón Cache-Aside con Expiración TTL sobre Redis', async (t) => {
  await redisClient.flushAll();
  const cacheService = new CacheAsideService(300);

  await t.test('CP-U04: Primera lectura produce Cache MISS y segunda lectura produce Cache HIT', async () => {
    let dbCalls = 0;
    const fetcher = async () => {
      dbCalls++;
      return { items: ['EMP-001', 'EMP-002'] };
    };

    const firstCall = await cacheService.getOrSet('cache:test:key1', fetcher, 300);
    assert.equal(firstCall.cacheStatus, 'MISS');
    assert.equal(dbCalls, 1);

    const secondCall = await cacheService.getOrSet('cache:test:key1', fetcher, 300);
    assert.equal(secondCall.cacheStatus, 'HIT');
    assert.equal(dbCalls, 1); // No volvió a consultar la base de datos
    assert.deepEqual(secondCall.data, { items: ['EMP-001', 'EMP-002'] });
  });
});

test('Suite Unitaria 3: Patrón Circuit Breaker (Tolerancia a Fallos)', async (t) => {
  await t.test('CP-U05: Abre el circuito tras superar el umbral de fallos y ejecuta Fallback', async () => {
    const breaker = new CircuitBreaker(2, 10000);
    assert.equal(breaker.getState(), 'CLOSED');

    await assert.rejects(async () => {
      await breaker.execute(async () => {
        throw new Error('DB Timeout 1');
      });
    });
    assert.equal(breaker.getState(), 'CLOSED');

    await assert.rejects(async () => {
      await breaker.execute(async () => {
        throw new Error('DB Timeout 2');
      });
    });
    assert.equal(breaker.getState(), 'OPEN');

    const fallbackValue = await breaker.execute(
      async () => 'primary',
      async () => 'fallback-safe-response'
    );
    assert.equal(fallbackValue, 'fallback-safe-response');
  });
});

test('Suite Unitaria 4: Patrones Observer, Gateway y Estándar RFC 9457', async (t) => {
  await t.test('CP-U06: DomainEventBus propaga evento a MongoDB y Neo4j (Consistencia Eventual)', async () => {
    await domainEventBus.publish({
      type: 'RECURSO_CREADO',
      aggregateId: 'emp-unit-test-99',
      payload: {
        codigo: 'EMP-099',
        nombres: 'Prueba',
        apellidos: 'Observer',
        departamento: 'Tecnología',
      },
      occurredAt: new Date().toISOString(),
    });

    const mongoDoc = await mongoClient.findExpedienteByEmpleadoId('emp-unit-test-99');
    const neoNode = await neo4jClient.getHierarchyForEmpleado('emp-unit-test-99');
    assert.ok(mongoDoc);
    assert.ok(neoNode);
    assert.equal(neoNode?.departamentoNodo, 'Tecnología');
  });

  await t.test('CP-U07: ExternalErpGateway genera acuse IGSS y transacción ACH', async () => {
    const igss = await externalErpGateway.reportarPlanillaIGSS('nomina-2026-10', 135000);
    assert.ok(igss.acuseRecibo.startsWith('IGSS-GT-'));
    const ach = await externalErpGateway.dispersarPagoACH('GT98010203000456', 18000);
    assert.equal(ach.estado, 'PROCESADO_EXITOSAMENTE');
  });

  await t.test('CP-U08: ProblemDetails construye estructura conforme a RFC 9457', () => {
    const prob = buildProblemDetailsObject({
      title: 'Datos Inválidos',
      status: 400,
      detail: 'El DPI debe tener 13 dígitos',
      instance: '/api/v1/recursos',
      code: 'VALIDATION_ERROR',
    });
    assert.equal(prob.status, 400);
    assert.equal(prob.instance, '/api/v1/recursos');
    assert.ok(prob.type.includes('https://erp-rrhh.umg.edu.gt/probs/'));
  });
});
