const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const plantumlEncoder = require('plantuml-encoder');

// ============================================================================
// 1. UML 2.5.1 - DIAGRAMA DE CLASES (docs/uml/clases.puml)
// ============================================================================
const umlClasesPuml = `@startuml clases
!theme plain
skinparam backgroundColor #FFFFFF
skinparam classAttributeIconSize 0
skinparam roundcorner 6
skinparam Shadowing false
skinparam PackageStyle rectangle

title Diagrama de Clases de Análisis y Diseño (UML 2.5.1 - OMG)\\nSistema ERP de Gestión de Recursos Humanos y Recursos Corporativos

package "Capa de Presentación & Controladores REST (API-First)" {
  class AuthController <<Controller>> {
    +handleLogin(req: NextRequest): Promise<NextResponse>
    +verifyToken(token: string): JwtPayload
  }

  class RecursoController <<Controller>> {
    +handleGetCatalogo(req: NextRequest): Promise<NextResponse>
    +handleCreateRecurso(req: NextRequest): Promise<NextResponse>
    +handleGetRecursoById(req: NextRequest, id: string): Promise<NextResponse>
  }

  class EmpleadoController <<Controller>> {
    +handleGet(req: NextRequest): Promise<NextResponse>
    +handlePost(req: NextRequest): Promise<NextResponse>
    +handleGetById(req: NextRequest, id: string): Promise<NextResponse>
  }

  class ProblemDetailsMiddleware <<Middleware RFC 9457>> {
    +type: string
    +title: string
    +status: number
    +detail: string
    +instance: string
    +toResponse(err: Error, instance: string): NextResponse
  }
}

package "Capa de Servicios de Negocio & Patrones GoF" {
  interface ICalculoNominaStrategy <<Strategy>> {
    +calcularDeducciones(salarioBase: number): DesgloseNominaDTO
  }

  class RegimenAsalariadoStrategy <<ConcreteStrategy>> {
    -tasaIGSS: number = 0.0483
    -bonoIncentivo: number = 250.00
    +calcularDeducciones(salarioBase: number): DesgloseNominaDTO
  }

  class RegimenServiciosStrategy <<ConcreteStrategy>> {
    -tasaISRRetencion: number = 0.05
    +calcularDeducciones(salarioBase: number): DesgloseNominaDTO
  }

  interface IDomainEventObserver <<Observer>> {
    +update(event: DomainEvent): Promise<void>
  }

  class DomainEventBus <<Subject>> {
    -observers: IDomainEventObserver[]
    +subscribe(observer: IDomainEventObserver): void
    +publish(event: DomainEvent): Promise<void>
  }

  class CircuitBreaker <<Resilience Pattern>> {
    -state: CircuitState
    -failureCount: number
    -threshold: number = 3
    +execute<T>(action: () => Promise<T>): Promise<T>
  }

  class CacheAsideService <<Cache Pattern>> {
    -ttlSeconds: number = 300
    +getOrSet<T>(key: string, fetcher: () => Promise<T>): Promise<CacheResult<T>>
    +invalidate(pattern: string): Promise<void>
  }

  class ExternalErpGateway <<Gateway Pattern>> {
    +notificarIGSS(planillaId: string): Promise<boolean>
    +dispersarPagoBancario(cuenta: string, monto: number): Promise<string>
  }

  class RecursoService <<Service>> {
    -repository: IRecursoRepository
    -cache: CacheAsideService
    -eventBus: DomainEventBus
    -breaker: CircuitBreaker
    +listarRecursos(filtros: FiltroDTO): Promise<RecursoDTO[]>
    +registrarRecurso(dto: CrearRecursoDTO): Promise<RecursoDTO>
    +obtenerPorId(id: string): Promise<RecursoDTO>
  }
}

package "Capa de Dominio & Persistencia Políglota (Repository)" {
  interface IRecursoRepository <<Repository>> {
    +findAll(filtros: FiltroDTO): Promise<RecursoEntity[]>
    +findById(id: string): Promise<RecursoEntity | null>
    +save(entity: RecursoEntity): Promise<RecursoEntity>
  }

  class Departamento <<Entity>> {
    +id: UUID
    +nombre: string
    +presupuestoAnual: number
  }

  class Empleado <<Entity>> {
    +id: UUID
    +codigo: string
    +dpi: string
    +nombres: string
    +apellidos: string
    +salarioBase: number
    +estado: EstadoEmpleado
  }

  class ExpedienteDigital <<Document MongoDB>> {
    +id: ObjectId
    +empleadoId: UUID
    +certificaciones: string[]
    +evaluaciones360: Map<string, any>
  }

  class Nomina <<AggregateRoot>> {
    +id: UUID
    +periodoInicio: Date
    +periodoFin: Date
    +totalNeto: number
    +estado: EstadoNomina
  }

  class DetalleNomina <<ValueObject / Entity>> {
    +id: UUID
    +salarioBase: number
    +igssLaboral: number
    +isrRetenido: number
    +salarioNeto: number
  }

  class SolicitudAusencia <<Entity>> {
    +id: UUID
    +tipo: TipoAusencia
    +fechaInicio: Date
    +fechaFin: Date
    +diasSolicitados: number
    +estado: EstadoSolicitud
  }
}

' Relaciones de Composición, Agregación, Implementación y Cardinalidad
Departamento "1" o-- "0..*" Empleado : agrupa >
Empleado "1" *-- "1" ExpedienteDigital : posee >
Nomina "1" *-- "1..*" DetalleNomina : compuesta por >
Empleado "1" -- "0..*" DetalleNomina : percibe >
Empleado "1" -- "0..*" SolicitudAusencia : solicita >
Empleado "0..1" -- "0..*" Empleado : supervisa (Jefe) >

RecursoController --> RecursoService : invoca >
EmpleadoController --> RecursoService : utiliza >
RecursoController ..> ProblemDetailsMiddleware : estandariza errores >
AuthController ..> ProblemDetailsMiddleware : estandariza errores >

RecursoService *-- CircuitBreaker : protege con >
RecursoService o-- CacheAsideService : acelera con >
RecursoService o-- DomainEventBus : publica en >
RecursoService --> IRecursoRepository : persiste vía >
RecursoService --> ICalculoNominaStrategy : calcula con >
RecursoService --> ExternalErpGateway : integra con >

RegimenAsalariadoStrategy ..|> ICalculoNominaStrategy
RegimenServiciosStrategy ..|> ICalculoNominaStrategy
DomainEventBus "1" o-- "0..*" IDomainEventObserver : notifica >

@enduml`;

