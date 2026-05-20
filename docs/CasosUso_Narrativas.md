# Casos de Uso y Narrativas de Interacción

Este documento describe detalladamente los casos de uso críticos del sistema, detallando los actores, precondiciones, flujo principal, flujos alternativos, excepciones y criterios de aceptación.

---

## 1. Caso de Uso: Procesar Nómina de Colaboradores (CU-01)

### 1.1 Ficha Descriptiva
*   **Actor Principal**: `ADMIN_RRHH` (Administrador de Recursos Humanos).
*   **Precondiciones**: 
    1.  Existen empleados registrados y activos en el sistema.
    2.  Existe una nómina en estado `BORRADOR` para el período actual.
*   **Garantías de Éxito (Postcondiciones)**:
    1.  El estado de la nómina cambia a `PROCESADA`.
    2.  Se calculan y consolidan los totales (`total_bruto`, `total_bonificaciones`, `total_deducciones`, `total_neto`).
    3.  Se registra el evento de procesamiento en la bitácora de auditoría.
    4.  Los detalles financieros de cada empleado quedan bloqueados para futuras ediciones.

### 1.2 Flujo Principal
1.  El **ADMIN_RRHH** ingresa al listado de nóminas y selecciona una nómina con estado `BORRADOR`.
2.  El sistema muestra el panel resumen con los totales provisionales y el desglose de pagos por colaborador.
3.  (Opcional) El **ADMIN_RRHH** edita los detalles financieros (bonos, descuentos, retenciones) de uno o varios colaboradores. El sistema valida los datos de entrada y recalcula los totales inmediatamente.
4.  El **ADMIN_RRHH** hace clic en el botón **"Procesar Nómina"**.
5.  El sistema presenta una pantalla de confirmación explicando que esta acción es irreversible.
6.  El **ADMIN_RRHH** confirma la acción.
7.  El sistema valida que todos los colaboradores involucrados en los detalles se encuentren en estado `ACTIVO`.
8.  El sistema cambia el estado de la nómina a `PROCESADA` en la base de datos de manera transaccional.
9.  El sistema registra el cambio en la bitácora de auditoría (`auditoria_cambios`) con el estado previo y el nuevo.
10. La interfaz se actualiza mostrando la nómina bloqueada en estado `PROCESADA` y emite un mensaje de éxito.

### 1.3 Excepciones y Flujos Alternativos
*   **Excepción 7a: Empleado Inactivo**: Si un empleado en el desglose de la nómina ya no está `ACTIVO` (e.g. fue desactivado durante el período de borrador), el sistema cancela el procesamiento, muestra un mensaje de advertencia indicando el nombre del colaborador inactivo, y mantiene la nómina en estado `BORRADOR` para su corrección.
*   **Excepción 3a: Valores Negativos**: Si el administrador intenta colocar montos menores a cero en bonos o deducciones, o si el neto resultante por colaborador es negativo, el sistema emite una alerta bloqueando la acción de guardado.

---

## 2. Caso de Uso: Resolver Solicitud de Ausencia (CU-02)

### 2.1 Ficha Descriptiva
*   **Actor Principal**: `JEFE_INMEDIATO` o `ADMIN_RRHH`.
*   **Precondiciones**:
    1.  Un colaborador ha registrado una solicitud de ausencia (vacaciones, permiso, incapacidad) que está en estado `PENDIENTE`.
*   **Garantías de Éxito (Postcondiciones)**:
    1.  El estado de la solicitud cambia a `APROBADA` o `RECHAZADA`.
    2.  Se registra la fecha de resolución, el usuario aprobador y las observaciones/motivos.
    3.  Se genera una bitácora de auditoría del cambio.

### 2.2 Flujo Principal
1.  El aprobador ingresa al panel de **"Solicitudes"**.
2.  El sistema muestra la tabla con las solicitudes, destacando las que tienen estado `PENDIENTE`.
3.  El aprobador analiza los detalles de la solicitud y hace clic en **Aprobar** (ícono verde) o **Rechazar** (ícono rojo).
4.  El sistema abre un modal de resolución solicitando comentarios u observaciones.
5.  El aprobador escribe la justificación.
6.  El aprobador confirma la resolución.
7.  El sistema actualiza el estado, graba las observaciones y guarda el ID del usuario aprobador junto a la fecha y hora de la resolución.
8.  El sistema registra la auditoría correspondiente.
9.  La interfaz refresca la tabla eliminando los botones de acción para esa solicitud ya resuelta.

### 2.3 Excepciones
*   **Excepción 5a: Rechazo sin Motivo**: Si el aprobador hace clic en Rechazar e intenta confirmar el modal con el campo de observaciones vacío, el sistema deshabilita el botón de confirmación indicando que el motivo de rechazo es obligatorio.
*   **Excepción 1a: Solicitud ya Procesada**: Si otro jefe aprobó/rechazó la solicitud simultáneamente, el sistema muestra un mensaje de error ("Esta solicitud ya fue procesada y se encuentra en estado APROBADA/RECHAZADA") y recarga la interfaz.

---

## 3. Caso de Uso: Contratación Automatizada y Onboarding (CU-03)

### 3.1 Ficha Descriptiva
*   **Actor Principal**: `RECLUTADOR` o `ADMIN_RRHH`.
*   **Precondiciones**:
    1.  Existe un proceso de reclutamiento en estado `ABIERTO` o `EN_PROCESO`.
    2.  Hay candidatos vinculados a dicho proceso en etapas de evaluación.
*   **Garantías de Éxito**:
    1.  El candidato seleccionado cambia a estado `SELECCIONADO`.
    2.  El proceso de reclutamiento cambia a estado `CERRADO`.
    3.  Los otros postulantes del proceso son marcados como `RECHAZADO`.
    4.  Se da de alta al nuevo empleado en estado `ACTIVO` con código único.
    5.  Se genera automáticamente su plan de Onboarding en estado `PENDIENTE`.
    6.  Se registran las inserciones y actualizaciones en la bitácora de auditoría.

### 3.2 Flujo Principal
1.  El **RECLUTADOR** ingresa a la vista de detalles del proceso de reclutamiento correspondiente.
2.  El sistema muestra la información de la vacante y el listado de candidatos vinculados con sus etapas actuales.
3.  El **RECLUTADOR** hace clic en el botón **"Contratar"** para el candidato que ha aprobado las fases.
4.  El sistema abre un cuadro de diálogo advirtiendo que esta acción cerrará la vacante y generará el descarte automático de los demás aplicantes.
5.  El **RECLUTADOR** confirma la acción.
6.  El sistema ejecuta de manera transaccional:
    *   Crea el registro de empleado utilizando el nombre, apellido, correo y teléfono del candidato.
    *   Genera un plan de Onboarding en estado `PENDIENTE` asignado a dicho empleado.
    *   Marca al candidato como `SELECCIONADO`.
    *   Marca a los otros candidatos vinculados a la vacante como `RECHAZADO`.
    *   Establece el estado del proceso de reclutamiento como `CERRADO` y define la fecha de cierre.
7.  El sistema crea bitácoras de auditoría para cada operación realizada (alta de empleado, alta de onboarding, actualizaciones de estado).
8.  El sistema redirige o notifica con un mensaje de éxito indicando la creación del empleado y el plan de onboarding.
