import { dbService } from "../db-service.ts";

export class TransferService {
  /**
   * Plans a custody transfer from one facility to another.
   */
  static async requestTransfer(inmateId: string, originPrisonId: string, destinationPrisonId: string, rationale: string, escortOfficer: string) {
    if (!inmateId || !originPrisonId || !destinationPrisonId) {
      throw new Error("Origem, destino e ID do recluso são necessários para emitir guia de transferência física.");
    }

    const inmate = await dbService.getReclusoById(inmateId);
    if (!inmate) {
      throw new Error("Recluso não identificado no banco nacional.");
    }

    // Business logic: Cannot transfer to the same prison
    if (originPrisonId === destinationPrisonId) {
      throw new Error("Operação inválida: O estabelecimento de origem é idêntico ao de destino.");
    }

    // Execute transfer updating the database
    const updatedInmate = await dbService.updateRecluso(inmateId, {
      estabelecimentoId: destinationPrisonId
    });

    return {
      success: true,
      guideNumber: `GT-${Math.floor(100000 + Math.random() * 900000)}`,
      authorizedAt: new Date().toISOString(),
      inmate: updatedInmate,
      escortUnit: escortOfficer || "Guarda Prisional Nacional"
    };
  }
}
