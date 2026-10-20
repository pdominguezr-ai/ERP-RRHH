# ADR-003: Aplicación de Patrones de Diseño GoF y Resiliencia (Strategy, Repository, Gateway, Observer y Circuit Breaker)

* **Estándar Aplicado:** ISO/IEC/IEEE 42010:2011 (Architecture Description)
* **ID de Decisión:** ADR-003
* **Estado:** Aceptada ( Vigente )
* **Fecha:** Octubre 2026
* **Autores:** Paul Dominguez (9989-23-9308), Jorge Morataya (9989-23-340)

---

## 1. Contexto
Para cumplir con los atributos de calidad de **Mantenibilidad (Modularidad, Reusabilidad, Analizabilidad, Modificabilidad y Capacidad de ser probado)** y **Fiabilidad (Tolerancia a Fallos y Recuperabilidad)** definidos en **ISO/IEC 25010**, la capa de lógica de negocio (`src/services/`) no debe contener condicionales rígidos (`if/else` masivos por tipo de contrato), ni instanciar clientes de base de datos o servicios externos directamente dentro de los controladores HTTP.

---

## 2. Decisión Elegida
Se estandariza la implementación explícita de cinco patrones fundamentales en `src/services/gofPatterns.ts` y `src/models/`:

1. **Patrón Strategy (Comportamiento - GoF):**
   * **Interfaz:** `ICalculoNominaStrategy`
   * **Implementaciones:** `RegimenAsalariadoStrategy` (IGSS 4.83% + Bono Decreto 37-2001 Q250 + ISR progresivo), `RegimenServiciosProfesionalesStrategy` (Retención ISR 5% sobre facturación sin prestaciones) y `RegimenEjecutivoStrategy` (Bonos por KPI + ISR tramo superior).
   * **Beneficio:** Permite agregar nuevos regímenes fiscales o laborales cumpliendo el principio **Abierto/Cerrado (OCP - SOLID)**.

2. **Patrón Repository (Arquitectónico / Persistencia):**
   * **Interfaz:** `IRecursoRepository` implementada por `PolyglotRecursoRepository`.
   * **Beneficio:** Oculta los detalles de consulta SQL (PostgreSQL), BSON (MongoDB) y Cypher (Neo4j) detrás de una interfaz de dominio limpia.

3. **Patrón Gateway (Estructural / Integración):**
   * **Clase:** `ExternalErpGateway`
   * **Beneficio:** Encapsula la comunicación con sistemas externos (Portal Electrónico IGSS, Dispersión Bancaria ACH y Servicio de Notificaciones SMTP), traduciendo formatos externos a DTOs internos.

4. **Patrón Observer (Comportamiento - GoF):**
   * **Clases:** `DomainEventBus` (Subject) y observadores concretos `AuditoriaMongoObserver`, `OrganigramaNeo4jObserver` y `CacheInvalidationObserver`.
   * **Beneficio:** Desacopla la transacción principal de los efectos secundarios (auditoría, actualización de grafo e invalidación de caché Redis).

5. **Patrón Circuit Breaker (Resiliencia / Estabilidad):**
   * **Clase:** `CircuitBreaker` con máquina de estados (`CLOSED` ➔ `OPEN` ➔ `HALF_OPEN`).
   * **Beneficio:** Previene fallos en cascada cuando una dependencia externa o base de datos secundaria experimenta latencia extrema o indisponibilidad, activando respuestas de contingencia (*fallback*) inmediatas.

---

## 3. Consecuencias
* **Alta Cohesión y Bajo Acoplamiento:** Cada clase tiene una única razón de cambio (SRP), facilitando pruebas unitarias aisladas en `tests/unit/`.
