-- ============================================================
-- Seed básico de prueba — Sistema de Gestión de RRHH
-- ============================================================
-- IMPORTANTE: Ejecutar DESPUÉS de 001_initial_schema.sql
--
-- Los usuarios de Supabase Auth deben crearse manualmente en
-- Authentication > Users del dashboard de Supabase, usando los
-- correos indicados abajo. Luego actualiza los auth_user_id con
-- los UUID reales que Supabase asigne a cada usuario.
-- ============================================================

-- ── PASO 1: Crear usuarios en Supabase Auth (dashboard) ─────
-- admin@rrhh.com        contraseña: Admin1234!
-- jefe@rrhh.com         contraseña: Jefe1234!
-- reclutador@rrhh.com   contraseña: Recluta1234!
-- empleado@rrhh.com     contraseña: Empleado1234!

-- ── PASO 2: Registrar en usuarios_sistema ───────────────────
-- Reemplaza los UUID de auth_user_id con los reales del dashboard.

INSERT INTO usuarios_sistema (id, auth_user_id, correo, rol) VALUES
  ('a1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin@rrhh.com',       'ADMIN_RRHH'),
  ('a1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'jefe@rrhh.com',        'JEFE_INMEDIATO'),
  ('a1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'reclutador@rrhh.com',  'RECLUTADOR'),
  ('a1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'empleado@rrhh.com',    'EMPLEADO')
ON CONFLICT (correo) DO NOTHING;

-- ── Rol: Administrador RRHH ──────────────────────────────────
INSERT INTO administradores_rrhh (usuario_id, departamento) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Recursos Humanos')
ON CONFLICT DO NOTHING;

-- ── Rol: Reclutador ──────────────────────────────────────────
INSERT INTO reclutadores (usuario_id) VALUES
  ('a1000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- ── EMPLEADOS de prueba ──────────────────────────────────────
INSERT INTO empleados (id, codigo, nombres, apellidos, correo, telefono, fecha_ingreso, puesto, departamento, salario_base, estado) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'EMP-001', 'Carlos',  'García López',    'carlos.garcia@empresa.com',   '5555-1001', '2022-01-10', 'Desarrollador Senior',     'Tecnología',        18000.00, 'ACTIVO'),
  ('b1000000-0000-0000-0000-000000000002', 'EMP-002', 'María',   'Martínez Ruiz',   'maria.martinez@empresa.com',  '5555-1002', '2021-06-15', 'Analista Contable',        'Finanzas',          15000.00, 'ACTIVO'),
  ('b1000000-0000-0000-0000-000000000003', 'EMP-003', 'Sol',     'López',           'sol.lopez@empresa.com',       '5555-1003', '2020-03-01', 'Gerente de Operaciones',   'Operaciones',       25000.00, 'ACTIVO'),
  ('b1000000-0000-0000-0000-000000000004', 'EMP-004', 'Ana',     'López Torres',    'ana.lopez@empresa.com',       '5555-1004', '2023-08-20', 'Diseñadora UX',            'Tecnología',        14000.00, 'ACTIVO'),
  ('b1000000-0000-0000-0000-000000000005', 'EMP-005', 'Roberto', 'González Díaz',   'roberto.gonzalez@empresa.com','5555-1005', '2019-11-05', 'Coordinador de Ventas',    'Ventas',            16000.00, 'ACTIVO'),
  ('b1000000-0000-0000-0000-000000000006', 'EMP-006', 'Sandra',  'Hernández Vega',  'sandra.hernandez@empresa.com','5555-1006', '2024-01-15', 'Asistente Administrativa', 'Administración',     9500.00, 'ACTIVO'),
  ('b1000000-0000-0000-0000-000000000007', 'EMP-007', 'Juan',    'Ramírez Castro',  'juan.ramirez@empresa.com',    '5555-1007', '2018-04-10', 'Contador General',         'Finanzas',          22000.00, 'ACTIVO'),
  ('b1000000-0000-0000-0000-000000000008', 'EMP-008', 'Patricia', 'Flores Mendoza',  'patricia.flores@empresa.com', '5555-1008', '2022-09-01', 'Desarrolladora Junior',    'Tecnología',        11000.00, 'ACTIVO'),
  ('b1000000-0000-0000-0000-000000000009', 'EMP-009', 'Miguel',  'Torres Aguilar',  'miguel.torres@empresa.com',   '5555-1009', '2023-03-12', 'Técnico de Soporte',       'Tecnología',        10500.00, 'ACTIVO'),
  ('b1000000-0000-0000-0000-000000000010', 'EMP-010', 'Laura',   'Morales Jiménez', 'laura.morales@empresa.com',   '5555-1010', '2021-07-20', 'Ejecutiva de Ventas',      'Ventas',            13500.00, 'INACTIVO')
ON CONFLICT (codigo) DO NOTHING;

-- Vincular usuario empleado@rrhh.com con EMP-001
UPDATE empleados SET usuario_id = 'a1000000-0000-0000-0000-000000000004'
WHERE codigo = 'EMP-001';

-- Vincular usuario jefe@rrhh.com con EMP-003 (Sol López)
UPDATE empleados SET usuario_id = 'a1000000-0000-0000-0000-000000000002'
WHERE codigo = 'EMP-003';

-- Vincular usuario jefe@rrhh.com en jefes_inmediatos con el empleado EMP-003
INSERT INTO jefes_inmediatos (usuario_id, empleado_id) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- Vincular a Sol López como jefe inmediato de Carlos, Ana y Patricia
UPDATE empleados SET jefe_inmediato_id = 'b1000000-0000-0000-0000-000000000003'
WHERE codigo IN ('EMP-001', 'EMP-004', 'EMP-008');

-- ── CANDIDATOS de prueba ─────────────────────────────────────
INSERT INTO candidatos (nombres, apellidos, correo, telefono, puesto_aplicado, estado) VALUES
  ('Diego',    'Ramírez',  'diego.ramirez@mail.com',  '5555-2001', 'Desarrollador Full Stack', 'EN_PROCESO'),
  ('Sofía',    'Vargas',   'sofia.vargas@mail.com',   '5555-2002', 'Diseñadora Gráfica',       'REGISTRADO'),
  ('Andrés',   'Medina',   'andres.medina@mail.com',  '5555-2003', 'Analista de Datos',        'SELECCIONADO'),
  ('Carmen',   'Ríos',     'carmen.rios@mail.com',    '5555-2004', 'Gerente de Proyectos',     'RECHAZADO'),
  ('Fernando', 'Cruz',     'fernando.cruz@mail.com',  '5555-2005', 'Desarrollador Backend',    'REGISTRADO')
ON CONFLICT DO NOTHING;

-- ── PROCESO DE RECLUTAMIENTO ─────────────────────────────────
INSERT INTO procesos_reclutamiento (id, titulo, descripcion, puesto, departamento, estado, fecha_apertura) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Búsqueda Desarrollador Full Stack', 'Posición para equipo de tecnología con experiencia en React y Node.js', 'Desarrollador Full Stack', 'Tecnología', 'EN_PROCESO', '2024-11-01'),
  ('c1000000-0000-0000-0000-000000000002', 'Gerente de Proyectos',              'Liderazgo de proyectos internos y coordinación de equipos',              'Gerente de Proyectos',     'Operaciones', 'CERRADO',    '2024-09-15')
ON CONFLICT DO NOTHING;

-- ── NÓMINA DE PRUEBA ─────────────────────────────────────────
INSERT INTO nominas (id, periodo_inicio, periodo_fin, estado, total_bruto, total_deducciones, total_bonificaciones, total_neto) VALUES
  ('d1000000-0000-0000-0000-000000000001', '2024-11-01', '2024-11-30', 'PAGADA',   139500.00, 12000.00, 5000.00, 132500.00),
  ('d1000000-0000-0000-0000-000000000002', '2024-12-01', '2024-12-31', 'PROCESADA', 139500.00, 12000.00, 8000.00, 135500.00)
ON CONFLICT DO NOTHING;

-- Detalles de nómina (noviembre)
INSERT INTO detalle_nomina (nomina_id, empleado_id, salario_base, bonificaciones, deducciones, retenciones) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 18000.00, 500.00, 1500.00, 900.00),
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 15000.00, 300.00, 1200.00, 750.00),
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 25000.00, 800.00, 2000.00, 1250.00),
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 14000.00, 200.00, 1100.00, 700.00),
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 16000.00, 400.00, 1300.00, 800.00)
ON CONFLICT DO NOTHING;