// ============================================================================
// 2. UML 2.5.1 - DIAGRAMA DE SECUENCIA (docs/uml/secuencia.puml)
// ============================================================================
const umlSecuenciaPuml = `@startuml secuencia
!theme plain
autonumber
skinparam backgroundColor #FFFFFF
skinparam SequenceMessageAlignment center
skinparam Style strictuml

title Diagrama de Secuencia para Interacciones Criticas (UML 2.5.1)\\nAutenticacion JWT, Cache-Aside (Redis/Mongo) y Transaccion Distribuida (PostgreSQL + Neo4j)

actor Cliente as "Cliente Web / Movil"
participant Gateway as "API Middleware\\n(Auth & RFC 9457)"
participant Controller as "RecursoController\\n(/api/v1/recursos)"
participant Service as "RecursoService\\n(CircuitBreaker + GoF)"
participant Redis as "Redis Cache\\n(In-Memory TTL=300s)"
participant Postgres as "PostgreSQL\\n(Relacional ACID)"
participant Mongo as "MongoDB\\n(Documentos & Auditoria)"
participant Neo4j as "Neo4j Graph DB\\n(Nodos & Relaciones)"

== Flujo 1: Consulta de Catalogo con Patron Cache-Aside (GET /api/v1/recursos) ==
Cliente -> Gateway: GET /api/v1/recursos?departamento=Tecnologia\\nAuthorization: Bearer <JWT>
activate Gateway
Gateway -> Gateway: Verificar firma JWT y permisos RBAC
Gateway -> Controller: handleGetCatalogo(req)
activate Controller
Controller -> Service: listarRecursos(filtros)
activate Service

Service -> Redis: GET cacheKey("recursos:dept:Tecnologia:p1")
activate Redis
alt Cache HIT (Dato vigente en memoria, TTL > 0)
  Redis -->> Service: JSON Payload (Latencia < 5ms)
  Service -->> Controller: { data, meta: { cache: "HIT", ttl: 248 } }
  Controller -->> Cliente: HTTP 200 OK (Header X-Cache: HIT)
else Cache MISS (No existe o expiro TTL)
  Redis -->> Service: null (Cache MISS)
  deactivate Redis
  Service -> Postgres: SELECT * FROM empleados WHERE departamento = 'Tecnologia'
  activate Postgres
  Postgres -->> Service: Filas relacionales ACID
  deactivate Postgres
  Service -> Mongo: db.expedientes.find({ empleadoId: { $in: ids } })
  activate Mongo
  Mongo -->> Service: Metadatos documentales enriquecidos
  deactivate Mongo
  Service -> Redis: SETEX "recursos:dept:Tecnologia:p1" 300 <JSON>
  activate Redis
  Redis -->> Service: OK
  deactivate Redis
  Service -->> Controller: { data, meta: { cache: "MISS", ttl: 300 } }
  Controller -->> Cliente: HTTP 200 OK (Header X-Cache: MISS)
end
deactivate Service
deactivate Controller
deactivate Gateway

== Flujo 2: Registro Transaccional y Consistencia Eventual (POST /api/v1/recursos) ==
Cliente -> Gateway: POST /api/v1/recursos (Body JSON)
activate Gateway
Gateway -> Controller: handleCreateRecurso(req)
activate Controller
Controller -> Controller: Validar Esquema DTO con Zod

alt Datos Invalidos (Violacion de Regla de Negocio)
  Controller -> Gateway: throw ValidationProblemError
  Gateway -->> Cliente: HTTP 400 Bad Request (Content-Type: application/problem+json)\\n{ type: ".../validation-error", title: "Bad Request", status: 400, detail: "..." }
else Datos Validos
  Controller -> Service: registrarRecurso(validatedDTO)
  activate Service
  Service -> Postgres: BEGIN; INSERT INTO empleados (...) RETURNING id, codigo; COMMIT;
  activate Postgres
  Postgres -->> Service: Registro Creado (EMP-0150)
  deactivate Postgres

  group Consistencia Eventual via DomainEventBus (Patron Observer)
    Service ->> Neo4j: MERGE (e:Empleado {codigo: 'EMP-0150'})-[:PERTENECE_A]->(d:Depto)
    activate Neo4j
    Neo4j -->> Service: Nodo y Relacion creados
    deactivate Neo4j
    Service ->> Mongo: db.auditoria_eventos.insertOne({ event: "RECURSO_CREADO", payload })
    activate Mongo
    Mongo -->> Service: ObjectId("6714...")
    deactivate Mongo
    Service ->> Redis: DEL "recursos:dept:*"
    activate Redis
    Redis -->> Service: Invalidado (1 key)
    deactivate Redis
  end

  Service -->> Controller: RecursoCreadoDTO
  deactivate Service
  Controller -->> Gateway: HTTP 201 Created
  Gateway -->> Cliente: HTTP 201 Created + Location: /api/v1/recursos/EMP-0150
end
deactivate Controller
deactivate Gateway

@enduml`;

