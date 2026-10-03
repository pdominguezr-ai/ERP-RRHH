# Diagrama y Modelo C4 del Sistema

Este documento describe la arquitectura de software del sistema de **Gestión de Recursos Humanos** mediante el modelo C4 (Contexto, Contenedor y Componente) utilizando diagramas de bloques Mermaid.

---

## 1. Nivel 1: Diagrama de Contexto de Sistema
Define el alcance del sistema y cómo interactúan los usuarios con él y con sistemas externos.

```mermaid
graph TD
    User["Colaborador / Administrador RRHH<br>(Empleado, Jefe, Aprobador)"] -->|Usa la plataforma web para| System["Sistema ERP de RRHH<br>(Next.js Web App)"]
    System -->|Autenticación y Sesiones| SupabaseAuth["Supabase Auth Service<br>(External OAuth/OAuth2/Email)"]
    System -->|Registro de Auditoría y Persistencia| PostgreSQL["PostgreSQL DB<br>(Supabase Hosted)"]
    System -->|Notificaciones por Correo| SMTP["Servidor de Correo / SMTP<br>(Notificaciones de Nómina y Ausencias)"]
```

---

## 2. Nivel 2: Diagrama de Contenedores
Muestra la composición tecnológica detallada del sistema RRHH.

```mermaid
graph TD
    subgraph "RRHH System (Next.js Application)"
        UI["Frontend Single Page App<br>(React, Tailwind CSS, Lucide Icons)"]
        ServerActions["Server Actions / API Router<br>(Next.js Node.js Server Environment)"]
        Services["Capa de Servicios de Negocio<br>(TypeScript Services / Repositories)"]
    end

    User["Colaboradores / RRHH"] -->|HTTP / HTTPS| UI
    UI -->|Invoca de forma segura| ServerActions
    ServerActions -->|Llama lógica de| Services
    
    Services -->|Consultas y Mutaciones SQL| DatabaseClient[(Supabase Client)]
    DatabaseClient -->|SSL Session| PostgreSQL[(Supabase PostgreSQL Database)]
    
    Services -->|Validación de JWT / Sesiones| SupabaseAuth["Supabase Auth Engine"]
```

---

## 3. Nivel 3: Diagrama de Componentes
Detalla la estructura interna de la capa de backend de Next.js (`Server Actions` y `Services`) y su comunicación con la base de datos PostgreSQL.

```mermaid
graph TD
    subgraph "Capa de Servidor (App Router)"
        Actions["Server Actions / Controladores<br>(e.g. actions.ts en Nómina, Reclutamiento, Solicitudes)"]
        Validators["Validators Engine<br>(lib/validators.ts)"]
        
        subgraph "Servicios de RRHH (services/)"
            NomService["nominaService.ts"]
            SolService["solicitudService.ts"]
            RecService["reclutamientoService.ts"]
            AudService["auditoriaService.ts"]
            EmpService["empleadoService.ts"]
            OnbService["onboardingService.ts"]
        end
    end

    UI["Vistas e Interacción de Cliente"] -->|Dispara mutaciones| Actions
    Actions -->|Valida reglas de negocio| Validators
    
    Actions -->|Invoca| NomService
    Actions -->|Invoca| SolService
    Actions -->|Invoca| RecService
    Actions -->|Invoca| EmpService

    NomService -->|Registra bitácora| AudService
    SolService -->|Registra bitácora| AudService
    RecService -->|Registra bitácora| AudService
    RecService -->|Da de alta| EmpService
    RecService -->|Genera plan| OnbService

    NominaService & SolicitudService & RecService & AudService & EmpService & OnbService -->|Acceso a Datos| Supabase[(Supabase SDK / PostgreSQL)]
```

---

## 4. Nivel 4: Diagramas de Código (C4-4)
Descomposición detallada a nivel de clases, entidades de base de datos y flujos de secuencia.

### 4.1 Diagrama de Clases / Arquitectura Interna de TypeScript
Muestra la organización de servicios, capas de validación y repositorios de datos.

```mermaid
classDiagram
    class EmpleadoService {
        +getEmpleados()
        +getEmpleadoById(id: string)
        +createEmpleado(data: EmpleadoInput)
        +updateEmpleado(id: string, data: Partial~EmpleadoInput~)
        +deleteEmpleado(id: string)
    }

    class NominaService {
        +getNominas()
        +getNominaById(id: string)
        +createNomina(data: NominaInput)
        +recalcularTotalesNomina(nominaId: string)
        +procesarNomina(nominaId: string)
    }

    class SolicitudService {
        +getSolicitudes()
        +createSolicitud(data: SolicitudInput)
        +updateSolicitudEstado(id: string, estado: string, observaciones: string)
    }

    class ReclutamientoService {
        +getProcesos()
        +getCandidatos()
        +seleccionarCandidato(candidatoId: string, procesoId: string)
    }

    class AuditoriaService {
        +registrarAuditoria(tabla: string, registroId: string, operacion: string, antes: JSON, despues: JSON)
    }

    class Validators {
        +validateEmpleado(data: unknown)
        +validateNomina(data: unknown)
        +validateSolicitud(data: unknown)
    }

    EmpleadoService ..> AuditoriaService : Bitácora
    NominaService ..> AuditoriaService : Bitácora
    SolicitudService ..> AuditoriaService : Bitácora
    ReclutamientoService ..> AuditoriaService : Bitácora
    ReclutamientoService ..> EmpleadoService : Crea Empleado
    NominaService ..> Validators : Valida Reglas
    SolicitudService ..> Validators : Valida Fechas
```

