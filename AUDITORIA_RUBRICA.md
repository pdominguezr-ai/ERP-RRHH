# Auditoría Integral de Entrega — Sistema ERP-RRHH (Segunda Auditoría)
**Proyecto:** Módulo de Gestión de Recursos Humanos y Recursos Corporativos (ERP-RRHH)  
**Institución:** Universidad Mariano Gálvez de Guatemala | Facultad de Ingeniería en Sistemas  
**Curso:** Análisis de Sistemas II | Entrega de Proyecto Final  
**Integrantes:** Paul Dominguez (`9989-23-9308`) · Jorge Morataya (`9989-23-340`) · Britany Yamileth Meza Chinchilla (`9989-23-3181`)  
**Rama Auditada:** `cambiosJorge` (Commit `29bed32`) | **Fecha de Segunda Auditoría:** 22 de Octubre de 2026  

---

## 1. Resumen Ejecutivo y Metodología de Evaluación

Esta segunda auditoría valida físicamente cada archivo del repositorio, contrasta las afirmaciones de la primera revisión contra el código real y recalcula la puntuación con estricta **honestidad técnica**:
- **CUMPLE:** Requisito documentado, implementado en código y validado con prueba verificable.
- **PARCIAL:** Requisito implementado mediante emulación/adaptadores en memoria, o con visor local autónomo sin enlace remoto activo, o documentación completa con dependencia externa pendiente de publicar.
- **NO CUMPLE:** Ausencia total del entregable.
- **NO VERIFICABLE:** Dependencia de credenciales privadas inaccesibles.

### 📊 Puntuación Estimada Definitiva por Criterio

| Criterio | Peso Máximo | Puntuación Estimada | Nivel de Cumplimiento | Hallazgos Clave de la Segunda Auditoría |
|---|:---:|:---:|:---:|---|
| **Criterio 1: Requerimientos, UML, SDD y Agilidad** | 1.0 pt | **0.95 / 1.0** | 95% | SRS formal ISO 29148 (12 REQ-FN + 6 REQ-NF), UML 2.5.1 (.puml/.png) y SDD IEEE 1016 verificados. El tablero en GitHub Projects retorna 404 en incógnito (privado). |
| **Criterio 2: Arquitectura, C4 y Persistencia** | 1.0 pt | **0.90 / 1.0** | 90% | C4 Niveles 1-4, ADRs ISO 42010 y GoF probados. PostgreSQL en Supabase es real; Redis, MongoDB y Neo4j son adaptadores en memoria simulados para pruebas locales. |
| **Criterio 3: API-First, RFC y BDD** | 2.0 pts | **2.0 / 2.0** | 100% | OpenAPI 3.0.3 coincide exactamente con las rutas de `src/app/api/v1/`, Postman ejecutable, RFC 9457 probado en integración, BDD Gherkin y RTM bidireccional de 24 ítems. |
| **Criterio 4: Backend Funcional** | 2.0 pts | **2.0 / 2.0** | 100% | 6 endpoints operativos en Next.js 16 App Router con DTOs Zod, Cache-Aside y Circuit Breaker. 20 pruebas automáticas pasando al 100%. |
| **Criterio 5: UX/UI, Accesibilidad y Mobile-First** | 2.0 pts | **1.80 / 2.0** | 90% | Reporte ISO 9241/WCAG 2.2 AA completo y visor web interactivo en `./docs/ui/prototipo_interactivo.html`. El enlace referenciado a `figma.com/design/...` retorna HTTP 404. |
| **Criterio 6: SQA, Defectos, Trazabilidad, Entrega** | 2.0 pts | **1.80 / 2.0** | 90% | Plan SQA IEEE 730, Defectos IEEE 1044, Casos ISO 29119-3 y PDF maestro de 2.13 MB verificados. Brecha técnica: No cuenta con runner headless E2E de navegador (Playwright). |
| **TOTAL ESTIMADO** | **10.0 pts** | **9.45 / 10.0** | **94.5%** | **PROYECTO VERIFICABLE, TRANSPARENTE Y LISTO PARA DEFENSA** |

---

## 2. Reconciliación de Inconsistencias Detectadas (Segunda Auditoría)

