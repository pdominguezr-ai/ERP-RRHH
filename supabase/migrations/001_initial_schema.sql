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
