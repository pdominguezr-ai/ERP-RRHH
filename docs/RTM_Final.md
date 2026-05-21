# Matriz de Trazabilidad de Requerimientos (RTM) - Final

Este documento presenta la trazabilidad total entre los requerimientos declarados (funcionales y no funcionales), sus componentes lógicos de implementación en el MVP y los casos de prueba asociados (CP-01 a CP-24) para certificar la calidad del software.

---

## 1. Matriz de Trazabilidad Cerrada (RTM)

| ID REQ | Tipo | Descripción | Componente Lógico (Código) | Caso de Prueba | Estado | Comentario / Evidencia Esperada |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-01** | RF-01 | CRUD de Empleados | [empleadoService.ts](file:///src/services/empleadoService.ts), [/dashboard/empleados](file:///src/app/dashboard/empleados) | CP-01 | **CUBIERTO** | Empleados listados, editados y creados con éxito. |
| **REQ-02** | RF-02 | Procesar automáticamente nómina | [nominaService.ts](file:///src/services/nominaService.ts), [/dashboard/nomina/[id]](file:///src/app/dashboard/nomina/[id]) | CP-02 | **CUBIERTO** | Cambio de estado de BORRADOR a PROCESADA bloqueando cambios. |
| **REQ-03** | RF-03 | Calcular retenciones, ded. y bonos | [nominaService.ts](file:///src/services/nominaService.ts#L104-L148) | CP-03 | **CUBIERTO** | Recálculo automático de netos y totales en base. |
| **REQ-04** | RF-04 | Gestionar procesos de reclutamiento | [reclutamientoService.ts](file:///src/services/reclutamientoService.ts), [/dashboard/reclutamiento](file:///src/app/dashboard/reclutamiento) | CP-04 | **CUBIERTO** | Flujo de vacantes abiertas y vinculación de postulantes. |
| **REQ-05** | RF-05 | Registrar onboarding de personal | [onboardingService.ts](file:///src/services/onboardingService.ts), [/dashboard/onboarding](file:///src/app/dashboard/onboarding) | CP-05 | **CUBIERTO** | Generación automática del plan de onboarding en PENDIENTE. |
| **REQ-06** | RF-06 | Registrar asistencia diaria | [asistenciaService.ts](file:///src/services/asistenciaService.ts), [/dashboard/asistencia](file:///src/app/dashboard/asistencia) | CP-06 | **CUBIERTO** | Registro único por fecha y cálculo de horas laborales. |
| **REQ-07** | RF-07 | Gestionar solicitudes de ausencia | [solicitudService.ts](file:///src/services/solicitudService.ts), [/dashboard/solicitudes](file:///src/app/dashboard/solicitudes) | CP-07 | **CUBIERTO** | Envío de solicitud y resolución justificada con comentarios. |
| **REQ-08** | RF-08 | Registrar evaluaciones de desempeño | [evaluacionService.ts](file:///src/services/evaluacionService.ts), [/dashboard/evaluaciones](file:///src/app/dashboard/evaluaciones) | CP-08 | **CUBIERTO** | Puntuaciones del 0 al 100 en formato Borrador/Finalizada. |
| **REQ-09** | RF-09 | Administrar capacitaciones | [capacitacionService.ts](file:///src/services/capacitacionService.ts), [/dashboard/capacitaciones](file:///src/app/dashboard/capacitaciones) | CP-09 | **CUBIERTO** | Registro de cursos y asignación de colaboradores. |
| **REQ-10** | RF-10 | Gestionar beneficios y comp. | [beneficioService.ts](file:///src/services/beneficioService.ts), [/dashboard/beneficios](file:///src/app/dashboard/beneficios) | CP-10 | **CUBIERTO** | Catálogo de beneficios con asignación individual. |
| **REQ-11** | RF-11 | Portal de autogestión del empleado | [/dashboard/page.tsx](file:///src/app/dashboard/page.tsx) | CP-11 | **CUBIERTO** | Vista de datos y solicitudes de su propio usuario. |
| **REQ-12** | RF-12 | Generar reportes analíticos rotación | [reporteService.ts](file:///src/services/reporteService.ts), [/dashboard/reportes](file:///src/app/dashboard/reportes) | CP-12 | **CUBIERTO** | Gráficas e indicadores clave de rotación de talento. |
| **REQ-13** | RF-13 | Validaciones de cumplimiento laboral | [cumplimientoService.ts](file:///src/services/cumplimientoService.ts) | CP-13 | **CUBIERTO** | Bitácora de seguimiento de regulaciones legales. |
| **REQ-14** | RF-14 | Reportes generales exportables | [reporteService.ts](file:///src/services/reporteService.ts) | CP-14 | **CUBIERTO** | Reportes consolidados imprimibles por departamento. |
| **REQ-15** | RNF-01 | Autenticación Supabase Auth | [supabaseClient.ts](file:///src/lib/supabaseClient.ts), [/login](file:///src/app/login) | CP-15 | **CUBIERTO** | Inicio de sesión seguro con redirección por token. |
| **REQ-16** | RNF-02 | Roles y permisos de seguridad RBAC | [permissions.ts](file:///src/lib/permissions.ts), [auth.ts](file:///src/lib/auth.ts) | CP-16 | **CUBIERTO** | Ocultar botones y bloquear rutas según rol. |
| **REQ-17** | RNF-03 | Rendimiento óptimo de consultas | Base de datos indexada en PostgreSQL (Migración 001) | CP-17 | **CUBIERTO** | Tiempos de carga menores a 2 segundos en DataTable. |
| **REQ-18** | RNF-04 | Arquitectura de código mantenible | Patrón Repository ([/services](file:///src/services)) | CP-18 | **CUBIERTO** | Separación limpia de lógica y acceso a datos. |
| **REQ-19** | RNF-05 | Auditoría completa e histórica | [auditoriaService.ts](file:///src/services/auditoriaService.ts) | CP-19 | **CUBIERTO** | Registro automático de INSERT y UPDATE en tabla auditoria. |
| **REQ-20** | RNF-06 | Privacidad de datos salariales | Row Level Security (RLS) en PostgreSQL | CP-20 | **CUBIERTO** | Empleados solo leen su salario; nómina es para Admin. |
| **REQ-21** | RNF-07 | Preparación de Base de datos respaldable | Configuración e integraciones Supabase | CP-21 | **CUBIERTO** | Esquema SQL puro, reproducible vía migraciones. |
| **REQ-22** | RNF-08 | Interfaz responsive y premium | CSS HSL Tailored + Componentes Tailwind | CP-22 | **CUBIERTO** | Adaptable a móviles, tablets y PCs con layout fluido. |
| **REQ-23** | RNF-09 | Mensajes claros de error | Componentes de UI con Alerts dinámicas | CP-23 | **CUBIERTO** | Feedback claro de rechazo de transacciones. |
| **REQ-24** | RNF-10 | Tipado estricto TypeScript | [/types](file:///src/types) | CP-24 | **CUBIERTO** | Cero uso de `any` injustificado y compilación limpia. |

---

## 2. Definición de Casos de Prueba (CP)
Los casos de prueba asociados a esta matriz están detallados paso a paso con datos de entrada y salidas esperadas en el documento [Plan_Pruebas_QA.md](file:///docs/Plan_Pruebas_QA.md) para garantizar la verificabilidad académica del MVP.
