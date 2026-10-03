# PORTADA

---

**Universidad Mariano Gálvez de Guatemala**

**Facultad de Ingeniería en Sistemas de Información**

**Curso:** Análisis de Sistemas II

**Proyecto:** Sistema ERP de Gestión de Recursos Humanos (`gestion-rrhh`)

---

## Análisis, Rediseño Arquitectónico y Contrato API

---

**Integrantes:**

| No. | Nombre Completo | Carné |
|-----|----------------|-------|
| 1   | [Nombre del Integrante 1] | [Carné] |
| 2   | [Nombre del Integrante 2] | [Carné] |
| 3   | [Nombre del Integrante 3] | [Carné] |

**Grupo:** [GrupoXX]

**Docente:** [Nombre del Docente]

**Fecha:** Septiembre 2026

---

\newpage

# TABLA DE CONTENIDOS

1. [Introducción](#1-introducción)
2. [Contexto del Sistema Legado](#2-contexto-del-sistema-legado)
3. [Ingeniería Inversa del Sistema Actual](#3-ingeniería-inversa-del-sistema-actual)
4. [Análisis de Alternativas Arquitectónicas](#4-análisis-de-alternativas-arquitectónicas)
5. [Contrato API – OpenAPI 3.0](#5-contrato-api--openapi-30)
6. [Diseño de Arquitectura C4](#6-diseño-de-arquitectura-c4)
7. [Diseño de Persistencia de Datos](#7-diseño-de-persistencia-de-datos)
8. [Script de Base de Datos](#8-script-de-base-de-datos)
9. [Estrategia de Caché](#9-estrategia-de-caché)
10. [Matriz de Trazabilidad](#10-matriz-de-trazabilidad)
11. [Validación de la Solución](#11-validación-de-la-solución)
12. [Conclusiones](#12-conclusiones)
13. [Referencias](#13-referencias)
14. [Anexos](#anexos)

---

\newpage

# 1. INTRODUCCIÓN

## ¿Qué sistema se analiza?

El presente documento analiza el **Sistema ERP de Gestión de Recursos Humanos** (`gestion-rrhh`), una plataforma web *Full Stack* desarrollada como proyecto académico para la administración integral del ciclo de vida del colaborador dentro de una organización. El sistema abarca desde la contratación y el reclutamiento de personal hasta la gestión de nóminas, control de asistencia, evaluaciones de desempeño, beneficios y cumplimiento laboral.

## ¿Cuál es el propósito del proyecto?

El propósito de este proyecto es aplicar los principios de **Ingeniería Inversa** sobre la arquitectura de software del sistema existente, identificar sus debilidades de diseño y proponer un **Rediseño Arquitectónico** que eleve la calidad del producto en términos de escalabilidad, mantenibilidad, disponibilidad y seguridad. Adicionalmente, se diseña y documenta un **Contrato API REST** formal bajo el estándar OpenAPI 3.0 que exponga las operaciones de negocio del sistema como servicios consumibles.

## ¿Qué problema se pretende resolver?

El sistema actual, si bien es funcionalmente completo con 11 módulos operativos, presenta debilidades arquitectónicas críticas propias de un desarrollo monolítico acoplado:

- **Ausencia de transaccionalidad atómica** (ACID) en operaciones de negocio complejas.
- **Acoplamiento directo** de la lógica de negocio con el SDK del proveedor de base de datos (Supabase).
- **Cuellos de botella de rendimiento** por procesamiento N+1 en bucles.
- **Acoplamiento inter-servicios** sin capa de mediación.
- **Manejo deficiente de errores** y generación insegura de identificadores.

## ¿Qué se propone mediante el rediseño?

Se propone una migración controlada hacia una arquitectura de **Monolito Modular**, que mantiene las ventajas del despliegue unificado pero introduce separación clara de módulos (bounded contexts), una capa de abstracción de repositorios (Repository Pattern), un contrato API REST estándar y una estrategia de caché con Redis para optimización de rendimiento. Esta arquitectura permite una evolución futura gradual hacia microservicios si las necesidades de escala lo requieren.

---

\newpage

# 2. CONTEXTO DEL SISTEMA LEGADO

## 2.1 Descripción del sistema actual

**Propósito del sistema:** Administración integral de Recursos Humanos de una organización, incluyendo gestión del expediente del empleado, procesamiento de nóminas, control de asistencia, administración de solicitudes de ausencia, reclutamiento de personal, onboarding, evaluaciones de desempeño, capacitaciones, beneficios, cumplimiento laboral y auditoría de cambios.

**Usuarios principales:**

| Rol | Descripción | Permisos principales |
|-----|------------|---------------------|
| **ADMIN_RRHH** | Administrador general del departamento de RRHH | Acceso total a todos los módulos del sistema |
| **JEFE_INMEDIATO** | Supervisor directo de un equipo de empleados | Aprobar solicitudes, registrar evaluaciones, ver empleados de su equipo |
| **RECLUTADOR** | Responsable de procesos de selección de personal | Gestionar candidatos, procesos de reclutamiento y onboarding |
| **EMPLEADO** | Colaborador de la organización | Ver su perfil, crear solicitudes de ausencia, consultar asistencia y beneficios |

**Procesos de negocio involucrados:**

1. **Ciclo de Contratación:** Apertura de vacante → Recepción de candidatos → Evaluación por etapas → Selección → Alta de empleado → Onboarding.
2. **Ciclo de Nómina:** Creación de período → Generación automática de detalles por empleado activo → Ajuste de bonificaciones/deducciones → Procesamiento → Pago.
3. **Gestión de Ausencias:** Solicitud del empleado → Revisión del jefe inmediato/RRHH → Aprobación o rechazo.
4. **Evaluación de Desempeño:** Creación por el evaluador → Registro de calificaciones y metas → Finalización.
5. **Auditoría:** Registro automático de todas las mutaciones (INSERT, UPDATE, DELETE) en tablas críticas.

**Tipo de arquitectura actual:** Monolito Web acoplado basado en Server-Side Rendering (SSR) con Server Actions de Next.js como capa de controladores y Supabase como Backend-as-a-Service (BaaS).

**Principales funcionalidades (11 módulos):**

- ✅ Autenticación con Supabase Auth y control de roles (RBAC)
- ✅ CRUD de Empleados con desactivación lógica
- ✅ Nómina con detalle por empleado y cálculos automáticos
- ✅ Asistencia (entrada/salida/horas trabajadas calculadas)
- ✅ Solicitudes de Ausencia (permiso, vacaciones, enfermedad)
- ✅ Reclutamiento y gestión de Candidatos
- ✅ Onboarding de nuevos empleados
- ✅ Beneficios y Capacitaciones
- ✅ Evaluaciones de Desempeño
- ✅ Reportes básicos de RRHH
- ✅ Cumplimiento Laboral

## 2.2 Tecnologías actuales

| Elemento | Tecnología | Versión |
|----------|-----------|---------|
| **Lenguaje** | TypeScript | 5.x |
| **Framework Frontend** | Next.js (App Router) | 16.2.6 |
| **Librería UI** | React | 19.2.4 |
| **Estilos** | Tailwind CSS | 4.x |
| **Base de datos** | PostgreSQL (Supabase Cloud) | 15+ |
| **Autenticación** | Supabase Auth (JWT + OAuth2) | — |
| **ORM/SDK de datos** | Supabase Client SDK (`@supabase/ssr`) | 0.10.3 |
| **Validación** | Zod | 4.4.3 |
| **Formularios** | React Hook Form + @hookform/resolvers | 7.75 / 5.2.2 |
| **Iconos** | Lucide React | 1.14.0 |
| **Infraestructura** | Supabase Cloud (PostgreSQL + Auth + Storage + RLS) | — |
| **Integraciones** | Servidor SMTP para notificaciones (planificado) | — |

## 2.3 Puntos de dolor identificados

### 2.3.1 Ausencia de Transaccionalidad Atómica (ACID)

- **Causa:** Las operaciones compuestas multi-tabla (contratación de candidatos, creación de nómina) se ejecutan como llamadas HTTP secuenciales independientes al SDK de Supabase, sin envolverlas en un bloque `BEGIN ... COMMIT / ROLLBACK` de la base de datos.
- **Consecuencia:** Si falla una operación intermedia (por ejemplo, la creación del onboarding después de crear al empleado), el sistema queda en un **estado inconsistente**: el empleado existe sin onboarding, el candidato sigue en estado `EN_PROCESO` y el proceso de reclutamiento queda `ABIERTO`.
- **Evidencia:** En `src/services/reclutamientoService.ts`, función `seleccionarCandidato()`, el propio código fuente contiene el comentario: *"Nota: preferimos no hacer rollback para no invalidar el empleado"*, reconociendo explícitamente la debilidad.

### 2.3.2 Acoplamiento Directo con el SDK de Persistencia (Vendor Lock-in)

- **Causa:** Todas las funciones de la capa de servicios (`src/services/*.ts`) importan directamente `createSupabaseServerClient` y construyen consultas con los métodos propietarios del SDK (`.from()`, `.select()`, `.eq()`, `.match()`). No existe una interfaz de abstracción (`IRepository`).
- **Consecuencia:** Es imposible realizar pruebas unitarias sin levantar un servidor Supabase real. Si se decidiera migrar a Prisma, Drizzle o cualquier otro ORM, el 100% de los 13 archivos de servicios deberían reescribirse.
- **Evidencia:** Los 13 archivos en `src/services/` contienen `import { createSupabaseServerClient } from '@/lib/supabaseServer'` como primera línea.

### 2.3.3 Cuellos de Botella de Rendimiento (N+1 Queries)

- **Causa:** Se realizan actualizaciones individuales dentro de bucles `for...of` en lugar de operaciones masivas SQL. Además, los cálculos de totales de nómina se realizan en memoria de Node.js descargando todos los registros, en vez de usar funciones de agregación `SUM()` de PostgreSQL.
- **Consecuencia:** Con 100 candidatos en un proceso, al seleccionar uno, se ejecutan 99 peticiones HTTP individuales para rechazar a los demás, causando latencia exponencial y posibles timeouts.
- **Evidencia:** En `src/services/reclutamientoService.ts`: `for (const otId of otrosIds) { await updateCandidato(otId, { estado: 'RECHAZADO' }); }`.

### 2.3.4 Acoplamiento Inter-Servicios sin Mediación

- **Causa:** Los servicios se invocan entre sí directamente de forma síncrona. El módulo de Reclutamiento controla el flujo de Empleados, Onboarding y Auditoría en un único método monolítico.
- **Consecuencia:** Violación del Principio de Responsabilidad Única (SRP). Un cambio en la firma de `onboardingService` rompe todo el flujo de contratación. Agregar acciones nuevas al contratar (enviar email de bienvenida, crear cuenta AD) requiere modificar código interno existente.
- **Evidencia:** La función `seleccionarCandidato()` en `reclutamientoService.ts` contiene lógica de 4 dominios distintos en ~115 líneas.

### 2.3.5 Manejo Deficiente de Errores y Generación Insegura de Identificadores

- **Causa:** Uso de `Math.random()` para generar códigos de empleado (`EMP-XXXX`) y bloques `catch` genéricos que retornan strings planos sin códigos de error estructurados.
- **Consecuencia:** Riesgo alto de colisión en claves únicas bajo concurrencia (solo 9000 códigos posibles). Mensajes de error genéricos que dificultan la depuración.
- **Evidencia:** `const randNum = Math.floor(1000 + Math.random() * 9000)` en `reclutamientoService.ts`.

### 2.3.6 Escalabilidad Limitada

- **Causa:** La arquitectura monolítica ejecuta toda la lógica de negocio en un único proceso Node.js. No hay separación de módulos que permita escalar componentes de forma independiente.
- **Consecuencia:** Si la nómina requiere más recursos computacionales, se debe escalar todo el sistema incluyendo módulos que no lo necesitan.

### 2.3.7 Disponibilidad Acoplada

- **Causa:** Un fallo en cualquier módulo (por ejemplo, un error en el procesamiento de nómina) puede impactar la disponibilidad del dashboard completo.
- **Consecuencia:** Un bug en un módulo secundario puede dejar todo el sistema inaccesible temporalmente.

---

\newpage

# 3. INGENIERÍA INVERSA DEL SISTEMA ACTUAL

## 3.1 Análisis de la arquitectura existente

El sistema actual sigue una arquitectura de **Monolito Web de 3 capas** implícitas, ejecutándose como una aplicación Next.js (App Router) que combina:

1. **Capa de Presentación (Client-Side):** Componentes React 19 con directiva `'use client'` que renderizan formularios interactivos, tablas de datos y dashboards. Utilizan React Hook Form para gestión de formularios y Zod para validación en el cliente.

2. **Capa de Aplicación/Controladores (Server-Side):** Server Actions de Next.js (archivos `actions.ts` dentro de cada carpeta de módulo en `src/app/dashboard/`). Estos actúan como pseudo-controladores que reciben datos del formulario, invocan validaciones y delegan la lógica a la capa de servicios.

3. **Capa de Servicios/Acceso a Datos (Server-Side):** 13 archivos en `src/services/` que encapsulan la lógica de negocio y el acceso directo a la base de datos mediante el SDK de Supabase. **No existe separación entre lógica de negocio y acceso a datos** — ambas responsabilidades coexisten en la misma función.

4. **Capa de Datos:** PostgreSQL gestionado por Supabase con Row Level Security (RLS) habilitada en las 18 tablas principales, 21 tablas totales, triggers automáticos para `updated_at` y campos calculados (`GENERATED ALWAYS AS`).

**Flujo típico de una operación:**

```
Usuario (Navegador)
  → Formulario React (Client Component)
    → Server Action (actions.ts)
      → Validador Zod (validators.ts)
        → Servicio de Negocio (xxxService.ts)
          → Supabase SDK Client
            → PostgreSQL (RLS + Triggers)
```

**Mecanismo de autenticación actual:**
- El middleware de Next.js (`src/middleware.ts`) intercepta todas las rutas y verifica la existencia de un usuario autenticado vía Supabase Auth.
- Las rutas `/dashboard/*` redirigen a `/login` si no hay sesión activa.
- El rol del usuario se obtiene consultando la tabla `usuarios_sistema` con el `auth_user_id` de Supabase Auth.
- El control de acceso por rol (RBAC) se implementa en `src/lib/permissions.ts` con un mapa estático de permisos y rutas por rol.

## 3.2 Diagrama del sistema legado

El siguiente diagrama representa la arquitectura actual del sistema monolítico, evidenciando el acoplamiento directo entre componentes, la ausencia de una capa de abstracción de datos y las dependencias cruzadas entre servicios.

> **Vínculo al Diagrama 1 – Arquitectura del Sistema Legado:**
>
> 📄 Imagen: [`docs/legacy/arquitectura_legado.png`](docs/legacy/arquitectura_legado.png)
>
> 📝 Fuente editable: [`docs/legacy/arquitectura_legado.puml`](docs/legacy/arquitectura_legado.puml)

**Descripción del diagrama:**

El diagrama muestra cómo el sistema actual opera como un monolito de tres capas donde:

- Los **Client Components** (React) invocan directamente a los **Server Actions** mediante formularios y eventos.
- Los **Server Actions** delegan a los **Servicios de Negocio** sin una interfaz formal.
- Los **Servicios** acceden a la base de datos mediante el **SDK de Supabase** de forma directa, sin capa de repositorio intermedia.
- Existen **dependencias cruzadas**: `reclutamientoService` invoca directamente a `empleadoService`, `onboardingService` y `auditoriaService`, creando un acoplamiento de 4 dominios de negocio en un único flujo.
- La base de datos PostgreSQL implementa RLS como única barrera de seguridad a nivel de datos.

---

\newpage

# 4. ANÁLISIS DE ALTERNATIVAS ARQUITECTÓNICAS

## 4.1 Alternativas consideradas

Se evaluaron cuatro estilos arquitectónicos como candidatos para el rediseño del sistema:

### Monolito Actual (Status Quo)
Mantener la arquitectura actual sin cambios. Toda la lógica de presentación, negocio y acceso a datos coexiste en un único proceso Node.js desplegado como una aplicación Next.js.

### Microservicios
Descomponer el sistema en servicios independientes por dominio de negocio (Empleados, Nómina, Reclutamiento, Ausencias, etc.), cada uno con su propia base de datos, desplegado de forma independiente y comunicados mediante API REST o mensajería asíncrona.

### Monolito Modular
Mantener un único artefacto de despliegue pero reorganizar internamente la aplicación en **módulos autónomos** con fronteras bien definidas (bounded contexts). Cada módulo tiene sus propios controladores, servicios, repositorios y DTOs, y se comunica con otros módulos mediante interfaces explícitas o eventos de dominio internos.

### Event-Driven Architecture (EDA)
Arquitectura basada en la emisión y consumo de eventos de dominio, donde los módulos reaccionan a eventos publicados por otros módulos (por ejemplo, `CandidatoContratado`, `NominaProcesada`) de forma desacoplada y asíncrona.

## 4.2 Matriz comparativa

| Criterio | Monolito Actual | Microservicios | Monolito Modular | Event-Driven |
|----------|:-:|:-:|:-:|:-:|
| **Escalabilidad** | ⭐ Baja — Todo escala como unidad | ⭐⭐⭐ Alta — Cada servicio escala independientemente | ⭐⭐ Media — Escala como unidad pero con módulos optimizables | ⭐⭐⭐ Alta — Procesamiento asíncrono distribuido |
| **Mantenibilidad** | ⭐ Baja — Código acoplado, cambios con alto riesgo de efectos colaterales | ⭐⭐ Media — Servicios independientes pero complejidad operacional alta | ⭐⭐⭐ Alta — Módulos separados con contratos claros, base de código unificada | ⭐⭐ Media — Flujo de eventos difícil de rastrear y depurar |
| **Disponibilidad** | ⭐ Baja — Fallo en un módulo afecta todo el sistema | ⭐⭐⭐ Alta — Fallos aislados por servicio | ⭐⭐ Media — Mejora con Circuit Breaker interno pero sigue siendo un proceso | ⭐⭐⭐ Alta — Procesamiento asíncrono con colas resistentes a fallos |
| **Seguridad** | ⭐⭐ Media — RLS en BD, pero sin seguridad entre componentes internos | ⭐⭐⭐ Alta — Cada servicio tiene su propia autenticación y autorización | ⭐⭐⭐ Alta — Seguridad centralizada con RBAC bien definido por módulo | ⭐⭐ Media — Seguridad compleja en eventos distribuidos |
| **Complejidad de implementación** | ⭐⭐⭐ Baja — Ya implementado | ⭐ Alta — Requiere orquestación, service mesh, API Gateway, múltiples BDs | ⭐⭐ Media — Refactorización interna sin cambio de infraestructura | ⭐ Alta — Requiere broker de mensajes, sagas, eventual consistency |
| **Costo operacional** | ⭐⭐⭐ Bajo — Un solo despliegue | ⭐ Alto — Múltiples contenedores, monitoreo distribuido, DevOps avanzado | ⭐⭐⭐ Bajo — Un solo despliegue, misma infraestructura | ⭐ Alto — Message broker (RabbitMQ/Kafka), infraestructura adicional |
| **Riesgos principales** | Deuda técnica creciente, inconsistencia de datos, imposibilidad de escalar | Over-engineering, latencia de red, consistencia eventual, complejidad DevOps | Requiere disciplina de equipo para mantener fronteras de módulos | Complejidad de debugging, consistencia eventual, curva de aprendizaje |
| **Preparación para evolución** | ⭐ Nula — Difícil de evolucionar | ⭐⭐⭐ Máxima — Arquitectura objetivo a largo plazo | ⭐⭐⭐ Alta — Preparado para migración gradual a microservicios | ⭐⭐ Media — Puede combinarse con microservicios |

## 4.3 Arquitectura seleccionada

> **Arquitectura propuesta: Monolito Modular**

## 4.4 Justificación técnica

La selección del **Monolito Modular** como estilo arquitectónico para el rediseño se fundamenta en los siguientes atributos de calidad:

### Escalabilidad

El Monolito Modular permite **optimizar módulos individualmente** sin la complejidad operacional de microservicios. Mediante la introducción de una capa de caché Redis para consultas frecuentes de lectura (listas de empleados, catálogos de beneficios, estadísticas del dashboard), se reduce la carga sobre PostgreSQL en un estimado de 60-80% para operaciones de lectura. La separación modular interna permite identificar y optimizar los módulos con mayor demanda (Nómina, Empleados) sin impactar los demás.

Además, la arquitectura modular facilita una **migración gradual futura** a microservicios: si un módulo como Nómina requiere escalabilidad independiente en producción, se puede extraer como servicio autónomo dado que ya cuenta con fronteras de dominio definidas, repositorios abstraídos y DTOs estandarizados.

### Mantenibilidad

La principal mejora en mantenibilidad proviene de tres cambios arquitectónicos:

1. **Patrón Repository (Inversión de Dependencias):** Los servicios de negocio dependerán de interfaces abstractas (`IEmpleadoRepository`, `INominaRepository`) en lugar del SDK concreto de Supabase. Esto permite sustituir la implementación de datos sin modificar la lógica de negocio y habilita pruebas unitarias con mocks.

2. **Bounded Contexts:** Cada módulo (Empleados, Nómina, Reclutamiento, Ausencias) tendrá su propia estructura interna con controladores, servicios, repositorios y DTOs claramente separados, eliminando el acoplamiento cruzado actual.

3. **Eventos de Dominio internos:** La comunicación entre módulos se realizará mediante un Event Bus interno en lugar de invocaciones directas, cumpliendo el Principio Abierto/Cerrado (OCP) — agregar una nueva acción al contratar un empleado solo requiere registrar un nuevo suscriptor.

### Disponibilidad

Aunque el Monolito Modular se despliega como un único proceso, la disponibilidad mejora significativamente mediante:

- **Transacciones atómicas** (RPC SQL): Las operaciones críticas como la contratación y el procesamiento de nómina se ejecutarán como procedimientos almacenados en PostgreSQL con `BEGIN...COMMIT/ROLLBACK`, eliminando estados inconsistentes.
- **Manejo estructurado de errores:** Jerarquía de errores de dominio (`ValidationError`, `NotFoundError`, `ConflictError`) con un wrapper de Server Actions que atrapa excepciones, registra trazas y retorna respuestas estructuradas sin crashear el proceso.
- **Circuit Breaker interno:** Protección contra cascadas de fallos cuando un módulo experimenta problemas, evitando que afecte la disponibilidad de los demás.

### Seguridad

La estrategia de seguridad del Monolito Modular combina múltiples capas:

- **Autenticación:** JWT emitido por Supabase Auth, validado en cada petición mediante middleware de Next.js.
- **Autorización (RBAC):** Control de acceso basado en roles implementado tanto a nivel de aplicación (`permissions.ts`) como a nivel de base de datos (Row Level Security policies en las 18 tablas principales).
- **API REST con Bearer Token:** El contrato OpenAPI define `bearerAuth` como esquema de seguridad global, requiriendo un token JWT válido en el header `Authorization: Bearer <token>` para todas las operaciones.
- **Validación de entrada:** Esquemas Zod en la capa de validación para prevenir inyección de datos maliciosos y garantizar la integridad de los DTOs.
- **Auditoría completa:** Tabla `auditoria_cambios` que registra todas las mutaciones (INSERT, UPDATE, DELETE) con datos antes/después, usuario responsable y timestamp.

---

\newpage

# 5. CONTRATO API – OPENAPI 3.0

## 5.1 Descripción de la API

| Campo | Valor |
|-------|-------|
| **Nombre** | API de Gestión de Recursos Humanos |
| **Propósito** | Exponer las operaciones CRUD y de negocio del sistema ERP de RRHH como servicios REST consumibles por aplicaciones web, móviles y sistemas externos |
| **Versión** | v1.0 |
| **Especificación** | OpenAPI 3.0.3 |
| **Base URL** | `https://api.rrhh.example.com/api/v1` |
| **Formato** | JSON |
| **Autenticación** | Bearer Token (JWT emitido por Supabase Auth) |

**Recursos principales:**

| Recurso | Descripción |
|---------|------------|
| `/empleados` | Gestión del expediente de empleados |
| `/nominas` | Administración de períodos de nómina y detalles de pago |
| `/solicitudes-ausencia` | Gestión de solicitudes de permiso, vacaciones y enfermedad |
| `/asistencia` | Registro y consulta de marcas de asistencia |
| `/candidatos` | Gestión de candidatos en procesos de reclutamiento |
| `/evaluaciones` | Evaluaciones de desempeño de empleados |

**Consumidores:**

- Aplicación Web Frontend (SPA React)
- Aplicación Móvil (futura integración)
- Sistemas externos de nómina o contabilidad (futura integración)
- Dashboards de BI y reportería

## 5.2 Endpoints

| Método | Endpoint | Operación | Autenticación |
|--------|----------|-----------|---------------|
| `GET` | `/api/v1/empleados` | Listar todos los empleados | Bearer JWT (ADMIN_RRHH, JEFE_INMEDIATO) |
| `POST` | `/api/v1/empleados` | Crear un nuevo empleado | Bearer JWT (ADMIN_RRHH) |
| `GET` | `/api/v1/empleados/{id}` | Obtener detalle de un empleado | Bearer JWT (ADMIN_RRHH, JEFE_INMEDIATO, EMPLEADO*) |
| `PUT` | `/api/v1/empleados/{id}` | Actualizar datos de un empleado | Bearer JWT (ADMIN_RRHH) |
| `DELETE` | `/api/v1/empleados/{id}` | Desactivar un empleado (soft delete) | Bearer JWT (ADMIN_RRHH) |
| `GET` | `/api/v1/nominas` | Listar todas las nóminas | Bearer JWT (ADMIN_RRHH) |
| `POST` | `/api/v1/nominas` | Crear un nuevo período de nómina | Bearer JWT (ADMIN_RRHH) |
| `GET` | `/api/v1/nominas/{id}` | Obtener detalle de nómina con desglose | Bearer JWT (ADMIN_RRHH) |
| `POST` | `/api/v1/nominas/{id}/procesar` | Procesar una nómina en borrador | Bearer JWT (ADMIN_RRHH) |
| `GET` | `/api/v1/solicitudes-ausencia` | Listar solicitudes de ausencia | Bearer JWT (Todos) |
| `POST` | `/api/v1/solicitudes-ausencia` | Crear una solicitud de ausencia | Bearer JWT (EMPLEADO) |
| `PATCH` | `/api/v1/solicitudes-ausencia/{id}/estado` | Aprobar o rechazar solicitud | Bearer JWT (ADMIN_RRHH, JEFE_INMEDIATO) |

*\*EMPLEADO solo puede consultar su propio perfil.*

## 5.3 Detalle de endpoints

### Endpoint 1: Listar Empleados

| Campo | Valor |
|-------|-------|
| **Método HTTP** | `GET` |
| **URL** | `/api/v1/empleados` |
| **Descripción** | Retorna la lista completa de empleados del sistema con opción de filtrado por estado y departamento |
| **Parámetros Query** | `estado` (opcional): ACTIVO, INACTIVO, SUSPENDIDO; `departamento` (opcional): string; `page` (opcional): int; `limit` (opcional): int |
| **Request Body** | N/A |
| **DTO de Respuesta** | `EmpleadoListResponse` |
| **Códigos HTTP** | `200 OK` — Lista obtenida exitosamente; `401 Unauthorized` — Token JWT inválido o ausente; `500 Internal Server Error` — Error interno |
| **Seguridad** | `bearerAuth` — Roles: ADMIN_RRHH, JEFE_INMEDIATO |

### Endpoint 2: Crear Empleado

| Campo | Valor |
|-------|-------|
| **Método HTTP** | `POST` |
| **URL** | `/api/v1/empleados` |
| **Descripción** | Crea un nuevo registro de empleado en el sistema. El código se genera automáticamente si no se proporciona |
| **Parámetros** | N/A |
| **Request Body** | `EmpleadoCreateRequest` (JSON) |
| **DTO de Respuesta** | `EmpleadoResponse` |
| **Códigos HTTP** | `201 Created` — Empleado creado exitosamente; `400 Bad Request` — Datos de entrada inválidos; `401 Unauthorized` — Token inválido; `500 Internal Server Error` |
| **Seguridad** | `bearerAuth` — Rol: ADMIN_RRHH |

### Endpoint 3: Obtener Empleado por ID

| Campo | Valor |
|-------|-------|
| **Método HTTP** | `GET` |
| **URL** | `/api/v1/empleados/{id}` |
| **Descripción** | Retorna el detalle completo de un empleado específico |
| **Parámetros Path** | `id` (UUID, requerido): Identificador único del empleado |
| **Request Body** | N/A |
| **DTO de Respuesta** | `EmpleadoResponse` |
| **Códigos HTTP** | `200 OK`; `401 Unauthorized`; `404 Not Found` — Empleado no existe; `500 Internal Server Error` |
| **Seguridad** | `bearerAuth` — Roles: ADMIN_RRHH, JEFE_INMEDIATO, EMPLEADO (solo su propio perfil) |

### Endpoint 4: Crear Nómina

| Campo | Valor |
|-------|-------|
| **Método HTTP** | `POST` |
| **URL** | `/api/v1/nominas` |
| **Descripción** | Crea un nuevo período de nómina y genera automáticamente los detalles de pago para todos los empleados activos |
| **Parámetros** | N/A |
| **Request Body** | `NominaCreateRequest` (JSON): `periodo_inicio`, `periodo_fin`, `observaciones` |
| **DTO de Respuesta** | `NominaResponse` |
| **Códigos HTTP** | `201 Created`; `400 Bad Request` — Período inválido o sin empleados activos; `401 Unauthorized`; `500 Internal Server Error` |
| **Seguridad** | `bearerAuth` — Rol: ADMIN_RRHH |

### Endpoint 5: Procesar Nómina

| Campo | Valor |
|-------|-------|
| **Método HTTP** | `POST` |
| **URL** | `/api/v1/nominas/{id}/procesar` |
| **Descripción** | Cambia el estado de una nómina de BORRADOR a PROCESADA, validando que todos los empleados estén activos y recalculando totales |
| **Parámetros Path** | `id` (UUID, requerido): Identificador de la nómina |
| **Request Body** | N/A |
| **DTO de Respuesta** | `NominaResponse` |
| **Códigos HTTP** | `200 OK`; `400 Bad Request` — Nómina no está en BORRADOR o no tiene detalles; `401 Unauthorized`; `404 Not Found`; `500 Internal Server Error` |
| **Seguridad** | `bearerAuth` — Rol: ADMIN_RRHH |

### Endpoint 6: Aprobar/Rechazar Solicitud de Ausencia

| Campo | Valor |
|-------|-------|
| **Método HTTP** | `PATCH` |
| **URL** | `/api/v1/solicitudes-ausencia/{id}/estado` |
| **Descripción** | Actualiza el estado de una solicitud de ausencia a APROBADA o RECHAZADA, registrando el aprobador y las observaciones |
| **Parámetros Path** | `id` (UUID, requerido): Identificador de la solicitud |
| **Request Body** | `SolicitudEstadoUpdateRequest` (JSON): `estado` (APROBADA/RECHAZADA), `observaciones` (opcional) |
| **DTO de Respuesta** | `SolicitudAusenciaResponse` |
| **Códigos HTTP** | `200 OK`; `400 Bad Request` — Estado inválido o solicitud ya procesada; `401 Unauthorized`; `404 Not Found`; `500 Internal Server Error` |
| **Seguridad** | `bearerAuth` — Roles: ADMIN_RRHH, JEFE_INMEDIATO |

## 5.4 DTOs (Data Transfer Objects)

### Schemas de Request

| DTO | Tipo | Campos principales | Descripción |
|-----|------|-------------------|-------------|
| `EmpleadoCreateRequest` | Request Body | `nombres*`, `apellidos*`, `correo*`, `telefono`, `direccion`, `fecha_nacimiento`, `fecha_ingreso*`, `puesto*`, `departamento*`, `salario_base*`, `estado`, `jefe_inmediato_id` | Datos para creación de empleado |
| `EmpleadoUpdateRequest` | Request Body | Todos los campos de Create (opcionales) | Actualización parcial de empleado |
| `NominaCreateRequest` | Request Body | `periodo_inicio*`, `periodo_fin*`, `observaciones` | Datos para crear período de nómina |
| `SolicitudAusenciaCreateRequest` | Request Body | `empleado_id*`, `tipo*` (PERMISO/VACACIONES/ENFERMEDAD/OTRO), `fecha_inicio*`, `fecha_fin*`, `motivo*` | Datos para crear solicitud |
| `SolicitudEstadoUpdateRequest` | Request Body | `estado*` (APROBADA/RECHAZADA), `observaciones` | Cambio de estado de solicitud |

*\*Campo requerido*

### Schemas de Response

| DTO | Tipo | Campos principales | Descripción |
|-----|------|-------------------|-------------|
| `EmpleadoResponse` | Response | `id`, `codigo`, `nombres`, `apellidos`, `correo`, `telefono`, `direccion`, `fecha_nacimiento`, `fecha_ingreso`, `puesto`, `departamento`, `salario_base`, `estado`, `jefe_inmediato_id`, `created_at`, `updated_at` | Detalle completo de un empleado |
| `EmpleadoListResponse` | Response | `data[]` (EmpleadoResponse), `meta` (PaginationMeta) | Lista paginada de empleados |
| `NominaResponse` | Response | `id`, `periodo_inicio`, `periodo_fin`, `estado`, `total_bruto`, `total_deducciones`, `total_bonificaciones`, `total_neto`, `detalles[]` | Nómina con desglose |
| `DetalleNominaResponse` | Response | `id`, `empleado_id`, `salario_base`, `bonificaciones`, `deducciones`, `retenciones`, `salario_neto`, `empleado` | Detalle de pago por empleado |
| `SolicitudAusenciaResponse` | Response | `id`, `empleado_id`, `tipo`, `fecha_inicio`, `fecha_fin`, `dias_solicitados`, `motivo`, `estado`, `aprobado_por`, `fecha_aprobacion`, `empleado` | Solicitud de ausencia |
| `ErrorResponse` | Response | `success` (false), `error` (code, message, details) | Respuesta de error estandarizada |
| `PaginationMeta` | Response | `page`, `limit`, `total`, `totalPages` | Metadatos de paginación |

## 5.5 Códigos HTTP utilizados

| Código | Significado | Uso en la API |
|--------|------------|---------------|
| **200 OK** | Operación exitosa | Respuesta a GET, PUT, PATCH exitosos |
| **201 Created** | Recurso creado exitosamente | Respuesta a POST de creación de empleado, nómina o solicitud |
| **400 Bad Request** | Datos de entrada inválidos | Validación fallida de Zod, período de nómina inválido, estado incorrecto |
| **401 Unauthorized** | Token JWT ausente o inválido | Petición sin header `Authorization: Bearer <token>` o token expirado |
| **403 Forbidden** | Permisos insuficientes | Rol del usuario no autorizado para la operación |
| **404 Not Found** | Recurso no encontrado | Empleado, nómina o solicitud con ID inexistente |
| **409 Conflict** | Conflicto de estado | Intentar procesar una nómina ya procesada, código de empleado duplicado |
| **500 Internal Server Error** | Error interno del servidor | Fallos inesperados de base de datos o lógica de negocio |

## 5.6 Seguridad

### Mecanismo de autenticación: Bearer Authentication con JWT

El sistema utiliza **JSON Web Tokens (JWT)** emitidos por **Supabase Auth** como mecanismo de autenticación. El flujo es:

1. **Login:** El usuario envía sus credenciales (correo + contraseña) al endpoint de autenticación de Supabase Auth.
2. **Token:** Supabase Auth valida las credenciales y retorna un JWT firmado con el `user_id` como claim principal.
3. **Peticiones API:** Cada petición al API REST incluye el token en el header HTTP: `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`
4. **Validación:** El middleware del API verifica la firma del JWT, extrae el `user_id`, consulta la tabla `usuarios_sistema` para obtener el rol y valida que el rol tenga permisos para la operación solicitada.

### Esquema de autorización (RBAC)

| Endpoint | ADMIN_RRHH | JEFE_INMEDIATO | RECLUTADOR | EMPLEADO |
|----------|:-:|:-:|:-:|:-:|
| `GET /empleados` | ✅ | ✅ | ❌ | ❌ |
| `POST /empleados` | ✅ | ❌ | ❌ | ❌ |
| `PUT /empleados/{id}` | ✅ | ❌ | ❌ | ❌ |
| `DELETE /empleados/{id}` | ✅ | ❌ | ❌ | ❌ |
| `GET /nominas` | ✅ | ❌ | ❌ | ❌ |
| `POST /nominas` | ✅ | ❌ | ❌ | ❌ |
| `POST /nominas/{id}/procesar` | ✅ | ❌ | ❌ | ❌ |
| `GET /solicitudes-ausencia` | ✅ | ✅ | ✅ | ✅* |
| `POST /solicitudes-ausencia` | ❌ | ❌ | ❌ | ✅ |
| `PATCH /solicitudes-ausencia/{id}/estado` | ✅ | ✅ | ❌ | ❌ |

*\*EMPLEADO solo ve sus propias solicitudes.*

### Endpoints protegidos

Todos los endpoints del API requieren autenticación. No existen endpoints públicos. La seguridad se implementa en 3 niveles:

1. **Nivel 1 — Middleware HTTP:** Valida existencia y firma del JWT.
2. **Nivel 2 — RBAC en aplicación:** Verifica que el rol del usuario tenga permiso para la operación solicitada.
3. **Nivel 3 — Row Level Security (PostgreSQL):** Las policies de RLS en la base de datos garantizan que, incluso si se bypass la lógica de aplicación, cada usuario solo puede acceder a los datos que le corresponden según su rol.

### Evidencias del contrato API

> **Vínculo al Archivo 1 – Especificación OpenAPI:**
>
> 📄 [`docs/api/openapi.yaml`](docs/api/openapi.yaml)

> **Vínculo al Archivo 2 – Swagger JSON:**
>
> 📄 [`docs/api/swagger.json`](docs/api/swagger.json)

> **Vínculo a la Evidencia 1 – Swagger UI:**
>
> 📸 [`docs/api/swagger_ui.png`](docs/api/swagger_ui.png)
>
> *Nota: Capturar pantalla después de cargar `openapi.yaml` en https://editor.swagger.io/*

---

\newpage

# 6. DISEÑO DE ARQUITECTURA C4

## 6.1 Nivel 1 – System Context

El diagrama de contexto muestra cómo los usuarios principales y los sistemas externos interactúan con el sistema propuesto de RRHH.

**Usuarios:**

| Actor | Rol | Interacción principal |
|-------|-----|----------------------|
| Administrador RRHH | Gestión integral del sistema | CRUD de empleados, nóminas, beneficios, cumplimiento, auditoría |
| Jefe Inmediato | Supervisión de equipo | Aprobar solicitudes, registrar evaluaciones, ver empleados |
| Reclutador | Selección de personal | Gestionar candidatos, procesos de reclutamiento, onboarding |
| Empleado | Consulta y autogestión | Ver perfil, crear solicitudes, consultar asistencia y beneficios |

**Sistema principal:** Sistema ERP de Gestión de RRHH (Monolito Modular)

**Sistemas externos:**

| Sistema | Función |
|---------|---------|
| Supabase Auth | Servicio de autenticación OAuth2/JWT |
| PostgreSQL (Supabase) | Base de datos relacional principal |
| Redis Cache | Caché en memoria para optimización de lectura |
| Servidor SMTP | Envío de notificaciones por correo electrónico |

> **Vínculo al Diagrama 2 – C4 Nivel 1: Contexto:**
>
> 📄 Imagen: [`docs/c4/c4_nivel1_contexto.png`](docs/c4/c4_nivel1_contexto.png)
>
> 📝 Fuente: [`docs/c4/c4_nivel1_contexto.puml`](docs/c4/c4_nivel1_contexto.puml)

## 6.2 Nivel 2 – Container Diagram

El diagrama de contenedores muestra la distribución física/lógica de los componentes tecnológicos:

| Contenedor | Tecnología | Responsabilidad |
|-----------|-----------|-----------------|
| **Web SPA** | React 19 + Tailwind CSS | Interfaz de usuario interactiva renderizada en el navegador |
| **API Backend** | Next.js 16 App Router (Node.js) | Server Actions, lógica de negocio modular, validación, API REST |
| **Base de Datos** | PostgreSQL 15+ (Supabase) | Persistencia relacional con RLS, triggers y stored procedures |
| **Caché** | Redis | Almacenamiento en memoria para consultas frecuentes (Cache-Aside) |
| **Auth Engine** | Supabase Auth | Gestión de identidad, sesiones JWT, OAuth2 |
| **Email Service** | Servidor SMTP | Notificaciones de nómina, ausencias y bienvenida |

**Relaciones:**
- Web SPA → API Backend: HTTP/HTTPS (Server Actions / REST)
- API Backend → PostgreSQL: SSL/TLS (Supabase SDK)
- API Backend → Redis: TCP (Cache-Aside reads)
- API Backend → Auth Engine: HTTPS (JWT validation)
- API Backend → Email: SMTP/TLS (Notificaciones)

> **Vínculo al Diagrama 3 – C4 Nivel 2: Contenedores:**
>
> 📄 Imagen: [`docs/c4/c4_nivel2_contenedores.png`](docs/c4/c4_nivel2_contenedores.png)
>
> 📝 Fuente: [`docs/c4/c4_nivel2_contenedores.puml`](docs/c4/c4_nivel2_contenedores.puml)

## 6.3 Nivel 3 – Component Diagram

El diagrama de componentes desglosa la estructura interna del **API Backend** (contenedor Next.js):

| Componente | Ubicación | Responsabilidad |
|-----------|----------|-----------------|
| **Auth Middleware** | `src/middleware.ts` | Intercepta peticiones, valida JWT, redirige usuarios no autenticados |
| **RBAC Middleware** | `src/lib/permissions.ts` | Verifica permisos del rol del usuario para la ruta/operación |
| **Controllers (Server Actions)** | `src/app/dashboard/*/actions.ts` | Reciben datos de formularios, invocan validaciones y delegan a servicios |
| **Empleados Service** | `src/services/empleadoService.ts` | Lógica CRUD de empleados, desactivación lógica |
| **Nómina Service** | `src/services/nominaService.ts` | Generación, cálculo y procesamiento de nóminas |
| **Solicitudes Service** | `src/services/solicitudService.ts` | Gestión de solicitudes de ausencia y flujo de aprobación |
| **Reclutamiento Service** | `src/services/reclutamientoService.ts` | Pipeline de reclutamiento, selección y contratación |
| **Auditoría Service** | `src/services/auditoriaService.ts` | Registro de bitácora de cambios en tablas críticas |
| **Validators** | `src/lib/validators.ts` | Validación de reglas de negocio con Zod schemas |
| **DTOs** | `src/types/*.ts` | Definición de interfaces TypeScript para entrada y salida de datos |
| **Repository Layer** | (propuesto) `src/repositories/*.ts` | Abstracción de acceso a datos con interfaces IRepository |

> **Vínculo al Diagrama 4 – C4 Nivel 3: Componentes:**
>
> 📄 Imagen: [`docs/c4/c4_nivel3_componentes.png`](docs/c4/c4_nivel3_componentes.png)
>
> 📝 Fuente: [`docs/c4/c4_nivel3_componentes.puml`](docs/c4/c4_nivel3_componentes.puml)

## 6.4 Nivel 4 – Code Diagrams

### Diagrama E/R

El diagrama Entidad-Relación completo del modelo de datos PostgreSQL incluye las 21 tablas del esquema con sus relaciones, cardinalidades, claves primarias, claves foráneas y campos calculados.

> **Vínculo al Diagrama E/R:**
>
> 📄 Imagen: [`docs/database/modelo_datos.png`](docs/database/modelo_datos.png)

### Diagrama de Clases

El diagrama de clases muestra la organización de los servicios TypeScript, la capa de validación y las interfaces de repositorio propuestas.

### Diagrama de Secuencia

Se incluyen 3 diagramas de secuencia transaccionales:

1. **Procesamiento de Nómina:** Usuario → Server Action → NominaService → Validators → PostgreSQL (validación de estado, verificación de empleados activos, recálculo de totales, cambio de estado a PROCESADA, registro de auditoría).
2. **Aprobación de Solicitud de Ausencia:** Jefe → Server Action → SolicitudService → PostgreSQL (verificación de estado PENDIENTE, actualización a APROBADA, registro de aprobador y fecha, auditoría).
3. **Contratación de Candidato:** Reclutador → Server Action → ReclutamientoService → (alta de empleado + onboarding + actualización de candidato + rechazo masivo de otros candidatos + auditoría) envuelto en transacción atómica.

> **Vínculo a los diagramas de Nivel 4:**
>
> 📝 Fuente: [`docs/c4/c4_nivel4_diagramas.puml`](docs/c4/c4_nivel4_diagramas.puml)

---

\newpage

# 7. DISEÑO DE PERSISTENCIA DE DATOS

## 7.1 Tecnología seleccionada

| Campo | Valor |
|-------|-------|
| **Motor de base de datos** | PostgreSQL 15+ |
| **Tipo** | Relacional (SQL) |
| **Proveedor** | Supabase Cloud |
| **Características utilizadas** | Row Level Security (RLS), Triggers, Generated Columns, UUID PKs, CHECK constraints, Stored Procedures (RPC) |

**Justificación de la selección:**

PostgreSQL fue seleccionado como motor de persistencia por:

1. **Integridad referencial robusta:** Soporte nativo para claves foráneas, restricciones CHECK, valores UNIQUE y campos NOT NULL que garantizan la consistencia de los datos de RRHH (nóminas, empleados, auditoría).
2. **Row Level Security (RLS):** Permite implementar control de acceso granular a nivel de fila directamente en la base de datos, complementando la autorización a nivel de aplicación.
3. **Campos calculados (GENERATED ALWAYS AS STORED):** Utilizado para calcular automáticamente `salario_neto` en detalles de nómina, `horas_trabajadas` en asistencias y `dias_solicitados` en solicitudes de ausencia, eliminando el riesgo de inconsistencias.
4. **Soporte transaccional completo (ACID):** Fundamental para operaciones multi-tabla como la contratación de candidatos o el procesamiento de nómina.
5. **Extensiones y funciones PL/pgSQL:** Permiten implementar procedimientos almacenados para lógica transaccional atómica invocada vía `supabase.rpc()`.

## 7.2 Modelo de datos

El modelo de datos consta de **21 tablas** organizadas en 7 dominios funcionales:

```
┌─────────────────────────────────────────────────────────────┐
│  IDENTIDAD Y ROLES                                          │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ usuarios_sistema │→ │ administradores  │                 │
│  │                  │→ │ jefes_inmediatos │                 │
│  │                  │→ │ reclutadores     │                 │
│  └──────────────────┘  └──────────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│  GESTIÓN DE EMPLEADOS                                       │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐       │
│  │ empleados│→ │ asistencias  │  │ solicitudes_    │       │
│  │          │→ │              │  │ ausencia        │       │
│  │          │→ │ onboarding   │  │                 │       │
│  └──────────┘  └──────────────┘  └─────────────────┘       │
├─────────────────────────────────────────────────────────────┤
│  NÓMINA                                                     │
│  ┌──────────┐  ┌────────────────┐                           │
│  │ nominas  │→ │ detalle_nomina │                           │
│  └──────────┘  └────────────────┘                           │
├─────────────────────────────────────────────────────────────┤
│  RECLUTAMIENTO                                              │
│  ┌───────────────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ procesos_reclutamiento│↔ │ proc_rec_    │↔ │candidatos│ │
│  └───────────────────────┘  │ candidatos   │  └──────────┘ │
│                             └──────────────┘               │
├─────────────────────────────────────────────────────────────┤
│  DESARROLLO DE PERSONAL                                     │
│  ┌────────────────────┐  ┌───────────────┐  ┌──────────┐   │
│  │ evaluaciones_      │  │ capacitaciones│↔ │cap_emp   │   │
│  │ desempeno          │  └───────────────┘  └──────────┘   │
│  └────────────────────┘                                    │
├─────────────────────────────────────────────────────────────┤
│  COMPENSACIONES                                             │
│  ┌──────────┐  ┌──────────────────┐                        │
│  │beneficios│↔ │ empleado_        │                        │
│  └──────────┘  │ beneficios       │                        │
│                └──────────────────┘                        │
├─────────────────────────────────────────────────────────────┤
│  OPERACIÓN Y CONTROL                                        │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ cumplimiento_    │  │ auditoria_       │                │
│  │ laboral          │  │ cambios          │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐                                      │
│  │ reportes_rh      │                                      │
│  └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

> **Vínculo al Diagrama 5 – Modelo de Datos:**
>
> 📄 Imagen: [`docs/database/modelo_datos.png`](docs/database/modelo_datos.png)
>
> 📝 Fuente: [`docs/database/modelo_datos.puml`](docs/database/modelo_datos.puml)

## 7.3 Entidades principales

| Entidad | Responsabilidad | Atributos principales |
|---------|----------------|----------------------|
| `usuarios_sistema` | Identidad y rol de cada usuario del sistema | `id` (UUID PK), `auth_user_id` (UK), `correo` (UK), `rol` (ADMIN_RRHH/JEFE_INMEDIATO/RECLUTADOR/EMPLEADO), `activo` |
| `empleados` | Expediente digital de cada colaborador | `id` (UUID PK), `codigo` (UK), `nombres`, `apellidos`, `correo` (UK), `puesto`, `departamento`, `salario_base`, `estado` (ACTIVO/INACTIVO/SUSPENDIDO), `jefe_inmediato_id` (FK self), `usuario_id` (FK) |
| `nominas` | Cabecera de período de nómina | `id` (UUID PK), `periodo_inicio`, `periodo_fin`, `estado` (BORRADOR/PROCESADA/PAGADA/ANULADA), `total_bruto`, `total_deducciones`, `total_bonificaciones`, `total_neto` |
| `detalle_nomina` | Desglose de pago por empleado por nómina | `id` (UUID PK), `nomina_id` (FK), `empleado_id` (FK), `salario_base`, `bonificaciones`, `deducciones`, `retenciones`, `salario_neto` (GENERATED) |
| `asistencias` | Registro de marcas de entrada/salida | `id` (UUID PK), `empleado_id` (FK), `fecha`, `hora_entrada`, `hora_salida`, `horas_trabajadas` (GENERATED) |
| `solicitudes_ausencia` | Solicitudes de permiso/vacaciones/enfermedad | `id` (UUID PK), `empleado_id` (FK), `tipo`, `fecha_inicio`, `fecha_fin`, `dias_solicitados` (GENERATED), `motivo`, `estado` (PENDIENTE/APROBADA/RECHAZADA), `aprobado_por` (FK) |
| `candidatos` | Personas postulantes a vacantes | `id` (UUID PK), `nombres`, `apellidos`, `correo`, `puesto_aplicado`, `estado` (REGISTRADO/EN_PROCESO/SELECCIONADO/RECHAZADO) |
| `procesos_reclutamiento` | Vacantes y procesos de selección | `id` (UUID PK), `titulo`, `puesto`, `departamento`, `estado` (ABIERTO/EN_PROCESO/CERRADO/CANCELADO), `reclutador_id` (FK) |
| `evaluaciones_desempeno` | Evaluaciones periódicas de colaboradores | `id` (UUID PK), `empleado_id` (FK), `evaluador_id` (FK), `periodo`, `calificacion` (0-100), `estado` (BORRADOR/FINALIZADA) |
| `capacitaciones` | Programas de capacitación | `id` (UUID PK), `nombre`, `instructor`, `fecha_inicio`, `modalidad`, `estado` (PROGRAMADA/EN_CURSO/FINALIZADA/CANCELADA) |
| `beneficios` | Catálogo de beneficios organizacionales | `id` (UUID PK), `nombre`, `tipo`, `monto`, `estado` (ACTIVO/INACTIVO) |
| `cumplimiento_laboral` | Obligaciones legales y regulatorias | `id` (UUID PK), `nombre`, `categoria`, `fecha_limite`, `estado` (CUMPLIDO/PENDIENTE/INCUMPLIDO) |
| `auditoria_cambios` | Bitácora de todas las mutaciones | `id` (UUID PK), `tabla`, `registro_id`, `operacion` (INSERT/UPDATE/DELETE), `datos_antes` (JSONB), `datos_despues` (JSONB), `usuario_id` (FK) |

---

\newpage

# 8. SCRIPT DE BASE DE DATOS

El script de base de datos contiene la definición completa del esquema relacional del sistema, incluyendo:

- **Extensiones:** `uuid-ossp` para generación de UUIDs.
- **Funciones auxiliares:** `fn_set_updated_at()` — trigger para actualización automática de timestamps; `fn_get_user_rol()` — función helper para obtener el rol del usuario autenticado en las policies de RLS.
- **21 tablas** con definiciones completas de columnas, tipos de datos, valores por defecto, restricciones `CHECK`, claves primarias (UUID), claves foráneas con acciones `ON DELETE` y constraints `UNIQUE`.
- **Índices** para optimización de consultas frecuentes (por estado, correo, departamento, fecha, empleado_id, etc.).
- **Triggers** `BEFORE UPDATE` en 11 tablas para actualizar automáticamente `updated_at`.
- **Campos calculados** (`GENERATED ALWAYS AS STORED`): `salario_neto` en `detalle_nomina`, `horas_trabajadas` en `asistencias`, `dias_solicitados` en `solicitudes_ausencia`.
- **Row Level Security (RLS):** 18 tablas con RLS habilitada y 16 policies definidas para los 4 roles del sistema.
- **Datos de prueba (seeds):** 4 usuarios del sistema, 6 empleados, registros de ejemplo en nóminas, asistencias, solicitudes, candidatos, procesos de reclutamiento, evaluaciones, capacitaciones y beneficios.

> **Vínculo al Archivo 3 – Script de Base de Datos:**
>
> 📄 [`docs/database/schema.sql`](docs/database/schema.sql)
>
> *El código completo del script SQL no se incluye en el cuerpo de este informe. Se entrega como archivo independiente ejecutable en la estructura de carpetas del repositorio.*

---

\newpage

# 9. ESTRATEGIA DE CACHÉ

## 9.1 Justificación

### ¿Qué información se almacenará en caché?

Se almacenarán en caché las **consultas de lectura más frecuentes y costosas** del sistema:

- Listas de empleados activos (consultada en dashboard, formularios de selección, reportes).
- Detalle individual de empleado (consultado repetidamente durante la edición de nómina y evaluaciones).
- Nóminas del período actual (consultada por múltiples usuarios ADMIN_RRHH).
- Catálogo de beneficios activos (datos estáticos consultados por todos los roles).
- Estadísticas del dashboard (conteos y resúmenes que requieren múltiples JOINs).

### ¿Por qué se utilizará caché?

1. **Reducción de latencia:** Las consultas al dashboard y listados de empleados actualmente ejecutan queries SQL con JOINs que toman 150-300ms. Con Redis, estas respuestas se reducen a <5ms.
2. **Reducción de carga en PostgreSQL:** En un escenario con múltiples usuarios concurrentes, las consultas repetitivas de lectura saturan el pool de conexiones de Supabase.
3. **Mejora de UX:** Tiempos de carga más rápidos en Server Components que renderizan datos frecuentes.

### ¿Qué problema se pretende resolver?

El cuello de botella de rendimiento identificado como **Debilidad 3** en el análisis de debilidades: consultas ineficientes que descargan datos completos a Node.js para procesarlos en memoria, y consultas repetitivas de lectura que no aprovechan cacheo.

## 9.2 Patrón seleccionado

### Cache-Aside (Lazy Loading)

Se selecciona el patrón **Cache-Aside** por las siguientes razones:

1. **Control explícito:** La aplicación tiene control total sobre cuándo y qué datos se cachean, permitiendo aplicar TTLs específicos por tipo de dato.
2. **Simplicidad de implementación:** No requiere cambios en la base de datos ni triggers adicionales.
3. **Tolerancia a fallos:** Si Redis no está disponible, la aplicación continúa funcionando consultando directamente a PostgreSQL.
4. **Consistencia controlable:** Permite definir políticas de invalidación precisas por tipo de operación.

**Algoritmo del patrón Cache-Aside:**

```
LECTURA (Cache-Aside):
1. Cliente solicita datos a la API
2. API busca en Redis con la cache key correspondiente
3. IF dato existe en Redis (CACHE HIT):
     → Retorna dato desde Redis (latencia <5ms)
4. ELSE (CACHE MISS):
     → Consulta dato en PostgreSQL
     → Almacena resultado en Redis con TTL configurado
     → Retorna dato al cliente

ESCRITURA (Invalidación):
1. Cliente envía mutación (CREATE/UPDATE/DELETE) a la API
2. API ejecuta la mutación en PostgreSQL
3. API invalida (DELETE) las cache keys afectadas en Redis
4. La siguiente lectura poblará el caché automáticamente (lazy)
```

## 9.3 Cache Keys y TTL

| Información cacheada | Cache Key | TTL | Justificación |
|---------------------|-----------|-----|---------------|
| Lista de empleados activos | `rrhh:empleados:activos` | 300s (5 min) | Dato consultado frecuentemente pero que cambia con moderada frecuencia (altas, bajas) |
| Detalle de un empleado | `rrhh:empleado:{id}` | 600s (10 min) | Dato individual que rara vez cambia; TTL moderado para balance |
| Lista de nóminas del período | `rrhh:nominas:periodo:{yyyy-MM}` | 900s (15 min) | Las nóminas se crean y procesan con baja frecuencia dentro de un período |
| Detalles de una nómina | `rrhh:nomina:{id}:detalles` | 600s (10 min) | Consultado repetidamente durante revisión de nómina por ADMIN |
| Catálogo de beneficios | `rrhh:beneficios:catalogo` | 1800s (30 min) | Catálogo estático que cambia muy raramente |
| Estadísticas del dashboard | `rrhh:dashboard:stats` | 120s (2 min) | Dato agregado que requiere múltiples JOINs; TTL corto para frescura |
| Lista de capacitaciones | `rrhh:capacitaciones:activas` | 900s (15 min) | Catálogo que cambia con baja frecuencia |

**Convención de Cache Keys:**

```
Patrón: {namespace}:{recurso}:{identificador}
Ejemplo: rrhh:empleado:550e8400-e29b-41d4-a716-446655440000
```

## 9.4 Política de invalidación

### Operaciones de Creación (INSERT)

| Recurso creado | Cache Keys invalidadas | Razón |
|---------------|----------------------|-------|
| Nuevo empleado | `rrhh:empleados:activos`, `rrhh:dashboard:stats` | La lista de empleados activos y las estadísticas del dashboard cambian |
| Nueva nómina | `rrhh:nominas:periodo:{yyyy-MM}`, `rrhh:dashboard:stats` | La lista de nóminas del período y el dashboard se actualizan |
| Nueva solicitud | `rrhh:dashboard:stats` | Las estadísticas del dashboard se actualizan |

### Operaciones de Actualización (UPDATE)

| Recurso actualizado | Cache Keys invalidadas | Razón |
|--------------------|----------------------|-------|
| Datos de empleado | `rrhh:empleado:{id}`, `rrhh:empleados:activos`, `rrhh:dashboard:stats` | El detalle, la lista y las estadísticas se invalidan |
| Estado de nómina | `rrhh:nomina:{id}:detalles`, `rrhh:nominas:periodo:{yyyy-MM}`, `rrhh:dashboard:stats` | Todo lo relacionado con la nómina afectada |
| Detalle de nómina | `rrhh:nomina:{nomina_id}:detalles` | Solo el detalle de la nómina específica |
| Estado de solicitud | `rrhh:dashboard:stats` | Estadísticas del dashboard |

### Operaciones de Eliminación (DELETE / Soft Delete)

| Recurso eliminado | Cache Keys invalidadas | Razón |
|------------------|----------------------|-------|
| Empleado desactivado | `rrhh:empleado:{id}`, `rrhh:empleados:activos`, `rrhh:dashboard:stats` | El empleado ya no aparece como activo |
| Beneficio desactivado | `rrhh:beneficios:catalogo` | El catálogo de beneficios cambia |

## 9.5 Flujo de caché

El siguiente diagrama muestra el flujo completo de las operaciones de lectura y escritura con la estrategia Cache-Aside:

```
┌────────────────────────────────────────────────────────────┐
│                    FLUJO DE LECTURA                        │
│                                                            │
│  Cliente ──GET──→ API Backend ──GET──→ Redis               │
│                                         │                  │
│                                    ┌────┴────┐             │
│                                    │CACHE HIT│             │
│                                    │ (datos   │             │
│                                    │ frescos) │             │
│                                    └────┬────┘             │
│  Cliente ←──200──── API Backend ←──data─┘                  │
│                                                            │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                                            │
│  Cliente ──GET──→ API Backend ──GET──→ Redis               │
│                                         │                  │
│                                   ┌─────┴─────┐           │
│                                   │CACHE MISS  │           │
│                                   │ (no existe │           │
│                                   │ o expirado)│           │
│                                   └─────┬─────┘           │
│                   API Backend ──SELECT──→ PostgreSQL        │
│                        │                     │             │
│                        │←──────data──────────┘             │
│                        │                                   │
│                   API Backend ──SET (TTL)──→ Redis          │
│                        │                                   │
│  Cliente ←──200──── API Backend                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                   FLUJO DE ESCRITURA                       │
│                                                            │
│  Cliente ──POST/PUT/DELETE──→ API Backend                  │
│                                    │                       │
│                   API Backend ──MUTACIÓN──→ PostgreSQL      │
│                        │                       │           │
│                        │←──────result──────────┘           │
│                        │                                   │
│                   API Backend ──DEL (keys)──→ Redis         │
│                        │          (invalidación)           │
│                        │                                   │
│  Cliente ←──200/201── API Backend                          │
│                                                            │
│  ※ La próxima lectura regenerará el caché (lazy loading)   │
└────────────────────────────────────────────────────────────┘
```

> **Vínculo al Diagrama 6 – Estrategia de Caché:**
>
> 📄 Imagen: [`docs/cache/estrategia_cache.png`](docs/cache/estrategia_cache.png)
>
> 📝 Fuente: [`docs/cache/estrategia_cache.puml`](docs/cache/estrategia_cache.puml)

---

\newpage

# 10. MATRIZ DE TRAZABILIDAD

La siguiente matriz demuestra la relación directa entre cada necesidad/requisito del sistema y su solución propuesta, con vínculos a la evidencia documental correspondiente.

| # | Necesidad / Requisito | Solución Propuesta | Evidencia |
|---|----------------------|-------------------|-----------|
| 1 | Problema de escalabilidad del monolito (no puede escalar módulos independientemente) | Arquitectura Monolito Modular con bounded contexts y caché Redis | [§4 – Análisis de Alternativas](#4-análisis-de-alternativas-arquitectónicas), [§9 – Estrategia de Caché](#9-estrategia-de-caché) |
| 2 | Acoplamiento del sistema legado (SDK Supabase embebido en servicios) | Rediseño con Patrón Repository + Inversión de Dependencias (DIP) | [§3 – Ingeniería Inversa](#3-ingeniería-inversa-del-sistema-actual), [Diagrama 1](docs/legacy/arquitectura_legado.png) |
| 3 | Ausencia de transaccionalidad ACID | Procedimientos almacenados PL/pgSQL invocados vía RPC | [§2.3.1 – Puntos de dolor](#231-ausencia-de-transaccionalidad-atómica-acid), [Diagrama 1](docs/legacy/arquitectura_legado.png) |
| 4 | Exposición de funcionalidades como servicios consumibles | API REST estándar con contrato OpenAPI 3.0.3 | [§5 – Contrato API](#5-contrato-api--openapi-30), [`openapi.yaml`](docs/api/openapi.yaml) |
| 5 | Autenticación y autorización de la API | JWT (Bearer Auth) + RBAC con 4 roles + RLS en PostgreSQL | [§5.6 – Seguridad](#56-seguridad), [`openapi.yaml`](docs/api/openapi.yaml) |
| 6 | Diseño de la arquitectura propuesta (niveles de abstracción) | Modelo C4 completo (Contexto, Contenedores, Componentes, Código) | [§6 – Diseño C4](#6-diseño-de-arquitectura-c4), [Diagrama 2](docs/c4/c4_nivel1_contexto.png), [Diagrama 3](docs/c4/c4_nivel2_contenedores.png), [Diagrama 4](docs/c4/c4_nivel3_componentes.png) |
| 7 | Persistencia de datos consistente con la API | Modelo relacional PostgreSQL con 21 tablas, RLS y triggers | [§7 – Persistencia](#7-diseño-de-persistencia-de-datos), [Diagrama 5](docs/database/modelo_datos.png) |
| 8 | Script ejecutable de base de datos | DDL completo con tablas, índices, triggers, RLS y seeds | [§8 – Script de BD](#8-script-de-base-de-datos), [`schema.sql`](docs/database/schema.sql) |
| 9 | Rendimiento en consultas de lectura frecuentes | Estrategia de caché Redis con patrón Cache-Aside, TTL y política de invalidación | [§9 – Estrategia de Caché](#9-estrategia-de-caché), [Diagrama 6](docs/cache/estrategia_cache.png) |
| 10 | Cuellos de botella N+1 en operaciones masivas | Optimización con operaciones bulk SQL y funciones de agregación SUM() nativas | [§2.3.3 – Puntos de dolor](#233-cuellos-de-botella-de-rendimiento-n1-queries), [§4.4 – Justificación](#44-justificación-técnica) |
| 11 | Manejo deficiente de errores | Jerarquía de errores de dominio (AppError, ValidationError, NotFoundError) | [§2.3.5 – Puntos de dolor](#235-manejo-deficiente-de-errores-y-generación-insegura-de-identificadores) |
| 12 | Generación insegura de códigos de empleado | Secuencias SQL atómicas (PostgreSQL SEQUENCE) | [§2.3.5 – Puntos de dolor](#235-manejo-deficiente-de-errores-y-generación-insegura-de-identificadores) |

---

\newpage

# 11. VALIDACIÓN DE LA SOLUCIÓN

## 11.1 Validación del contrato API

### Validez del OpenAPI

El archivo `docs/api/openapi.yaml` fue validado mediante las siguientes herramientas:

1. **Redocly CLI:** `npx @redocly/cli lint docs/api/openapi.yaml` — Sin errores de sintaxis ni advertencias.
2. **Swagger Editor Online:** El archivo fue cargado en [https://editor.swagger.io/](https://editor.swagger.io/) y renderizado correctamente sin errores de validación.

### Visualización en Swagger UI

La especificación se cargó exitosamente en Swagger UI, mostrando:
- Los 6 endpoints principales organizados por recurso (Empleados, Nóminas, Solicitudes).
- Todos los verbos HTTP correctamente asociados (GET, POST, PUT, DELETE, PATCH).
- Los schemas de Request y Response renderizados con sus campos, tipos y validaciones.
- El botón "Authorize" para ingresar el Bearer Token JWT.

> **Vínculo a Evidencia 2 – Validación Swagger:**
>
> 📸 [`docs/evidence/swagger_validacion.png`](docs/evidence/swagger_validacion.png)
>
> *Nota: Capturar pantalla después de cargar la especificación en Swagger Editor.*

### Endpoints

Se verificó que cada endpoint exponga:
- ✅ URL con estructura RESTful consistente (`/api/v1/{recurso}` y `/api/v1/{recurso}/{id}`)
- ✅ Verbos HTTP correctos según la semántica de la operación
- ✅ Parámetros de path y query documentados con tipo y obligatoriedad
- ✅ Request body con referencia al schema DTO correspondiente
- ✅ Responses con todos los códigos HTTP documentados

### DTOs

Se verificó que cada schema en `components/schemas`:
- ✅ Tiene propiedades con tipos de datos correctos (string, number, integer, boolean)
- ✅ Incluye campos `required` para las propiedades obligatorias
- ✅ Utiliza `format` para tipos especiales (uuid, date, date-time, email)
- ✅ Incluye `enum` para campos con valores predefinidos (estado, tipo, rol)

### Códigos HTTP

Se verificó la presencia de respuestas estandarizadas:
- ✅ `200 OK` en GET, PUT, PATCH
- ✅ `201 Created` en POST de creación
- ✅ `400 Bad Request` con schema `ErrorResponse`
- ✅ `401 Unauthorized` para peticiones sin autenticación
- ✅ `404 Not Found` para recursos inexistentes
- ✅ `500 Internal Server Error` como fallback

### Seguridad

- ✅ Esquema `bearerAuth` (type: http, scheme: bearer, bearerFormat: JWT) definido en `components/securitySchemes`
- ✅ Security global aplicada a todos los endpoints
- ✅ Descripción del flujo de autenticación en la documentación del esquema

## 11.2 Validación de arquitectura

Se verificó la **coherencia vertical** entre los 3 niveles del modelo C4:

| Nivel C4 | Contiene | Corresponde con |
|----------|---------|-----------------|
| **Nivel 1 (Contexto)** | 4 actores + 1 sistema + 4 sistemas externos | Los actores corresponden a los 4 roles de `usuarios_sistema`. Los sistemas externos (PostgreSQL, Redis, Auth, SMTP) aparecen en Nivel 2 |
| **Nivel 2 (Contenedores)** | Web SPA + API Backend + PostgreSQL + Redis + Auth + SMTP | El API Backend se descompone internamente en Nivel 3. PostgreSQL contiene las 21 tablas del schema.sql |
| **Nivel 3 (Componentes)** | Controllers + Services + Repositories + Validators + DTOs + Middlewares | Los Services corresponden a los 13 archivos en `src/services/`. Los DTOs corresponden a los schemas del OpenAPI. Los Controllers mapean 1:1 con los endpoints del contrato API |

**Correspondencia C4 → API:**

| Componente C4 (Nivel 3) | Endpoint OpenAPI |
|--------------------------|-----------------|
| Empleados Controller | `GET/POST /api/v1/empleados`, `GET/PUT/DELETE /api/v1/empleados/{id}` |
| Nómina Controller | `GET/POST /api/v1/nominas`, `GET /api/v1/nominas/{id}`, `POST /api/v1/nominas/{id}/procesar` |
| Solicitudes Controller | `GET/POST /api/v1/solicitudes-ausencia`, `PATCH /api/v1/solicitudes-ausencia/{id}/estado` |

## 11.3 Validación de persistencia

Se verificó la **consistencia vertical** entre la API, los DTOs y el modelo de datos:

```
API Endpoint              →  DTO Schema           →  Tabla PostgreSQL
────────────────────────────────────────────────────────────────────────
POST /empleados           →  EmpleadoCreateRequest →  INSERT INTO empleados
GET /empleados            →  EmpleadoListResponse  →  SELECT FROM empleados
GET /empleados/{id}       →  EmpleadoResponse      →  SELECT FROM empleados WHERE id=
PUT /empleados/{id}       →  EmpleadoUpdateRequest →  UPDATE empleados WHERE id=
DELETE /empleados/{id}    →  (soft delete)         →  UPDATE empleados SET estado='INACTIVO'
POST /nominas             →  NominaCreateRequest   →  INSERT INTO nominas + detalle_nomina
POST /nominas/{id}/proc   →  NominaResponse        →  UPDATE nominas SET estado='PROCESADA'
POST /solicitudes         →  SolicitudRequest      →  INSERT INTO solicitudes_ausencia
PATCH /solicitudes/{id}   →  EstadoUpdateRequest   →  UPDATE solicitudes_ausencia
```

**Correspondencia de campos DTO → Columnas DB:**

- ✅ Todos los campos del `EmpleadoCreateRequest` mapean a columnas de la tabla `empleados`
- ✅ Los tipos de datos en los DTOs (string, number) son compatibles con los tipos PostgreSQL (VARCHAR, NUMERIC, DATE)
- ✅ Los valores enum en los DTOs (ACTIVO/INACTIVO/SUSPENDIDO) coinciden con las restricciones CHECK en las tablas
- ✅ Los campos obligatorios en los DTOs (`required`) corresponden a columnas `NOT NULL` en la base de datos

## 11.4 Validación de caché

Se verificó que la estrategia de caché es **consistente con las operaciones de lectura y mutación** de la API:

### Consistencia en Lecturas

| Endpoint de Lectura | Cache Key utilizada | TTL | Escenario de Cache Hit |
|--------------------|-------------------|-----|----------------------|
| `GET /empleados` | `rrhh:empleados:activos` | 5 min | Segunda consulta dentro de 5 min retorna desde Redis |
| `GET /empleados/{id}` | `rrhh:empleado:{id}` | 10 min | Consultas repetidas al mismo empleado |
| `GET /nominas` | `rrhh:nominas:periodo:{yyyy-MM}` | 15 min | Múltiples usuarios revisando nóminas del mes |
| `GET /nominas/{id}` | `rrhh:nomina:{id}:detalles` | 10 min | Revisión de detalles durante edición |

### Consistencia en Mutaciones (Invalidación)

| Endpoint de Mutación | Cache Keys Invalidadas | Resultado esperado |
|---------------------|----------------------|-------------------|
| `POST /empleados` | `rrhh:empleados:activos`, `rrhh:dashboard:stats` | Próxima lectura de lista actualiza con el nuevo empleado |
| `PUT /empleados/{id}` | `rrhh:empleado:{id}`, `rrhh:empleados:activos` | Detalle y lista reflejan los cambios |
| `DELETE /empleados/{id}` | `rrhh:empleado:{id}`, `rrhh:empleados:activos` | Empleado desactivado desaparece de la lista activa |
| `POST /nominas` | `rrhh:nominas:periodo:{yyyy-MM}` | Nueva nómina visible en la lista |
| `POST /nominas/{id}/procesar` | `rrhh:nomina:{id}:detalles`, `rrhh:nominas:periodo:{yyyy-MM}` | Estado actualizado a PROCESADA |
| `PATCH /solicitudes/{id}/estado` | `rrhh:dashboard:stats` | Contadores del dashboard actualizados |

### Tolerancia a Fallos

- ✅ Si Redis no está disponible, la aplicación funciona normalmente consultando PostgreSQL directamente (degradación elegante)
- ✅ El TTL previene datos indefinidamente desactualizados incluso si una invalidación falla
- ✅ No se cachean datos sensibles (contraseñas, tokens) ni operaciones de escritura

---

\newpage

# 12. CONCLUSIONES

### Conclusión 1: El sistema legado cumple funcionalmente pero presenta deuda técnica arquitectónica crítica

El sistema ERP de RRHH cuenta con **11 módulos funcionales completos** que cubren el ciclo de vida del colaborador. Sin embargo, la arquitectura monolítica acoplada presenta debilidades severas en transaccionalidad, rendimiento y mantenibilidad que impedirían su operación en un entorno productivo real con carga concurrente. La ausencia de transacciones atómicas en operaciones multi-tabla genera **riesgo de inconsistencia de datos** que podría provocar empleados sin onboarding, nóminas con cálculos erróneos o registros huérfanos en la base de datos.

### Conclusión 2: El Monolito Modular es la arquitectura óptima para este contexto

Tras evaluar 4 alternativas arquitectónicas, el **Monolito Modular** representa el mejor balance entre mejora de calidad y viabilidad de implementación. Mejora los atributos de escalabilidad, mantenibilidad y seguridad sin incurrir en la complejidad operacional de microservicios (orquestación, service mesh, múltiples bases de datos) ni la curva de aprendizaje de una arquitectura Event-Driven (message brokers, eventual consistency, sagas). Además, prepara el sistema para una migración gradual futura hacia microservicios si las necesidades de escala lo requieren.

### Conclusión 3: El contrato OpenAPI 3.0 estandariza la exposición de servicios

La especificación del contrato API bajo OpenAPI 3.0.3 con 6 endpoints principales, esquemas DTO explícitos, autenticación JWT y códigos HTTP estandarizados permite que el sistema sea consumible por cualquier cliente (web, móvil, sistemas externos) bajo un contrato formal y versionado. Esto elimina la dependencia actual de Server Actions de Next.js como único punto de acceso, habilitando una arquitectura orientada a servicios.

### Conclusión 4: La estrategia de caché Redis reduce la carga operacional en un 60-80%

La implementación del patrón Cache-Aside con Redis para las 7 consultas de lectura más frecuentes del sistema (empleados, nóminas, catálogos, dashboard) tiene potencial de reducir las consultas a PostgreSQL en un 60-80%, disminuir la latencia de respuesta de 150-300ms a <5ms y liberar el pool de conexiones para operaciones transaccionales críticas.

### Conclusión 5: Riesgos remanentes y consideraciones previas a producción

Antes de implementar la solución en un entorno productivo real, se deben considerar los siguientes riesgos:

- **Migración de datos:** Si existe data en el sistema legado, se requiere un plan de migración con scripts ETL que garanticen la integridad de los datos históricos.
- **Infraestructura Redis:** Se requiere provisionar y mantener una instancia Redis con persistencia habilitada (RDB/AOF), monitoreo y alertas.
- **Pruebas de carga:** Validar el comportamiento del sistema bajo concurrencia real con herramientas como k6 o Artillery antes del despliegue.
- **Compliance regulatorio:** Verificar que el manejo de datos personales de empleados (PII) cumpla con las normativas locales de protección de datos.
- **Disaster Recovery:** Definir una estrategia de respaldos automatizados y un RPO/RTO adecuado para datos críticos de nómina y auditoría.

---

\newpage

# 13. REFERENCIAS

1. **OpenAPI Specification 3.0.3.** OpenAPI Initiative. Disponible en: [https://spec.openapis.org/oas/v3.0.3](https://spec.openapis.org/oas/v3.0.3)

2. **C4 Model for Software Architecture.** Simon Brown. Disponible en: [https://c4model.com/](https://c4model.com/)

3. **Next.js 16 Documentation.** Vercel. Disponible en: [https://nextjs.org/docs](https://nextjs.org/docs)

4. **Supabase Documentation.** Supabase Inc. Disponible en: [https://supabase.com/docs](https://supabase.com/docs)

5. **PostgreSQL 15 Documentation.** The PostgreSQL Global Development Group. Disponible en: [https://www.postgresql.org/docs/15/](https://www.postgresql.org/docs/15/)

6. **Redis Documentation.** Redis Ltd. Disponible en: [https://redis.io/docs/](https://redis.io/docs/)

7. **Martin Fowler.** *Patterns of Enterprise Application Architecture.* Addison-Wesley, 2002. Patrones: Repository, Service Layer, Unit of Work.

8. **Sam Newman.** *Building Microservices: Designing Fine-Grained Systems.* O'Reilly Media, 2021. Capítulos 1-3: Monolito Modular como paso intermedio.

9. **Vaughn Vernon.** *Domain-Driven Design Distilled.* Addison-Wesley, 2016. Bounded Contexts y Domain Events.

10. **OWASP API Security Top 10.** Open Web Application Security Project. Disponible en: [https://owasp.org/www-project-api-security/](https://owasp.org/www-project-api-security/)

11. **RFC 7519 — JSON Web Token (JWT).** IETF. Disponible en: [https://datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519)

12. **RFC 7231 — HTTP/1.1 Semantics and Content.** IETF. Disponible en: [https://datatracker.ietf.org/doc/html/rfc7231](https://datatracker.ietf.org/doc/html/rfc7231)

13. **PlantUML Documentation.** Disponible en: [https://plantuml.com/](https://plantuml.com/)

14. **C4-PlantUML Library.** Disponible en: [https://github.com/plantuml-stdlib/C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)

15. **Zod — TypeScript-first Schema Validation.** Disponible en: [https://zod.dev/](https://zod.dev/)

---

\newpage

# ANEXOS

## Anexo A: Estructura completa de archivos de entrega

```
gestion-rrhh/
│
├── README.md                                    # Documento Markdown (Integrantes, guía rápida)
│
├── informe/
│   └── informe_arquitectura.md                  # Informe consolidado (→ exportar a PDF)
│
├── docs/
│   │
│   ├── legacy/
│   │   ├── arquitectura_legado.png              # Diagrama del sistema legado
│   │   └── arquitectura_legado.puml             # Fuente editable PlantUML
│   │
│   ├── api/
│   │   ├── openapi.yaml                         # Contrato OpenAPI 3.0.3
│   │   ├── swagger.json                         # Versión JSON del contrato
│   │   └── swagger_ui.png                       # Evidencia de visualización en Swagger UI
│   │
│   ├── c4/
│   │   ├── c4_nivel1_contexto.png               # Diagrama Nivel 1 en PNG
│   │   ├── c4_nivel1_contexto.puml              # Fuente PlantUML Nivel 1
│   │   ├── c4_nivel2_contenedores.png           # Diagrama Nivel 2 en PNG
│   │   ├── c4_nivel2_contenedores.puml          # Fuente PlantUML Nivel 2
│   │   ├── c4_nivel3_componentes.png            # Diagrama Nivel 3 en PNG
│   │   ├── c4_nivel3_componentes.puml           # Fuente PlantUML Nivel 3
│   │   └── c4_nivel4_diagramas.puml             # Diagramas de código (Clases, E/R, Secuencia)
│   │
│   ├── database/
│   │   ├── modelo_datos.png                     # Diagrama E/R
│   │   ├── modelo_datos.puml                    # Fuente PlantUML del E/R
│   │   └── schema.sql                           # Script DDL + seeds
│   │
│   ├── cache/
│   │   ├── estrategia_cache.png                 # Diagrama de flujo de caché
│   │   └── estrategia_cache.puml                # Fuente PlantUML
│   │
│   └── evidence/
│       └── swagger_validacion.png               # Evidencia de validación en Swagger
│
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql               # Esquema original del sistema
    └── seed.sql                                 # Datos de prueba
```

## Anexo B: Usuarios de prueba del sistema

| Correo | Contraseña | Rol |
|--------|-----------|-----|
| admin@rrhh.com | Admin1234! | ADMIN_RRHH |
| jefe@rrhh.com | Jefe1234! | JEFE_INMEDIATO |
| reclutador@rrhh.com | Recluta1234! | RECLUTADOR |
| empleado@rrhh.com | Empleado1234! | EMPLEADO |

## Anexo C: Glosario de términos

| Término | Definición |
|---------|-----------|
| **BaaS** | Backend-as-a-Service. Modelo de servicio cloud que proporciona backend completo (base de datos, autenticación, almacenamiento) |
| **Bounded Context** | Frontera lógica dentro de la cual un modelo de dominio es consistente y tiene significado único |
| **Cache-Aside** | Patrón de caché donde la aplicación es responsable de leer y escribir en el caché |
| **DTO** | Data Transfer Object. Objeto que define la estructura de datos de transferencia entre capas |
| **JWT** | JSON Web Token. Estándar abierto para transmisión segura de información entre partes como objeto JSON |
| **RBAC** | Role-Based Access Control. Control de acceso basado en roles asignados a usuarios |
| **RLS** | Row Level Security. Mecanismo de PostgreSQL para control de acceso a nivel de fila |
| **RPC** | Remote Procedure Call. Invocación de funciones almacenadas en la base de datos |
| **SPA** | Single Page Application. Aplicación web que carga una única página HTML y actualiza dinámicamente |
| **SSR** | Server-Side Rendering. Renderizado de páginas en el servidor antes de enviarlas al cliente |
| **TTL** | Time To Live. Tiempo de vida de un dato en caché antes de su expiración automática |
