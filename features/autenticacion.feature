# language: es
Característica: Autenticación y Control de Acceso al Sistema de RRHH
  Como usuario del sistema (Administrador, Jefe Inmediato o Empleado)
  Quiero autenticarme con mis credenciales institucionales
  Para acceder a los módulos de gestión de recursos humanos según mi rol.

  Reglas de Negocio:
  - El email debe corresponder a un usuario activo registrado en el sistema.
  - La contraseña debe tener al menos 8 caracteres y cumplir políticas de seguridad.
  - Tras 3 intentos fallidos consecutivos, la cuenta se bloquea por 15 minutos.
  - Las sesiones expiran tras 60 minutos de inactividad.

  @smoke @happy_path
  Escenario: Autenticación exitosa de un Administrador de RRHH
    Dado que el usuario navega a la página de inicio de sesión
    Y existe un usuario registrado con email "admin.rrhh@empresa.com" y contraseña "Password123!" activo
    Cuando ingresa el email "admin.rrhh@empresa.com"
    Y ingresa la contraseña "Password123!"
    Y presiona el botón "Iniciar Sesión"
    Entonces el sistema valida las credenciales contra el servicio de autenticación
    Y genera un token JWT de sesión válido por 60 minutos
    Y redirige al usuario al panel principal "/dashboard"
    Y muestra el mensaje de bienvenida "Bienvenido, Administrador de RRHH"

  @smoke @happy_path
  Escenario: Autenticación exitosa de un Empleado
    Dado que el usuario navega a la página de inicio de sesión
    Y existe un empleado con email "juan.perez@empresa.com" y contraseña "Emp12345!"
    Cuando ingresa el email "juan.perez@empresa.com"
    Y ingresa la contraseña "Emp12345!"
    Y presiona el botón "Iniciar Sesión"
    Entonces el sistema autentica al empleado
    Y lo redirige a su portal personal "/dashboard/solicitudes"
    Y muestra sus permisos restringidos a consulta de recibos y solicitudes propias

  @exception @error_path
  Escenario: Intento de inicio de sesión con contraseña incorrecta
    Dado que el usuario navega a la página de inicio de sesión
    Y existe un usuario registrado con email "admin.rrhh@empresa.com"
    Cuando ingresa el email "admin.rrhh@empresa.com"
    Y ingresa la contraseña "ContraseñaErrónea2026"
    Y presiona el botón "Iniciar Sesión"
    Entonces el sistema rechaza la autenticación con código de error HTTP 401
    Y muestra el mensaje de error "Credenciales inválidas. Por favor verifique su correo y contraseña."
    Y registra el intento fallido en la bitácora de seguridad

  @exception @error_path
  Escenario: Intento de inicio de sesión con usuario inactivo o suspendido
    Dado que el usuario navega a la página de inicio de sesión
    Y existe un usuario registrado con email "empleado.retirado@empresa.com" con estado "INACTIVO"
    Cuando ingresa el email "empleado.retirado@empresa.com"
    Y ingresa la contraseña "Password123!"
    Y presiona el botón "Iniciar Sesión"
    Entonces el sistema bloquea el acceso con HTTP 403 Forbidden
    Y muestra el mensaje "Su cuenta se encuentra inactiva. Contacte al departamento de RRHH."

  @exception @validation
  Escenario: Validación de campos requeridos vacíos en formulario de login
    Dado que el usuario está en la pantalla de autenticación
    Cuando deja el campo email vacío
    O deja el campo contraseña vacío
    Y presiona "Iniciar Sesión"
    Entonces la interfaz muestra alertas de validación indicando "El correo electrónico es requerido"
    Y el formulario no envía ninguna petición al backend
