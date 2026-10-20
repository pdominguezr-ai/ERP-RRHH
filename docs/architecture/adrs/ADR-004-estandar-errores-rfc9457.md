# ADR-004: Filosofía API-First (OpenAPI 3.0.3) y Estandarización de Errores bajo RFC 9110 y RFC 9457

* **Estándar Aplicado:** ISO/IEC/IEEE 42010:2011 · RFC 9110 (HTTP Semantics) · RFC 9457 (Problem Details for HTTP APIs)
* **ID de Decisión:** ADR-004
* **Estado:** Aceptada ( Vigente )
* **Fecha:** Octubre 2026
* **Autores:** Paul Dominguez (9989-23-9308), Jorge Morataya (9989-23-340), Britany Yamileth Meza Chinchilla (9989-23-3181)

---

## 1. Contexto
En arquitecturas modernas donde múltiples clientes (Aplicación Web Next.js, App Móvil, integraciones B2B y pasarelas GraphQL/gRPC) consumen los mismos servicios backend, las respuestas de error ad-hoc (ej. `{ error: "algo falló" }` o `{ msg: "invalid" }`) generan ambigüedad, dificultan el manejo automatizado de excepciones en el frontend y rompen los contratos de integración.

---

## 2. Decisión Elegida
1. **Adopción estricta de API-First con OpenAPI 3.0.3:** Todo endpoint (`/api/v1/auth/login`, `/api/v1/recursos`, `/api/v1/recursos/:id`, `/api/v1/empleados`, `/api/v1/solicitudes`) se diseña y valida primero en `docs/api/openapi.yaml` antes de su codificación.
2. **Semántica HTTP conforme a RFC 9110:** Uso riguroso de métodos (`GET` idempotente y seguro, `POST` creación, `PUT` reemplazo, `PATCH` actualización parcial, `DELETE` desactivación lógica) y códigos de estado (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Content`, `500 Internal Server Error`).
3. **Estandarización de Errores bajo RFC 9457 (`application/problem+json`):** Todos los errores devueltos por la API utilizan el Media Type oficial `application/problem+json` con la estructura canónica de **Problem Details**:
   ```json
   {
     "type": "https://erp-rrhh.umg.edu.gt/probs/validation-error",
     "title": "Error de Validación en Reglas de Negocio",
     "status": 400,
     "detail": "El salario base (Q 2,500.00) no puede ser inferior al mínimo legal vigente (Q 3,384.59).",
     "instance": "/api/v1/recursos",
     "code": "ERR_BUSINESS_VALIDATION",
     "timestamp": "2026-10-19T21:45:00.000Z",
     "errors": {
       "salario_base": ["El salario base no puede ser inferior al mínimo legal de Q 3,384.59"]
     }
   }
   ```

---

## 3. Consecuencias
* **Interoperabilidad Total:** Los clientes HTTP y las pruebas automatizadas (Postman y Gherkin BDD) cuentan con un esquema determinista y legible tanto por humanos como por máquinas para diagnosticar cualquier anomalía.
