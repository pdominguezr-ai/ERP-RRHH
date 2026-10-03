# language: es
Característica: Gestión de Solicitudes de Ausencia y Permisos Laborales
  Como Empleado de la empresa
  Quiero enviar solicitudes de vacaciones, permisos o incapacidades
  Para que mi jefe inmediato y el departamento de RRHH puedan evaluar y aprobar mi ausencia.

  Reglas de Negocio:
  - La fecha de inicio debe ser posterior o igual a la fecha actual.
  - La fecha de fin debe ser posterior o igual a la fecha de inicio.
  - El empleado debe contar con días disponibles de vacaciones para el tipo "VACACIONES".
  - Toda solicitud rechazada requiere ingresar obligatoriamente el motivo de rechazo.

  @happy_path
  Escenario: Solicitud exitosa de vacaciones por parte de un colaborador
    Dado que el empleado "EMP-0045" tiene 15 días disponibles de vacaciones
    Y se encuentra en la pantalla "/dashboard/solicitudes/nuevo"
    Cuando selecciona el tipo de ausencia "VACACIONES"
    Y especifica la fecha inicio "2026-11-01" y fecha fin "2026-11-05" (5 días laborales)
    Y redacta el motivo "Vacaciones anuales reglamentarias"
    Y presiona "Enviar Solicitud"
    Entonces la API POST "/api/v1/solicitudes" registra la solicitud en estado "PENDIENTE"
    Y responde con HTTP 201 Created y el ID de la solicitud generada
    Y el sistema envía una notificación por correo al jefe inmediato del colaborador

  @exception @error_path
  Escenario: Rechazo de solicitud por superación del saldo de días disponibles
    Dado que el empleado "EMP-0045" dispone únicamente de 3 días de vacaciones
    Cuando intenta registrar una solicitud del "2026-11-01" al "2026-11-10" (8 días laborales)
    Y presiona "Enviar Solicitud"
    Entonces el servicio de validación de negocio bloquea la solicitud
    Y retorna el código HTTP 400 Bad Request
    Y muestra el mensaje "Días solicitados (8) superan el saldo disponible del colaborador (3 días)."
