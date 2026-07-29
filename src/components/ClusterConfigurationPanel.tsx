import React, { useState, useEffect } from "react";
import { apiService } from "../utils/apiService";
import { motion, AnimatePresence } from "motion/react";
import {
  Database,
  Server,
  RefreshCw,
  Sliders,
  CheckCircle,
  Wifi,
  WifiOff,
  Clock,
  Zap,
  Layers,
  ArrowRight,
  Cpu,
  Globe,
  CornerDownRight,
  Shield,
  Activity,
  AlertTriangle,
  Play,
  Terminal,
  Network,
  ArrowDownUp,
  Settings,
  Radio,
  MapPin,
  Check,
  AlertCircle,
  TrendingUp,
  BarChart3,
  HelpCircle,
  ServerCrash,
  ZapOff,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";

interface DBNode {
  id: string;
  name: string;
  type: "cloud" | "local";
  ip: string;
  status: "online" | "offline" | "syncing";
  latencyMs: number;
  recordsCount: number;
}

interface SyncHistoryEntry {
  id: string;
  timestamp: string;
  sourceNode: string;
  targetNode: string;
  recordsTransferred: number;
  status: "SUCCESS" | "WARNING" | "FAILED";
  details: string;
}

interface ClusterConfig {
  activeInstance: "cloud-primary" | "cloud-secondary" | "local-onpremise" | "local-hybrid";
  replicationPolicy: "realtime" | "interval" | "manual";
  syncIntervalMinutes: number;
  conflictResolution: "cloud-wins" | "local-wins" | "manual-review";
  lastSyncTime: string;
  syncStatus: "idle" | "syncing" | "error" | "synchronized";
  nodes: DBNode[];
  history: SyncHistoryEntry[];
}

export default function ClusterConfigurationPanel() {
  const [config, setConfig] = useState<ClusterConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Top-Level Active Tab Selector
  const [activePanelTab, setActivePanelTab] = useState<"latency" | "failover" | "load-balancing">("latency");

  // Replication & Continuity states
  const [isLuandaFailed, setIsLuandaFailed] = useState<boolean>(false);
  const [latencyMultipliers, setLatencyMultipliers] = useState<Record<string, number>>({
    "cloud-primary": 1,
    "cloud-secondary": 1,
    "local-onpremise": 1,
    "local-hybrid": 1
  });
  const [measuringIntegrity, setMeasuringIntegrity] = useState<boolean>(false);

  // Latency Alert States
  const [latencyAlertThreshold, setLatencyAlertThreshold] = useState<number>(150);

  // 1. FAILOVER DEFINITIONS STATES
  const [failoverMode, setFailoverMode] = useState<"auto" | "manual">("auto");
  const [heartbeatTimeoutSec, setHeartbeatTimeoutSec] = useState<number>(10);
  const [priorityOrder, setPriorityOrder] = useState<string[]>(["cloud-secondary", "local-onpremise", "local-hybrid"]);
  const [virtualIpAddress, setVirtualIpAddress] = useState<string>("10.224.0.100");
  const [failoverHistory, setFailoverHistory] = useState<Array<{ timestamp: string; event: string; type: "info" | "warning" | "success" }>>([
    { timestamp: new Date(Date.now() - 36 * 60 * 1000).toISOString(), event: "Sincronização do Virtual IP (10.224.0.100) efetuada no nó cloud-primary", type: "success" },
    { timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), event: "Daemon de monitorização de failover automático iniciado com sucesso", type: "info" }
  ]);

  // AUTOMATIC PROMOTION & ELECTION STRATEGY STATES
  const [promotionStrategy, setPromotionStrategy] = useState<"priority" | "latency" | "packet-loss">("priority");
  const [failoverLatencyTrigger, setFailoverLatencyTrigger] = useState<number>(200);
  const [consecutiveTimeoutsRequired, setConsecutiveTimeoutsRequired] = useState<number>(3);
  const [consecutiveTimeoutsCount, setConsecutiveTimeoutsCount] = useState<number>(0);
  const [requireQuorum, setRequireQuorum] = useState<boolean>(true);
  const [promotedMasterId, setPromotedMasterId] = useState<string | null>(null);
  const [isAutoFailoverInProgress, setIsAutoFailoverInProgress] = useState<boolean>(false);

  // 2. LOAD BALANCING STATES (pnap_db)
  const [loadBalancingEnabled, setLoadBalancingEnabled] = useState<boolean>(true);
  const [balancingAlgorithm, setBalancingAlgorithm] = useState<"round-robin" | "least-connections" | "read-only-offload">("read-only-offload");
  const [maxConnections, setMaxConnections] = useState<number>(500);
  const [weightLuanda, setWeightLuanda] = useState<number>(4);
  const [weightBenguela, setWeightBenguela] = useState<number>(2);
  const [weightHuambo, setWeightHuambo] = useState<number>(1);
  const [weightViana, setWeightViana] = useState<number>(1);

  // Live Traffic Simulation
  const [trafficSimulationEnabled, setTrafficSimulationEnabled] = useState<boolean>(false);
  const [simulatedQps, setSimulatedQps] = useState<number>(45);
  const [liveConnections, setLiveConnections] = useState<Record<string, number>>({
    "cloud-primary": 85,
    "cloud-secondary": 42,
    "local-onpremise": 15,
    "local-hybrid": 8
  });

  // Real-time heartbeat tracking state
  const [heartbeats, setHeartbeats] = useState<Record<string, { lastSeen: Date; latency: number; history: number[]; packetLoss: number }>>({
    "cloud-primary": { lastSeen: new Date(), latency: 12, history: [12, 14, 11, 13, 12], packetLoss: 0 },
    "cloud-secondary": { lastSeen: new Date(), latency: 22, history: [22, 21, 24, 23, 22], packetLoss: 0 },
    "local-onpremise": { lastSeen: new Date(), latency: 5, history: [5, 6, 5, 4, 5], packetLoss: 0 },
    "local-hybrid": { lastSeen: new Date(), latency: 38, history: [38, 41, 36, 39, 38], packetLoss: 1.5 }
  });
  const [latencySpikeNode, setLatencySpikeNode] = useState<string | null>(null);

  // WAL LSN (Write-Ahead Logging Log Sequence Number) and replica sync lag tracking
  const [walLsn, setWalLsn] = useState<string>("1F/8C20B328");
  const [replicaLag, setReplicaLag] = useState<Record<string, { lagBytes: number; lagSeconds: number }>>({
    "cloud-secondary": { lagBytes: 0, lagSeconds: 0 },
    "local-onpremise": { lagBytes: 256, lagSeconds: 0.1 },
    "local-hybrid": { lagBytes: 2048, lagSeconds: 1.2 }
  });

  // Automatic SLA Threshold Calculation States
  const [isAutoThreshold, setIsAutoThreshold] = useState<boolean>(true);
  const [autoThresholdProfile, setAutoThresholdProfile] = useState<"strict" | "balanced" | "tolerant">("balanced");

  // Local toast state for latency threshold violation warning
  const [panelToast, setPanelToast] = useState<{ id: string; title: string; message: string; type: "success" | "error" | "warning" | "info" } | null>(null);
  const notifiedNodesRef = React.useRef<Record<string, boolean>>({});

  // Auto-dismiss panel toast
  useEffect(() => {
    if (panelToast) {
      const timer = setTimeout(() => {
        setPanelToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [panelToast]);

  // Trigger to monitor simulated latency and dispatch visual toast alerts
  useEffect(() => {
    // Look for active nodes whose latency exceeds latencyAlertThreshold
    const nodesExceeding = Object.entries(heartbeats)
      .filter(([id, hb]) => {
        const isOffline = (id === "cloud-primary" && isLuandaFailed);
        return !isOffline && hb.latency > latencyAlertThreshold;
      })
      .map(([id]) => id);

    if (nodesExceeding.length > 0) {
      // Find nodes we haven't notified about yet
      const newViolations = nodesExceeding.filter(id => !notifiedNodesRef.current[id]);

      if (newViolations.length > 0) {
        const names = newViolations.map(id => {
          if (id === "cloud-primary") return "Luanda Central";
          if (id === "cloud-secondary") return "Benguela Backup";
          if (id === "local-onpremise") return "Huambo EP";
          if (id === "local-hybrid") return "Viana Híbrido";
          return id;
        }).join(", ");

        const latenciesInfo = newViolations.map(id => {
          return `${id === "cloud-primary" ? "Luanda" : id === "cloud-secondary" ? "Benguela" : id === "local-onpremise" ? "Huambo" : "Viana"}: ${heartbeats[id].latency}ms`;
        }).join(" | ");

        setPanelToast({
          id: Date.now().toString(),
          title: "⚠️ Alerta de Latência Excedida",
          message: `Limite de SLA de ${latencyAlertThreshold}ms violado em: ${names} (${latenciesInfo}).`,
          type: "warning"
        });

        // Mark as notified
        newViolations.forEach(id => {
          notifiedNodesRef.current[id] = true;
        });
      }

      // Reset notified status for any nodes that are no longer exceeding
      Object.keys(notifiedNodesRef.current).forEach(id => {
        if (!nodesExceeding.includes(id)) {
          delete notifiedNodesRef.current[id];
        }
      });
    } else {
      // Clear all notifications
      notifiedNodesRef.current = {};
    }
  }, [heartbeats, latencyAlertThreshold, isLuandaFailed]);

  useEffect(() => {
    if (!isAutoThreshold) return;

    // Get latencies of active, non-offline nodes
    const activeLatencies = Object.entries(heartbeats)
      .filter(([id, hb]) => {
        const isOffline = (id === "cloud-primary" && isLuandaFailed);
        return !isOffline && hb.latency < 500; // exclude completely offline or timeout nodes
      })
      .map(([_, hb]) => hb.latency);

    if (activeLatencies.length === 0) return;

    const maxActiveLatency = Math.max(...activeLatencies);
    const avgActiveLatency = activeLatencies.reduce((sum, val) => sum + val, 0) / activeLatencies.length;

    let computedThreshold = 150;
    if (autoThresholdProfile === "strict") {
      // Strict: 1.25x average active latency + 15ms buffer
      computedThreshold = Math.round(avgActiveLatency * 1.25 + 15);
    } else if (autoThresholdProfile === "balanced") {
      // Balanced: 1.5x max active latency + 30ms buffer
      computedThreshold = Math.round(maxActiveLatency * 1.5 + 30);
    } else if (autoThresholdProfile === "tolerant") {
      // Tolerant: 2.0x max active latency + 50ms buffer
      computedThreshold = Math.round(maxActiveLatency * 2.0 + 50);
    }

    // Guardbands: min 40ms, max 300ms
    const clampedThreshold = Math.min(300, Math.max(40, computedThreshold));
    setLatencyAlertThreshold(clampedThreshold);
  }, [heartbeats, isAutoThreshold, autoThresholdProfile, isLuandaFailed]);

  // AUTOMATIC PROMOTION ELECTION LOGIC
  const executeAutomaticPromotion = (targetWinnerId?: string) => {
    if (promotedMasterId) return;

    setIsAutoFailoverInProgress(true);
    const nowTimestamp = new Date().toISOString();

    // 1. Gather all online standbys and their stats
    const onlineStandbyNodes = [
      { id: "cloud-secondary", name: "Benguela Backup Node (DR)", ip: "10.224.2.15", defaultLag: 0.2, latency: heartbeats["cloud-secondary"]?.latency || 22, loss: heartbeats["cloud-secondary"]?.packetLoss || 0 },
      { id: "local-onpremise", name: "Huambo EP Local Node", ip: "192.168.42.10", defaultLag: 2.4, latency: heartbeats["local-onpremise"]?.latency || 5, loss: heartbeats["local-onpremise"]?.packetLoss || 0 },
      { id: "local-hybrid", name: "Viana Móvel Híbrido", ip: "192.168.50.8", defaultLag: 54.2, latency: heartbeats["local-hybrid"]?.latency || 38, loss: heartbeats["local-hybrid"]?.packetLoss || 1.5 }
    ];

    // Check how many replicas are healthy (latency < threshold)
    const healthyReplicas = onlineStandbyNodes.filter(n => n.latency < latencyAlertThreshold);

    // 2. Quorum Consenso Check
    if (requireQuorum && healthyReplicas.length < 2) {
      const failLog = {
        timestamp: nowTimestamp,
        event: `CRITICAL [CONSENSO]: Failover automático ABORTADO por falta de Quorum de Consenso. Apenas ${healthyReplicas.length} réplica(s) saudáveis. Requer mínimo de 2.`,
        type: "warning" as const
      };
      setFailoverHistory(prev => [failLog, ...prev]);
      setIsAutoFailoverInProgress(false);
      return;
    }

    // 3. Election Strategy
    let winnerId = targetWinnerId || "cloud-secondary";
    let electionDetail = targetWinnerId 
      ? `Intervenção Manual do Operador. Nó '${targetWinnerId === "cloud-secondary" ? "Benguela-DR" : targetWinnerId === "local-onpremise" ? "Huambo-EP" : "Viana Móvel"}' forçado como MASTER.`
      : "";

    if (!targetWinnerId) {
      if (promotionStrategy === "priority") {
        // Pick first in priorityOrder that is healthy
        const firstAvailable = priorityOrder.find(pId => {
          const replica = onlineStandbyNodes.find(r => r.id === pId);
          return replica && replica.latency < 500; // reasonable ping
        });
        winnerId = firstAvailable || priorityOrder[0] || "cloud-secondary";
        const winnerName = winnerId === "cloud-secondary" ? "Benguela-DR" : winnerId === "local-onpremise" ? "Huambo-EP" : "Viana Móvel";
        electionDetail = `Estratégia: Prioridade de Fila. Nó '${winnerName}' promovido por precedência configurada pelo operador.`;
      } else if (promotionStrategy === "latency") {
        // Pick lowest latency replica
        const sortedByLat = [...onlineStandbyNodes].sort((a, b) => a.latency - b.latency);
        winnerId = sortedByLat[0].id;
        electionDetail = `Estratégia: Menor Latência de Rede. Nó '${sortedByLat[0].name}' promovido com ping ideal de ${sortedByLat[0].latency}ms.`;
      } else {
        // Pick lowest packet loss
        const sortedByLoss = [...onlineStandbyNodes].sort((a, b) => a.loss - b.loss);
        winnerId = sortedByLoss[0].id;
        electionDetail = `Estratégia: Menor Perda de Pacotes. Nó '${sortedByLoss[0].name}' promovido com perda mínima estável de ${sortedByLoss[0].loss}%.`;
      }
    }

    setPromotedMasterId(winnerId);
    
    // Log the event
    const crashLog = {
      timestamp: nowTimestamp,
      event: targetWinnerId 
        ? `CRITICAL [FAILOVER]: Acionamento MANUAL de promoção de nó stand-by pelo administrador central.`
        : `CRITICAL [FAILOVER]: Nó primário Luanda-Central offline/ilegível por ${consecutiveTimeoutsRequired} ciclos consecutivos de monitorização.`,
      type: "warning" as const
    };

    const promoLog = {
      timestamp: nowTimestamp,
      event: `PROMOÇÃO EXECUTADA [OK]: ${electionDetail} Virtual IP ${virtualIpAddress} redirecionado.`,
      type: "success" as const
    };

    setFailoverHistory(prev => [promoLog, crashLog, ...prev]);

    if (config) {
      const failoverEntry: SyncHistoryEntry = {
        id: `FAIL-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: nowTimestamp,
        sourceNode: "cloud-primary",
        targetNode: winnerId,
        recordsTransferred: 0,
        status: "FAILED",
        details: `CONVENÇÃO DE ALTA DISPONIBILIDADE: Detetado blackout em Luanda. Novo Master de Gravação eleito (${winnerId === "cloud-secondary" ? "Benguela-DR" : winnerId === "local-onpremise" ? "Huambo-EP" : "Viana-Móvel"}).`
      };
      
      setConfig({
        ...config,
        activeInstance: winnerId as any,
        history: [failoverEntry, ...config.history]
      });
    }

    setIsAutoFailoverInProgress(false);
  };

  // Interval to update heartbeats and simulate load-balancing traffic split in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update latency and heartbeats
      setHeartbeats(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          const isPrimaryOffline = id === "cloud-primary" && isLuandaFailed;
          const lastSeenDate = isPrimaryOffline ? prev[id].lastSeen : new Date();
          
          let baseLat = 10;
          if (id === "cloud-primary") baseLat = 12;
          else if (id === "cloud-secondary") baseLat = 22;
          else if (id === "local-onpremise") baseLat = 5;
          else if (id === "local-hybrid") baseLat = 38;

          let latency = 0;
          let packetLoss = id === "local-hybrid" ? Number((1 + Math.random() * 2).toFixed(1)) : 0;

          if (isPrimaryOffline) {
            latency = 9999;
            packetLoss = 100;
          } else if (latencySpikeNode === id) {
            latency = Math.round(160 + Math.random() * 45); // Guaranteed > 150ms
            packetLoss = Number((3 + Math.random() * 5).toFixed(1));
          } else {
            const multiplier = latencyMultipliers[id] || 1;
            latency = Math.max(1, Math.round((baseLat + (Math.random() * 6 - 3)) * multiplier));
          }

          const history = [...(prev[id]?.history || [])];
          history.push(latency);
          if (history.length > 8) history.shift();

          next[id] = {
            lastSeen: lastSeenDate,
            latency,
            history,
            packetLoss
          };
        });
        return next;
      });

      // 2. Simulate traffic load & dynamic QPS
      setSimulatedQps(prev => {
        const base = trafficSimulationEnabled ? 320 : 38;
        const flux = Math.round(base + (Math.random() * base * 0.15) - (base * 0.07));
        return Math.max(10, flux);
      });

      // Update WAL LSN and Replica Lags in real-time
      setWalLsn(prev => {
        if (isLuandaFailed && !promotedMasterId) {
          return prev; // locked - no master active
        }
        const parts = prev.split("/");
        const segment = parts[0];
        const offset = parseInt(parts[1], 16);
        const increment = Math.floor(Math.random() * 50) + 10;
        const newOffset = (offset + increment).toString(16).toUpperCase();
        return `${segment}/${newOffset.padStart(8, '0')}`;
      });

      setReplicaLag(prev => {
        const next = { ...prev };
        if (isLuandaFailed) {
          if (!promotedMasterId) {
            Object.keys(next).forEach(id => {
              next[id] = {
                lagBytes: next[id].lagBytes + Math.floor(Math.random() * 8000) + 2000,
                lagSeconds: Number((next[id].lagSeconds + 1 + Math.random() * 0.5).toFixed(1))
              };
            });
          } else {
            Object.keys(next).forEach(id => {
              if (id === promotedMasterId) {
                next[id] = { lagBytes: 0, lagSeconds: 0 };
              } else {
                next[id] = {
                  lagBytes: Math.max(0, next[id].lagBytes - (Math.floor(Math.random() * 5000) + 1000)),
                  lagSeconds: Math.max(0, Number((next[id].lagSeconds - 0.2).toFixed(1)))
                };
              }
            });
          }
        } else {
          Object.keys(next).forEach(id => {
            next[id] = {
              lagBytes: Math.max(0, Math.floor(Math.random() * 128)),
              lagSeconds: Math.max(0, Number((Math.random() * 0.1).toFixed(2)))
            };
          });
        }
        return next;
      });

      // 3. Real-time automatic failover detection based on monitored latency / status
      const primaryLatency = isLuandaFailed ? 9999 : (heartbeats["cloud-primary"]?.latency || 12);
      const isPrimaryFailing = isLuandaFailed || (primaryLatency > failoverLatencyTrigger) || (latencySpikeNode === "cloud-primary");

      if (isPrimaryFailing) {
        setConsecutiveTimeoutsCount(prevCount => {
          const nextCount = prevCount + 1;
          if (nextCount >= consecutiveTimeoutsRequired && !promotedMasterId && !isAutoFailoverInProgress && failoverMode === "auto") {
            setTimeout(() => {
              executeAutomaticPromotion();
            }, 0);
          }
          return nextCount;
        });
      } else {
        setConsecutiveTimeoutsCount(0);
      }

    }, 1000);
    return () => clearInterval(interval);
  }, [
    isLuandaFailed,
    latencyMultipliers,
    latencySpikeNode,
    trafficSimulationEnabled,
    failoverMode,
    failoverLatencyTrigger,
    consecutiveTimeoutsRequired,
    promotedMasterId,
    isAutoFailoverInProgress,
    priorityOrder,
    requireQuorum,
    promotionStrategy,
    virtualIpAddress,
    config
  ]);

  // Compute live query-per-second splits based on load-balancing algorithm and weight factors
  const getTrafficDistribution = () => {
    const activeNodes = [
      { id: "cloud-primary", online: !isLuandaFailed, weight: weightLuanda },
      { id: "cloud-secondary", online: true, weight: weightBenguela },
      { id: "local-onpremise", online: true, weight: weightHuambo },
      { id: "local-hybrid", online: true, weight: weightViana }
    ];

    const onlineCount = activeNodes.filter(n => n.online).length;
    if (onlineCount === 0 || !loadBalancingEnabled) {
      return activeNodes.map(n => ({ id: n.id, qps: 0, percentage: 0, conns: 0 }));
    }

    let rawDistribution: Record<string, number> = {};

    if (balancingAlgorithm === "round-robin") {
      // Split strictly evenly among online nodes (proportional to their connection weights)
      const totalWeight = activeNodes.reduce((acc, n) => acc + (n.online ? n.weight : 0), 0) || 1;
      activeNodes.forEach(n => {
        rawDistribution[n.id] = n.online ? (n.weight / totalWeight) : 0;
      });
    } else if (balancingAlgorithm === "read-only-offload") {
      // Writes (e.g. 15% of traffic) go strictly to primary (if online, otherwise active standby)
      // Reads (85%) split exclusively among replication standby nodes
      const currentPrimaryId = !isLuandaFailed ? "cloud-primary" : priorityOrder[0];
      
      const secondaryNodes = activeNodes.filter(n => n.id !== currentPrimaryId && n.online);
      const secondaryWeightSum = secondaryNodes.reduce((acc, n) => acc + n.weight, 0) || 1;

      activeNodes.forEach(n => {
        if (n.id === currentPrimaryId) {
          rawDistribution[n.id] = n.online ? 0.15 : 0; // Primary only handles write transaction stream
        } else {
          const relativeWeight = n.online ? (n.weight / secondaryWeightSum) : 0;
          rawDistribution[n.id] = relativeWeight * 0.85; // Offloaded read transactions
        }
      });
    } else {
      // least-connections algorithm: routes dynamically to nodes based on lowest latency (simulated connections weight)
      // Faster response nodes get a higher share of the queries
      const onlineNodes = activeNodes.filter(n => n.online);
      const scores = onlineNodes.map(n => {
        const lat = heartbeats[n.id]?.latency || 10;
        const score = 1000 / (lat + 1) * n.weight; // faster latency & higher weight = higher score
        return { id: n.id, score };
      });
      const totalScore = scores.reduce((acc, s) => acc + s.score, 0) || 1;
      
      activeNodes.forEach(n => {
        const matched = scores.find(s => s.id === n.id);
        rawDistribution[n.id] = matched ? (matched.score / totalScore) : 0;
      });
    }

    // Normalize distribution & calculate active connection estimations
    return activeNodes.map(n => {
      const fraction = rawDistribution[n.id] || 0;
      const qps = Math.round(simulatedQps * fraction);
      const percentage = Math.round(fraction * 100);
      
      // Connection simulation proportional to QPS + background pool overhead
      const conns = n.online 
        ? Math.max(5, Math.round(qps * 1.8 + (Math.random() * 4 - 2))) 
        : 0;

      return {
        id: n.id,
        qps,
        percentage,
        conns: Math.min(maxConnections, conns)
      };
    });
  };

  const trafficDistribution = getTrafficDistribution();

  // Local form configuration state
  const [activeInstance, setActiveInstance] = useState<string>("cloud-primary");
  const [replicationPolicy, setReplicationPolicy] = useState<string>("interval");
  const [syncIntervalMinutes, setSyncIntervalMinutes] = useState<number>(15);
  const [conflictResolution, setConflictResolution] = useState<string>("cloud-wins");

  const triggerPingTest = () => {
    setMeasuringIntegrity(true);
    setTimeout(() => {
      setLatencyMultipliers({
        "cloud-primary": isLuandaFailed ? 9999 : 0.85 + Math.random() * 0.3,
        "cloud-secondary": 0.9 + Math.random() * 0.25,
        "local-onpremise": 0.92 + Math.random() * 0.15,
        "local-hybrid": 0.8 + Math.random() * 0.45
      });
      setMeasuringIntegrity(false);
    }, 1000);
  };

  const toggleLuandaFailure = () => {
    const nextFailed = !isLuandaFailed;
    setIsLuandaFailed(nextFailed);
    
    const nowTimestamp = new Date().toISOString();

    if (nextFailed) {
      // Primary goes offline - reset failure trackers to begin background evaluation
      setConsecutiveTimeoutsCount(0);
      setPromotedMasterId(null);

      const crashLog = {
        timestamp: nowTimestamp,
        event: "CRITICAL: Perda súbita de ligação com o Nó Primário de Luanda-Central (TIMEOUT). Detectando perda de batimento cardíaco.",
        type: "warning" as const
      };

      if (failoverMode === "auto") {
        const autoWaitLog = {
          timestamp: nowTimestamp,
          event: `MONITORIZAÇÃO: Analisando estabilidade de rede. Failover Automático agendado para após ${consecutiveTimeoutsRequired} timeouts consecutivos.`,
          type: "info" as const
        };
        setFailoverHistory(prev => [crashLog, autoWaitLog, ...prev]);
      } else {
        const manualWaitLog = {
          timestamp: nowTimestamp,
          event: "FALHA DETECTADA: O nó de Luanda está offline. Failover em espera devido à política MANUAL de promoção.",
          type: "warning" as const
        };
        setFailoverHistory(prev => [crashLog, manualWaitLog, ...prev]);
      }

      if (config) {
        const warningEntry: SyncHistoryEntry = {
          id: `FAIL-${Math.floor(10000 + Math.random() * 90000)}`,
          timestamp: nowTimestamp,
          sourceNode: "cloud-primary",
          targetNode: priorityOrder[0] || "cloud-secondary",
          recordsTransferred: 0,
          status: "FAILED",
          details: `CONTINGÊNCIA DO CLUSTER: Link com Luanda rompido. Monitorizando status físico para início do protocolo de eleição.`
        };
        setConfig({
          ...config,
          history: [warningEntry, ...config.history]
        });
      }
    } else {
      // Recover Link
      const prevPromoted = promotedMasterId;
      setConsecutiveTimeoutsCount(0);
      setPromotedMasterId(null);

      const recoveryLog = {
        timestamp: nowTimestamp,
        event: "LIGAÇÃO RECUPERADA: Link com Luanda-Central restabelecido. Executando auditoria bi-direcional de integridade.",
        type: "success" as const
      };
      
      const rebalanceLog = {
        timestamp: nowTimestamp,
        event: `RECOMPOSIÇÃO: Servidor de Luanda central reassume o Virtual IP (${virtualIpAddress}) como primário. Transações sincronizadas offline re-importadas com sucesso.`,
        type: "info" as const
      };

      setFailoverHistory(prev => [recoveryLog, rebalanceLog, ...prev]);

      if (config) {
        const recoverEntry: SyncHistoryEntry = {
          id: `RECV-${Math.floor(10000 + Math.random() * 90000)}`,
          timestamp: nowTimestamp,
          sourceNode: prevPromoted || priorityOrder[0] || "cloud-secondary",
          targetNode: "cloud-primary",
          recordsTransferred: 48,
          status: "SUCCESS",
          details: `LIGAÇÃO RESTAURADA: Sincronismo do link de Luanda reestabelecido. 48 transações biométricas em cache da base 'pnap_db' incorporadas com sucesso.`
        };
        setConfig({
          ...config,
          activeInstance: "cloud-primary" as any,
          history: [recoverEntry, ...config.history]
        });
      }
    }
  };

  const promotedStandbyActive = () => {
    return promotedMasterId || priorityOrder[0] || "cloud-secondary";
  };

  const getModifiedNode = (node: DBNode) => {
    if (node.id === "cloud-primary" && isLuandaFailed) {
      return {
        ...node,
        status: "offline" as const,
        latencyMs: 9999
      };
    }
    if (latencySpikeNode === node.id) {
      return {
        ...node,
        latencyMs: heartbeats[node.id]?.latency || 180
      };
    }
    const mult = latencyMultipliers[node.id] || 1;
    return {
      ...node,
      latencyMs: Math.round(node.latencyMs * mult)
    };
  };

  const loadClusterConfig = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getClusterConfig();
      if (data) {
        setConfig(data);
        setActiveInstance(data.activeInstance);
        setReplicationPolicy(data.replicationPolicy);
        setSyncIntervalMinutes(data.syncIntervalMinutes);
        setConflictResolution(data.conflictResolution);
      }
    } catch (err: any) {
      console.error("Erro ao obter configurações do cluster:", err);
      setError("Não foi possível carregar as configurações de cluster da base de dados física.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClusterConfig();
  }, []);

  const handleUpdateConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload = {
        activeInstance,
        replicationPolicy,
        syncIntervalMinutes: Number(syncIntervalMinutes),
        conflictResolution,
        // Include Extended failover and load balancing params to log them in the backend audit trail
        failoverMode,
        heartbeatTimeoutSec,
        priorityOrder,
        virtualIpAddress,
        loadBalancingEnabled,
        balancingAlgorithm,
        maxConnections,
        weights: {
          weightLuanda,
          weightBenguela,
          weightHuambo,
          weightViana
        }
      };
      const updated = await apiService.updateClusterConfig(payload);
      if (updated) {
        setConfig(updated);
        setSuccessMsg("Definições de failover, balanceamento de carga de 'pnap_db' e replicação gravadas com sucesso!");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      console.error("Erro ao atualizar configurações do cluster:", err);
      setError("Falha ao salvar as alterações no banco de dados.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await apiService.triggerClusterSync();
      if (updated) {
        setConfig(updated);
        setSuccessMsg("Reconciliação e sincronismo de hashes executado com sucesso no cluster!");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      console.error("Erro na sincronização manual:", err);
      setError("Erro ao forçar sincronização entre nós prisionais.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReorderStandby = (index: number, direction: "up" | "down") => {
    const nextOrder = [...priorityOrder];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= priorityOrder.length) return;
    
    // Swap
    const temp = nextOrder[index];
    nextOrder[index] = nextOrder[targetIdx];
    nextOrder[targetIdx] = temp;
    setPriorityOrder(nextOrder);

    // Track priority change
    setFailoverHistory(prev => [
      {
        timestamp: new Date().toISOString(),
        event: `ORDEM DE FILA DE FAILOVER ALTERADA: Nova prioridade standby ordenada para: ${nextOrder.map(n => n === "cloud-secondary" ? "Benguela" : n === "local-onpremise" ? "Huambo" : "Viana").join(" → ")}`,
        type: "info"
      },
      ...prev
    ]);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-950/60 rounded-xl border border-slate-850 p-8 flex flex-col items-center justify-center gap-3 min-h-[300px]">
        <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
        <span className="text-xs font-mono text-slate-400">Carregando topologia do cluster PostgreSQL central...</span>
      </div>
    );
  }

  // Latency alerts checker
  const currentAlarms = config?.nodes.map(n => {
    const rawNode = getModifiedNode(n);
    const actualLat = heartbeats[rawNode.id]?.latency || rawNode.latencyMs;
    const isOffline = rawNode.id === "cloud-primary" && isLuandaFailed;
    return {
      id: rawNode.id,
      name: rawNode.name,
      latency: actualLat,
      isAlert: !isOffline && actualLat > latencyAlertThreshold,
      isOffline
    };
  }).filter(alarm => alarm.isAlert) || [];

  return (
    <div className="flex flex-col gap-6 text-left" id="App-Alocação-Modulo">
      
      {/* ALERTS */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 animate-pulse" />
          <span>{error}</span>
        </div>
      )}

      {/* LATENCY VIOLATION WARNING BOX */}
      {currentAlarms.length > 0 && (
        <div className="bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono px-4 py-3.5 rounded-xl flex items-start gap-3 shadow-md animate-[pulse_3s_infinite]">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5 animate-bounce" />
          <div className="flex-1">
            <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xxs">Alerta de Integridade de SLA de Latência</h4>
            <p className="text-slate-350 text-[10px] mt-1 leading-normal">
              A latência de replicação inter-provincial violou o limite máximo de <strong>{latencyAlertThreshold}ms</strong> nos seguintes nós:
            </p>
            <div className="flex gap-2 flex-wrap mt-2">
              {currentAlarms.map(a => (
                <span key={a.id} className="bg-slate-950 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] font-bold text-amber-400">
                  {a.name} ({a.latency}ms)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPACT INFO JUMBOTRON */}
      <div className="bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-950/40 p-5 rounded-xl shadow-inner">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-500 shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-amber-500 text-slate-950 font-mono font-black uppercase px-2 py-0.5 rounded shadow">
                POSTGRESQL CENTRAL CLUSTER
              </span>
              <span className="text-[9px] bg-slate-900 text-amber-500 font-mono font-bold uppercase px-2 py-0.5 rounded border border-slate-800">
                DB: pnap_db
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-100 font-sans mt-2">
              Arquitetura de Alta Disponibilidade e Carga Distribuída
            </h2>
            <p className="text-xxs text-slate-400 mt-1 leading-relaxed">
              Consola unificada do MININT para gerenciar a redundância do serviço penitenciário centralizado de Angola. Configure os parâmetros críticos do motor PostgreSQL, gerencie o balanceador de tráfego de gravação para a base unificada <strong>'pnap_db'</strong> e monitore a latência de replicação física e lógica entre as direções provinciais.
            </p>
          </div>
        </div>
      </div>

      {/* DASHBOARD TAB SELECTOR */}
      <div className="flex border-b border-slate-900 pb-px gap-1 select-none">
        <button
          onClick={() => setActivePanelTab("latency")}
          className={`px-4 py-2.5 rounded-t-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
            activePanelTab === "latency"
              ? "bg-[#030508] border-slate-900 text-amber-500 border-b-[#030508]"
              : "bg-transparent border-transparent text-slate-500 hover:text-slate-350"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          Monitor de Latência Inter-Provincial
        </button>

        <button
          onClick={() => setActivePanelTab("failover")}
          className={`px-4 py-2.5 rounded-t-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
            activePanelTab === "failover"
              ? "bg-[#030508] border-slate-900 text-amber-500 border-b-[#030508]"
              : "bg-transparent border-transparent text-slate-500 hover:text-slate-350"
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          Definições de Failover & Emergência
        </button>

        <button
          onClick={() => setActivePanelTab("load-balancing")}
          className={`px-4 py-2.5 rounded-t-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
            activePanelTab === "load-balancing"
              ? "bg-[#030508] border-slate-900 text-amber-500 border-b-[#030508]"
              : "bg-transparent border-transparent text-slate-500 hover:text-slate-350"
          }`}
        >
          <ArrowDownUp className="h-3.5 w-3.5" />
          Balanceamento de Carga (pnap_db)
        </button>
      </div>

      {/* TAB SUB-PAGES */}
      <div className="min-h-[400px]">
        
        {/* TAB 1: LATENCY & INTER-PROVINCIAL TOPOLOGY */}
        {activePanelTab === "latency" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Replication Settings and Alert Limits */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-4">
                <div className="border-b border-slate-900 pb-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" /> Parâmetros de SLA
                  </h3>
                </div>

                {/* AUTO-SLA CALCULATION MODE */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9.5px] font-mono text-slate-350 uppercase font-bold tracking-wider">Cálculo de SLA Adaptativo</span>
                      <span className="text-[7.5px] font-mono text-slate-550">Sintonização dinâmica baseada nos pings ativos</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAutoThreshold(!isAutoThreshold)}
                      className={`px-2 py-0.5 rounded text-[8px] font-mono border font-black transition-all cursor-pointer ${
                        isAutoThreshold
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                          : "bg-slate-950 border-slate-850 text-slate-500"
                      }`}
                    >
                      {isAutoThreshold ? "AUTOMÁTICO" : "MANUAL"}
                    </button>
                  </div>

                  {isAutoThreshold && (
                    <div className="flex flex-col gap-2 border-t border-slate-950/60 pt-2.5">
                      <label className="text-[8.5px] font-mono text-slate-400 uppercase">Perfil de SLA de Replicação</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "strict", label: "Estrito", desc: "Média * 1.25 + 15ms" },
                          { id: "balanced", label: "Equilibrado", desc: "Máx * 1.5 + 30ms" },
                          { id: "tolerant", label: "Tolerante", desc: "Máx * 2.0 + 50ms" }
                        ].map((profile) => (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() => setAutoThresholdProfile(profile.id as any)}
                            className={`px-1.5 py-1.5 rounded text-[8px] font-mono border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-0.5 ${
                              autoThresholdProfile === profile.id
                                ? "bg-amber-500/10 border-amber-500/50 text-amber-300 font-bold"
                                : "bg-slate-950/80 border-slate-850 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <span>{profile.label}</span>
                            <span className="text-[6.5px] text-slate-550 font-normal">{profile.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400">Limite de Latência de SLA</span>
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      {isAutoThreshold && (
                        <span className="text-[7.5px] font-sans px-1 py-0.2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded mr-1 font-black uppercase animate-pulse">
                          AUTO
                        </span>
                      )}
                      <span>{latencyAlertThreshold} ms</span>
                    </span>
                  </div>
                  
                  <div className="flex gap-3 items-center mt-1">
                    <div className="flex-1">
                      <input
                        type="range"
                        min="40"
                        max="300"
                        step="5"
                        disabled={isAutoThreshold}
                        value={latencyAlertThreshold}
                        onChange={(e) => setLatencyAlertThreshold(Number(e.target.value))}
                        className={`w-full h-1 rounded cursor-pointer accent-amber-500 ${
                          isAutoThreshold ? "opacity-50 cursor-not-allowed bg-slate-950" : "bg-slate-900"
                        }`}
                      />
                    </div>
                    <div className="w-24 shrink-0 flex items-center gap-1.5 bg-slate-950 border border-slate-850 rounded px-2 py-1">
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        disabled={isAutoThreshold}
                        value={latencyAlertThreshold}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLatencyAlertThreshold(val);
                        }}
                        className={`w-full bg-transparent text-right text-xxs font-mono text-amber-500 font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          isAutoThreshold ? "opacity-40 cursor-not-allowed" : ""
                        }`}
                      />
                      <span className="text-[9px] text-slate-550 font-mono">ms</span>
                    </div>
                  </div>

                  <p className="text-[8.5px] text-slate-500 font-mono leading-tight mt-1">
                    {isAutoThreshold 
                      ? "O limiar adaptativo está a ser re-calculado de forma contínua com base na telemetria atual das províncias." 
                      : "Defina o tempo limite aceitável de latência para alertas visuais e de auditoria."}
                  </p>
                </div>

                <form onSubmit={handleUpdateConfig} className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Política Geral de Replicação</label>
                    <select
                      value={replicationPolicy}
                      onChange={(e) => setReplicationPolicy(e.target.value)}
                      className="bg-slate-900 border border-slate-850 text-slate-350 text-xxs font-mono rounded-lg px-3 py-2 w-full focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="realtime">Tempo Real Direto (WAL streaming assíncrono)</option>
                      <option value="interval">Periódico (Varredura em lote com fila de cache)</option>
                      <option value="manual">Sincronização Manual por Comando Tático</option>
                    </select>
                  </div>

                  {replicationPolicy === "interval" && (
                    <div className="flex flex-col gap-1 bg-slate-900/60 p-3 rounded-lg border border-slate-900">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">Frequência da Varredura</label>
                        <span className="text-xxs font-mono text-amber-500 font-bold">{syncIntervalMinutes} Minutos</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="60"
                        value={syncIntervalMinutes}
                        onChange={(e) => setSyncIntervalMinutes(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1 rounded bg-slate-950 mt-1 cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Algoritmo de Resolução de Conflitos</label>
                    <select
                      value={conflictResolution}
                      onChange={(e) => setConflictResolution(e.target.value)}
                      className="bg-slate-900 border border-slate-850 text-slate-350 text-xxs font-mono rounded-lg px-3 py-2 w-full focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="cloud-wins">Sede Central Luanda Prevalece (Cloud)</option>
                      <option value="local-wins">Direção Prisional Regional Prevalece (On-Premise)</option>
                      <option value="manual-review">Retorquir em Quarentena para Revisão por Auditores</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-black text-xxs uppercase tracking-wider font-mono py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow mt-1"
                  >
                    {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Guardar Configurações
                  </button>
                </form>

              </div>

              {/* Force Manual Sync block */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-300">
                  Reconciliação e Re-Hash Manual
                </h4>
                <p className="text-xxs text-slate-400 leading-relaxed">
                  Força um emparelhamento imediato bi-direcional de dados biométricos e logs das comarcas de Benguela, Huambo e Luanda, recalculando as assinaturas SHA256 na base de dados central.
                </p>
                <button
                  type="button"
                  onClick={handleTriggerSync}
                  disabled={isSyncing}
                  className="bg-slate-900 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-500 text-amber-450 font-bold text-[10px] uppercase tracking-wider font-mono py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 text-amber-500 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Sincronizando..." : "Executar Reconciliação Geral"}
                </button>
              </div>

            </div>

            {/* Logical Geographical Map and Nodes Metrics */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              
              {/* INTER-PROVINCIAL TOPOLOGY MAP (SVG ART) */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-amber-500" /> Topologia de Replicação Inter-Provincial
                  </h3>
                  <span className="text-[9px] text-slate-500 font-mono">Angola Backbone</span>
                </div>

                {/* SVG Visual Diagram */}
                <div className="bg-[#030508] border border-slate-900 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden h-60">
                  
                  {/* Grid Lines background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#090d16_1px,transparent_1px),linear-gradient(to_bottom,#090d16_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

                  <svg className="w-full h-full min-h-[190px] z-10" viewBox="0 0 320 200">
                    
                    {/* CONNECTION LINES (REPLICATION LINKS) */}
                    {/* Luanda ↔ Benguela */}
                    <line 
                      x1="120" y1="50" x2="80" y2="130" 
                      className={`stroke-2 ${
                        isLuandaFailed 
                          ? "stroke-rose-900/50 stroke-[1px] stroke-dasharray-[3,3]" 
                          : heartbeats["cloud-secondary"]?.latency > latencyAlertThreshold 
                          ? "stroke-amber-500/70" 
                          : "stroke-emerald-500/50"
                      }`} 
                    />

                    {/* Luanda ↔ Huambo */}
                    <line 
                      x1="120" y1="50" x2="190" y2="160" 
                      className={`stroke-2 ${
                        isLuandaFailed 
                          ? "stroke-rose-900/50 stroke-[1px] stroke-dasharray-[3,3]" 
                          : heartbeats["local-onpremise"]?.latency > latencyAlertThreshold 
                          ? "stroke-amber-500/70" 
                          : "stroke-emerald-500/50"
                      }`} 
                    />

                    {/* Benguela ↔ Huambo (Redundancy Standby link) */}
                    <line 
                      x1="80" y1="130" x2="190" y2="160" 
                      className={`stroke-2 ${
                        isLuandaFailed 
                          ? "stroke-amber-500 animate-[pulse_1.5s_infinite]" 
                          : "stroke-slate-800"
                      }`} 
                    />

                    {/* Luanda ↔ Viana */}
                    <line 
                      x1="120" y1="50" x2="150" y2="70" 
                      className={`stroke-2 ${
                        isLuandaFailed 
                          ? "stroke-rose-900/50 stroke-dasharray-[2,2]" 
                          : "stroke-sky-500/60"
                      }`} 
                    />

                    {/* ANIMATED PACKETS FLOW */}
                    {!isLuandaFailed && (
                      <>
                        {/* Luanda -> Benguela packet */}
                        <circle r="3" fill="#10b981" className="animate-[ping_2s_infinite]">
                          <animateMotion dur="3.5s" repeatCount="indefinite" path="M 120 50 L 80 130" />
                        </circle>
                        {/* Luanda -> Huambo packet */}
                        <circle r="3" fill="#10b981" className="animate-[ping_2.5s_infinite]">
                          <animateMotion dur="2.8s" repeatCount="indefinite" path="M 120 50 L 190 160" />
                        </circle>
                        {/* Luanda -> Viana packet */}
                        <circle r="2.5" fill="#0ea5e9">
                          <animateMotion dur="1.2s" repeatCount="indefinite" path="M 120 50 L 150 70" />
                        </circle>
                      </>
                    )}

                    {/* Backup packet: Benguela -> Huambo under Failover */}
                    {isLuandaFailed && (
                      <circle r="3" fill="#f59e0b" className="animate-pulse">
                        <animateMotion dur="1.8s" repeatCount="indefinite" path="M 80 130 L 190 160" />
                      </circle>
                    )}

                    {/* NODE PINS & LABELS */}
                    {/* LUANDA NODE */}
                    <g transform="translate(120,50)" className="cursor-pointer">
                      <circle r="7" className={isLuandaFailed ? "fill-red-950 stroke-red-500 stroke-2" : "fill-indigo-950 stroke-indigo-500 stroke-2"} />
                      <circle r="3" className={isLuandaFailed ? "fill-red-500" : "fill-indigo-400 animate-ping"} />
                      <text y="-12" textAnchor="middle" className="fill-slate-200 text-[8px] font-mono font-bold">LUANDA (Sede)</text>
                      <text y="15" textAnchor="middle" className="fill-slate-500 text-[6.5px] font-mono">
                        {isLuandaFailed ? "TIMEOUT" : `${heartbeats["cloud-primary"]?.latency || 12}ms`}
                      </text>
                    </g>

                    {/* VIANA NODE */}
                    <g transform="translate(150,70)" className="cursor-pointer">
                      <circle r="5" className={isLuandaFailed ? "fill-slate-900 stroke-slate-700" : "fill-sky-950 stroke-sky-400 stroke-2"} />
                      <text x="10" y="3" className="fill-slate-400 text-[7px] font-mono">Viana (Móvel)</text>
                    </g>

                    {/* BENGUELA NODE */}
                    <g transform="translate(80,130)" className="cursor-pointer">
                      <circle r="6" className="fill-indigo-950 stroke-indigo-500 stroke-2" />
                      <circle r="2" fill="#6366f1" />
                      <text x="-48" y="4" className="fill-slate-200 text-[8px] font-mono font-bold">BENGUELA</text>
                      <text y="14" textAnchor="middle" className="fill-slate-500 text-[6.5px] font-mono">
                        {heartbeats["cloud-secondary"]?.latency || 22}ms (DR)
                      </text>
                    </g>

                    {/* HUAMBO NODE */}
                    <g transform="translate(190,160)" className="cursor-pointer">
                      <circle r="6" className="fill-amber-950 stroke-amber-500 stroke-2" />
                      <circle r="2" fill="#f59e0b" />
                      <text x="10" y="4" className="fill-slate-200 text-[8px] font-mono font-bold">HUAMBO (EP)</text>
                      <text y="14" textAnchor="middle" className="fill-slate-500 text-[6.5px] font-mono">
                        {heartbeats["local-onpremise"]?.latency || 5}ms
                      </text>
                    </g>

                  </svg>

                  {/* Inter-provincial replication link status badges */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[8px] font-mono text-slate-500 z-20">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Luanda ⇆ Benguela: <strong className="text-slate-300">{isLuandaFailed ? "Offline" : "Streaming"}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Luanda ⇆ Huambo: <strong className="text-slate-300">{isLuandaFailed ? "Offline" : "Streaming"}</strong>
                      </span>
                    </div>
                    <span>Modo de Replicação: <strong className="text-amber-500 uppercase">{replicationPolicy === "realtime" ? "Síncrono (WAL)" : "Assíncrono"}</strong></span>
                  </div>

                </div>

                {/* Micro heartbeats telemetry table */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 flex flex-col gap-2 font-mono text-[9px]">
                  <div className="flex items-center justify-between border-b border-slate-950 pb-1.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Latência Inter-Provincial em Tempo Real</span>
                    <button
                      type="button"
                      onClick={triggerPingTest}
                      disabled={measuringIntegrity}
                      className="text-amber-500 hover:text-amber-400 flex items-center gap-1"
                    >
                      <RefreshCw className={`h-2.5 w-2.5 ${measuringIntegrity ? "animate-spin" : ""}`} />
                      Medir SLA
                    </button>
                  </div>
                  
                  {config?.nodes.map((node) => {
                    const modifiedNode = getModifiedNode(node);
                    const isOffline = modifiedNode.id === "cloud-primary" && isLuandaFailed;
                    const hb = heartbeats[node.id] || { latency: modifiedNode.latencyMs, packetLoss: 0 };
                    const isOverThreshold = !isOffline && hb.latency > latencyAlertThreshold;

                    return (
                      <div key={node.id} className="flex justify-between items-center py-1 border-b border-slate-950 last:border-0">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span className="text-slate-300">{node.name}</span>
                          <span className="text-[7.5px] bg-slate-950 text-slate-500 px-1 rounded">{node.ip}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">Perda: <strong className="text-slate-400">{hb.packetLoss}%</strong></span>
                          <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                            isOffline 
                              ? "bg-rose-950 text-rose-400 border border-rose-900/30" 
                              : isOverThreshold
                              ? "bg-amber-950 text-amber-400 border border-amber-900/40 animate-pulse"
                              : "bg-slate-950 text-emerald-400 border border-slate-900"
                          }`}>
                            {isOffline ? "TIMEOUT" : `${hb.latency} ms`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: FAILOVER DEFINITIONS */}
        {activePanelTab === "failover" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Failover Mode parameters */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-4">
                <div className="border-b border-slate-900 pb-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-amber-500" /> Política de Failover & Promoção
                  </h3>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Modo de Resiliência (Failover)</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFailoverMode("auto");
                        setFailoverHistory(p => [{ timestamp: new Date().toISOString(), event: "POLÍTICA ALTERADA: Failover automático reativado.", type: "info" }, ...p]);
                      }}
                      className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                        failoverMode === "auto"
                          ? "bg-amber-500/10 border-amber-500 text-amber-200 font-bold"
                          : "bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-800"
                      }`}
                    >
                      <Cpu className="h-4 w-4 mb-1 text-amber-500" />
                      <span className="text-[10px] font-sans">Automático</span>
                      <span className="text-[8px] font-mono text-slate-500">Auto-Promotion</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFailoverMode("manual");
                        setFailoverHistory(p => [{ timestamp: new Date().toISOString(), event: "POLÍTICA ALTERADA: Failover configurado em modo manual.", type: "info" }, ...p]);
                      }}
                      className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                        failoverMode === "manual"
                          ? "bg-amber-500/10 border-amber-500 text-amber-200 font-bold"
                          : "bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-800"
                      }`}
                    >
                      <Sliders className="h-4 w-4 mb-1 text-slate-400" />
                      <span className="text-[10px] font-sans">Manual</span>
                      <span className="text-[8px] font-mono text-slate-500">Aprovação Administrador</span>
                    </button>
                  </div>
                </div>

                {/* CRITÉRIOS DE PROMOÇÃO AUTOMÁTICA */}
                <div className="bg-slate-900/40 p-3.5 rounded-lg border border-slate-900/85 flex flex-col gap-3">
                  <span className="text-[9px] font-mono uppercase text-amber-500 font-black tracking-wider flex items-center gap-1">
                    ⚡ Regulamento de Promoção de Standby
                  </span>

                  <div className="flex flex-col gap-1.5 mt-0.5">
                    <label className="text-[9px] font-mono text-slate-400 uppercase">Estratégia de Eleição</label>
                    <select
                      value={promotionStrategy}
                      onChange={(e) => setPromotionStrategy(e.target.value as any)}
                      className="bg-slate-950 border border-slate-850 text-slate-300 text-xxs font-mono rounded px-2.5 py-1.5 w-full cursor-pointer focus:outline-none focus:border-amber-500"
                    >
                      <option value="priority">Prioridade de Fila (Precedência)</option>
                      <option value="latency">Menor Latência Física de Replicação</option>
                      <option value="packet-loss">Estabilidade de Ligação (Menor Perda)</option>
                    </select>
                    <span className="text-[8px] text-slate-550 font-mono leading-tight">
                      {promotionStrategy === "priority" 
                        ? "Promove o primeiro nó disponível na lista de prioridade abaixo." 
                        : promotionStrategy === "latency"
                        ? "Mede a latência em tempo real e promove o nó com ping mais veloz."
                        : "Elege o nó com menor perda de pacotes para evitar links instáveis."}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-slate-400">Tolerância Ping (Timeout)</span>
                        <span className="text-amber-500 font-bold">{failoverLatencyTrigger}ms</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="400"
                        step="10"
                        value={failoverLatencyTrigger}
                        onChange={(e) => setFailoverLatencyTrigger(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1 rounded bg-slate-950 mt-1 cursor-pointer"
                      />
                      <span className="text-[7.5px] text-slate-500 font-mono">Timeout individual por health-check</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-slate-400">Ciclos de Tolerância</span>
                        <span className="text-amber-500 font-bold">{consecutiveTimeoutsRequired} loops</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        value={consecutiveTimeoutsRequired}
                        onChange={(e) => setConsecutiveTimeoutsRequired(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1 rounded bg-slate-950 mt-1 cursor-pointer"
                      />
                      <span className="text-[7.5px] text-slate-500 font-mono">Tentativas falhadas consecutivas</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-850 p-2 rounded-lg flex justify-between items-center text-[8px] font-mono text-slate-400">
                    <span>Tempo Total de Carência:</span>
                    <strong className="text-amber-400">
                      {(failoverLatencyTrigger * consecutiveTimeoutsRequired).toLocaleString()}ms (~{((failoverLatencyTrigger * consecutiveTimeoutsRequired) / 1000).toFixed(1)}s)
                    </strong>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-900/60 pt-2.5">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-slate-350">Exigir Quorum de Consenso</span>
                      <span className="text-[7.5px] font-mono text-slate-550">Requer min. de 2 réplicas online para autorizar</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRequireQuorum(!requireQuorum)}
                      className={`px-2 py-0.5 rounded text-[8px] font-mono border font-black transition-all cursor-pointer ${
                        requireQuorum
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                          : "bg-slate-950 border-slate-850 text-slate-500"
                      }`}
                    >
                      {requireQuorum ? "ATIVADO" : "DESATIVADO"}
                    </button>
                  </div>
                </div>

                {/* DYNAMIC VISUAL ALERTS IF LATENCY EXCEEDS THRESHOLD */}
                {priorityOrder.some(id => {
                  const lat = heartbeats[id]?.latency || 0;
                  const isPrimaryOffline = id === "cloud-primary" && isLuandaFailed;
                  return !isPrimaryOffline && lat > failoverLatencyTrigger;
                }) && (
                  <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-lg flex items-start gap-2 animate-pulse">
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col text-left">
                      <span className="text-[9.5px] font-bold text-rose-300 font-mono uppercase tracking-wider">Aviso de Excesso de Latência no Health Check!</span>
                      <span className="text-[8px] text-slate-400 font-mono mt-0.5">
                        Um ou mais nós de leitura (Read-Replica) ultrapassaram o limite aceitável de <strong className="text-rose-400">{failoverLatencyTrigger}ms</strong>. Sinais vitais de sincronismo inter-provincial degradados.
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Virtual IP Address (VIP) de Gravação</label>
                  <input
                    type="text"
                    value={virtualIpAddress}
                    onChange={(e) => setVirtualIpAddress(e.target.value)}
                    className="bg-slate-900 border border-slate-850 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 w-full focus:outline-none focus:border-amber-500"
                    placeholder="e.g. 10.224.0.100"
                  />
                  <span className="text-[8.5px] text-slate-500 font-mono mt-1">
                    Clientes de 'pnap_db' usam este IP fixo para conectar. O cluster direciona o tráfego de escrita ao primário atual em tempo real.
                  </span>
                </div>

                {/* Standby priority ordering */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Ordem de Prioridade para Standby Ativo</label>
                    <span className="text-[7.5px] font-mono text-slate-500 uppercase">Ajuste a fila de eleição</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {priorityOrder.map((id, index) => {
                      const name = id === "cloud-secondary" ? "Benguela Backup Node (DR)" : id === "local-onpremise" ? "Huambo EP Local Node" : "Viana Móvel Híbrido";
                      const ip = id === "cloud-secondary" ? "10.224.2.15" : id === "local-onpremise" ? "192.168.42.10" : "192.168.50.8";
                      const latency = heartbeats[id]?.latency || 0;
                      const isOffline = id === "cloud-primary" && isLuandaFailed;
                      const isOverSla = !isOffline && latency > failoverLatencyTrigger;

                      return (
                        <div key={id} className={`bg-slate-900 border px-3 py-2.5 rounded-lg flex flex-col gap-1.5 text-xxs font-mono transition-all ${
                          isOverSla ? "border-rose-500/40 bg-rose-950/5 shadow-inner" : "border-slate-850 hover:border-slate-700"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${
                                index === 0 ? "bg-amber-500 text-slate-950" : "bg-slate-950 text-slate-400 border border-slate-800"
                              }`}>
                                {index + 1}º Candidato
                              </span>
                              <div>
                                <div className="text-slate-200 font-bold">{name}</div>
                                <div className="text-slate-550 text-[8px]">{ip}</div>
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleReorderStandby(index, "up")}
                                className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-20 text-slate-300 rounded border border-slate-850 cursor-pointer"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={index === priorityOrder.length - 1}
                                onClick={() => handleReorderStandby(index, "down")}
                                className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-20 text-slate-300 rounded border border-slate-850 cursor-pointer"
                              >
                                ▼
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-950 pt-1.5 text-[8.5px] font-mono">
                            <span className="text-slate-550 flex items-center gap-1">
                              Latência Atual: 
                              <strong className={`font-mono ${isOverSla ? "text-rose-400 font-bold" : "text-slate-300"}`}>
                                {latency}ms
                              </strong>
                            </span>
                            {isOverSla ? (
                              <span className="text-[7.5px] bg-rose-950 text-rose-400 border border-rose-500/20 px-1 py-0.2 rounded font-bold uppercase tracking-wider animate-pulse">
                                ⚠️ Excede SLA ({failoverLatencyTrigger}ms)
                              </span>
                            ) : (
                              <span className="text-[7.5px] text-emerald-400 bg-emerald-950/20 px-1 py-0.2 rounded border border-emerald-500/10 uppercase tracking-wider">
                                Saudável
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateConfig}
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-black text-xxs uppercase tracking-wider font-mono py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <Check className="h-3.5 w-3.5 text-slate-950" />
                  Salvar Definições de Failover
                </button>

              </div>

            </div>

            {/* Simulated Link Fail and Logs */}
            <div className="lg:col-span-7 flex flex-col gap-5">

              {/* REAL-TIME REPLICATION SYNC STATUS PANEL */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-3.5 text-left">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-mono uppercase text-amber-500 font-bold tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      Status de Sincronismo das Réplicas em Tempo Real
                    </span>
                    <h4 className="text-[10px] text-slate-400 font-sans">
                      Monitorização do Stream WAL (Write-Ahead Logging) do motor PostgreSQL
                    </h4>
                  </div>
                  <div className="text-right font-mono text-[9px] text-slate-500">
                    <div>WAL LSN Master:</div>
                    <div className="text-amber-500 font-bold font-mono text-[10px]">{walLsn}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {[
                    { id: "cloud-secondary", name: "Benguela-DR (Nó Secundário de Contingência)", ip: "10.224.2.15", location: "Província de Benguela" },
                    { id: "local-onpremise", name: "Huambo-EP (Cadeia Provincial)", ip: "192.168.42.10", location: "Província do Huambo" },
                    { id: "local-hybrid", name: "Viana-Móvel (Nó de Apoio Tático)", ip: "192.168.50.8", location: "Província de Luanda" }
                  ].map((rep) => {
                    const lag = replicaLag[rep.id] || { lagBytes: 0, lagSeconds: 0 };
                    const isOffline = isLuandaFailed && !promotedMasterId;
                    const isNodeMaster = promotedMasterId === rep.id;
                    
                    // Determine connection state status text and colors
                    let statusText = "Sincronizado";
                    let statusColor = "text-emerald-400 bg-emerald-950/30 border-emerald-500/20";
                    let lsnText = walLsn;

                    if (isOffline) {
                      statusText = "Timeout de Link";
                      statusColor = "text-rose-400 bg-rose-950/20 border-rose-500/10";
                      lsnText = "Indisponível";
                    } else if (isNodeMaster) {
                      statusText = "PROMOVIDO A MASTER";
                      statusColor = "text-slate-950 bg-amber-500 border-amber-400 font-extrabold";
                      lsnText = walLsn;
                    } else if (lag.lagBytes > 10000) {
                      statusText = "Catch-up (Atrasado)";
                      statusColor = "text-amber-400 bg-amber-950/20 border-amber-500/10 animate-pulse";
                      // calculate lagging LSN pointer
                      const parts = walLsn.split("/");
                      const offsetHex = (parseInt(parts[1], 16) - lag.lagBytes).toString(16).toUpperCase();
                      lsnText = `${parts[0]}/${offsetHex.padStart(8, '0')}`;
                    } else if (lag.lagBytes > 0) {
                      statusText = "Streaming (Lag Mínimo)";
                      statusColor = "text-sky-400 bg-sky-950/20 border-sky-500/10";
                    }

                    return (
                      <div key={rep.id} className="bg-slate-900/50 border border-slate-900 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-200">{rep.name}</span>
                            <span className="text-[8px] bg-slate-950 text-slate-500 font-mono px-1.5 py-0.2 rounded border border-slate-850">
                              {rep.ip}
                            </span>
                          </div>
                          <span className="text-[8px] font-mono text-slate-500 mt-0.5">{rep.location}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 sm:shrink-0 text-right">
                          <div className="flex flex-col items-end text-right font-mono text-xxs">
                            <span className="text-slate-500 text-[8px] uppercase">Replication WAL LSN</span>
                            <strong className="text-slate-300 font-mono">{lsnText}</strong>
                          </div>

                          <div className="flex flex-col items-end text-right font-mono text-xxs">
                            <span className="text-slate-500 text-[8px] uppercase">Atraso (LAG)</span>
                            <strong className={lag.lagBytes > 10000 ? "text-amber-400" : isOffline ? "text-rose-400" : "text-slate-300"}>
                              {isOffline ? "TIMEOUT" : isNodeMaster ? "0 MB (Nó Ativo)" : `${(lag.lagBytes / 1024).toFixed(1)} KB (${lag.lagSeconds}s)`}
                            </strong>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono border uppercase tracking-wider ${statusColor}`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-900/30 border border-slate-900 rounded-lg p-2.5 flex items-center justify-between text-[8px] font-mono text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Protocolo de Sincronismo: <strong className="text-slate-400">Streaming Assíncrono com WAL Log</strong>
                  </span>
                  <span>
                    Frequência de Envio: <strong className="text-slate-400">Tempo Real (Sub-segundo)</strong>
                  </span>
                </div>
              </div>
              
              {/* STRESS TEST / CRASH SIMULATOR CARD */}
              <div className={`p-4 rounded-xl border text-left transition-all ${
                isLuandaFailed 
                  ? "bg-rose-950/25 border-rose-900/50 shadow-inner" 
                  : "bg-slate-950 border-slate-850"
              } flex flex-col gap-4 shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ServerCrash className={`h-5 w-5 ${isLuandaFailed ? "text-rose-400 animate-pulse text-rose-500" : "text-slate-400"}`} />
                    <span className="text-xs font-mono font-black uppercase text-slate-200">
                      Dispositivo de Simulação de Contingência
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                    isLuandaFailed ? "bg-red-500/15 border border-red-500/30 text-red-400" : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  }`}>
                    {isLuandaFailed ? "Luanda em Falha" : "Sistema Normal"}
                  </span>
                </div>

                <p className="text-xxs text-slate-450 leading-relaxed">
                  Para auditar a conformidade de não-repúdio e resiliência militar do MININT, o sistema permite simular uma queda catastrófica de internet/fibra na sede em Luanda. Veja como as gravações biométricas e prontuários da base <strong>'pnap_db'</strong> continuam sem interrupções nos nós de contingência!
                </p>

                {/* HEARTBEAT TIMEOUT COUNTDOWN GRAPHICS */}
                {isLuandaFailed && !promotedMasterId && (
                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-2.5 text-left">
                    <div className="flex justify-between items-center text-xxs font-mono">
                      {failoverMode === "auto" ? (
                        <>
                          <span className="text-amber-500 font-bold flex items-center gap-1.5 animate-pulse">
                            <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />
                            Avaliando perda de link em Luanda...
                          </span>
                          <span className="text-slate-400">
                            {consecutiveTimeoutsCount} / {consecutiveTimeoutsRequired} loops
                          </span>
                        </>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                          AGUARDANDO ELEIÇÃO MANUAL
                        </span>
                      )}
                    </div>

                    {failoverMode === "auto" ? (
                      <div className="w-full bg-slate-955 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-amber-500 h-1.5 transition-all duration-300"
                          style={{ width: `${Math.min(100, (consecutiveTimeoutsCount / consecutiveTimeoutsRequired) * 100)}%` }}
                        />
                      </div>
                    ) : (
                      <p className="text-[9.5px] text-slate-400 font-sans leading-normal">
                        O monitoramento automático detectou a falha, mas a política exige que o administrador intervenha para forçar o failover seguro da base <strong>pnap_db</strong>.
                      </p>
                    )}
                  </div>
                )}

                {/* ACTIVE CONTINGENCY MASTER BANNER */}
                {promotedMasterId && (
                  <div className="bg-emerald-950/15 border border-emerald-500/30 p-3.5 rounded-lg flex flex-col gap-1 text-left">
                    <span className="text-[9px] font-mono uppercase text-emerald-400 font-black tracking-widest">
                      🚨 ESTADO DE CONTINGÊNCIA ATIVO
                    </span>
                    <span className="text-[10px] font-mono text-slate-200">
                      Nó secundário <strong className="text-emerald-400">'{promotedMasterId === "cloud-secondary" ? "Benguela-DR" : promotedMasterId === "local-onpremise" ? "Huambo-EP" : "Viana-Móvel"}'</strong> promovido automaticamente para Master.
                    </span>
                    <span className="text-[8.5px] text-slate-500 font-mono mt-1">
                      Virtual IP <strong>{virtualIpAddress}</strong> redirecionado. Operações de custódia e biometria continuam online.
                    </span>
                  </div>
                )}

                {/* MANUAL PROMOTION SELECTION CONTROL */}
                {isLuandaFailed && failoverMode === "manual" && !promotedMasterId && (
                  <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-lg flex flex-col gap-2.5 text-left">
                    <span className="text-[9.5px] font-mono uppercase text-amber-500 font-black">
                      🛠️ Painel de Intervenção Manual (Eleição de Standby)
                    </span>
                    <p className="text-[9.5px] text-slate-400 font-sans leading-relaxed">
                      Selecione um dos nós secundários disponíveis para assumir o papel de primário escritor:
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => executeAutomaticPromotion("cloud-secondary")}
                        className="bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 px-2 py-2 rounded text-[8.5px] font-mono text-indigo-300 font-black cursor-pointer transition-colors text-center"
                      >
                        Benguela-DR
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAutomaticPromotion("local-onpremise")}
                        className="bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 px-2 py-2 rounded text-[8.5px] font-mono text-amber-300 font-black cursor-pointer transition-colors text-center"
                      >
                        Huambo-EP
                      </button>
                      <button
                        type="button"
                        onClick={() => executeAutomaticPromotion("local-hybrid")}
                        className="bg-teal-950/40 hover:bg-teal-900/60 border border-teal-500/40 px-2 py-2 rounded text-[8.5px] font-mono text-teal-300 font-black cursor-pointer transition-colors text-center"
                      >
                        Viana-Móvel
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-900 mt-1">
                  <div className="text-[9px] font-mono">
                    <span className="text-slate-450">Nó Ativo para Escrita (Virtual IP):</span>
                    <div className="text-slate-100 font-bold text-xxs mt-0.5">
                      {!isLuandaFailed ? "Luanda-Central (10.224.2.10)" : promotedMasterId ? `${promotedMasterId === "cloud-secondary" ? "Benguela-DR (10.224.2.15)" : promotedMasterId === "local-onpremise" ? "Huambo-EP (192.168.42.10)" : "Viana-Móvel (192.168.50.8)"} [PROMOVIDO]` : "AGUARDANDO PROMOÇÃO"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleLuandaFailure}
                    className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase font-black tracking-wider transition-all cursor-pointer border active:scale-95 whitespace-nowrap ${
                      isLuandaFailed 
                        ? "bg-emerald-500 border-emerald-400 text-slate-950 font-extrabold hover:bg-emerald-400" 
                        : "bg-rose-950/40 border-rose-900/60 text-rose-300 hover:bg-rose-900/50"
                    }`}
                  >
                    {isLuandaFailed ? "Restaurar Link Primário" : "Simular Queda de Luanda"}
                  </button>
                </div>
              </div>

              {/* FAILOVER LOG AUDIT TRAIL */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-amber-500" /> Histórico de Resiliência & Auditoria VIP
                  </h3>
                  <span className="text-[8px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded font-mono">ONLINE DAEMON</span>
                </div>

                <div className="bg-[#030508] border border-slate-900 rounded-lg p-3 font-mono text-[9px] flex flex-col gap-2.5 max-h-56 overflow-y-auto">
                  {failoverHistory.map((h, i) => (
                    <div key={i} className="flex gap-2 items-start text-left leading-normal border-b border-slate-950 pb-2 last:border-0 last:pb-0">
                      <span className="text-slate-600 shrink-0">[{new Date(h.timestamp).toLocaleTimeString("pt-PT")}]</span>
                      <span className={`font-extrabold text-[8px] shrink-0 ${
                        h.type === "warning" ? "text-amber-500" : h.type === "success" ? "text-emerald-500" : "text-sky-500"
                      }`}>
                        {h.type === "warning" ? "[WARN]" : h.type === "success" ? "[OK]" : "[INFO]"}
                      </span>
                      <span className="text-slate-350">{h.event}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: LOAD BALANCING (pnap_db) */}
        {activePanelTab === "load-balancing" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Load Balancing Config Parameters */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-4">
                
                <div className="border-b border-slate-900 pb-2 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-amber-500" /> Configuração do Balanceador
                  </h3>
                  
                  <div className="flex items-center gap-1.5 select-none">
                    <span className="text-[8px] font-mono uppercase text-slate-500">Estado:</span>
                    <button
                      type="button"
                      onClick={() => setLoadBalancingEnabled(!loadBalancingEnabled)}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-mono border font-black cursor-pointer transition-colors ${
                        loadBalancingEnabled
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                          : "bg-slate-900 border-slate-800 text-slate-500"
                      }`}
                    >
                      {loadBalancingEnabled ? "ATIVADO" : "INATIVO"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Base de Dados Alvo</label>
                  <div className="bg-[#030508] border border-slate-900 p-2.5 rounded-lg text-amber-500 font-mono text-xs font-black">
                    pnap_db
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono">
                    O balanceador distribui as consultas de leitura e escrita especificamente para esta base unificada de controle de custódia.
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Algoritmo de Distribuição</label>
                  <select
                    disabled={!loadBalancingEnabled}
                    value={balancingAlgorithm}
                    onChange={(e) => setBalancingAlgorithm(e.target.value as any)}
                    className="bg-slate-900 border border-slate-850 text-slate-350 text-xxs font-mono rounded-lg px-3 py-2 w-full focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    <option value="read-only-offload">Read-Only Offloading (Luanda Escritor, Replicas Leitoras) — Recomendado</option>
                    <option value="round-robin">Round Robin Dinâmico (Soma de pesos proporcional)</option>
                    <option value="least-connections">Least Connections (Direcionar para nó com menor carga ativa)</option>
                  </select>
                  <span className="text-[8.5px] text-slate-500 font-mono mt-1 leading-normal">
                    {balancingAlgorithm === "read-only-offload" 
                      ? "O nó principal lida com 100% das escritas biométricas de pnap_db; as leituras de relatórios penais são offloaded para Benguela-DR e Huambo."
                      : balancingAlgorithm === "round-robin"
                      ? "Consultas são distribuídas em sequência linear ponderada por pesos para todos os nós operacionais ativos."
                      : "Distribuição dinâmica: as consultas são encaminhadas aos nós com melhor SLA de latência de resposta."
                    }
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400">Limite Máximo de Conexões Simultâneas</span>
                    <span className="text-amber-500 font-bold">{maxConnections} / pool</span>
                  </div>
                  <input
                    disabled={!loadBalancingEnabled}
                    type="range"
                    min="100"
                    max="1500"
                    step="50"
                    value={maxConnections}
                    onChange={(e) => setMaxConnections(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1 rounded bg-slate-900 mt-1 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* Weights tuners */}
                <div className="flex flex-col gap-2 bg-slate-900/40 p-3 rounded-lg border border-slate-900">
                  <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Pesos de Tráfego do Pool</span>
                  
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex justify-between items-center text-xxs font-mono">
                      <span className="text-slate-500">Sede Luanda-Central:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number" min="0" max="10" value={weightLuanda}
                          onChange={(e) => setWeightLuanda(Math.max(0, Number(e.target.value)))}
                          className="w-10 bg-slate-950 text-slate-100 text-center text-xxs p-0.5 rounded border border-slate-850"
                        />
                        <span className="text-slate-600">Weight</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xxs font-mono">
                      <span className="text-slate-500">Benguela-DR:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number" min="0" max="10" value={weightBenguela}
                          onChange={(e) => setWeightBenguela(Math.max(0, Number(e.target.value)))}
                          className="w-10 bg-slate-950 text-slate-100 text-center text-xxs p-0.5 rounded border border-slate-850"
                        />
                        <span className="text-slate-600">Weight</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xxs font-mono">
                      <span className="text-slate-500">Huambo-EP local:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number" min="0" max="10" value={weightHuambo}
                          onChange={(e) => setWeightHuambo(Math.max(0, Number(e.target.value)))}
                          className="w-10 bg-slate-950 text-slate-100 text-center text-xxs p-0.5 rounded border border-slate-850"
                        />
                        <span className="text-slate-600">Weight</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateConfig}
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-black text-xxs uppercase tracking-wider font-mono py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <Check className="h-3.5 w-3.5 text-slate-950" />
                  Gravar Balanceamento pnap_db
                </button>

              </div>

            </div>

            {/* Load Traffic Simulator Visualizer */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              
              {/* TRAFFIC SIMULATOR CONTROLS */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> Simulador de Carga de Tráfego Ativo
                  </h3>
                  
                  <div className="flex items-center gap-1.5 select-none">
                    <span className="text-[8.5px] font-mono text-slate-500 uppercase">Simular Alta Carga:</span>
                    <button
                      type="button"
                      onClick={() => setTrafficSimulationEnabled(!trafficSimulationEnabled)}
                      className={`px-2 py-0.5 rounded text-[8.5px] font-mono border font-black transition-all cursor-pointer ${
                        trafficSimulationEnabled
                          ? "bg-amber-500/25 border-amber-500 text-amber-400 animate-pulse"
                          : "bg-slate-900 border-slate-800 text-slate-400"
                      }`}
                    >
                      {trafficSimulationEnabled ? "ATIVADO (Alta Carga)" : "DESATIVADO"}
                    </button>
                  </div>
                </div>

                <p className="text-xxs text-slate-450 leading-relaxed">
                  Injete uma carga fictícia no pool de conexões da base <strong>'pnap_db'</strong> para testar o rebalanceamento dinâmico. Em modo Alta Carga, o simulador dispara consultas simultâneas na rede do Ministério do Interior (MININT).
                </p>

                {/* QPS Count and load bar metrics */}
                <div className="bg-[#030508] p-3 rounded-lg border border-slate-900 flex justify-between items-center font-mono">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 uppercase">Queries / Segundo Ativas</span>
                    <span className={`text-lg font-black ${trafficSimulationEnabled ? "text-amber-500" : "text-emerald-400"}`}>
                      {simulatedQps} QPS
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-500 uppercase">Estado da Fila de Pool</span>
                    <div className="text-xxs font-bold text-slate-300 mt-1">
                      {trafficSimulationEnabled ? "8 Conexões em Quarentena / OK" : "Pool Saudável (0 no buffer)"}
                    </div>
                  </div>
                </div>
              </div>

              {/* BAR VISUAL GRAPH OF QPS DISTRIBUTION */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-amber-500" /> Distribuição de Carga Ativa no Cluster
                  </h3>
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase">
                    Algoritmo: <strong className="text-slate-300">{balancingAlgorithm.toUpperCase()}</strong>
                  </span>
                </div>

                {/* Dynamic splitting bar */}
                <div className="flex h-6 w-full rounded-lg overflow-hidden border border-slate-900 select-none">
                  {trafficDistribution.map((dist, i) => {
                    if (dist.percentage === 0) return null;
                    const colors = ["bg-indigo-600", "bg-sky-500", "bg-amber-500", "bg-teal-500"];
                    const col = colors[i % colors.length];
                    return (
                      <div 
                        key={dist.id} 
                        className={`${col} h-full transition-all duration-700 flex items-center justify-center text-slate-950 text-[9px] font-bold`}
                        style={{ width: `${dist.percentage}%` }}
                        title={`${dist.id}: ${dist.qps} QPS (${dist.percentage}%)`}
                      >
                        {dist.percentage > 10 && `${dist.percentage}%`}
                      </div>
                    );
                  })}
                  {trafficDistribution.every(d => d.percentage === 0) && (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[9px] font-mono text-slate-500 italic">
                      Balanceador inativo ou todos os nós em quarentena
                    </div>
                  )}
                </div>

                {/* Detailed per-node connection load stats */}
                <div className="flex flex-col gap-2 mt-1">
                  {trafficDistribution.map((dist, i) => {
                    const rawNode = config?.nodes.find(n => n.id === dist.id) || { name: dist.id, ip: "0.0.0.0" };
                    const isOffline = dist.id === "cloud-primary" && isLuandaFailed;
                    const colors = ["bg-indigo-500", "bg-sky-400", "bg-amber-500", "bg-teal-400"];
                    const dotCol = colors[i % colors.length];

                    return (
                      <div key={dist.id} className="bg-slate-900/40 border border-slate-900/80 p-2.5 rounded-lg flex items-center justify-between font-mono text-xxs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isOffline ? "bg-slate-700 animate-pulse" : dotCol}`} />
                          <div>
                            <span className={`font-bold ${isOffline ? "text-slate-500 line-through" : "text-slate-200"}`}>{rawNode.name}</span>
                            <span className="text-[8px] text-slate-500 ml-1.5">({rawNode.ip})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-slate-500">QPS: <strong className={isOffline ? "text-slate-600" : "text-slate-350"}>{dist.qps} /s</strong></span>
                          <span className="text-slate-500">Conexões Ativas: <strong className={isOffline ? "text-slate-600" : "text-slate-300"}>{dist.conns}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex gap-2 items-start text-[9.5px] text-amber-400/80 leading-normal font-sans shadow-inner select-none">
                  <HelpCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>SOBRE O POOL DA BASE 'pnap_db':</strong> O algoritmo offloading garante que escritas críticas (inserção de reclusos, alterações de vigilância) tenham exclusividade no link primário. Benguela e Huambo absorvem o estresse de buscas por biometria e consultas de rotina provincial.
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* DYNAMIC EMERGENCY ACTION & LOGS LIST */}
      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-3.5 text-left">
        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-amber-500" /> Detalhes Físicos dos Nós no Cluster
          </h3>
          <span className="text-[9px] text-slate-500 font-mono">Topologia Física Ativa</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {config?.nodes.map((rawNode) => {
            const node = getModifiedNode(rawNode);
            const isPrimaryOffline = node.id === "cloud-primary" && isLuandaFailed;
            const isSyncingNode = node.status === "syncing" || isSyncing;
            const isActive = config.activeInstance === node.id || (node.id === promotedStandbyActive() && isLuandaFailed);

            return (
              <div
                key={node.id}
                className={`p-3 rounded-lg border transition-all relative overflow-hidden ${
                  isActive
                    ? "bg-amber-500/5 border-amber-500/40 shadow-sm"
                    : "bg-slate-900 border-slate-850/60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      {node.type === "cloud" ? (
                        <Globe className="h-3 w-3 text-sky-450" />
                      ) : (
                        <Server className="h-3 w-3 text-indigo-400" />
                      )}
                      <span className="text-[10px] font-bold text-slate-200 truncate pr-1" title={node.name}>
                        {node.name}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-0.5">{node.ip}</span>
                  </div>

                  {/* Status indicator */}
                  <span className="shrink-0 flex items-center">
                    {isSyncingNode ? (
                      <RefreshCw className="h-3 w-3 text-amber-500 animate-spin" />
                    ) : !isPrimaryOffline ? (
                      <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <WifiOff className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                    )}
                  </span>
                </div>

                <div className="mt-3.5 flex justify-between items-center text-[9px] font-mono border-t border-slate-950/60 pt-2 text-slate-400">
                  <div className="flex flex-col">
                    <span className="text-slate-550 uppercase text-[7px]">Latência</span>
                    <strong className={node.latencyMs > 200 ? "text-red-400" : node.latencyMs > 25 ? "text-amber-450" : "text-emerald-400"}>
                      {isPrimaryOffline ? "TIMEOUT" : `${heartbeats[node.id]?.latency || node.latencyMs}ms`}
                    </strong>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-slate-550 uppercase text-[7px]">Fichas Penais</span>
                    <strong className="text-slate-200">{(node.recordsCount + (isLuandaFailed && node.id === promotedStandbyActive() ? 48 : 0)).toLocaleString()}</strong>
                  </div>
                </div>

                {isActive && (
                  <div className="absolute top-0 right-0">
                    <span className="bg-amber-500 text-slate-950 text-[6.5px] font-black uppercase px-1.5 py-0.2 tracking-widest rounded-bl shadow-sm">
                      {isLuandaFailed && node.id === promotedStandbyActive() ? "FAILOVER ATIVO" : "PRINCIPAL"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* REPLICATION LOGGER (TERMINAL STYLE) */}
      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-amber-500" /> Consola de Auditoria e Logs de Replicação (pnap_db Trail)
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] text-slate-500 font-mono uppercase">Varredor Ativo</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-3 font-mono text-[9.5px] text-slate-400 flex flex-col gap-3 max-h-48 overflow-y-auto">
          {config?.history.map((log) => {
            const isSuccess = log.status === "SUCCESS";
            const isWarning = log.status === "WARNING";
            
            return (
              <div key={log.id} className="border-b border-slate-900 pb-2.5 last:border-0 last:pb-0 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-500 font-bold">[{log.id}]</span>
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleString("pt-PT")}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="bg-slate-900 border border-slate-800 px-1 py-0.2 rounded text-slate-400 font-bold uppercase text-[7.5px]">
                      {log.sourceNode} <ArrowRight className="h-2 w-2 inline mx-0.5" /> {log.targetNode}
                    </span>
                    <span className={`px-1 rounded font-bold uppercase text-[7.5px] ${
                      isSuccess ? "bg-emerald-950 text-emerald-400" : isWarning ? "bg-amber-950 text-amber-400" : "bg-red-950 text-red-400"
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>

                <p className="mt-1.5 text-slate-300 leading-normal text-xxs">
                  {log.details}
                </p>
                <div className="mt-1 text-[8.5px] text-slate-500 flex items-center gap-1">
                  <CornerDownRight className="h-2.5 w-2.5 text-slate-600 shrink-0" />
                  <span>Registos incorporados nesta sincronização: <strong className="text-slate-350">{log.recordsTransferred} fichas penais</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-900/65 text-[8.5px] font-mono text-slate-500 flex justify-between items-center">
          <span>Última reconciliação bem-sucedida: <strong className="text-slate-350">{config ? new Date(config.lastSyncTime).toLocaleTimeString("pt-PT") : "Não disponível"}</strong></span>
          <span>Assinatura de Integridade de Hash: <strong className="text-emerald-400">SHA-256 CORRETO</strong></span>
        </div>
      </div>

      {/* FLOATING TOASTS */}
      <AnimatePresence>
        {panelToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900/95 border border-amber-500/40 text-slate-100 rounded-xl p-4 shadow-2xl backdrop-blur-md flex flex-col gap-1 text-left"
          >
            <div className="flex justify-between items-start gap-4">
              <span className="text-xxs font-mono text-amber-500 font-bold tracking-wider uppercase flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                {panelToast.title}
              </span>
              <button
                type="button"
                onClick={() => setPanelToast(null)}
                className="text-slate-500 hover:text-slate-300 text-xxs cursor-pointer font-bold font-mono px-1.5 py-0.5 bg-slate-950/40 hover:bg-slate-950 rounded border border-slate-800 transition-colors"
              >
                ✖
              </button>
            </div>
            <p className="text-[10px] text-slate-300 font-mono leading-normal mt-1.5">
              {panelToast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
