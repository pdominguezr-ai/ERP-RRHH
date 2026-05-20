# Gestión de Recursos Humanos

Sistema académico full stack para la administración integral de Recursos Humanos.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Estilos | Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Formularios | React Hook Form + Zod |
| UI | Lucide React, date-fns, clsx |

## Instalación

```bash
git clone <repo>
cd gestion-rrhh
npm install
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role (solo servidor) |

## Configuración de Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor**
3. Ejecutar `supabase/migrations/001_initial_schema.sql`
4. Ejecutar `supabase/seed.sql`

## Ejecución local

```bash
npm run dev      # http://localhost:3000
npm run build    # compilar producción
npm run lint     # linting
```

## Usuarios de prueba (seed)

| Correo | Contraseña | Rol |
|---|---|---|
| admin@rrhh.com | Admin1234! | ADMIN_RRHH |
| jefe@rrhh.com | Jefe1234! | JEFE_INMEDIATO |
| reclutador@rrhh.com | Recluta1234! | RECLUTADOR |
| empleado@rrhh.com | Empleado1234! | EMPLEADO |

## Módulos implementados

- ✅ Autenticación con Supabase Auth y control de roles
- ✅ CRUD de Empleados (con desactivación lógica)
- ✅ Nómina y Detalle de Nómina
- ✅ Asistencia (entrada / salida / horas trabajadas)
- ✅ Solicitudes de Ausencia (permiso, vacaciones, enfermedad)
- ✅ Reclutamiento y Candidatos
- ✅ Onboarding
- ✅ Beneficios y Capacitaciones
- ✅ Evaluaciones de Desempeño
- ✅ Reportes básicos de RRHH
- ✅ Cumplimiento Laboral

## Documentación Técnica Final

Todos los entregables académicos e informes de arquitectura y calidad del MVP se encuentran en la carpeta `docs/`:

1.  **[DERCAS y Especificación de Requerimientos](file:///docs/DERCAS_Final.md)**: Alcance, criterios INVEST y reglas de negocio.
2.  **[Matriz de Trazabilidad de Requerimientos (RTM)](file:///docs/RTM_Final.md)**: Mapeo de requerimientos (REQ-01 a REQ-24) a componentes lógicos y casos de prueba.
3.  **[Casos de Uso y Narrativas de Interacción](file:///docs/CasosUso_Narrativas.md)**: Narrativas de interacción detalladas para nóminas, solicitudes y contratación.
4.  **[Modelo de Arquitectura C4](file:///docs/Diagrama_C4.md)**: Niveles de contexto, contenedor y componente del sistema.
5.  **[Diagramas de Secuencia](file:///docs/Diagramas_Secuencia.md)**: Flujo de llamadas de backend y transacciones.
6.  **[Arquitectura y Patrones de Diseño](file:///docs/Arquitectura_Patrones.md)**: Service Pattern, Validation Layer y Auditoría.
7.  **[Plan de Pruebas y QA](file:///docs/Plan_Pruebas_QA.md)**: 24 casos de prueba específicos (CP-01 a CP-24).
8.  **[Resumen del MVP Funcional y Guía de Despliegue](file:///docs/MVP_Funcional.md)**: Guía paso a paso para instalación local.

## Orden de migraciones

```
supabase/migrations/001_initial_schema.sql   → tablas, relaciones, RLS, índices, triggers
supabase/seed.sql                            → datos de prueba
```

## Estructura del proyecto

```
src/
├── app/           → rutas (App Router)
├── components/    → ui / forms / tables / layout
├── lib/           → supabaseClient, supabaseServer, auth, permissions, utils, validators
├── services/      → lógica de acceso a datos (Nómina, Reclutamiento, Auditoría, etc.)
├── types/         → tipos TypeScript
└── middleware.ts  → protección de rutas
supabase/
├── migrations/    → esquema SQL
└── seed.sql       → datos de prueba
docs/              → documentación técnica del entregable final
```
