-- ============================================================
-- SCRIPT DE ESTRUCTURA Y DATOS DE BASE DE DATOS (DDL + SEED)
-- Sistema ERP de Gestión de Recursos Humanos (gestion-rrhh)
-- Motor: PostgreSQL 15+ (Supabase Cloud)
-- ============================================================

-- ============================================================
-- Migración 001: Esquema inicial del sistema de RRHH
-- Proyecto: Gestión de Recursos Humanos
-- ============================================================
-- Ejecutar en Supabase SQL Editor en el orden indicado.
-- ============================================================

-- ── EXTENSIONES ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── FUNCIÓN: actualizar updated_at automáticamente ──────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── MACRO: crear trigger updated_at ─────────────────────────
-- Se usará en cada tabla principal.

-- ============================================================
-- 1. USUARIOS DEL SISTEMA
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios_sistema (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id  UUID UNIQUE NOT NULL,          -- FK lógica a auth.users
  correo        VARCHAR(255) UNIQUE NOT NULL,
  rol           VARCHAR(30) NOT NULL
                  CHECK (rol IN ('ADMIN_RRHH','JEFE_INMEDIATO','RECLUTADOR','EMPLEADO')),
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios_sistema(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo       ON usuarios_sistema(correo);

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios_sistema
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 2. EMPLEADOS
-- ============================================================
CREATE TABLE IF NOT EXISTS empleados (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo              VARCHAR(20) UNIQUE NOT NULL,
  nombres             VARCHAR(100) NOT NULL,
  apellidos           VARCHAR(100) NOT NULL,
  correo              VARCHAR(255) UNIQUE NOT NULL,
  telefono            VARCHAR(20),
  direccion           TEXT,
  fecha_nacimiento    DATE,
  fecha_ingreso       DATE NOT NULL,
  puesto              VARCHAR(100) NOT NULL,
  departamento        VARCHAR(100) NOT NULL,
  salario_base        NUMERIC(12,2) NOT NULL CHECK (salario_base >= 0),
  estado              VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
                        CHECK (estado IN ('ACTIVO','INACTIVO','SUSPENDIDO')),
  jefe_inmediato_id   UUID REFERENCES empleados(id) ON DELETE SET NULL,
  usuario_id          UUID REFERENCES usuarios_sistema(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_empleados_codigo       ON empleados(codigo);
CREATE INDEX IF NOT EXISTS idx_empleados_correo       ON empleados(correo);
CREATE INDEX IF NOT EXISTS idx_empleados_estado       ON empleados(estado);
CREATE INDEX IF NOT EXISTS idx_empleados_departamento ON empleados(departamento);
CREATE INDEX IF NOT EXISTS idx_empleados_jefe         ON empleados(jefe_inmediato_id);

CREATE TRIGGER trg_empleados_updated_at
  BEFORE UPDATE ON empleados
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 3. ADMINISTRADORES RRHH (extensión de usuarios_sistema)
-- ============================================================
CREATE TABLE IF NOT EXISTS administradores_rrhh (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id    UUID NOT NULL REFERENCES usuarios_sistema(id) ON DELETE CASCADE,
  departamento  VARCHAR(100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_rrhh_usuario ON administradores_rrhh(usuario_id);

-- ============================================================
-- 4. JEFES INMEDIATOS
-- ============================================================
CREATE TABLE IF NOT EXISTS jefes_inmediatos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID NOT NULL REFERENCES usuarios_sistema(id) ON DELETE CASCADE,
  empleado_id UUID REFERENCES empleados(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_jefes_usuario ON jefes_inmediatos(usuario_id);

-- ============================================================
-- 5. RECLUTADORES
-- ============================================================
CREATE TABLE IF NOT EXISTS reclutadores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID NOT NULL REFERENCES usuarios_sistema(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reclutadores_usuario ON reclutadores(usuario_id);

-- ============================================================
-- 6. CANDIDATOS
-- ============================================================
CREATE TABLE IF NOT EXISTS candidatos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombres         VARCHAR(100) NOT NULL,
  apellidos       VARCHAR(100) NOT NULL,
  correo          VARCHAR(255) NOT NULL,
  telefono        VARCHAR(20),
  curriculum_url  TEXT,
  puesto_aplicado VARCHAR(100) NOT NULL,
  estado          VARCHAR(20) NOT NULL DEFAULT 'REGISTRADO'
                    CHECK (estado IN ('REGISTRADO','EN_PROCESO','SELECCIONADO','RECHAZADO')),
  observaciones   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_candidatos_correo ON candidatos(correo);
CREATE INDEX IF NOT EXISTS idx_candidatos_estado ON candidatos(estado);

CREATE TRIGGER trg_candidatos_updated_at
  BEFORE UPDATE ON candidatos
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 7. PROCESOS DE RECLUTAMIENTO
-- ============================================================
CREATE TABLE IF NOT EXISTS procesos_reclutamiento (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo          VARCHAR(200) NOT NULL,
  descripcion     TEXT,
  puesto          VARCHAR(100) NOT NULL,
  departamento    VARCHAR(100) NOT NULL,
  estado          VARCHAR(20) NOT NULL DEFAULT 'ABIERTO'
                    CHECK (estado IN ('ABIERTO','EN_PROCESO','CERRADO','CANCELADO')),
  fecha_apertura  DATE NOT NULL,
  fecha_cierre    DATE,
  reclutador_id   UUID REFERENCES reclutadores(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_procesos_estado ON procesos_reclutamiento(estado);

CREATE TRIGGER trg_procesos_updated_at
  BEFORE UPDATE ON procesos_reclutamiento
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 8. RELACIÓN PROCESO ↔ CANDIDATO (muchos a muchos)
-- ============================================================
CREATE TABLE IF NOT EXISTS proceso_reclutamiento_candidatos (
  proceso_id    UUID NOT NULL REFERENCES procesos_reclutamiento(id) ON DELETE CASCADE,
  candidato_id  UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  etapa         VARCHAR(50) NOT NULL DEFAULT 'POSTULACION',
  observaciones TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (proceso_id, candidato_id)
);
CREATE INDEX IF NOT EXISTS idx_prc_proceso   ON proceso_reclutamiento_candidatos(proceso_id);
CREATE INDEX IF NOT EXISTS idx_prc_candidato ON proceso_reclutamiento_candidatos(candidato_id);

-- ============================================================
-- 9. ONBOARDING
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empleado_id         UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  fecha_inicio        DATE NOT NULL,
  fecha_fin_estimada  DATE,
  estado              VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                        CHECK (estado IN ('PENDIENTE','EN_PROCESO','COMPLETADO')),
  responsable_id      UUID REFERENCES usuarios_sistema(id) ON DELETE SET NULL,
  observaciones       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_onboarding_empleado ON onboarding(empleado_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_estado   ON onboarding(estado);

CREATE TRIGGER trg_onboarding_updated_at
  BEFORE UPDATE ON onboarding
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 10. NÓMINAS
-- ============================================================
CREATE TABLE IF NOT EXISTS nominas (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  periodo_inicio       DATE NOT NULL,
  periodo_fin          DATE NOT NULL,
  estado               VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
                         CHECK (estado IN ('BORRADOR','PROCESADA','PAGADA','ANULADA')),
  total_bruto          NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_deducciones    NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_bonificaciones NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_neto           NUMERIC(14,2) NOT NULL DEFAULT 0,
  observaciones        TEXT,
  created_by           UUID REFERENCES usuarios_sistema(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (periodo_fin >= periodo_inicio)
);
CREATE INDEX IF NOT EXISTS idx_nominas_estado  ON nominas(estado);
CREATE INDEX IF NOT EXISTS idx_nominas_periodo ON nominas(periodo_inicio, periodo_fin);

CREATE TRIGGER trg_nominas_updated_at
  BEFORE UPDATE ON nominas
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 11. DETALLE DE NÓMINA
-- ============================================================
CREATE TABLE IF NOT EXISTS detalle_nomina (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nomina_id       UUID NOT NULL REFERENCES nominas(id) ON DELETE CASCADE,
  empleado_id     UUID NOT NULL REFERENCES empleados(id) ON DELETE RESTRICT,
  salario_base    NUMERIC(12,2) NOT NULL CHECK (salario_base >= 0),
  bonificaciones  NUMERIC(12,2) NOT NULL DEFAULT 0,
  deducciones     NUMERIC(12,2) NOT NULL DEFAULT 0,
  retenciones     NUMERIC(12,2) NOT NULL DEFAULT 0,
  salario_neto    NUMERIC(12,2) GENERATED ALWAYS AS
                    (salario_base + bonificaciones - deducciones - retenciones) STORED,
  observaciones   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (nomina_id, empleado_id)
);
CREATE INDEX IF NOT EXISTS idx_detalle_nomina_nomina   ON detalle_nomina(nomina_id);
CREATE INDEX IF NOT EXISTS idx_detalle_nomina_empleado ON detalle_nomina(empleado_id);

CREATE TRIGGER trg_detalle_nomina_updated_at
  BEFORE UPDATE ON detalle_nomina
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 12. ASISTENCIAS
-- ============================================================
CREATE TABLE IF NOT EXISTS asistencias (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empleado_id      UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  fecha            DATE NOT NULL,
  hora_entrada     TIME,
  hora_salida      TIME,
  horas_trabajadas NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN hora_entrada IS NOT NULL AND hora_salida IS NOT NULL
        THEN ROUND(EXTRACT(EPOCH FROM (hora_salida - hora_entrada)) / 3600.0, 2)
      ELSE NULL
    END
  ) STORED,
  observaciones    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (empleado_id, fecha)
);
CREATE INDEX IF NOT EXISTS idx_asistencias_empleado ON asistencias(empleado_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha    ON asistencias(fecha);

CREATE TRIGGER trg_asistencias_updated_at
  BEFORE UPDATE ON asistencias
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 13. SOLICITUDES DE AUSENCIA
-- ============================================================
CREATE TABLE IF NOT EXISTS solicitudes_ausencia (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empleado_id       UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  tipo              VARCHAR(20) NOT NULL
                      CHECK (tipo IN ('PERMISO','VACACIONES','ENFERMEDAD','OTRO')),
  fecha_inicio      DATE NOT NULL,
  fecha_fin         DATE NOT NULL,
  dias_solicitados  INTEGER NOT NULL GENERATED ALWAYS AS
                      (fecha_fin - fecha_inicio + 1) STORED,
  motivo            TEXT NOT NULL,
  estado            VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                      CHECK (estado IN ('PENDIENTE','APROBADA','RECHAZADA')),
  aprobado_por      UUID REFERENCES usuarios_sistema(id) ON DELETE SET NULL,
  fecha_aprobacion  TIMESTAMPTZ,
  observaciones     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (fecha_fin >= fecha_inicio)
);
CREATE INDEX IF NOT EXISTS idx_solicitudes_empleado ON solicitudes_ausencia(empleado_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado   ON solicitudes_ausencia(estado);

CREATE TRIGGER trg_solicitudes_updated_at
  BEFORE UPDATE ON solicitudes_ausencia
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 14. EVALUACIONES DE DESEMPEÑO
-- ============================================================
CREATE TABLE IF NOT EXISTS evaluaciones_desempeno (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empleado_id     UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  evaluador_id    UUID NOT NULL REFERENCES usuarios_sistema(id) ON DELETE RESTRICT,
  periodo         VARCHAR(50) NOT NULL,
  calificacion    NUMERIC(4,2) NOT NULL CHECK (calificacion BETWEEN 0 AND 100),
  comentarios     TEXT,
  metas_cumplidas TEXT,
  areas_mejora    TEXT,
  estado          VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
                    CHECK (estado IN ('BORRADOR','FINALIZADA')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_empleado ON evaluaciones_desempeno(empleado_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_estado   ON evaluaciones_desempeno(estado);

CREATE TRIGGER trg_evaluaciones_updated_at
  BEFORE UPDATE ON evaluaciones_desempeno
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 15. CAPACITACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS capacitaciones (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre       VARCHAR(200) NOT NULL,
  descripcion  TEXT,
  instructor   VARCHAR(100),
  fecha_inicio DATE NOT NULL,
  fecha_fin    DATE,
  modalidad    VARCHAR(50) NOT NULL DEFAULT 'PRESENCIAL',
  estado       VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADA'
                 CHECK (estado IN ('PROGRAMADA','EN_CURSO','FINALIZADA','CANCELADA')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_capacitaciones_estado ON capacitaciones(estado);

CREATE TRIGGER trg_capacitaciones_updated_at
  BEFORE UPDATE ON capacitaciones
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 16. RELACIÓN CAPACITACIÓN ↔ EMPLEADO (muchos a muchos)
-- ============================================================
CREATE TABLE IF NOT EXISTS capacitacion_empleados (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capacitacion_id  UUID NOT NULL REFERENCES capacitaciones(id) ON DELETE CASCADE,
  empleado_id      UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  completada       BOOLEAN NOT NULL DEFAULT FALSE,
  calificacion     NUMERIC(4,2) CHECK (calificacion BETWEEN 0 AND 100),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (capacitacion_id, empleado_id)
);
CREATE INDEX IF NOT EXISTS idx_cap_emp_capacitacion ON capacitacion_empleados(capacitacion_id);
CREATE INDEX IF NOT EXISTS idx_cap_emp_empleado     ON capacitacion_empleados(empleado_id);

-- ============================================================
-- 17. BENEFICIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS beneficios (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      VARCHAR(100) NOT NULL,
  descripcion TEXT,
  tipo        VARCHAR(50) NOT NULL,
  monto       NUMERIC(12,2) CHECK (monto >= 0),
  estado      VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
                CHECK (estado IN ('ACTIVO','INACTIVO')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_beneficios_estado ON beneficios(estado);

CREATE TRIGGER trg_beneficios_updated_at
  BEFORE UPDATE ON beneficios
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 18. RELACIÓN EMPLEADO ↔ BENEFICIO (muchos a muchos)
-- ============================================================
CREATE TABLE IF NOT EXISTS empleado_beneficios (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empleado_id       UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  beneficio_id      UUID NOT NULL REFERENCES beneficios(id) ON DELETE CASCADE,
  fecha_asignacion  DATE NOT NULL DEFAULT CURRENT_DATE,
  activo            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (empleado_id, beneficio_id)
);
CREATE INDEX IF NOT EXISTS idx_emp_ben_empleado  ON empleado_beneficios(empleado_id);
CREATE INDEX IF NOT EXISTS idx_emp_ben_beneficio ON empleado_beneficios(beneficio_id);

-- ============================================================
-- 19. REPORTES DE RRHH
-- ============================================================
CREATE TABLE IF NOT EXISTS reportes_rh (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo          VARCHAR(30) NOT NULL
                  CHECK (tipo IN ('EMPLEADOS_ACTIVOS','NOMINA','ASISTENCIA','ROTACION','EVALUACIONES','BENEFICIOS')),
  titulo        VARCHAR(200) NOT NULL,
  parametros    JSONB,
  generado_por  UUID REFERENCES usuarios_sistema(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo ON reportes_rh(tipo);

-- ============================================================
-- 20. CUMPLIMIENTO LABORAL
-- ============================================================
CREATE TABLE IF NOT EXISTS cumplimiento_laboral (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre          VARCHAR(200) NOT NULL,
  descripcion     TEXT,
  categoria       VARCHAR(100) NOT NULL,
  fecha_limite    DATE,
  estado          VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                    CHECK (estado IN ('CUMPLIDO','PENDIENTE','INCUMPLIDO')),
  responsable_id  UUID REFERENCES usuarios_sistema(id) ON DELETE SET NULL,
  evidencia       TEXT,
  observaciones   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cumplimiento_estado ON cumplimiento_laboral(estado);

CREATE TRIGGER trg_cumplimiento_updated_at
  BEFORE UPDATE ON cumplimiento_laboral
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- 21. AUDITORÍA DE CAMBIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria_cambios (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabla         VARCHAR(100) NOT NULL,
  registro_id   UUID NOT NULL,
  operacion     VARCHAR(10) NOT NULL CHECK (operacion IN ('INSERT','UPDATE','DELETE')),
  datos_antes   JSONB,
  datos_despues JSONB,
  usuario_id    UUID REFERENCES usuarios_sistema(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla      ON auditoria_cambios(tabla);
CREATE INDEX IF NOT EXISTS idx_auditoria_registro   ON auditoria_cambios(registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON auditoria_cambios(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE usuarios_sistema          ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE procesos_reclutamiento    ENABLE ROW LEVEL SECURITY;
ALTER TABLE proceso_reclutamiento_candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding                ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominas                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_nomina            ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias               ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_ausencia      ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones_desempeno    ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacitaciones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacitacion_empleados    ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficios                ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleado_beneficios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_rh               ENABLE ROW LEVEL SECURITY;
ALTER TABLE cumplimiento_laboral      ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_cambios         ENABLE ROW LEVEL SECURITY;

-- ── Función helper: obtener rol del usuario autenticado ──────
CREATE OR REPLACE FUNCTION fn_get_user_rol()
RETURNS VARCHAR AS $$
  SELECT rol FROM usuarios_sistema
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── ADMIN_RRHH: acceso total ─────────────────────────────────
CREATE POLICY "admin_rrhh_all" ON usuarios_sistema
  FOR ALL USING (fn_get_user_rol() = 'ADMIN_RRHH');

CREATE POLICY "admin_rrhh_empleados" ON empleados
  FOR ALL USING (fn_get_user_rol() = 'ADMIN_RRHH');

CREATE POLICY "admin_rrhh_nominas" ON nominas
  FOR ALL USING (fn_get_user_rol() = 'ADMIN_RRHH');

CREATE POLICY "admin_rrhh_detalle_nomina" ON detalle_nomina
  FOR ALL USING (fn_get_user_rol() = 'ADMIN_RRHH');

CREATE POLICY "admin_rrhh_beneficios" ON beneficios
  FOR ALL USING (fn_get_user_rol() = 'ADMIN_RRHH');

CREATE POLICY "admin_rrhh_cumplimiento" ON cumplimiento_laboral
  FOR ALL USING (fn_get_user_rol() = 'ADMIN_RRHH');

CREATE POLICY "admin_rrhh_reportes" ON reportes_rh
  FOR ALL USING (fn_get_user_rol() = 'ADMIN_RRHH');

CREATE POLICY "admin_rrhh_auditoria" ON auditoria_cambios
  FOR ALL USING (fn_get_user_rol() = 'ADMIN_RRHH');

-- ── EMPLEADO: ver su propio perfil y datos ───────────────────
CREATE POLICY "empleado_ver_propio" ON empleados
  FOR SELECT USING (
    usuario_id = (SELECT id FROM usuarios_sistema WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "empleado_ver_asistencia_propia" ON asistencias
  FOR SELECT USING (
    empleado_id = (SELECT id FROM empleados WHERE usuario_id =
      (SELECT id FROM usuarios_sistema WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "empleado_crear_solicitud" ON solicitudes_ausencia
  FOR INSERT WITH CHECK (
    empleado_id = (SELECT id FROM empleados WHERE usuario_id =
      (SELECT id FROM usuarios_sistema WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "empleado_ver_solicitudes_propias" ON solicitudes_ausencia
  FOR SELECT USING (
    empleado_id = (SELECT id FROM empleados WHERE usuario_id =
      (SELECT id FROM usuarios_sistema WHERE auth_user_id = auth.uid()))
  );

-- ── JEFE_INMEDIATO: ver y gestionar su equipo ────────────────
CREATE POLICY "jefe_ver_empleados" ON empleados
  FOR SELECT USING (fn_get_user_rol() IN ('JEFE_INMEDIATO','ADMIN_RRHH'));

CREATE POLICY "jefe_gestionar_solicitudes" ON solicitudes_ausencia
  FOR ALL USING (fn_get_user_rol() IN ('JEFE_INMEDIATO','ADMIN_RRHH'));

CREATE POLICY "jefe_evaluaciones" ON evaluaciones_desempeno
  FOR ALL USING (fn_get_user_rol() IN ('JEFE_INMEDIATO','ADMIN_RRHH'));

-- ── RECLUTADOR: gestionar reclutamiento ─────────────────────
CREATE POLICY "reclutador_candidatos" ON candidatos
  FOR ALL USING (fn_get_user_rol() IN ('RECLUTADOR','ADMIN_RRHH'));

CREATE POLICY "reclutador_procesos" ON procesos_reclutamiento
  FOR ALL USING (fn_get_user_rol() IN ('RECLUTADOR','ADMIN_RRHH'));

CREATE POLICY "reclutador_proceso_candidatos" ON proceso_reclutamiento_candidatos
  FOR ALL USING (fn_get_user_rol() IN ('RECLUTADOR','ADMIN_RRHH'));

CREATE POLICY "reclutador_onboarding" ON onboarding
  FOR ALL USING (fn_get_user_rol() IN ('RECLUTADOR','ADMIN_RRHH'));

-- ── Capacitaciones y beneficios: todos pueden ver ───────────
CREATE POLICY "todos_ver_capacitaciones" ON capacitaciones
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_gestionar_capacitaciones" ON capacitaciones
  FOR ALL USING (fn_get_user_rol() = 'ADMIN_RRHH');

CREATE POLICY "todos_ver_beneficios" ON beneficios
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "todos_ver_empleado_beneficios" ON empleado_beneficios
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_gestionar_empleado_beneficios" ON empleado_beneficios
  FOR ALL USING (fn_get_user_rol() = 'ADMIN_RRHH');

CREATE POLICY "todos_ver_capacitacion_empleados" ON capacitacion_empleados
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ── Asistencia: Admin puede gestionar todo ───────────────────
CREATE POLICY "admin_gestionar_asistencias" ON asistencias
  FOR ALL USING (fn_get_user_rol() = 'ADMIN_RRHH');


-- ============================================================
-- DATOS SEMILLA DE PRUEBA (SEEDS)
-- ============================================================

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