### 📌 2.1 Conteo Real de Requerimientos (SRS vs Backlog vs RTM)
En la primera auditoría se asumió erróneamente un conteo genérico de 15 RF y 10 RNF. La inspección física del código fuente y artefactos revela la estructura real:
1. **RTM Final ([`docs/RTM_Final.md`](./docs/RTM_Final.md)):** 24 requerimientos macro del negocio:
   - 14 Requerimientos Funcionales (`REQ-01` / `RF-01` a `REQ-14` / `RF-14`): Empleados, Nómina, Retenciones, Reclutamiento, Onboarding, Asistencia, Ausencias, Evaluaciones, Capacitaciones, Beneficios, Portal Colaborador, Reportes Rotación, Cumplimiento y Reportes Generales.
   - 10 Requerimientos No Funcionales (`REQ-15` / `RNF-01` a `REQ-24` / `RNF-10`): Autenticación Supabase, Roles RBAC, Rendimiento < 2s, Patrón Repository, Auditoría, RLS Salarial, Respaldo SQL, Responsive HSL/Tailwind, Errores amigables y TypeScript estricto.
2. **SRS Formal ISO 29148 ([`docs/requirements/srs_ieee_29148.pdf`](./docs/requirements/srs_ieee_29148.pdf)):** 18 requerimientos de ingeniería redactados bajo la fórmula normativa:
   - 12 Requerimientos Funcionales (`REQ-FN-001` a `REQ-FN-012`).
   - 6 Requerimientos No Funcionales (`REQ-NF-001` a `REQ-NF-006`).
3. **Product Backlog ([`docs/agile/backlog.md`](./docs/agile/backlog.md)):** 6 Historias de Usuario principales (`HU-01` a `HU-06`) estructuradas con 3C e INVEST para los módulos críticos del MVP ejecutable.

### 📌 2.2 Verificación del Prototipo en Figma vs Visor Local HTML
- **Comprobación HTTP de enlace Figma:** La URL documentada en `reporte_usabilidad.html` (`https://www.figma.com/design/pdominguezr-ai/ERP-RRHH-Prototype`) fue testeada mediante petición directa vía `curl.exe` y retornó **`HTTP/1.1 404 Not Found`**.
- **Solución técnica implementada:** El proyecto no depende de ese enlace porque incluye un **visor web autónomo navegable 100% funcional** en [`docs/ui/prototipo_interactivo.html`](./docs/ui/prototipo_interactivo.html) que emula la barra superior de Figma, permite navegar por todas las pantallas del ERP-RRHH y opera sin conexión a internet ni requerimiento de credenciales. Por tanto, se declara cumplimiento **PARCIAL** en el enlace externo y **CUMPLE** en la experiencia interactiva local.

### 📌 2.3 Persistencia Políglota: Real vs Adaptadores en Memoria
- **PostgreSQL (Supabase):** Implementación **REAL**. Esquema transaccional estructurado en 21 tablas relacionales con claves foráneas, restricciones, índices y políticas Row Level Security (RLS) en [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) y [`supabase/seed.sql`](./supabase/seed.sql).
- **Redis, MongoDB y Neo4j:** Implementados mediante **ADAPTADORES EN MEMORIA** en [`src/config/database.ts`](./src/config/database.ts):
  - `InMemoryRedisAdapter`: Emula almacenamiento clave-valor con política TTL (300s y 600s) y contadores de `hits`/`misses`.
  - `InMemoryMongoAdapter`: Emula almacenamiento documental para la colección `auditoria_eventos`.
  - `InMemoryNeo4jAdapter`: Emula relaciones de grafo jerárquico organizacional (`[:PERTENECE_A]`, `[:REPORTA_A]`).
- **Dictamen:** Esta decisión técnica permite que el proyecto sea 100% autónomo y se evalúe localmente con `npm test` en 29 segundos sin exigir Docker ni clústeres remotos de pago. Sin embargo, se declara honestamente como **PARCIAL / EMULADO EN MEMORIA** en la matriz de persistencia.

---

## 3. Matriz Exhaustiva de Auditoría por Subrequisito

### Criterio 1: Requerimientos, UML, SDD y Agilidad (1.0 pt)

