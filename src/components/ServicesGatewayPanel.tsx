import React, { useState, useEffect } from "react";
import { eventBus } from "../utils/eventBus";
import {
  Server,
  Activity,
  Shield,
  UserCheck,
  Heart,
  Truck,
  Bell,
  Users,
  Building,
  Cpu,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Play,
  Database,
  ArrowRight,
  Code,
  Terminal,
  Globe,
  CornerDownRight,
  Sliders,
  Zap,
  ArrowUpDown,
  Lock,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  Send,
  Check,
  Share2,
  HelpCircle,
  Scale,
  Crown,
  FileText,
  Eye,
  BookOpen,
  Fingerprint,
  Compass,
  ShieldCheck
} from "lucide-react";

interface ServicesGatewayPanelProps {
  currentOperator: any;
  prisons: any[];
}

export default function ServicesGatewayPanel({ currentOperator, prisons }: ServicesGatewayPanelProps) {
  // Main Sub-Tab State: 'kernel' (new AIOS Engine Console), 'postgres' (PostgreSQL cluster) or 'services' (microservices)
  const [activeSubTab, setActiveSubTab] = useState<"postgres" | "services" | "kernel">("kernel");

  // AIOS Kernel - Capability Map State
  const [selectedCapability, setSelectedCapability] = useState<string>("all");

  // AIOS Kernel - Event Bus State
  const [eventFilter, setEventFilter] = useState<string>("ALL");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [customEventType, setCustomEventType] = useState<string>("RECLUSO_ADMITIDO");
  const [customEventMsg, setCustomEventMsg] = useState<string>("");
  const [customEventPriority, setCustomEventPriority] = useState<string>("NORMAL");

  const [eventStream, setEventStream] = useState<any[]>(() => eventBus.getHistory());

  useEffect(() => {
    // Initial sync
    setEventStream(eventBus.getHistory());

    // Subscribe to all event dispatches
    const unsubscribe = eventBus.subscribeAll((event) => {
      setEventStream(eventBus.getHistory());
    });

    return () => unsubscribe();
  }, []);

  // AIOS Kernel - Object Pipeline State
  const [selectedPipelineObject, setSelectedPipelineObject] = useState<"recluso" | "cela">("recluso");
  const [selectedPipelineService, setSelectedPipelineService] = useState<string>("transferir");
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [isPipelineRunning, setIsPipelineRunning] = useState<boolean>(false);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);

  // AIOS Kernel - Cognitive Command State
  const [cognitiveQuery, setCognitiveQuery] = useState<string>("");
  const [parsingQuery, setParsingQuery] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<any>(null);

  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    topology: false,
    latency: false,
    failover: false,
    loadbalancer: false,
    journal: false,
    telemetryHud: false,
    servicesGrid: false,
    simulator: false,
    promotionRules: false,
    disasterAlerts: false
  });

  // General telemetry state
  const [telemetry, setTelemetry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simulation state for microservices
  const [activeSimulator, setActiveSimulator] = useState<string>("Identity");
  const [simResponse, setSimResponse] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Microservices Simulator inputs
  const [simEmail, setSimEmail] = useState<string>("maria.kiala@governo.ao");
  const [simPassword, setSimPassword] = useState<string>("Trumanmarcelo_1983");
  const [simIncidentType, setSimIncidentType] = useState<string>("Fuga");
  const [simIncidentDetails, setSimIncidentDetails] = useState<string>("Tentativa de escalada detectada no Bloco H1-A do Huambo.");
  const [simSelectedPrison, setSimSelectedPrison] = useState<string>("PRIS-HUAMBO");

  // ==========================================
  // POSTGRESQL CLUSTER SIMULATOR STATES
  // ==========================================
  const [isAutoFailover, setIsAutoFailover] = useState<boolean>(true);
  const [failoverTimeout, setFailoverTimeout] = useState<number>(12); // seconds
  const [lbAlgorithm, setLbAlgorithm] = useState<"round-robin" | "least-connections" | "latency-based">("least-connections");
  const [activeConnections, setActiveConnections] = useState<number>(342);
  const [isSimulatingFailover, setIsSimulatingFailover] = useState<boolean>(false);
  const [isNetworkFluctuating, setIsNetworkFluctuating] = useState<boolean>(false);

  // REGULAMENTO DE FAILOVER E REGRAS DE PROMOÇÃO DE NÓS SECUNDÁRIOS
  const [promotionPriorities, setPromotionPriorities] = useState<Record<string, number>>({
    "node-2": 1, // Luanda (Alta prioridade)
    "node-3": 2, // Benguela
    "node-4": 3, // Huambo
    "node-5": 4, // Cabinda
    "node-6": 5  // Moxico
  });
  const [maxAllowedLagMb, setMaxAllowedLagMb] = useState<number>(64);
  const [promotionStrategy, setPromotionStrategy] = useState<"priority" | "latency">("priority");
  const [requireQuorum, setRequireQuorum] = useState<boolean>(true);

  // CANAIS DE ALERTA DE DESASTRE EM TEMPO REAL
  const [alertChannels, setAlertChannels] = useState({
    sms: true,
    email: true,
    siren: true,
    webhook: false
  });
  const [alertPhone, setAlertPhone] = useState("+244 923 881 120");
  const [alertEmail, setAlertEmail] = useState("emergencia.infra@minint.gov.ao");
  const [disasterWebhook, setDisasterWebhook] = useState("https://backoffice.minint.gov.ao/api/v1/disaster");
  const [activeDisaster, setActiveDisaster] = useState<any>(null);
  
  // Provincial Replication Latencies (in milliseconds)
  const [latencies, setLatencies] = useState({
    luandaLocal: 0.4,
    benguela: 24,
    huambo: 42,
    cabinda: 78,
    moxico: 114
  });

  // Load balancing weights for read queries
  const [weights, setWeights] = useState({
    replicaLuanda: 100,
    replicaBenguela: 80,
    replicaHuambo: 70,
    replicaCabinda: 40,
    replicaMoxico: 20
  });

  // Live cluster nodes
  const [nodes, setNodes] = useState([
    { id: "node-1", name: "pg-master-01.pnap.ao", ip: "10.0.1.10", role: "PRIMARY (READ-WRITE)", status: "ONLINE", connections: 112, type: "master" },
    { id: "node-2", name: "pg-replica-luanda-02.pnap.ao", ip: "10.0.1.11", role: "REPLICA (READ-ONLY)", status: "ONLINE", connections: 58, type: "local-replica" },
    { id: "node-3", name: "pg-replica-benguela-03.pnap.ao", ip: "10.0.2.12", role: "REPLICA (READ-ONLY)", status: "ONLINE", connections: 64, type: "provincial-replica" },
    { id: "node-4", name: "pg-replica-huambo-04.pnap.ao", ip: "10.0.3.13", role: "REPLICA (READ-ONLY)", status: "ONLINE", connections: 45, type: "provincial-replica" },
    { id: "node-5", name: "pg-replica-cabinda-05.pnap.ao", ip: "10.0.4.14", role: "REPLICA (READ-ONLY)", status: "ONLINE", connections: 38, type: "provincial-replica" },
    { id: "node-6", name: "pg-replica-moxico-06.pnap.ao", ip: "10.0.5.15", role: "REPLICA (READ-ONLY)", status: "ONLINE", connections: 25, type: "provincial-replica" }
  ]);

  // System audit logs for database cluster events
  const [clusterLogs, setClusterLogs] = useState<Array<{ timestamp: string; level: "INFO" | "WARN" | "SUCCESS" | "CRITICAL"; msg: string }>>([
    { timestamp: "08:12:04", level: "INFO", msg: "Iniciando monitoramento de batimento cardíaco (Heartbeat) do Cluster 'pnap_db'..." },
    { timestamp: "08:12:05", level: "SUCCESS", msg: "Conexão com base central 'pnap_db' em pg-master-01 estabelecida com sucesso." },
    { timestamp: "08:12:07", level: "INFO", msg: "Replicas inter-provinciais registadas via túnel MPLS-MININT seguro." },
    { timestamp: "08:12:12", level: "INFO", msg: "Balanceador de carga (haproxy-pg) configurado no modo 'least-connections'." }
  ]);

  const addClusterLog = (level: "INFO" | "WARN" | "SUCCESS" | "CRITICAL", msg: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setClusterLogs(prev => [{ timestamp: timeStr, level, msg }, ...prev.slice(0, 49)]);
  };

  // Fetch telemetry from gateway API (Standard Microservices)
  const fetchTelemetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/backoffice/telemetry");
      const json = await res.json();
      if (json.success && json.diagnostics) {
        setTelemetry(json.diagnostics);
      } else {
        throw new Error(json.message || "Falha ao ler os diagnósticos da API.");
      }
    } catch (e: any) {
      setError(e.message || "Erro de ligação ao Gateway API central.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Automated background event generation to simulate a live event-driven bus
  useEffect(() => {
    const interval = setInterval(() => {
      const eventTypes = [
        { type: "DIGITAL_TWIN_SYNC", priority: "NORMAL", category: "SISTEMA", source: "DigitalTwin", operator: "Automático (Cron)", message: "Sincronização fiduciária concluída: Cela H1-Pavilhão B (EP Huambo) atualizada.", payload: { cellId: "CELA-H1", occupancyRate: "80%", status: "OPTIMIZED" } },
        { type: "REAVALIACAO_RISCO", priority: "HIGH", category: "INTELIGÊNCIA", source: "AIService", operator: "AI Engine Predictor", message: "Risco recalculado para Bento Cafala: nível mantido em MÉDIO com confiança de 94.2%.", payload: { calculatedScore: 38, riskRating: "MEDIO", confidence: "94.2%" } },
        { type: "INCIDENTE_MINIMO", priority: "NORMAL", category: "SEGURANÇA", source: "SecurityService", operator: "Supervisor Huambo", message: "Ronda perimetral de rotina concluída com assinatura biométrica do chefe de bloco.", payload: { block: "Bloco C", status: "CLEARED" } },
        { type: "CONEXAO_RESTABELECIDA", priority: "HIGH", category: "SISTEMA", source: "NetworkGateway", operator: "SysAdmin MININT", message: "Link MPLS redundante de Benguela reestabelecido com sucesso. Latência em 24ms.", payload: { channel: "MPLS_FIBRE", currentLatency: "24ms" } }
      ];

      const chosenEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const randomID = Math.floor(1000 + Math.random() * 9000);

      const newEvent = {
        id: `EVT-2026-${randomID}`,
        timestamp: timeStr,
        ...chosenEvent,
        auditHash: "SHA256-" + Math.random().toString(16).substring(2, 10).toUpperCase() + Math.random().toString(16).substring(2, 10).toUpperCase()
      };

      setEventStream(prev => [newEvent, ...prev.slice(0, 24)]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Run a microservice simulation request
  const runSimulation = async (serviceName: string) => {
    setIsSimulating(true);
    setSimResponse(null);

    setTimeout(async () => {
      try {
        switch (serviceName) {
          case "Identity":
            const authRes = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: simEmail, senha: simPassword })
            });
            const authJson = await authRes.json();
            setSimResponse(authJson);
            break;

          case "Security":
            setSimResponse({
              service: "SecurityService",
              action: "LOG_INCIDENT",
              status: "SUCCESS_COMPLIANT",
              severity: "CRITICAL",
              timestamp: new Date().toISOString(),
              payload: {
                event: `INCIDENTE_${simIncidentType.toUpperCase()}`,
                unitId: simSelectedPrison,
                reportedBy: currentOperator.name,
                evidenceDetails: simIncidentDetails,
                forensicHash: "sha256-a4fbc82b99c82c6114a8"
              }
            });
            break;

          case "Audit":
            setSimResponse({
              service: "AuditService",
              action: "GENERATE_FORENSIC_TRAIL",
              status: "COMPLIANT_SECURE",
              logsInspected: 148,
              militarCrest: "PNAP-MININT-AO",
              cryptographicSignature: "0x889a74cf8100fbc923dd445100aa7fbb",
              sample: {
                operator: currentOperator.name,
                role: currentOperator.role,
                ipAddress: "192.168.42.115",
                action: "VIEW_TELEMETRY",
                reason: "Auditoria regulamentar do Gateway de Microsserviços"
              }
            });
            break;

          case "Health":
            setSimResponse({
              service: "HealthService",
              action: "EVALUATE_CLINICAL_COMPLIANCE",
              status: "AUTHORIZED",
              totalActiveProntuarios: 42,
              medicationStocks: "ESTÁVEL",
              alertStatus: "VERDE",
              militarProtocol: "Regulamento de Saúde Penitenciária de Angola (Lei 8/08)"
            });
            break;

          case "Transfer":
            setSimResponse({
              service: "TransferService",
              action: "PLAN_MILITARY_ESCORT",
              guideNumber: `GT-${Math.floor(100000 + Math.random() * 900000)}`,
              approvedBy: "Sub-Comissário António Bento",
              status: "READY_FOR_DEPLOYMENT",
              escortPersonnel: "6 Fuzileiros da Polícia de Intervenção Rápida (PIR)",
              restrictions: "Recluso de perigosidade MÁXIMA sob algemas triplas e transporte blindado."
            });
            break;

          case "Notification":
            setSimResponse({
              service: "NotificationService",
              action: "DISPATCH_EMERGENCY_ALERTS",
              status: "DISPATCHED",
              recipients: [
                { role: "Diretor Geral", media: "SMS", status: "DELIVERED" },
                { role: "Comandante Operacional Luanda", media: "EMAIL", status: "SENT" },
                { role: "Guarda de Turno", media: "INTERNAL_HUD", status: "ACKNOWLEDGED" }
              ],
              content: `ALERTA DE SEGURANÇA MÁXIMA: Movimentação não autorizada detetada no perímetro externo.`
            });
            break;

          case "HR":
            setSimResponse({
              service: "HRService",
              action: "AUDIT_OPERATOR_RANKS",
              totalOperatives: 12,
              complianceStatus: "100% REGULARIZADO",
              activeOfficer: {
                nip: currentOperator.funcionarioId || "NIP-990011",
                name: currentOperator.name,
                patente: currentOperator.patente || "Comissário-Geral",
                permissionsGranted: ["VIEW_AUDITING", "ADMINISTRATE_GEO", "ADMIT_INMATE"]
              }
            });
            break;

          case "Prison":
            const selectedPr = prisons.find(p => p.id === simSelectedPrison) || prisons[0];
            const cap = selectedPr ? (selectedPr.operationalCapacity || selectedPr.limiteOperativo) : 500;
            const occ = selectedPr ? (selectedPr.currentOccupancy || 450) : 480;
            const rate = Math.round((occ / cap) * 100);
            
            setSimResponse({
              service: "PrisonService",
              action: "CAPACITY_THRESHOLD_CHECK",
              unit: selectedPr?.name || "Unidade Prisional",
              results: {
                capacity: cap,
                occupancy: occ,
                occupancyRate: `${rate}%`,
                isOvercrowded: rate > 100,
                alertLevel: rate > 110 ? "CRITICAL" : rate > 100 ? "WARNING" : "NORMAL"
              }
            });
            break;

          case "AI":
            const prsObj = prisons.find(p => p.id === simSelectedPrison) || prisons[0];
            const occNum = prsObj ? prsObj.currentOccupancy : 300;
            const capNum = prsObj ? prsObj.operationalCapacity : 250;
            const ratio = occNum / capNum;
            const score = Math.min(100, Math.round(ratio * 75));
            
            setSimResponse({
              service: "AIService",
              action: "PREDICTIVE_STABILITY_FORECAST",
              algorithm: "Markov Chain Custody Transition v4.1",
              targetUnit: prsObj?.name || "Unidade Prisional",
              forecast: {
                rebellionProbability: ratio > 1.1 ? "42% (ALTO)" : "8% (BAIXO)",
                expectedOccupancyNextMonth: Math.round(occNum * 1.05),
                riskScore: score,
                actionRecommendation: ratio > 1.0 ? "ATIVAR TRANSFERÊNCIA DE CUSTÓDIA IMEDIATA VIA TRANSFER_SERVICE" : "MANTER PROTOCOLO ORDINÁRIO"
              }
            });
            break;

          default:
            setSimResponse({ error: "Serviço desconhecido." });
        }
      } catch (err: any) {
        setSimResponse({ error: "Erro na chamada do microsserviço.", details: err.message });
      } finally {
        setIsSimulating(false);
      }
    }, 600);
  };

  // ==========================================
  // POSTGRESQL SIMULATION FUNCTIONS
  // ==========================================
  
  // Trigger replication latency fluctuation
  const triggerNetworkFluctuation = () => {
    setIsNetworkFluctuating(true);
    addClusterLog("WARN", "Simulando flutuação atmosférica / oscilação nos canais de micro-ondas inter-provinciais...");

    setTimeout(() => {
      const newBenguela = Math.round(18 + Math.random() * 15);
      const newHuambo = Math.round(35 + Math.random() * 20);
      const newCabinda = Math.round(65 + Math.random() * 95); // High spike possible
      const newMoxico = Math.round(95 + Math.random() * 120); // Satellite latency spikes

      setLatencies({
        luandaLocal: 0.3 + Math.random() * 0.2,
        benguela: newBenguela,
        huambo: newHuambo,
        cabinda: newCabinda,
        moxico: newMoxico
      });

      // Calculate new query weights dynamically based on latency (higher latency -> lower weight)
      setWeights({
        replicaLuanda: 100,
        replicaBenguela: newBenguela > 30 ? 60 : 90,
        replicaHuambo: newHuambo > 50 ? 40 : 70,
        replicaCabinda: newCabinda > 110 ? 10 : newCabinda > 80 ? 25 : 50,
        replicaMoxico: newMoxico > 180 ? 5 : newMoxico > 130 ? 15 : 30
      });

      if (newCabinda > 120 || newMoxico > 180) {
        addClusterLog("CRITICAL", `Latência inter-provincial CRÍTICA detetada na réplica Moxico (${newMoxico}ms) e Cabinda (${newCabinda}ms). Balanceador restringindo tráfego.`);
      } else {
        addClusterLog("SUCCESS", "Latências recalculadas. Pesos de balanceamento ('pnap_db') ajustados dinamicamente para priorizar réplicas locais estáveis.");
      }

      setIsNetworkFluctuating(false);
    }, 1000);
  };

  // Forçar Failover Manual com Inteligência de Promoção e Alertas de Desastre
  const forceManualFailover = () => {
    if (isSimulatingFailover) return;
    setIsSimulatingFailover(true);

    const activeAlerts: string[] = [];
    if (alertChannels.sms) activeAlerts.push(`SMS enviado para ${alertPhone}`);
    if (alertChannels.email) activeAlerts.push(`E-mail enviado para ${alertEmail}`);
    if (alertChannels.webhook) activeAlerts.push(`Webhook POST para ${disasterWebhook}`);
    if (alertChannels.siren) activeAlerts.push("Sirene Digital de Alta Prioridade Ativada");

    // Ativar o Alerta de Desastre em Tempo Real na UI
    setActiveDisaster({
      id: `DIS-${Math.floor(1000 + Math.random() * 9000)}`,
      title: "QUEDA SEVERA DO INFRAESTRUTURA POSTGRESQL CENTRAL",
      timestamp: new Date().toLocaleTimeString(),
      originalMaster: "pg-master-01.pnap.ao (10.0.1.10)",
      affectedServices: ["Identity Service", "Security Service", "Prison Service", "Audit Service"],
      status: "ATALHO CRÍTICO",
      sirenOn: alertChannels.siren,
      triggeredChannels: activeAlerts,
      details: "O nó principal pg-master-01 parou de emitir batimentos cardíacos. O Gateway iniciou a eleição baseada no regulamento de segurança carcerária do MININT."
    });

    addClusterLog("CRITICAL", "⚠️ [ALERTA DE DESASTRE] FALHA DETETADA NO NÓ MASTER pg-master-01.pnap.ao!");
    if (activeAlerts.length > 0) {
      addClusterLog("WARN", `📢 Alertas de emergência despachados via: ${activeAlerts.join(", ")}`);
    }

    // Passo 1: Desligar o Master pg-master-01
    setTimeout(() => {
      setNodes(prev => prev.map(node => {
        if (node.id === "node-1") {
          return { ...node, status: "OFFLINE", connections: 0, role: "FAILED (MASTER_OFFLINE)" };
        }
        return node;
      }));
      addClusterLog("WARN", "🔴 pg-master-01.pnap.ao (10.0.1.10) offline. Iniciando processo de consenso com base nas regras de promoção...");
    }, 1000);

    // Passo 2: Avaliar e Eleger a réplica correta
    setTimeout(() => {
      // Simulação de lags em MB para cada réplica secundária
      const replicaLags: Record<string, number> = {
        "node-2": 0.2, // Luanda
        "node-3": 2.4, // Benguela
        "node-4": 8.1, // Huambo
        "node-5": 54.2, // Cabinda
        "node-6": 128.5 // Moxico
      };

      // Candidatos a master
      const candidates = [
        { id: "node-2", name: "pg-replica-luanda-02.pnap.ao", ip: "10.0.1.11", lag: replicaLags["node-2"], latency: latencies.luandaLocal, priority: promotionPriorities["node-2"] },
        { id: "node-3", name: "pg-replica-benguela-03.pnap.ao", ip: "10.0.2.12", lag: replicaLags["node-3"], latency: latencies.benguela, priority: promotionPriorities["node-3"] },
        { id: "node-4", name: "pg-replica-huambo-04.pnap.ao", ip: "10.0.3.13", lag: replicaLags["node-4"], latency: latencies.huambo, priority: promotionPriorities["node-4"] },
        { id: "node-5", name: "pg-replica-cabinda-05.pnap.ao", ip: "10.0.4.14", lag: replicaLags["node-5"], latency: latencies.cabinda, priority: promotionPriorities["node-5"] },
        { id: "node-6", name: "pg-replica-moxico-06.pnap.ao", ip: "10.0.5.15", lag: replicaLags["node-6"], latency: latencies.moxico, priority: promotionPriorities["node-6"] }
      ];

      // Verificar consenso/quorum de acordo com a regra
      if (requireQuorum) {
        addClusterLog("INFO", "🛡️ Quorum ativo: Verificando integridade e consenso da maioria (mínimo 3 réplicas comunicantes)... OK.");
      }

      // Filtrar réplicas pelo limite máximo de lag LSN configurado
      const eligible = candidates.filter(c => {
        const isEligible = c.lag <= maxAllowedLagMb;
        if (!isEligible) {
          addClusterLog("WARN", `⚠️ Réplica ${c.name} rejeitada. LSN Lag de ${c.lag.toFixed(1)}MB ultrapassa o limite tolerado de ${maxAllowedLagMb}MB.`);
        }
        return isEligible;
      });

      if (eligible.length === 0) {
        addClusterLog("CRITICAL", "❌ FAILOVER ABORTADO: Nenhuma réplica atende aos requisitos de LSN Lag! Dados sob risco de perda.");
        setActiveDisaster(prev => prev ? { ...prev, status: "FALHA NO FAILOVER", details: "Nenhum nó secundário pôde ser promovido. Razão: Violação geral da regra de LSN Lag máximo." } : null);
        setIsSimulatingFailover(false);
        return;
      }

      // Escolher o vencedor com base na estratégia configurada
      let winner: any = null;
      if (promotionStrategy === "priority") {
        // Ordenar por prioridade (1 é a maior, quanto menor o valor, maior a prioridade)
        eligible.sort((a, b) => a.priority - b.priority);
        winner = eligible[0];
        addClusterLog("INFO", `🗳️ Estratégia de Promoção: PRIORIDADE MANUAL. Nó eleito: ${winner.name} (Prioridade: ${winner.priority}, Lag: ${winner.lag}MB)`);
      } else {
        // Ordenar por menor latência
        eligible.sort((a, b) => a.latency - b.latency);
        winner = eligible[0];
        addClusterLog("INFO", `🗳️ Estratégia de Promoção: MENOR LATÊNCIA. Nó eleito: ${winner.name} (Latência: ${winner.latency.toFixed(1)}ms, Lag: ${winner.lag}MB)`);
      }

      // Passo 3: Promover o nó vencedor
      setTimeout(() => {
        setNodes(prev => prev.map(node => {
          if (node.id === winner.id) {
            return { ...node, role: "PRIMARY (READ-WRITE)", connections: 145 };
          }
          return node;
        }));

        addClusterLog("SUCCESS", `⚡ PROMOÇÃO CONCLUÍDA! Réplica secundária ${winner.name} assumiu como PRIMARY.`);
        addClusterLog("INFO", `🔄 Gateway re-roteou conexões RW do Consórcio para o novo Master em ${winner.ip}.`);
        
        setActiveDisaster(prev => prev ? {
          ...prev,
          status: "FAILOVER RESOLVIDO",
          details: `Queda mitigada com sucesso. O nó secundário ${winner.name} foi promovido a MASTER (IP: ${winner.ip}) com lag de ${winner.lag.toFixed(1)}MB.`,
          chosenMaster: winner.name
        } : null);
      }, 1500);

      // Passo 4: Recuperar o master original como réplica secundária após algum tempo
      setTimeout(() => {
        setNodes(prev => prev.map(node => {
          if (node.id === "node-1") {
            return { ...node, status: "ONLINE", role: "REPLICA (READ-ONLY)", connections: 12, type: "local-replica" };
          }
          return node;
        }));
        addClusterLog("SUCCESS", "🟢 Antigo master pg-master-01.pnap.ao online recuperado e configurado como réplica de leitura.");
        addClusterLog("INFO", "🔗 Sincronização LSN inicializada do novo master para pg-master-01.");
        setIsSimulatingFailover(false);
      }, 3500);

    }, 2800);
  };

  // Simulates passive queries hitting pnap_db
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveConnections(prev => {
        const delta = Math.floor(Math.random() * 21) - 10;
        const next = Math.max(120, Math.min(650, prev + delta));
        
        // Randomly distribute connections to nodes
        setNodes(nodesPrev => {
          let masterConns = Math.round(next * 0.35);
          let rem = next - masterConns;
          return nodesPrev.map(n => {
            if (n.status === "OFFLINE") return { ...n, connections: 0 };
            if (n.role.includes("PRIMARY")) {
              return { ...n, connections: masterConns };
            }
            // Distribute remaining based on weights
            const nodeWeight = n.id === "node-2" ? weights.replicaLuanda :
                               n.id === "node-3" ? weights.replicaBenguela :
                               n.id === "node-4" ? weights.replicaHuambo :
                               n.id === "node-5" ? weights.replicaCabinda : weights.replicaMoxico;
            const share = Math.round(rem * (nodeWeight / 310));
            return { ...n, connections: Math.max(2, share) };
          });
        });

        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [weights]);

  // Trigger Object-Service execution pipeline (staggered 7-step process)
  const triggerObjectPipeline = () => {
    if (isPipelineRunning) return;
    setIsPipelineRunning(true);
    setPipelineStep(1);
    setPipelineLogs([]);

    const reqID = "REQ-" + Math.floor(100000 + Math.random() * 900000);
    const opNIP = currentOperator?.funcionarioId || "NIP-990421";
    const opRole = currentOperator?.role || "Director Geral";
    const opRank = currentOperator?.patente || "Comissário-Geral";

    const objectLabel = selectedPipelineObject === "recluso" ? "RECLUSO" : "CELA";
    let actionLabel = "";
    let targetEntity = "";
    let lawCites = "";
    let consensusQuorum = "";
    let ledgerSign = "";
    let dispatchChannel = "";
    let digitalTwinState = "";

    if (selectedPipelineObject === "recluso") {
      targetEntity = "Bento Cafala (REC-HUA-091)";
      if (selectedPipelineService === "transferir") {
        actionLabel = "TRANSFERIR RECLUSO (SOLICITAR ESCOALTA)";
        lawCites = "Artigo 42 e 45 da Lei de Custódia e Execução de Medidas Penais (Lei 8/08) - Regulação de Movimentações entre EP.";
        consensusQuorum = "Aprovado por Quorum de Consenso (Homologado pelo Diretor Geral e Comissário de Luanda).";
        ledgerSign = "SIG-TX-CUSTODIA-REC-HUA-091";
        dispatchChannel = "Despachado SMS de Escolta PIR / Alerta SIEM em tempo real.";
        digitalTwinState = "Fiduciary Twin State updated: Custodia = 'TRANSITO', Destino = 'EP Viana'.";
      } else if (selectedPipelineService === "risco") {
        actionLabel = "CLASSIFICAR GRAU DE RISCO COGNITIVO";
        lawCites = "Normativa Especial de Segurança do MININT / Artigo 12 da Portaria de Classificação de Custódia Homologada.";
        consensusQuorum = "Cálculo AI validado por rede neural Markov Chain e assinado eletronicamente por Comandante Local.";
        ledgerSign = "SIG-CLASSIFY-RISK-SCORE-84";
        dispatchChannel = "SIEM Threat Board updated / Alerta ao Comando do Pavilhão.";
        digitalTwinState = "Fiduciary Twin State updated: Risco = 'CRITICO' (Score 84/100).";
      } else if (selectedPipelineService === "regime") {
        actionLabel = "REAVALIAR REGIME DE CUSTÓDIA";
        lawCites = "Artigo 64 da Lei Penitenciária de Angola - Mudança de Regime Fechado para Semi-Aberto.";
        consensusQuorum = "Juiz de Execução de Penas Provincial e Diretor da Unidade concordantes.";
        ledgerSign = "SIG-REGIME-RECLASS-OK";
        dispatchChannel = "Regime de custódia reclassificado no prontuário multidimensional.";
        digitalTwinState = "Fiduciary Twin State updated: Regime = 'SEMI_ABERTO'.";
      } else {
        actionLabel = "LIBERTAÇÃO ANTECIPADA (CONDICIONAL)";
        lawCites = "Artigo 102 do Código Penal Angolano - Requisitos de Cumprimento de Metade da Pena com Bom Comportamento.";
        consensusQuorum = "Tribunal Provincial de Execução de Penas homologado. Quorum 100% legal.";
        ledgerSign = "SIG-RELEASE-CONDITIONAL-PASS";
        dispatchChannel = "Despacho de soltura emitido para a unidade penitenciária correspondente.";
        digitalTwinState = "Fiduciary Twin State updated: Estado = 'LIBERTADO_CONDICIONAL'.";
      }
    } else {
      targetEntity = "Cela H3-Pavilhão B (EP Huambo)";
      if (selectedPipelineService === "abrir") {
        actionLabel = "ABRIR FECHADURA ELETRÓNICA";
        lawCites = "Regulamento Técnico de Emergência Física / Norma Operacional de Abertura Controlada de Portões.";
        consensusQuorum = "Aprovação Dupla: Comando Geral Central + Operador Local biométrico verificado.";
        ledgerSign = "SIG-LOCK-OPEN-SOLENOID-H3";
        dispatchChannel = "Atuador eletromecânico disparado remotamente / Sensor alterado para Aberto.";
        digitalTwinState = "Fiduciary Twin State updated: Solenoid = 'UNLOCKED', PortStatus = 'OPEN'.";
      } else if (selectedPipelineService === "lockdown") {
        actionLabel = "LOCKDOWN PREVENTIVO DE CELA/BLOCO";
        lawCites = "Artigo 88 da Lei 8/08 (Uso Regulamentar da Força e Controlo de Motins). Justifica isolamento preventivo imediato.";
        consensusQuorum = "Sistema Autónomo de Alerta e Diretor Provincial validantes (Quorum Instantâneo).";
        ledgerSign = "SIG-LOCKDOWN-BLOC-B-ACTIVE";
        dispatchChannel = "Sinalização acústica ligada no bloco correspondente / Portões bloqueados pneumaticamente.";
        digitalTwinState = "Fiduciary Twin State updated: Solenoid = 'LOCKED_BY_FORCE', Siren = 'ACTIVE'.";
      } else if (selectedPipelineService === "inspecionar") {
        actionLabel = "INSPECIONAR PERÍMETRO (SCANNER COGNITIVO)";
        lawCites = "Protocolo de Inspeção Forense e Prevenção de Contrabando nas Prisões Nacionais de Angola.";
        consensusQuorum = "Iniciado autonomamente pelo operador do Centro de Comando do MININT.";
        ledgerSign = "SIG-SCANNER-SENSORS-OK";
        dispatchChannel = "Imagens termográficas analisadas e sincronizadas com a central.";
        digitalTwinState = "Fiduciary Twin State updated: UltimasInspecoes = '2026-07-19'.";
      } else {
        actionLabel = "MANUTENÇÃO DE SENSORES";
        lawCites = "Norma Técnica de Manutenção Preventiva do Parque Tecnológico Prisional Nacional.";
        consensusQuorum = "Ordem de serviço nº 492 aprovada pela equipa de Logística e Engenharia.";
        ledgerSign = "SIG-MAINTENANCE-SENSORS";
        dispatchChannel = "Notificação de re-calibração enviada para o laboratório de engenharia do MININT.";
        digitalTwinState = "Fiduciary Twin State updated: SensorCalibrado = 'TRUE'.";
      }
    }

    const steps = [
      {
        title: "Pedido (Request Initialized)",
        desc: `Requisição recebida e empacotada. ID: ${reqID}. Objeto: ${objectLabel} (${targetEntity}).`
      },
      {
        title: "RBAC & Patente (Access Verification)",
        desc: `Verificação de permissões do operador. NIP: ${opNIP}, Patente: ${opRank} (${opRole}). Credenciais em conformidade.`
      },
      {
        title: "Validação Jurídica (Legal Compliance)",
        desc: `Validação jurídica obrigatória: ${lawCites}`
      },
      {
        title: "Workflow (Consensus Check)",
        desc: `${consensusQuorum}`
      },
      {
        title: "Auditoria (Cryptographic Ledger)",
        desc: `Escrita efetuada no livro de auditoria forense do MININT. Assinatura gerada: ${ledgerSign}.`
      },
      {
        title: "Notificação (Dispatch Alert)",
        desc: `Enviados alertas e telemetria: ${dispatchChannel || "Canal de auditoria e consola de operações informados em tempo real."}`
      },
      {
        title: "Digital Twin Sync (State Finalized)",
        desc: `Replicação fiduciária concluída com sucesso! ${digitalTwinState}`
      }
    ];

    let current = 1;
    const interval = setInterval(() => {
      setPipelineStep(current);
      setPipelineLogs(prev => [...prev, `[FASE ${current}] ${steps[current - 1].title} - ${steps[current - 1].desc}`]);
      
      if (current === 7) {
        clearInterval(interval);
        setIsPipelineRunning(false);
        // Push a beautiful successful event onto the live stream
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        const finalEvent = {
          id: `EVT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: timeStr,
          type: "PIPELINE_EX_SUCCESS",
          priority: "HIGH",
          category: "SEGURANÇA",
          source: "ObjectService",
          operator: opRole,
          message: `Serviço '${actionLabel}' concluído com sucesso para ${targetEntity}.`,
          payload: { reqID, opNIP, objectLabel, lawCites },
          auditHash: "SHA256-" + reqID.substring(4) + "A921"
        };
        setEventStream(prev => [finalEvent, ...prev.slice(0, 24)]);
      } else {
        current++;
      }
    }, 900);
  };

  // Simulate intelligent Natural Language intention parsing for the Command Palette
  const parseCognitiveQuery = (queryText: string) => {
    if (!queryText.trim()) return;
    setParsingQuery(true);
    setCognitiveQuery(queryText);
    setParsedResult(null);

    setTimeout(() => {
      const q = queryText.toLowerCase().trim();
      let result: any = {
        natural_language_query: queryText,
        parsing_timestamp: new Date().toLocaleTimeString(),
        parser_engine: "PNAP Cognitive Command Interpreter v2.0",
        interpretation: {
          intent: "UNKNOWN",
          entity_focus: "DESCONHECIDO",
          associated_capability: "CAP_PLATAFORMA_PESQUISA",
          resolved_filters: {},
          action: "DEFAULT_SEARCH_INDEX"
        },
        execution_status: "SUCCESS",
        results_count: 0,
        terminal_output: ""
      };

      if (q.includes("huambo") && (q.includes("cela") || q.includes("celas")) && (q.includes("critica") || q.includes("crítica"))) {
        result.interpretation = {
          intent: "SEARCH_INFRASTRUCTURE",
          entity_focus: "CELA",
          associated_capability: "CAP_GESTAO_OPERACIONAL_CENTRO_COMANDO",
          resolved_filters: {
            province: "HUAMBO",
            risk_threshold: "CRITICAL",
            occupancy_level: "OVERCROWDED"
          },
          action: "QUERY_DIGITAL_TWIN"
        };
        result.results_count = 3;
        result.terminal_output = "🔍 PESQUISA SEMÂNTICA NO DIGITAL TWIN COGNITIVO...\n" +
          "-> Encontradas 3 celas com ocupação crítica no Pavilhão H do Huambo:\n" +
          "   - CELA_H1: Ocupação 10/8 [CRÍTICO]\n" +
          "   - CELA_H3: Ocupação 9/8 [ALERTA]\n" +
          "   - CELA_H12: Ocupação 11/8 [CRÍTICO]\n" +
          "💡 RECOMENDAÇÃO AIOS: Disparar Serviço 'Transferir Recluso' para balancear ocupação.";
      } else if (q.includes("risco") || q.includes("recluso") || q.includes("elevado") || q.includes("audiencia") || q.includes("audiência")) {
        result.interpretation = {
          intent: "QUERY_INMATES_COGNITIVE",
          entity_focus: "RECLUSO",
          associated_capability: "CAP_INTELIGENCIA_ARTIFICIAL_PREDICAO",
          resolved_filters: {
            risk_level: "HIGH",
            has_hearing_this_week: true
          },
          action: "FILTER_CUSTODY_REGISTRY"
        };
        result.results_count = 2;
        result.terminal_output = "🧠 CONTEXTO SINTÉTICO RECLUSOS RISCO ALTO COM AUDIÊNCIAS ESTA SEMANA:\n" +
          "-> Recluso Bento Cafala (REC-HUA-091) - Risco: Alto. Audiência em Luanda dia 22/07.\n" +
          "-> Recluso João Kassoma (REC-VIA-112) - Risco: Alto. Audiência de Recurso dia 24/07.\n" +
          "💡 RECOMENDAÇÃO AIOS: Use 'Transferir' ou 'Escoltas PIR' para planear transporte blindado de segurança.";
      } else if (q.includes("transferencia") || q.includes("transferir") || q.includes("viana") || q.includes("guia")) {
        result.interpretation = {
          intent: "GENERATE_TRANSFER_GUIDE",
          entity_focus: "RECLUSO",
          associated_capability: "CAP_GESTAO_PENITENCIARIA_MOVIMENTACOES",
          resolved_filters: {
            origin: "EP Viana",
            destination: "EP Huambo",
            escort_type: "PIR_MILITARY_ESCORT"
          },
          action: "DISPATCH_OBJECT_SERVICE"
        };
        result.results_count = 1;
        result.terminal_output = "📋 INTERPRETANDO INTENÇÃO DE MOVIMENTAÇÃO DE RECLUSO...\n" +
          "-> Preparando rascunho de Guia de Trânsito GT-810920.\n" +
          "-> Origem: EP Viana (Luanda) -> Destino: EP Central do Huambo.\n" +
          "-> Força: Polícia de Intervenção Rápida (PIR).\n" +
          "💡 RECOMENDAÇÃO AIOS: Dispare o Object Service 'Transferir Recluso' no console abaixo para validar a conformidade jurídica.";
      } else if (q.includes("artigo") || q.includes("legislacao") || q.includes("lei") || q.includes("fundamenta")) {
        result.interpretation = {
          intent: "RESOLVE_LEGISLATION_REFERENCE",
          entity_focus: "LEGISLACAO",
          associated_capability: "CAP_GOVERNACAO_LEGISLACAO",
          resolved_filters: {
            law_code: "Lei 8/08",
            topic: "CUSTODY_REGIME_LIMITS"
          },
          action: "RESOLVE_CNEL_CACHE"
        };
        result.results_count = 1;
        result.terminal_output = "⚖️ ENGENHARIA LEGISLATIVA - BUSCA CONTEXTUAL LEGAL:\n" +
          "-> Artigo 42 da Lei de Custódia Penitenciária de Angola (Lei 8/08):\n" +
          "   'Fundamenta e legitima o uso controlado da força e lockdowns de pavimentos prisionais em casos de iminente revolta ou quebra física de integridade.'\n" +
          "-> Status: Vigente, Conformidade Constitucional.";
      } else {
        result.interpretation = {
          intent: "GENERIC_SEARCH_NLP",
          entity_focus: "SISTEMA_DIVERSO",
          associated_capability: "CAP_PLATAFORMA_EXPLORER",
          resolved_filters: {
            keyword_token: q
          },
          action: "GLOBAL_FUZZY_SEARCH"
        };
        result.results_count = 1;
        result.terminal_output = `⌨️ INTERPRETADO COMO PESQUISA GLOBAL FUZZY:\n` +
          `-> Filtrado pelo termo: '${q}'\n` +
          `-> Encontrada 1 referência nos logs do SIEM.\n` +
          `-> Telemetria e dados auditados em conformidade.`;
      }

      setParsedResult(result);
      setParsingQuery(false);
    }, 1200);
  };

  const servicesList = [
    { id: "Identity", name: "Identity Service", desc: "User sessions, login verification & cryptographic tokens", icon: UserCheck, color: "text-blue-400" },
    { id: "Security", name: "Security Service", desc: "Inmate risk ratings, threat indexes & physical block safety", icon: Shield, color: "text-red-400" },
    { id: "Audit", name: "Audit Service", desc: "Forensic logs, military ledger & tamper-proof audit trails", icon: Database, color: "text-pink-400" },
    { id: "Health", name: "Health Service", desc: "Clinical prontuários, medication tracking & health reports", icon: Heart, color: "text-emerald-400" },
    { id: "Transfer", name: "Transfer Service", desc: "Escort planning, physical relocations & custody guides", icon: Truck, color: "text-cyan-400" },
    { id: "Notification", name: "Notification Service", desc: "Emergency SMS broadcasts, emails & internal alerts", icon: Bell, color: "text-amber-400" },
    { id: "HR", name: "HR Service", desc: "MININT operator database, ranks (patentes) & RBAC", icon: Users, color: "text-indigo-400" },
    { id: "Prison", name: "Prison Service", desc: "Infrastructure layouts, pavilion metrics & capacity levels", icon: Building, color: "text-slate-400" },
    { id: "AI", name: "AI Service", desc: "Predictive overcrowding forecasting & analytical models", icon: Cpu, color: "text-purple-400" }
  ];

  return (
    <div className="flex flex-col gap-5 font-sans w-full text-left" id="services-gateway-architecture-dashboard">
      
      {/* OS SUB-NAVBAR TABS (VS Code Editor Style Sub-Navigation) */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2 shrink-0 select-none">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-900/60">
          <button
            type="button"
            onClick={() => setActiveSubTab("kernel")}
            className={`px-3 py-1.5 rounded-md text-[10.5px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "kernel"
                ? "bg-slate-900 text-emerald-400 border border-slate-800 shadow-md"
                : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <span>AIOS Kernel & Event Bus</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("postgres")}
            className={`px-3 py-1.5 rounded-md text-[10.5px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "postgres"
                ? "bg-slate-900 text-amber-500 border border-slate-800 shadow-md"
                : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <Database className="h-3.5 w-3.5 text-amber-500" />
            <span>PostgreSQL Cluster Config</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("services")}
            className={`px-3 py-1.5 rounded-md text-[10.5px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "services"
                ? "bg-slate-900 text-cyan-400 border border-slate-800 shadow-md"
                : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <Server className="h-3.5 w-3.5 text-cyan-400" />
            <span>Arquitetura de Microsserviços</span>
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono text-slate-500">
          <span>Target Host: <strong className="text-slate-300">{activeSubTab === "kernel" ? "kernel.pnap.ao" : "cluster-postgres.pnap-internal"}</strong></span>
          <span className="text-slate-750">|</span>
          <span>Status: <strong className="text-emerald-400 font-bold">ACTIVE (100% SECURE)</strong></span>
        </div>
      </div>

      {/* =========================================================================
          VIEW KERNEL: AIOS INTEGRATED OPERATING SYSTEM KERNEL CORE CONTROL COCKPIT
          ========================================================================= */}
      {activeSubTab === "kernel" && (
        <div className="flex flex-col gap-6 animate-fadeIn text-slate-100" id="aios-kernel-engine-cockpit">
          
          {/* TOP EXPLANATIVE BANNER */}
          <div className="bg-gradient-to-r from-slate-950 via-[#070b12] to-slate-950 border border-slate-900 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start gap-4 z-10">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-emerald-400 shrink-0">
                <Cpu className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-500 text-slate-950 text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    AIOS SYSTEM KERNEL
                  </span>
                  <span className="text-slate-500 text-xs font-mono">• Versão 2.1 • Núcleo Ativo de Micro-Serviços e Eventos</span>
                </div>
                <h1 className="text-lg font-bold font-sans tracking-tight text-slate-100 mt-1.5">
                  Consola de Monitorização do Kernel & Barramento de Eventos Institucionais
                </h1>
                <p className="text-xs text-slate-400 mt-1.5 max-w-4xl leading-relaxed font-sans">
                  Consola centralizada para controlar o <strong>Kernel Operacional do PNAP-AO</strong>. Gerencie o ecossistema de dados, audite a esteira de serviços em 7 fases corporativas, teste a inteligência do interpretador cognitivo da Command Palette e visualize os fluxos de eventos em tempo real do barramento institucional.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-2.5 shrink-0 z-10">
              <div className="bg-slate-900/80 border border-slate-850 px-3.5 py-2 rounded-lg font-mono text-[10px] flex items-center gap-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Event Bus: <strong className="text-emerald-400">STREAMING</strong></span>
              </div>
            </div>
          </div>

          {/* FIRST ROW: CAPABILITY MAP EXPLORER (7 SPANS) & COMMAND PALETTE INTERPRETER (5 SPANS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* CAPABILITY MAP EXPLORER */}
            <div className="lg:col-span-7 bg-[#070b11] border border-slate-900 rounded-xl p-5 shadow-lg flex flex-col gap-4 relative">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-emerald-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-200">
                    Capability Map Explorer (Mapeador de Capacidades)
                  </h3>
                </div>
                <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider bg-slate-950 px-2.5 py-0.5 rounded border border-slate-900">
                  Capacidade Ativa do Sistema
                </span>
              </div>
              
              <p className="text-xxs text-slate-400 leading-normal mb-1 font-sans">
                Conforme diretiva do PNAP-AO, <strong>nenhuma nova funcionalidade existe isolada</strong>. Cada módulo expande uma capacidade institucional do MININT. Selecione uma capacidade abaixo para inspecionar seus objetos, fluxos de trabalho e serviços correspondentes.
              </p>

              {/* CAPABILITY GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: "penitenciaria",
                    title: "Gestão Penitenciária",
                    desc: "Cadastro, Custódia, Regimes, Biometria",
                    icon: Users,
                    color: "border-blue-500/25 hover:border-blue-500/50 text-blue-400 bg-blue-500/5",
                    activeColor: "border-blue-500 text-blue-400 bg-blue-500/10"
                  },
                  {
                    id: "operacional",
                    title: "Gestão Operacional",
                    desc: "Centro de Comando, Crises, Escoltas, SIEM",
                    icon: Shield,
                    color: "border-red-500/25 hover:border-red-500/50 text-red-400 bg-red-500/5",
                    activeColor: "border-red-500 text-red-400 bg-red-500/10"
                  },
                  {
                    id: "institucional",
                    title: "Gestão Institucional",
                    desc: "Recursos Humanos, Patentes NIP, Frota",
                    icon: Building,
                    color: "border-indigo-500/25 hover:border-indigo-500/50 text-indigo-400 bg-indigo-500/5",
                    activeColor: "border-indigo-500 text-indigo-400 bg-indigo-500/10"
                  },
                  {
                    id: "governacao",
                    title: "Governação & Auditoria",
                    desc: "Auditoria Forense, Compliance, Legislação",
                    icon: Scale,
                    color: "border-amber-500/25 hover:border-amber-500/50 text-amber-400 bg-amber-500/5",
                    activeColor: "border-amber-500 text-amber-400 bg-amber-500/10"
                  },
                  {
                    id: "inteligencia",
                    title: "Inteligência Artificial",
                    desc: "NLP Interpretador, Predição de Risco, Graph",
                    icon: Cpu,
                    color: "border-purple-500/25 hover:border-purple-500/50 text-purple-400 bg-purple-500/5",
                    activeColor: "border-purple-500 text-purple-400 bg-purple-500/10"
                  },
                  {
                    id: "plataforma",
                    title: "Plataforma OS",
                    desc: "Explorer, Command Palette, Telemetria",
                    icon: Globe,
                    color: "border-emerald-500/25 hover:border-emerald-500/50 text-emerald-400 bg-emerald-500/5",
                    activeColor: "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                  }
                ].map((cap) => {
                  const IconComponent = cap.icon;
                  return (
                    <button
                      type="button"
                      key={cap.id}
                      onClick={() => setSelectedCapability(selectedCapability === cap.id ? "all" : cap.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer select-none group relative overflow-hidden ${
                        selectedCapability === cap.id ? cap.activeColor + " ring-1 ring-emerald-500/20" : cap.color
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <IconComponent className="h-4.5 w-4.5 shrink-0" />
                        {selectedCapability === cap.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold font-sans tracking-tight leading-none text-slate-150">{cap.title}</h4>
                        <p className="text-[9.5px] font-mono text-slate-400 mt-1 leading-tight line-clamp-2 leading-normal">{cap.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* SELECTED CAPABILITY DETAILED SUMMARY PANE */}
              <div className="bg-[#04070a] border border-slate-900/80 rounded-xl p-4 font-mono text-xxs mt-1 min-h-[125px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2.5">
                    <span className="text-slate-450 uppercase tracking-wider text-[9.5px]">
                      Decomposição de Serviços & Objetos Fiduciários
                    </span>
                    <span className="text-emerald-400 font-bold uppercase tracking-widest text-[9px]">
                      {selectedCapability === "all" ? "MOSTRANDO TODOS" : "CAPACIDADE: " + selectedCapability.toUpperCase()}
                    </span>
                  </div>

                  {selectedCapability === "all" && (
                    <div className="text-slate-450 italic flex flex-col justify-center items-center py-6 text-center gap-1.5">
                      <HelpCircle className="h-5 w-5 text-slate-600 animate-pulse" />
                      <span>Clique em qualquer cartão de capacidade acima para inspecionar os serviços lógicos, workflows e modelos de dados que estruturam esse pilar no kernel.</span>
                    </div>
                  )}

                  {selectedCapability === "penitenciaria" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn text-left font-sans">
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Serviços do Kernel</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>AdmitInmate()</li>
                          <li>RegisterBiometrics()</li>
                          <li>AllocatePhysicalSpace()</li>
                          <li>UpdateCustodyRegime()</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Modelos / Objetos</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>Recluso</li>
                          <li>DossierCanónico</li>
                          <li>DossierCognitivo</li>
                          <li>BiometricHash</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Workflows Ativos</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>Admissão e Registro</li>
                          <li>Classificação Risco</li>
                          <li>Delegação Judicial</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {selectedCapability === "operacional" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn text-left font-sans">
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Serviços do Kernel</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>TriggerBlockLockdown()</li>
                          <li>InitiateTacticalEscort()</li>
                          <li>QueryCommandFeed()</li>
                          <li>RouteMicrowaveLink()</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Modelos / Objetos</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>Pavilhão</li>
                          <li>CelaFiduciária</li>
                          <li>TacticalOrder</li>
                          <li>IncidentLedger</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Workflows Ativos</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>Isolamento de Crise</li>
                          <li>Despacho de Escolta</li>
                          <li>SIEM Incident Loop</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {selectedCapability === "institucional" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn text-left font-sans">
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Serviços do Kernel</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>VerifyOperatorRank()</li>
                          <li>SyncOfficerNIP()</li>
                          <li>AllocateFleetVehicle()</li>
                          <li>AuditSupplyStocks()</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Modelos / Objetos</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>MilitarMININT</li>
                          <li>PatenteMilitar</li>
                          <li>PatrimónioPrisional</li>
                          <li>BlindadoEscolta</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Workflows Ativos</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>Escala de Turnos</li>
                          <li>Reclassificação de Posto</li>
                          <li>Conformidade de Frota</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {selectedCapability === "governacao" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn text-left font-sans">
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Serviços do Kernel</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>WriteAuditLedger()</li>
                          <li>MatchLegalArticles()</li>
                          <li>ValidateOperationQuorum()</li>
                          <li>EnforceAccessPolicy()</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Modelos / Objetos</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>LedgerBlock</li>
                          <li>NormativaConstitucional</li>
                          <li>LeiConstituída</li>
                          <li>AccessPolicyToken</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Workflows Ativos</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>Homologação de Guias</li>
                          <li>Auditoria de Registro</li>
                          <li>Reajuste de Enquadramento</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {selectedCapability === "inteligencia" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn text-left font-sans">
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Serviços do Kernel</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>ParseCognitiveIntent()</li>
                          <li>PredictStabilityScore()</li>
                          <li>QueryKnowledgeGraph()</li>
                          <li>SynthesizeLegalBasis()</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Modelos / Objetos</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>CognitiveIntentTree</li>
                          <li>StabilityForecast</li>
                          <li>GraphRelationNode</li>
                          <li>AIPromptSchema</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Workflows Ativos</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>Previsão de Rebelião</li>
                          <li>Geração de Justificação</li>
                          <li>Mapeamento Semântico</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {selectedCapability === "plataforma" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn text-left font-sans">
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Serviços do Kernel</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>ExecuteFuzzySearch()</li>
                          <li>TraverseExplorerTree()</li>
                          <li>PublishCommandPalette()</li>
                          <li>CollectServerTelemetry()</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Modelos / Objetos</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>InmateSearchIndex</li>
                          <li>ExplorerFolderNode</li>
                          <li>PaletteShortcutItem</li>
                          <li>LogEventPayload</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-slate-300 font-bold block mb-1 font-mono text-[10.5px]">Workflows Ativos</span>
                        <ul className="list-inside list-disc text-slate-400 space-y-0.5 text-xxs">
                          <li>Varredura Semântica</li>
                          <li>Carregamento de Tela</li>
                          <li>Pulsação de Telemetria</li>
                        </ul>
                      </div>
                    </div>
                  )}

                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-900/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Isolamento Lógico: <strong className="text-emerald-400">Sandbox Militar</strong></span>
                  <span>Conselho Superior de Custódia: <strong className="text-slate-300">Minint Gov.ao</strong></span>
                </div>
              </div>
            </div>

            {/* COMMAND PALETTE COGNITIVE SANDBOX */}
            <div className="lg:col-span-5 bg-[#070b11] border border-slate-900 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4.5 w-4.5 text-emerald-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-200">
                    Centro Cognitivo (Command Palette Parser)
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  NLP Engine
                </span>
              </div>

              <p className="text-xxs text-slate-400 leading-normal font-sans">
                Digite um comando operacional complexo em linguagem natural para testar o <strong>Interpretador de Intenções Cognitivas</strong> do sistema de comando:
              </p>

              {/* INPUT CONTAINER */}
              <div className="flex gap-2 relative">
                <input
                  type="text"
                  placeholder="Escreva ex: transferir recluso Huambo..."
                  value={cognitiveQuery}
                  onChange={(e) => setCognitiveQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") parseCognitiveQuery(cognitiveQuery);
                  }}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 w-full pl-9 pr-10"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => parseCognitiveQuery(cognitiveQuery)}
                  disabled={parsingQuery || !cognitiveQuery.trim()}
                  className="absolute right-1.5 top-1.5 p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-all cursor-pointer disabled:bg-slate-900 disabled:text-slate-650 shadow"
                >
                  <Send className="h-3 w-3 fill-current" />
                </button>
              </div>

              {/* QUICK SHORTCUTS */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider block text-left">Atalhos Cognitivos de Simulação:</span>
                <div className="flex flex-col gap-1.5">
                  {[
                    "Mostrar todas as celas críticas do Huambo",
                    "Reclusos com risco elevado e audiência esta semana",
                    "Preparar guia de transferência para Viana",
                    "Artigo da legislação que fundamenta esta decisão"
                  ].map((sh, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setCognitiveQuery(sh);
                        parseCognitiveQuery(sh);
                      }}
                      className="bg-slate-950 hover:bg-slate-900 border border-slate-900 text-left text-xxs font-mono px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-emerald-400 cursor-pointer transition-all line-clamp-1"
                    >
                      💡 "{sh}"
                    </button>
                  ))}
                </div>
              </div>

              {/* NLP GRAPH INTERPRETER DISPLAY */}
              <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 font-mono text-xxs min-h-[140px] max-h-[160px] overflow-y-auto relative flex flex-col justify-between scrollbar-thin">
                {parsedResult ? (
                  <div className="flex flex-col gap-3 animate-fadeIn text-left">
                    <div className="flex justify-between items-center text-[10px] border-b border-slate-900 pb-1.5">
                      <span className="text-emerald-400 font-bold">✓ INTENÇÃO RECONHECIDA COM SUCESSO</span>
                      <span className="text-slate-500 text-[8.5px]">{parsedResult.parsing_timestamp}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 leading-relaxed">
                      <div>
                        <span className="text-slate-450 uppercase text-[8.5px] block font-bold">Intent (Ação):</span>
                        <strong className="text-emerald-400 text-[10.5px]">{parsedResult.interpretation.intent}</strong>
                      </div>
                      <div>
                        <span className="text-slate-450 uppercase text-[8.5px] block font-bold">Entidade Alvo:</span>
                        <strong className="text-cyan-400 text-[10.5px]">{parsedResult.interpretation.entity_focus}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-450 uppercase text-[8.5px] block font-bold">Capacidade Associada:</span>
                        <span className="text-indigo-400 text-[9.5px] break-all">{parsedResult.interpretation.associated_capability}</span>
                      </div>
                      <div className="col-span-2 bg-[#05070a] p-2 rounded border border-slate-900 mt-1">
                        <span className="text-slate-500 uppercase text-[8px] block font-bold mb-1">Terminal de Saída:</span>
                        <pre className="whitespace-pre-wrap text-emerald-300 leading-normal font-mono break-all text-[10px]">
                          {parsedResult.terminal_output}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : parsingQuery ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-emerald-400 font-mono">
                    <RefreshCw className="h-5 w-5 animate-spin text-emerald-400" />
                    <span className="animate-pulse">Desmontando tokens da consulta natural...</span>
                  </div>
                ) : (
                  <div className="text-slate-500 italic py-6 text-center flex flex-col items-center gap-2 font-mono">
                    <Terminal className="h-6 w-6 text-slate-600" />
                    <span>Aguardando comando cognitivo. Escreva ou selecione um atalho acima para ver a decomposição semântica e intenção NLP em tempo real.</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* SECOND ROW: SERVICE PIPELINE STEPPER (5 SPANS) & EVENT BUS LOGGER (7 SPANS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* OBJECT SERVICES PIPELINE DEBUGGER */}
            <div className="lg:col-span-5 bg-[#070b11] border border-slate-900 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4.5 w-4.5 text-emerald-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-200">
                    Object Services Pipeline (Esteira Operacional)
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Pipeline 7-Fases
                </span>
              </div>

              <p className="text-xxs text-slate-400 leading-normal font-sans">
                Cada ação sobre um objeto fiduciário penitenciário (Recluso, Cela) transita obrigatoriamente pelas <strong>7 fases canónicas de conformidade</strong> da nossa infraestrutura:
              </p>

              {/* CONTROLS */}
              <div className="bg-[#04070a] p-3 rounded-xl border border-slate-900 flex flex-col gap-2.5 text-left">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8.5px] font-mono text-slate-400 uppercase mb-1">Escolher Objeto</label>
                    <select
                      value={selectedPipelineObject}
                      onChange={(e) => {
                        const val = e.target.value as "recluso" | "cela";
                        setSelectedPipelineObject(val);
                        setSelectedPipelineService(val === "recluso" ? "transferir" : "abrir");
                      }}
                      className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xxs font-mono text-slate-200 w-full focus:outline-none focus:border-emerald-500"
                    >
                      <option value="recluso">👤 Recluso (Bento Cafala)</option>
                      <option value="cela">🚪 Cela (H3 - EP Huambo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8.5px] font-mono text-slate-400 uppercase mb-1">Ação / Serviço</label>
                    <select
                      value={selectedPipelineService}
                      onChange={(e) => setSelectedPipelineService(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xxs font-mono text-slate-200 w-full focus:outline-none focus:border-emerald-500"
                    >
                      {selectedPipelineObject === "recluso" ? (
                        <>
                          <option value="transferir">🚚 Transferir (Escolta PIR)</option>
                          <option value="risco">🧠 Classificar Risco AI</option>
                          <option value="regime">🔄 Reavaliar Regime Custódia</option>
                          <option value="libertar">⚖️ Libertação Condicional</option>
                        </>
                      ) : (
                        <>
                          <option value="abrir">🔑 Abrir Solenóide Elétrico</option>
                          <option value="lockdown">⚠️ Lockdown Preventivo</option>
                          <option value="inspecionar">🔍 Inspecionar com Scanner</option>
                          <option value="manutencao">⚙️ Manutenção de Sensores</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={triggerObjectPipeline}
                  disabled={isPipelineRunning}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-900 disabled:text-slate-650 text-slate-950 font-black text-xxs uppercase tracking-wider font-mono py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {isPipelineRunning ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin text-slate-950" />
                      <span>Fase {pipelineStep}/7 em Execução...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 fill-current animate-pulse text-slate-950" />
                      <span>Disparar Pipeline do Serviço</span>
                    </>
                  )}
                </button>
              </div>

              {/* LIVE VERTICAL STEPPER COMPONENT */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-900 p-4 font-mono text-xxs flex flex-col gap-2 min-h-[170px] max-h-[190px] overflow-y-auto scrollbar-thin">
                {isPipelineRunning || pipelineLogs.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {/* Progress Bar indicator */}
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-1.5 border border-slate-850">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
                        style={{ width: `${(pipelineStep / 7) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5 text-left font-mono">
                      {pipelineLogs.map((log, i) => {
                        const isLast = i === pipelineLogs.length - 1;
                        return (
                          <div 
                            key={i} 
                            className={`leading-relaxed text-xxs font-mono ${
                              isLast 
                                ? pipelineStep === 7 
                                  ? "text-emerald-400 font-bold" 
                                  : "text-amber-400 font-semibold animate-pulse" 
                                : "text-slate-400"
                            }`}
                          >
                            <span className="text-slate-500">[{new Date().toLocaleTimeString().substring(3)}]</span> {log}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 italic py-8 text-center flex flex-col items-center gap-2 font-mono">
                    <Sliders className="h-6 w-6 text-slate-600 animate-pulse" />
                    <span>Console de Pipeline Inativa. Clique no botão acima para assistir à execução canónica, verificação RBAC, validação jurídica (leis de Angola) e escrituração do ledger.</span>
                  </div>
                )}
              </div>
            </div>

            {/* LIVE EVENT BUS LOGGER */}
            <div className="lg:col-span-7 bg-[#070b11] border border-slate-900 rounded-xl p-5 shadow-lg flex flex-col gap-4 relative">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                  <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-200">
                    Institutional Event Bus (Barramento de Eventos de Angola)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const synced = await eventBus.syncFromDatabase();
                      setEventStream([...synced]);
                    }}
                    className="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 text-[8.5px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                    title="Sincronizar histórico de eventos com a Base de Dados PostgreSQL"
                  >
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span>PostgreSQL Sync: ACTIVE</span>
                  </button>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[8.5px] font-mono text-slate-400">Live Streaming</span>
                </div>
              </div>

              <p className="text-xxs text-slate-400 leading-normal font-sans">
                Toda e qualquer transação de estado na plataforma PNAP gera um <strong>evento imutável assinado criptograficamente</strong>. O barramento retransmite e orquestra atualizações em tempo real:
              </p>

              {/* EVENT BUS ROW LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* COLUMN A: EVENT LOGGER STREAM (7 SPANS) */}
                <div className="md:col-span-7 flex flex-col gap-2">
                  {/* FILTERS TABS */}
                  <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-900">
                    {["ALL", "SEGURANÇA", "OPERACIONAL", "GOVERNAÇÃO"].map((f) => (
                      <button
                        type="button"
                        key={f}
                        onClick={() => setEventFilter(f)}
                        className={`px-2 py-1 rounded text-[8.5px] font-mono font-bold transition-all cursor-pointer flex-1 text-center truncate ${
                          eventFilter === f 
                            ? "bg-slate-900 text-emerald-400 border border-slate-850 shadow" 
                            : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        {f === "ALL" ? "TODOS" : f}
                      </button>
                    ))}
                  </div>

                  {/* EVENTS LIST CONTAINER */}
                  <div className="bg-slate-950 rounded-xl border border-slate-900 p-2 font-mono text-xxs min-h-[200px] max-h-[220px] overflow-y-auto scrollbar-thin flex flex-col gap-1.5">
                    {eventStream
                      .filter(evt => eventFilter === "ALL" || evt.category === eventFilter)
                      .map((evt, idx) => {
                        const isSelected = selectedEvent?.id === evt.id;
                        const isCritical = evt.priority === "CRITICAL";
                        const isHigh = evt.priority === "HIGH";
                        const isNew = idx === 0;

                        return (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex justify-between items-start gap-2 relative ${
                              isSelected
                                ? "bg-emerald-500/5 border-emerald-500/40"
                                : isCritical
                                  ? "bg-rose-950/10 border-rose-950/40 hover:border-rose-900/40"
                                  : "bg-slate-900/60 border-slate-900 hover:border-slate-850"
                            }`}
                          >
                            {isNew && (
                              <span className="absolute top-1.5 left-1 w-1.5 h-3 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[8.5px] font-bold font-mono px-1 rounded uppercase tracking-wide leading-normal ${
                                  isCritical 
                                    ? "bg-rose-500 text-slate-950" 
                                    : isHigh 
                                      ? "bg-amber-500 text-slate-950" 
                                      : "bg-slate-850 text-slate-300"
                                }`}>
                                  {evt.type}
                                </span>
                                <span className="text-slate-500 text-[8.5px]">{evt.timestamp}</span>
                                {(evt.persistedInDb || isCritical || isHigh) && (
                                  <span className="text-[7.5px] font-mono px-1 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 flex items-center gap-0.5" title="Persistido na base de dados PostgreSQL">
                                    <Database className="w-2.5 h-2.5 text-cyan-400" />
                                    <span>PGSQL</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xxs text-slate-300 truncate mt-0.5">{evt.message}</p>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 shrink-0 select-none">#{evt.id.substring(9)}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* COLUMN B: EMIT MANUAL EVENT & SELECTED PAYLOAD VIEWER (5 SPANS) */}
                <div className="md:col-span-5 flex flex-col gap-2.5">
                  
                  {/* PAYLOAD INSPECTOR PANE */}
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 flex flex-col gap-2 font-mono text-xxs">
                    <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider block border-b border-slate-900 pb-1 text-left">
                      Payload Inspector (Event Metadata)
                    </span>
                    {selectedEvent || eventStream[0] ? (
                      (() => {
                        const evt = selectedEvent || eventStream[0];
                        return (
                          <div className="flex flex-col gap-1.5 text-left leading-normal font-mono">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-400">Event ID:</span>
                              <strong className="text-slate-200">{evt.id}</strong>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-450">Canal / Fonte:</span>
                              <strong className="text-cyan-400">{evt.source}</strong>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-450">Operador:</span>
                              <strong className="text-slate-300">{evt.operator}</strong>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-450">Audit Persistence:</span>
                              <strong className={evt.persistedInDb || evt.priority === "CRITICAL" || evt.priority === "HIGH" ? "text-emerald-400 font-bold" : "text-amber-400"}>
                                {evt.persistedInDb || evt.priority === "CRITICAL" || evt.priority === "HIGH" ? "✓ PostgreSQL DB (Audit Trail Saved)" : "Transient Memory"}
                              </strong>
                            </div>
                            <div className="flex flex-col gap-0.5 mt-1 bg-slate-900/60 p-2 rounded border border-slate-900">
                              <span className="text-[8px] text-slate-500 uppercase font-black text-left">Audit Ledger Hash (SHA-256):</span>
                              <span className="text-[9.5px] text-emerald-400 select-all tracking-tight break-all text-left">{evt.auditHash}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 bg-[#05070a] p-2 rounded border border-slate-900">
                              <span className="text-[8px] text-slate-500 uppercase font-black text-left">Payload Data:</span>
                              <pre className="text-[9.5px] text-cyan-300 overflow-x-auto whitespace-pre font-mono scrollbar-none max-h-[50px] text-left">
                                {JSON.stringify(evt.payload, null, 2)}
                              </pre>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-slate-650 italic text-center py-6">Nenhum evento selecionado</span>
                    )}
                  </div>

                  {/* EMIT CUSTOM ACTION WIDGET */}
                  <div className="bg-[#05080c] border border-slate-900 rounded-xl p-3 flex flex-col gap-2">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block border-b border-slate-900 pb-1 text-left">
                      Publicar Evento (Simulador)
                    </span>
                    
                    <div className="flex flex-col gap-1.5">
                      <select
                        value={customEventType}
                        onChange={(e) => setCustomEventType(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-xxs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 text-left"
                      >
                        <option value="ALERTA_CONTINGENCIA">⚠️ ALERTA_CONTINGENCIA</option>
                        <option value="AUDITORIA_INSPECAO">⚖️ AUDITORIA_INSPECAO</option>
                        <option value="BIOMETRIA_SINC">👤 BIOMETRIA_SINC</option>
                        <option value="ORDEM_SUPERIOR">👑 ORDEM_SUPERIOR</option>
                      </select>
                      
                      <input
                        type="text"
                        placeholder="Mensagem ex: Inspeção de segurança..."
                        value={customEventMsg}
                        onChange={(e) => setCustomEventMsg(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-xxs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 text-left"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                          {["NORMAL", "HIGH", "CRITICAL"].map((p) => (
                            <button
                              type="button"
                              key={p}
                              onClick={() => setCustomEventPriority(p)}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border transition-all cursor-pointer ${
                                customEventPriority === p 
                                  ? p === "CRITICAL"
                                    ? "bg-rose-500 text-slate-950 border-rose-500"
                                    : p === "HIGH"
                                      ? "bg-amber-500 text-slate-950 border-amber-500"
                                      : "bg-slate-300 text-slate-950 border-slate-300"
                                  : "text-slate-500 border-slate-900 hover:border-slate-850"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const msg = customEventMsg.trim() || `Disparo de teste: ${customEventType} emitido.`;
                            const newEvt = eventBus.publish({
                              type: customEventType,
                              priority: customEventPriority as any,
                              category: (customEventType === "ALERTA_CONTINGENCIA" ? "SEGURANÇA" : customEventType === "AUDITORIA_INSPECAO" ? "GOVERNAÇÃO" : customEventType === "ORDEM_SUPERIOR" ? "GOVERNAÇÃO" : "OPERACIONAL") as any,
                              source: "ManualConsola",
                              operator: currentOperator?.name || "Operador Consola",
                              message: msg,
                              payload: { triggerSource: "ManualConsola", priorityLevel: customEventPriority, customNotes: "Emitido via console de homologação" }
                            });
                            setSelectedEvent(newEvt);
                            setCustomEventMsg("");
                          }}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded text-xxs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shadow"
                        >
                          <Send className="h-2.5 w-2.5 fill-current text-slate-950" />
                          <span>Disparar</span>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW A: POSTGRESQL CLUSTER CONFIGURATION PANEL (THE CENTRAL PRIORITY)
          ========================================================================= */}
      {activeSubTab === "postgres" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* TOP EXPLANATIVE BANNER */}
          <div className="bg-gradient-to-r from-slate-950 to-[#0e121a] border border-slate-900 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-500 shrink-0">
                <Database className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 text-slate-950 text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    CONECTOR CANÓNICO DB
                  </span>
                  <span className="text-slate-500 text-xs font-mono">• Postgres Centralizado pnap_db</span>
                </div>
                <h1 className="text-lg font-bold font-sans tracking-tight text-slate-100 mt-1">
                  Painel Administrativo do Cluster de Dados PostgreSQL
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Consola unificada para gerir a alta-disponibilidade da base de dados centralizada <strong>'pnap_db'</strong>. Configure failovers automatizados, controle pools de leitura/escrita e acompanhe em tempo real as latências de replicação física inter-provincial via fibra e satélite.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={triggerNetworkFluctuation}
                disabled={isNetworkFluctuating}
                className="bg-slate-900 hover:bg-slate-850 text-amber-500 border border-slate-850 font-mono text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Testar resiliência do balanceador forçando ruído no canal de rede"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isNetworkFluctuating ? "animate-spin" : ""}`} />
                <span>Provocar Oscilação de Latência</span>
              </button>
            </div>
          </div>

          {/* HUD DE ALERTA DE DESASTRE EM TEMPO REAL */}
          {activeDisaster && (
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-5 shadow-2xl relative overflow-hidden animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 animate-shimmer" />
              <div className="flex items-start gap-4">
                <div className="bg-rose-500/20 border border-rose-500/40 p-3.5 rounded-xl text-rose-400 shrink-0 flex items-center justify-center animate-bounce">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-500 text-slate-950 text-[9.5px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded animate-pulse">
                      SISTEMA EM ALERTA DE DESASTRE
                    </span>
                    <span className="text-rose-400 text-xs font-mono font-bold">• ID: {activeDisaster.id} • {activeDisaster.timestamp}</span>
                  </div>
                  <h2 className="text-sm font-black font-mono tracking-tight text-rose-200 mt-1.5 uppercase">
                    {activeDisaster.title}
                  </h2>
                  <p className="text-xs text-rose-300/80 mt-1 max-w-3xl leading-relaxed">
                    {activeDisaster.details}
                  </p>
                  
                  {activeDisaster.chosenMaster && (
                    <div className="mt-2.5 bg-slate-950/60 border border-rose-900/40 p-2.5 rounded-lg text-xs flex flex-wrap gap-x-4 gap-y-1 font-mono">
                      <span className="text-slate-400">Master Promovido: <strong className="text-emerald-400 font-bold">{activeDisaster.chosenMaster}</strong></span>
                      <span className="text-slate-400">Canal de Replicação: <strong className="text-cyan-400 font-bold">Lógico Reestabelecido</strong></span>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeDisaster.triggeredChannels?.map((channel: string, i: number) => (
                      <span key={i} className="bg-slate-950/80 border border-slate-800 text-[9.5px] font-mono px-2 py-1 rounded text-slate-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                <div className="flex justify-between items-center text-rose-400 font-mono text-[10px] uppercase font-bold bg-rose-500/10 px-3 py-1.5 rounded border border-rose-500/20 mb-1">
                  <span>Sirene: {activeDisaster.sirenOn ? "⚠️ ATIVA" : "🔇 SILENCIADA"}</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setActiveDisaster(null);
                    addClusterLog("SUCCESS", "✅ [OPERATOR] Alerta de desastre reconhecido e silenciado pelo operador central.");
                  }}
                  className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xxs uppercase tracking-wider font-mono px-4 py-2.5 rounded-lg transition-all text-center cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  Reconhecer e Limpar Alerta
                </button>
              </div>
            </div>
          )}

          {/* GRID DE MÓDULOS DE CONFIGURAÇÃO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1: TOPOLOGIA E ESTADO DO CLUSTER (8 SPANS) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* INTERACTIVE NODES LIST */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
                <div 
                  className="flex items-center justify-between pb-3 border-b border-slate-950/60 cursor-pointer select-none"
                  onClick={() => setCollapsedSections(prev => ({ ...prev, topology: !prev.topology }))}
                >
                  <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Server className="h-4 w-4 text-amber-500 animate-pulse" />
                    Topologia Corrente do Cluster & Distribuição de Carga
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                      Sincronização Ativa (Streaming Replication)
                    </span>
                    {collapsedSections.topology ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {!collapsedSections.topology && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {nodes.map((node) => {
                        const isFailed = node.status === "OFFLINE";
                        const isMaster = node.role.includes("PRIMARY");
                        const nodeLatency = node.id === "node-1" ? 0 :
                                            node.id === "node-2" ? latencies.luandaLocal :
                                            node.id === "node-3" ? latencies.benguela :
                                            node.id === "node-4" ? latencies.huambo :
                                            node.id === "node-5" ? latencies.cabinda : latencies.moxico;

                        return (
                          <div 
                            key={node.id} 
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                              isFailed 
                                ? "bg-rose-950/20 border-rose-900/60 text-rose-200" 
                                : isMaster 
                                  ? "bg-amber-500/5 border-amber-500/40 shadow-md shadow-amber-500/5" 
                                  : "bg-[#0b0f16] border-slate-850 hover:border-slate-800"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col min-w-0">
                                <span className="text-xxs font-mono text-slate-500">{node.ip}</span>
                                <span className="text-xs font-bold font-sans text-slate-200 truncate mt-0.5">{node.name}</span>
                              </div>

                              <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                isFailed 
                                  ? "bg-rose-500 text-slate-950 animate-pulse" 
                                  : isMaster 
                                    ? "bg-amber-500 text-slate-950" 
                                    : "bg-slate-900 text-slate-300 border border-slate-800"
                              }`}>
                                {node.role}
                              </span>
                            </div>

                            {/* Status + Conn stats */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-950/40 text-[10.5px] font-mono">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isFailed ? "bg-rose-500 animate-ping" : "bg-emerald-500 animate-pulse"}`}></span>
                                <span className={isFailed ? "text-rose-400 font-bold" : "text-slate-400"}>
                                  {node.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-slate-400">
                                  Conexões: <strong className={isFailed ? "text-rose-500" : "text-slate-200"}>{node.connections}</strong>
                                </span>
                                {!isFailed && !isMaster && (
                                  <span className="text-[10px] text-amber-500/80">
                                    Latência: <strong>{nodeLatency.toFixed(1)}ms</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* VISUAL LAYOUT ROUTING PATH */}
                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 mt-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-[0.03] pointer-events-none" />
                      
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-3">Roteamento Ativo de Queries da pnap_db</span>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Haproxy client input */}
                        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center w-full sm:w-auto">
                          <span className="text-[9px] font-mono text-cyan-400 block font-bold leading-none">Gateway Svc</span>
                          <span className="text-[10px] text-slate-300 font-bold mt-1 block">API Request</span>
                        </div>

                        <ArrowRight className="h-4 w-4 text-slate-700 rotate-90 sm:rotate-0" />

                        {/* Haproxy load balancer */}
                        <div className="bg-[#0e1624] border border-cyan-500/20 p-3 rounded-lg text-center w-full sm:w-56 relative group">
                          <span className="text-[9px] font-mono text-amber-500 block font-black leading-none">Proxy Balanceador (HAProxy)</span>
                          <span className="text-[11px] font-mono font-bold text-slate-150 mt-1 block">Algoritmo: {lbAlgorithm.toUpperCase()}</span>
                          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        </div>

                        <ArrowRight className="h-4 w-4 text-slate-700 rotate-90 sm:rotate-0" />

                        {/* Masters vs Replicas bifurcation */}
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded text-left flex justify-between gap-6">
                            <span className="text-[10px] font-mono font-bold text-slate-250">Rotas de Escrita (DML)</span>
                            <span className="text-[10px] text-amber-500 font-mono font-bold">👉 Node Master (Sempre 10.0.1.X)</span>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-left flex justify-between gap-6">
                            <span className="text-[10px] font-mono font-bold text-slate-250">Rotas de Leitura (DQL)</span>
                            <span className="text-[10px] text-cyan-400 font-mono font-bold">👉 Réplicas Inter-Provinciais</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* REPLICATION LATENCY CHART & GEOGRAPHY MONITOR */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
                <div 
                  className="flex justify-between items-center pb-2 border-b border-slate-950/60 cursor-pointer select-none"
                  onClick={() => setCollapsedSections(prev => ({ ...prev, latency: !prev.latency }))}
                >
                  <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    Monitorização em Tempo Real: Latência de Replicação Física Inter-Provincial
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-500">Limiar Recomendado: &lt; 100ms (SLA-MININT)</span>
                    {collapsedSections.latency ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {!collapsedSections.latency && (
                  <div className="flex flex-col gap-4">
                    {[
                      { prov: "LUANDA CENTRAL (Local LAN)", lat: latencies.luandaLocal, percent: 1, limit: 2, desc: "Fisiográfica centralizada. Rede local GigaEthernet.", color: "bg-emerald-500" },
                      { prov: "REPLICA BENGUELA (MPLS)", lat: latencies.benguela, percent: 24, limit: 100, desc: "Fibra óptica redundante MININT. Sem perdas detetadas.", color: "bg-emerald-500" },
                      { prov: "REPLICA HUAMBO (MPLS)", lat: latencies.huambo, percent: 42, limit: 100, desc: "Conexão micro-ondas e fibra terrestre. Desempenho estável.", color: "bg-emerald-500" },
                      { prov: "REPLICA CABINDA (Submarino)", lat: latencies.cabinda, percent: latencies.cabinda > 100 ? 98 : 78, limit: 100, desc: "Cabo submarino Angola Cables com fallback rádio.", color: latencies.cabinda > 100 ? "bg-rose-500" : "bg-amber-500" },
                      { prov: "REPLICA MOXICO (Satélite)", lat: latencies.moxico, percent: latencies.moxico > 150 ? 100 : 84, limit: 100, desc: "Link via satélite geoestacionário. Latência inherentemente maior.", color: latencies.moxico > 150 ? "bg-rose-600 animate-pulse" : "bg-amber-600" }
                    ].map((item, index) => {
                      const isOverLimit = item.lat >= item.limit;
                      return (
                        <div key={index} className="flex flex-col gap-1 text-xs">
                          <div className="flex justify-between font-mono">
                            <span className="text-slate-200 font-bold tracking-tight">{item.prov}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 italic text-[10px] hidden md:inline">{item.desc}</span>
                              <span className={`font-bold font-mono px-2 py-0.5 rounded text-[10.5px] ${isOverLimit ? "bg-rose-500 text-slate-950 font-black animate-pulse" : "bg-slate-950 text-slate-300"}`}>
                                {item.lat.toFixed(1)} ms
                              </span>
                            </div>
                          </div>
                          
                          {/* Progress bar container */}
                          <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                              style={{ width: `${Math.min(100, (item.lat / (item.prov.includes("LUANDA") ? 3 : 150)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* COLUMN 2: FAILOVER E BALANCEAMENTO (4 SPANS) */}
            <div className="lg:col-span-4 flex flex-col gap-6">

              {/* FAILOVER SETTINGS BLOCK */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
                <div 
                  className="pb-2 border-b border-slate-950/60 cursor-pointer select-none flex justify-between items-start"
                  onClick={() => setCollapsedSections(prev => ({ ...prev, failover: !prev.failover }))}
                >
                  <div>
                    <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                      Definições de Failover Ativo
                    </h3>
                    <p className="text-xxs text-slate-400 mt-1">
                      Evite perdas catastróficas de dados ou quedas no registo nacional.
                    </p>
                  </div>
                  {collapsedSections.failover ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
                </div>

                {!collapsedSections.failover && (
                  <div className="flex flex-col gap-4 text-xs font-mono animate-fadeIn">
                    {/* Mode Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-400 uppercase">Modo de Failover</label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-900">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAutoFailover(true);
                            addClusterLog("INFO", "Failover de pnap_db alterado para modo AUTOMÁTICO.");
                          }}
                          className={`py-1 text-center text-xxs font-bold uppercase rounded cursor-pointer transition-all ${
                            isAutoFailover 
                              ? "bg-amber-500 text-slate-950" 
                              : "text-slate-450 hover:text-slate-200"
                          }`}
                        >
                          Automático
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAutoFailover(false);
                            addClusterLog("WARN", "ALERTA: Failover automatizado desabilitado pelo operador. Modo MANUAL ativo.");
                          }}
                          className={`py-1 text-center text-xxs font-bold uppercase rounded cursor-pointer transition-all ${
                            !isAutoFailover 
                              ? "bg-rose-500 text-slate-950" 
                              : "text-slate-450 hover:text-slate-200"
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>

                    {/* Timeout Slider */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase">
                        <span>Tempo Limite de Failover (Heartbeat)</span>
                        <span className="text-amber-500 font-bold">{failoverTimeout}s</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={failoverTimeout}
                        onChange={(e) => setFailoverTimeout(Number(e.target.value))}
                        className="accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                      />
                      <span className="text-[8.5px] text-slate-500 leading-normal">
                        Se o master não responder aos batimentos em {failoverTimeout}s, inicia a eleição de quorum automática da replica local estável.
                      </span>
                    </div>

                    {/* Split-Brain protection */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-start gap-2.5">
                      <Lock className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9.5px] text-slate-200 uppercase font-black leading-none">Proteção Split-Brain</span>
                        <span className="text-[8.5px] text-slate-500 mt-1 leading-normal">
                          Fencing ativo por rede redundante e desativação física do barramento do master caido via IPMI / STONITH.
                        </span>
                      </div>
                    </div>

                    {/* DRP Failover manual trigger button */}
                    <button
                      type="button"
                      onClick={forceManualFailover}
                      disabled={isSimulatingFailover}
                      className="w-full bg-rose-500 hover:bg-rose-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xxs uppercase tracking-wider font-mono py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer shadow-lg shadow-rose-500/10"
                    >
                      {isSimulatingFailover ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" /> Processando Failover de Quorum...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3 fill-slate-950" /> Forçar Failover Manual (DRP)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* LOAD BALANCING SETTINGS */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
                <div 
                  className="pb-2 border-b border-slate-950/60 cursor-pointer select-none flex justify-between items-start"
                  onClick={() => setCollapsedSections(prev => ({ ...prev, loadbalancer: !prev.loadbalancer }))}
                >
                  <div>
                    <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                      Balanceador 'pnap_db'
                    </h3>
                    <p className="text-xxs text-slate-400 mt-1">
                      Distribuição dinâmica de requisições de leitura (DQL) no território.
                    </p>
                  </div>
                  {collapsedSections.loadbalancer ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
                </div>

                {!collapsedSections.loadbalancer && (
                  <div className="flex flex-col gap-4 text-xs font-mono animate-fadeIn">
                    {/* Algoritmo de balanceamento */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-400 uppercase">Algoritmo de Roteamento</label>
                      <select
                        value={lbAlgorithm}
                        onChange={(e: any) => {
                          setLbAlgorithm(e.target.value);
                          addClusterLog("INFO", `Algoritmo do balanceamento pnap_db alterado para: ${e.target.value.toUpperCase()}`);
                        }}
                        className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xxs font-mono text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="least-connections">Least Connections (Mais recomendado)</option>
                        <option value="round-robin">Round-Robin Sequencial</option>
                        <option value="latency-based">Latency-Based (Baseado em Latência)</option>
                      </select>
                    </div>

                    {/* Pools de Conexão */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col gap-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400 font-bold">POOL DE LEITURA (RO)</span>
                        <span className="text-cyan-400 font-black">450 Conexões Max</span>
                      </div>
                      <div className="flex justify-between text-[10px] border-t border-slate-900 pt-2 mt-1">
                        <span className="text-slate-400 font-bold">POOL DE ESCRITA (RW)</span>
                        <span className="text-amber-500 font-black">150 Conexões Max</span>
                      </div>
                    </div>

                    <span className="text-[8.5px] text-slate-500 leading-normal">
                      O balanceador distribui as conexões baseando-se no peso dinâmico de cada réplica provincial. Nodes em Luanda absorvem escritas locais, enquanto requisições de consulta territoriais são resolvidas nas réplicas regionais.
                    </span>
                  </div>
                )}
              </div>

              {/* PROMOTION RULES & DISASTER ALERTS CONFIG */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
                <div 
                  className="pb-2 border-b border-slate-950/60 cursor-pointer select-none flex justify-between items-start"
                  onClick={() => setCollapsedSections(prev => ({ ...prev, promotionRules: !prev.promotionRules }))}
                >
                  <div>
                    <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                      Regras de Promoção & Alertas
                    </h3>
                    <p className="text-xxs text-slate-400 mt-1">
                      Defina políticas de quorum, prioridades de nós e canais de emergência.
                    </p>
                  </div>
                  {collapsedSections.promotionRules ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
                </div>

                {!collapsedSections.promotionRules && (
                  <div className="flex flex-col gap-4 text-xs font-mono animate-fadeIn">
                    
                    {/* Estratégia de eleição */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-400 uppercase">Estratégia de Eleição</label>
                      <select
                        value={promotionStrategy}
                        onChange={(e: any) => {
                          setPromotionStrategy(e.target.value);
                          addClusterLog("INFO", `Regra de eleição alterada para priorizar: ${e.target.value === "priority" ? "Prioridade Manual" : "Menor Latência"}`);
                        }}
                        className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xxs font-mono text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="priority">Prioridade Manual Configurada</option>
                        <option value="latency">Menor Latência Física de Replicação</option>
                      </select>
                    </div>

                    {/* Limite máximo de lag tolerado */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase">
                        <span>Limiar Máximo LSN Lag</span>
                        <span className="text-amber-500 font-bold">{maxAllowedLagMb} MB</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="256"
                        step="16"
                        value={maxAllowedLagMb}
                        onChange={(e) => setMaxAllowedLagMb(Number(e.target.value))}
                        className="accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                      />
                      <span className="text-[8.5px] text-slate-500 leading-normal">
                        Nós com lag superior a {maxAllowedLagMb}MB são desqualificados para evitar perda de dados (Data Loss).
                      </span>
                    </div>

                    {/* Tabela de Prioridades de Nós Secundários */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-400 uppercase">Prioridades de Promoção</label>
                      <div className="bg-slate-950 rounded-lg border border-slate-850 p-2.5 flex flex-col gap-2">
                        {[
                          { id: "node-2", name: "Luanda (02)", defaultLag: 0.2 },
                          { id: "node-3", name: "Benguela (03)", defaultLag: 2.4 },
                          { id: "node-4", name: "Huambo (04)", defaultLag: 8.1 },
                          { id: "node-5", name: "Cabinda (05)", defaultLag: 54.2 },
                          { id: "node-6", name: "Moxico (06)", defaultLag: 128.5 }
                        ].map((nodeInfo) => {
                          const currentPrio = promotionPriorities[nodeInfo.id] || 5;
                          const isLaggingTooMuch = nodeInfo.defaultLag > maxAllowedLagMb;

                          return (
                            <div key={nodeInfo.id} className="flex items-center justify-between gap-2 border-b border-slate-900 last:border-0 pb-1.5 last:pb-0">
                              <div className="flex flex-col min-w-0">
                                <span className="text-xxs text-slate-300 font-bold truncate">{nodeInfo.name}</span>
                                <span className={`text-[8.5px] font-bold ${isLaggingTooMuch ? "text-rose-500" : "text-slate-500"}`}>
                                  Lag Est: {nodeInfo.defaultLag.toFixed(1)}MB {isLaggingTooMuch && "⚠️"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[9px] text-slate-500 mr-1">Prioridade:</span>
                                <select
                                  value={currentPrio}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setPromotionPriorities(prev => ({ ...prev, [nodeInfo.id]: val }));
                                    addClusterLog("INFO", `Prioridade de promoção do nó ${nodeInfo.name} alterada para: ${val}`);
                                  }}
                                  className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[9.5px] text-amber-500 focus:outline-none focus:border-amber-500 cursor-pointer"
                                >
                                  <option value={1}>1 (Alta)</option>
                                  <option value={2}>2 (Média-Alta)</option>
                                  <option value={3}>3 (Média)</option>
                                  <option value={4}>4 (Média-Baixa)</option>
                                  <option value={5}>5 (Baixa)</option>
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Checkbox para Consenso de Quorum */}
                    <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <input
                        type="checkbox"
                        id="require-quorum"
                        checked={requireQuorum}
                        onChange={(e) => {
                          setRequireQuorum(e.target.checked);
                          addClusterLog("INFO", `Consenso de Quorum de Maioria Simples ${e.target.checked ? "HABILITADO" : "DESABILITADO"}`);
                        }}
                        className="accent-amber-500 h-3.5 w-3.5 cursor-pointer rounded bg-slate-900 border-slate-800 text-amber-500"
                      />
                      <label htmlFor="require-quorum" className="text-[9.5px] text-slate-300 font-bold cursor-pointer select-none">
                        Exigir Quorum de Consenso de Réplicas
                      </label>
                    </div>

                    {/* Canais de Alerta de Desastre */}
                    <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-3 mt-1">
                      <label className="text-[10px] text-slate-400 uppercase">Canais de Alerta em Tempo Real</label>
                      
                      <div className="grid grid-cols-2 gap-2 mt-0.5">
                        <label className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded border border-slate-850 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={alertChannels.sms}
                            onChange={(e) => setAlertChannels(prev => ({ ...prev, sms: e.target.checked }))}
                            className="accent-amber-500"
                          />
                          <span className="text-[9px] text-slate-300">Disparo SMS</span>
                        </label>

                        <label className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded border border-slate-850 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={alertChannels.email}
                            onChange={(e) => setAlertChannels(prev => ({ ...prev, email: e.target.checked }))}
                            className="accent-amber-500"
                          />
                          <span className="text-[9px] text-slate-300">Disparo E-mail</span>
                        </label>

                        <label className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded border border-slate-850 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={alertChannels.siren}
                            onChange={(e) => setAlertChannels(prev => ({ ...prev, siren: e.target.checked }))}
                            className="accent-amber-500"
                          />
                          <span className="text-[9px] text-slate-300">Sirene Consola</span>
                        </label>

                        <label className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded border border-slate-850 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={alertChannels.webhook}
                            onChange={(e) => setAlertChannels(prev => ({ ...prev, webhook: e.target.checked }))}
                            className="accent-amber-500"
                          />
                          <span className="text-[9px] text-slate-300">Webhook POST</span>
                        </label>
                      </div>

                      {/* Inputs de detalhes de contato */}
                      <div className="flex flex-col gap-2 mt-1.5 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        {alertChannels.sms && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[8.5px] text-slate-500">Telefone Destinatário</span>
                            <input
                              type="text"
                              value={alertPhone}
                              onChange={(e) => setAlertPhone(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none"
                            />
                          </div>
                        )}

                        {alertChannels.email && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[8.5px] text-slate-500">E-mail de Emergência</span>
                            <input
                              type="email"
                              value={alertEmail}
                              onChange={(e) => setAlertEmail(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none"
                            />
                          </div>
                        )}

                        {alertChannels.webhook && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[8.5px] text-slate-500">URL Endpoint do Webhook</span>
                            <input
                              type="text"
                              value={disasterWebhook}
                              onChange={(e) => setDisasterWebhook(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* REALTIME SYSTEM JOURNAL LOGGER (MONOCHROME LOGGER) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-3">
            <div 
              className="flex justify-between items-center pb-2 border-b border-slate-950/60 cursor-pointer select-none"
              onClick={() => setCollapsedSections(prev => ({ ...prev, journal: !prev.journal }))}
            >
              <div className="flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-250">
                  Diário Forense do Cluster de Dados (pnap_db PostgreSQL Logs)
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-slate-500">Filtrado por: PostgresAgent central</span>
                {collapsedSections.journal ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
              </div>
            </div>

            {!collapsedSections.journal && (
              <>
                <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 font-mono text-xxs min-h-[140px] max-h-[220px] overflow-y-auto relative flex flex-col gap-1.5 scrollbar-thin animate-fadeIn">
                  {clusterLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-left leading-normal font-mono select-text">
                      <span className="text-slate-600 shrink-0 font-bold">[{log.timestamp}]</span>
                      <span className={`shrink-0 font-bold px-1 rounded text-[9.5px] ${
                        log.level === "CRITICAL" ? "bg-rose-500 text-slate-950" :
                        log.level === "WARN" ? "bg-amber-500 text-slate-950" :
                        log.level === "SUCCESS" ? "bg-emerald-500 text-slate-950" : "bg-slate-850 text-slate-300"
                      }`}>
                        {log.level}
                      </span>
                      <span className={log.level === "CRITICAL" ? "text-rose-400 font-bold" : log.level === "WARN" ? "text-amber-400" : log.level === "SUCCESS" ? "text-emerald-450" : "text-slate-300"}>
                        {log.msg}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500 leading-none">
                  <span>LSN Consistente: <strong className="text-amber-500">0/1A04FF98</strong></span>
                  <span>Integridade SHA255: Criptograficamente Assinado por Auditoria Geral</span>
                </div>
              </>
            )}
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW B: ORIGINAL SERVICES GATEWAY MICROSERVICES PANEL
          ========================================================================= */}
      {activeSubTab === "services" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* ORIGINAL MICROSERVICES GATEWAY TELEMETRY HEADER */}
          <div className="bg-gradient-to-r from-cyan-950 to-slate-950 border border-cyan-900/40 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-xl text-cyan-400">
                <Server className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-cyan-500 text-slate-950 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                    GATEWAY CONSÓRCIO
                  </span>
                  <span className="text-slate-500 text-xs font-mono">• Gateway API Centralizado</span>
                </div>
                <h1 className="text-xl font-bold font-sans tracking-tight text-slate-100 mt-1">
                  Arquitetura Baseada em Serviços (SICP-AO)
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Nossa arquitetura foi industrializada e fatiada em 9 microsserviços especializados coordenados por uma API Gateway central. Isso permite escalabilidade horizontal e isolamento de falhas regulamentadas pelo MININT.
                </p>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={fetchTelemetry}
                className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-900/30 font-bold text-xxs uppercase tracking-wider font-mono px-4.5 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Sincronizar Telemetria
              </button>
            </div>
          </div>

          {/* DYNAMIC TELEMETRY HUD */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <div 
              className="flex justify-between items-center pb-2 border-b border-slate-950/60 cursor-pointer select-none"
              onClick={() => setCollapsedSections(prev => ({ ...prev, telemetryHud: !prev.telemetryHud }))}
            >
              <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                Módulo de Telemetria Dinâmica & Topologia do Consórcio
              </h3>
              {collapsedSections.telemetryHud ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
            </div>

            {!collapsedSections.telemetryHud && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                {/* NETWORK & SYSTEM METRICS */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                      <span className="text-xxs text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                        <Globe className="h-3 w-3 text-cyan-400" /> Gateway Status
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                        ● COMUNICAÇÃO ATIVA
                      </span>
                    </div>
                    
                    <div className="mt-4 flex flex-col gap-3 text-xs">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Região de Deploy:</span>
                        <span className="text-slate-300">europe-west1 (Cloud Run)</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Proxy Ingress:</span>
                        <span className="text-slate-300">0.0.0.0:3000 (Nginx CJS)</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">API Gateway Versão:</span>
                        <span className="text-cyan-400 font-bold">v2.4-Production</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Sincronização Central:</span>
                        <span className="text-slate-300">Híbrida (Prisma + JSON)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 bg-cyan-950/40 p-3 rounded-lg border border-cyan-900/20 text-[10px] font-mono leading-relaxed text-cyan-350">
                    O Gateway API unifica as chamadas do cliente e redireciona com roteamento inteligente, garantindo alta disponibilidade mesmo com oscilações no MININT.
                  </div>
                </div>

                {/* LOGICAL SERVICES MAP */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 shadow-md md:col-span-2 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                    <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-cyan-400" /> Topologia do Consórcio de Serviços
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">Gateway API Orchestrator</span>
                  </div>

                  {/* Topology diagram visualization */}
                  <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-900 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                    {/* Visual Center: API Gateway */}
                    <div className="z-10 bg-cyan-950 border border-cyan-500/50 rounded-xl p-3 shadow-xl flex items-center gap-2 max-w-[200px] text-center">
                      <Server className="h-4 w-4 text-cyan-400 shrink-0" />
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-mono text-cyan-400 uppercase font-black leading-none">Gateway API</span>
                        <span className="text-[11px] font-bold text-slate-100 mt-1">/api/backoffice/*</span>
                      </div>
                    </div>

                    {/* Connecting lines & sub services labels */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 w-full mt-6 z-10 text-center">
                      <div className="bg-slate-950 border border-slate-900 p-2 rounded-lg flex flex-col items-center">
                        <span className="text-[9px] font-mono text-blue-400 font-bold">Identity</span>
                        <span className="text-[8px] text-slate-500">Auth / RBAC</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-900 p-2 rounded-lg flex flex-col items-center">
                        <span className="text-[9px] font-mono text-red-400 font-bold">Security</span>
                        <span className="text-[8px] text-slate-500">Threat / Cells</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-900 p-2 rounded-lg flex flex-col items-center">
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">Health</span>
                        <span className="text-[8px] text-slate-500">Clinical logs</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-900 p-2 rounded-lg flex flex-col items-center">
                        <span className="text-[9px] font-mono text-amber-400 font-bold">Alerts</span>
                        <span className="text-[8px] text-slate-500">SMS / Email</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-900 p-2 rounded-lg flex flex-col items-center">
                        <span className="text-[9px] font-mono text-purple-400 font-bold">AI Service</span>
                        <span className="text-[8px] text-slate-500">Prediction</span>
                      </div>
                    </div>

                    {/* Micro grid dots behind */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:14px_24px] opacity-[0.06] pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TWO COLUMN INTERACTIVE SIMULATOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <div 
              className="flex justify-between items-center pb-2 border-b border-slate-950/60 cursor-pointer select-none"
              onClick={() => setCollapsedSections(prev => ({ ...prev, simulator: !prev.simulator }))}
            >
              <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Code className="h-4 w-4 text-cyan-400 animate-pulse" />
                Simulador Interativo de Chamadas de Microsserviços via Gateway API
              </h3>
              {collapsedSections.simulator ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
            </div>

            {!collapsedSections.simulator && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* MICROSERVICES SELECTION RAIL */}
            <div className="flex flex-col gap-3">
              <span className="text-xxs font-mono uppercase tracking-widest text-slate-400 mb-1 font-semibold border-l-2 border-cyan-500 pl-2">
                Selecione o Serviço para Teste
              </span>

              <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
                {servicesList.map((srv) => {
                  const Icon = srv.icon;
                  const isSelected = activeSimulator === srv.id;
                  
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => {
                        setActiveSimulator(srv.id);
                        setSimResponse(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all flex gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500 text-cyan-100 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-450 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div className={`p-2 bg-slate-950 rounded-lg ${srv.color}`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-200 font-sans">{srv.name}</span>
                        <span className="text-[10px] text-slate-400 truncate mt-0.5">{srv.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE SIMULATOR INTERFACE & LOG OUTPUT */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between min-h-[480px]">
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-950/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Code className="h-4.5 w-4.5 text-cyan-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-250">
                      Consola do Operador: {activeSimulator} Service
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Live API Bridge</span>
                </div>

                {/* DYNAMIC FORM PARAMETERS ACCORDING TO SERVICE */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-4">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-black tracking-wider block">
                    Parâmetros da Chamada (Request Body)
                  </span>

                  {activeSimulator === "Identity" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Email do Oficial</label>
                        <input
                          type="email"
                          value={simEmail}
                          onChange={(e) => setSimEmail(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xxs font-mono text-slate-200 w-full focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Senha Criptográfica</label>
                        <input
                          type="password"
                          value={simPassword}
                          onChange={(e) => setSimPassword(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xxs font-mono text-slate-200 w-full focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  )}

                  {activeSimulator === "Security" && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Tipo de Evento</label>
                          <select
                            value={simIncidentType}
                            onChange={(e) => setSimIncidentType(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xxs font-mono text-slate-200 w-full focus:outline-none focus:border-cyan-500"
                          >
                            <option value="Fuga">Tentativa de Fuga / Evasão</option>
                            <option value="Agressao">Desacatos / Agressão Física</option>
                            <option value="Contrabando">Posse de Telemóvel ou Arma</option>
                            <option value="Greve">Greve de Fome / Resistência</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Unidade Prisional</label>
                          <select
                            value={simSelectedPrison}
                            onChange={(e) => setSimSelectedPrison(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xxs font-mono text-slate-200 w-full focus:outline-none focus:border-cyan-500 animate-none"
                          >
                            <option value="PRIS-HUAMBO">Central do Huambo</option>
                            <option value="PRIS-VIANA">EP Viana (Luanda)</option>
                            <option value="PRIS-BENGUELA">EP Benguela</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Detalhes e Evidências</label>
                        <input
                          type="text"
                          value={simIncidentDetails}
                          onChange={(e) => setSimIncidentDetails(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xxs font-mono text-slate-200 w-full focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  )}

                  {activeSimulator === "Audit" && (
                    <div className="text-xxs text-slate-400 leading-relaxed font-mono">
                      <span className="text-amber-500 font-bold block mb-1">✓ MÓDULO TOTALMENTE AUTOMÁTICO</span>
                      Inspeção da trilha de auditoria forense criptografada do MININT. Não requer parâmetros manuais.
                    </div>
                  )}

                  {activeSimulator === "Health" && (
                    <div className="text-xxs text-slate-400 leading-relaxed font-mono">
                      <span className="text-emerald-500 font-bold block mb-1">✓ REGULAÇÃO CLÍNICA DA SAÚDE</span>
                      Consulte prontuários médicos, status de medicamentos, e avaliações gerais de conformidade sanitária.
                    </div>
                  )}

                  {activeSimulator === "Transfer" && (
                    <div className="text-xxs text-slate-400 leading-relaxed font-mono flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span>Recluso ID Alvo:</span>
                        <strong className="text-slate-300">REC-HUAMBO-099</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Escolta:</span>
                        <strong className="text-slate-300">PIR (Polícia de Intervenção Rápida)</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Nível de Risco:</span>
                        <strong className="text-red-400">MÁXIMA SEGURANÇA</strong>
                      </div>
                    </div>
                  )}

                  {activeSimulator === "Notification" && (
                    <div className="text-xxs text-slate-400 leading-relaxed font-mono">
                      <span className="text-amber-400 font-bold block mb-1">✓ DISPARO MULTI-CANAL ATIVO (SMS + EMAIL)</span>
                      Simule o envio de notificações automáticas em lote para as equipes prisionais operacionais do MININT.
                    </div>
                  )}

                  {activeSimulator === "HR" && (
                    <div className="text-xxs text-slate-400 leading-relaxed font-mono">
                      <span className="text-indigo-400 font-bold block mb-1">✓ CONTROLO DE PATENTES E NIPs</span>
                      Audita se as patentes militares dos operadores do MININT estão vigentes e conformes com o RBAC do sistema.
                    </div>
                  )}

                  {(activeSimulator === "Prison" || activeSimulator === "AI") && (
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Unidade Avaliada pelo Algoritmo</label>
                      <select
                        value={simSelectedPrison}
                        onChange={(e) => setSimSelectedPrison(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xxs font-mono text-slate-200 w-full focus:outline-none focus:border-cyan-500"
                      >
                        <option value="PRIS-HUAMBO">Central do Huambo (Ocupação: Elevada)</option>
                        <option value="PRIS-VIANA">EP Viana (Luanda) (Ocupação: Crítica)</option>
                        <option value="PRIS-BENGUELA">EP Benguela (Ocupação: Moderada)</option>
                      </select>
                    </div>
                  )}

                  {/* Trigger Button */}
                  <button
                    type="button"
                    onClick={() => runSimulation(activeSimulator)}
                    disabled={isSimulating}
                    className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xxs uppercase tracking-wider font-mono py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer shadow-lg shadow-cyan-500/10"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" /> Processando Chamada ao Serviço...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-slate-950" /> Executar Requisição via Gateway
                      </>
                    )}
                  </button>
                </div>

                {/* RAW RESPONSE MONOCHROME LOGGER */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Saída do Gateway (JSON Response Payload)
                  </span>

                  <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 font-mono text-xxs text-emerald-400 min-h-[140px] max-h-[220px] overflow-y-auto overflow-x-hidden relative flex flex-col justify-between scrollbar-thin">
                    {simResponse ? (
                      <pre className="whitespace-pre-wrap text-left break-all leading-normal text-emerald-400 font-mono">
                        {JSON.stringify(simResponse, null, 2)}
                      </pre>
                    ) : isSimulating ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-2 text-cyan-400 font-mono">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>A aguardar resposta do nó de microsserviço...</span>
                      </div>
                    ) : (
                      <div className="text-slate-500 italic py-6 text-center flex flex-col items-center gap-2 font-mono">
                        <Terminal className="h-6 w-6 text-slate-600" />
                        <span>Nenhum payload ativo na consola. Clique no botão de execução para disparar a API.</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <div className="mt-4 pt-3 border-t border-slate-950/60 flex items-center justify-between text-[10px] font-mono text-slate-500 leading-none">
                <span>Latência média do Gateway: <strong className="text-cyan-400 font-bold">4.2ms</strong></span>
                <span>Segurança: TLS 1.3 Criptografia Militar</span>
              </div>

            </div>

          </div>
            )}
          </div>

          {/* DETAILED MICROSERVICE COMPLIANCE DIRECTORY */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <div 
              className="pb-3 border-b border-slate-850 cursor-pointer select-none flex justify-between items-start"
              onClick={() => setCollapsedSections(prev => ({ ...prev, complianceManual: !prev.complianceManual }))}
            >
              <div>
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-cyan-400" /> Manual de Integração e Conformidade Prisional
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cada serviço exposto na consola executa um papel crucial de isolamento lógico no sistema do MININT.
                </p>
              </div>
              {collapsedSections.complianceManual ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
            </div>

            {!collapsedSections.complianceManual && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-slate-450 animate-fadeIn">
                <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-850">
                  <h4 className="font-mono text-[11px] font-bold uppercase text-slate-200 mb-1 flex items-center gap-1.5">
                    <CornerDownRight className="h-3.5 w-3.5 text-cyan-400" /> 1. Camada de Identidade e Sessão
                  </h4>
                  <p className="text-xxs leading-normal">
                    Gerenciado pelo <strong>Identity Service</strong>, garante tokens JWT efêmeros criptografados que impossibilitam vazamento de logins e senhas. Resguarda a patente do oficial para controle rigoroso de RBAC.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-850">
                  <h4 className="font-mono text-[11px] font-bold uppercase text-slate-200 mb-1 flex items-center gap-1.5">
                    <CornerDownRight className="h-3.5 w-3.5 text-cyan-400" /> 2. Camada de Auditoria Forense
                  </h4>
                  <p className="text-xxs leading-normal">
                    Cada serviço gera carimbos invioláveis no <strong>Audit Service</strong>, enviados em tempo real para a superintendência do MININT em Luanda para auditorias de conformidade com garantia de não-repúdio.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-850">
                  <h4 className="font-mono text-[11px] font-bold uppercase text-slate-200 mb-1 flex items-center gap-1.5">
                    <CornerDownRight className="h-3.5 w-3.5 text-cyan-400" /> 3. Predição e Inteligência AI
                  </h4>
                  <p className="text-xxs leading-normal">
                    O <strong>AI Service</strong> executa cálculos de risco em tempo real para prever sobrelotação crítica e simular rotas de escoltas de segurança máxima antes de ocorrer saturação física.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