-- ── ASISTENCIAS de prueba ────────────────────────────────────
INSERT INTO asistencias (empleado_id, fecha, hora_entrada, hora_salida) VALUES
  ('b1000000-0000-0000-0000-000000000001', '2024-12-02', '08:00', '17:00'),
  ('b1000000-0000-0000-0000-000000000001', '2024-12-03', '08:05', '17:15'),
  ('b1000000-0000-0000-0000-000000000001', '2024-12-04', '07:55', '17:00'),
  ('b1000000-0000-0000-0000-000000000002', '2024-12-02', '08:00', '17:00'),
  ('b1000000-0000-0000-0000-000000000002', '2024-12-03', '08:10', '17:00'),
  ('b1000000-0000-0000-0000-000000000003', '2024-12-02', '07:30', '18:00'),
  ('b1000000-0000-0000-0000-000000000004', '2024-12-02', '08:00', '17:00'),
  ('b1000000-0000-0000-0000-000000000005', '2024-12-02', '09:00', '18:00')
ON CONFLICT DO NOTHING;

-- ── SOLICITUDES DE AUSENCIA ──────────────────────────────────
INSERT INTO solicitudes_ausencia (empleado_id, tipo, fecha_inicio, fecha_fin, motivo, estado) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'VACACIONES', '2025-01-15', '2025-01-22', 'Vacaciones de fin de año pendientes', 'APROBADA'),
  ('b1000000-0000-0000-0000-000000000002', 'PERMISO',    '2024-12-20', '2024-12-20', 'Cita médica personal',                'PENDIENTE'),
  ('b1000000-0000-0000-0000-000000000004', 'ENFERMEDAD', '2024-12-05', '2024-12-07', 'Gripe con descanso médico',           'APROBADA'),
  ('b1000000-0000-0000-0000-000000000005', 'VACACIONES', '2025-02-03', '2025-02-07', 'Vacaciones programadas',              'PENDIENTE')
