# ADR-001: Selección de Estilo Arquitectónico Híbrido (Arquitectura en Capas Limpia + API-First + Eventos de Dominio)

* **Estándar Aplicado:** ISO/IEC/IEEE 42010:2011 (Systems and software engineering — Architecture description)
* **ID de Decisión:** ADR-001
* **Estado:** Aceptada ( Vigente )
* **Fecha:** Octubre 2026
* **Autores:** Paul Dominguez (9989-23-9308), Jorge Morataya (9989-23-340), Britany Yamileth Meza Chinchilla (9989-23-3181)
* **Stakeholders Preocupados (Concerns):** Dirección de TI, Administradores de RRHH, Equipo de Desarrollo y QA.

---

## 1. Contexto y Problema Arquitectónico
El sistema **ERP de Gestión de Recursos Humanos (ERP-RRHH)** requiere procesar operaciones altamente transaccionales (cálculo de nóminas, control de expedientes y autorizaciones RBAC) al mismo tiempo que debe ofrecer consultas de baja latencia (`< 50 ms` en caché), propagación asíncrona de auditoría inmutable y sincronización con una base de datos de grafos organizacional.

Durante la etapa de evaluación arquitectónica bajo el estándar **ISO/IEC 25010**, se analizaron cuatro estilos candidatos:
1. **Arquitectura en Capas (Layered Architecture)**
2. **Arquitectura Centrada en Repositorio de Datos (Repository Pattern)**
3. **Arquitectura de Microservicios Distribuida**
4. **Arquitectura Orientada a Eventos (EDA - Event-Driven Architecture)**

El problema consiste en seleccionar una arquitectura que maximice la **Mantenibilidad**, **Escalabilidad**, **Eficiencia de Desempeño** y **Fiabilidad**, evitando la sobrecarga operativa (*operational overhead*) de decenas de microservicios independientes para un equipo ágil, pero superando la rigidez de un monolito tradicional acoplado.

---

## 2. Opciones Consideradas

### Opción A: Monolito en Capas Tradicional con Base de Datos Única
* **Ventajas:** Despliegue simple, transacciones locales inmediatas.
* **Desventajas:** Alto acoplamiento entre presentación y acceso a datos; cuellos de botella en lecturas intensivas de catálogos; ausencia de desacoplamiento para auditoría y grafos jerárquicos.

### Opción B: Microservicios Puros desde el Día 1 (Kubernetes + Service Mesh)
* **Ventajas:** Escalabilidad independiente por servicio.
* **Desventajas:** Complejidad extrema de infraestructura DevOps, latencia de red inter-servicios, dificultad para mantener transacciones ACID en el cierre de nómina.

### Opción C (Elegida): Arquitectura Modular en Capas Limpia (Clean Layered Architecture) con Filosofía API-First, Patrón Repository y Bus de Eventos de Dominio (EDA Interno / Observer)
* **Descripción:** Estructurar el backend en capas estrictamente desacopladas (`Controllers` ➔ `Services & GoF Patterns` ➔ `Repositories/Models` ➔ `Polyglot Data Layer`), gobernadas por un contrato **OpenAPI 3.0.3 (API-First)** y un **DomainEventBus (Patrón Observer)** para la consistencia eventual entre motores de datos.

---

## 3. Decisión Elegida
Se adopta la **Opción C: Arquitectura Modular en Capas Limpia + API-First + Eventos de Dominio (EDA Interno)**.

### Justificación Técnica (Alineada a ISO/IEC 25010):
1. **Mantenibilidad (Modularidad y Reusabilidad):** Separación estricta de responsabilidades entre `src/controllers/`, `src/services/`, `src/models/` y `src/middlewares/`. Cada capa se comunica a través de contratos tipados y DTOs validados con Zod.
2. **Eficiencia de Desempeño:** Integración transparente del patrón **Cache-Aside** con Redis (`TTL = 300s`) en la capa de servicio, reduciendo el tiempo de respuesta de `180 ms` a `< 10 ms`.
3. **Fiabilidad (Tolerancia a Fallos):** Incorporación del patrón **Circuit Breaker** en las llamadas a repositorios secundarios (MongoDB/Neo4j), garantizando que una caída en el motor documental o de grafos no interrumpa la operación transaccional principal en PostgreSQL.
4. **Interoperabilidad (API-First):** Exposición de endpoints RESTful bajo **OpenAPI 3.0.3** con respuestas de error unificadas según **RFC 9110** y **RFC 9457 (`application/problem+json`)**.

---

## 4. Consecuencias

### Positivas:
* Alta cohesión funcional dentro de cada módulo (`Auth`, `Recursos`, `Empleados`, `Nómina`, `Solicitudes`) y bajo acoplamiento gracias a la inversión de dependencias (`IRecursoRepository`, `ICalculoNominaStrategy`).
* Capacidad de ejecutar pruebas unitarias (`tests/unit/`) y de integración (`tests/integration/`) en milisegundos sin depender de infraestructura externa pesada.
* Preparación natural para extraer módulos específicos a microservicios independientes o exponerlos vía **GraphQL / gRPC** en el futuro sin reescribir la lógica de dominio.

### Negativas / Riesgos Mitigados:
* **Riesgo:** La propagación asíncrona de eventos hacia MongoDB y Neo4j introduce una ventana de consistencia eventual.
* **Mitigación:** Se implementa reintento automático con *exponential backoff* en el `DomainEventBus` y registro de eventos fallidos (*Dead-Letter Queue lógica*).
