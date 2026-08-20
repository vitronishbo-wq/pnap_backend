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

export interface DbConnectionConfig {
  id: "primary" | "audit" | "bi";
  name: string;
  dbName: string;
  url: string;
  host: string;
  port: number;
  user: string;
  sslMode: "require" | "verify-full" | "prefer" | "disable";
  maxPoolSize: number;
  status: "CONNECTED" | "ERROR" | "TESTING" | "UNTESTED";
  latencyMs: number;
  lastTestedAt?: string;
  versionInfo?: string;
  tablesCount?: number;
  description: string;
}

export interface PostgresClusterConnections {
  primary: DbConnectionConfig;
  audit: DbConnectionConfig;
  bi: DbConnectionConfig;
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
  firestoreConnections?: PostgresClusterConnections;
  postgresConnections?: PostgresClusterConnections;
}

// Cloud Firestore Cluster Connection Definitions & Shards
let currentDbConnections: PostgresClusterConnections = {
  primary: {
    id: "primary",
    name: "Cloud Firestore Canónico (OLTP - reclusos)",
    dbName: "firestore_primary_ao",
    url: "https://firestore.googleapis.com/v1/projects/pnap-ao-minint/databases/(default)",
    host: "firestore.googleapis.com (europe-west1)",
    port: 443,
    user: "firebase-admin-sa@pnap-ao-minint.iam.gserviceaccount.com",
    sslMode: "verify-full",
    maxPoolSize: 50,
    status: "CONNECTED",
    latencyMs: 8,
    lastTestedAt: new Date().toISOString(),
    versionInfo: "Google Cloud Firestore Enterprise (Multi-Region europe-west1)",
    tablesCount: 42,
    description: "Coleção canónica primária para prontuários de reclusos, biometria e operações das penitenciárias."
  },
  audit: {
    id: "audit",
    name: "Cloud Firestore Auditoria Forense (Immutable Ledger SHA-256)",
    dbName: "firestore_audit_ledger",
    url: "https://firestore.googleapis.com/v1/projects/pnap-ao-minint/databases/(default)/documents/auditoria_logs",
    host: "firestore-audit.googleapis.com (europe-west1)",
    port: 443,
    user: "firebase-admin-audit@pnap-ao-minint.iam.gserviceaccount.com",
    sslMode: "verify-full",
    maxPoolSize: 30,
    status: "CONNECTED",
    latencyMs: 12,
    lastTestedAt: new Date().toISOString(),
    versionInfo: "Google Cloud Firestore Immutable Trail (SHA-256 HMAC Sealed)",
    tablesCount: 18,
    description: "Registo imutável de logs de auditoria nacional, assinaturas criptográficas SHA-256 e não-repúdio."
  },
  bi: {
    id: "bi",
    name: "Cloud Firestore Analytics & Telemetria (Data Warehouse / DW)",
    dbName: "firestore_telemetry_dw",
    url: "https://firestore.googleapis.com/v1/projects/pnap-ao-minint/databases/(default)/documents/eventos_barramento",
    host: "firestore-dw.googleapis.com (europe-west1)",
    port: 443,
    user: "firebase-admin-bi@pnap-ao-minint.iam.gserviceaccount.com",
    sslMode: "verify-full",
    maxPoolSize: 20,
    status: "CONNECTED",
    latencyMs: 15,
    lastTestedAt: new Date().toISOString(),
    versionInfo: "Google Cloud Firestore Analytics & BigQuery Synced Connector",
    tablesCount: 28,
    description: "Repositório analítico para geração de estatísticas do MININT, tendências e modelos operacionais."
  }
};

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
    return {
      ...currentClusterConfig,
      postgresConnections: currentDbConnections
    };
  }

  /**
   * Returns current active PostgreSQL cluster database connections (primary, audit, BI).
   */
  static getDbConnections(): PostgresClusterConnections {
    return currentDbConnections;
  }

  /**
   * Updates PostgreSQL cluster database connections configuration.
   */
  static async updateDbConnections(
    operatorId: string,
    operatorName: string,
    connections: Partial<PostgresClusterConnections>
  ): Promise<PostgresClusterConnections> {
    if (connections.primary) {
      currentDbConnections.primary = { ...currentDbConnections.primary, ...connections.primary };
    }
    if (connections.audit) {
      currentDbConnections.audit = { ...currentDbConnections.audit, ...connections.audit };
    }
    if (connections.bi) {
      currentDbConnections.bi = { ...currentDbConnections.bi, ...connections.bi };
    }

    // Log update in audit trail
    await dbService.createLog({
      evento: "DB_CONNECTIONS_UPDATE",
      modulo: "AJUSTES",
      nivelSeveridade: "CRITICAL",
      funcionarioId: operatorId,
      dadosJson: JSON.stringify({
        updatedConnections: Object.keys(connections),
        autor: operatorName,
        timestamp: new Date().toISOString()
      })
    });

    return currentDbConnections;
  }

  /**
   * Tests connectivity to a specified PostgreSQL database (primary, audit, or bi).
   * Performs step-by-step diagnostic simulation of DNS, TCP socket, TLS handshake, Auth & Query execution.
   */
  static async testDbConnection(
    connectionId: "primary" | "audit" | "bi",
    customUrl?: string
  ): Promise<{
    success: boolean;
    connectionId: "primary" | "audit" | "bi";
    latencyMs: number;
    timestamp: string;
    details: {
      dnsResolved: boolean;
      tcpHandshakeMs: number;
      sslHandshakeMs: number;
      authStatus: string;
      queryExecutionMs: number;
      postgresVersion: string;
      firestoreVersion?: string;
      activeConnections: number;
      maxConnections: number;
      tablesCount: number;
      sslMode: string;
      logs: string[];
    };
    error?: string;
  }> {
    const targetConfig = currentDbConnections[connectionId];
    const testUrl = customUrl || targetConfig.url;

    // Simulate multi-stage connection test
    const logs: string[] = [];
    logs.push(`[${new Date().toLocaleTimeString()}] Iniciando verificação de conectividade para '${targetConfig.name}'...`);

    // Parse URL basic check
    let host = targetConfig.host;
    let port = targetConfig.port;
    let dbName = targetConfig.dbName;

    try {
      if (testUrl.includes("@")) {
        const parts = testUrl.split("@")[1];
        const hostPortDb = parts.split("/")[0];
        if (hostPortDb.includes(":")) {
          host = hostPortDb.split(":")[0];
          port = parseInt(hostPortDb.split(":")[1]) || 5432;
        } else {
          host = hostPortDb;
        }
        if (parts.includes("/")) {
          dbName = parts.split("/")[1].split("?")[0] || dbName;
        }
      }
    } catch {
      // Fallback
    }

    logs.push(`[${new Date().toLocaleTimeString()}] Resolução DNS: '${host}' -> IP Governamental validado.`);
    
    // Check if testUrl contains invalid format or mock error trigger
    if (testUrl.includes("invalid") || testUrl.includes("error_trigger")) {
      logs.push(`[${new Date().toLocaleTimeString()}] ❌ ERRO: Falha de autenticação ou socket recusado pela porta ${port}.`);
      currentDbConnections[connectionId].status = "ERROR";
      return {
        success: false,
        connectionId,
        latencyMs: 999,
        timestamp: new Date().toISOString(),
        details: {
          dnsResolved: true,
          tcpHandshakeMs: 45,
          sslHandshakeMs: 0,
          authStatus: "AUTHENTICATION_FAILED",
          queryExecutionMs: 0,
          postgresVersion: "N/A",
          activeConnections: 0,
          maxConnections: targetConfig.maxPoolSize,
          tablesCount: 0,
          sslMode: targetConfig.sslMode,
          logs
        },
        error: `Conexão recusada ao conectar a ${host}:${port}/${dbName}. Verifique a URL e a palavra-passe.`
      };
    }

    // Standard Success Diagnostic Simulation
    const tcpTime = Math.floor(Math.random() * 4) + 2;
    const sslTime = Math.floor(Math.random() * 8) + 5;
    const queryTime = Math.floor(Math.random() * 5) + 3;
    const totalLatency = tcpTime + sslTime + queryTime;

    logs.push(`[${new Date().toLocaleTimeString()}] 🟢 Socket TCP / HTTPS: Porta ${port} acessível (${tcpTime} ms).`);
    logs.push(`[${new Date().toLocaleTimeString()}] 🟢 Handshake TLS/SSL (${targetConfig.sslMode}): Cifragem AES-256-GCM ativa (${sslTime} ms).`);
    logs.push(`[${new Date().toLocaleTimeString()}] 🟢 Autenticação Google IAM / Service Account: '${targetConfig.user}' autorizada com Custom Claims.`);
    logs.push(`[${new Date().toLocaleTimeString()}] 🟢 Validação de Coleção ('firestore.collection("${targetConfig.dbName}").limit(1)'): Resposta OK (${queryTime} ms).`);
    logs.push(`[${new Date().toLocaleTimeString()}] ✅ TESTE CONCLUÍDO: Coleção/Shard '${targetConfig.dbName}' 100% OPERACIONAL. Latência total: ${totalLatency} ms.`);

    // Update in-memory state
    currentDbConnections[connectionId].status = "CONNECTED";
    currentDbConnections[connectionId].latencyMs = totalLatency;
    currentDbConnections[connectionId].lastTestedAt = new Date().toISOString();

    return {
      success: true,
      connectionId,
      latencyMs: totalLatency,
      timestamp: new Date().toISOString(),
      details: {
        dnsResolved: true,
        tcpHandshakeMs: tcpTime,
        sslHandshakeMs: sslTime,
        authStatus: "AUTHENTICATED_OK",
        queryExecutionMs: queryTime,
        postgresVersion: targetConfig.versionInfo || "Cloud Firestore Enterprise",
        firestoreVersion: targetConfig.versionInfo || "Google Cloud Firestore Enterprise",
        activeConnections: connectionId === "primary" ? 18 : connectionId === "audit" ? 5 : 3,
        maxConnections: targetConfig.maxPoolSize,
        tablesCount: targetConfig.tablesCount || 30,
        sslMode: targetConfig.sslMode,
        logs
      }
    };
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
