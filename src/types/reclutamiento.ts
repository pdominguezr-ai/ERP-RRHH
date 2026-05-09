export type EstadoCandidato = 'REGISTRADO' | 'EN_PROCESO' | 'SELECCIONADO' | 'RECHAZADO';
export type EstadoProceso = 'ABIERTO' | 'EN_PROCESO' | 'CERRADO' | 'CANCELADO';
export interface Candidato { id: string; nombres: string; apellidos: string; correo: string; telefono?: string; curriculum_url?: string; puesto_aplicado: string; estado: EstadoCandidato; observaciones?: string; created_at: string; updated_at: string; }
export interface ProcesoReclutamiento { id: string; titulo: string; descripcion?: string; puesto: string; departamento: string; estado: EstadoProceso; fecha_apertura: string; fecha_cierre?: string; reclutador_id?: string; created_at: string; updated_at: string; }
export interface ProcesoReclutamientoCandidato { proceso_id: string; candidato_id: string; etapa: string; observaciones?: string; created_at: string; }
export interface CandidatoFormData { nombres: string; apellidos: string; correo: string; telefono?: string; puesto_aplicado: string; estado: EstadoCandidato; observaciones?: string; }
export interface ProcesoReclutamientoFormData { titulo: string; descripcion?: string; puesto: string; departamento: string; fecha_apertura: string; fecha_cierre?: string; }
