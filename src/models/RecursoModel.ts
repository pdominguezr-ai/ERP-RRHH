import { EmpleadoModel } from '@/models/EmpleadoModel';

/**
 * RecursoModel (Patrón Repository):
 * Gestiona la entidad principal de Recursos / Colaboradores del ERP,
 * integrando PostgreSQL (Relacional), MongoDB (Documental), Redis (Cache-Aside) y Neo4j (Grafos).
 */
export class RecursoModel {
  static async findAll(filters?: {
    estado?: string;
    departamento?: string;
    limit?: number;
    offset?: number;
  }) {
    return EmpleadoModel.findAll(filters);
  }

  static async findById(id: string) {
    return EmpleadoModel.findById(id);
  }

  static async create(data: Record<string, any>) {
    return EmpleadoModel.create(data);
  }
}
