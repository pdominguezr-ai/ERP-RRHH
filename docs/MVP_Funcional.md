# Resumen del MVP Funcional y Guía de Despliegue

Este documento describe el estado final de la entrega del Producto Mínimo Viable (MVP) para el sistema de **Gestión de Recursos Humanos**, incluyendo características, tecnologías y pasos para la puesta en marcha.

---

## 1. Características Principales del MVP

El sistema de Gestión de RRHH ha pasado de un conjunto de pantallas CRUD básicas a una plataforma transaccional robusta con lógica de negocio y seguridad avanzada:

1.  **Dashboard Administrativo**: Vista consolidada de métricas clave (total de empleados, nóminas pendientes, solicitudes de ausencia activas y postulantes en curso).
2.  **Gestión de Empleados**: Expediente completo de colaboradores con asignación de salarios y puestos.
3.  **Procesamiento de Nómina Transaccional**:
    *   Generación automática a partir de empleados activos en estado `BORRADOR`.
    *   Edición interactiva de bonificaciones, deducciones y retenciones con validaciones de rangos y salarios netos negativos.
    *   Recálculo de totales en tiempo real en cabeceras.
    *   Procesamiento irrevocable que bloquea cambios de nómina y verifica estado activo de colaboradores.
4.  **Flujo de Solicitudes e Incapacidades**:
    *   Creación con control de rango de fechas.
    *   Resolución con modal interactivo de aprobación/rechazo requiriendo justificación obligatoria en caso de rechazo.
5.  **Reclutamiento y Contratación Automatizada**:
    *   Seguimiento de vacantes por procesos y etapas (`POSTULACION`, `ENTREVISTA`, etc.).
    *   Contratación atómica: Al seleccionar un candidato, el sistema lo promueve a empleado activo, genera su onboarding en estado pendiente, descarta a otros postulantes y cierra el proceso de reclutamiento.
6.  **Bitácora de Auditoría**: Visualización en tiempo real de todas las operaciones de modificación, creación y borrado, mostrando los estados de datos previos y posteriores y el usuario del sistema que ejecutó la acción.

---

## 2. Pila Tecnológica (Stack)

*   **Framework**: Next.js 15 (App Router).
*   **Lenguaje**: TypeScript (Tipado estricto).
*   **Estilos**: Tailwind CSS con diseño responsive y paleta de colores HSL.
*   **Base de Datos / Backend-as-a-Service**: Supabase + PostgreSQL.
*   **Autenticación**: Supabase Auth con middleware de redirección automática.
*   **Seguridad**: Row Level Security (RLS) habilitado en tablas de base de datos.

---

## 3. Instrucciones de Instalación y Ejecución Local

Sigue estos pasos para levantar el entorno de desarrollo del MVP en tu máquina local:

### 3.1 Prerrequisitos
*   Node.js (versión 18 o superior recomendada).
*   Una cuenta y proyecto creado en [Supabase](https://supabase.com/).

### 3.2 Clonar e Instalar Dependencias
Ingresa al directorio raíz del proyecto y ejecuta:
```bash
npm install
```

### 3.3 Configuración de Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

### 3.4 Inicialización de Base de Datos (Esquema SQL)
1.  Ingresa a tu consola del proyecto en Supabase.
2.  Ve al editor SQL (**SQL Editor**) y crea una nueva consulta.
3.  Copia y pega el contenido del archivo de migración ubicado en [001_initial_schema.sql](file:///supabase/migrations/001_initial_schema.sql) y ejecútalo para crear las tablas, llaves, triggers y políticas RLS.
4.  (Opcional) Ejecuta un script semilla (Seed) para registrar los usuarios de prueba e inicializar datos de demostración.

### 3.5 Ejecutar Servidor de Desarrollo
Para iniciar la aplicación en modo desarrollo local, ejecuta:
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000) para ver la aplicación web en funcionamiento.
