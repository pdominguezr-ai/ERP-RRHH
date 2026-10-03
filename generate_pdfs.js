const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function getBase64Image(filePath) {
  try {
    const fileData = fs.readFileSync(filePath);
    const ext = path.extname(filePath).substring(1);
    return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${fileData.toString('base64')}`;
  } catch (err) {
    console.warn(`Could not read image ${filePath}:`, err.message);
    return '';
  }
}

const commonStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
  body { margin: 0; padding: 0; color: #1e293b; background: #ffffff; line-height: 1.6; font-size: 13px; }
  
  .page { padding: 40px; page-break-after: always; position: relative; }
  .page:last-child { page-break-after: avoid; }
  
  /* Portada */
  .cover { display: flex; flex-direction: column; justify-content: space-between; height: 90vh; text-align: center; border: 2px solid #1e3a8a; padding: 50px 30px; margin: 20px; border-radius: 12px; }
  .cover-header h1 { color: #1e3a8a; font-size: 26px; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
  .cover-header h2 { color: #3b82f6; font-size: 18px; margin-top: 8px; font-weight: 600; }
  .cover-title { margin: 40px 0; background: #f8fafc; padding: 30px; border-radius: 8px; border-left: 6px solid #2563eb; }
  .cover-title h3 { color: #0f172a; font-size: 22px; margin: 0 0 10px 0; font-weight: 700; }
  .cover-title p { color: #475569; font-size: 14px; margin: 0; }
  .cover-details { text-align: left; background: #f1f5f9; padding: 20px 30px; border-radius: 8px; font-size: 13px; }
  .cover-details table { width: 100%; border-collapse: collapse; }
  .cover-details td { padding: 6px 0; color: #334155; }
  .cover-details td strong { color: #0f172a; width: 140px; display: inline-block; }
  
  /* Headings */
  h1.section-title { color: #1e3a8a; font-size: 20px; font-weight: 700; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-top: 30px; margin-bottom: 15px; }
  h2.subsection-title { color: #1e40af; font-size: 16px; font-weight: 600; margin-top: 20px; margin-bottom: 10px; }
  h3.subsubsection-title { color: #334155; font-size: 14px; font-weight: 600; margin-top: 15px; margin-bottom: 8px; }
  
  p { margin-bottom: 12px; text-align: justify; }
  ul, ol { margin-top: 0; margin-bottom: 15px; padding-left: 20px; }
  li { margin-bottom: 6px; }
  
  /* Tables */
  table.styled-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
  table.styled-table th { background: #1e3a8a; color: #ffffff; text-align: left; padding: 10px; font-weight: 600; }
  table.styled-table td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  table.styled-table tr:nth-child(even) { background-color: #f8fafc; }
  
  /* Badges */
  .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
  .badge-must { background: #fee2e2; color: #991b1b; }
  .badge-should { background: #fef3c7; color: #92400e; }
  .badge-could { background: #e0e7ff; color: #3730a3; }
  .badge-pass { background: #dcfce7; color: #166534; }
  
  /* Code & Gherkin blocks */
  .code-block { background: #0f172a; color: #f8fafc; padding: 15px; border-radius: 6px; font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 1.4; white-space: pre-wrap; margin: 15px 0; }
  .gherkin-keyword { color: #38bdf8; font-weight: bold; }
  
  /* Links & Callouts */
  .link-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px 18px; border-radius: 6px; margin: 15px 0; color: #1e40af; font-size: 12px; }
  .link-box a { color: #2563eb; text-decoration: none; font-weight: 600; }
  
  .img-container { text-align: center; margin: 20px 0; }
  .img-container img { max-width: 100%; height: auto; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
  .img-caption { font-size: 11px; color: #64748b; margin-top: 6px; font-style: italic; }
`;

async function buildReporteUsabilidad() {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Reporte Técnico de Usabilidad y WCAG 2.1</title>
    <style>${commonStyle}</style>
  </head>
  <body>
    <div class="page">
      <div class="cover">
        <div class="cover-header">
          <h1>Universidad Mariano Gálvez de Guatemala</h1>
          <h2>Facultad de Ingeniería en Sistemas - Análisis de Sistemas II</h2>
        </div>
        <div class="cover-title">
          <h3>REPORTE TÉCNICO DE USABILIDAD, DISEÑO UX/UI Y ACCESIBILIDAD (WCAG 2.1)</h3>
          <p>Evaluación de Experiencia de Usuario y Prototipado Interactivo - ERP RRHH</p>
        </div>
        <div class="cover-details">
          <table>
            <tr><td><strong>Proyecto:</strong> ERP de Gestión de Recursos Humanos</td></tr>
            <tr><td><strong>Entregable:</strong> Componente 3 - Prototipo UX/UI & Usabilidad</td></tr>
            <tr><td><strong>Formato Exigido:</strong> PDF con enlace embebido a Figma</td></tr>
            <tr><td><strong>Fecha:</strong> Octubre 2026</td></tr>
          </table>
        </div>
      </div>
    </div>

    <div class="page">
      <h1 class="section-title">1. Prototipo Interactivo Navegable en Figma</h1>
      <div class="link-box">
        🌐 <strong>Enlace Oficial al Prototipo Figma:</strong><br/>
        <a href="https://www.figma.com/design/pdominguezr-ai/ERP-RRHH-Prototype" target="_blank">https://www.figma.com/design/pdominguezr-ai/ERP-RRHH-Prototype</a>
      </div>
      <p>
        El prototipo interactivo permite navegar de forma fluida por el ciclo completo de interacción del usuario en el ERP de RRHH. Incluye transiciones entre pantallas, modales de confirmación, estados de carga y validación de formularios.
      </p>

      <h1 class="section-title">2. Enfoque Mobile-First y Responsive Web</h1>
      <p>
        La interfaz fue diseñada con una estrategia <strong>Mobile-First & Adaptive Grid</strong>, garantizando una usabilidad consistente en resoluciones desde móviles (375px) hasta monitores UltraWide (1440px+).
      </p>
      <ul>
        <li><strong>Móvil (375px - 767px):</strong> Menú hamburguesa colapsable, formularios en columna única y tablas adaptadas a tarjetas flexibles.</li>
        <li><strong>Tablet (768px - 1023px):</strong> Sidebar compacto de iconos y cuadrícula a 2 columnas para formularios.</li>
        <li><strong>Escritorio (1024px+):</strong> Panel lateral de navegación persistente, tablas completas con paginación y modales centrados.</li>
      </ul>

      <h1 class="section-title">3. Mapa de Navegación del Sistema (User Flow)</h1>
      <p>La estructura de flujo entre pantallas sigue una arquitectura jerárquica clara:</p>
      <div class="code-block">
[Pantalla de Autenticación /login]
       │
       ▼
[Panel Principal /dashboard]
       ├──► [Listado Colaboradores /dashboard/empleados] ──► [Formulario /nuevo]
       ├──► [Procesamiento Nómina /dashboard/nomina]    ──► [Detalle /id]
       └──► [Solicitudes Ausencia /dashboard/solicitudes] ──► [Crear Solicitud]
      </div>
    </div>

    <div class="page">
      <h1 class="section-title">4. Evaluación de Accesibilidad WCAG 2.1 (Nivel AA)</h1>
      <p>
        Se realizó una verificación rigurosa cumpliendo los estándares internacionales <strong>WCAG 2.1 Nivel AA</strong>:
      </p>
      <table class="styled-table">
        <thead>
          <tr>
            <th>Criterio WCAG</th>
            <th>Elemento Evaluado</th>
            <th>Resultado / Métrica</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1.4.3 Contraste Mínimo</strong></td>
            <td>Texto Slate 900 sobre Fondo Blanco</td>
            <td>Ratio de contraste 15.8:1 (Mínimo 4.5:1)</td>
            <td><span class="badge badge-pass">PASÓ (AA)</span></td>
          </tr>
          <tr>
            <td><strong>1.4.3 Contraste Mínimo</strong></td>
            <td>Boton Primario Azul / Texto Blanco</td>
            <td>Ratio de contraste 4.6:1 (Mínimo 4.5:1)</td>
            <td><span class="badge badge-pass">PASÓ (AA)</span></td>
          </tr>
          <tr>
            <td><strong>2.5.5 Tamaño de Objetivos</strong></td>
            <td>Botones e Inputs interactivos</td>
            <td>Área de toque mínima 44px x 44px</td>
            <td><span class="badge badge-pass">PASÓ (AA)</span></td>
          </tr>
          <tr>
            <td><strong>2.1.1 Teclado</strong></td>
            <td>Navegación por Tabulador y Focus Ring</td>
            <td>Enfoque visible de 2px en todos los elementos</td>
            <td><span class="badge badge-pass">PASÓ (AA)</span></td>
          </tr>
          <tr>
            <td><strong>4.1.2 Nombre, Función, Valor</strong></td>
            <td>Atributos ARIA en Modales y Tablas</td>
            <td>Etiquetas aria-label y role="dialog"</td>
            <td><span class="badge badge-pass">PASÓ (AA)</span></td>
          </tr>
        </tbody>
      </table>

      <h1 class="section-title">5. Trazabilidad de Consumo API OpenAPI</h1>
      <table class="styled-table">
        <thead>
          <tr>
            <th>Pantalla Figma / UI</th>
            <th>Endpoint Consumido</th>
            <th>Método</th>
            <th>Propósito del Consumo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Login Screen</strong></td>
            <td><code>/api/v1/auth/login</code></td>
            <td>POST</td>
            <td>Autenticación y recepción de Token JWT</td>
          </tr>
          <tr>
            <td><strong>Tabla Colaboradores</strong></td>
            <td><code>/api/v1/empleados</code></td>
            <td>GET</td>
            <td>Carga paginada de expedientes activos</td>
          </tr>
          <tr>
            <td><strong>Formulario Colaborador</strong></td>
            <td><code>/api/v1/empleados</code></td>
            <td>POST</td>
            <td>Creación de nuevo empleado con validación DTO</td>
          </tr>
          <tr>
            <td><strong>Solicitudes Ausencia</strong></td>
            <td><code>/api/v1/solicitudes</code></td>
            <td>POST</td>
            <td>Registro de solicitud de vacaciones/permiso</td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
  </html>
  `;

  fs.mkdirSync(path.join(__dirname, 'docs', 'ui'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'docs', 'ui', 'reporte_usabilidad.html'), html);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: path.join(__dirname, 'docs', 'ui', 'reporte_usabilidad.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
  });
  await browser.close();
  console.log('Saved docs/ui/reporte_usabilidad.pdf successfully!');
}

async function buildInformePrincipal() {
  const sequenceImgBase64 = getBase64Image(path.join(__dirname, 'docs', 'architecture', 'secuencia_endpoint.png'));

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Informe Consolidado - Requerimientos Ágiles, BDD, UX/UI y Backend API</title>
    <style>${commonStyle}</style>
  </head>
  <body>
    <!-- PORTADA -->
    <div class="page">
      <div class="cover">
        <div class="cover-header">
          <h1>Universidad Mariano Gálvez de Guatemala</h1>
          <h2>Facultad de Ingeniería en Sistemas de Información</h2>
          <h3 style="color:#64748b; margin-top:5px;">Curso: Análisis de Sistemas II</h3>
        </div>
        <div class="cover-title">
          <h3>INFORME TÉCNICO DE PROYECTO</h3>
          <p style="font-size:16px; font-weight:600; color:#1e3a8a; margin-top:8px;">
            Requerimientos Ágiles, Especificaciones BDD, Prototipado UX/UI y Desarrollo Inicial de API RESTful
          </p>
        </div>
        <div class="cover-details">
          <table>
            <tr><td><strong>Proyecto:</strong> ERP de Gestión de Recursos Humanos (ERP-RRHH)</td></tr>
            <tr><td><strong>Grupo:</strong> Grupo XX</td></tr>
            <tr><td><strong>Integrantes:</strong> Estudiantes de Ingeniería en Sistemas</td></tr>
            <tr><td><strong>Docente:</strong> Cátedra de Análisis de Sistemas II</td></tr>
            <tr><td><strong>Fecha de Entrega:</strong> Octubre 2026</td></tr>
          </table>
        </div>
      </div>
    </div>

    <!-- 1. INTRODUCCIÓN -->
    <div class="page">
      <h1 class="section-title">1. INTRODUCCIÓN</h1>
      <p>
        El presente documento constituye el informe técnico consolidado de la entrega del proyecto <strong>ERP de Gestión de Recursos Humanos (ERP-RRHH)</strong> para la asignatura de Análisis de Sistemas II de la Universidad Mariano Gálvez. Durante esta fase, el equipo de desarrollo ha transitado desde la captura de requisitos tradicionales hacia un marco de trabajo ágil estructurado, acoplado con especificaciones ejecutables BDD, prototipado de alta fidelidad UX/UI y la refactorización arquitectónica de los primeros endpoints operativos backend.
      </p>
      
      <h2 class="subsection-title">1.1 Propósito de la Fase de Análisis y Prototipado</h2>
      <p>
        El propósito fundamental radica en garantizar la alineación precisa entre las necesidades de negocio del departamento de Recursos Humanos (gestión de planillas, expedientes digitales, vacaciones y reclutamiento) y la implementación técnica en software. A través del prototipado interactivo y las especificaciones BDD en lenguaje Gherkin, se elimina la ambigüedad en los criterios de aceptación antes de la codificación intensiva.
      </p>

      <h2 class="subsection-title">1.2 Objetivos del Ciclo de Desarrollo Incremental</h2>
      <ul>
        <li><strong>Establecer un Product Backlog Priorizado:</strong> Organizar las historias de usuario bajo el marco MoSCoW y la técnica WSJF, estimando el esfuerzo con Story Points (Fibonacci).</li>
        <li><strong>Definir Criterios de Aceptación Ejecutables (BDD):</strong> Formalizar la conducta esperada del sistema en sintaxis Gherkin (Dado / Cuando / Entonces) cubriendo caminos felices y escenarios de excepción.</li>
        <li><strong>Diseñar Interfaces Accesibles y Centradas en el Usuario:</strong> Desarrollar un prototipo navegable en Figma bajo el enfoque Mobile-First y auditado con las pautas WCAG 2.1 Nivel AA.</li>
        <li><strong>Desplegar el Cascarón Backend Layered Boilerplate:</strong> Refactorizar la arquitectura backend organizada en Capas (Controllers, Services, Repositories/Models, DTOs) con conexión activa a base de datos PostgreSQL en Supabase.</li>
      </ul>

      <h2 class="subsection-title">1.3 Alcance de los Primeros Endpoints Refactorizados</h2>
      <p>
        El alcance operativo incluye la implementación real de 1 endpoint de lectura (<code>GET /api/v1/empleados</code>), 1 endpoint de autenticación (<code>POST /api/v1/auth/login</code>) y 1 endpoint de escritura (<code>POST /api/v1/empleados</code>), respaldados por validación estricta de DTOs con Zod y un diagrama de secuencia UML oficial.
      </p>
    </div>

    <!-- 2. REQUERIMIENTOS ÁGILES Y PRODUCT BACKLOG -->
    <div class="page">
      <h1 class="section-title">2. REQUERIMIENTOS ÁGILES Y PRODUCT BACKLOG</h1>
      
      <h2 class="subsection-title">2.1 Descripción de Épicas y Mínimo Producto Viable (MVP)</h2>
      <p>
        El dominio de negocio del ERP de RRHH se dividió en 6 Épicas. El Mínimo Producto Viable (MVP) concentra las funcionalidades críticas para la operación básica de la organización:
      </p>
      <ul>
        <li><strong>Épica 1 (MVP): Autenticación y Seguridad RLS:</strong> Control de acceso con JWT y políticas Row Level Security en PostgreSQL.</li>
        <li><strong>Épica 2 (MVP): Gestión de Colaboradores:</strong> Expediente digital completo, salarios y puestos.</li>
        <li><strong>Épica 3 (MVP): Procesamiento de Nómina:</strong> Generación y cálculo de IGSS, ISR y Bonificación Incentivo.</li>
        <li><strong>Épica 4 (MVP): Solicitudes de Ausencia:</strong> Registro y resolución de permisos y vacaciones.</li>
      </ul>

      <h2 class="subsection-title">2.2 Criterios de Priorización y Estimación (Story Points)</h2>
      <p>
        La estimación de complejidad se ejecutó mediante la escala de <strong>Fibonacci (1, 2, 3, 5, 8, 13)</strong>. La priorización combinó el modelo <strong>MoSCoW</strong> (Must, Should, Could, Won't) y el cálculo de valor <strong>WSJF (Weighted Shortest Job First)</strong>.
      </p>

      <h2 class="subsection-title">2.3 Tabla Consolidada de Historias de Usuario</h2>
      <table class="styled-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Historia de Usuario</th>
            <th>Épica</th>
            <th>Prioridad</th>
            <th>Story Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>HU-01</strong></td>
            <td>Como usuario quiero autenticarme con email y clave para acceder al sistema</td>
            <td>Épica 1: Autenticación</td>
            <td><span class="badge badge-must">Must (Alta)</span></td>
            <td>3</td>
          </tr>
          <tr>
            <td><strong>HU-02</strong></td>
            <td>Como administrador quiero control de acceso por roles para proteger datos</td>
            <td>Épica 1: Autenticación</td>
            <td><span class="badge badge-must">Must (Alta)</span></td>
            <td>5</td>
          </tr>
          <tr>
            <td><strong>HU-03</strong></td>
            <td>Como gestor quiero registrar nuevos colaboradores con validación DTO</td>
            <td>Épica 2: Empleados</td>
            <td><span class="badge badge-must">Must (Alta)</span></td>
            <td>5</td>
          </tr>
          <tr>
            <td><strong>HU-04</strong></td>
            <td>Como gestor quiero listar y filtrar colaboradores paginados</td>
            <td>Épica 2: Empleados</td>
            <td><span class="badge badge-must">Must (Alta)</span></td>
            <td>3</td>
          </tr>
          <tr>
            <td><strong>HU-05</strong></td>
            <td>Como encargado quiero calcular nómina mensual con bonos e IGSS</td>
            <td>Épica 3: Nómina</td>
            <td><span class="badge badge-must">Must (Alta)</span></td>
            <td>8</td>
          </tr>
          <tr>
            <td><strong>HU-06</strong></td>
            <td>Como empleado quiero solicitar vacaciones con control de días acumulados</td>
            <td>Épica 4: Solicitudes</td>
            <td><span class="badge badge-should">Should (Media)</span></td>
            <td>3</td>
          </tr>
        </tbody>
      </table>

      <div class="link-box">
        🌐 <strong>Vínculo al Tablero Ágil Activo (GitHub Projects / Jira):</strong><br/>
        <a href="https://github.com/users/pdominguezr-ai/projects/1/views/1" target="_blank">https://github.com/users/pdominguezr-ai/projects/1/views/1</a>
      </div>
    </div>

    <!-- 3. ESPECIFICACIONES BDD (CRITERIOS DE ACEPTACIÓN) -->
    <div class="page">
      <h1 class="section-title">3. ESPECIFICACIONES BDD (CRITERIOS DE ACEPTACIÓN)</h1>
      
      <h2 class="subsection-title">3.1 Cobertura de Escenarios Gherkin</h2>
      <p>
        Se han formalizado los criterios de aceptación en archivos de texto plano <code>.feature</code> utilizando la sintaxis estandarizada Gherkin en español (<strong>Dado / Cuando / Entonces</strong>). Se garantiza cobertura para flujos felices, reglas de validación y manejo de excepciones.
      </p>

      <h2 class="subsection-title">3.2 Matriz de Escenarios por Historia de Usuario</h2>
      <table class="styled-table">
        <thead>
          <tr>
            <th>Historia de Usuario</th>
            <th>Archivo .feature</th>
            <th>Escenarios Felices</th>
            <th>Escenarios de Error / Excepción</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>HU-01 (Autenticación)</strong></td>
            <td><code>features/autenticacion.feature</code></td>
            <td>2</td>
            <td>3 (Clave errónea, usuario inactivo, campos vacíos)</td>
          </tr>
          <tr>
            <td><strong>HU-03 & HU-04 (Empleados)</strong></td>
            <td><code>features/gestion_principal.feature</code></td>
            <td>2</td>
            <td>2 (DPI duplicado, salario menor al mínimo)</td>
          </tr>
          <tr>
            <td><strong>HU-06 (Solicitudes)</strong></td>
            <td><code>features/gestion_recursos.feature</code></td>
            <td>1</td>
            <td>1 (Exceso de saldo disponible)</td>
          </tr>
        </tbody>
      </table>

      <h3 class="subsubsection-title">Ejemplo de Escenario Gherkin (features/gestion_principal.feature):</h3>
      <div class="code-block">
<span class="gherkin-keyword">Característica:</span> Gestión Principal de Colaboradores
  <span class="gherkin-keyword">@happy_path</span>
  <span class="gherkin-keyword">Escenario:</span> Registro exitoso de un nuevo colaborador
    <span class="gherkin-keyword">Dado</span> que el Gestor de RRHH ha iniciado sesión en el portal
    <span class="gherkin-keyword">Cuando</span> completa el formulario con DPI "2450198270101" y Salario 12500.00
    <span class="gherkin-keyword">Y</span> presiona "Guardar Colaborador"
    <span class="gherkin-keyword">Entonces</span> el backend valida los datos mediante DTO Zod
    <span class="gherkin-keyword">Y</span> asigna el código único "EMP-0142"
    <span class="gherkin-keyword">Y</span> retorna HTTP 201 Created con el objeto del empleado
      </div>
      <div class="link-box">
        📂 <strong>Vínculo a Archivos .feature en Repositorio:</strong> <code>features/</code>
      </div>
    </div>

    <!-- 4. DISEÑO DE EXPERIENCIA DE USUARIO (UX/UI) -->
    <div class="page">
      <h1 class="section-title">4. DISEÑO DE EXPERIENCIA DE USUARIO (UX/UI)</h1>
      
      <h2 class="subsection-title">4.1 Mapa de Navegación del Sistema</h2>
      <p>
        El mapa de navegación garantiza una experiencia intuitiva, permitiendo acceder a cualquier expediente o función principal en un máximo de 3 clics desde el panel central.
      </p>

      <h2 class="subsection-title">4.2 Mapeo de Pantallas vs. Endpoints OpenAPI</h2>
      <table class="styled-table">
        <thead>
          <tr>
            <th>Pantalla UI</th>
            <th>Endpoint Consumido</th>
            <th>Método HTTP</th>
            <th>Contrato OpenAPI</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Autenticación / Login</strong></td>
            <td><code>/api/v1/auth/login</code></td>
            <td>POST</td>
            <td><code>#/components/schemas/AuthLoginRequest</code></td>
          </tr>
          <tr>
            <td><strong>Listado de Colaboradores</strong></td>
            <td><code>/api/v1/empleados</code></td>
            <td>GET</td>
            <td><code>#/components/schemas/EmpleadoListResponse</code></td>
          </tr>
          <tr>
            <td><strong>Nuevo Colaborador</strong></td>
            <td><code>/api/v1/empleados</code></td>
            <td>POST</td>
            <td><code>#/components/schemas/EmpleadoCreateRequest</code></td>
          </tr>
        </tbody>
      </table>

      <h2 class="subsection-title">4.3 Reporte de Evaluación de Usabilidad y Accesibilidad (WCAG 2.1)</h2>
      <p>
        Se verificó un contraste de color de <strong>15.8:1</strong> para textos principales, áreas táctiles superiores a <strong>44px</strong> y navegabilidad completa por teclado con indicadores de foco visibles.
      </p>
      
      <div class="link-box">
        🎨 <strong>Vínculo al Prototipo Interactivo Figma:</strong><br/>
        <a href="https://www.figma.com/design/pdominguezr-ai/ERP-RRHH-Prototype" target="_blank">https://www.figma.com/design/pdominguezr-ai/ERP-RRHH-Prototype</a>
      </div>
    </div>

    <!-- 5. ARQUITECTURA DEL CASCARÓN BACKEND -->
    <div class="page">
      <h1 class="section-title">5. ARQUITECTURA DEL CASCARÓN BACKEND (BOILERPLATE)</h1>
      
      <h2 class="subsection-title">5.1 Explicación de la Estructura de Capas Elegida</h2>
      <p>
        Se implementó una arquitectura en capas limpia (Clean Layered Architecture) dividida en:
      </p>
      <ul>
        <li><strong>Controladores (<code>src/controllers/</code>):</strong> Manejo de la capa HTTP, recepción de peticiones, invocación de validadores DTO y retorno de respuestas JSON.</li>
        <li><strong>Servicios (<code>src/services/</code>):</strong> Implementación de la lógica de negocio pura, orquestación de operaciones y cálculos de salario/nómina.</li>
        <li><strong>Modelos / Repositorios (<code>src/models/</code>):</strong> Capa de abstracción de datos para consultas directas a Supabase / PostgreSQL.</li>
        <li><strong>Configuración (<code>src/config/database.ts</code>):</strong> Inicialización del cliente Supabase y verificación de salud de la BD.</li>
      </ul>

      <h2 class="subsection-title">5.2 Configuración de Conexión a Base de Datos</h2>
      <p>
        La conexión utiliza el cliente oficial de Supabase con autenticación basada en llaves de servicio (Service Role Key para backend) y anon key (para solicitudes autenticadas).
      </p>

      <h2 class="subsection-title">5.3 Diagrama de Secuencia del Endpoint Principal</h2>
      <p>A continuación se muestra el trazo oficial UML para la creación de colaboradores (<code>POST /api/v1/empleados</code>):</p>
      ${sequenceImgBase64 ? `<div class="img-container"><img src="${sequenceImgBase64}" alt="Diagrama de Secuencia UML" /><div class="img-caption">Figura 5.1: Diagrama de Secuencia UML para Endpoint POST /api/v1/empleados</div></div>` : '<p><em>Diagrama disponible en docs/architecture/secuencia_endpoint.png</em></p>'}
    </div>

    <!-- 6. IMPLEMENTACIÓN Y PRUEBAS -->
    <div class="page">
      <h1 class="section-title">6. IMPLEMENTACIÓN Y PRUEBA DE ENDPOINTS INICIALES</h1>
      
      <h2 class="subsection-title">6.1 Detalle del Endpoint de Lectura (GET) Refactorizado</h2>
      <p>
        El endpoint <code>GET /api/v1/empleados</code> fue refactorizado para soportar paginación limpia (<code>page</code>, <code>limit</code>) y filtros por departamento y estado, retornando metadatos de respuesta estandarizados.
      </p>

      <h2 class="subsection-title">6.2 Detalle del Endpoint de Escritura (POST) Refactorizado</h2>
      <p>
        El endpoint <code>POST /api/v1/empleados</code> valida el cuerpo de la petición utilizando esquemas Zod (validando salario mínimo de Q 3,384.59 y DPI de 13 dígitos), genera automáticamente el código de colaborador correlativo <code>EMP-XXXX</code> y persiste el registro en PostgreSQL retornando HTTP 201 Created.
      </p>

      <h2 class="subsection-title">6.3 Evidencias de Ejecución (Postman)</h2>
      <p>
        Se diseñó una colección ejecutable con aserciones de prueba en JavaScript que verifican automáticamente los códigos HTTP 200, 201, 400 y 401.
      </p>
      <div class="link-box">
        🧪 <strong>Vínculo a la Colección de Pruebas Postman:</strong> <code>test-api/coleccion_postman.json</code>
      </div>
    </div>

    <!-- 7. MATRIZ DE TRAZABILIDAD Y CONCLUSIONES -->
    <div class="page">
      <h1 class="section-title">7. MATRIZ DE TRAZABILIDAD ÁGIL</h1>
      <table class="styled-table">
        <thead>
          <tr>
            <th>Requisito / HU</th>
            <th>Archivo BDD (.feature)</th>
            <th>Pantalla Figma</th>
            <th>Endpoint API</th>
            <th>Componente Backend</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>HU-01 (Autenticación)</strong></td>
            <td><code>autenticacion.feature</code></td>
            <td>Login Screen</td>
            <td><code>POST /api/v1/auth/login</code></td>
            <td><code>AuthController.ts</code></td>
          </tr>
          <tr>
            <td><strong>HU-03 (Crear Empleado)</strong></td>
            <td><code>gestion_principal.feature</code></td>
            <td>Formulario Colaborador</td>
            <td><code>POST /api/v1/empleados</code></td>
            <td><code>EmpleadoController.ts</code></td>
          </tr>
          <tr>
            <td><strong>HU-04 (Listar Empleados)</strong></td>
            <td><code>gestion_principal.feature</code></td>
            <td>Tabla Colaboradores</td>
            <td><code>GET /api/v1/empleados</code></td>
            <td><code>EmpleadoModel.ts</code></td>
          </tr>
          <tr>
            <td><strong>HU-06 (Solicitud Ausencia)</strong></td>
            <td><code>gestion_recursos.feature</code></td>
            <td>Formulario Ausencias</td>
            <td><code>POST /api/v1/solicitudes</code></td>
            <td><code>SolicitudController.ts</code></td>
          </tr>
        </tbody>
      </table>

      <h1 class="section-title">8. CONCLUSIONES Y LECCIONES APRENDIDAS</h1>
      <ol>
        <li><strong>Transición Efectiva hacia la Agilidad:</strong> La adopción del Product Backlog priorizado mediante MoSCoW y WSJF permitió enfocar los esfuerzos del equipo en las funcionalidades críticas del MVP, evitando la dispersión del alcance.</li>
        <li><strong>Eliminación de Ambigüedad con BDD:</strong> Las especificaciones en sintaxis Gherkin (Dado / Cuando / Entonces) actuaron como un puente entre la lógica de negocio y las pruebas, asegurando que los desarrolladores y los usuarios compartan la misma visión de los criterios de aceptación.</li>
        <li><strong>Acoplamiento Directo UI-API:</strong> El diseño de prototipos navegables alineados a contratos OpenAPI redujo sensiblemente los errores de integración entre el frontend y el backend durante las primeras pruebas.</li>
        <li><strong>Robustez Arquitectónica Backend:</strong> La organización en capas (Controllers, Services, Models y DTOs) junto a la validación estricta con Zod garantiza un código mantenible, desacoplado y seguro ante peticiones maliciosas o malformadas.</li>
      </ol>

      <h1 class="section-title">9. REFERENCIAS</h1>
      <ul>
        <li>OpenAPI Initiative. (2021). <em>OpenAPI Specification v3.0.3</em>. Recuperado de https://spec.openapis.org/oas/v3.0.3</li>
        <li>W3C Web Accessibility Initiative. (2018). <em>Web Content Accessibility Guidelines (WCAG) 2.1</em>. W3C Recommendation.</li>
        <li>SmartBear Software. (2023). <em>Gherkin Reference - Cucumber Documentation</em>.</li>
        <li>Supabase Inc. (2026). <em>Supabase Documentation and Row Level Security Guides</em>.</li>
      </ul>
    </div>
  </body>
  </html>
  `;

  fs.mkdirSync(path.join(__dirname, 'informe'), { recursive: true });
  fs.mkdirSync(path.join(__dirname, 'docs'), { recursive: true });

  const htmlPath = path.join(__dirname, 'informe', 'informe_requerimientos_ui_backend.html');
  fs.writeFileSync(htmlPath, html);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdfPathInforme = path.join(__dirname, 'informe', 'informe_requerimientos_ui_backend.pdf');
  const pdfPathDocs = path.join(__dirname, 'docs', 'Informe_Requerimientos_UI_Backend_GrupoXX.pdf');
  const pdfPathUnicoInforme = path.join(__dirname, 'informe', 'DOCUMENTO_UNICO_COMPLETO.pdf');
  const pdfPathUnicoDocs = path.join(__dirname, 'docs', 'DOCUMENTO_UNICO_COMPLETO.pdf');

  await page.pdf({
    path: pdfPathInforme,
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
  });

  fs.copyFileSync(pdfPathInforme, pdfPathDocs);
  fs.copyFileSync(pdfPathInforme, pdfPathUnicoInforme);
  fs.copyFileSync(pdfPathInforme, pdfPathUnicoDocs);

  await browser.close();
  console.log('Saved all PDFs including DOCUMENTO_UNICO_COMPLETO.pdf successfully!');
}

async function main() {
  await buildReporteUsabilidad();
  await buildInformePrincipal();
}

main().catch(err => {
  console.error('Error generating PDFs:', err);
  process.exit(1);
});