// ============================================================================
// 3. UML 2.5.1 - DIAGRAMA DE ACTIVIDADES CON SWIMLANES (docs/uml/actividades.puml)
// ============================================================================
const umlActividadesPuml = `@startuml actividades
!theme plain
skinparam backgroundColor #FFFFFF
skinparam ActivityBackgroundColor #F8FAFC
skinparam ActivityBorderColor #1E3A8A
skinparam ActivityDiamondBackgroundColor #EFF6FF
skinparam ActivityDiamondBorderColor #2563EB

title Diagrama de Actividades con Calles de Responsabilidad - Swimlanes (UML 2.5.1)\\nProceso Integral de Gestión de Recursos, Solicitudes y Liquidación de Nómina

|Colaborador / Solicitante|
start
:Autenticarse en Portal Mobile-First (/login);
:Ingresar datos de Solicitud o Recurso;
:Enviar formulario hacia API REST;

|API Gateway & Validador DTO|
:Verificar Token JWT (Bearer Auth);
if (¿Token válido y rol autorizado?) then (No)
  :Generar respuesta RFC 9457\\n(HTTP 401/403 application/problem+json);
  stop
else (Sí)
  :Validar estructura y reglas con Zod;
  if (¿Cumple reglas de negocio?) then (No)
    :Retornar Problem Details HTTP 400\\ncon detalle de campos inválidos;
    stop
  else (Sí)
  endif
endif

|Jefe Inmediato / Gestor RRHH|
:Recibir notificación de solicitud pendiente;
:Revisar disponibilidad en Organigrama (Neo4j)\\ny saldo de días disponibles (PostgreSQL);
if (¿Aprueba la operación?) then (Rechaza)
  :Registrar motivo obligatorio de rechazo;
  |Motor de Persistencia Políglota|
  :Actualizar estado a RECHAZADA en PostgreSQL;
  :Guardar traza de auditoría en MongoDB;
  |Colaborador / Solicitante|
  :Recibir alerta con motivo de rechazo;
  stop
else (Aprueba)
  |Jefe Inmediato / Gestor RRHH|
  :Confirmar aprobación con firma digital;
endif

|Motor de Persistencia Políglota|
fork
  :Persistir transacción ACID en PostgreSQL\\n(Tablas empleados / nominas / solicitudes);
fork again
  :Actualizar relaciones de equipo y nodos\\nen base de datos de grafos Neo4j;
fork again
  :Almacenar documento de expediente y\\nbitácora inmutable en MongoDB;
fork again
  :Invalidar claves afectadas en Redis Cache\\n(Patrón Cache-Aside TTL);
end fork

|Colaborador / Solicitante|
:Visualizar comprobante actualizado en tiempo real;
stop

@enduml`;

