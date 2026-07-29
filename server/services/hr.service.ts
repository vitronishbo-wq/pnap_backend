import { dbService } from "../db-service.ts";

export class HRService {
  /**
   * Retrieves active operators.
   */
  static async getActiveOperators() {
    return await dbService.getOperators();
  }

  /**
   * Updates functional permissions of a MININT operative.
   */
  static async setOperatorPermissions(operatorId: string, permissions: string[]) {
    if (!operatorId || !Array.isArray(permissions)) {
      throw new Error("Parâmetros inválidos: OperadorID e array de permissões são necessários.");
    }
    return await dbService.updateOperatorPermissions(operatorId, permissions);
  }
}
