# Registro de Pendientes de Entrega y Acciones Recomendadas
**Sistema ERP de Gestión de Recursos Humanos y Recursos Corporativos (ERP-RRHH)**  
**Universidad Mariano Gálvez de Guatemala** | Análisis de Sistemas II  
**Fecha de Revisión:** 22 de Octubre de 2026  

---

## 📋 Lista Priorizada de Tareas y Dependencias Externas

Este documento registra de manera transparente y objetiva las **únicas tareas pendientes y verificaciones manuales** que requieren intervención humana o gestión de credenciales externas antes de la defensa final del proyecto.

---

### 🔴 1. Cambiar Visibilidad del Tablero Ágil a PÚBLICA en GitHub Projects
* **Prioridad:** ALTA (Impacto directo en la evaluación docente del Criterio 1).
* **Problema Confirmado:** Al abrir el enlace [https://github.com/users/pdominguezr-ai/projects/1/views/1](https://github.com/users/pdominguezr-ai/projects/1/views/1) en una pestaña de incógnito o sin iniciar sesión, GitHub devuelve **`HTTP 404 Not Found`** porque los proyectos de GitHub Projects v2 se crean privados por defecto.
* **Acción Inmediata Requerida:**
  1. Iniciar sesión en GitHub con la cuenta propietaria (`pdominguezr-ai`) o administradora del proyecto.
  2. Ingresar a: `https://github.com/users/pdominguezr-ai/projects/1`.
  3. En la esquina superior derecha del tablero, hacer clic en el botón de tres puntos `...` (o ícono de engranaje ⚙️) y seleccionar **Settings**.
  4. En la barra lateral izquierda, bajar a la sección **Danger Zone**.
  5. En **Change project visibility**, hacer clic en **Change visibility** y seleccionar **Public** (Público).
  6. Confirmar la acción.
* **Verificación:** Abrir una ventana de incógnito y recargar el enlace. El tablero debe mostrar las columnas (*Backlog, In Progress, QA, Done*) sin solicitar inicio de sesión.
* **Plan de Respaldo para la Defensa:** Si por razones de tiempo el propietario no cambia el permiso antes de la clase, el docente puede evaluar la gestión ágil directamente en el repositorio local mediante [`docs/agile/backlog.md`](./docs/agile/backlog.md) y en el PDF maestro [`informe/informe_proyecto_final.pdf`](./informe/informe_proyecto_final.pdf#page=4) (Sección 2).

---

### 🟡 2. Publicación de Enlace Real en Figma vs Uso del Visor Local Autónomo
* **Prioridad:** MEDIA (Impacto en la evaluación del Criterio 5).
* **Problema Confirmado:** La petición HTTP al enlace documentado `https://www.figma.com/design/pdominguezr-ai/ERP-RRHH-Prototype` retorna **`HTTP/1.1 404 Not Found`** (enlace inactivo o borrador no publicado).
* **Acción Recomendada:**
  1. Si el equipo posee el archivo de diseño en su cuenta de Figma:
     - Abrir el archivo en Figma Desktop / Web.
     - Presionar el botón superior azul **Share** (Compartir).
     - Cambiar la opción de acceso a *"Anyone with the link can view"* (Cualquiera con el enlace puede ver).
     - Copiar el enlace generado y actualizar la referencia en caso de que el docente exija abrir el lienzo directamente en la web de Figma.
  2. **Estrategia para la Defensa en Vivo (Recomendada):**  
     - Utilizar directamente el **visor interactivo web local** incluido en [`docs/ui/prototipo_interactivo.html`](./docs/ui/prototipo_interactivo.html) o [`public/prototipo.html`](./public/prototipo.html).
     - Este visor fue construido para emular la barra y navegación de Figma, contiene todas las pantallas y opera de forma autónoma sin depender de conexión a internet en el campus ni de inicios de sesión.

---

### 🟢 3. Conexión de Clústeres NoSQL Standalone en la Nube (Opcional)
* **Prioridad:** BAJA (Opcional / Despliegue en Entorno de Producción).
* **Estado Actual:**
  - **PostgreSQL en Supabase:** Es la única base de datos transaccional real conectada con DDL formal, tablas, claves foráneas y RLS en [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql).
  - **Redis, MongoDB y Neo4j:** Están implementados como **adaptadores en memoria simulados** en [`src/config/database.ts`](./src/config/database.ts). Esta arquitectura modular permite que el proyecto sea 100% autónomo para el docente (ejecutando `npm run dev` y `npm test` en 29 segundos sin Docker ni costos de nube).
* **Acción para Producción:** Si en una fase posterior a la entrega académica se desea conectar instancias físicas remotas (Redis en Upstash, MongoDB Atlas y Neo4j AuraDB), simplemente se configuran las URLs en `.env.local` sin modificar el código de los controladores ni servicios.

---

### 🟢 4. Automatización de Runner E2E de Navegador Headless (Mejora Continua)
* **Prioridad:** BAJA (Mejora Continua / Pipeline CI/CD).
* **Estado Actual:**
  - El proyecto cuenta con **20 pruebas automáticas en PASS** en [`tests/`](./tests/) que validan patrones GoF, algoritmos de deducciones laborales de nómina y contratos API REST bajo RFC 9457 y Cache-Aside.
  - Los criterios de aceptación de usuario están formalizados en sintaxis Gherkin en [`features/`](./features/).
* **Acción Futura:** En un pipeline de GitHub Actions se puede integrar `@playwright/test` para automatizar los clics sobre el navegador web a partir de los archivos `.feature`.

---

## 📌 Resumen de Estado para la Entrega Final
* ✅ **Documentos e Informes:** 100% generados, auténticos (PDFs válidos con firma `%PDF`) e indexados con enlaces relativos.
* ✅ **Backend y API:** 100% funcional y probado con `npm test` (20/20 PASS) y `npm run dev`.
* ✅ **Frontend y Prototipo:** 100% operativo en Next.js 16 y visor interactivo HTML local.
* ⚠️ **Atención Crítica Previa a la Entrega:** Solicitar al compañero Paul que configure el proyecto de GitHub Projects como **Público** (Punto 1).
