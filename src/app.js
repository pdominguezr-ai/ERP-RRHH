/**
 * Punto de Entrada Principal del Backend (src/app.js)
 * Sistema ERP de Gestión de Recursos Humanos (ERP-RRHH)
 * Universidad Mariano Gálvez de Guatemala - Análisis de Sistemas II
 * Integrantes: Paul Dominguez (9989-23-9308) | Jorge Morataya (9989-23-340)
 *
 * Este módulo documenta y expone el registro de rutas API-First (OpenAPI 3.0.3),
 * Middlewares RFC 9457 (application/problem+json), Patrones GoF y Conexión Políglota
 * (PostgreSQL + MongoDB + Redis Cache-Aside + Neo4j) integrados en Next.js 16 App Router.
 */

const endpointsCatalog = [
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    description: 'Autenticación institucional y generación de Token JWT',
    persistence: 'PostgreSQL + Redis (Session TTL=3600s) + MongoDB Audit',
    status: 'Funcional',
  },
  {
    method: 'GET',
    path: '/api/v1/recursos',
    description: 'Consulta de catálogo paginado y filtrado con patrón Cache-Aside (TTL=300s)',
    persistence: 'Redis (Cache-Aside) + MongoDB + PostgreSQL',
    status: 'Funcional',
  },
  {
    method: 'POST',
    path: '/api/v1/recursos',
    description: 'Registro transaccional de nuevo elemento con propagación Observer',
    persistence: 'PostgreSQL (ACID) + Neo4j (Grafo) + MongoDB + Redis Invalidation',
    status: 'Funcional',
  },
  {
    method: 'GET',
    path: '/api/v1/recursos/:id',
    description: 'Detalle integral de elemento por ID con resiliencia Circuit Breaker',
    persistence: 'Redis (TTL=600s) + PostgreSQL + MongoDB + Neo4j',
    status: 'Funcional',
  },
  {
    method: 'GET / POST',
    path: '/api/v1/empleados',
    description: 'Gestión de expedientes de colaboradores con validación DTO Zod',
    persistence: 'PostgreSQL + Redis + MongoDB',
    status: 'Funcional',
  },
  {
    method: 'GET / POST',
    path: '/api/v1/solicitudes',
    description: 'Gestión de solicitudes de ausencia, permisos y vacaciones',
    persistence: 'PostgreSQL + MongoDB Audit',
    status: 'Funcional',
  },
];

if (require.main === module) {
  console.log('======================================================================');
  console.log(' ERP-RRHH Backend Funcional - Arquitectura Políglota & API-First');
  console.log(' Estándares: ISO 29148 | IEEE 1016 | ISO 25010 | ISO 42010 | RFC 9457');
  console.log('======================================================================');
  console.table(endpointsCatalog);
  console.log('\nPara iniciar el servidor web y API Next.js 16 ejecute: npm run dev');
}

module.exports = { endpointsCatalog };