ON CONFLICT DO NOTHING;

-- ── BENEFICIOS ───────────────────────────────────────────────
INSERT INTO beneficios (id, nombre, descripcion, tipo, monto, estado) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Seguro Médico',          'Cobertura médica familiar completa',        'SALUD',       800.00, 'ACTIVO'),
  ('e1000000-0000-0000-0000-000000000002', 'Bono de Desempeño',      'Bono mensual por cumplimiento de metas',    'ECONOMICO',   500.00, 'ACTIVO'),
  ('e1000000-0000-0000-0000-000000000003', 'Vales de Alimentación',  'Vales mensuales para alimentación',         'ALIMENTACION',400.00, 'ACTIVO'),
  ('e1000000-0000-0000-0000-000000000004', 'Seguro de Vida',         'Seguro de vida para el empleado',           'SALUD',       200.00, 'ACTIVO'),
  ('e1000000-0000-0000-0000-000000000005', 'Bono de Transporte',     'Apoyo mensual para transporte',             'TRANSPORTE',  300.00, 'INACTIVO')
ON CONFLICT DO NOTHING;

-- Asignar beneficios a empleados
INSERT INTO empleado_beneficios (empleado_id, beneficio_id, fecha_asignacion, activo) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', '2022-01-10', TRUE),
  ('b1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002', '2022-01-10', TRUE),
  ('b1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000003', '2022-01-10', TRUE),
  ('b1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', '2021-06-15', TRUE),
  ('b1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000003', '2021-06-15', TRUE),
  ('b1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', '2020-03-01', TRUE),
  ('b1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000002', '2020-03-01', TRUE),
  ('b1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000004', '2020-03-01', TRUE)
ON CONFLICT DO NOTHING;

-- ── CAPACITACIONES ───────────────────────────────────────────
INSERT INTO capacitaciones (id, nombre, descripcion, instructor, fecha_inicio, fecha_fin, modalidad, estado) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Seguridad Informática Básica',   'Prácticas de ciberseguridad para todos los empleados',         'Ing. Marco Solís',     '2024-11-10', '2024-11-12', 'VIRTUAL',    'FINALIZADA'),
  ('f1000000-0000-0000-0000-000000000002', 'Liderazgo y Trabajo en Equipo',  'Desarrollo de habilidades de liderazgo',                       'Lic. Ana Fuentes',     '2025-01-15', '2025-01-17', 'PRESENCIAL', 'PROGRAMADA'),
  ('f1000000-0000-0000-0000-000000000003', 'Excel Avanzado para Contables',  'Manejo avanzado de Excel para el área de finanzas',            'Lic. Pedro Ruiz',      '2024-12-05', '2024-12-06', 'PRESENCIAL', 'FINALIZADA'),
  ('f1000000-0000-0000-0000-000000000004', 'Desarrollo Ágil con Scrum',      'Metodología Scrum para equipos de desarrollo',                 'Ing. Luis Castillo',   '2025-02-01', '2025-02-02', 'VIRTUAL',    'PROGRAMADA')
