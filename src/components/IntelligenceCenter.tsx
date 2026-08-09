import React, { useState, useEffect, useMemo } from "react";
import { eventBus } from "../utils/eventBus";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  Activity,
  Zap,
  Lock,
  Unlock,
  Users,
  Search,
  Filter,
  Fingerprint,
  Globe,
  RefreshCw,
  Cpu,
  Database,
  FileCode,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  Skull,
  Server,
  Key,
  X,
  Play,
  RotateCcw
} from "lucide-react";

// Interfaces
interface SIEMEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  operatorId: string;
  operatorName: string;
  prisonId: string;
  category: "AUTH" | "PRIVILEGE" | "EXFILTRATION" | "TAMPER" | "NETWORK" | "ANOMALY";
  action: string;
  severity: "CRITICO" | "ALTO" | "MEDIO" | "BAIXO";
  riskScore: number;
  details: string;
  status: "DETECTADO" | "BLOQUEADO" | "MITIGADO" | "MONITORADO";
  correlatedEventId?: string;
}

interface SuspiciousProfile {
  id: string;
  name: string;
  role: string;
  prisonName: string;
  reputationalScore: number; // 0 - 100 (higher is worse)
  status: "QUARENTENA" | "VIGILANCIA" | "LIBERADO";
  lastInfraction: string;
  infractionsCount: number;
  riskFactor: "Surgimento Incomum" | "Abuso de Privilégio" | "Sessões Concorrentes" | "Acesso Fora de Horas";
}

interface CorrelationRule {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  triggersCount: number;
}

