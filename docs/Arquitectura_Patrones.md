# Arquitectura de Software y Patrones de Diseño

Este documento describe las bases arquitectónicas, patrones de diseño y decisiones tecnológicas aplicadas en el desarrollo del sistema de **Gestión de Recursos Humanos**.

---

## 1. Patrones de Diseño Implementados

### 1.1 Service/Repository Pattern
Toda la lógica de acceso a datos y comunicación con Supabase se encuentra aislada en archivos especializados dentro de `src/services/` (e.g. `empleadoService.ts`, `nominaService.ts`). 
*   **Ventaja**: El frontend o las Server Actions no conocen los detalles internos del SDK de Supabase o consultas SQL. Si se cambiara la base de datos o el SDK, solo se modifican los servicios.
*   **Implementación**:
    ```typescript
    // Ejemplo simplificado en src/services/
    export async function getEmpleados() {
       const supabase = await createSupabaseServerClient();
       return await supabase.from('empleados').select('*');
    }
    ```

### 1.2 Validation Layer (Filtro Anti-corrupción)
Implementado de forma centralizada en `src/lib/validators.ts`. 
*   **Propósito**: Garantizar que ningún dato corrupto o inconsistente sea enviado a la base de datos.
*   **Uso**: Invocado en la capa de servicios antes de realizar operaciones de inserción o actualización (e.g., comprobar que las deducciones no excedan el salario, o que las fechas de ausencia sean válidas).

### 1.3 Auditoria / Logger Pattern (AOP - Aspect Oriented-like Programming)
Para cumplir con los estándares de cumplimiento y trazabilidad académica, se implementa una bitácora de auditoría histórica (`auditoria_cambios`).
*   **Funcionamiento**: Cada servicio que modifica una entidad crítica (nóminas, solicitudes, reclutamiento) realiza una llamada explícita a `registrarAuditoria` indicando la tabla, el ID de registro, la operación (`INSERT`, `UPDATE`, `DELETE`) y el estado anterior y posterior de los datos.

---

## 2. Decisiones de Arquitectura Frontend (Next.js)

### 2.1 Server Components vs Client Components
*   **Server Components (Por defecto)**: Utilizados en las páginas de rutas (e.g., `src/app/dashboard/nomina/page.tsx`, `src/app/dashboard/nomina/[id]/page.tsx`). Realizan el fetch de datos directo desde Supabase en el servidor. Esto reduce la carga de JavaScript en el navegador, protege credenciales y optimiza el SEO y la velocidad de renderizado.
*   **Client Components (Directiva `'use client'`)**: Utilizados en componentes que requieren interactividad con el usuario, hooks de estado (`useState`, `useEffect`) y disparadores de eventos (e.g. `NominaDetalleClient.tsx`, `SolicitudesClient.tsx`).

### 2.2 Server Actions
En lugar de crear APIs REST tradicionales (`/api/nomina/procesar`), Next.js nos permite declarar funciones asíncronas de servidor que se ejecutan directamente en Node.js de forma segura.
*   **Declaración**: Marcadas con `'use server'` en archivos `actions.ts`.
*   **Beneficio**: Redirecciones fáciles y recarga automática de caché en el cliente mediante `revalidatePath`.

---

## 3. Seguridad y Control de Acceso (RBAC)

### 3.1 Supabase Row Level Security (RLS)
La base de datos tiene activado RLS en todas sus tablas críticas.
*   Las consultas directas desde el frontend cliente respetan las políticas definidas por el rol del usuario autenticado.
*   El rol del usuario se recupera de forma segura a través de `auth.users` y mapea con la tabla `usuarios_sistema`.

### 3.2 Protección de Rutas y Menú Dinámico
*   El [Sidebar](file:///src/components/layout/Sidebar.tsx) se adapta según el rol del usuario para no mostrar enlaces no permitidos.
*   La lógica de validación de roles en Server Actions y endpoints restringe acciones administrativas a usuarios con roles correspondientes.