---

### 4.2 Diagrama Entidad-Relación (E/R) - Modelo de Datos PostgreSQL
Muestra las tablas principales del esquema relacional en Supabase/PostgreSQL y sus cardinalidades.

```mermaid
erDiagram
    USUARIOS_SISTEMA ||--o{ EMPLEADOS : "asociado_a"
    USUARIOS_SISTEMA ||--o| ADMINISTRADORES_RRHH : "rol_admin"
    USUARIOS_SISTEMA ||--o| JEFES_INMEDIATOS : "rol_jefe"
    USUARIOS_SISTEMA ||--o| RECLUTADORES : "rol_reclutador"
    
    EMPLEADOS ||--o{ EMPLEADOS : "jefe_inmediato"
    EMPLEADOS ||--o{ DETALLE_NOMINA : "tiene_pagos"
    EMPLEADOS ||--o{ ASISTENCIAS : "registra"
    EMPLEADOS ||--o{ SOLICITUDES_AUSENCIA : "solicita"
    EMPLEADOS ||--o{ EVALUACIONES_DESEMPENO : "evaluado"
    EMPLEADOS ||--o{ ONBOARDING : "inicia"
    EMPLEADOS ||--o{ CAPACITACION_EMPLEADOS : "inscribe"
    EMPLEADOS ||--o{ EMPLEADO_BENEFICIOS : "recibe"

    NOMINAS ||--|{ DETALLE_NOMINA : "contiene"
    PROCESOS_RECLUTAMIENTO ||--o{ PROCESO_RECLUTAMIENTO_CANDIDATOS : "contiene"
    CANDIDATOS ||--o{ PROCESO_RECLUTAMIENTO_CANDIDATOS : "postula"
    RECLUTADORES ||--o{ PROCESOS_RECLUTAMIENTO : "gestiona"

    CAPACITACIONES ||--o{ CAPACITACION_EMPLEADOS : "asigna"
    BENEFICIOS ||--o{ EMPLEADO_BENEFICIOS : "asigna"
    USUARIOS_SISTEMA ||--o{ AUDITORIA_CAMBIOS : "genera"

    USUARIOS_SISTEMA {
        uuid id PK
        uuid auth_user_id UK
        string correo UK
        string rol
        boolean activo
    }

    EMPLEADOS {
        uuid id PK
        string codigo UK
        string nombres
        string apellidos
        string correo UK
        numeric salario_base
        string estado
        uuid jefe_inmediato_id FK
        uuid usuario_id FK
    }

    NOMINAS {
        uuid id PK
        date periodo_inicio
        date periodo_fin
        string estado
        numeric total_bruto
        numeric total_neto
    }

    DETALLE_NOMINA {
        uuid id PK
        uuid nomina_id FK
        uuid empleado_id FK
        numeric salario_base
        numeric bonificaciones
        numeric deducciones
        numeric retenciones
        numeric salario_neto
    }

    SOLICITUDES_AUSENCIA {
        uuid id PK
        uuid empleado_id FK
        string tipo
        date fecha_inicio
        date fecha_fin
        string estado
        uuid aprobado_por FK
    }

    CANDIDATOS {
        uuid id PK
        string nombres
        string apellidos
        string correo
        string estado
    }

    PROCESOS_RECLUTAMIENTO {
        uuid id PK
        string titulo
        string puesto
        string estado
        uuid reclutador_id FK
    }
```

---

### 4.3 Diagramas de Secuencia Transaccionales
Los flujos de interacción detallados paso a paso entre el Cliente (UI), Server Actions, Servicios y PostgreSQL se encuentran documentados independientemente en [Diagramas_Secuencia.md](./Diagramas_Secuencia.md):
1. **CU-01 Procesamiento de Nómina**: Validación, cálculo e inactivación de cambios.
2. **CU-02 Aprobación / Rechazo de Ausencia**: Control de estados `PENDIENTE` y registro de justificaciones.
3. **CU-03 Contratación Automática**: Alta de empleado y generación de plan de Onboarding al seleccionar un candidato.

---

## 5. Mapeo de Contenedores a Código Fuente
*   **Frontend SPA (React)**: Ubicado en `src/app/` (vistas e interacciones del cliente con componentes dinámicos e interactivos en TypeScript).
*   **Server Actions**: Implementado en archivos `actions.ts` dentro de cada módulo en `src/app/dashboard/`.
*   **Capa de Servicios / Repositorios**: Ubicado en `src/services/` (`nominaService.ts`, `solicitudService.ts`, `reclutamientoService.ts`, `auditoriaService.ts`).
*   **Persistencia (PostgreSQL)**: Definido en las tablas y triggers del esquema SQL en `supabase/migrations/001_initial_schema.sql`.
