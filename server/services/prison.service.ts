import { dbService } from "../db-service.ts";

export class PrisonService {
  /**
   * Retrieves all prison establishments.
   */
  static async getEstablishments() {
    return await dbService.getEstabelecimentos();
  }

  /**
   * Evaluates if a prison is overcrowded.
   */
  static async evaluateOvercrowding(prisonId: string): Promise<{ isOvercrowded: boolean; occupancyRate: number }> {
    const prisons = await dbService.getEstabelecimentos();
    const prison = prisons.find(p => p.id === prisonId);
    if (!prison) {
      throw new Error("Estabelecimento não encontrado.");
    }

    const rate = Math.round((prison.currentOccupancy / prison.limiteOperativo) * 100);
    return {
      isOvercrowded: rate > 100,
      occupancyRate: rate
    };
  }
}
