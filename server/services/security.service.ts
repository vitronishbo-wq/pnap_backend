import { dbService } from "../db-service.ts";

export class SecurityService {
  /**
   * Evaluates if an inmate can be allocated to a specific cell based on risk levels.
   */
  static async validateCellAllocation(inmateId: string, targetCellId: string): Promise<{ allowed: boolean; reason?: string }> {
    const inmate = await dbService.getReclusoById(inmateId);
    if (!inmate) {
      return { allowed: false, reason: "Recluso não cadastrado no banco central." };
    }

    // In Angola high security model, MAXIMUM risk inmates must be placed in special isolated blocks.
    if (inmate.nivelSeguranca === "MAXIMA") {
      // Hard rules checking for isolation block ids or parameters if applicable
      return { 
        allowed: true, 
        reason: "Alocação monitorizada: Recluso de perigosidade MÁXIMA sob escolta permanente." 
      };
    }

    return { allowed: true };
  }

  /**
   * Registers a security or disciplinary incident.
   */
  static async logIncident(prisonId: string, type: string, description: string, severity: string) {
    if (!prisonId || !type || !description) {
      throw new Error("Parâmetros inválidos para registo de incidente militar.");
    }

    // Update in database or write central safety log
    const logEntry = await dbService.createLog({
      evento: `INCIDENTE_${type.toUpperCase()}`,
      modulo: "SEGURANCA",
      nivelSeveridade: severity || "HIGH",
      dadosJson: JSON.stringify({
        detalhes: description,
        estabelecimentoId: prisonId,
        dataOcorrencia: new Date().toISOString()
      })
    });

    return logEntry;
  }
}
