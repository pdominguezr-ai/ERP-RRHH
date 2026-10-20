# language: es
# Estándar Aplicado: ISO/IEC/IEEE 29119-3:2021 (Software Testing - Test Documentation)
# Requerimiento Vinculado: REQ-FN-002, REQ-FN-004, REQ-FN-006 | Historia de Usuario: HU-02, HU-03, HU-04
Característica: Gestión Políglota de Recursos y Colaboradores con Patrón Cache-Aside y Errores RFC 9457
  Como Gestor de Recursos Humanos o Administrador del ERP
  Quiero consultar, filtrar y registrar recursos/colaboradores mediante los endpoints /api/v1/recursos y /api/v1/empleados
  Para garantizar lecturas rápidas desde Redis (Cache-Aside TTL) y escrituras consistentes en PostgreSQL, MongoDB y Neo4j.

  Antecedentes:
    Dado que el cliente posee un token JWT válido con rol "ADMIN_RRHH"
    Y la capa de persistencia políglota conecta PostgreSQL, MongoDB, Redis (TTL=300s) y Neo4j

  @cache_aside @happy_path @CP-04
  Escenario: Consulta de catálogo de recursos aplicando patrón Cache-Aside (MISS seguido de HIT)
    Dado que la clave de caché "cache:recursos:list:dept=Tecnologia:estado=ACTIVO:p=1:l=10" no existe en Redis
    Cuando el cliente envía GET a "/api/v1/recursos?departamento=Tecnologia&estado=ACTIVO&page=1&limit=10"
    Entonces el servidor responde con HTTP 200 OK y cabecera "X-Cache" igual a "MISS"
    Y almacena el resultado en Redis con política de expiración TTL de 300 segundos
    Cuando el cliente vuelve a enviar GET a "/api/v1/recursos?departamento=Tecnologia&estado=ACTIVO&page=1&limit=10" dentro de los 300 segundos
    Entonces el servidor responde desde memoria Redis con HTTP 200 OK y cabecera "X-Cache" igual a "HIT"

  @polyglot_write @happy_path @CP-05
  Escenario: Registro exitoso de un nuevo recurso con propagación a PostgreSQL, Neo4j y MongoDB
    Dado que el Gestor de RRHH prepara el registro de un nuevo recurso con DPI "2987654320101" y salario base 16500.00
    Cuando envía una petición POST a "/api/v1/recursos" con los datos válidos del recurso
    Entonces PostgreSQL persiste el registro transaccional y retorna HTTP 201 Created
    Y el bus de eventos Observer crea el nodo jerárquico en Neo4j y la auditoría en MongoDB
    Y el servicio Cache-Aside invalida las claves de listado en Redis

  @bdd_outline @iso29119 @CP-06
  Esquema del escenario: Validación de reglas de negocio y respuestas RFC 9457 en creación de recursos
    Dado que el Gestor de RRHH envía una solicitud POST al endpoint "/api/v1/recursos"
    Cuando suministra el nombre "<nombres>", DPI "<dpi>", departamento "<departamento>" y salario base <salario_base>
    Entonces el endpoint retorna el código HTTP <status_http>
    Y el tipo de contenido de la respuesta es "<content_type>"
    Y el código de estado de negocio devuelto es "<codigo_esperado>"

    Ejemplos:
      | nombres        | dpi           | departamento | salario_base | status_http | content_type             | codigo_esperado    |
      | Elena Sofía    | 2540198270101 | Tecnología   | 18500.00     | 201         | application/json         | CREATED            |
      | Marco Tulio    | 3120987650101 | Finanzas     | 12000.00     | 201         | application/json         | CREATED            |
      | Pedro Inválido | 12345         | Tecnología   | 10000.00     | 400         | application/problem+json | VALIDATION_ERROR   |
      | Ana SalarioB   | 2999888770101 | Ventas       | 2500.00      | 400         | application/problem+json | VALIDATION_ERROR   |
      |                | 2777666550101 | Operaciones  | 8500.00      | 400         | application/problem+json | VALIDATION_ERROR   |

  @detail_by_id @rfc9457 @CP-07
  Esquema del escenario: Consulta de detalle de elemento por ID (GET /api/v1/recursos/:id)
    Dado que el usuario consulta el identificador de recurso "<id_recurso>"
    Cuando realiza una petición GET a "/api/v1/recursos/<id_recurso>"
    Entonces el sistema responde con el código HTTP <status_http>
    Y el formato de respuesta corresponde a "<content_type>"

    Ejemplos:
      | id_recurso                           | status_http | content_type             |
      | b1000000-0000-0000-0000-000000000001 | 200         | application/json         |
      | EMP-001                              | 200         | application/json         |
      | id-inexistente-9999                  | 404         | application/problem+json |
