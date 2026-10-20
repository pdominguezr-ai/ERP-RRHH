# language: es
# Estándar Aplicado: ISO/IEC/IEEE 29119-3:2021 (Software Testing - Test Documentation)
# Requerimiento Vinculado: REQ-FN-001, REQ-NF-001 | Historia de Usuario: HU-01, HU-02
Característica: Autenticación Institucional, Emisión de JWT y Errores Estandarizados RFC 9457
  Como usuario registrado del sistema ERP de Recursos Humanos (ADMIN_RRHH, JEFE_INMEDIATO, RECLUTADOR o EMPLEADO)
  Quiero autenticarme mediante el endpoint POST /api/v1/auth/login con correo y contraseña
  Para obtener un token JWT firmado o recibir un diagnóstico estandarizado bajo RFC 9457 (application/problem+json).

  Antecedentes:
    Dado que el servicio de autenticación está conectado a PostgreSQL y al almacén de sesiones Redis
    Y el middleware de errores está configurado con el estándar RFC 9457 (application/problem+json)

  @smoke @happy_path @CP-01
  Escenario: Autenticación exitosa de un Administrador de RRHH y emisión de Token JWT
    Dado que existe un usuario activo en PostgreSQL con email "admin.rrhh@empresa.com" y rol "ADMIN_RRHH"
    Cuando envía una petición POST a "/api/v1/auth/login" con email "admin.rrhh@empresa.com" y password "Password123!"
    Entonces el código de respuesta HTTP debe ser 200
    Y el cuerpo JSON contiene un token JWT válido con tiempo de expiración de 3600 segundos
    Y la sesión activa queda registrada en Redis con TTL de 3600 segundos

  @bdd_outline @iso29119 @CP-02
  Esquema del escenario: Validación parametrizada de autenticación por roles y estados de cuenta
    Dado que el sistema evalúa el intento de acceso para el correo "<email>" con estado "<estado_cuenta>"
    Cuando el cliente envía POST a "/api/v1/auth/login" con email "<email>" y password "<password>"
    Entonces el servidor responde con el código de estado HTTP <status_http>
    Y el encabezado Content-Type corresponde a "<content_type>"
    Y el campo de resultado o código de problema es "<codigo_resultado>"

    Ejemplos:
      | email                       | password          | estado_cuenta | status_http | content_type                 | codigo_resultado        |
      | admin.rrhh@empresa.com      | Password123!      | ACTIVO        | 200         | application/json             | AUTH_SUCCESS            |
      | jefe@rrhh.com               | Jefe1234!         | ACTIVO        | 200         | application/json             | AUTH_SUCCESS            |
      | empleado@rrhh.com           | Empleado1234!     | ACTIVO        | 200         | application/json             | AUTH_SUCCESS            |
      | admin.rrhh@empresa.com      | ClaveIncorrecta99 | ACTIVO        | 401         | application/problem+json     | UNAUTHORIZED            |
      | inactivo.rrhh@empresa.com   | Password123!      | INACTIVO      | 403         | application/problem+json     | ACCOUNT_INACTIVE        |
      | correo-invalido-sin-arroba  | 123               | N/A           | 400         | application/problem+json     | VALIDATION_ERROR        |

  @exception @rfc9457 @CP-03
  Escenario: Verificación de estructura Problem Details (RFC 9457) ante credenciales inválidas
    Dado que un cliente no autorizado intenta acceder al endpoint "/api/v1/auth/login"
    Cuando envía el email "admin.rrhh@empresa.com" y la contraseña errónea "WrongPass!"
    Entonces el sistema responde con código HTTP 401 Unauthorized
    Y el encabezado "Content-Type" incluye "application/problem+json"
    Y el cuerpo JSON incluye las propiedades "type", "title", "status", "detail", "instance" y "timestamp"
