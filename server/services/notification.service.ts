import { dbService } from "../db-service.ts";

export class NotificationService {
  private static mockNotificationLog: Array<{
    id: string;
    type: "SMS" | "EMAIL" | "INTERNAL";
    recipient: string;
    message: string;
    sentAt: string;
    status: "SENT" | "FAILED";
  }> = [];

  /**
   * Dispatches a safety notification and stores it in the alert register.
   */
  static async sendAlert(type: "SMS" | "EMAIL" | "INTERNAL", recipient: string, message: string) {
    const entry = {
      id: `ALRT-${Math.floor(100000 + Math.random() * 900000)}`,
      type,
      recipient,
      message,
      sentAt: new Date().toISOString(),
      status: "SENT" as const
    };

    this.mockNotificationLog.push(entry);

    // Save warning as a system security log
    await dbService.createLog({
      evento: `NOTIFICACAO_${type}`,
      modulo: "SEGURANCA",
      nivelSeveridade: "INFO",
      dadosJson: JSON.stringify({ destinatario: recipient, mensagem: message })
    });

    console.log(`📡 [Notification Service] [${type}] Enviado para ${recipient}: "${message}"`);
    return entry;
  }

  /**
   * Return recent alerts for audit review.
   */
  static getAlertHistory() {
    return this.mockNotificationLog;
  }
}