ON CONFLICT DO NOTHING;

-- Inscripciones
INSERT INTO capacitacion_empleados (capacitacion_id, empleado_id, completada, calificacion) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', TRUE, 90.00),
  ('f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', TRUE, 85.00),
  ('f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', TRUE, 92.00),
  ('f1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', TRUE, 88.00),
  ('f1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000007', TRUE, 95.00)
ON CONFLICT DO NOTHING;

-- ── EVALUACIONES DE DESEMPEÑO ────────────────────────────────
INSERT INTO evaluaciones_desempeno (empleado_id, evaluador_id, periodo, calificacion, comentarios, metas_cumplidas, areas_mejora, estado) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', '2024-S2', 88.00, 'Excelente desempeño técnico y buena actitud de equipo', 'Entrega de proyectos a tiempo, documentación completa', 'Comunicación con clientes externos', 'FINALIZADA'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', '2024-S2', 91.00, 'Muy buena gestión contable y proactividad',             'Cierre contable sin errores, reportes al día',         'Uso de nuevas herramientas digitales', 'FINALIZADA'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', '2024-S2', 79.00, 'Buen trabajo de diseño, mejora en tiempos de entrega',  'Rediseño de app móvil completado',                     'Gestión del tiempo en proyectos múltiples', 'FINALIZADA')
ON CONFLICT DO NOTHING;

-- ── ONBOARDING ───────────────────────────────────────────────
INSERT INTO onboarding (empleado_id, fecha_inicio, fecha_fin_estimada, estado, responsable_id, observaciones) VALUES
  ('b1000000-0000-0000-0000-000000000006', '2024-01-15', '2024-01-29', 'COMPLETADO', 'a1000000-0000-0000-0000-000000000003', 'Onboarding completado satisfactoriamente'),
  ('b1000000-0000-0000-0000-000000000009', '2023-03-12', '2023-03-26', 'COMPLETADO', 'a1000000-0000-0000-0000-000000000003', 'Inducción técnica completada'),
  ('b1000000-0000-0000-0000-000000000008', '2022-09-01', '2022-09-15', 'COMPLETADO', 'a1000000-0000-0000-0000-000000000003', 'Onboarding exitoso')
ON CONFLICT DO NOTHING;

-- ── CUMPLIMIENTO LABORAL ─────────────────────────────────────
INSERT INTO cumplimiento_laboral (nombre, descripcion, categoria, fecha_limite, estado, responsable_id) VALUES
  ('Renovación de Contratos 2025',         'Revisión y renovación de contratos de empleados que vencen en 2025',    'CONTRATOS',    '2025-01-31', 'PENDIENTE',   'a1000000-0000-0000-0000-000000000001'),
  ('Declaración ISR Anual',                'Presentación de declaración anual de ISR para todos los empleados',      'FISCAL',       '2025-03-31', 'PENDIENTE',   'a1000000-0000-0000-0000-000000000001'),
  ('Actualización de Políticas Internas',  'Actualizar manual de empleados con nuevas políticas 2025',               'POLITICAS',    '2025-02-28', 'PENDIENTE',   'a1000000-0000-0000-0000-000000000001'),
  ('Informe Seguridad Ocupacional',        'Reporte semestral de condiciones de seguridad laboral',                  'SEGURIDAD',    '2024-12-31', 'CUMPLIDO',    'a1000000-0000-0000-0000-000000000001'),
  ('Registro IGSS Empleados Nuevos',       'Alta en IGSS de empleados incorporados en Q4 2024',                     'SEGURIDAD_SOC','2024-11-30', 'CUMPLIDO',    'a1000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ============================================================
-- FIN DEL SEED
-- ============================================================
-- Nota: Los auth_user_id en usuarios_sistema son placeholder.
-- Actualízalos con los UUID reales de Supabase Auth después
-- de crear los usuarios en el dashboard:
--
-- UPDATE usuarios_sistema
-- SET auth_user_id = '<uuid-real>'
-- WHERE correo = 'admin@rrhh.com';
-- ============================================================
