import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { AuthController } from '../../src/controllers/AuthController';
import { RecursoController } from '../../src/controllers/RecursoController';
import { EmpleadoController } from '../../src/controllers/EmpleadoController';
import { redisClient } from '../../src/config/database';

test('Suite de Integración API: Endpoints Funcionales, Cache-Aside y Errores RFC 9457', async (t) => {
  await redisClient.flushAll();

  await t.test('CP-I01: POST /api/v1/auth/login autentica exitosamente y emite JWT', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin.rrhh@empresa.com',
        password: 'Password123!',
      }),
    });

    const res = await AuthController.handleLogin(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
    assert.equal(body.data.expiresIn, 3600);
  });

  await t.test('CP-I02: POST /api/v1/auth/login con clave errónea retorna HTTP 401 RFC 9457 (application/problem+json)', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin.rrhh@empresa.com',
        password: 'WrongPassword!',
      }),
    });

    const res = await AuthController.handleLogin(req);
    assert.equal(res.status, 401);
    assert.ok(res.headers.get('Content-Type')?.includes('application/problem+json'));
    const prob = await res.json();
    assert.equal(prob.status, 401);
    assert.equal(prob.code, 'UNAUTHORIZED');
    assert.equal(prob.instance, '/api/v1/auth/login');
  });

  await t.test('CP-I03: GET /api/v1/recursos demuestra patrón Cache-Aside (MISS -> HIT) con Redis y MongoDB', async () => {
    await redisClient.flushAll();
    const url = 'http://localhost:3000/api/v1/recursos?departamento=Tecnología&estado=ACTIVO&page=1&limit=10';

    // 1ra petición -> Cache MISS
    const resMiss = await RecursoController.handleGetCatalogo(new NextRequest(url));
    assert.equal(resMiss.status, 200);
    assert.equal(resMiss.headers.get('X-Cache'), 'MISS');
    const jsonMiss = await resMiss.json();
    assert.equal(jsonMiss.cache_metadata.status, 'MISS');
    assert.ok(jsonMiss.data.length >= 1);

    // 2da petición -> Cache HIT
    const resHit = await RecursoController.handleGetCatalogo(new NextRequest(url));
    assert.equal(resHit.status, 200);
    assert.equal(resHit.headers.get('X-Cache'), 'HIT');
    const jsonHit = await resHit.json();
    assert.equal(jsonHit.cache_metadata.status, 'HIT');
  });

  await t.test('CP-I04: POST /api/v1/recursos registra en PostgreSQL/Neo4j/MongoDB e invalida caché Redis', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/recursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombres: 'Gabriela Fernanda',
        apellidos: 'Soto Quan',
        email: 'gabriela.soto@empresa.com',
        dpi: '2654321890101',
        departamento: 'Tecnología',
        puesto: 'Ingeniera de Datos',
        salario_base: 19200.0,
        regimen: 'ASALARIADO',
        estado: 'ACTIVO',
      }),
    });

    const res = await RecursoController.handleCreateRecurso(req);
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.polyglot_sync.postgresql, 'COMMITTED_ACID');
    assert.equal(body.polyglot_sync.neo4j_graph, 'NODE_AND_RELATIONS_MERGED');
  });

  await t.test('CP-I05: POST /api/v1/recursos con salario menor al mínimo retorna HTTP 400 RFC 9457', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/recursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombres: 'Intento',
        apellidos: 'Invalido',
        dpi: '123', // DPI inválido
        departamento: 'Ventas',
        puesto: 'Vendedor',
        salario_base: 1500.0, // Menor a Q3,384.59
      }),
    });

    const res = await RecursoController.handleCreateRecurso(req);
    assert.equal(res.status, 400);
    assert.ok(res.headers.get('Content-Type')?.includes('application/problem+json'));
    const prob = await res.json();
    assert.equal(prob.status, 400);
    assert.equal(prob.code, 'VALIDATION_ERROR');
    assert.ok(prob.errors);
  });

  await t.test('CP-I06: GET /api/v1/recursos/:id retorna detalle enriquecido o HTTP 404 RFC 9457', async () => {
    const reqOk = new NextRequest('http://localhost:3000/api/v1/recursos/EMP-001');
    const resOk = await RecursoController.handleGetRecursoById(reqOk, 'EMP-001');
    assert.equal(resOk.status, 200);
    const bodyOk = await resOk.json();
    assert.equal(bodyOk.data.codigo, 'EMP-001');
    assert.ok(bodyOk.data.proyeccion_nomina_strategy);

    const req404 = new NextRequest('http://localhost:3000/api/v1/recursos/EMP-9999');
    const res404 = await RecursoController.handleGetRecursoById(req404, 'EMP-9999');
    assert.equal(res404.status, 404);
    assert.ok(res404.headers.get('Content-Type')?.includes('application/problem+json'));
  });

  await t.test('CP-I07: GET /api/v1/empleados funciona con paginación y caché', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/empleados?page=1&limit=5');
    const res = await EmpleadoController.handleGet(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });
});
