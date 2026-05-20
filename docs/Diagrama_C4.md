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

    NomService & SolService & RecService & AudService & EmpService & OnbService -->|Acceso a Datos| Supabase[(Supabase SDK / PostgreSQL)]
```

---

## 4. Mapeo de Contenedores a Código Fuente
*   **Frontend SPA (React)**: Ubicado en `src/app/` (vistas e interacciones del cliente con componentes dinámicos e interactivos en TypeScript).
*   **Server Actions**: Implementado en archivos `actions.ts` dentro de cada módulo en `src/app/dashboard/`.
*   **Capa de Servicios / Repositorios**: Ubicado en `src/services/` (`nominaService.ts`, `solicitudService.ts`, `reclutamientoService.ts`, `auditoriaService.ts`).
*   **Persistencia (PostgreSQL)**: Definido en las tablas y triggers del esquema SQL en `supabase/migrations/001_initial_schema.sql`.