// ============================================================================
// 4. UML 2.5.1 - DIAGRAMA DE PAQUETES (docs/uml/paquetes.puml)
// ============================================================================
const umlPaquetesPuml = `@startuml paquetes
!theme plain
skinparam backgroundColor #FFFFFF
skinparam PackageStyle folder
skinparam roundcorner 6

title Diagrama de Paquetes y Modularización Arquitectónica (UML 2.5.1)\\nSistema ERP-RRHH con Arquitectura en Capas, API-First y Persistencia Políglota

package "Presentación UX/UI (Mobile-First & Atomic Design)" as UI {
  package "src/components/ui (Átomos)" as Atomos
  package "src/components/forms (Moléculas)" as Moleculas
  package "src/components/tables & layout (Organismos)" as Organismos
  package "src/app/dashboard (Páginas Next.js 16)" as Paginas

  Paginas ..> Organismos : compone
  Organismos ..> Moleculas : agrupa
  Moleculas ..> Atomos : utiliza
}

package "Capa de Exposición API-First (REST / OpenAPI 3.0.3)" as API {
  package "src/app/api/v1 (Endpoints)" as Endpoints
  package "src/middlewares (RFC 9457 & Auth JWT)" as Middlewares
  package "src/controllers (Auth, Recurso, Empleado)" as Controllers

  Endpoints ..> Middlewares : intercepta con
  Endpoints ..> Controllers : delega a
}

package "Capa de Dominio, Servicios & Patrones GoF" as Dominio {
  package "src/services (Lógica de Negocio)" as Services
  package "src/services/patterns (Strategy, Observer, Gateway, CircuitBreaker)" as GoF
  package "src/lib/validators (DTOs & Reglas Zod)" as Validators

  Controllers ..> Validators : valida DTOs
  Controllers ..> Services : invoca
  Services ..> GoF : aplica patrones
}

package "Capa de Acceso a Datos & Persistencia Políglota" as Datos {
  package "src/models (Repositorios)" as Models
  package "src/config (Conectores Políglotas)" as Config

  database "PostgreSQL (ACID)" as PG
  database "MongoDB (Documental)" as MONGO
  database "Redis (Cache-Aside TTL)" as REDIS
  database "Neo4j (Grafo Jerárquico)" as NEO4J

  Services ..> Models : abstrae persistencia
  Models ..> Config : usa clientes
  Config ..> PG : SQL / RLS
  Config ..> MONGO : BSON / JSON
  Config ..> REDIS : Key-Value TTL
  Config ..> NEO4J : Cypher Graph
}

Paginas ..> Endpoints : consume HTTP/JSON

@enduml`;

