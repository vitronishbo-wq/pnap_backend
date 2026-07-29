import { dbService } from "../db-service.ts";

export class AuditService {
  /**
   * Logs a security action into the central audit trail.
   */
  static async registerAuditLog(
    operatorId: string,
    action: string,
    affectedModule: string,
    recordId: string,
    details: string
  ) {
    return await dbService.createLog({
      evento: action,
      modulo: affectedModule,
      nivelSeveridade: action.includes("DELETE") || action.includes("CRITICAL") ? "CRITICAL" : "INFO",
      funcionarioId: operatorId,
      reclusoId: recordId || undefined,
      dadosJson: JSON.stringify({
        descricao: details,
        origem: "SERVICES_GATEWAY_API",
        timestamp: new Date().toISOString()
      })
    });
  }

  /**
   * Query chronological audit logs for backoffice inspection.
   */
  static async getAuditTrail(userPayload: any) {
    return await dbService.getLogs(userPayload);
  }
}
