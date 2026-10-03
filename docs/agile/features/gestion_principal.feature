# language: es
Característica: Gestión Principal de Colaboradores y Expediente Digital
  Como Gestor de Recursos Humanos
  Quiero registrar, consultar y actualizar expedientes de colaboradores
  Para mantener la estructura organizacional actualizada y cumplir con las normas laborales.

  Reglas de Negocio:
  - El código de empleado debe ser único en formato "EMP-XXXX".
  - El DPI / Documento de Identificación es obligatorio y debe tener 13 dígitos numéricos.
  - El salario base debe ser un valor positivo mayor o igual al salario mínimo legal (Q 3,384.59).
  - Los estados válidos de un empleado son: "ACTIVO", "INACTIVO", "SUSPENDIDO".

  @smoke @happy_path
  Escenario: Registro exitoso de un nuevo colaborador en la organización
    Dado que el Gestor de RRHH ha iniciado sesión en el portal administrativo
    Y navega al formulario de nuevo empleado "/dashboard/empleados/nuevo"
    Cuando completa el formulario con los siguientes datos:
      | Campo              | Valor                   |
      | nombres            | Carlos Roberto          |
      | apellidos          | Gómez Estrada           |
      | email              | carlos.gomez@empresa.com|
      | dpi                | 2450198270101           |
      | departamento       | Tecnología              |
      | puesto             | Desarrollador Senior    |
      | salario_base       | 12500.00                |
      | fecha_contratacion | 2026-10-15              |
    Y presiona el botón "Guardar Colaborador"
    Entonces el backend valida los datos mediante DTO con Zod
    Y asigna el código único "EMP-0142"
    Y guarda el registro en la base de datos PostgreSQL en Supabase
    Y retorna el código HTTP 201 Created con el objeto del empleado creado
    Y muestra una notificación toast "Colaborador registrado exitosamente"

  @smoke @happy_path
  Escenario: Consulta paginada y filtrada de colaboradores activos
    Dado que existen 45 colaboradores registrados en la base de datos
    Y el Gestor de RRHH accede al listado de empleados en "/dashboard/empleados"
    Cuando aplica el filtro por departamento "Tecnología" y estado "ACTIVO"
    Entonces la API GET "/api/v1/empleados?departamento=Tecnología&estado=ACTIVO" retorna HTTP 200 OK
    Y el cuerpo de la respuesta contiene la lista paginada de empleados pertenecientes a Tecnología
    Y la tabla en la interfaz renderiza los expedientes con sus respectivos estados en color verde

  @exception @error_path
  Escenario: Intento de registro con DPI duplicado
    Dado que ya existe un empleado registrado con el DPI "2450198270101"
    Cuando el Gestor de RRHH intenta crear otro empleado utilizando el DPI "2450198270101"
    Y presiona "Guardar Colaborador"
    Entonces el backend captura la restricción de unicidad en la base de datos
    Y responde con el código HTTP 400 Bad Request
    Y retorna la estructura de error:
      """
      {
        "success": false,
        "error": {
          "code": "DUPLICATE_RESOURCE",
          "message": "El documento DPI 2450198270101 ya pertenece a un colaborador registrado."
        }
      }
      """
    Y la interfaz resalta el campo DPI con el mensaje de error correspondiente

  @exception @validation
  Escenario: Intento de registro con salario inferior al mínimo legal
    Dado que el salario mínimo legal configurado es 3384.59
    Cuando el usuario ingresa un salario base de "2500.00"
    Y presiona "Guardar Colaborador"
    Entonces el validador Zod rechaza la petición antes de enviarla a la base de datos
    Y muestra la alerta "El salario base no puede ser inferior al mínimo legal de Q 3,384.59"