// ============================================================================
// 5. C4 NIVEL 4 - DIAGRAMA DE CÓDIGO (docs/c4/c4_nivel4_codigo.puml)
// ============================================================================
const c4Nivel4CodigoPuml = `@startuml c4_nivel4_codigo
!theme plain
skinparam backgroundColor #FFFFFF
skinparam classAttributeIconSize 0
skinparam roundcorner 6

title Modelo C4 - Nivel 4: Diagrama de Código de Componentes Críticos\\nImplementación de Patrones GoF, Cache-Aside (Redis) y Manejo de Errores RFC 9457

package "src/middlewares (Estándar RFC 9457 Problem Details)" {
  class ProblemDetails <<RFC 9457>> {
    +type: string
    +title: string
    +status: number
    +detail: string
    +instance: string
    +code: string
    +timestamp: string
    +errors?: Record<string, string[]>
  }

  class ProblemDetailsFactory {
    +{static} badRequest(detail: string, instance: string, errors?: any): NextResponse
    +{static} unauthorized(detail: string, instance: string): NextResponse
    +{static} notFound(detail: string, instance: string): NextResponse
    +{static} internalError(detail: string, instance: string): NextResponse
  }
}

package "src/services (Patrones GoF & Cache-Aside)" {
  interface ICacheStore {
    +get<T>(key: string): Promise<T | null>
    +set<T>(key: string, value: T, ttlSeconds: number): Promise<void>
    +invalidatePattern(prefix: string): Promise<number>
  }

  class RedisCacheAsideManager implements ICacheStore {
    -store: Map<string, CacheEntry>
    -defaultTtl: number = 300
    +getOrFetch<T>(key: string, ttl: number, fallback: () => Promise<T>): Promise<{data: T, hit: boolean}>
  }

  interface IPayrollCalculationStrategy <<Strategy>> {
    +calculate(baseSalary: number): PayrollBreakdown
  }

  class GuatemalanLaborStrategy implements IPayrollCalculationStrategy {
    +IGSS_RATE: number = 0.0483
    +BONUS_DECRETO_37_2001: number = 250.00
    +calculate(baseSalary: number): PayrollBreakdown
  }

  class CircuitBreakerExecutor <<Circuit Breaker>> {
    -state: "CLOSED" | "OPEN" | "HALF_OPEN"
    -failures: number
    -resetTimeoutMs: number = 30000
    +execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>
  }

  class PolyglotEventBus <<Observer>> {
    -listeners: Array<(event: PolyglotSyncEvent) => Promise<void>>
    +onSync(listener: (event: PolyglotSyncEvent) => Promise<void>): void
    +emitSync(event: PolyglotSyncEvent): Promise<void>
  }
}

package "src/controllers & src/models (Endpoints Funcionales)" {
  class RecursoController {
    +getRecursos(req: NextRequest): Promise<NextResponse>
    +createRecurso(req: NextRequest): Promise<NextResponse>
    +getRecursoById(req: NextRequest, id: string): Promise<NextResponse>
  }

  class PolyglotRecursoRepository <<Repository>> {
    +queryPostgresCatalog(filters: ResourceFilter): Promise<ResourceRecord[]>
    +getMongoMetadata(resourceId: string): Promise<Record<string, any>>
    +syncNeo4jHierarchyNode(record: ResourceRecord): Promise<void>
  }
}

RecursoController --> RedisCacheAsideManager : Cache-Aside (TTL 300s)
RecursoController --> PolyglotRecursoRepository : CRUD Políglota
RecursoController --> ProblemDetailsFactory : Errores application/problem+json
PolyglotRecursoRepository --> CircuitBreakerExecutor : Tolerancia a fallos
PolyglotRecursoRepository --> PolyglotEventBus : Consistencia Eventual
PolyglotRecursoRepository --> GuatemalanLaborStrategy : Cálculo Salarial
ProblemDetailsFactory ..> ProblemDetails : instancia

@enduml`;

