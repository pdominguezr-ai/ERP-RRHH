# Diagramas de Secuencia del Backend

Este documento detalla los flujos de comunicación y llamadas entre el frontend (UI), las Server Actions, los Servicios en TypeScript y la base de datos PostgreSQL/Supabase para los tres procesos transaccionales críticos.

---

## 1. Procesamiento de Nómina (CU-01)
Muestra cómo se valida, recalcula y bloquea una nómina.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as ADMIN_RRHH
    participant UI as NominaDetalleClient (UI)
    participant Act as Nomina Actions (Server Action)
    participant Srv as nominaService.ts
    participant Aud as auditoriaService.ts
    participant DB as Supabase / PostgreSQL

    Admin->>UI: Clic en "Procesar Nómina"
    UI->>UI: Mostrar modal confirmación
    Admin->>UI: Confirmar procesamiento
    UI->>Act: procesarNominaAction(nominaId)
    
    Act->>Srv: procesarNomina(nominaId)
    
    Srv->>DB: Obtener cabecera nómina (select)
    DB-->>Srv: Retorna datos de nómina (estado = 'BORRADOR')
    
    Srv->>DB: Obtener detalles y validar empleados activos
    DB-->>Srv: Retorna lista de detalles y estados de empleado
    
    Srv->>Srv: recalcularTotalesNomina(nominaId)
    Srv->>DB: Actualizar sumatoria total de la nómina
    DB-->>Srv: Confirmación OK
    
    Srv->>DB: Actualizar estado de nómina = 'PROCESADA'
    DB-->>Srv: Retorna registro actualizado
    
    Srv->>Aud: registrarAuditoria(tabla: 'nominas', datos_antes, datos_despues)
    Aud->>DB: Insertar registro en auditoria_cambios
    DB-->>Aud: Confirmación OK
    
    Srv-->>Act: Retorna nómina procesada
    Act-->>UI: Retorna { success: true }
    UI->>UI: Refrescar pantalla y bloquear botones
    UI-->>Admin: Mostrar banner de éxito
```

---

## 2. Aprobación o Rechazo de Solicitud de Ausencia (CU-02)
Muestra el control de estado para evitar reprocesos y guardar justificaciones.

```mermaid
sequenceDiagram
    autonumber
    actor Jefe as JEFE_INMEDIATO / ADMIN
    participant UI as SolicitudesClient (UI)
    participant Act as Solicitudes Actions (Server Action)
    participant Srv as solicitudService.ts
    participant Aud as auditoriaService.ts
    participant DB as Supabase / PostgreSQL

    Jefe->>UI: Clic en Aprobar / Rechazar
    UI->>UI: Abrir modal e ingresar observaciones
    Jefe->>UI: Clic en Confirmar
    UI->>Act: resolverSolicitud(id, estado, observaciones)
    
    Act->>Srv: updateSolicitudEstado(id, estado, observaciones, aprobadorId)
    
    Srv->>DB: Obtener estado actual (select)
    DB-->>Srv: Retorna solicitud (estado = 'PENDIENTE')
    
    Note over Srv: Si no está PENDIENTE, lanza Error.
    
    Srv->>DB: Guardar nuevo estado, observaciones, aprobador y fecha
    DB-->>Srv: Retorna solicitud actualizada
    
    Srv->>Aud: registrarAuditoria(tabla: 'solicitudes_ausencia', antes, despues)
    Aud->>DB: Insertar registro de bitácora
    DB-->>Aud: Confirmación OK
    
    Srv-->>Act: Retorna solicitud resuelta
    Act-->>UI: Retorna { success: true }
    UI->>UI: Recargar DataTable (estado actualizado)
    UI-->>Jefe: Mensaje de éxito en pantalla
```

---

## 3. Contratación Automática desde Reclutamiento (CU-03)
Muestra la creación transaccional de empleado y onboarding al contratar un candidato.

```mermaid
sequenceDiagram
    autonumber
    actor Rec as RECLUTADOR / ADMIN
    participant UI as ProcesoDetalleClient (UI)
    participant Act as Reclutamiento Actions
    participant Srv as reclutamientoService.ts
    participant Aud as auditoriaService.ts
    participant DB as Supabase / PostgreSQL

    Rec->>UI: Clic en "Contratar Candidato"
    UI->>UI: Mostrar advertencia de cierre de proceso
    Rec->>UI: Confirmar contratación
    UI->>Act: contratarCandidatoAction(candidatoId, procesoId)
    
    Act->>Srv: seleccionarCandidato(candidatoId, procesoId, responsableId)
    
    Srv->>DB: Obtener Proceso y validar estado ABIERTO/EN_PROCESO
    DB-->>Srv: Retorna Proceso de Reclutamiento
    
    Srv->>DB: Obtener Candidato (select)
    DB-->>Srv: Retorna Candidato
    
    Note over Srv: Crear nuevo registro en tabla de Empleados
    Srv->>DB: Insertar Empleado (nombres, apellidos, correo, estado: 'ACTIVO')
    DB-->>Srv: Retorna Empleado con nuevo ID
    Srv->>Aud: registrarAuditoria(tabla: 'empleados', INSERT)
    
    Note over Srv: Crear plan de Onboarding asociado
    Srv->>DB: Insertar Onboarding (empleado_id, estado: 'PENDIENTE')
    DB-->>Srv: Retorna Onboarding registrado
    Srv->>Aud: registrarAuditoria(tabla: 'onboarding', INSERT)
    
    Note over Srv: Actualizar estados de reclutamiento
    Srv->>DB: Actualizar Candidato = 'SELECCIONADO'
    DB-->>Srv: OK
    
    Srv->>DB: Buscar otros postulantes vinculados al proceso
    DB-->>Srv: Retorna lista de otros candidatos
    
    loop Para cada otro candidato
        Srv->>DB: Actualizar Candidato = 'RECHAZADO'
        DB-->>Srv: OK
    end
    
    Srv->>DB: Actualizar Proceso = 'CERRADO' (fecha_cierre = hoy)
    DB-->>Srv: Retorna Proceso cerrado
    
    Srv-->>Act: Retorna resultado consolidado de la contratación
    Act-->>UI: Retorna { success: true }
    UI->>UI: Refrescar tablas y redireccionar
    UI-->>Rec: Notificación de alta de empleado y onboarding
```
