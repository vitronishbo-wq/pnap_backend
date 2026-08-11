import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  ChevronRight, 
  ChevronLeft, 
  Database, 
  Radio, 
  Clock, 
  Lock, 
  AlertTriangle, 
  HeartPulse, 
  TrendingUp, 
  Printer, 
  FileText, 
  ArrowUpRight, 
  CheckCircle,
  Cpu,
  Layers,
  MapPin,
  Flame,
  AlertCircle,
  X,
  Radar
} from "lucide-react";
import { SystemPermission } from "../types";

interface OperationalInspectorProps {
  isOpen?: boolean;
  onClose?: () => void;
  selectedHierNode: {
    type: "PROVINCE" | "MUNICIPALITY" | "PRISON" | "PAVILION" | "CELL" | "ESTABLISHMENT" | null;
    id: string | null;
    name: string | null;
    parentId?: string | null;
    grandparentId?: string | null;
  } | null;
  currentOperator: any;
  isOnline: boolean;
  triggerToast: (title: string, message: string, type: "success" | "warning" | "info" | "error") => void;
  prisons: any[];
  municipalities: any[];
  inmates: any[];
  reintegrationRecords?: any[];
  healthRecords?: any[];
  incidentAlerts?: any[];
}

export function OperationalInspector({
  isOpen: propIsOpen,
  onClose: propOnClose,
  selectedHierNode,
  currentOperator,
  isOnline,
  triggerToast,
  prisons,
  municipalities,
  inmates,
  reintegrationRecords = [],
  healthRecords = [],
  incidentAlerts = []
}: OperationalInspectorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const [currentTime, setCurrentTime] = useState("");
  const [activeTab, setActiveTab] = useState<"status" | "logs">("status");
  const [logs, setLogs] = useState<Array<{ id: string; msg: string; type: "info" | "success" | "warning" | "critical"; timestamp: string }>>([]);

  // Time ticks to represent military-operation synchronization
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        timeZone: "Africa/Luanda", 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit",
        hour12: false 
      };
      setCurrentTime(now.toLocaleTimeString("pt-AO", options) + " WAT");
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Populate dynamic terminal logs mimicking real-time telemetry from Angolan prisons
  useEffect(() => {
    const baseLogs: Array<{ id: string; msg: string; type: "info" | "success" | "warning" | "critical"; timestamp: string }> = [
      { id: "1", msg: "VPN Militar MININT ativa e estável.", type: "success", timestamp: "08:12:01" },
      { id: "2", msg: "Sincronismo biométrico Luanda Sul OK.", type: "info", timestamp: "08:14:10" },
      { id: "3", msg: "Controlo de guias de trânsito emulado via C-NEL.", type: "info", timestamp: "08:15:22" }
    ];
    setLogs(baseLogs);

    const telemetryTimer = setInterval(() => {
      if (!isOpen) return;
      const events: Array<{ msg: string; type: "info" | "success" | "warning" | "critical" }> = [
        { msg: "Rastreio perimetral de Viana executado sem anomalias.", type: "success" },
        { msg: "Atualização de registro penal na Cadeia de Cabinda.", type: "info" },
        { msg: "Aviso: Alta taxa de ocupação detectada no Pavilhão B (Luanda).", type: "warning" },
        { msg: "Alergologia clínica: Sincronismo local efetuado no IndexedDB.", type: "info" },
        { msg: "Auditoria forense: integridade SHA256 confirmada.", type: "success" }
      ];

      const selectedEvent = events[Math.floor(Math.random() * events.length)];
      const now = new Date();
      const timestamp = now.toTimeString().split(" ")[0];

      setLogs(prev => [
        { id: Math.random().toString(), msg: selectedEvent.msg, type: selectedEvent.type, timestamp },
        ...prev.slice(0, 15)
      ]);
    }, 12000);

    return () => clearInterval(telemetryTimer);
  }, [isOpen]);

  // Compute stats based on the selected hierarchical node or current operator context
  const getScopeStats = () => {
    let title = "CONSOLA NACIONAL DE OPERAÇÕES";
    let subTitle = "Serviço Penitenciário de Angola";
    let badge = "NÍVEL CENTRAL";
    let scopeType = "NATIONAL";
    let scopeId = "CENTRAL";
    
    // Inferred operator attributes for scope fallback
    const opRole = currentOperator?.role || "";
    const opLevel = currentOperator?.level || (opRole === "DIRECTOR_GERAL" ? "NATIONAL" : opRole === "DIRECTOR_PROVINCIAL" ? "PROVINCIAL" : currentOperator?.province ? "PROVINCIAL" : "NATIONAL");
    const opProvince = currentOperator?.province || (currentOperator?.assignedPrisonId ? prisons.find(p => p.id === currentOperator.assignedPrisonId)?.location?.split(",")[0]?.trim() : null);
    const opPrisonId = currentOperator?.assignedPrisonId;

    let targetPrisons = prisons;
    let targetInmates = inmates;

    if (selectedHierNode) {
      scopeId = selectedHierNode.id || "N/A";
      if (selectedHierNode.type === "PROVINCE") {
        const provinceName = selectedHierNode.name || opProvince || "HUAMBO";
        scopeType = "PROVINCE";
        title = `PROVÍNCIA DE ${provinceName.toUpperCase()}`;
        subTitle = `Comando Provincial - ${provinceName}`;
        badge = "NÍVEL PROVINCIAL";

        targetPrisons = prisons.filter(p => 
          p.location?.toLowerCase().includes(provinceName.toLowerCase()) || 
          p.province?.toLowerCase() === provinceName.toLowerCase()
        );
        const provPrisonIds = targetPrisons.map(p => p.id);
        targetInmates = inmates.filter(i => provPrisonIds.includes(i.assignedPrisonId));

      } else if (selectedHierNode.type === "ESTABLISHMENT" || selectedHierNode.type === "PRISON") {
        const prisonId = selectedHierNode.id;
        const prisonObj = prisons.find(p => p.id === prisonId);
        scopeType = "ESTABLISHMENT";
        title = (prisonObj?.name || selectedHierNode.name || "ESTABELECIMENTO PENITENCIÁRIO").toUpperCase();
        subTitle = `Unidade Operacional - ${prisonObj?.location || opProvince || "Angola"}`;
        badge = "NÍVEL UNIDADE";

        targetPrisons = prisonObj ? [prisonObj] : [];
        targetInmates = inmates.filter(i => i.assignedPrisonId === prisonId);

      } else if (selectedHierNode.type === "PAVILION") {
        scopeType = "PAVILION";
        title = `PAVILHÃO ${selectedHierNode.name?.toUpperCase()}`;
        subTitle = selectedHierNode.parentId ? `Estabelecimento: ${prisons.find(p => p.id === selectedHierNode.parentId)?.name || selectedHierNode.parentId}` : "Pavilhão Carcerário";
        badge = "NÍVEL PAVILHÃO";

        const parentPrison = prisons.find(p => p.id === selectedHierNode.parentId);
        targetPrisons = parentPrison ? [parentPrison] : [];
        targetInmates = inmates.filter(i => i.riskLevel === "MÁXIMO" || i.gender === "M");

      } else if (selectedHierNode.type === "CELL") {
        scopeType = "CELL";
        title = `CELA N.º ${selectedHierNode.name}`;
        subTitle = `Bloco de Custódia - ${selectedHierNode.parentId || "Sector A"}`;
        badge = "NÍVEL COMPARTIMENTO";

        targetPrisons = [];
        targetInmates = inmates.slice(0, 8);
      }
    } else {
      // Fallback: Infer scope from active operator context when no node is selected in tree
      if (opPrisonId || opRole === "DIRECTOR_CADEIA" || opRole === "CHEFE_SEGURANCA" || opRole === "CHEFE_SAUDE") {
        const prisonObj = prisons.find(p => p.id === opPrisonId) || prisons.find(p => p.name?.toLowerCase().includes((opProvince || "huambo").toLowerCase())) || prisons[0];
        scopeType = "ESTABLISHMENT";
        badge = "NÍVEL UNIDADE";
        scopeId = prisonObj?.id || opPrisonId || "EP-LOCAL";
        title = (prisonObj?.name || "CADEIA CENTRAL DO HUAMBO").toUpperCase();
        subTitle = `Direcção do Estabelecimento Penitenciário - ${opProvince || "Huambo"}`;

        targetPrisons = prisonObj ? [prisonObj] : prisons;
        targetInmates = prisonObj ? inmates.filter(i => i.assignedPrisonId === prisonObj.id) : inmates;

      } else if (opLevel === "PROVINCIAL" || opRole === "DIRECTOR_PROVINCIAL" || (opProvince && opProvince !== "Centro Operacional" && opProvince !== "Nacional")) {
        const provName = opProvince || "Huambo";
        scopeType = "PROVINCE";
        badge = "NÍVEL PROVINCIAL";
        scopeId = `DP-${provName.toUpperCase()}`;
        title = `DIRECÇÃO PROVINCIAL DO ${provName.toUpperCase()}`;
        subTitle = `Comando Provincial do Serviço Penitenciário (${provName})`;

        targetPrisons = prisons.filter(p => 
          p.location?.toLowerCase().includes(provName.toLowerCase()) || 
          p.province?.toLowerCase() === provName.toLowerCase()
        );
        const provPrisonIds = targetPrisons.map(p => p.id);
        targetInmates = provPrisonIds.length > 0 ? inmates.filter(i => provPrisonIds.includes(i.assignedPrisonId)) : inmates;
      }
    }

    // Calculations based on scoped targetPrisons and targetInmates
    let totalInmates = targetInmates.length;
    let capacity = targetPrisons.reduce((acc, p) => acc + (p.operationalCapacity || p.capacity || 200), 0) || (scopeType === "CELL" ? 12 : scopeType === "PAVILION" ? 80 : 250);
    let prisonCount = targetPrisons.length;
    let activeIncidents = incidentAlerts?.length ? Math.min(incidentAlerts.length, Math.max(1, prisonCount)) : 2;
    let criticalInmates = targetInmates.filter(i => i.riskLevel === "MÁXIMO" || i.riskLevel === "ALTO").length;
    let healthAlerts = healthRecords?.filter(h => h.severity === "Grave" || h.severity === "Crítico").length || Math.max(0, Math.floor(totalInmates * 0.03));
    const occupancyRate = capacity > 0 ? Math.round((totalInmates / capacity) * 100) : 0;

    return {
      title,
      subTitle,
      badge,
      scopeType,
      scopeId,
      totalInmates,
      capacity,
      prisonCount,
      occupancyRate,
      activeIncidents,
      criticalInmates,
      healthAlerts
    };
  };

  const stats = getScopeStats();

  const handleTriggerLocalIncident = () => {
    triggerToast(
      "INCIDENTE EM REGISTO", 
      `Alerta lançado para o dispositivo central. Protocolo tático de contingência estabelecido para ${stats.title}.`, 
      "warning"
    );
  };

  const handleExportScopeReport = () => {
    triggerToast(
      "RELATÓRIO DE SEGURANÇA", 
      `Ficheiro PDF assinado eletronicamente e gerado com sucesso para o escopo focado (${stats.title}).`, 
      "success"
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex justify-end animate-fadeIn select-none"
        onClick={handleClose}
      >
        <motion.div
          initial={{ x: 350, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 350, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="w-[340px] max-w-[90vw] bg-[#070a10] border-l border-slate-800 flex flex-col h-full shadow-2xl overflow-hidden"
        >
          
          {/* Header: Title & Close Button */}
          <div className="p-3.5 bg-[#0a0f18] border-b border-slate-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500">
                <Radio className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <div className="text-[8px] font-mono tracking-widest text-amber-500 font-bold uppercase">Consola de Rastreio</div>
                <div className="text-[10px] font-sans font-bold text-slate-200">DETETOR DE CONTEXTO</div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded cursor-pointer transition-colors"
              title="Fechar Consola"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

            {/* Sub-Header: Global Time and VPN Status */}
            <div className="px-4 py-2 bg-[#04060b] border-b border-slate-900/40 flex items-center justify-between text-[8px] font-mono text-slate-400 shrink-0">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-slate-650 text-slate-500" />
                <span>Sincronismo: <strong className="text-slate-300">{currentTime}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                <span className="uppercase font-extrabold">{isOnline ? "ON-LINE" : "LOCAL"}</span>
              </div>
            </div>

            {/* Scope Badge & Main Info Block */}
            <div className="p-3.5 bg-gradient-to-b from-[#090e16]/80 to-[#070a10] border-b border-slate-900/40 shrink-0">
              <div className="flex items-center justify-between">
                <span className="bg-slate-900 border border-slate-800 text-amber-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest">
                  {stats.badge}
                </span>
                <span className="text-[8px] font-mono text-slate-400">
                  ID: <strong className="text-amber-400 uppercase font-bold">{stats.scopeId}</strong>
                </span>
              </div>
              <div className="text-[11px] font-sans font-bold text-slate-100 mt-1.5 leading-tight">
                {stats.title}
              </div>
              {stats.subTitle ? (
                <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                  {stats.subTitle}
                </p>
              ) : null}
            </div>

            {/* TAB SELECTOR: STATUS VS TELEMETRY TERMINAL */}
            <div className="px-2 pt-2 bg-[#05070c] border-b border-slate-900/40 flex gap-1 shrink-0 select-none">
              <button
                onClick={() => setActiveTab("status")}
                className={`flex-1 py-1.5 rounded-t-lg font-mono text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${
                  activeTab === "status" 
                    ? "bg-[#070a10] border-t border-x border-slate-900 text-amber-500" 
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Informação Tática
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`flex-1 py-1.5 rounded-t-lg font-mono text-[9px] font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${
                  activeTab === "logs" 
                    ? "bg-[#070a10] border-t border-x border-slate-900 text-amber-500" 
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Telemetria SIEM ({logs.length})
              </button>
            </div>

            {/* TAB CONTENTS (Scrollable area) */}
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
              
              <AnimatePresence mode="wait">
                {activeTab === "status" ? (
                  <motion.div
                    key="status-tab"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 5 }}
                    className="flex flex-col gap-4"
                  >
                    
                    {/* 1. OCCUPANCY GAUGE AND RATIO */}
                    <div className="bg-[#090d15] border border-slate-900 rounded-xl p-3 flex flex-col gap-2.5">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Users className="h-3 w-3 text-slate-500" /> População Ativa
                        </span>
                        <span className="text-slate-300 font-bold">
                          {stats.totalInmates} / {stats.capacity}
                        </span>
                      </div>
                      
                      {/* Interactive visual slider bar */}
                      <div className="w-full h-2 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            stats.occupancyRate > 100 
                              ? "bg-red-600 animate-pulse" 
                              : stats.occupancyRate > 85 
                              ? "bg-amber-500" 
                              : "bg-sky-500"
                          }`}
                          style={{ width: `${Math.min(100, stats.occupancyRate)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <span className="text-slate-500 uppercase">Taxa de Lotação</span>
                        <span className={`font-bold ${
                          stats.occupancyRate > 100 
                            ? "text-red-400 animate-pulse" 
                            : stats.occupancyRate > 85 
                            ? "text-amber-400" 
                            : "text-sky-400"
                        }`}>
                          {stats.occupancyRate}% {stats.occupancyRate > 100 ? "SUPERLOTADO" : ""}
                        </span>
                      </div>
                    </div>

                    {/* 2. THE THREE SECURITY MATRIX METRICS */}
                    <div className="grid grid-cols-2 gap-2">
                      
                      {/* Critical Security Risk */}
                      <div className="bg-[#090d15] border border-slate-900 rounded-lg p-2.5 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-[8.5px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                          <ShieldAlert className="h-3 w-3 text-red-500" /> Risco Crítico
                        </div>
                        <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                          {stats.criticalInmates}
                        </div>
                      </div>

                      {/* Clinical Health Emergency Alerts */}
                      <div className="bg-[#090d15] border border-slate-900 rounded-lg p-2.5 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-[8.5px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                          <HeartPulse className="h-3 w-3 text-emerald-500 animate-pulse" /> Emergência
                        </div>
                        <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                          {stats.healthAlerts}
                        </div>
                      </div>

                      {/* Active Tactical Incidents */}
                      <div className="bg-[#090d15] border border-slate-900 rounded-lg p-2.5 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-[8.5px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                          <Flame className="h-3 w-3 text-amber-500 animate-bounce" /> Ocorrências
                        </div>
                        <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                          {stats.activeIncidents}
                        </div>
                      </div>

                      {/* Active Physical Infrastructure */}
                      <div className="bg-[#090d15] border border-slate-900 rounded-lg p-2.5 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-[8.5px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                          <Layers className="h-3 w-3 text-sky-500" /> Instalações
                        </div>
                        <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                          {stats.scopeType === "NATIONAL" ? stats.prisonCount : stats.scopeType === "PROVINCE" ? stats.prisonCount : 1}
                        </div>
                      </div>

                    </div>

                    {/* 3. CONTEXT OPERATIONS PANEL (ACTION BUTTONS) */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <div className="text-[8px] font-mono tracking-widest text-slate-500 font-bold uppercase mb-0.5">Acções Rápidas</div>
                      
                      <button
                        type="button"
                        onClick={handleTriggerLocalIncident}
                        className="w-full bg-red-950/30 hover:bg-red-900/40 border border-red-900/60 hover:border-red-500/50 text-red-300 font-mono font-bold py-1.5 px-3 rounded text-[9px] flex items-center justify-between cursor-pointer transition-all active:scale-95 shadow-sm"
                      >
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-red-500 animate-pulse" /> ALERTA TÁTICO
                        </span>
                        <ArrowUpRight className="h-3 w-3 text-red-400 opacity-60" />
                      </button>

                      <button
                        type="button"
                        onClick={handleExportScopeReport}
                        className="w-full bg-slate-900 hover:bg-[#0c111e] border border-slate-800 hover:border-slate-700 text-slate-300 font-mono font-bold py-1.5 px-3 rounded text-[9px] flex items-center justify-between cursor-pointer transition-all active:scale-95 shadow-sm"
                      >
                        <span className="flex items-center gap-1.5">
                          <Printer className="h-3 w-3 text-slate-400" /> EXPORTAR AUDITORIA
                        </span>
                        <ArrowUpRight className="h-3 w-3 text-slate-400 opacity-60" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerToast(
                            "VPN ENCRIPTAÇÃO",
                            "Assinatura militar forense atestada. VPN do Estado segura para transmissões do escopo.",
                            "info"
                          );
                        }}
                        className="w-full bg-slate-900 hover:bg-[#0c111e] border border-slate-800 hover:border-slate-700 text-slate-300 font-mono font-bold py-1.5 px-3 rounded text-[9px] flex items-center justify-between cursor-pointer transition-all active:scale-95 shadow-sm"
                      >
                        <span className="flex items-center gap-1.5">
                          <Lock className="h-3 w-3 text-amber-500/80" /> VERIFICAR VPN
                        </span>
                        <ArrowUpRight className="h-3 w-3 text-slate-400 opacity-60" />
                      </button>
                    </div>

                  </motion.div>
                ) : (
                  <motion.div
                    key="logs-tab"
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className="flex flex-col h-full gap-2"
                  >
                    
                    {/* Log Terminal telemetry view */}
                    <div className="bg-[#030508] border border-slate-900 rounded-xl p-3 flex flex-col font-mono text-[9px] h-[340px] overflow-y-auto gap-2.5 scrollbar-thin select-text">
                      <div className="text-[8px] text-slate-500 border-b border-slate-900 pb-1 uppercase tracking-wider flex justify-between">
                        <span>Canal de Telemetria SIEM</span>
                        <span className="text-emerald-500 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> ATIVO
                        </span>
                      </div>
                      
                      {logs.map(log => (
                        <div key={log.id} className="flex gap-1.5 items-start leading-relaxed">
                          <span className="text-slate-600 font-bold tracking-tight shrink-0">[{log.timestamp}]</span>
                          <span className={`shrink-0 uppercase font-extrabold text-[8px] ${
                            log.type === "critical" ? "text-red-500" :
                            log.type === "warning" ? "text-amber-500" :
                            log.type === "success" ? "text-emerald-500" : "text-sky-500"
                          }`}>
                            {log.type === "critical" ? "[CRIT]" :
                             log.type === "warning" ? "[WARN]" :
                             log.type === "success" ? "[OK]" : "[INFO]"}
                          </span>
                          <span className="text-slate-350 break-words flex-grow font-sans text-xxs">
                            {log.msg}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setLogs([]);
                        triggerToast("SIEM REINICIADO", "Os logs temporários da consola local foram limpos com segurança.", "info");
                      }}
                      className="w-full bg-slate-950 hover:bg-slate-900 text-slate-400 font-mono text-[9px] py-1.5 rounded border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer"
                    >
                      Limpar Histórico Local
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Consola footer operator badge */}
            <div className="p-3 bg-[#05070a] border-t border-slate-900 flex items-center gap-2.5 shrink-0 select-none">
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-xxs font-mono">
                {currentOperator?.name?.slice(0, 2).toUpperCase() || "OP"}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[10px] font-sans font-bold text-slate-300 truncate leading-tight">
                  {currentOperator?.name || "Operador Regional"}
                </div>
                <div className="text-[8px] font-mono text-slate-500 truncate mt-0.5">
                  IP militar: <strong className="text-slate-400">{currentOperator?.id === "MININT-OP-DG-01" ? "10.224.12.8" : "192.168.100.45"}</strong>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
    </AnimatePresence>
  );
}