// ============================================================================
// 6. PERSISTENCIA POLÍGLOTA (docs/database/modelo_poliglota.puml)
// ============================================================================
const modeloPoliglotaPuml = `@startuml modelo_poliglota
!theme plain
allowmixing
skinparam backgroundColor #FFFFFF
skinparam roundcorner 8
skinparam Shadowing false

title Arquitectura de Persistencia Poliglota y Patron Cache-Aside\\nPostgreSQL (Relacional) + MongoDB (Documental) + Redis (Cache en Memoria) + Neo4j (Grafos)

package "Capa de Aplicacion Backend (src/services & src/models)" {
  component "PolyglotDataCoordinator\\n(Repository + Observer + Circuit Breaker)" as Coordinator
  component "CacheAsideManager\\n(Politica TTL = 300s, Write-Invalidate)" as CacheMgr
}

package "1. PostgreSQL (Supabase) - Motor Relacional Transaccional (ACID)" #EFF6FF {
  class "empleados (Tabla SQL)" as pg_emp {
    + id : UUID <<PK>>
    + codigo : VARCHAR(20) <<UK>>
    + dpi : VARCHAR(13) <<UK>>
    + nombres : VARCHAR(100)
    + salario_base : NUMERIC(12,2)
    + estado : VARCHAR(20)
  }
  class "nominas & detalle_nomina (Tablas SQL)" as pg_nom {
    + id : UUID <<PK>>
    + periodo_inicio : DATE
    + total_neto : NUMERIC(14,2)
    + estado : VARCHAR(20)
  }
  class "solicitudes_ausencia (Tabla SQL)" as pg_sol {
    + id : UUID <<PK>>
    + empleado_id : UUID <<FK>>
    + tipo : VARCHAR(20)
    + estado : VARCHAR(20)
  }
  pg_emp "1" -- "0..*" pg_nom
  pg_emp "1" -- "0..*" pg_sol
}

package "2. Redis 7.x (In-Memory) - Almacen Clave-Valor Sub-milisegundo" #FEF2F2 {
  class "Cache de Catalogo y Recursos" as r_cat {
    + key: "cache:recursos:list:{hash}"
    + ttl: 300 segundos (5 min)
    + policy: "Cache-Aside + Write-Invalidate"
  }
  class "Cache de Expediente Individual" as r_id {
    + key: "cache:recurso:id:{uuid}"
    + ttl: 600 segundos (10 min)
  }
  class "Sesiones JWT & Rate Limit" as r_jwt {
    + key: "auth:blacklist:{jti}"
    + ttl: 3600 segundos (60 min)
  }
}

package "3. MongoDB 7.0 (NoSQL Documental) - Esquema Flexible & Bitacora" #F0FDF4 {
  class "Coleccion: expedientes_digitales" as m_exp {
    + _id: ObjectId
    + empleado_id: UUID
    + competencias: String[]
    + evaluaciones_360: Document[]
    + certificaciones_json: Object
  }
  class "Coleccion: auditoria_eventos" as m_aud {
    + _id: ObjectId
    + event_type: String
    + payload_before: Object
    + payload_after: Object
    + timestamp: ISODate
  }
}

package "4. Neo4j 5.x (Base de Datos de Grafos) - Relaciones Jerarquicas" #FEFCE8 {
  class "Nodo (:Empleado)" as n_emp {
    + uuid: String
    + codigo: String
    + puesto: String
  }
  class "Nodo (:Departamento)" as n_dep {
    + nombre: String
    + centro_costo: String
  }
  class "Nodo (:Competencia)" as n_hab {
    + codigo: String
    + nivel: Integer
  }
  n_emp --> n_emp : "[:REPORTA_A]"
  n_emp --> n_dep : "[:PERTENECE_A]"
  n_emp --> n_hab : "[:DOMINA]"
}

Coordinator --> CacheMgr : 1. Lectura rapida (Cache-Aside)
CacheMgr --> r_cat : GET / SETEX (TTL=300s)
CacheMgr --> r_id : GET / SETEX (TTL=600s)
Coordinator --> pg_emp : 2. Transacciones ACID (SQL)
Coordinator --> m_exp : 3. Documentos JSON
Coordinator --> m_aud : 4. Bitacora Inmutable
Coordinator --> n_emp : 5. Consultas de Grafo (Cypher)

@enduml`;

