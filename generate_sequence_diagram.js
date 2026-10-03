const fs = require('fs');
const path = require('path');
const http = require('http');
const plantumlEncoder = require('plantuml-encoder');

const sequenceDiagramPuml = `@startuml secuencia_endpoint
autonumber
skinparam Style strictuml
skinparam SequenceMessageAlignment center

actor ClienteHTTP as "Cliente HTTP / Postman"
participant Controller as "EmpleadoController.ts\\n(Capa Controlador)"
participant Service as "EmpleadoService.ts\\n(Capa Servicio)"
participant Validator as "Zod Validator\\n(DTO / Schema)"
participant DB as "Supabase PostgreSQL\\n(Base de Datos)"

ClienteHTTP -> Controller: POST /api/v1/empleados\\nBody: { nombres, apellidos, dpi, salario_base... }
activate Controller

Controller -> Validator: parse(EmpleadoCreateSchema, requestBody)
activate Validator
alt Payload Inválido (Ej. DPI duplicado o Salario < Q3384.59)
    Validator -->> Controller: Error de Validación Zod (ZodError)
    Controller -->> ClienteHTTP: HTTP 400 Bad Request\\n{ success: false, error: {...} }
end
Validator -->> Controller: Datos Validados OK
deactivate Validator

Controller -> Service: createEmpleado(validatedData)
activate Service

Service -> Service: generarCodigoEmpleado()\\n("EMP-0142")

Service -> DB: INSERT INTO empleados (codigo, nombres, dpi, ...)\\nVALUES ('EMP-0142', ...)
activate DB

alt Error en Base de Datos (Constraint / Unique Key)
    DB -->> Service: PostgreSQL Error Code 23505 (Unique Violation)
    Service -->> Controller: throw Error("El DPI ya está registrado")
    Controller -->> ClienteHTTP: HTTP 400 Bad Request / 409 Conflict
end

DB -->> Service: Registro Insertado\\n{ id: "uuid-1234", codigo: "EMP-0142", ... }
deactivate DB

Service -->> Controller: Empleado Creado (Empleado DTO)
deactivate Service

Controller -->> ClienteHTTP: HTTP 201 Created\\n{ success: true, data: { id, codigo, ... } }
deactivate Controller

@enduml`;

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const file = fs.createWriteStream(destPath);
    http.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Status ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => file.close(() => resolve(destPath)));
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Rendering docs/architecture/secuencia_endpoint.png...');
  const encoded = plantumlEncoder.encode(sequenceDiagramPuml);
  const url = `http://www.plantuml.com/plantuml/png/${encoded}`;
  await downloadImage(url, path.join(__dirname, 'docs', 'architecture', 'secuencia_endpoint.png'));
  console.log('Saved docs/architecture/secuencia_endpoint.png successfully!');
}

main().catch(err => {
  console.error('Error generating diagram:', err);
  process.exit(1);
});
