# Instrucciones para Antigravity: auditoria integral ERP-RRHH

## Contexto y objetivo
Repositorio: https://github.com/pdominguezr-ai/ERP-RRHH.git
Proyecto: modulo de recursos humanos de un ERP, Universidad Mariano Galvez, Analisis de Sistemas II.
Tecnologias declaradas en README: Next.js 16, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, RLS). Verificar contra el codigo actual de la rama abierta; no asumir que el README este actualizado.

**Mision:** auditar TODO el repositorio frente a la rubrica siguiente, subsanar faltantes seguros y producir una guia verificable de evidencias por criterio. El sistema esta terminado: NO reescribirlo ni reemplazar su arquitectura solo para imitar el arbol de ejemplo de la rubrica.

## Reglas obligatorias
1. Antes de editar, identificar rama, commit, estado de Git y archivos modificados. No cambiar de rama ni hacer push/commit sin autorizacion. Respetar cambios locales.
2. Leer AGENTS.md, CLAUDE.md, README.md, package.json, estructura src/, docs/, features/, tests/, supabase/, informe/ y configuracion. Seguir instrucciones del proyecto siempre que no contradigan estas reglas.
3. Crear inventario real recursivo y mapear rutas existentes. No inventar archivos, enlaces, capturas, pruebas exitosas, integraciones ni resultados.
4. Clasificar cada requisito como CUMPLE, PARCIAL, NO CUMPLE o NO VERIFICABLE. Separar 'documentado', 'implementado' y 'probado'. Toda afirmacion debe tener ruta concreta y, cuando sea posible, simbolo, seccion, linea o comando reproducible.
5. Ejecutar comandos de validacion disponibles (lint, typecheck, build, pruebas) solo tras revisar scripts y dependencias. Registrar comando, fecha, salida y restricciones. No ejecutar seeds, migraciones ni operaciones destructivas contra datos reales. Usar entornos de prueba y pedir autorizacion si hace falta.
6. No exponer secretos, credenciales, tokens ni datos personales; revisar .env.example sin copiar valores sensibles. No publicar cuentas demo y contrasenas en documentos publicos.
7. Antes de implementar nuevos servicios, bases de datos, integraciones, dependencias o cambios de arquitectura, pedir aprobacion. Se permite mejorar documentos, diagramas, ejemplos y pruebas aisladas sin romper el codigo. No fabricar una implementacion de Redis/MongoDB/Neo4j cuando no exista.
8. No reemplazar documentos existentes sin comparar contenido. Preservar archivos originales; preferir cambios minimos y compatibles. No crear PDFs falsos (p. ej. renombrar .md a .pdf). Exportar realmente PDF/PNG cuando herramientas lo permitan; registrar impedimentos.
9. La rubrica ofrece ejemplos de endpoints y estructura generica; adaptar al Next.js App Router y Supabase reales. No forzar app.js ni endpoints /recursos si el proyecto utiliza rutas distintas.
10. Priorizar criterios de mayor puntaje y generar un informe de brechas antes de corregir.

## Rubrica exhaustiva (10 puntos)

### Criterio 1 - Requerimientos, UML, SDD y agilidad (1.0)
- SRS formal ISO/IEC/IEEE 29148:2018 en PDF, RF/RNF con identificadores unicos y redaccion sujeto + obligacion + accion + condicion.
- UML 2.5.1: clases de analisis/diseno (composicion, agregacion, cardinalidad), secuencia critica, actividades con swimlanes y paquetes; fuentes editables .puml/.drawio y exportaciones PNG.
- Fichas SDD IEEE 1016-2009: atributos, interfaces, dependencias, excepciones por modulo; PDF.
- Backlog docs/agile/backlog.md: tablero agil real, rol Product Owner/analista, historias 3C, INVEST, DoR, DoD.

### Criterio 2 - Arquitectura, C4 y persistencia (1.0)
- Comparativa capas, repositorio, microservicios, EDA con escenarios ISO/IEC 25010 de escalabilidad, mantenibilidad, rendimiento; PDF/matriz.
- ADRs Markdown con contexto, decision, alternativas, consecuencias y estado, en docs/architecture/adrs/; referencia ISO/IEC/IEEE 42010.
- C4 niveles 1 contexto, 2 contenedores, 3 componentes y 4 codigo; fuentes editables y PNG en docs/c4/.
- Persistencia: comprobar uso real de PostgreSQL, MongoDB, Redis y Neo4j; justificar cada tecnologia, Cache-Aside con TTL y consistencia eventual. Si no existen, indicar NO IMPLEMENTADO y diferenciar propuesta conceptual de realidad. No alterar arquitectura sin permiso.
- Patrones Strategy, Repository, Gateway, Observer y Circuit Breaker: ubicar codigo real o marcar ausencia. Evitar atribuirles categoria GoF indiscriminadamente.

