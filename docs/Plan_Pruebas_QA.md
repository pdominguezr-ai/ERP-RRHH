# Plan de Pruebas y Aseguramiento de Calidad (QA)

Este documento define la estrategia de pruebas y detalla los 24 casos de prueba (CP-01 al CP-24) diseñados para verificar y validar las reglas de negocio y requerimientos del sistema de **Gestión de Recursos Humanos**.

---

## 1. Estrategia de Pruebas

El plan de aseguramiento de calidad del MVP abarca:
1.  **Pruebas Unitarias**: Verificación de las reglas matemáticas y de negocio en `validators.ts`.
2.  **Pruebas de Integración**: Pruebas de flujo de servicios en interacción directa con Supabase/PostgreSQL.
3.  **Pruebas de Caja Negra (Funcionales)**: Navegación de interfaz, envíos de formulario y alertas visuales.

---

## 2. Casos de Prueba Mapeados (CP-01 a CP-24)

### CP-01: Registro de Empleado (Mapeado a RF-01)
*   **Entrada**: Nombres: "Gabriel", Apellidos: "García", Correo: "gabriel.garcia@mail.com", Salario Base: 2500, Rol: "EMPLEADO", Código: "EMP-9081".
*   **Procedimiento**: Completar formulario en `/dashboard/empleados/nuevo` y hacer clic en Guardar.
*   **Resultado Esperado**: Empleado registrado correctamente, listado en DataTable de empleados y un registro en `auditoria_cambios` de tipo `INSERT`.

### CP-02: Procesar Nómina en Estado BORRADOR (Mapeado a RF-02)
*   **Entrada**: ID de Nómina en BORRADOR.
*   **Procedimiento**: Ingresar al detalle de nómina en `/dashboard/nomina/[id]`, presionar "Procesar Nómina", y confirmar en el diálogo.
*   **Resultado Esperado**: Nómina cambia de estado a PROCESADA, desaparecen los botones de edición de detalles y se genera bitácora de auditoría.

### CP-03: Cálculo Neto de Nómina (Mapeado a RF-03)
*   **Entrada**: Detalle de nómina con Salario Base: 1000.00, Bonos: 150.00, Deducciones: 50.00, Retenciones: 50.00.
*   **Procedimiento**: Modificar campos del empleado y presionar "Guardar Cambios" en el modal de detalles de nómina.
*   **Resultado Esperado**: El salario neto se calcula automáticamente en base a $1000 + 150 - 50 - 50 = 1050.00$. El total neto de la nómina se actualiza en consecuencia.

### CP-04: Vincular Candidato a Proceso de Reclutamiento (Mapeado a RF-04)
*   **Entrada**: Candidato en estado "REGISTRADO", Vacante Abierta.
*   **Procedimiento**: Ir al detalle de la vacante, abrir modal "Vincular Candidato", seleccionar postulante y confirmar.
*   **Resultado Esperado**: Candidato figura en la tabla de postulantes del proceso, su estado general cambia a "EN_PROCESO".

### CP-05: Contratación y Onboarding (Mapeado a RF-05)
*   **Entrada**: Candidato en proceso, vacante en estado "ABIERTO".
*   **Procedimiento**: En el detalle del proceso, presionar "Contratar" en el candidato deseado y confirmar.
*   **Resultado Esperado**: Proceso pasa a CERRADO, candidato a SELECCIONADO, los otros postulantes a RECHAZADO, se crea empleado ACTIVO y se inserta un plan de Onboarding en estado PENDIENTE.

### CP-06: Registro de Asistencia Única por Día (Mapeado a RF-06)
*   **Entrada**: Empleado ID, Fecha actual, hora de entrada.
*   **Procedimiento**: Registrar check-in del empleado en el panel de asistencia.
*   **Resultado Esperado**: Registro exitoso. Si se intenta registrar otro check-in para el mismo empleado en la misma fecha, el sistema debe arrojar un error de clave duplicada o validación controlada.

### CP-07: Solicitud de Ausencia con Fechas Válidas (Mapeado a RF-07)
*   **Entrada**: Fecha Inicio: 2026-06-01, Fecha Fin: 2026-05-30 (Fecha fin menor que inicio).
*   **Procedimiento**: Intentar crear solicitud de permiso en `/dashboard/solicitudes/nuevo`.
*   **Resultado Esperado**: El validador bloquea el envío y muestra error: "La fecha de fin no puede ser anterior a la fecha de inicio."

### CP-08: Registro de Evaluación de Desempeño (Mapeado a RF-08)
*   **Entrada**: Puntaje: 85, Comentarios: "Excelente desempeño".
*   **Procedimiento**: Crear evaluación para un colaborador en el módulo correspondiente.
*   **Resultado Esperado**: Registro en estado BORRADOR o FINALIZADA según selección, visible en el expediente del empleado.

