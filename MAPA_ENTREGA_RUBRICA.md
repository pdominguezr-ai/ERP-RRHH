# Mapa de Entrega por Rúbrica — Guía Navegable de Evaluación Docente
**Sistema ERP de Gestión de Recursos Humanos y Recursos Corporativos (ERP-RRHH)**  
**Universidad Mariano Gálvez de Guatemala** | Facultad de Ingeniería en Sistemas de Información  
**Curso:** Análisis de Sistemas II | **Entrega de Proyecto Final**  
**Integrantes:** Paul Dominguez (`9989-23-9308`) · Jorge Morataya (`9989-23-340`) · Britany Yamileth Meza Chinchilla (`9989-23-3181`)  
**Fecha de Entrega:** Octubre 2026 | **Repositorio:** [https://github.com/pdominguezr-ai/ERP-RRHH](https://github.com/pdominguezr-ai/ERP-RRHH)  

---

## 📌 Índice del Documento Principal Consolidado (PDF de 9 Secciones)
El documento maestro oficial se encuentra en la ruta:  
👉 [`informe/informe_proyecto_final.pdf`](./informe/informe_proyecto_final.pdf) *(2.13 MB, Maquetado e Imprimible)*  
*(Copia de respaldo en [`docs/Informe_Proyecto_Final_GrupoXX.pdf`](./docs/Informe_Proyecto_Final_GrupoXX.pdf))*

| N° Sección | Título de la Sección en el PDF | Páginas | Contenido y Artefactos Incluidos |
|:---:|---|:---:|---|
| **0** | **Portada Oficial UMG** | Pág. 1 | Datos institucionales, logotipo, título del proyecto, integrantes, carnés y cátedra. |
| **1** | **Introducción y Resumen Ejecutivo** | Págs. 2-3 | Contexto organizacional, objetivos estratégicos y matriz metodológica de 10 pasos. |
| **2** | **Requerimientos, Modelado UML 2.5.1 y Gestión Ágil** | Págs. 4-8 | SRS ISO 29148 (12 REQ-FN + 6 REQ-NF), UML 2.5.1 (Clases, Secuencia, Actividades, Paquetes), Backlog 3C e INVEST. |
| **3** | **Evaluación Arquitectónica, C4 y Persistencia Políglota** | Págs. 9-14 | Escenarios ISO 25010, ADRs ISO 42010, C4 Niveles 1-4, Persistencia Políglota y Patrones GoF probados. |
| **4** | **Diseño de APIs, Implementación Funcional y BDD** | Págs. 15-19 | Contrato OpenAPI 3.0.3, errores RFC 9457, BDD ISO 29119-3 y catálogo de endpoints Next.js. |
| **5** | **Experiencia de Usuario (UX/UI) y Mobile-First** | Págs. 20-23 | Reporte ISO 9241-210, 10 Heurísticas de Nielsen, accesibilidad WCAG 2.2 AA y Prototipo interactivo. |
| **6** | **Estrategia de Calidad y Plan SQA** | Págs. 24-27 | Plan SQA IEEE 730 (Shift-Left), clasificación de defectos IEEE 1044 y pirámide de pruebas. |
| **7** | **Matriz de Trazabilidad Integral (RTM)** | Págs. 28-30 | Mapeo bidireccional de 24 requerimientos: `RF/RNF ➔ HU ➔ C4 ➔ API ➔ Código ➔ BDD ➔ Test`. |
| **8** | **Conclusiones y Lecciones Aprendidas** | Pág. 31 | Valoración de la arquitectura híbrida, resiliencia GoF y conclusiones de ingeniería. |
| **9** | **Referencias Bibliográficas** | Pág. 32 | Citas formales de normas ISO, IEEE, OMG, RFCs IETF y literatura técnica especializada. |

---

## 🏛️ Matriz General de Entrega y Evidencias por Criterio de Evaluación

> [!NOTE]
> Todos los enlaces de la siguiente tabla son **rutas relativas compatibles con el explorador web de GitHub** y repositorios locales.

| Criterio / subrequisito | Puntos del criterio | Estado | Evidencia y enlace relativo | Ubicacion exacta (archivo/seccion/linea) | Validacion | Pendiente |
|---|---:|:---:|---|---|---|---|
| **1.1 SRS Formal ISO/IEC/IEEE 29148:2018** | 0.25 | **CUMPLE** | [`docs/requirements/srs_ieee_29148.pdf`](./docs/requirements/srs_ieee_29148.pdf) | Todo el archivo / Sec. 2 (`REQ-FN-001` a `REQ-FN-012`) y Sec. 3 (`REQ-NF-001` a `REQ-NF-006`) | Binario `%PDF` verificado (991 KB). Estructura formal sujeto + verbo modal "DEBE". Total: 18 requerimientos normativos. | Ninguno |
| **1.2 Diagramación UML 2.5.1 (Clases, Secuencia, Actividades, Paquetes)** | 0.25 | **CUMPLE** | [`docs/uml/`](./docs/uml/):<br>- [`clases.png`](./docs/uml/clases.png) y [`.puml`](./docs/uml/clases.puml)<br>- [`secuencia.png`](./docs/uml/secuencia.png) y [`.puml`](./docs/uml/secuencia.puml)<br>- [`actividades.png`](./docs/uml/actividades.png) y [`.puml`](./docs/uml/actividades.puml)<br>- [`paquetes.png`](./docs/uml/paquetes.png) y [`.puml`](./docs/uml/paquetes.puml) | Carpeta [`docs/uml/`](./docs/uml/) archivos `.puml` y renderizados `.png` | Archivos PNG con firma binaria `89-50-4E-47`. Clases con cardinalidad, secuencia con traza HTTP y actividades con swimlanes. | Ninguno |
| **1.3 Fichas de Diseño de Componentes IEEE 1016-2009 (SDD)** | 0.25 | **CUMPLE** | [`docs/requirements/fichas_diseno_ieee1016.pdf`](./docs/requirements/fichas_diseno_ieee1016.pdf) | Todo el documento (551 KB) / Módulos Auth, Recursos, Nómina, Solicitudes | Formato IEEE 1016 con atributos, interfaces públicas, excepciones y dependencias verificadas. | Ninguno |
| **1.4 Gestión Ágil (Backlog 3C, INVEST, DoR, DoD, Tablero)** | 0.25 | **PARCIAL** | [`docs/agile/backlog.md`](./docs/agile/backlog.md) y [Tablero GitHub Projects](https://github.com/users/pdominguezr-ai/projects/1/views/1) | [`docs/agile/backlog.md:L8-L144`](./docs/agile/backlog.md#L8-L144) | Backlog documental 100% completo con 6 HUs en formato 3C, INVEST, DoR y DoD. El enlace a GitHub Projects requiere que el propietario cambie la visibilidad de Privada a Pública para evitar HTTP 404 al docente. | Cambiar visibilidad de GitHub Projects a Pública. |
| **2.1 Comparativa Arquitectónica y Escenarios ISO/IEC 25010** | 0.25 | **CUMPLE** | [`docs/architecture/escenarios_iso25010.pdf`](./docs/architecture/escenarios_iso25010.pdf) y [`docs/Analisis_Debilidades_Arquitectonicas.md`](./docs/Analisis_Debilidades_Arquitectonicas.md) | PDF Sec. 2 (921 KB) y Markdown Sec. 1 a 4 | Evaluación cuantitativa de latencia, mantenibilidad y escalabilidad comparando 4 estilos arquitectónicos. | Ninguno |
| **2.2 Registros de Decisión de Arquitectura (ADRs ISO 42010)** | 0.20 | **CUMPLE** | [`docs/architecture/adrs/`](./docs/architecture/adrs/):<br>- [`ADR-001`](./docs/architecture/adrs/ADR-001-estilo-arquitectonico.md)<br>- [`ADR-002`](./docs/architecture/adrs/ADR-002-persistencia-poliglota.md)<br>- [`ADR-003`](./docs/architecture/adrs/ADR-003-patrones-gof-y-resiliencia.md)<br>- [`ADR-004`](./docs/architecture/adrs/ADR-004-estandar-errores-rfc9457.md) | Archivos ADR individuales en [`docs/architecture/adrs/`](./docs/architecture/adrs/) | Cada ADR incluye Contexto, Decisión, Opciones Evaluadas, Consecuencias (positivas y riesgos) y Estado Aceptada. | Ninguno |
| **2.3 Modelo C4 Completo (Niveles 1, 2, 3 y 4)** | 0.25 | **CUMPLE** | [`docs/c4/`](./docs/c4/):<br>- [`c4_nivel1_contexto.png`](./docs/c4/c4_nivel1_contexto.png)<br>- [`c4_nivel2_contenedores.png`](./docs/c4/c4_nivel2_contenedores.png)<br>- [`c4_nivel3_componentes.png`](./docs/c4/c4_nivel3_componentes.png)<br>- [`c4_nivel4_codigo.png`](./docs/c4/c4_nivel4_codigo.png)<br>- Fuentes en [`docs/c4/src/`](./docs/c4/src/) | Carpeta [`docs/c4/`](./docs/c4/) archivos `.puml` y `.png` | Notación C4 de Simon Brown. Refleja fielmente la arquitectura Next.js, capas internas y adaptadores. | Ninguno |
| **2.4 Persistencia Políglota (PostgreSQL, Mongo, Redis TTL, Neo4j)** | 0.15 | **PARCIAL** | [`src/config/database.ts`](./src/config/database.ts), [`docs/database/modelo_poliglota.png`](./docs/database/modelo_poliglota.png), [`docs/database/scripts_ddl.sql`](./docs/database/scripts_ddl.sql) | [`src/config/database.ts:L11-L205`](./src/config/database.ts#L11-L205) | **PostgreSQL/Supabase es real y transaccional** con DDL y RLS. **Redis, MongoDB y Neo4j funcionan mediante adaptadores en memoria simulados** (`InMemoryRedisAdapter`, `InMemoryMongoAdapter`, `InMemoryNeo4jAdapter`) emulando TTL, documentos y grafos para ejecución local autónoma. No son clústeres remotos standalone. | Configuración opcional de clústeres externos NoSQL si se solicita en producción. |
| **2.5 Patrones GoF y Resiliencia (Strategy, Repo, Gateway, Observer, Circuit Breaker)** | 0.15 | **CUMPLE** | [`src/services/gofPatterns.ts`](./src/services/gofPatterns.ts) y [`tests/unit/gof_patterns.test.ts`](./tests/unit/gof_patterns.test.ts) | [`src/services/gofPatterns.ts:L1-L280`](./src/services/gofPatterns.ts#L1-L280) | `npm test` ejecuta los 8 casos unitarios `CP-U01` a `CP-U08` demostrando Circuit Breaker, Strategy de nómina, Observer y Gateway. | Ninguno |
| **3.1 Contrato API-First OpenAPI 3.0.3 Válido** | 0.40 | **CUMPLE** | [`docs/api/openapi.yaml`](./docs/api/openapi.yaml) y [`docs/api/swagger_ui.png`](./docs/api/swagger_ui.png) | [`docs/api/openapi.yaml:L1-L641`](./docs/api/openapi.yaml#L1-L641) | Sintaxis OpenAPI 3.0.3 válida. Coincide exactamente con los endpoints y DTOs de `src/app/api/v1/`. | Ninguno |
| **3.2 Colección de Pruebas Postman Executable** | 0.35 | **CUMPLE** | [`docs/api/postman_collection.json`](./docs/api/postman_collection.json) y [`test-api/coleccion_postman.json`](./test-api/coleccion_postman.json) | [`docs/api/postman_collection.json:L1-L224`](./docs/api/postman_collection.json#L1-L224) | Colección formato v2.1.0 con variables `baseUrl`, `jwtToken`, aserciones `pm.test` y verificación de cabeceras `X-Cache`. | Ninguno |
| **3.3 Semántica HTTP RFC 9110 y Formato Errores RFC 9457** | 0.40 | **CUMPLE** | [`src/middlewares/problemDetails.ts`](./src/middlewares/problemDetails.ts) y [`tests/integration/api_endpoints.test.ts`](./tests/integration/api_endpoints.test.ts) | [`src/middlewares/problemDetails.ts:L1-L90`](./src/middlewares/problemDetails.ts#L1-L90) | Probado en `CP-I02` (Error 401) y `CP-I05` (Error 400). Retorna cabecera `Content-Type: application/problem+json` con estructura formal unificada. | Ninguno |
| **3.4 Explicación Conceptual de GraphQL y gRPC** | 0.25 | **CUMPLE** | [`docs/api/openapi.yaml`](./docs/api/openapi.yaml#L11-L14) y [`docs/architecture/adrs/ADR-001-estilo-arquitectonico.md`](./docs/architecture/adrs/ADR-001-estilo-arquitectonico.md#L56) | Encabezado OpenAPI description líneas 11 a 14 | Explica federación GraphQL para evitar over-fetching y contratos gRPC (`proto3`) para nómina masiva inter-servicios, sin simular implementaciones falsas. | Ninguno |
| **3.5 Especificación BDD en Gherkin (ISO/IEC/IEEE 29119-3:2021)** | 0.35 | **CUMPLE** | [`features/autenticacion.feature`](./features/autenticacion.feature), [`features/gestion_recursos.feature`](./features/gestion_recursos.feature), [`features/gestion_principal.feature`](./features/gestion_principal.feature) | Archivos `.feature` en raíz y en [`docs/agile/features/`](./docs/agile/features/) | Escenarios estructurados con `Dado`, `Cuando`, `Entonces`, esquemas de escenario (`Scenario Outline`) y matrices `Examples`. | Ninguno |
| **3.6 Matriz de Trazabilidad Requerimientos (RTM)** | 0.25 | **CUMPLE** | [`docs/RTM_Final.md`](./docs/RTM_Final.md) y [`docs/qa/trazabilidad.pdf`](./docs/qa/trazabilidad.pdf) | [`docs/RTM_Final.md:L7-L35`](./docs/RTM_Final.md#L7-L35) | Cobertura integral de los 24 requerimientos macro del negocio (14 funcionales `RF-01..14` + 10 no funcionales `RNF-01..10`) vinculados a código y pruebas. | Ninguno |
| **4.1 Identificación de 3 a 5 Endpoints Reales Mínimos** | 0.80 | **CUMPLE** | Catálogo en [`src/app.js`](./src/app.js) y rutas en [`src/app/api/v1/`](./src/app/api/v1/):<br>1. `POST /auth/login`<br>2. `GET /recursos`<br>3. `POST /recursos`<br>4. `GET /recursos/:id`<br>5. `GET/POST /empleados`<br>6. `GET/POST /solicitudes` | [`src/app.js:L12-L55`](./src/app.js#L12-L55) y carpetas correspondientes en `src/app/api/v1/` | El sistema implementa 6 endpoints funcionales (supera el mínimo requerido de 3 a 5). Ejecutable mediante `node src/app.js`. | Ninguno |
| **4.2 Endpoints Ejecutables en Runtime con Persistencia / Caché** | 0.80 | **CUMPLE** | Servidor Next.js 16 (`npm run dev`) y suite [`tests/integration/api_endpoints.test.ts`](./tests/integration/api_endpoints.test.ts) | [`tests/integration/api_endpoints.test.ts:L12-L135`](./tests/integration/api_endpoints.test.ts#L12-L135) | 7 pruebas de integración en PASS: login con JWT, rechazo 401 RFC 9457, Cache-Aside (`X-Cache: MISS` ➔ `HIT`), e invalidación de caché tras inserción. | Ninguno |
| **4.3 Arquitectura Next.js App Router vs Controllers** | 0.40 | **CUMPLE** | Handlers en [`src/app/api/v1/`](./src/app/api/v1/) delegando a [`src/controllers/`](./src/controllers/) | Comparar [`src/app/api/v1/auth/login/route.ts`](./src/app/api/v1/auth/login/route.ts) con [`src/controllers/AuthController.ts`](./src/controllers/AuthController.ts) | Documentado formalmente en README y C4: separación limpia de responsabilidades (Route Handler HTTP ➔ Controlador ➔ Servicio). | Ninguno |
| **5.1 Prototipo Navegable en Figma y Visor Autónomo** | 0.70 | **PARCIAL** | Visor local en [`docs/ui/prototipo_interactivo.html`](./docs/ui/prototipo_interactivo.html) y [`public/prototipo.html`](./public/prototipo.html) | Abrir [`docs/ui/prototipo_interactivo.html`](./docs/ui/prototipo_interactivo.html) en el navegador | **Hallazgo transparente:** El enlace externo referenciado a `figma.com/design/...` retorna HTTP 404. El prototipo está 100% implementado y navegable localmente mediante el visor HTML autónomo que emula la barra de Figma sin requerir internet. | Enlace en la nube de Figma requiere publicación real si se exige link externo. |
| **5.2 Reporte UX/UI, Heurísticas Nielsen y Accesibilidad WCAG 2.2** | 0.70 | **CUMPLE** | [`docs/ui/reporte_ux_ui.pdf`](./docs/ui/reporte_ux_ui.pdf) (1.05 MB) y [`docs/ui/reporte_usabilidad.pdf`](./docs/ui/reporte_usabilidad.pdf) | PDF completo / Secciones de Heurísticas Nielsen, ISO 9241-11 y WCAG 2.2 AA | Análisis de contraste de color (ratio ≥ 4.5:1), navegación por teclado y diseño centrado en el humano (ISO 9241-210). | Ninguno |
| **5.3 Código Mobile-First y Componentes Atomic Design** | 0.60 | **CUMPLE** | [`src/components/`](./src/components/) (Átomos, Moléculas, Organismos) y CSS en [`src/app/globals.css`](./src/app/globals.css) | Carpetas `src/components/forms/`, `src/components/ui/`, `src/components/layout/` | Estructura atómica comprobada. Breakpoints Tailwind mobile-first aplicados en todas las pantallas. | Ninguno |
| **6.1 Plan SQA IEEE 730-2014 en PDF** | 0.40 | **CUMPLE** | [`docs/qa/plan_sqa_ieee730.pdf`](./docs/qa/plan_sqa_ieee730.pdf) (378 KB) | Todo el archivo PDF / Secciones de Aseguramiento de Calidad Shift-Left | Diferencia formal entre QA (prevención) y QC (control), roles, responsabilidades y métricas de calidad. | Ninguno |
| **6.2 Pirámide de Pruebas Automatizadas con Evidencias** | 0.40 | **PARCIAL** | [`tests/unit/gof_patterns.test.ts`](./tests/unit/gof_patterns.test.ts) y [`tests/integration/api_endpoints.test.ts`](./tests/integration/api_endpoints.test.ts) | Ejecución reproducible mediante comando `npm test` | **20 de 20 pruebas en PASS** (re-ejecutado 22/10/2026, duración 29.6 s). Brecha técnica honesta: No cuenta con runner headless E2E de navegador (Playwright/Cypress). | Configurar runner Playwright en CI/CD si se exige E2E gráfico automatizado. |
| **6.3 Gestión y Clasificación de Defectos IEEE 1044-2009** | 0.40 | **CUMPLE** | [`docs/qa/reporte_defectos_ieee1044.pdf`](./docs/qa/reporte_defectos_ieee1044.pdf) (384 KB) | Todo el archivo PDF / Taxonomía y Matriz de Defectos | Clasificación formal por severidad, prioridad, tipo y estado del ciclo de vida del defecto. | Ninguno |
| **6.4 Casos de Prueba Formales ISO/IEC/IEEE 29119-3:2021** | 0.40 | **CUMPLE** | [`docs/qa/casos_prueba_ieee29119.pdf`](./docs/qa/casos_prueba_ieee29119.pdf) (333 KB) y [`docs/Plan_Pruebas_QA.md`](./docs/Plan_Pruebas_QA.md) | Archivos PDF y Markdown de pruebas | 24 casos de prueba detallados (`CP-01` a `CP-24`) con precondiciones, pasos y datos de prueba. | Ninguno |
| **6.5 Repositorio Reproducible, .env Seguro e Informe Consolidado** | 0.40 | **CUMPLE** | [`README.md`](./README.md), [`.env.example`](./.env.example) e [`informe/informe_proyecto_final.pdf`](./informe/informe_proyecto_final.pdf) | Raíz del proyecto y carpeta `informe/` | `.env.example` limpio sin secretos expuestos. README reproducible paso a paso. PDF consolidado de 2.13 MB verificado. | Ninguno |

---

## 🎓 GUÍA PARA DEFENDER LA ENTREGA ANTE EL DOCENTE

Para realizar una defensa técnica impecable ante la cátedra de Análisis de Sistemas II, se recomienda seguir estrictamente este **orden secuencial de demostración en vivo (duración sugerida: 10 a 15 minutos)**:

### Paso 1: Apertura y Presentación del Informe Consolidado PDF (2 min)
1. Abrir directamente el archivo oficial [`informe/informe_proyecto_final.pdf`](./informe/informe_proyecto_final.pdf).
2. Mostrar la **Portada Oficial** con los datos de los 3 integrantes del grupo.
3. Explicar brevemente la **Sección 1 (Metodología de 10 pasos y estándares internacionales aplicados)** para evidenciar el rigor formal del proyecto.

### Paso 2: Demostración de Artefactos de Ingeniería (Requerimientos, UML y C4) (3 min)
1. Mostrar el **SRS ISO 29148** en [`docs/requirements/srs_ieee_29148.pdf`](./docs/requirements/srs_ieee_29148.pdf) resaltando la redacción formal de los 12 requerimientos funcionales y 6 no funcionales.
2. Abrir los diagramas UML en [`docs/uml/`](./docs/uml/):
   - Diagrama de Clases: [`docs/uml/clases.png`](./docs/uml/clases.png) mostrando cardinalidades, agregaciones e interfaces Strategy y Observer.
   - Diagrama de Secuencia: [`docs/uml/secuencia.png`](./docs/uml/secuencia.png) mostrando la traza de consulta protegida por Cache-Aside e invalidación.
3. Abrir el **Modelo C4** en [`docs/c4/`](./docs/c4/):
   - Nivel 1 Contexto: [`c4_nivel1_contexto.png`](./docs/c4/c4_nivel1_contexto.png)
   - Nivel 2 Contenedores: [`c4_nivel2_contenedores.png`](./docs/c4/c4_nivel2_contenedores.png)
   - Nivel 3 Componentes: [`c4_nivel3_componentes.png`](./docs/c4/c4_nivel3_componentes.png)
   - Nivel 4 Código: [`c4_nivel4_codigo.png`](./docs/c4/c4_nivel4_codigo.png)
4. Mostrar un **ADR (Registro de Decisión de Arquitectura)** en [`docs/architecture/adrs/ADR-001-estilo-arquitectonico.md`](./docs/architecture/adrs/ADR-001-estilo-arquitectonico.md) bajo la norma ISO 42010.

### Paso 3: Ejecución en Vivo de la Suite de Pruebas Automatizadas (2 min)
En la terminal del proyecto, ejecutar el comando oficial:
```powershell
npm test
```
**Lo que el docente observará en pantalla:**
* Ejecución de las **20 pruebas automatizadas** en < 30 segundos sin fallos (`pass 20, fail 0`).
* **13 pruebas unitarias GoF:**
  - Patrón Strategy para cálculo de nómina laboral (IGSS 4.83%, retención ISR y bono Q250.00).
  - Patrón Cache-Aside sobre Redis (primera lectura produce `MISS`, segunda lectura produce `HIT`).
  - Patrón Circuit Breaker (apertura de circuito ante fallos y ejecución de Fallback).
  - Patrón Observer (propagación de eventos en `DomainEventBus`).
* **7 pruebas de integración de endpoints:**
  - Login exitoso con emisión de JWT.
  - Rechazo 401 bajo estándar **RFC 9457 (`application/problem+json`)**.
  - Catálogo de recursos con cabeceras `X-Cache: MISS/HIT`.

### Paso 4: Demostración del Servidor Funcional y Endpoints API (4 min)
1. Iniciar el servidor Next.js en la terminal:
   ```powershell
   npm run dev
   ```
2. Abrir en el navegador: **`http://localhost:3000`**
3. Iniciar sesión en el portal utilizando las credenciales institucionales:
   - **Correo:** `admin.rrhh@empresa.com`
   - **Contraseña:** `Password123!`
4. Navegar por el Dashboard:
   - Módulo de **Empleados**: Visualizar catálogo paginado y filtros.
   - Módulo de **Nómina**: Demostrar el cálculo de desglose laboral según régimen.
   - Módulo de **Solicitudes**: Registrar una solicitud de vacaciones y ver su resolución.
5. *(Opcional)* Mostrar el catálogo de endpoints en consola:
   ```powershell
   node src/app.js
   ```

### Paso 5: Evidencias de UX/UI, Prototipo y Aseguramiento de Calidad (SQA) (3 min)
1. Abrir el visor interactivo en el navegador:
   - Archivo local: [`docs/ui/prototipo_interactivo.html`](./docs/ui/prototipo_interactivo.html)
   - Explicar al docente que se construyó un visor web autónomo navegable que emula la interfaz de Figma para garantizar disponibilidad offline sin depender de la red del campus.
2. Abrir el **Reporte UX/UI** en [`docs/ui/reporte_ux_ui.pdf`](./docs/ui/reporte_ux_ui.pdf) y mostrar la evaluación con las 10 Heurísticas de Nielsen y criterios WCAG 2.2 nivel AA.
3. Abrir el **Plan SQA IEEE 730** en [`docs/qa/plan_sqa_ieee730.pdf`](./docs/qa/plan_sqa_ieee730.pdf) y el **Reporte de Defectos IEEE 1044** en [`docs/qa/reporte_defectos_ieee1044.pdf`](./docs/qa/reporte_defectos_ieee1044.pdf).
4. Cerrar con la **Matriz de Trazabilidad (RTM)** en [`docs/RTM_Final.md`](./docs/RTM_Final.md), demostrando que cada requerimiento del curso tiene su historia ágil, contrato OpenAPI, código y caso de prueba.