function downloadFromPlantUml(pumlContent, destPath) {
  return new Promise((resolve, reject) => {
    const encoded = plantumlEncoder.encode(pumlContent);
    const url = `http://www.plantuml.com/plantuml/png/${encoded}`;
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    const request = (targetUrl) => {
      const client = targetUrl.startsWith('https') ? https : http;
      client.get(targetUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return request(response.headers.location);
        }
        if (response.statusCode !== 200) {
          return reject(new Error(`HTTP ${response.statusCode} for ${destPath}`));
        }
        const file = fs.createWriteStream(destPath);
        response.pipe(file);
        file.on('finish', () => file.close(() => resolve(destPath)));
      }).on('error', (err) => reject(err));
    };

    request(url);
  });
}

async function main() {
  const baseDir = __dirname;

  // Create directories
  fs.mkdirSync(path.join(baseDir, 'docs', 'uml'), { recursive: true });
  fs.mkdirSync(path.join(baseDir, 'docs', 'c4', 'src'), { recursive: true });
  fs.mkdirSync(path.join(baseDir, 'docs', 'database'), { recursive: true });

  const jobs = [
    {
      name: 'UML Clases',
      pumlPaths: [path.join(baseDir, 'docs', 'uml', 'clases.puml')],
      pngPath: path.join(baseDir, 'docs', 'uml', 'clases.png'),
      content: umlClasesPuml,
    },
    {
      name: 'UML Secuencia',
      pumlPaths: [path.join(baseDir, 'docs', 'uml', 'secuencia.puml')],
      pngPath: path.join(baseDir, 'docs', 'uml', 'secuencia.png'),
      content: umlSecuenciaPuml,
    },
    {
      name: 'UML Actividades (Swimlanes)',
      pumlPaths: [path.join(baseDir, 'docs', 'uml', 'actividades.puml')],
      pngPath: path.join(baseDir, 'docs', 'uml', 'actividades.png'),
      content: umlActividadesPuml,
    },
    {
      name: 'UML Paquetes',
      pumlPaths: [path.join(baseDir, 'docs', 'uml', 'paquetes.puml')],
      pngPath: path.join(baseDir, 'docs', 'uml', 'paquetes.png'),
      content: umlPaquetesPuml,
    },
    {
      name: 'C4 Nivel 4 (Código)',
      pumlPaths: [
        path.join(baseDir, 'docs', 'c4', 'c4_nivel4_codigo.puml'),
        path.join(baseDir, 'docs', 'c4', 'src', 'c4_nivel4_codigo.puml'),
      ],
      pngPath: path.join(baseDir, 'docs', 'c4', 'c4_nivel4_codigo.png'),
      content: c4Nivel4CodigoPuml,
    },
    {
      name: 'Modelo Políglota (PostgreSQL + Mongo + Redis + Neo4j)',
      pumlPaths: [path.join(baseDir, 'docs', 'database', 'modelo_poliglota.puml')],
      pngPath: path.join(baseDir, 'docs', 'database', 'modelo_poliglota.png'),
      content: modeloPoliglotaPuml,
    },
  ];

  for (const job of jobs) {
    for (const pumlPath of job.pumlPaths) {
      fs.writeFileSync(pumlPath, job.content, 'utf8');
    }
    console.log(`Rendering ${job.name} -> ${path.relative(baseDir, job.pngPath)}...`);
    await downloadFromPlantUml(job.content, job.pngPath);
    const stat = fs.statSync(job.pngPath);
    console.log(`  OK (${stat.size} bytes)`);
  }
}

main().catch((err) => {
  console.error('Error generating diagrams:', err);
  process.exit(1);
});
