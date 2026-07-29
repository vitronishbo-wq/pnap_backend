import { dbService } from "../db-service.ts";

export class AIService {
  /**
   * Forecasts the probability of critical events or overcrowding based on current trends.
   */
  static predictOvercrowdingDanger(currentOccupancy: number, operationalLimit: number): { riskScore: number; classification: "BAIXO" | "MEDIO" | "ALTO" | "URGENTE" } {
    if (operationalLimit <= 0) return { riskScore: 0, classification: "BAIXO" };
    const ratio = currentOccupancy / operationalLimit;

    let riskScore = Math.min(100, Math.round(ratio * 75));
    let classification: "BAIXO" | "MEDIO" | "ALTO" | "URGENTE" = "BAIXO";

    if (ratio > 1.2) {
      classification = "URGENTE";
      riskScore = Math.min(100, riskScore + 20);
    } else if (ratio > 1.0) {
      classification = "ALTO";
      riskScore = Math.min(100, riskScore + 10);
    } else if (ratio > 0.85) {
      classification = "MEDIO";
    }

    return { riskScore, classification };
  }

  /**
   * Generates AI telemetry suggestions for transfers.
   */
  static generateTransferOptimizationSuggestions(prisons: any[]) {
    // Propose transfers from overcrowded prisons to undercrowded ones
    const overcrowded = prisons.filter(p => p.currentOccupancy > p.limiteOperativo);
    const undercrowded = prisons.filter(p => p.currentOccupancy < p.limiteOperativo * 0.8);

    const suggestions: Array<{
      fromUnit: string;
      toUnit: string;
      suggestedCount: number;
      priority: "MEDIA" | "ALTA" | "URGENTE";
    }> = [];

    overcrowded.forEach(over => {
      undercrowded.forEach(under => {
        const excess = over.currentOccupancy - over.limiteOperativo;
        const room = Math.round(under.limiteOperativo * 0.8 - under.currentOccupancy);
        if (excess > 0 && room > 0) {
          const count = Math.min(excess, room, 15);
          suggestions.push({
            fromUnit: over.nome,
            toUnit: under.nome,
            suggestedCount: count,
            priority: excess > 50 ? "URGENTE" : "ALTA"
          });
        }
      });
    });

    return suggestions;
  }
}