export default function IntelligenceCenter({
  prisons,
  inmates,
  operators,
  currentOperator,
  writeAuditLog
}: {
  prisons: any[];
  inmates: any[];
  operators: any[];
  currentOperator: any;
  writeAuditLog: any;
}) {
  // --- STATE MANAGEMENT ---
  const [activeThreatLevel, setActiveThreatLevel] = useState<"NORMAL" | "WARNING" | "ATTACK">("WARNING");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [autoMitigationEnabled, setAutoMitigationEnabled] = useState<boolean>(true);
  const [isInjecting, setIsInjecting] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<{
    title: string;
    description: string;
    severity: string;
    rule: string;
    payload?: string;
  } | null>(null);

  // --- DYNAMIC SIMULATED LISTS ---
  const [siemEvents, setSiemEvents] = useState<SIEMEvent[]>([
    {
      id: "EVT-29103",
      timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
      sourceIp: "10.12.88.42",
      operatorId: "MININT-OP-089",
      operatorName: "Cap. João Mateus",
      prisonId: "PRIS-01",
      category: "AUTH",
      action: "Sessões Simultâneas Concorrentes",
      severity: "ALTO",
      riskScore: 78,
      details: "Sessão duplicada detetada em Luanda e simultaneamente de IP de Benguela no intervalo de 30 segundos.",
      status: "BLOQUEADO"
    },
    {
      id: "EVT-29094",
      timestamp: new Date(Date.now() - 1000 * 180).toISOString(),
      sourceIp: "192.168.42.105",
      operatorId: "MININT-OP-112",
      operatorName: "Tenente Manuel Cruz",
      prisonId: "PRIS-02",
      category: "PRIVILEGE",
      action: "Tentativa de Edição de Chave",
      severity: "MEDIO",
      riskScore: 45,
      details: "Tentativa de alteração de chave de custódia primária sem a validação do Diretor Geral.",
      status: "MITIGADO"
    },
    {
      id: "EVT-29088",
      timestamp: new Date(Date.now() - 1000 * 320).toISOString(),
      sourceIp: "10.4.1.8",
      operatorId: "SYSTEM-DAEMON",
      operatorName: "Daemon Auditoria Luanda",
      prisonId: "PRIS-01",
      category: "TAMPER",
      action: "Inconsistência Forense de Logs",
      severity: "ALTO",
      riskScore: 82,
      details: "Inconsistência sequencial nos logs criptográficos no bloco B1. Chave de Hash violada.",
      status: "DETECTADO"
    },
    {
      id: "EVT-29075",
      timestamp: new Date(Date.now() - 1000 * 600).toISOString(),
      sourceIp: "192.168.10.14",
      operatorId: "MININT-OP-HEALTH",
      operatorName: "Dra. Elisa Cabinda",
      prisonId: "PRIS-01",
      category: "EXFILTRATION",
      action: "Exportação em Lote de Ficheiros Médicos",
      severity: "ALTO",
      riskScore: 85,
      details: "Download em massa (45 ficheiros) de relatórios clínicos confidenciais fora do horário normal.",
      status: "BLOQUEADO"
    },
    {
      id: "EVT-29052",
      timestamp: new Date(Date.now() - 1000 * 1200).toISOString(),
      sourceIp: "85.204.112.5",
      operatorId: "DESCONHECIDO",
      operatorName: "IP Externo",
      prisonId: "PRIS-03",
      category: "NETWORK",
      action: "Detecção de Port Scanning no Gateway",
      severity: "MEDIO",
      riskScore: 60,
      details: "Scan de portas massivo detetado contra a API de chaves de custódia (porta 3000).",
      status: "BLOQUEADO"
    }
  ]);

  const [suspiciousProfiles, setSuspiciousProfiles] = useState<SuspiciousProfile[]>([
    {
      id: "OP-PRO-92",
      name: "Cap. João Mateus",
      role: "Chefe de Segurança",
      prisonName: "EP Viana",
      reputationalScore: 82,
      status: "VIGILANCIA",
      lastInfraction: "Login Impossível Luanda/Benguela",
      infractionsCount: 3,
      riskFactor: "Sessões Concorrentes"
    },
    {
      id: "OP-PRO-41",
      name: "Tenente Manuel Cruz",
      role: "Operador de Custódia",
      prisonName: "EP Kakila",
      reputationalScore: 48,
      status: "LIBERADO",
      lastInfraction: "Edição não autorizada de chave",
      infractionsCount: 1,
      riskFactor: "Abuso de Privilégio"
    },
    {
      id: "OP-PRO-105",
      name: "Dra. Elisa Cabinda",
      role: "Diretora de Saúde Local",
      prisonName: "EP Viana",
      reputationalScore: 71,
      status: "VIGILANCIA",
      lastInfraction: "Exportação de prontuários em lote",
      infractionsCount: 2,
      riskFactor: "Acesso Fora de Horas"
    },
    {
      id: "OP-PRO-88",
      name: "Admin Auxiliar Huambo",
      role: "Supervisor Auxiliar",
      prisonName: "EP Sanza Pombo",
      reputationalScore: 92,
      status: "QUARENTENA",
      lastInfraction: "Injeção SQL detetada em formulário",
      infractionsCount: 5,
      riskFactor: "Surgimento Incomum"
    }
  ]);

  const [correlationRules, setCorrelationRules] = useState<CorrelationRule[]>([
    {
      id: "RULE-01",
      name: "Viagem Impossível",
      description: "Acessos de locais distantes.",
      category: "AUTH",
      enabled: true,
      triggersCount: 14
    },
    {
      id: "RULE-02",
      name: "Brute Force PIN",
      description: "Múltiplas falhas PIN.",
      category: "AUTH",
      enabled: true,
      triggersCount: 42
    },
    {
      id: "RULE-03",
      name: "Altera Chave Fora Turno",
      description: "Alteração de chave fora de turno.",
      category: "PRIVILEGE",
      enabled: true,
      triggersCount: 8
    },
    {
      id: "RULE-04",
      name: "Inconsistência Hash",
      description: "Audit hash mismatch.",
      category: "TAMPER",
      enabled: true,
      triggersCount: 2
    },
    {
      id: "RULE-05",
      name: "Injeção Script",
      description: "Submissão de caracteres maliciosos.",
      category: "ANOMALY",
      enabled: true,
      triggersCount: 31
    }
  ]);

  // Subscribe to central eventBus to consume operational events (without direct coupling)
  useEffect(() => {
    const unsubscribe = eventBus.subscribeAll((event) => {
      // Map to SIEM event categories
      let siemCat: "AUTH" | "PRIVILEGE" | "EXFILTRATION" | "TAMPER" | "NETWORK" | "ANOMALY" = "ANOMALY";
      let siemSeverity: "CRITICO" | "ALTO" | "MEDIO" | "BAIXO" = "BAIXO";
      let siemStatus: "DETECTADO" | "BLOQUEADO" | "MITIGADO" | "MONITORADO" = "MONITORADO";
      let score = 25;

      if (event.priority === "CRITICAL") {
        siemSeverity = "CRITICO";
        siemStatus = "BLOQUEADO";
        score = 90;
      } else if (event.priority === "HIGH") {
        siemSeverity = "ALTO";
        siemStatus = "MITIGADO";
        score = 70;
      } else if (event.priority === "NORMAL") {
        siemSeverity = "MEDIO";
        siemStatus = "MONITORADO";
        score = 45;
      }

      if (event.type === "INCIDENTE_REGISTADO") {
        siemCat = "ANOMALY";
      } else if (event.type === "TRANSFERENCIA_SOLICITADA") {
        siemCat = "PRIVILEGE";
      } else if (event.type === "ADMISSAO_CONCLUIDA") {
        siemCat = "AUTH";
      } else if (event.type === "AUDITORIA_INTEGRIDADE") {
        siemCat = "TAMPER";
      }

      const siemRecord: SIEMEvent = {
        id: `SIEM-${event.id.replace("EVT-", "")}`,
        timestamp: new Date().toISOString(),
        sourceIp: event.payload?.deviceIp || "10.224.12.8",
        operatorId: "EVENT_BUS_INTERCEPT",
        operatorName: event.operator || "Sistema Automático",
        prisonId: event.payload?.prisonId || "PRIS-01",
        category: siemCat,
        action: `Interceptação Event Bus: ${event.type}`,
        severity: siemSeverity,
        riskScore: score,
        details: `${event.message} [Hash Forense: ${event.auditHash.slice(0, 14)}]`,
        status: siemStatus
      };

      setSiemEvents(prev => [siemRecord, ...prev]);

      // If critical event, optionally trigger temporary SIEM alert UI
      if (event.priority === "CRITICAL" || event.priority === "HIGH") {
        setActiveAlert({
          title: `🚨 ALERTA INTERCEPTADO: ${event.type}`,
          description: event.message,
          severity: siemSeverity,
          rule: `Regra de Interceptação de Evento Global (${event.category})`,
          payload: JSON.stringify(event.payload, null, 2)
        });
        setActiveThreatLevel("WARNING");
      }
    });

    return () => unsubscribe();
  }, [autoMitigationEnabled]);

  // --- ATTACK INJECTOR ENGINE (Interactive Demo) ---
  const handleSimulateAttack = (attackType: string) => {
    if (isInjecting) return;
    setIsInjecting(attackType);
    setActiveThreatLevel("ATTACK");

    // Clear active alert first
    setActiveAlert(null);

    setTimeout(() => {
      let newEvent: SIEMEvent;
      let alertData: any;

      if (attackType === "BRUTE_FORCE") {
        newEvent = {
          id: `EVT-${Math.floor(29110 + Math.random() * 50)}`,
          timestamp: new Date().toISOString(),
          sourceIp: "10.4.120.18",
          operatorId: "MININT-OP-089",
          operatorName: "Cap. João Mateus",
          prisonId: "PRIS-01",
          category: "AUTH",
          action: "Ataque Força Bruta Detetado",
          severity: "CRITICO",
          riskScore: 98,
          details: "Detecção de 8 tentativas sucessivas de PIN inválido no EP Viana pelo operador Cap. João Mateus. Conta de utilizador bloqueada temporariamente para salvaguarda.",
          status: autoMitigationEnabled ? "BLOQUEADO" : "DETECTADO"
        };

        alertData = {
          title: "🚨 CORRELAÇÃO SIEM: ATAQUE BRUTE FORCE DETECTADO",
          description: "Múltiplas falhas sucessivas de autenticação PIN no utilizador João Mateus a partir do IP 10.4.120.18. Conta sob suspeita.",
          severity: "CRÍTICO",
          rule: "RULE-02 (Brute Force de Código PIN de Segurança)",
          payload: "INPUT_ATTEMPT_PIN: [****] -> FAIL, FAIL, FAIL, FAIL, FAIL, FAIL, FAIL, FAIL, SUCCESS? -> BLOQUEADO PELO FIREWALL."
        };

        // Aggravate Joao's score
        setSuspiciousProfiles(prev =>
          prev.map(p => p.id === "OP-PRO-92" ? { ...p, reputationalScore: 99, infractionsCount: p.infractionsCount + 1, status: "QUARENTENA" } : p)
        );

      } else if (attackType === "SQL_INJECTION") {
        newEvent = {
          id: `EVT-${Math.floor(29110 + Math.random() * 50)}`,
          timestamp: new Date().toISOString(),
          sourceIp: "85.204.112.99",
          operatorId: "DESCONHECIDO",
          operatorName: "Terminal Público Huambo",
          prisonId: "PRIS-03",
          category: "ANOMALY",
          action: "Injeção SQL Detetada",
          severity: "CRITICO",
          riskScore: 95,
          details: "Payload malicioso de escape SQL detetado no formulário de busca de reclusos: \"' UNION SELECT username, password_hash FROM operators --\". Conexão encerrada pelo WAF central.",
          status: autoMitigationEnabled ? "BLOQUEADO" : "DETECTADO"
        };

        alertData = {
          title: "🔥 TENTATIVA DE INVASÃO: SQL INJECTION (WAF)",
          description: "Filtragem de caracteres de escape detectada no endpoint de busca nacional de processos penais.",
          severity: "CRÍTICO",
          rule: "RULE-05 (Injeção de Script / Payload)",
          payload: "POST /api/inmates/search HTTP/1.1\nHost: pnap.gov.ao\nQuery: ?q=' OR 1=1; DROP TABLE logs; --"
        };

      } else if (attackType === "PRIV_ESCALATION") {
        newEvent = {
          id: `EVT-${Math.floor(29110 + Math.random() * 50)}`,
          timestamp: new Date().toISOString(),
          sourceIp: "192.168.10.14",
          operatorId: "MININT-OP-HEALTH",
          operatorName: "Dra. Elisa Cabinda",
          prisonId: "PRIS-01",
          category: "PRIVILEGE",
          action: "Tentativa de Escalada de Privilégio",
          severity: "ALTO",
          riskScore: 88,
          details: "Médico de escala tentou submeter um bypass de chave regulamentar no módulo de celas de isolamento disciplinar. Acção bloqueada e reportada ao Diretor Geral.",
          status: autoMitigationEnabled ? "BLOQUEADO" : "DETECTADO"
        };

        alertData = {
          title: "🛡️ TENTATIVA DE ABUSO DE PRIVILÉGIO",
          description: "Utilizador com perfil restrito (Médico) tentou invocar funções administrativas críticas fora do seu escopo funcional.",
          severity: "ALTO",
          rule: "RULE-03 (Altera Chave Fora Turno)",
          payload: "EXEC_COMMAND: ForceCellAdmitInmateId(102) BY USER(MININT-OP-HEALTH) -> PERMISSION_DENIED."
        };

        setSuspiciousProfiles(prev =>
          prev.map(p => p.id === "OP-PRO-105" ? { ...p, reputationalScore: 92, infractionsCount: p.infractionsCount + 1, status: "QUARENTENA" } : p)
        );

      } else { // IMPOSSIBLE_TRAVEL
        newEvent = {
          id: `EVT-${Math.floor(29110 + Math.random() * 50)}`,
          timestamp: new Date().toISOString(),
          sourceIp: "105.12.19.4",
          operatorId: "MININT-OP-112",
          operatorName: "Tenente Manuel Cruz",
          prisonId: "PRIS-02",
          category: "AUTH",
          action: "Acesso por Viagem Impossível",
          severity: "ALTO",
          riskScore: 90,
          details: "Login registado a partir do IP de Luanda (EP Viana) seguido por um acesso autenticado com a mesma credencial a partir do IP de Cabinda no intervalo de 10 segundos.",
          status: autoMitigationEnabled ? "BLOQUEADO" : "DETECTADO"
        };

        alertData = {
          title: "✈️ CORRELAÇÃO GEOGRÁFICA: IMPOSSIBLE TRAVEL",
          description: "Login simultâneo detetado de duas províncias geograficamente isoladas. Chaves de sessão anuladas pelo SIEM de segurança nacional.",
          severity: "ALTO",
          rule: "RULE-01 (Detecção de Viagem Impossível)",
          payload: "SESS-01: Luanda (IP: 192.168.42.105) • SESS-02: Cabinda (IP: 105.12.19.4) • Delta temporal: 10 segundos. Distância física: 480km."
        };

        setSuspiciousProfiles(prev =>
          prev.map(p => p.id === "OP-PRO-41" ? { ...p, reputationalScore: 85, infractionsCount: p.infractionsCount + 1, status: "VIGILANCIA" } : p)
        );
      }

      setSiemEvents(prev => [newEvent, ...prev]);
      setActiveAlert(alertData);

      // Increment Rule trigger counts
      setCorrelationRules(prev =>
        prev.map(r => {
          if (attackType === "BRUTE_FORCE" && r.id === "RULE-02") return { ...r, triggersCount: r.triggersCount + 1 };
          if (attackType === "SQL_INJECTION" && r.id === "RULE-05") return { ...r, triggersCount: r.triggersCount + 1 };
          if (attackType === "PRIV_ESCALATION" && r.id === "RULE-03") return { ...r, triggersCount: r.triggersCount + 1 };
          if (attackType === "IMPOSSIBLE_TRAVEL" && r.id === "RULE-01") return { ...r, triggersCount: r.triggersCount + 1 };
          return r;
        })
      );

      // Write system audit logs
      writeAuditLog(
        currentOperator,
        "SECURITY_VIOLATION",
        "SIEM",
        newEvent.id,
        `[SIEM INTELIGÊNCIA] DETECÇÃO AUTOMÁTICA DE AMEAÇA: ${newEvent.action} em ${newEvent.details}. Mitigação: ${newEvent.status}.`
      );

      setIsInjecting(null);
    }, 1200);
  };

  const handleResolveAlert = () => {
    setActiveAlert(null);
    setActiveThreatLevel("WARNING");
  };

  const handleToggleRule = (ruleId: string) => {
    setCorrelationRules(prev =>
      prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r)
    );
  };

  const handleProfileStatus = (profileId: string, newStatus: SuspiciousProfile["status"]) => {
    setSuspiciousProfiles(prev =>
      prev.map(p => p.id === profileId ? { ...p, status: newStatus, reputationalScore: newStatus === "LIBERADO" ? 20 : p.reputationalScore } : p)
    );
  };

  // --- FILTERED EVENTS LIST ---
  const filteredEvents = useMemo(() => {
    return siemEvents.filter(evt => {
      // Search text filter
      const matchesSearch =
        evt.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.operatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.sourceIp.includes(searchQuery);

      // Category filter
      const matchesCategory = selectedCategory === "ALL" || evt.category === selectedCategory;

      // Severity filter
      const matchesSeverity = selectedSeverity === "ALL" || evt.severity === selectedSeverity;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [siemEvents, searchQuery, selectedCategory, selectedSeverity]);

  // --- COUNTERS ---
  const counts = useMemo(() => {
    const total = siemEvents.length;
    const blocked = siemEvents.filter(e => e.status === "BLOQUEADO").length;
    const highRisk = siemEvents.filter(e => e.riskScore >= 75).length;
    return { total, blocked, highRisk };
  }, [siemEvents]);

  return (
    <div className="flex flex-col gap-6 text-slate-100 font-sans" id="intelligence-center-siem">
      
      {/* 🔴 SIRENE DE ATAQUE ATIVO / SIEM ALERT */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-rose-950/95 border-2 border-rose-500 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur"
          >
            {/* Background scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(244,63,94,0.1)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none animate-[pulse_1s_infinite]" />
            
            <div className="flex flex-col md:flex-row gap-5 items-start relative z-10 text-left">
              <div className="bg-rose-500/20 p-4 rounded-xl border border-rose-500 text-rose-400 shrink-0 self-center md:self-start">
                <Skull className="h-8 w-8 animate-bounce" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-rose-500 text-rose-950 px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase font-mono animate-pulse">
                    ALERTA DO SISTEMA (SIEM CORE)
                  </span>
                  <span className="bg-rose-950 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[9px] font-mono">
                    Nível de Risco: CRÍTICO
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-100 font-mono mt-2 leading-snug">
                  {activeAlert.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
                  {activeAlert.description}
                </p>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 mt-3 font-mono text-[10px] text-rose-400/90 overflow-x-auto">
                  <span className="text-[9px] text-slate-500 uppercase block font-black border-b border-slate-900 pb-1 mb-1.5">REGRA CORRELACIONADA:</span>
                  <p className="text-slate-200 mb-1 font-bold">{activeAlert.rule}</p>
                  <pre className="text-[9px] text-slate-400 mt-1 whitespace-pre-wrap font-mono leading-tight bg-slate-900/60 p-2 rounded border border-slate-950">
                    {activeAlert.payload}
                  </pre>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-4 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-450 font-bold">
                    <ShieldCheck className="h-4 w-4 shrink-0" /> Mitigação Automatizada: {autoMitigationEnabled ? "IP BLOQUEADO NO FIREWALL / SESSÃO CASSADA" : "PENDENTE DE APROVAÇÃO HUMANA"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResolveAlert}
                className="bg-rose-500 hover:bg-rose-650 text-rose-950 hover:text-slate-100 font-bold text-[10px] font-mono px-4 py-2 rounded-xl border border-rose-400 shrink-0 self-center md:self-start transition cursor-pointer uppercase tracking-wider"
              >
                Normalizar Alerta ✓
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛡️ CENTRAL SIEM HEADER */}
      <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-rose-400 shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-100 font-mono uppercase">
              SIEM Central
            </h2>
            <span className={`h-2 w-2 rounded-full ${
              activeThreatLevel === "ATTACK" ? "bg-rose-500 animate-ping" : activeThreatLevel === "WARNING" ? "bg-amber-500" : "bg-emerald-500"
            }`} />
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">
              {activeThreatLevel}
            </span>
          </div>
        </div>

        {/* Global SIEM Status */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoMitigationEnabled(!autoMitigationEnabled)}
            className={`py-1 px-3 rounded text-[9px] font-bold font-mono uppercase border transition flex items-center gap-1.5 cursor-pointer ${
              autoMitigationEnabled
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
            }`}
          >
            {autoMitigationEnabled ? <Lock className="h-3 w-3 text-emerald-400" /> : <Unlock className="h-3 w-3 text-amber-500" />}
            {autoMitigationEnabled ? "Mitigação Ativa" : "Mitigação Manual"}
          </button>
        </div>
      </div>

      {/* 💥 SIEM VIRTUAL ATTACK INJECTOR (COMPACT OPERATIONAL BUTTONS ONLY) */}
      <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold font-mono text-amber-500 flex items-center gap-1 uppercase">
            <Zap className="h-3.5 w-3.5" /> Testes de Resiliência
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            type="button"
            disabled={!!isInjecting}
            title="Simula 8 tentativas sucessivas de PIN falhadas num utilizador militar de alta patente."
            onClick={() => handleSimulateAttack("BRUTE_FORCE")}
            className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/40 p-2.5 rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <Lock className="h-4 w-4 text-rose-400 shrink-0" />
            <span className="text-[10px] font-bold font-mono text-slate-200">Brute Force</span>
          </button>

          <button
            type="button"
            disabled={!!isInjecting}
            title="Submete queries maliciosas com escape SQL em inputs de busca para simular invasão lógica."
            onClick={() => handleSimulateAttack("SQL_INJECTION")}
            className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 p-2.5 rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <FileCode className="h-4 w-4 text-indigo-400 shrink-0" />
            <span className="text-[10px] font-bold font-mono text-slate-200">Injeção SQL</span>
          </button>

          <button
            type="button"
            disabled={!!isInjecting}
            title="Simula utilizador auxiliar de saúde a tentar adulterar chaves de confinamento disciplinar."
            onClick={() => handleSimulateAttack("PRIV_ESCALATION")}
            className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 p-2.5 rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <Fingerprint className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-[10px] font-bold font-mono text-slate-200">Privilégios</span>
          </button>

          <button
            type="button"
            disabled={!!isInjecting}
            title="Simula login com as mesmas credenciais em Luanda e Cabinda com delta de 10 segundos."
            onClick={() => handleSimulateAttack("IMPOSSIBLE_TRAVEL")}
            className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/40 p-2.5 rounded-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <Globe className="h-4 w-4 text-sky-400 shrink-0" />
            <span className="text-[10px] font-bold font-mono text-slate-200">Geolocalização</span>
          </button>
        </div>
      </div>

      {/* 🛡️ CORRELATION RULES & SUSPICIOUS BEHAVIORAL PROFILES (FULL-WIDTH EXCEL DATA TABLES) */}
      <div className="flex flex-col gap-5">
        
        {/* Full Width Table: Active Correlation Rules */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col gap-3 text-left">
          <div className="border-b border-slate-850 pb-2.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-bold font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">Engine de Correlação</span>
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase">Regras de Deteção SIEM</h3>
            </div>
            <span className="text-[9px] font-mono bg-slate-950 border border-slate-850 rounded px-2.5 py-0.5 text-slate-400 font-bold">
              Total: {correlationRules.length} Regras
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-850">
            <table className="w-full text-left border-collapse font-mono text-[10px]">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 uppercase tracking-wider text-[8.5px]">
                  <th className="py-2 px-3">ID Regra</th>
                  <th className="py-2 px-3">Categoria</th>
                  <th className="py-2 px-3">Nome da Regra</th>
                  <th className="py-2 px-3 text-center">Disparos</th>
                  <th className="py-2 px-3 text-center">Estado</th>
                  <th className="py-2 px-3 text-right">Ação Operacional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 bg-slate-950/30">
                {correlationRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-850/40 transition">
                    <td className="py-2 px-3 font-bold text-amber-400">{rule.id}</td>
                    <td className="py-2 px-3 text-slate-400">{rule.category}</td>
                    <td className="py-2 px-3 font-semibold text-slate-200">{rule.name}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-300">{rule.triggersCount}x</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[8.5px] font-bold uppercase border ${
                        rule.enabled ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-500"
                      }`}>
                        {rule.enabled ? "ATIVO" : "INATIVO"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleRule(rule.id)}
                        className={`px-2.5 py-1 rounded text-[8.5px] font-mono uppercase tracking-wider font-bold border transition cursor-pointer ${
                          rule.enabled
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {rule.enabled ? "DESATIVAR" : "ATIVAR"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Full Width Table: Suspicious Behavioral Profiles Ledger */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col gap-3 text-left">
          <div className="border-b border-slate-850 pb-2.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-bold font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">Análise de Perfis</span>
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase">Utilizadores Prisionais sob Vigilância</h3>
            </div>
            <span className="text-[9px] font-mono bg-slate-950 border border-slate-850 rounded px-2.5 py-0.5 text-slate-400 font-bold">
              Em Alerta: {suspiciousProfiles.filter(p => p.status !== "LIBERADO").length} Perfis
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-850">
            <table className="w-full text-left border-collapse font-mono text-[10px]">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 uppercase tracking-wider text-[8.5px]">
                  <th className="py-2 px-3">Operador / Entidade</th>
                  <th className="py-2 px-3">Unidade Penitenciária</th>
                  <th className="py-2 px-3 text-center">Infracções</th>
                  <th className="py-2 px-3">Factor Principal</th>
                  <th className="py-2 px-3 text-center">Reputação SIEM</th>
                  <th className="py-2 px-3 text-right">Acção de Mitigação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 bg-slate-950/30">
                {suspiciousProfiles.map(profile => {
                  const score = profile.reputationalScore;
                  let scoreColor = "text-emerald-400";
                  let bgScore = "bg-emerald-500/10 border-emerald-500/20";
                  if (score > 80) {
                    scoreColor = "text-rose-500 font-extrabold";
                    bgScore = "bg-rose-500/10 border-rose-500/20 animate-pulse";
                  } else if (score > 50) {
                    scoreColor = "text-amber-400 font-bold";
                    bgScore = "bg-amber-500/10 border-amber-500/20";
                  }

                  return (
                    <tr key={profile.id} className="hover:bg-slate-850/40 transition">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 text-[10.5px]">{profile.name}</span>
                          <span className="text-[8.5px] text-slate-500 font-mono">({profile.id})</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-300 text-[9.5px]">
                        {profile.prisonName}
                      </td>
                      <td className="py-2 px-3 text-slate-300 text-center font-bold">
                        {profile.infractionsCount}
                      </td>
                      <td className="py-2 px-3 text-[9px] font-semibold text-slate-400">
                        {profile.riskFactor}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded border text-[9.5px] font-black ${bgScore} ${scoreColor}`}>
                          {score}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {profile.status === "QUARENTENA" ? (
                            <button
                              type="button"
                              title="Restaurar privilégios e remover restrições de acesso"
                              onClick={() => handleProfileStatus(profile.id, "LIBERADO")}
                              className="px-2.5 py-1 rounded text-[8.5px] font-mono bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/25 transition cursor-pointer font-bold"
                            >
                              LIBERAR
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                title="Suspender credenciais de forma imediata e colocar utilizador em quarentena de segurança"
                                onClick={() => handleProfileStatus(profile.id, "QUARENTENA")}
                                className="px-2.5 py-1 rounded text-[8.5px] font-mono bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/25 transition cursor-pointer font-bold"
                              >
                                BLOQUEAR
                              </button>
                              {profile.status !== "VIGILANCIA" && (
                                <button
                                  type="button"
                                  title="Ativar auditoria em tempo real e monitorização reforçada das ações do utilizador"
                                  onClick={() => handleProfileStatus(profile.id, "VIGILANCIA")}
                                  className="px-2.5 py-1 rounded text-[8.5px] font-mono bg-amber-500/15 hover:bg-amber-500/30 text-amber-400 border border-amber-500/25 transition cursor-pointer font-bold"
                                >
                                  MONITORAR
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 📜 REAL-TIME SECURITY LOGS & SIEM LEDGER */}
      <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col gap-4 text-left">
        <div className="border-b border-slate-850 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[9.5px] uppercase font-bold font-mono text-emerald-400 flex items-center gap-1">
              <Terminal className="h-3.5 w-3.5" /> Consola de Logs Forenses do SIEM
            </span>
            <h3 className="text-sm font-bold text-slate-200 mt-0.5">Logs de Segurança e Correlações em Tempo Real</h3>
          </div>

          {/* Filtering row */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrar por IP, operador, ação..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-[10px] text-slate-300 rounded-lg pl-7 pr-3 py-1.5 font-sans focus:outline-none focus:border-slate-700 w-52"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 top-2 text-slate-500 hover:text-slate-300">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-850 text-[10px] text-slate-300 rounded-lg px-2 py-1.5 font-mono focus:outline-none"
            >
              <option value="ALL">Categoria: Todas</option>
              <option value="AUTH">Autenticação (AUTH)</option>
              <option value="PRIVILEGE">Autorização (PRIV)</option>
              <option value="EXFILTRATION">Vazamento (EXFIL)</option>
              <option value="TAMPER">Integridade (TAMPER)</option>
              <option value="NETWORK">Tráfego (NET)</option>
              <option value="ANOMALY">Anomalias (ANOMALY)</option>
            </select>

            {/* Severity */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-850 text-[10px] text-slate-300 rounded-lg px-2 py-1.5 font-mono focus:outline-none"
            >
              <option value="ALL">Severidade: Todas</option>
              <option value="CRITICO">Crítico</option>
              <option value="ALTO">Alto</option>
              <option value="MEDIO">Médio</option>
              <option value="BAIXO">Baixo</option>
            </select>

            {/* Reset Logs */}
            <button
              type="button"
              onClick={() => {
                setSiemEvents(prev => prev.slice(0, 5));
                setActiveAlert(null);
                setActiveThreatLevel("WARNING");
              }}
              className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10.5px] font-mono px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
              title="Redefinir logs de demonstração para o estado inicial"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Limpar Filtros
            </button>
          </div>
        </div>

        {/* Dynamic counters */}
        <div className="flex flex-wrap items-center gap-4 text-[9px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-900/50">
          <span>Registos Monitorizados: <strong className="text-slate-200">{counts.total}</strong></span>
          <span>• Bloqueios Automáticos: <strong className="text-emerald-400">{counts.blocked}</strong></span>
          <span>• Ameaças de Alto Risco: <strong className="text-rose-400">{counts.highRisk}</strong></span>
          <span className="ml-auto text-slate-550 flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            Sincronizado via SICP Real-time Tunnel (1s)
          </span>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-900">
          <table className="w-full text-left border-collapse font-mono text-[10px]">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-900 text-slate-500 uppercase tracking-wider text-[8px]">
                <th className="py-2.5 px-3">Código Hash SIEM</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">IP Origem</th>
                <th className="py-2.5 px-3">Entidade Operadora</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Acção / Evento de Segurança</th>
                <th className="py-2.5 px-3">Risco</th>
                <th className="py-2.5 px-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 bg-slate-950/20">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-550 text-[11px] font-sans">
                    Nenhum registo forense corresponde aos filtros de auditoria selecionados.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(evt => {
                  const isCrit = evt.severity === "CRITICO";
                  const isHigh = evt.severity === "ALTO";
                  const isMed = evt.severity === "MEDIO";

                  let sevColor = "text-emerald-450";
                  if (isCrit) sevColor = "text-rose-500 font-extrabold";
                  else if (isHigh) sevColor = "text-orange-400 font-bold";
                  else if (isMed) sevColor = "text-amber-400";

                  let statusBg = "bg-slate-900 text-slate-400 border border-slate-800";
                  if (evt.status === "BLOQUEADO") statusBg = "bg-rose-500/10 border border-rose-500/30 text-rose-400";
                  else if (evt.status === "MITIGADO") statusBg = "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400";
                  else if (evt.status === "DETECTADO") statusBg = "bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse";

                  return (
                    <tr
                      key={evt.id}
                      className={`hover:bg-slate-900/35 transition ${
                        isCrit ? "bg-rose-950/5 border-l-2 border-l-rose-500" : ""
                      }`}
                    >
                      {/* Event ID */}
                      <td className="py-2.5 px-3 text-slate-400 font-semibold">
                        {evt.id}
                      </td>

                      {/* Timestamp */}
                      <td className="py-2.5 px-3 text-slate-500 text-[9px]">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>

                      {/* Source IP */}
                      <td className="py-2.5 px-3 text-slate-300 font-semibold">
                        {evt.sourceIp}
                      </td>

                      {/* Operator */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-300">{evt.operatorName}</span>
                          <span className="text-[8.5px] text-slate-500">{evt.operatorId}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3">
                        <span className="text-[8.5px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850 text-slate-400">
                          {evt.category}
                        </span>
                      </td>

                      {/* Description / Action */}
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-slate-200">{evt.action}</span>
                          <span className="text-[9px] text-slate-500 mt-0.5 leading-normal truncate block" title={evt.details}>
                            {evt.details}
                          </span>
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-2.5 px-3">
                        <span className={`font-black ${sevColor}`}>
                          {evt.riskScore} ({evt.severity})
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${statusBg}`}>
                          {evt.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Forensic Note */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex flex-col md:flex-row items-center justify-between text-[9px] font-mono text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
            <span>Assinaturas Digitais de Logs: <strong className="text-slate-400">SHA256-ECDSA imutável (Regulamento SICP-AO)</strong></span>
          </div>
          <div>
            <span>Certificado Forense: <strong className="text-emerald-400">Ativo &amp; Válido</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
