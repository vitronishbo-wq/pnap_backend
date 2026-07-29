import { dbService } from "../db-service.ts";

export interface DBNode {
  id: string;
  name: string;
  type: "cloud" | "local";
  ip: string;
  status: "online" | "offline" | "syncing";
  latencyMs: number;
  recordsCount: number;
}

export interface SyncHistoryEntry {
  id: string;
  timestamp: string;
  sourceNode: string;
  targetNode: string;
  recordsTransferred: number;
  status: "SUCCESS" | "WARNING" | "FAILED";
  details: string;
}

export interface ClusterConfig {
  activeInstance: "cloud-primary" | "cloud-secondary" | "local-onpremise" | "local-hybrid";
  replicationPolicy: "realtime" | "interval" | "manual";
  syncIntervalMinutes: number;
  conflictResolution: "cloud-wins" | "local-wins" | "manual-review";
  lastSyncTime: string;
  syncStatus: "idle" | "syncing" | "error" | "synchronized";
  nodes: DBNode[];
  history: SyncHistoryEntry[];
}

// In-Memory Cluster State for SICP-AO
let currentClusterConfig: ClusterConfig = {
  activeInstance: "cloud-primary",
  replicationPolicy: "interval",
  syncIntervalMinutes: 15,
  conflictResolution: "cloud-wins",
  lastSyncTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
  syncStatus: "synchronized",
  nodes: [
    { id: "cloud-primary", name: "Servidor Nuvem Principal (Luanda-Central)", type: "cloud", ip: "10.224.2.14", status: "online", latencyMs: 14, recordsCount: 15420 },
    { id: "cloud-secondary", name: "Servidor Nuvem de Backup (Benguela-DR)", type: "cloud", ip: "10.224.2.15", status: "online", latencyMs: 28, recordsCount: 15418 },
    { id: "local-onpremise", name: "Servidor Físico Local (Huambo-EP)", type: "local", ip: "192.168.42.10", status: "online", latencyMs: 2, recordsCount: 1450 },
    { id: "local-hybrid", name: "Terminal Móvel Tático (Comarca-Viana)", type: "local", ip: "192.168.50.8", status: "online", latencyMs: 4, recordsCount: 380 }
  ],
  history: [
    { id: "SYNC-9901", timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), sourceNode: "local-onpremise", targetNode: "cloud-primary", recordsTransferred: 14, status: "SUCCESS", details: "Ficha de reclusos e dados biométricos sincronizados com sucesso." },
    { id: "SYNC-9900", timestamp: new Date(Date.now() - 23 * 60 * 1000).toISOString(), sourceNode: "cloud-primary", targetNode: "cloud-secondary", recordsTransferred: 4, status: "SUCCESS", details: "Replicação de logs forenses e carimbos de tempo concluída." },
    { id: "SYNC-9899", timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(), sourceNode: "local-hybrid", targetNode: "cloud-primary", recordsTransferred: 0, status: "WARNING", details: "Nenhum registo pendente encontrado no terminal local." }
  ]
};

export class ClusterService {
  /**
   * Returns current active cluster configurations and metrics.
   */
  static getClusterConfig(): ClusterConfig {
    return currentClusterConfig;
  }

  /**
   * Updates cluster settings and logs the change.
   */
  static async updateClusterConfig(
    operatorId: string,
    operatorName: string,
    data: Partial<Pick<ClusterConfig, "activeInstance" | "replicationPolicy" | "syncIntervalMinutes" | "conflictResolution">>
  ): Promise<ClusterConfig> {
    if (data.activeInstance) {
      currentClusterConfig.activeInstance = data.activeInstance;
    }
    if (data.replicationPolicy) {
      currentClusterConfig.replicationPolicy = data.replicationPolicy;
    }
    if (data.syncIntervalMinutes !== undefined) {
      currentClusterConfig.syncIntervalMinutes = data.syncIntervalMinutes;
    }
    if (data.conflictResolution) {
      currentClusterConfig.conflictResolution = data.conflictResolution;
    }

    // Log the configuration update in system audit trail
    await dbService.createLog({
      evento: "CLUSTER_CONFIG_UPDATE",
      modulo: "AJUSTES",
      nivelSeveridade: "CRITICAL",
      funcionarioId: operatorId,
      dadosJson: JSON.stringify({
        configUpdated: data,
        autor: operatorName,
        timestamp: new Date().toISOString()
      })
    });

    return currentClusterConfig;
  }

  /**
   * Manually runs data replication between nodes.
   */
  static async triggerManualSync(operatorId: string, operatorName: string): Promise<ClusterConfig> {
    currentClusterConfig.syncStatus = "syncing";
    
    // Simulate active sync in memory
    const activeNode = currentClusterConfig.nodes.find(n => n.id === currentClusterConfig.activeInstance) || currentClusterConfig.nodes[0];
    
    // Pick an eligible local node to sync with cloud
    const localNode = currentClusterConfig.nodes.find(n => n.type === "local") || currentClusterConfig.nodes[2];
    
    // Change nodes statuses temporarily
    activeNode.status = "syncing";
    localNode.status = "syncing";

    // Simulate latency change
    activeNode.latencyMs = Math.round(activeNode.latencyMs * 1.5);
    localNode.latencyMs = Math.round(localNode.latencyMs * 1.5);

    // Let's create an asynchronous-like structure by pushing a new log entry
    const newSyncId = `SYNC-${Math.floor(10000 + Math.random() * 90000)}`;
    const recordsTransferred = Math.floor(Math.random() * 12) + 1;

    const newLog: SyncHistoryEntry = {
      id: newSyncId,
      timestamp: new Date().toISOString(),
      sourceNode: localNode.id,
      targetNode: activeNode.id,
      recordsTransferred,
      status: "SUCCESS",
      details: `Reconvergência forçada de cluster iniciada por ${operatorName}. ${recordsTransferred} registros de custódia integrados.`
    };

    currentClusterConfig.history.unshift(newLog);
    if (currentClusterConfig.history.length > 10) {
      currentClusterConfig.history.pop();
    }

    // Update state to completed
    currentClusterConfig.syncStatus = "synchronized";
    currentClusterConfig.lastSyncTime = new Date().toISOString();
    
    activeNode.status = "online";
    localNode.status = "online";
    activeNode.latencyMs = Math.round(activeNode.latencyMs / 1.5);
    localNode.latencyMs = Math.round(localNode.latencyMs / 1.5);
    activeNode.recordsCount += recordsTransferred;

    // Log the manual sync event
    await dbService.createLog({
      evento: "CLUSTER_MANUAL_SYNC",
      modulo: "AJUSTES",
      nivelSeveridade: "INFO",
      funcionarioId: operatorId,
      dadosJson: JSON.stringify({
        syncId: newSyncId,
        recordsTransferred,
        autor: operatorName,
        timestamp: new Date().toISOString()
      })
    });

    return currentClusterConfig;
  }
}