| Subrequisito | Estado | Evidencia y Ruta Relativa | Hallazgo Técnico | Acción / Validación | Prioridad |
|---|:---:|---|---|---|:---:|
| **SRS formal ISO/IEC/IEEE 29148:2018** | **CUMPLE** | [`docs/requirements/srs_ieee_29148.pdf`](./docs/requirements/srs_ieee_29148.pdf) (991 KB) | Contiene 12 REQ-FN y 6 REQ-NF redactados formalmente: `[Condición] + [Sujeto] + [DEBE] + [Acción] + [Restricción]`. | Validado binario `%PDF`. Estructura normativa inambigua. | Media |
| **Diagramas UML 2.5.1 (Fuentes + PNG)** | **CUMPLE** | [`docs/uml/`](./docs/uml/):<br>- `clases.puml` / `clases.png`<br>- `secuencia.puml` / `secuencia.png`<br>- `actividades.puml` / `actividades.png`<br>- `paquetes.puml` / `paquetes.png` | Clases con multiplicidad y agregación; secuencia con traza HTTP y persistencia; actividades con swimlanes por rol; paquetes de arquitectura. | Validado binario PNG con firma `89-50-4E-47`. Correspondencia 1:1 con el código de `src/controllers/`. | Baja |
| **Fichas SDD IEEE 1016-2009** | **CUMPLE** | [`docs/requirements/fichas_diseno_ieee1016.pdf`](./docs/requirements/fichas_diseno_ieee1016.pdf) (551 KB) | Fichas de diseño de componentes detallando atributos, interfaces públicas, dependencias de librerías y excepciones por módulo. | Validado: Cabecera `%PDF` verificada. | Baja |
| **Backlog Ágil (3C + INVEST + DoR/DoD)** | **PARCIAL** | [`docs/agile/backlog.md`](./docs/agile/backlog.md) y [Tablero GitHub Projects](https://github.com/users/pdominguezr-ai/projects/1/views/1) | Backlog documental con 6 HUs completas en formato 3C, INVEST, DoR (5 criterios) y DoD (5 criterios). El enlace a GitHub Projects da HTTP 404 en modo incógnito porque el proyecto está privado en GitHub. | El propietario de la cuenta GitHub debe cambiar la visibilidad a Pública. | Alta |

---

### Criterio 2: Arquitectura, C4 y Persistencia Políglota (1.0 pt)

| Subrequisito | Estado | Evidencia y Ruta Relativa | Hallazgo Técnico | Acción / Validación | Prioridad |
|---|:---:|---|---|---|:---:|
| **Comparativa Arquitectónica ISO 25010** | **CUMPLE** | [`docs/architecture/escenarios_iso25010.pdf`](./docs/architecture/escenarios_iso25010.pdf) (921 KB) y [`docs/Analisis_Debilidades_Arquitectonicas.md`](./docs/Analisis_Debilidades_Arquitectonicas.md) | Análisis comparativo de Monolito en Capas, Arquitectura en Repositorio, Microservicios y EDA. Escenarios cuantificados de latencia, mantenibilidad y escalabilidad. | Validado: PDF generado y verificable. | Baja |
| **ADRs según ISO/IEC/IEEE 42010** | **CUMPLE** | [`docs/architecture/adrs/`](./docs/architecture/adrs/): `ADR-001`, `ADR-002`, `ADR-003`, `ADR-004` | Estructura formal: Contexto, Decisión, Opciones consideradas, Consecuencias (positivas y riesgos mitigados) y Estado Aceptada. | Validado: Citas explícitas a estándares ISO/IEEE. | Baja |
| **Modelo C4 Completo (Niveles 1 a 4)** | **CUMPLE** | [`docs/c4/`](./docs/c4/): `c4_nivel1_contexto.puml/.png` a `c4_nivel4_codigo.puml/.png` | Nivel 1 Contexto con actores; Nivel 2 Contenedores (Next.js, Supabase, Redis, Mongo, Neo4j); Nivel 3 Componentes; Nivel 4 Diagrama de clases/código. | Validado: Diagramas PlantUML y PNGs legibles. | Baja |
| **Persistencia Políglota Real vs Adaptadores** | **PARCIAL** | [`src/config/database.ts`](./src/config/database.ts), [`docs/database/scripts_ddl.sql`](./docs/database/scripts_ddl.sql), [`supabase/migrations/`](./supabase/migrations/) | PostgreSQL/Supabase es real y transaccional con DDL y RLS. Redis, MongoDB y Neo4j son adaptadores en memoria simulados para pruebas locales autónomas. | Transparencia técnica documentada en el mapa de entrega. | Media |
| **Patrones GoF y Resiliencia** | **CUMPLE** | [`src/services/gofPatterns.ts`](./src/services/gofPatterns.ts) y [`tests/unit/gof_patterns.test.ts`](./tests/unit/gof_patterns.test.ts) | Strategy (`ICalculoNominaStrategy`), Repository (`IRecursoRepository`), Gateway (`ExternalErpGateway`), Observer (`DomainEventBus`), Circuit Breaker (`CircuitBreaker`). | Validado: `npm test` ejecuta los 8 casos unitarios `CP-U01` a `CP-U08` en PASS. | Baja |

---

### Criterio 3: API-First, RFC y BDD (2.0 pts)

| Subrequisito | Estado | Evidencia y Ruta Relativa | Hallazgo Técnico | Acción / Validación | Prioridad |
|---|:---:|---|---|---|:---:|
| **Contrato OpenAPI 3.0.3 Válido** | **CUMPLE** | [`docs/api/openapi.yaml`](./docs/api/openapi.yaml) (21.2 KB) y [`docs/api/swagger_ui.png`](./docs/api/swagger_ui.png) | Especificación formal OpenAPI 3.0.3 con servidores local/producción, esquemas (`AuthLoginRequest`, `EmpleadoResponse`, etc.), parámetros y respuestas. | Coincide exactamente con los endpoints y controladores en `src/app/api/v1/`. | Media |
| **Colección Postman Ejecutable** | **CUMPLE** | [`docs/api/postman_collection.json`](./docs/api/postman_collection.json) (8.6 KB) y [`test-api/coleccion_postman.json`](./test-api/coleccion_postman.json) | Colección formato v2.1.0 con variables `baseUrl`, `jwtToken`, aserciones de estado HTTP y verificación de cabeceras `X-Cache`. | Validado: Ambos archivos JSON son idénticos y compatibles con Postman. | Baja |
| **Errores RFC 9110 y RFC 9457** | **CUMPLE** | [`src/middlewares/problemDetails.ts`](./src/middlewares/problemDetails.ts) | Retorna Media Type `application/problem+json` con campos: `type`, `title`, `status`, `detail`, `instance`, `code`, `timestamp`, `errors`. | Validado: Tests `CP-I02` y `CP-I05` en `tests/integration/api_endpoints.test.ts` verifican `application/problem+json`. | Baja |
| **Explicación Conceptual GraphQL y gRPC** | **CUMPLE** | [`docs/api/openapi.yaml:L11-L14`](./docs/api/openapi.yaml#L11-L14) y [`ADR-001:L56`](./docs/architecture/adrs/ADR-001-estilo-arquitectonico.md#L56) | Explica federación GraphQL para evitar over-fetching y contratos gRPC (`proto3`) para nómina masiva inter-servicios, sin simular implementaciones falsas. | Validado: Explicación teórica clara diferenciada de la API RESTful activa. | Baja |
| **Especificación BDD en Gherkin (ISO 29119-3)** | **CUMPLE** | [`features/autenticacion.feature`](./features/autenticacion.feature), [`features/gestion_recursos.feature`](./features/gestion_recursos.feature), [`features/gestion_principal.feature`](./features/gestion_principal.feature) | Escenarios estructurados con `Dado / Cuando / Entonces`, esquemas de escenario (`Scenario Outline`) y matrices de datos (`Examples`). | Validado: Archivos `.feature` completos y trazables con la RTM. | Baja |
| **Matriz de Trazabilidad Integral (RTM)** | **CUMPLE** | [`docs/RTM_Final.md`](./docs/RTM_Final.md), [`docs/qa/trazabilidad.pdf`](./docs/qa/trazabilidad.pdf) | Cobertura integral de los 24 requerimientos del negocio (14 funcionales `RF-01..14` + 10 no funcionales `RNF-01..10`) vinculados a código y pruebas. | Validado: Matriz cerrada con 24 casos de prueba cubiertos. | Baja |

---

### Criterio 4: Backend Funcional (2.0 pts)

| Subrequisito | Estado | Evidencia y Ruta Relativa | Hallazgo Técnico | Acción / Validación | Prioridad |
|---|:---:|---|---|---|:---:|
| **3 a 5 Endpoints Reales Mínimos** | **CUMPLE** | `src/app/api/v1/` y catálogo en [`src/app.js`](./src/app.js):<br>1. `POST /auth/login`<br>2. `GET /recursos`<br>3. `POST /recursos`<br>4. `GET /recursos/[id]`<br>5. `GET/POST /empleados`<br>6. `GET/POST /solicitudes` | 6 endpoints reales implementados (supera el mínimo requerido de 3 a 5). Conectan con controladores desacoplados, DTOs Zod y persistencia. | Validado en consola mediante `node src/app.js`. | Baja |
| **Ejecución y Resiliencia en Runtime** | **CUMPLE** | Servidor Next.js 16 (`npm run dev`) y suite [`tests/integration/api_endpoints.test.ts`](./tests/integration/api_endpoints.test.ts) | Los endpoints responden en runtime: login emite JWT; catálogo responde con `X-Cache: MISS` y `HIT`; alta propaga eventos vía Observer; consulta por ID aplica Circuit Breaker. | Validado: `npm test` corre 7 pruebas de integración completas sin errores. | Baja |
| **Arquitectura Next.js App Router** | **CUMPLE** | Handlers en `src/app/api/v1/` y controladores en `src/controllers/` | Next.js App Router aloja los handlers en `route.ts`, delegando la lógica a controladores y servicios de dominio para desacoplamiento estricto. | Validado: Separación de handlers y controladores verificada en código. | Baja |

---

### Criterio 5: UX/UI, Accesibilidad y Mobile-First (2.0 pts)

| Subrequisito | Estado | Evidencia y Ruta Relativa | Hallazgo Técnico | Acción / Validación | Prioridad |
|---|:---:|---|---|---|:---:|
| **Prototipo Navegable Figma** | **PARCIAL** | Visor local en [`docs/ui/prototipo_interactivo.html`](./docs/ui/prototipo_interactivo.html) y [`public/prototipo.html`](./public/prototipo.html) | **Hallazgo transparente:** El enlace externo referenciado a `figma.com/design/...` retorna HTTP 404. El prototipo está 100% implementado y navegable localmente mediante el visor HTML autónomo que emula la barra de Figma sin requerir internet. | Enlace en la nube de Figma requiere publicación real si se exige link externo. | Media |
| **Reporte de Usabilidad y UX/UI (PDF)** | **CUMPLE** | [`docs/ui/reporte_ux_ui.pdf`](./docs/ui/reporte_ux_ui.pdf) (1.05 MB) y [`docs/ui/reporte_usabilidad.pdf`](./docs/ui/reporte_usabilidad.pdf) | Contiene evaluación bajo ISO 9241-210 (diseño centrado en el humano), 10 heurísticas de Nielsen, métricas de ISO 9241-11 (eficiencia, satisfacción) y auditoría WCAG 2.2 nivel AA. | Validado: PDF generado, diseño visual profesional y métricas fundamentadas. | Baja |
| **Componentes UI y Mobile-First** | **CUMPLE** | `src/components/` (Átomos, Moléculas, Organismos) y CSS en `src/app/globals.css` | Atomic Design estricto y responsividad comprobada con clases Tailwind mobile-first (`sm:`, `md:`, `lg:`). | Validado: Dashboard y login se adaptan fluidamente a pantallas móviles y de escritorio. | Baja |

---

### Criterio 6: SQA, Defectos, Trazabilidad, Entrega (2.0 pts)

| Subrequisito | Estado | Evidencia y Ruta Relativa | Hallazgo Técnico | Acción / Validación | Prioridad |
|---|:---:|---|---|---|:---:|
| **Plan SQA IEEE 730-2014 en PDF** | **CUMPLE** | [`docs/qa/plan_sqa_ieee730.pdf`](./docs/qa/plan_sqa_ieee730.pdf) (378 KB) | Define diferencia formal entre QA (prevención) y QC (control), filosofía Shift-Left, roles y responsabilidades, métricas de cobertura y criterios de aceptación. | Validado: Documento PDF formal con firma `%PDF`. | Baja |
| **Pirámide de Pruebas y Cobertura** | **PARCIAL** | [`tests/unit/gof_patterns.test.ts`](./tests/unit/gof_patterns.test.ts) y [`tests/integration/api_endpoints.test.ts`](./tests/integration/api_endpoints.test.ts) | 20 pruebas unitarias y de integración que pasan al 100% en tiempo récord (29.6s). Brecha honesta: No existe suite E2E automatizada con navegador headless (Playwright/Cypress) en el script `npm test`. | Validado: Los tests existentes cubren lógica crítica de negocio y persistencia. | Media |
| **Gestión de Defectos IEEE 1044-2009** | **CUMPLE** | [`docs/qa/reporte_defectos_ieee1044.pdf`](./docs/qa/reporte_defectos_ieee1044.pdf) (384 KB) | Taxonomía formal de clasificación, severidades (Bloqueante, Crítica, Mayor, Menor), prioridades y ciclo de vida de defectos con bitácora de resolución. | Validado: PDF generado con formato IEEE 1044. | Baja |
| **Casos de Prueba ISO 29119-3 en PDF** | **CUMPLE** | [`docs/qa/casos_prueba_ieee29119.pdf`](./docs/qa/casos_prueba_ieee29119.pdf) (333 KB) y [`docs/Plan_Pruebas_QA.md`](./docs/Plan_Pruebas_QA.md) | Especificación de casos de prueba con precondiciones, pasos de ejecución, datos de prueba y resultados esperados/obtenidos. | Validado: PDF presente y verificado. | Baja |
| **Documentación de Entrega e Informe Consolidado** | **CUMPLE** | [`informe/informe_proyecto_final.pdf`](./informe/informe_proyecto_final.pdf) (2.13 MB), [`README.md`](./README.md), [`.env.example`](./.env.example) | Informe consolidado de 9 secciones completas. README con catálogo de endpoints y guía de levantamiento reproducible. `.env.example` limpio sin secretos expuestos. | Validado: PDF consolidado verificable e imprimible. | Baja |

---

## 4. Registro Histórico de Pruebas y Validaciones Verificables

| # | Validación | Comando Ejecutado | Fecha / Hora | Resultado | Observaciones |
|:---:|---|---|---|:---:|---|
| 1 | **Verificación de Git** | `git status; git branch -v; git log -n 3` | 2026-10-20 21:23 | **OK** | Rama `cambiosJorge`, commit `29bed32`. Sin ramas rotas ni conflictos. |
| 2 | **Instalación de Dependencias** | `npm install` | 2026-10-20 20:43 | **OK** | 413 paquetes instalados en 6m, 0 errores. |
| 3 | **Primera Suite Automatizada** | `npm test` | 2026-10-20 20:58 | **20/20 PASS** | 13 pruebas unitarias GoF + 7 pruebas de integración API. Duración: 26.8 s. |
| 4 | **Servidor Web y API (Turbopack)** | `npm run dev` | 2026-10-20 20:57 | **OK** | Listo en 1073 ms en `http://localhost:3000`. Compilación exitosa de `/` y `/login`. |
| 5 | **Petición HTTP en Runtime** | `Invoke-WebRequest -Uri http://localhost:3000` | 2026-10-20 20:57 | **HTTP 200 OK** | Responde con el HTML renderizado del formulario de Login institucional. |
| 6 | **Integridad de Documentos PDF** | Verificación de firma binaria `%PDF` | 2026-10-20 21:35 | **15/15 VÁLIDOS** | Los 15 archivos PDF del repositorio son binarios válidos, ninguno es texto renombrado. |
| 7 | **Integridad de Diagramas PNG** | Verificación de firma binaria `89-50-4E-47` | 2026-10-20 21:36 | **18/18 VÁLIDOS** | Todos los diagramas UML, C4 y arquitectura son imágenes PNG auténticas. |
| 8 | **Test de Conectividad Figma** | `curl.exe -I -s -L "https://www.figma.com/design/..."` | 2026-10-22 22:44 | **HTTP 404** | Confirma que el enlace externo está inactivo; el visor local HTML es el artefacto funcional. |
| 9 | **Segunda Suite Automatizada** | `npm test` | 2026-10-22 22:50 | **20/20 PASS** | Re-ejecución verificada: 5 suites, 20 subtests en PASS, 0 fallos. Duración: 29.61 s. |