### Criterio 3 - API-First, RFC y BDD (2.0)
- docs/api/openapi.yaml valido en version 3.0.3, esquemas, parametros, ejemplos y rutas que coincidan con la aplicacion.
- Coleccion Postman/Thunder Client ejecutable y coherente con rutas reales.
- Errores con semantica HTTP RFC 9110 y application/problem+json RFC 9457; distinguir documentacion de implementacion.
- Explicacion conceptual de GraphQL y gRPC sin simular implementacion.
- features/*.feature con escenarios Gherkin, Scenario Outline y Examples, trazables a RF y pruebas; casos de aceptacion ISO/IEC/IEEE 29119-3:2021.
- Matriz RF -> HU -> API -> BDD -> pruebas.

### Criterio 4 - Backend funcional (2.0)
- Identificar 3 a 5 endpoints reales como minimo (metodo, ruta, archivo de handler, autenticacion, request, response, persistencia/cache, instrucciones de prueba).
- Validar que son ejecutables y conectan con persistencia; si falta entorno o credenciales, marcar NO VERIFICABLE y aportar procedimiento de prueba, no afirmar exito.
- Documentar que en Next.js App Router las rutas pueden vivir en src/app/api y no necesariamente en src/controllers.

### Criterio 5 - UX/UI, accesibilidad y mobile-first (2.0)
- Prototipo navegable Figma con enlace real y accesible (si falta, marcar pendiente externo y solicitarlo).
- Reporte PDF docs/ui/reporte_ux_ui.pdf con ISO 9241-210, journey maps, evaluacion heuristica Nielsen, ISO 9241-11, WCAG 2.2 POUR nivel AA, hallazgos y evidencias.
- Verificar codigo y estilos responsive mobile-first y componentes atomos/moleculas/organismos; no inferir conformidad WCAG AA sin auditoria.

### Criterio 6 - SQA, defectos, trazabilidad, entrega (2.0)
- Plan SQA IEEE 730-2014 en PDF: QA vs QC, shift-left, responsables, alcance, criterios, actividades, metricas.
- Piramide unitarias/integracion/E2E con evidencias; documentar cobertura real y brechas.
- Gestion de defectos IEEE 1044-2009: clasificacion, severidad, prioridad, estados y plantilla/reporte PDF.
- Casos de prueba ISO 29119-3, matriz integral RF/HU/C4/API/codigo/BDD/pruebas en PDF.
- README reproducible, .env.example seguro, estructura y rutas de entrega, informe principal PDF.

## Rutas de entrega esperadas (adaptar sin duplicar innecesariamente)
- docs/requirements/srs_ieee_29148.pdf
- docs/requirements/fichas_diseno_ieee1016.pdf
- docs/uml/ (clases, secuencia, actividades, paquetes: fuentes y PNG)
- docs/agile/backlog.md
- docs/architecture/adrs/*.md
- docs/architecture/escenarios_iso25010.pdf
- docs/c4/ (niveles 1-4 PNG y fuentes en src/)
- docs/database/ (modelo_poliglota.png, scripts_ddl.sql si corresponde a la realidad)
- docs/api/openapi.yaml, docs/api/postman_collection.json
- features/*.feature, tests/ o rutas reales de pruebas
- docs/ui/reporte_ux_ui.pdf
- docs/qa/plan_sqa_ieee730.pdf, casos_prueba_ieee29119.pdf, reporte_defectos_ieee1044.pdf, trazabilidad.pdf
- informe/informe_proyecto_final.pdf (o PDF consolidado documentado con su ruta real)
- README.md, .env.example, src/ y supabase/ segun corresponda

## Procedimiento de trabajo
**Fase A - Auditoria sin cambios:** leer archivos, construir matriz exhaustiva de subrequisitos, registrar evidencias y faltantes; inspeccionar endpoints, modelos, tests, documentos y links; emitir `AUDITORIA_RUBRICA.md` con prioridades y riesgos.

**Fase B - Correcciones seguras:** completar/actualizar documentos y fuentes de diagramas basados en codigo existente; generar exportaciones validas y pruebas no destructivas donde sea posible. Solicitar autorizacion para cambios de arquitectura, dependencias, integraciones, cambios funcionales, datos o infraestructura.

**Fase C - Verificacion:** ejecutar validaciones apropiadas, comprobar que los enlaces y artefactos existan, verificar PDFs/PNGs, comparar OpenAPI con handlers y comprobar trazabilidad bidireccional. Documentar resultados reales y pendientes externos.

**Fase D - Entregables finales:** generar o actualizar los siguientes archivos en la raiz del repositorio:
1. `AUDITORIA_RUBRICA.md`: tabla por cada subrequisito, estado inicial/final, evidencia, hallazgo, accion, validacion y prioridad; puntuacion ESTIMADA por criterio 1+1+2+2+2+2, explicando metodo, sin prometer calificacion docente.
2. `MAPA_ENTREGA_RUBRICA.md`: indice navegable para el docente, agrupado por los 6 criterios, con ruta exacta y enlace relativo clicable de CADA archivo, seccion/pagina/identificador, prueba verificable, estado y observaciones. Incluir indice del PDF principal por sus 9 secciones (portada; introduccion; requerimientos/UML/agilidad; arquitectura/C4/persistencia; API/backend/BDD; UX; SQA; trazabilidad; conclusiones/referencias). No marcar CUMPLE sin evidencia.
3. `PENDIENTES_ENTREGA.md`: solo tareas pendientes reales, ordenadas por impacto y con instrucciones concretas, incluyendo dependencias externas (Figma, tablero, accesos).
4. Actualizar README.md con enlaces a los tres documentos, sin destruir informacion util existente.

## Formato obligatorio de matriz en MAPA_ENTREGA_RUBRICA.md
| Criterio / subrequisito | Puntos del criterio | Estado | Evidencia y enlace relativo | Ubicacion exacta (archivo/seccion/linea) | Validacion | Pendiente |
|---|---:|---|---|---|---|---|

Agregar al final una seccion `GUIA PARA DEFENDER LA ENTREGA` con orden sugerido de demostracion: abrir PDF, mostrar artefactos, iniciar sistema si hay entorno, ejecutar 3-5 endpoints, mostrar BDD/tests y evidencias de UX/SQA. Dar comandos reales para este proyecto.

## Criterio de finalizacion
Entregar resumen de archivos creados/modificados, validaciones realizadas con resultados, cumplimiento por criterio y pendientes que requieren intervencion humana. Nunca declarar 10/10 sin evidencias completas.
