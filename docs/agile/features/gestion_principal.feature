# language: es
# Estándar Aplicado: ISO/IEC/IEEE 29119-3:2021
Característica: Gestión de Expedientes de Colaboradores y Solicitudes de Ausencia
  Como Administrador de RRHH o Colaborador
  Quiero gestionar expedientes (/api/v1/empleados) y solicitudes de ausencia (/api/v1/solicitudes)
  Para mantener la continuidad operativa y el cumplimiento laboral.

  @happy_path @CP-08
  Esquema del escenario: Cálculo de nómina según estrategia de régimen laboral (Patrón Strategy)
    Dado un colaborador contratado bajo el régimen "<regimen>" con salario base de <salario_base>
    Cuando el motor de nómina ejecuta la estrategia de cálculo correspondiente
    Entonces la retención de IGSS laboral es <igss_esperado>
    Y la bonificación incentivo Decreto 37-2001 es <bono_esperado>
    Y el salario líquido neto resultante es <neto_esperado>

    Ejemplos:
      | regimen                | salario_base | igss_esperado | bono_esperado | neto_esperado |
      | ASALARIADO             | 10000.00     | 483.00        | 250.00        | 9528.85       |
      | SERVICIOS_PROFESIONALES| 10000.00     | 0.00          | 0.00          | 9500.00       |
      | EJECUTIVO              | 25000.00     | 1207.50       | 250.00        | 22842.50      |
