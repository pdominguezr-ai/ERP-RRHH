# Gestión Ágil de Proyectos, Product Backlog (3C + INVEST) y Criterios DoR / DoD
**Sistema ERP de Gestión de Recursos Humanos y Recursos Corporativos (ERP-RRHH)**  
**Universidad Mariano Gálvez de Guatemala | Curso: Análisis de Sistemas II**  
**Integrantes:** Paul Dominguez (9989-23-9308) · Jorge Morataya (9989-23-340) · Britany Yamileth Meza Chinchilla (9989-23-3181)

---

## 🔗 Enlace Oficial al Tablero Ágil y Backlog
> 🌐 **Tablero Kanban / Scrum Activo:** [https://github.com/pdominguezr-ai/ERP-RRHH/blob/main/docs/agile/backlog.md](https://github.com/pdominguezr-ai/ERP-RRHH/blob/main/docs/agile/backlog.md)  
> *Contiene las columnas Backlog, Ready (DoR Cumplido), In Progress (WIP Limit = 3), Code Review / QA y Done (DoD Cumplido).*

---

## 1. Marco de Trabajo Híbrido (Scrum + Kanban) y Rol del Analista / Product Owner

### 1.1 Definición del Rol del Analista de Sistemas / Product Owner (PO)
En el desarrollo del sistema **ERP-RRHH**, el **Analista Funcional / Product Owner** actúa como el único punto de autoridad sobre el *Product Backlog* y como puente estratégico entre los interesados del negocio (Dirección de Recursos Humanos, Jefaturas de Departamento, Contabilidad/Nómina) y el Equipo de Desarrollo. Sus responsabilidades formales son:

1. **Maximización del Valor del Producto:** Priorizar los elementos del Product Backlog utilizando la matriz **MoSCoW** y el índice económico **WSJF (Weighted Shortest Job First)** para entregar primero los módulos críticos del MVP.
2. **Ingeniería de Requerimientos Híbrida (ISO 29148 ↔ Agilidad):** Traducir las especificaciones formales del estándar **ISO/IEC/IEEE 29148:2018** (`REQ-FN-001` a `REQ-FN-015`) en Historias de Usuario accionables bajo el modelo de las **3C (Card, Conversation, Confirmation)**.
3. **Aseguramiento de Calidad Temprana (Shift-Left & INVEST):** Auditar cada Historia de Usuario mediante la matriz **INVEST** antes de permitir su ingreso al Sprint Planning (verificación del **Definition of Ready - DoR**).
4. **Co-creación de Especificaciones Ejecutables (BDD):** Redactar junto con QA y Desarrollo los criterios de aceptación en sintaxis **Gherkin (`Dado / Cuando / Entonces`)** conforme a **ISO/IEC/IEEE 29119-3:2021** y validar los entregables al cierre del Sprint según el **Definition of Done (DoD)**.

---

## 2. Definición Explícita de DoR (Definition of Ready) y DoD (Definition of Done)

### 2.1 Criterios de Preparación — Definition of Ready (DoR)
Ninguna Historia de Usuario puede ingresar a un Sprint de desarrollo si no cumple **el 100%** de la siguiente lista de chequeo:
- [x] **DoR-01 (Estructura 3C Completa):** La historia posee su Tarjeta (*Card*) en sintaxis `Como <rol>, quiero <acción>, para <beneficio>`, notas de *Conversation* (reglas de negocio e impactos en persistencia políglota) y *Confirmation* (escenarios Gherkin).
- [x] **DoR-02 (Validación INVEST):** La historia ha sido evaluada y aprobada en los 6 criterios: *Independent, Negotiable, Valuable, Estimable, Small (≤ 8 Story Points), Testable*.
- [x] **DoR-03 (Contrato API-First Definido):** Los endpoints afectados están documentados previamente en `docs/api/openapi.yaml` con sus esquemas de entrada/salida y errores bajo **RFC 9457 (`application/problem+json`)**.
- [x] **DoR-04 (Diseño UX/UI Disponible):** Los wireframes o componentes visuales (Átomos, Moléculas, Organismos) están disponibles en el prototipo oficial de Figma ([Figma HRMS ERP](https://www.figma.com/make/dbSlmGmQJzLC0LSi6jni60/Human-Resources-Management-System?t=nRmbossPJY7vnrj0-20&fullscreen=1)) con criterios WCAG 2.2 AA.
- [x] **DoR-05 (Trazabilidad ISO 29148):** La historia está vinculada formalmente a su requerimiento funcional (`REQ-FN-XXX`) y no funcional (`REQ-NF-XXX`).

### 2.2 Criterios de Terminación — Definition of Done (DoD)
Una Historia de Usuario se declara como **Terminada (Done)** únicamente cuando satisface todos los puntos siguientes:
- [x] **DoD-01 (Código Limpio y Estándares):** El código fuente en `src/` compila sin errores de TypeScript (`tsc --noEmit`) ni advertencias críticas de ESLint, aplicando los patrones GoF pertinentes (*Repository, Strategy, Observer, Gateway, Circuit Breaker*).
- [x] **DoD-02 (Cumplimiento de Contrato OpenAPI y RFC 9457):** El endpoint responde con los códigos semánticos **RFC 9110** (`200`, `201`, `400`, `401`, `404`, `500`) y formatea cualquier excepción en estructura **RFC 9457 (`application/problem+json`)**.
- [x] **DoD-03 (Persistencia Políglota y Caché Operativa):** Las operaciones persisten correctamente en PostgreSQL (ACID), sincronizan eventos hacia MongoDB/Neo4j y aplican invalidación o lectura **Cache-Aside con TTL** en Redis.
- [x] **DoD-04 (Pruebas Automatizadas Aprobadas):** El 100% de las pruebas unitarias (`tests/unit/`), pruebas de integración (`tests/integration/`), colección Postman (`docs/api/postman_collection.json`) y escenarios BDD (`features/*.feature`) pasan en estado `PASS`.
- [x] **DoD-05 (Accesibilidad y Responsividad Verificadas):** La interfaz cumple nivel **AA de WCAG 2.2** (contraste ≥ 4.5:1, navegación por teclado) y diseño **Mobile-First**.

---

## 3. Product Backlog Estructurado según las 3C (Card, Conversation, Confirmation)

### 🟦 HU-01: Autenticación Institucional y Emisión de Token JWT
* **Requerimientos Vinculados:** `REQ-FN-001`, `REQ-NF-001`
* **1. Card (Tarjeta):**
  * **Enunciado:** *Como* Usuario del Sistema (Administrador RRHH, Jefe Inmediato o Colaborador), *quiero* autenticarme mediante correo electrónico institucional y contraseña segura, *para* obtener un token JWT firmado que me permita consumir los servicios protegidos según mi rol RBAC.
  * **Prioridad MoSCoW:** Must Have (Alta) | **Estimación:** 3 Story Points | **WSJF:** 20.0
* **2. Conversation (Conversación y Reglas de Negocio):**
  * **RN-01.1:** El endpoint `POST /api/v1/auth/login` valida el formato de credenciales con Zod antes de consultar PostgreSQL (`usuarios_sistema`).
  * **RN-01.2:** El token JWT tiene un tiempo de vida (`TTL`) de 3,600 segundos (60 minutos) registrado en Redis para soporte de revocación rápida (*Token Blacklist*).
  * **RN-01.3:** Si las credenciales son inválidas o el usuario está inactivo, el sistema retorna un error **RFC 9457 (`application/problem+json`)** con estado HTTP `401 Unauthorized` o `403 Forbidden`, registrando el evento de seguridad en la colección `auditoria_eventos` de MongoDB.
* **3. Confirmation (Confirmación / Criterios de Aceptación BDD):**
  * **CA-01.1 (Camino Feliz):** Dado un usuario activo con credenciales válidas (`admin.rrhh@empresa.com`), cuando envía `POST /api/v1/auth/login`, entonces recibe `HTTP 200 OK`, token JWT y perfil RBAC en menos de 200 ms.
  * **CA-01.2 (Excepción Credenciales):** Dado un password incorrecto, cuando solicita login, entonces recibe `HTTP 401` con `Content-Type: application/problem+json` y `type: "https://erp-rrhh.umg.edu.gt/probs/unauthorized"`.
  * **CA-01.3 (Validación Esquema):** Dado un correo malformado, cuando solicita login, entonces recibe `HTTP 400` con el desglose de campos inválidos en `errors`.

---

### 🟦 HU-02: Consulta de Catálogo de Recursos y Colaboradores con Caché (Cache-Aside)
* **Requerimientos Vinculados:** `REQ-FN-002`, `REQ-FN-003`, `REQ-NF-002`
* **1. Card (Tarjeta):**
  * **Enunciado:** *Como* Gestor de Recursos Humanos, *quiero* consultar y filtrar el catálogo de recursos y colaboradores activos por departamento, categoría y estado utilizando caché en memoria, *para* obtener tiempos de respuesta sub-milisegundo sin saturar la base de datos relacional.
  * **Prioridad MoSCoW:** Must Have (Alta) | **Estimación:** 5 Story Points | **WSJF:** 18.5
* **2. Conversation (Conversación y Reglas de Negocio):**
  * **RN-02.1:** Los endpoints `GET /api/v1/recursos` y `GET /api/v1/empleados` implementan el patrón **Cache-Aside** sobre Redis con una política de expiración **`TTL = 300 segundos`**.
  * **RN-02.2:** En caso de *Cache MISS*, el servicio consulta PostgreSQL (datos transaccionales) y enriquece el resultado con el expediente documental almacenado en MongoDB (`expedientes_digitales`), guardando el resultado serializado en Redis e incluyendo la cabecera `X-Cache: MISS`.
  * **RN-02.3:** En lecturas subsecuentes dentro de la ventana TTL, Redis responde directamente con cabecera `X-Cache: HIT` y latencia `< 15 ms`.
* **3. Confirmation (Confirmación / Criterios de Aceptación BDD):**
  * **CA-02.1 (Cache MISS Inicial):** Dada una clave no existente en Redis, cuando se invoca `GET /api/v1/recursos?departamento=Tecnología`, entonces retorna `HTTP 200 OK`, cabecera `X-Cache: MISS` y almacena la clave con `TTL = 300s`.
  * **CA-02.2 (Cache HIT Subsecuente):** Dada una clave vigente en Redis, cuando se repite la petición `GET /api/v1/recursos?departamento=Tecnología`, entonces retorna `HTTP 200 OK` y cabecera `X-Cache: HIT`.

---

### 🟦 HU-03: Registro Políglota de Nuevo Recurso / Colaborador con Consistencia Eventual
* **Requerimientos Vinculados:** `REQ-FN-004`, `REQ-FN-005`, `REQ-NF-003`
* **1. Card (Tarjeta):**
  * **Enunciado:** *Como* Administrador de RRHH, *quiero* registrar un nuevo colaborador o recurso corporativo validando sus reglas salariales y jerárquicas, *para* persistir su ficha transaccional en PostgreSQL, su nodo jerárquico en Neo4j y su expediente en MongoDB.
  * **Prioridad MoSCoW:** Must Have (Alta) | **Estimación:** 5 Story Points | **WSJF:** 16.0
* **2. Conversation (Conversación y Reglas de Negocio):**
  * **RN-03.1:** Los endpoints `POST /api/v1/recursos` y `POST /api/v1/empleados` exigen un DPI de 13 dígitos únicos y un salario base mayor o igual al mínimo legal vigente (**Q 3,384.59**).
  * **RN-03.2:** Tras el `COMMIT` en PostgreSQL, el `DomainEventBus` (Patrón **Observer**) propaga asíncronamente la creación del nodo `(:Empleado)-[:PERTENECE_A]->(:Departamento)` en **Neo4j**, inserta la auditoría en **MongoDB** e invalida las claves de listado en **Redis**.
* **3. Confirmation (Confirmación / Criterios de Aceptación BDD):**
  * **CA-03.1 (Registro Exitoso):** Dados datos válidos con salario `Q 15,000.00`, cuando se envía `POST /api/v1/recursos`, entonces retorna `HTTP 201 Created`, genera código correlativo `REC-XXXX` / `EMP-XXXX`, sincroniza Neo4j/MongoDB e invalida la caché Redis.
  * **CA-03.2 (Rechazo RFC 9457):** Dado un salario inferior a `Q 3,384.59` o DPI inválido, cuando se envía `POST /api/v1/recursos`, entonces retorna `HTTP 400 Bad Request` con estructura RFC 9457 `application/problem+json`.

---

### 🟦 HU-04: Consulta de Detalle de Recurso por ID con Resiliencia (Circuit Breaker)
* **Requerimientos Vinculados:** `REQ-FN-006`, `REQ-NF-004`
* **1. Card (Tarjeta):**
  * **Enunciado:** *Como* Jefe Inmediato o Analista de RRHH, *quiero* consultar el expediente integral de un recurso o colaborador por su identificador único (`GET /api/v1/recursos/:id`), *para* visualizar sus datos contractuales (PostgreSQL), competencias (MongoDB) y línea de mando (Neo4j).
  * **Prioridad MoSCoW:** Must Have (Alta) | **Estimación:** 3 Story Points | **WSJF:** 15.0
* **2. Conversation (Conversación y Reglas de Negocio):**
  * **RN-04.1:** Consulta protegida mediante **Cache-Aside** (`TTL = 600s` por ID) y patrón **Circuit Breaker** (umbral de 3 fallos consecutivos antes de pasar a estado `OPEN`).
  * **RN-04.2:** Si el ID solicitado no existe, retorna `HTTP 404 Not Found` bajo el estándar **RFC 9457 (`application/problem+json`)**.
* **3. Confirmation (Confirmación / Criterios de Aceptación BDD):**
  * **CA-04.1 (Recurso Encontrado):** Dado que existe el recurso con ID `EMP-001`, cuando se consulta `GET /api/v1/recursos/EMP-001`, entonces retorna `HTTP 200 OK` con datos consolidados de PostgreSQL, MongoDB y Neo4j.
  * **CA-04.2 (Recurso Inexistente):** Dado un ID inexistente `EMP-9999`, cuando se consulta `GET /api/v1/recursos/EMP-9999`, entonces retorna `HTTP 404 Not Found` con formato `application/problem+json`.

---

### 🟦 HU-05: Cálculo Polimórfico de Nómina Mensual (Patrón Strategy)
* **Requerimientos Vinculados:** `REQ-FN-007`, `REQ-FN-008`
* **1. Card (Tarjeta):**
  * **Enunciado:** *Como* Encargado de Nómina, *quiero* procesar la planilla aplicando dinámicamente la estrategia de cálculo según el régimen contractual de cada colaborador, *para* determinar con exactitud el IGSS (4.83%), ISR, Bonificación Decreto 37-2001 (Q 250.00) y salario líquido.
  * **Prioridad MoSCoW:** Must Have (Alta) | **Estimación:** 8 Story Points | **WSJF:** 14.5
* **2. Conversation (Conversación y Reglas de Negocio):**
  * **RN-05.1:** Aplicación del patrón GoF **Strategy** (`RegimenAsalariadoStrategy`, `RegimenServiciosStrategy`, `RegimenEjecutivoStrategy`).
  * **RN-05.2:** Integración con bancos y portal IGSS mediante el patrón **Gateway** (`ExternalErpGateway`).
* **3. Confirmation (Confirmación / Criterios de Aceptación BDD):**
  * **CA-05.1:** Dado un empleado en régimen asalariado con sueldo base `Q 10,000.00`, cuando se calcula su nómina, entonces el IGSS retenido es `Q 483.00`, la bonificación es `Q 250.00` y el cálculo se audita en MongoDB.

---

### 🟦 HU-06: Gestión y Aprobación de Solicitudes de Ausencia
* **Requerimientos Vinculados:** `REQ-FN-009`, `REQ-FN-010`
* **1. Card (Tarjeta):**
  * **Enunciado:** *Como* Colaborador, *quiero* registrar solicitudes de vacaciones o permisos verificando mi saldo disponible y jerarquía de aprobación, *para* gestionar mis ausencias de forma transparente.
  * **Prioridad MoSCoW:** Should Have (Media) | **Estimación:** 3 Story Points | **WSJF:** 11.0
* **2. Conversation (Conversación y Reglas de Negocio):**
  * **RN-06.1:** La fecha final no puede ser anterior a la fecha inicial y los días solicitados no pueden exceder el saldo acumulado.
* **3. Confirmation (Confirmación / Criterios de Aceptación BDD):**
  * **CA-06.1:** Dada una solicitud dentro del saldo disponible, cuando se envía `POST /api/v1/solicitudes`, entonces retorna `HTTP 201 Created` en estado `PENDIENTE`.

---

## 4. Matriz de Validación bajo el Criterio INVEST

Todas las Historias de Usuario del Product Backlog fueron auditadas con el modelo **INVEST** de Bill Wake:

| ID | Historia de Usuario | **I**ndependent (Independiente) | **N**egotiable (Negociable) | **V**aluable (Valiosa) | **E**stimable (Estimable) | **S**mall (Pequeña) | **T**estable (Comprobable) | Estado DoR |
|---|---|---|---|---|---|---|---|---|
| **HU-01** | Autenticación JWT (`/auth/login`) | ✅ Sí, módulo desacoplado | ✅ Sí, claims configurables | ✅ Alta seguridad RBAC | ✅ 3 SP | ✅ 1 Sprint | ✅ `autenticacion.feature` | **READY** |
| **HU-02** | Catálogo con Cache-Aside (`GET /recursos`) | ✅ Sí, interfaz Repository | ✅ Sí, TTL parametrizable | ✅ Reduce latencia 85% | ✅ 5 SP | ✅ 1 Sprint | ✅ `gestion_recursos.feature` | **READY** |
| **HU-03** | Registro Políglota (`POST /recursos`) | ✅ Sí, eventos asíncronos | ✅ Sí, metadatos flexibles | ✅ Integridad ACID+Grafo | ✅ 5 SP | ✅ 1 Sprint | ✅ `gestion_recursos.feature` | **READY** |
| **HU-04** | Detalle por ID (`GET /recursos/:id`) | ✅ Sí, lectura atómica | ✅ Sí, proyección parcial | ✅ Visión 360° de RRHH | ✅ 3 SP | ✅ 1 Sprint | ✅ `gestion_recursos.feature` | **READY** |
| **HU-05** | Cálculo Nómina (Patrón Strategy) | ✅ Sí, Strategy aislada | ✅ Sí, tasas parametrizables | ✅ Automatiza planilla | ✅ 8 SP | ✅ 1 Sprint | ✅ `tests/unit/` | **READY** |
| **HU-06** | Solicitudes de Ausencia (`/solicitudes`) | ✅ Sí, flujo autónomo | ✅ Sí, tipos configurables | ✅ Elimina papel físico | ✅ 3 SP | ✅ 1 Sprint | ✅ `gestion_recursos.feature` | **READY** |
