# ADR-002: Estrategia de Persistencia Políglota (PostgreSQL, MongoDB, Redis y Neo4j) y Consistencia Eventual

* **Estándar Aplicado:** ISO/IEC/IEEE 42010:2011 (Architecture Description)
* **ID de Decisión:** ADR-002
* **Estado:** Aceptada ( Vigente )
* **Fecha:** Octubre 2026
* **Autores:** Paul Dominguez (9989-23-9308), Jorge Morataya (9989-23-340), Britany Yamileth Meza Chinchilla (9989-23-3181)

---

## 1. Contexto y Problema Arquitectónico
Un sistema ERP de Recursos Humanos moderno maneja estructuras de datos de naturaleza heterogénea:
1. **Datos financieros y contractuales** (salarios, planillas, retenciones IGSS/ISR) que exigen integridad transaccional estricta **ACID**.
2. **Expedientes digitales, evaluaciones 360° y bitácoras de auditoría** que poseen esquemas dinámicos, polimórficos y de alto volumen de escritura.
3. **Catálogos de recursos, sesiones JWT y listados paginados** que presentan una relación lectura/escritura de 90/10 y requieren latencias inferiores a 15 ms.
4. **Relaciones jerárquicas organizacionales** (quién reporta a quién, matrices de habilidades y planes de sucesión) cuyas consultas recursivas en SQL (`WITH RECURSIVE`) se degradan al aumentar la profundidad del árbol.

Forzar un único motor de base de datos relacional para resolver los cuatro escenarios genera antipatrones de diseño (columnas JSON gigantes sin indexar, joins recursivos lentos y sobrecarga de I/O por lecturas repetitivas).

---

## 2. Opciones Consideradas

* **Opción 1:** Utilizar únicamente **PostgreSQL** para tablas, documentos (`JSONB`), caché en tablas no-logueadas y recursividad jerárquica.
* **Opción 2:** Utilizar únicamente **MongoDB** con transacciones multi-documento para todo el ERP.
* **Opción 3 (Elegida):** Implementar **Persistencia Políglota** combinando **PostgreSQL + MongoDB + Redis + Neo4j**, orquestada mediante los patrones **Repository**, **Cache-Aside** y **Observer**.

---

## 3. Decisión Elegida y Justificación por Motor

Se aprueba la **Opción 3: Arquitectura de Persistencia Políglota**, asignando a cada motor de base de datos la carga de trabajo para la cual es matemáticamente óptimo:

| Motor de Persistencia | Paradigma | Casos de Uso en el ERP-RRHH | Justificación Técnica y Atributo ISO 25010 |
|---|---|---|---|
| **1. PostgreSQL 15+ (Supabase)** | Relacional (SQL / ACID) | `empleados`, `usuarios_sistema`, `nominas`, `detalle_nomina`, `solicitudes_ausencia`. | **Integridad y Seguridad:** Garantiza transacciones ACID en cálculos monetarios, llaves foráneas estrictas y políticas **Row Level Security (RLS)**. |
| **2. MongoDB 7.0** | Documental (NoSQL BSON) | `expedientes_digitales` (competencias, certificaciones, evaluaciones 360°) y `auditoria_eventos`. | **Mantenibilidad y Escalabilidad:** Esquema flexible sin migraciones bloqueantes (*schema-less* con JSON Schema Validator) y alta velocidad de inserción (*append-only*) para auditoría. |
| **3. Redis 7.x** | Almacén Clave-Valor en Memoria | Caché de `GET /api/v1/recursos`, `GET /api/v1/empleados`, sesiones JWT y control de Rate Limiting. | **Eficiencia de Desempeño:** Implementación del patrón **Cache-Aside** con políticas de expiración **TTL (300s para listados, 600s para detalle por ID)**, logrando lecturas en `< 5 ms`. |
| **4. Neo4j 5.x** | Base de Datos de Grafos (Cypher) | Nodos `(:Empleado)`, `(:Departamento)`, `(:Competencia)` y aristas `[:REPORTA_A]`, `[:PERTENECE_A]`, `[:DOMINA]`. | **Adecuación Funcional y Desempeño:** Recorrido de árboles jerárquicos y cadenas de mando de $N$ niveles en tiempo constante $O(1)$ por salto mediante *index-free adjacency*. |

---

## 4. Estrategia de Caché (Patrón Cache-Aside con TTL) y Consistencia Eventual

### 4.1 Implementación del Patrón Cache-Aside
1. **En Lecturas (`GET /api/v1/recursos` y `GET /api/v1/recursos/:id`):**
   * El servicio calcula la llave determinista (`cache:recursos:list:{queryHash}` o `cache:recurso:id:{id}`).
   * Si existe en **Redis** y su **TTL** no ha expirado, retorna el payload inmediatamente con el header HTTP `X-Cache: HIT`.
   * Si no existe (**Cache MISS**), consulta **PostgreSQL** y **MongoDB**, almacena el resultado en **Redis** con `SETEX key 300 payload` y responde con `X-Cache: MISS`.
2. **En Escrituras (`POST /api/v1/recursos`):**
   * Se aplica la política **Write-Invalidate**: tras confirmar la escritura en PostgreSQL, el `CacheInvalidationObserver` elimina todas las llaves con prefijo `cache:recursos:*` para evitar lecturas obsoletas (*stale reads*).

### 4.2 Manejo de Consistencia Eventual (Patrón Saga / Observer)
* **Fuente de la Verdad (System of Record):** PostgreSQL actúa como coordinador primario para la creación de un recurso/colaborador.
* **Propagación Asíncrona:** Una vez confirmado el `COMMIT` en PostgreSQL, el `DomainEventBus` dispara el evento `RECURSO_REGISTRADO`. Los observadores `AuditoriaMongoObserver` y `OrganigramaNeo4jObserver` actualizan MongoDB y Neo4j de forma no bloqueante, protegidos por un **Circuit Breaker** y cola de reintentos.

---

## 5. Consecuencias
* **Positivas:** Rendimiento superior en lecturas recurrentes, trazabilidad forense completa en MongoDB, consultas de organigrama instantáneas en Neo4j y cero riesgo de corrupción financiera en PostgreSQL.
* **Negativas:** Mayor complejidad de configuración en el módulo `src/config/database.ts`, resuelta mediante el uso de adaptadores desacoplados con soporte de degradación elegante (*graceful fallback*).
