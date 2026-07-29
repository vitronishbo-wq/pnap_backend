import { dbService } from "../db-service.ts";

export class HealthService {
  /**
   * Fetch all medical records of the establishment or country.
   */
  static async getInmateMedicalRecords() {
    return await dbService.getHealthRecords();
  }

  /**
   * Save a new clinical evaluation.
   */
  static async createClinicalEntry(recordData: {
    reclusoId: string;
    diagnostico: string;
    medicamentos: string;
    situacaoGeral: string;
    pressaoArterial?: string;
    frequenciaCardiaca?: string;
  }) {
    if (!recordData.reclusoId || !recordData.diagnostico) {
      throw new Error("ID do recluso e Diagnóstico clínico são campos de preenchimento obrigatório.");
    }
    return await dbService.createHealthRecord(recordData);
  }

  /**
   * Updates an existing health record.
   */
  static async updateClinicalEntry(id: string, recordData: any) {
    return await dbService.updateHealthRecord(id, recordData);
  }

  /**
   * Deletes a health record.
   */
  static async deleteClinicalEntry(id: string) {
    return await dbService.deleteHealthRecord(id);
  }
}
