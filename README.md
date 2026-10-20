# Sistema ERP de Gestión de Recursos Humanos y Recursos Corporativos (ERP-RRHH)

**Universidad Mariano Gálvez de Guatemala**  
**Facultad de Ingeniería en Sistemas de Información y Ciencias de la Computación**  
**Curso:** Análisis de Sistemas II — **Entrega de Proyecto Final**

### 👥 Integrantes
* **Paul Dominguez** — Carné: `9989-23-9308`
* **Jorge Morataya** — Carné: `9989-23-340`
* **Britany Yamileth Meza Chinchilla** — Carné: `9989-23-3181`

---

## 🌐 Enlaces Rápidos a Plataformas Externas y Entregables Principales

| Recurso / Plataforma | Enlace Directo / Ruta en Repositorio | Estándar Aplicado |
|---|---|---|
| **📄 Informe Consolidado de Proyecto Final (PDF)** | [`informe/informe_proyecto_final.pdf`](file:///informe/informe_proyecto_final.pdf) / [`docs/Informe_Proyecto_Final_GrupoXX.pdf`](file:///docs/Informe_Proyecto_Final_GrupoXX.pdf) | Compendio General (Secciones 1 a 9) |
| **📋 Tablero Ágil Activo (GitHub Projects / Jira)** | [https://github.com/users/pdominguezr-ai/projects/1/views/1](https://github.com/users/pdominguezr-ai/projects/1/views/1) | Scrum / Kanban, 3C, INVEST, DoR/DoD |
| **🎨 Prototipo Interactivo Navegable (Web / Figma Viewer)** | [Abrir Prototipo Interactivo Navegable Online](https://htmlpreview.github.io/?https://github.com/pdominguezr-ai/ERP-RRHH/blob/main/docs/ui/prototipo_interactivo.html) · Local: [`docs/ui/prototipo_interactivo.html`](file:///docs/ui/prototipo_interactivo.html) | ISO 9241-210, WCAG 2.2 AA, Atomic Design |

---

## 🏛️ Matriz de Estándares Internacionales Aplicados y Ubicación en el Repositorio

| Componente | Artefacto / Elemento | Estándar Internacional Aplicado | Formato | Ubicación Exacta en Repositorio |
|---|---|---|---|---|
| **Comp. 1** | Especificación de Requerimientos (SRS) | **ISO/IEC/IEEE 29148:2018** | PDF | [`docs/requirements/srs_ieee_29148.pdf`](file:///docs/requirements/srs_ieee_29148.pdf) |
| **Comp. 1** | Fichas de Diseño de Componentes (SDD) | **IEEE 1016-2009** | PDF | [`docs/requirements/fichas_diseno_ieee1016.pdf`](file:///docs/requirements/fichas_diseno_ieee1016.pdf) |
| **Comp. 1** | Diagramación Visual UML (Clases, Secuencia, Actividades Swimlanes, Paquetes) | **UML 2.5.1 (OMG)** | `.puml` + `.png` | [`docs/uml/`](file:///docs/uml/) (`clases`, `secuencia`, `actividades`, `paquetes`) |
| **Comp. 1** | Gestión Ágil (PO, 3C, INVEST, DoR/DoD) | **Scrum / Kanban / INVEST** | Markdown | [`docs/agile/backlog.md`](file:///docs/agile/backlog.md) |
| **Comp. 2** | Evaluación Arquitectónica y Escenarios | **ISO/IEC 25010:2011** | PDF | [`docs/architecture/escenarios_iso25010.pdf`](file:///docs/architecture/escenarios_iso25010.pdf) |
| **Comp. 2** | Registros de Decisiones de Arquitectura | **ISO/IEC/IEEE 42010:2011** | Markdown | [`docs/architecture/adrs/`](file:///docs/architecture/adrs/) (`ADR-001` a `ADR-004`) |
| **Comp. 2** | Modelo C4 Completo (Niveles 1, 2, 3 y 4) | **Notación C4 (Simon Brown)** | `.puml` + `.png` | [`docs/c4/`](file:///docs/c4/) (`c4_nivel1..4.png` + `src/`) |
| **Comp. 2** | Persistencia Políglota (PostgreSQL, MongoDB, Redis Cache-Aside TTL, Neo4j) | **Polyglot Persistence & Cache-Aside** | `.png` + `.sql` | [`docs/database/modelo_poliglota.png`](file:///docs/database/modelo_poliglota.png) y [`docs/database/scripts_ddl.sql`](file:///docs/database/scripts_ddl.sql) |
| **Comp. 2** | Patrones de Diseño GoF y Resiliencia | **GoF (Strategy, Repository, Gateway, Observer, Circuit Breaker)** | TypeScript | [`src/services/gofPatterns.ts`](file:///src/services/gofPatterns.ts) y [`src/models/`](file:///src/models/) |
| **Comp. 3** | Contrato API-First y Errores Unificados | **OpenAPI 3.0.3 / RFC 9110 / RFC 9457** | YAML + JSON | [`docs/api/openapi.yaml`](file:///docs/api/openapi.yaml) y [`docs/api/postman_collection.json`](file:///docs/api/postman_collection.json) |
| **Comp. 3** | Especificación BDD y Pruebas de Aceptación | **ISO/IEC/IEEE 29119-3:2021** | `.feature` + PDF | [`features/`](file:///features/) y [`docs/qa/casos_prueba_ieee29119.pdf`](file:///docs/qa/casos_prueba_ieee29119.pdf) |
| **Comp. 4** | Reporte de Diseño UX/UI, Heurísticas y Accesibilidad | **ISO 9241-210 / ISO 9241-11 / WCAG 2.2 AA** | PDF + Figma | [`docs/ui/reporte_ux_ui.pdf`](file:///docs/ui/reporte_ux_ui.pdf) |
| **Comp. 4** | Plan de Aseguramiento de Calidad (SQA) | **IEEE 730-2014 (Shift-Left)** | PDF | [`docs/qa/plan_sqa_ieee730.pdf`](file:///docs/qa/plan_sqa_ieee730.pdf) |
| **Comp. 4** | Gestión y Clasificación de Defectos | **IEEE 1044-2009** | PDF | [`docs/qa/reporte_defectos_ieee1044.pdf`](file:///docs/qa/reporte_defectos_ieee1044.pdf) |
| **Comp. 4** | Matriz de Trazabilidad Integral | **RTM Bidireccional** | PDF | [`docs/qa/trazabilidad.pdf`](file:///docs/qa/trazabilidad.pdf) |

---

## 🚀 Catálogo de Endpoints Funcionales Desarrollados (`src/`)

| Método HTTP | Endpoint API | Descripción Funcional | Persistencia Políglota / Caché | Estándar de Error | Estado |
|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Autenticación institucional y generación de Token JWT | PostgreSQL + Redis (TTL 3600s) + MongoDB Audit | RFC 9457 (`application/problem+json`) | ✅ Funcional |
| `GET` | `/api/v1/recursos` | Consulta de catálogo paginado y filtrado con patrón **Cache-Aside** (`X-Cache: HIT/MISS`) | Redis (TTL 300s) + MongoDB + PostgreSQL | RFC 9457 (`application/problem+json`) | ✅ Funcional |
| `POST` | `/api/v1/recursos` | Registro transaccional de nuevo elemento y sincronización vía patrón **Observer** | PostgreSQL (ACID) + Neo4j (Grafo) + MongoDB | RFC 9457 (`application/problem+json`) | ✅ Funcional |
| `GET` | `/api/v1/recursos/:id` | Detalle integral de elemento por ID protegido con **Circuit Breaker** | Redis (TTL 600s) + PostgreSQL + Neo4j | RFC 9457 (`application/problem+json`) | ✅ Funcional |
| `GET / POST` | `/api/v1/empleados` | Gestión de expedientes de colaboradores con validación DTO Zod | PostgreSQL + Redis + MongoDB | RFC 9457 (`application/problem+json`) | ✅ Funcional |
| `GET / POST` | `/api/v1/solicitudes` | Registro y consulta de solicitudes de ausencia y vacaciones | PostgreSQL + MongoDB Audit | RFC 9457 (`application/problem+json`) | ✅ Funcional |

---

## 🛠️ Guía de Instalación, Ejecución Local y Pruebas Automatizadas

### 1. Clonar e instalar dependencias
```bash
git clone <url-del-repositorio>
cd gestion-rrhh
npm install
cp .env.example .env.local
```

### 2. Ejecutar Pruebas Automatizadas (Unitarias GoF + Integración de Endpoints RFC 9457 & Cache-Aside)
```bash
npm test
```

### 3. Levantar Servidor de Desarrollo (Frontend + API RESTful)
```bash
npm run dev
# Servidor activo en http://localhost:3000
# Punto de entrada informativo CLI: node src/app.js
```

### 4. Regenerar Diagramas UML/C4 y Documentos PDF (Opcional)
```bash
node generate_all_diagrams.js
node generate_pdfs.js
```

---

## 📂 Estructura Completa del Repositorio de Entrega

```text
gestion-rrhh/
├── README.md                                 # Guía de ejecución local, endpoints y matriz de enlaces
├── package.json                              # Dependencias y scripts ejecutables (dev, build, test)
├── .env.example                              # Variables de entorno políglotas (PG, Mongo, Redis, Neo4j)
├── informe/
│   └── informe_proyecto_final.pdf            # PDF Principal Consolidado de la Entrega Final
├── src/                                      # CÓDIGO FUENTE BACKEND Y FRONTEND FUNCIONAL
│   ├── config/
│   │   └── database.ts                       # Conectores PostgreSQL, MongoDB, Redis (TTL) y Neo4j
│   ├── controllers/
│   │   ├── AuthController.ts                 # Controlador POST /api/v1/auth/login
│   │   ├── RecursoController.ts              # Controlador GET/POST /api/v1/recursos y GET /:id
│   │   └── EmpleadoController.ts             # Controlador GET/POST /api/v1/empleados
│   ├── services/
│   │   └── gofPatterns.ts                    # Strategy, Observer, Gateway, Circuit Breaker, Cache-Aside
│   ├── models/
│   │   ├── RecursoModel.ts                   # Repositorio Políglota de Recursos
│   │   └── EmpleadoModel.ts                  # Repositorio Políglota de Colaboradores
│   ├── middlewares/
│   │   └── problemDetails.ts                 # Estandarización de errores RFC 9110 y RFC 9457
│   ├── app/api/v1/                           # Rutas HTTP ejecutables (auth, recursos, empleados, solicitudes)
│   └── app.js                                # Punto de entrada y catálogo de endpoints
├── features/                                 # Especificaciones BDD en Gherkin (ISO 29119-3)
│   ├── autenticacion.feature
│   ├── gestion_recursos.feature
│   └── gestion_principal.feature
├── tests/                                    # Pruebas automatizadas ejecutables (npm test)
│   ├── unit/
│   │   └── gof_patterns.test.ts
│   └── integration/
│       └── api_endpoints.test.ts
└── docs/
    ├── Informe_Proyecto_Final_GrupoXX.pdf    # Copia oficial del PDF consolidado de entrega
    ├── requirements/
    │   ├── srs_ieee_29148.pdf                # Especificación SRS según ISO/IEC/IEEE 29148:2018
    │   └── fichas_diseno_ieee1016.pdf        # Fichas SDD bajo IEEE 1016-2009
    ├── uml/
    │   ├── clases.puml / clases.png
    │   ├── secuencia.puml / secuencia.png
    │   ├── actividades.puml / actividades.png
    │   └── paquetes.puml / paquetes.png
    ├── agile/
    │   └── backlog.md                        # Rol PO, 3C, INVEST, DoR/DoD y enlace al tablero
    ├── architecture/
    │   ├── adrs/
    │   │   ├── ADR-001-estilo-arquitectonico.md
    │   │   ├── ADR-002-persistencia-poliglota.md
    │   │   ├── ADR-003-patrones-gof-y-resiliencia.md
    │   │   └── ADR-004-estandar-errores-rfc9457.md
    │   └── escenarios_iso25010.pdf           # Evaluación de estilos y escenarios ISO/IEC 25010
    ├── c4/
    │   ├── c4_nivel1_contexto.png
    │   ├── c4_nivel2_contenedores.png
    │   ├── c4_nivel3_componentes.png
    │   ├── c4_nivel4_codigo.png
    │   └── src/                              # Código fuente PlantUML de los 4 niveles C4
    ├── database/
    │   ├── modelo_poliglota.png              # Arquitectura PostgreSQL + Mongo + Redis + Neo4j
    │   └── scripts_ddl.sql                   # Scripts DDL e inicialización políglota
    ├── api/
    │   ├── openapi.yaml                      # Contrato OpenAPI 3.0.3 con errores RFC 9457
    │   └── postman_collection.json           # Colección Postman ejecutable
    ├── ui/
    │   └── reporte_ux_ui.pdf                 # Journey Maps, Heurísticas, WCAG 2.2, Atomic Design
    └── qa/
        ├── plan_sqa_ieee730.pdf              # Plan SQA bajo IEEE 730-2014 y Shift-Left
        ├── casos_prueba_ieee29119.pdf        # Casos de prueba ISO/IEC/IEEE 29119-3:2021
        ├── reporte_defectos_ieee1044.pdf     # Flujo y registro de defectos IEEE 1044-2009
        └── trazabilidad.pdf                  # Matriz de Trazabilidad Integral
```
