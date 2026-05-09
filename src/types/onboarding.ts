export type EstadoOnboarding = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO';
export interface Onboarding { id: string; empleado_id: string; fecha_inicio: string; fecha_fin_estimada?: string; estado: EstadoOnboarding; responsable_id?: string; observaciones?: string; created_at: string; updated_at: string; empleado?: { nombres: string; apellidos: string; codigo: string }; }
export interface OnboardingFormData { empleado_id: string; fecha_inicio: string; fecha_fin_estimada?: string; responsable_id?: string; observaciones?: string; }