### CP-09: Asignación de Capacitación (Mapeado a RF-09)
*   **Entrada**: Curso: "Seguridad Industrial", Empleado ID.
*   **Procedimiento**: Registrar empleado en el curso desde el panel de Capacitaciones.
*   **Resultado Esperado**: Colaborador añadido correctamente al listado de participantes.

### CP-10: Asignación de Beneficio (Mapeado a RF-10)
*   **Entrada**: Beneficio: "Seguro Médico Privado".
*   **Procedimiento**: Asignar beneficio a un empleado desde el catálogo.
*   **Resultado Esperado**: Beneficio asignado exitosamente y reflejado en el perfil del empleado.

### CP-11: Portal del Empleado (Mapeado a RF-11)
*   **Entrada**: Login como EMPLEADO.
*   **Procedimiento**: Acceder al Dashboard principal de autogestión.
*   **Resultado Esperado**: Visualización exclusiva de datos personales, recibos propios de nómina y solicitud de ausencias, sin acceso a paneles de administración.

### CP-12: Reportes de Rotación (Mapeado a RF-12)
*   **Entrada**: Clic en la pestaña "Reportes".
*   **Procedimiento**: Visualizar estadísticas de RRHH.
*   **Resultado Esperado**: Carga correcta de gráficas e indicadores clave de bajas de personal.

### CP-13: Panel de Cumplimiento (Mapeado a RF-13)
*   **Entrada**: Acceso a `/dashboard/cumplimiento`.
*   **Procedimiento**: Consultar el estado de normativas laborales.
*   **Resultado Esperado**: Se listan los registros de cumplimiento vigentes con su estatus de revisión.

### CP-14: Exportación de Reportes (Mapeado a RF-14)
*   **Procedimiento**: Hacer clic en el botón de impresión o exportación en la vista de reportes.
*   **Resultado Esperado**: Se abre el cuadro de diálogo de impresión del navegador formateado adecuadamente.

### CP-15: Autenticación de Usuario (Mapeado a RNF-01)
*   **Entrada**: Correo y Contraseña válidos.
*   **Procedimiento**: Iniciar sesión desde `/login`.
*   **Resultado Esperado**: Redirección exitosa al Dashboard de RRHH y almacenamiento seguro del token JWT.

### CP-16: Control de Acceso RBAC (Mapeado a RNF-02)
*   **Entrada**: Usuario con rol "EMPLEADO" intenta ingresar por URL a `/dashboard/auditoria` o `/dashboard/nomina`.
*   **Procedimiento**: Ingresar dirección de forma directa en el navegador.
*   **Resultado Esperado**: Redirección o mensaje de error indicando permisos insuficientes.

### CP-17: Tiempo de Respuesta en DataTable (Mapeado a RNF-03)
*   **Procedimiento**: Cargar lista de empleados con más de 100 registros.
*   **Resultado Esperado**: Renderizado y paginación en menos de 2 segundos.

### CP-18: Estructura Mantenible (Mapeado a RNF-04)
*   **Procedimiento**: Revisión de código de servicios.
*   **Resultado Esperado**: Toda interacción directa con el cliente Supabase está en `src/services/` y no mezclada en componentes React.

### CP-19: Registro de Auditoría (Mapeado a RNF-05)
*   **Procedimiento**: Modificar el salario de un empleado.
*   **Resultado Esperado**: Aparece un nuevo registro en `/dashboard/auditoria` detallando la operación `UPDATE` en la tabla `empleados`, mostrando el salario anterior y el nuevo.

### CP-20: Row Level Security - RLS (Mapeado a RNF-06)
*   **Procedimiento**: Intentar consultar la tabla `auditoria_cambios` usando el cliente Supabase con token de un EMPLEADO.
*   **Resultado Esperado**: Supabase retorna un arreglo vacío o error de permisos.

### CP-21: Restauración de Base de Datos (Mapeado a RNF-07)
*   **Procedimiento**: Correr migraciones SQL en una base de datos PostgreSQL limpia.
*   **Resultado Esperado**: Creación exitosa de tablas, llaves foráneas, restricciones y triggers sin errores.

### CP-22: Adaptabilidad Móvil (Mapeado a RNF-08)
*   **Procedimiento**: Visualizar el sistema en una ventana de navegador reducida a ancho de smartphone (375px).
*   **Resultado Esperado**: El Sidebar se colapsa/adapta y la cuadrícula de tarjetas se redistribuye a una sola columna de lectura fluida.

### CP-23: Validación de Errores Críticos (Mapeado a RNF-09)
*   **Procedimiento**: Intentar procesar una nómina vacía (sin empleados).
*   **Resultado Esperado**: Se detiene la operación y se muestra una alerta roja visible indicando el motivo detallado.

### CP-24: Tipado Estricto de Código (Mapeado a RNF-10)
*   **Procedimiento**: Ejecutar el comando de compilación de TypeScript (`npx tsc --noEmit`).
*   **Resultado Esperado**: Compilación finalizada con éxito sin errores de sintaxis o asignación de tipos.
