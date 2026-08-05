import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { formatEPName } from "../utils/formatUtils";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building,
  Users,
  Activity,
  MapPin,
  TrendingUp,
  Radio,
  Bell,
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  Plus,
  Compass,
  FileText,
  AlertCircle,
  Truck,
  Eye,
  Info,
  Server,
  Zap,
  BarChart2
} from "lucide-react";

// Types
import { InmateState } from "../data/schemaData";

interface NationalCommandCenterProps {
  prisons: any[];
  inmates: InmateState[];
  operators: any[];
  currentOperator: any;
  writeAuditLog: (
    operator: any,
    action: string,
    table: string,
    rowId: string,
    desc: string,
    targetId?: string,
    targetName?: string
  ) => void;
  isOnline: boolean;
}

// Coordinate mappings for Angola 21 provinces on a 600x600 coordinate system
const PROVINCES_COORDS: Record<string, { x: number; y: number; name: string }> = {
  "Cabinda": { x: 180, y: 70, name: "Cabinda" },
  "Zaire": { x: 210, y: 130, name: "Zaire" },
  "Uíge": { x: 270, y: 160, name: "Uíge" },
  "Bengo": { x: 220, y: 220, name: "Bengo" },
  "Icolo e Bengo": { x: 205, y: 245, name: "Icolo e Bengo" },
  "Luanda": { x: 190, y: 240, name: "Luanda" },
  "Cuanza Norte": { x: 280, y: 230, name: "Cuanza Norte" },
  "Malanje": { x: 350, y: 250, name: "Malanje" },
  "Lunda Norte": { x: 460, y: 190, name: "Lunda Norte" },
  "Lunda Sul": { x: 490, y: 280, name: "Lunda Sul" },
  "Cuanza Sul": { x: 260, y: 320, name: "Cuanza Sul" },
  "Benguela": { x: 210, y: 380, name: "Benguela" },
  "Huambo": { x: 290, y: 390, name: "Huambo" },
  "Bié": { x: 370, y: 380, name: "Bié" },
  "Moxico": { x: 460, y: 400, name: "Moxico" },
  "Moxico Leste": { x: 510, y: 410, name: "Moxico Leste" },
  "Namibe": { x: 170, y: 490, name: "Namibe" },
  "Huíla": { x: 250, y: 480, name: "Huíla" },
  "Cunene": { x: 260, y: 550, name: "Cunene" },
  "Cubango": { x: 380, y: 510, name: "Cubango" },
  "Quando": { x: 430, y: 530, name: "Quando" }
};

// Map prison IDs to province coords
const PRISON_MARKERS: Record<string, { x: number; y: number; name: string; id: string }> = {
  "PRIS-01": { x: 195, y: 245, name: "EP Viana", id: "PRIS-01" }, // Luanda
  "PRIS-02": { x: 225, y: 215, name: "EP Kakila", id: "PRIS-02" }, // Bengo
  "PRIS-03": { x: 275, y: 155, name: "EP Sanza Pombo", id: "PRIS-03" } // Uíge
};

// Tactical Occurrences / Alarms Interface
interface CommandOccurrence {
  id: string;
  prisonId: string;
  prisonName: string;
  type: "DISCIPLINAR" | "EVASÃO" | "MÉDICO" | "REDES" | "INFRAESTRUTURA" | "SEGURANÇA";
  severity: "CRÍTICA" | "MÉDIA" | "LIGEIRA";
  description: string;
  timestamp: string;
  status: "ACTIVE" | "RESOLVING" | "RESOLVED";
  dispatchedTeam?: string;
  resolvedAt?: string;
}

// Tactical Live Movements Interface
interface LiveEscort {
  id: string;
  inmateName: string;
  origin: string;
  destination: string;
  status: "DEPARTED" | "EN_ROUTE" | "ARRIVED";
  progress: number; // 0 to 100
  escortTeam: string;
  personnelCount: number;
  originCoords: { x: number; y: number };
  destCoords: { x: number; y: number };
}

export default function NationalCommandCenter({
  prisons,
  inmates,
  operators,
  currentOperator,
  writeAuditLog,
  isOnline
}: NationalCommandCenterProps) {
  const isNational = currentOperator?.territorialScope === "NATIONAL" || currentOperator?.level === "NATIONAL" || currentOperator?.role === "DIRECTOR_GERAL";
  const opProvince = currentOperator?.province || "Huambo";

  // Command States
  const [selectedProvince, setSelectedProvince] = useState<string | null>(isNational ? null : opProvince);
  const [selectedPrisonId, setSelectedPrisonId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<"STATUS" | "HEATMAP" | "MOVEMENTS">("STATUS");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [tacticalAlertLevel, setTacticalAlertLevel] = useState<"VERDE" | "AMARELO" | "LARANJA" | "VERMELHO">("AMARELO");
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState<boolean>(false);
  const [isOccurrencesModalOpen, setIsOccurrencesModalOpen] = useState<boolean>(false);
  const [isEscortsModalOpen, setIsEscortsModalOpen] = useState<boolean>(false);

  // Dynamic lists
  const [occurrences, setOccurrences] = useState<CommandOccurrence[]>([
    {
      id: "OCC-402",
      prisonId: "PRIS-01",
      prisonName: "EP Viana",
      type: "DISCIPLINAR",
      severity: "CRÍTICA",
      description: "Tentativa de motim no Pavilhão B (Regime Fechado). Guardas acionaram barreiras secundárias.",
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      status: "ACTIVE",
      dispatchedTeam: "PIR (Polícia de Intervenção Rápida)"
    },
    {
      id: "OCC-405",
      prisonId: "PRIS-02",
      prisonName: "EP Kakila",
      type: "INFRAESTRUTURA",
      severity: "MÉDIA",
      description: "Falha intermitente de energia no perímetro externo. Geradores de contingência operando com 85% de carga.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      status: "RESOLVING",
      dispatchedTeam: "Equipa de Manutenção Militar"
    },
    {
      id: "OCC-408",
      prisonId: "PRIS-03",
      prisonName: "EP Sanza Pombo",
      type: "MÉDICO",
      severity: "LIGEIRA",
      description: "Quarentena preventiva no Bloco C2 por suspeita de virose respiratória aguda.",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      status: "RESOLVED",
      dispatchedTeam: "Equipa Clínica Local",
      resolvedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    }
  ]);

  const [liveEscorts, setLiveEscorts] = useState<LiveEscort[]>([
    {
      id: "ESC-2026-88",
      inmateName: "Bernardo Kassanga",
      origin: "EP Viana (Luanda)",
      destination: "EP Sanza Pombo (Uíge)",
      status: "EN_ROUTE",
      progress: 45,
      escortTeam: "Comando Militar da Região Norte",
      personnelCount: 8,
      originCoords: PROVINCES_COORDS["Luanda"],
      destCoords: PROVINCES_COORDS["Uíge"]
    },
    {
      id: "ESC-2026-91",
      inmateName: "Mateus Pedro Gouveia",
      origin: "EP Kakila (Bengo)",
      destination: "EP Viana (Luanda)",
      status: "DEPARTED",
      progress: 12,
      escortTeam: "Guarda Prisional Táctica Luanda",
      personnelCount: 6,
      originCoords: PROVINCES_COORDS["Bengo"],
      destCoords: PROVINCES_COORDS["Luanda"]
    }
  ]);

  // Form states to trigger new occurrence
  const [newOccType, setNewOccType] = useState<CommandOccurrence["type"]>("DISCIPLINAR");
  const [newOccSeverity, setNewOccSeverity] = useState<CommandOccurrence["severity"]>("MÉDIA");
  const [newOccPrisonId, setNewOccPrisonId] = useState<string>("PRIS-01");
  const [newOccDesc, setNewOccDesc] = useState<string>("");
  const [isOccModalOpen, setIsOccModalOpen] = useState<boolean>(false);

  // Sound and Notification effect (Visual warning)
  const [latestDispatchMessage, setLatestDispatchMessage] = useState<string | null>(null);

  // Auto progression of live escorts to simulate "live" movements
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveEscorts(prev =>
        prev.map(esc => {
          if (esc.status === "EN_ROUTE" || esc.status === "DEPARTED") {
            const nextProgress = esc.progress + Math.round(Math.random() * 4 + 1);
            if (nextProgress >= 100) {
              return {
                ...esc,
                progress: 100,
                status: "ARRIVED" as const
              };
            }
            return {
              ...esc,
              progress: nextProgress,
              status: "EN_ROUTE" as const
            };
          }
          return esc;
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Compute National KPIs based on live states
  const nationalKPIs = useMemo(() => {
    // Total registered inmates
    const totalInmatesCount = inmates.filter(i => i.status === "ACTIVE").length;

    // Total legal vacancies
    const totalVacancies = prisons.reduce((acc, p) => acc + (p.operationalCapacity || p.officialCapacity || 100), 0);

    // General Occupancy Rate
    const avgOccupancy = totalVacancies > 0 ? Math.round((totalInmatesCount / totalVacancies) * 100) : 0;

    // System Alert Indicators
    const criticalIncidentsCount = occurrences.filter(o => o.status !== "RESOLVED" && o.severity === "CRÍTICA").length;
    const activeIncidentsCount = occurrences.filter(o => o.status !== "RESOLVED").length;
    const activeEscortsCount = liveEscorts.filter(e => e.status !== "ARRIVED").length;

    return {
      totalInmatesCount,
      totalVacancies,
      avgOccupancy,
      criticalIncidentsCount,
      activeIncidentsCount,
      activeEscortsCount
    };
  }, [inmates, prisons, occurrences, liveEscorts]);

  // Handle Dispatch rapid intervention
  const handleDispatchTeam = (occId: string, teamName: string) => {
    setOccurrences(prev =>
      prev.map(occ => {
        if (occ.id === occId) {
          writeAuditLog(
            currentOperator,
            "CELL_CHANGE_EXECUTE",
            "Occurrences",
            occId,
            `[RAPID INTERVENTION DISPATCH] Equipa ${teamName} despachada pelo Centro Nacional de Comando para conter ocorrência em ${occ.prisonName}.`
          );

          setLatestDispatchMessage(`Viatura táctica enviada com sucesso para ${occ.prisonName}: Equipa "${teamName}" em trânsito.`);
          setTimeout(() => setLatestDispatchMessage(null), 5000);

          return {
            ...occ,
            status: "RESOLVING",
            dispatchedTeam: teamName
          };
        }
        return occ;
      })
    );
  };

  // Handle Resolve occurrence
  const handleResolveOccurrence = (occId: string) => {
    setOccurrences(prev =>
      prev.map(occ => {
        if (occ.id === occId) {
          writeAuditLog(
            currentOperator,
            "CELL_CHANGE_EXECUTE",
            "Occurrences",
            occId,
            `[OCCURRENCE RESOLVED] Ocorrência ${occId} em ${occ.prisonName} declarada RESOLVIDA e normalizada pelo Centro de Comando.`
          );

          setLatestDispatchMessage(`Ocorrência ${occId} normalizada de forma segura. Situação operacional reposta em ${occ.prisonName}.`);
          setTimeout(() => setLatestDispatchMessage(null), 5000);

          return {
            ...occ,
            status: "RESOLVED",
            resolvedAt: new Date().toISOString()
          };
        }
        return occ;
      })
    );
  };

  // Handle Add custom occurrence
  const handleAddOccurrence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOccDesc.trim()) return;

    const matchedPrison = prisons.find(p => p.id === newOccPrisonId);
    const prisonName = matchedPrison ? formatEPName(matchedPrison.name) : "Unidade Desconhecida";

    const newOcc: CommandOccurrence = {
      id: `OCC-${Math.floor(410 + Math.random() * 80)}`,
      prisonId: newOccPrisonId,
      prisonName,
      type: newOccType,
      severity: newOccSeverity,
      description: newOccDesc,
      timestamp: new Date().toISOString(),
      status: "ACTIVE"
    };

    setOccurrences(prev => [newOcc, ...prev]);

    writeAuditLog(
      currentOperator,
      "CELL_CHANGE_EXECUTE",
      "Occurrences",
      newOcc.id,
      `[TACTICAL OCCURRENCE DECLARED] Nova ocorrência ${newOcc.id} (${newOccType} - ${newOccSeverity}) registada em ${prisonName}: ${newOccDesc}`
    );

    // Auto update tactical alert level based on severity
    if (newOccSeverity === "CRÍTICA") {
      setTacticalAlertLevel("VERMELHO");
    } else if (newOccSeverity === "MÉDIA" && tacticalAlertLevel === "VERDE") {
      setTacticalAlertLevel("AMARELO");
    }

    setNewOccDesc("");
    setIsOccModalOpen(false);

    setLatestDispatchMessage(`ALERTA GERAL: Nova ocorrência de nível ${newOccSeverity} declarada em ${prisonName}.`);
    setTimeout(() => setLatestDispatchMessage(null), 6000);
  };

  // Compute calculated risk score per prison
  const getPrisonRiskIndex = (prison: any) => {
    const prisonInmatesCount = inmates.filter(
      i => i.status === "ACTIVE" && i.assignedPrisonId === prison.id
    ).length;
    const capacity = prison.operationalCapacity || prison.officialCapacity || 100;
    const occupancyRatio = capacity > 0 ? prisonInmatesCount / capacity : 0;

    // Weight formulas
    const highRiskInmates = inmates.filter(
      i => i.status === "ACTIVE" && 
           i.assignedPrisonId === prison.id && 
           (i.riskLevel?.toLowerCase().includes("alt") || i.riskLevel?.toLowerCase().includes("máx"))
    ).length;

    const unresolvedIncidents = occurrences.filter(
      o => o.prisonId === prison.id && o.status !== "RESOLVED"
    ).length;

    const score = Math.min(
      100,
      Math.round(
        (occupancyRatio * 40) + 
        (Math.min(highRiskInmates, 30) * 1.5) + 
        (unresolvedIncidents * 15)
      )
    );
    return score;
  };

  // Filtered Occurrences
  const filteredOccurrences = useMemo(() => {
    return occurrences.filter(occ => {
      if (filterSeverity === "ALL") return true;
      return occ.severity === filterSeverity;
    });
  }, [occurrences, filterSeverity]);

  // Map representation lines & elements
  const borderOutlinePath = "M 150 100 L 250 50 L 350 100 L 450 150 L 520 200 L 550 300 L 520 400 L 480 480 L 400 560 L 280 580 L 160 550 L 140 450 L 120 350 L 150 250 L 140 180 Z";

  return (
    <div className="flex flex-col gap-6 text-slate-100 font-sans" id="national-command-center-panel">
      
      {/* 🔴 LIVE DISPATCH FLOATING BANNER */}
      <AnimatePresence>
        {latestDispatchMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg bg-rose-950 border border-rose-650 rounded-xl p-4 shadow-2xl flex items-center gap-3.5 backdrop-blur animate-pulse"
          >
            <div className="bg-rose-500/20 p-2 rounded-lg border border-rose-500 text-rose-400 shrink-0">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[9px] font-mono uppercase tracking-widest text-rose-400 font-extrabold block">
                ALERTA - CENTRO DE INSTRUÇÕES DE COMBATE
              </span>
              <p className="text-[11px] font-sans text-slate-200 mt-0.5 leading-relaxed font-semibold">
                {latestDispatchMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛡️ ULTRA-COMPACT OPERATIONAL CONTROL BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-md">
        
        {/* Compact Action Modals Triggers */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Metrics Modal Toggle */}
          <button
            type="button"
            onClick={() => setIsMetricsModalOpen(true)}
            className="bg-slate-950 hover:bg-slate-850 text-slate-200 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <BarChart2 className="h-3.5 w-3.5 text-amber-400" />
            <span>KPIs</span>
          </button>

          {/* Occurrences Modal Toggle */}
          <button
            type="button"
            onClick={() => setIsOccurrencesModalOpen(true)}
            className="bg-slate-950 hover:bg-slate-850 text-slate-200 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
            <span>Ocorrências ({occurrences.filter(o => o.status !== "RESOLVED").length})</span>
          </button>

          {/* Escorts Modal Toggle */}
          <button
            type="button"
            onClick={() => setIsEscortsModalOpen(true)}
            className="bg-slate-950 hover:bg-slate-850 text-slate-200 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <Truck className="h-3.5 w-3.5 text-sky-400" />
            <span>Escoltas ({liveEscorts.filter(e => e.status !== "ARRIVED").length})</span>
          </button>

          {/* New Incident Trigger */}
          <button
            type="button"
            onClick={() => setIsOccModalOpen(true)}
            className="bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border border-rose-800/60 transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5 text-rose-400" />
            <span>Incidente</span>
          </button>
        </div>

        {/* Compact Controls: Alert & Map Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tactical Alert Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-850">
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Alerta:</span>
            <div className="flex gap-1">
              {(["VERDE", "AMARELO", "LARANJA", "VERMELHO"] as const).map(lvl => {
                const colorMap = {
                  "VERDE": "bg-emerald-500 text-emerald-100",
                  "AMARELO": "bg-amber-500 text-amber-950",
                  "LARANJA": "bg-orange-500 text-orange-950",
                  "VERMELHO": "bg-rose-600 text-rose-100 animate-pulse"
                };
                const isSelected = tacticalAlertLevel === lvl;

                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setTacticalAlertLevel(lvl);
                      writeAuditLog(
                        currentOperator,
                        "CELL_CHANGE_EXECUTE",
                        "SecurityLevel",
                        "NATIONAL",
                        `[ALERTA] ${lvl}`
                      );
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-black border transition cursor-pointer ${
                      isSelected 
                        ? `${colorMap[lvl]} font-extrabold shadow scale-105 border-transparent` 
                        : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Mode selector */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 gap-1 shrink-0">
            {(["STATUS", "HEATMAP", "MOVEMENTS"] as const).map(mode => {
              const labelMap = {
                "STATUS": "Lotação",
                "HEATMAP": "Calor",
                "MOVEMENTS": "Rotas"
              };
              return (
                <button
                  key={mode}
                  onClick={() => setMapMode(mode)}
                  className={`px-2 py-0.5 rounded text-[8.5px] font-mono tracking-wider uppercase transition cursor-pointer ${
                    mapMode === mode 
                      ? "bg-slate-800 text-amber-500 font-bold border border-slate-700/50" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {labelMap[mode]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📊 RECOLHÍVEL METRICS MODAL */}
      <AnimatePresence>
        {isMetricsModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl flex flex-col gap-4 relative text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-amber-400" /> Métricas & KPIs Nacionais
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMetricsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-500">Efetivo Total</span>
                  <p className="text-xl font-black text-slate-100 font-mono mt-0.5">{nationalKPIs.totalInmatesCount}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-500">Vagas Operacionais</span>
                  <p className="text-xl font-black text-slate-100 font-mono mt-0.5">{nationalKPIs.totalVacancies}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-500">Ocupação Média</span>
                  <p className={`text-xl font-black font-mono mt-0.5 ${nationalKPIs.avgOccupancy > 100 ? "text-rose-400" : "text-amber-400"}`}>{nationalKPIs.avgOccupancy}%</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-500">Escoltas Ativas</span>
                  <p className="text-xl font-black text-slate-100 font-mono mt-0.5">{nationalKPIs.activeEscortsCount}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-500">Incidentes Ativos</span>
                  <p className={`text-xl font-black font-mono mt-0.5 ${nationalKPIs.activeIncidentsCount > 0 ? "text-rose-400" : "text-slate-300"}`}>{nationalKPIs.activeIncidentsCount}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-500">Alertas Críticos</span>
                  <p className={`text-xl font-black font-mono mt-0.5 ${nationalKPIs.criticalIncidentsCount > 0 ? "text-rose-400" : "text-slate-300"}`}>{nationalKPIs.criticalIncidentsCount}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📡 RECOLHÍVEL OCORRÊNCIAS MODAL */}
      <AnimatePresence>
        {isOccurrencesModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-5 shadow-2xl flex flex-col gap-4 relative text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <Radio className="h-4 w-4 text-rose-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-100 font-mono">Console de Ocorrências</h3>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded px-2 py-1 font-mono focus:outline-none"
                  >
                    <option value="ALL">Severidade: Todas</option>
                    <option value="CRÍTICA">Crítica</option>
                    <option value="MÉDIA">Média</option>
                    <option value="LIGEIRA">Ligeira</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsOccurrencesModalOpen(false)}
                    className="text-slate-400 hover:text-slate-200 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[450px] scrollbar-thin">
                {filteredOccurrences.length === 0 ? (
                  <div className="py-8 bg-slate-950/50 rounded-xl text-center text-xs text-slate-400 font-mono">
                    Sem ocorrências ativas.
                  </div>
                ) : (
                  filteredOccurrences.map((occ) => (
                    <div 
                      key={occ.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <span className="font-bold text-slate-200">{occ.id}</span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">{occ.severity}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 uppercase">{occ.status}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">{new Date(occ.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-amber-400 font-bold block">{occ.prisonName}</span>
                        <p className="text-slate-300 mt-0.5 font-sans text-xs">{occ.description}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-900 pt-2 mt-1">
                        <span className="text-[9px] font-mono text-slate-500">Equipa: {occ.dispatchedTeam || "Nenhuma"}</span>
                        {occ.status !== "RESOLVED" && (
                          <div className="flex gap-1">
                            {occ.status === "ACTIVE" && (
                              <button
                                type="button"
                                onClick={() => handleDispatchTeam(occ.id, "PIR (Intervenção Rápida)")}
                                className="bg-slate-900 hover:bg-slate-800 text-rose-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-slate-800"
                              >
                                Despachar PIR
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleResolveOccurrence(occ.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 text-[9px] font-mono font-bold px-2 py-0.5 rounded"
                            >
                              Resolver
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚛 RECOLHÍVEL ESCOLTAS MODAL */}
      <AnimatePresence>
        {isEscortsModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl flex flex-col gap-4 relative text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-100">
                  <Truck className="h-4 w-4 text-sky-400" />
                  <span>Escoltas Penais Ativas</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEscortsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[450px] scrollbar-thin">
                {liveEscorts.map((esc) => (
                  <div key={esc.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="font-bold text-slate-200">{esc.id} - {esc.inmateName}</span>
                      <span className="text-sky-400 font-bold">{esc.progress}%</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>Origem: {esc.origin}</span>
                      <span>Destino: {esc.destination}</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                      <div className="bg-sky-500 h-full transition-all duration-500" style={{ width: `${esc.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌍 INTERACTIVE MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tactictal Angola Map */}
        <div className="lg:col-span-12 bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col gap-4 text-left relative min-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-indigo-400 animate-spin" /> Mapa Táctico - Angola
            </span>
          </div>

          {/* SVG MAP WRAPPER */}
          <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 flex-1 flex items-center justify-center relative overflow-hidden h-[450px]">
            {/* Ambient Background Grid pattern inside SVG */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-15 pointer-events-none" />
            
            <svg 
              viewBox="100 0 450 600" 
              className="w-full h-full max-h-[420px] transition-transform select-none"
            >
              {/* Wireframe border outline of Angola */}
              <path
                d={borderOutlinePath}
                fill="none"
                stroke="#334155"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="opacity-45"
              />

              {/* Angola fill outline */}
              <path
                d={borderOutlinePath}
                fill="#0f172a"
                fillOpacity="0.4"
                stroke="#475569"
                strokeWidth="1.5"
                className="transition hover:fill-slate-900"
              />

              {/* DRAW LIVE ROUTES OF TRANSIT (If movements mode active) */}
              {mapMode === "MOVEMENTS" && liveEscorts.map((esc) => {
                if (esc.status === "ARRIVED") return null;
                // Calculate position along path
                const dx = esc.destCoords.x - esc.originCoords.x;
                const dy = esc.destCoords.y - esc.originCoords.y;
                const t = esc.progress / 100;
                const currentX = esc.originCoords.x + dx * t;
                const currentY = esc.originCoords.y + dy * t;

                return (
                  <g key={esc.id}>
                    {/* Trajectory path */}
                    <line
                      x1={esc.originCoords.x}
                      y1={esc.originCoords.y}
                      x2={esc.destCoords.x}
                      y2={esc.destCoords.y}
                      stroke="#0284c7"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="opacity-70"
                    />
                    
                    {/* Animated Pulse circle on movement destination */}
                    <circle
                      cx={esc.destCoords.x}
                      cy={esc.destCoords.y}
                      r="12"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="1"
                      className="animate-ping opacity-45"
                    />

                    {/* Live Truck pointer */}
                    <circle
                      cx={currentX}
                      cy={currentY}
                      r="6"
                      fill="#0284c7"
                      className="animate-pulse"
                    />
                    <text
                      x={currentX + 8}
                      y={currentY + 3}
                      fill="#0ea5e9"
                      fontSize="7.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {esc.id} ({esc.progress}%)
                    </text>
                  </g>
                );
              })}

              {/* DRAW PROVINCES AS LABELED NODE POINTS */}
              {Object.entries(PROVINCES_COORDS)
                .filter(([name]) => isNational || name.toLowerCase().trim() === opProvince.toLowerCase().trim())
                .map(([name, p]) => {
                const isSelected = selectedProvince === name;
                return (
                  <g 
                    key={name}
                    className="cursor-pointer"
                    onClick={() => setSelectedProvince(isSelected ? null : name)}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? "5" : "3"}
                      fill={isSelected ? "#f59e0b" : "#475569"}
                      className="transition hover:fill-amber-400"
                    />
                    <text
                      x={p.x + 6}
                      y={p.y + 3}
                      fill={isSelected ? "#f59e0b" : "#64748b"}
                      fontSize="7"
                      fontFamily="sans-serif"
                      fontWeight={isSelected ? "bold" : "normal"}
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })}

              {/* DRAW PRISON MARKERS */}
              {Object.values(PRISON_MARKERS).map((mark) => {
                const isSelected = selectedPrisonId === mark.id;
                const realPrison = prisons.find(p => p.id === mark.id);
                if (!realPrison) return null;

                const prisonInmatesCount = inmates.filter(
                  i => i.status === "ACTIVE" && i.assignedPrisonId === mark.id
                ).length;
                const capacity = realPrison.operationalCapacity || realPrison.officialCapacity || 100;
                const occPercent = Math.round((prisonInmatesCount / capacity) * 100);

                // Set status color
                let color = "#10b981"; // safe (green)
                if (occPercent > 110) {
                  color = "#f43f5e"; // critical overcrowding (red)
                } else if (occPercent > 90) {
                  color = "#f59e0b"; // warning (yellow)
                }

                // If Heatmap mode, draw larger radius circles with opacity
                const hasActiveCritOcc = occurrences.some(
                  o => o.prisonId === mark.id && o.status !== "RESOLVED" && o.severity === "CRÍTICA"
                );

                return (
                  <g 
                    key={mark.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedPrisonId(isSelected ? null : mark.id)}
                  >
                    {/* Draw large heat ring if in HEATMAP mode or if has critical occurrences */}
                    {(mapMode === "HEATMAP" || hasActiveCritOcc) && (
                      <circle
                        cx={mark.x}
                        cy={mark.y}
                        r={mapMode === "HEATMAP" ? Math.max(12, Math.min(40, occPercent / 3)) : "20"}
                        fill={hasActiveCritOcc ? "#ef4444" : "#f59e0b"}
                        fillOpacity="0.18"
                        className="animate-pulse"
                      />
                    )}

                    {/* Ring Border */}
                    <circle
                      cx={mark.x}
                      cy={mark.y}
                      r={isSelected ? "9" : "6"}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                    />

                    {/* Core dot */}
                    <circle
                      cx={mark.x}
                      cy={mark.y}
                      r={isSelected ? "5" : "3.5"}
                      fill={color}
                    />

                    {/* Tactical label */}
                    <text
                      x={mark.x}
                      y={mark.y - 12}
                      textAnchor="middle"
                      fill={isSelected ? "#fbbf24" : "#f1f5f9"}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="black"
                      className="drop-shadow-md"
                    >
                      {mark.name} ({occPercent}%)
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Float HUD Information Box */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-left max-w-xs font-mono text-[8px] flex flex-col gap-1 shadow-xl">
              <span className="text-slate-400 font-bold block border-b border-slate-800 pb-1 uppercase tracking-wider">Legenda Operacional</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Capacidade Normal (&lt;90%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Capacidade de Alerta (90% - 110%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Sobre-lotação Crítica (&gt;110%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500/20 border border-rose-500" />
                <span>Raio Vermelho: Motim / Alerta Ativo</span>
              </div>
            </div>

            {/* Info panel when a prison is clicked */}
            {selectedPrisonId && (() => {
              const matchedPrison = prisons.find(p => p.id === selectedPrisonId);
              if (!matchedPrison) return null;

              const prisonInmatesCount = inmates.filter(
                i => i.status === "ACTIVE" && i.assignedPrisonId === selectedPrisonId
              ).length;
              const cap = matchedPrison.operationalCapacity || matchedPrison.officialCapacity || 100;
              const rate = cap > 0 ? Math.round((prisonInmatesCount / cap) * 100) : 0;
              const riskIdx = getPrisonRiskIndex(matchedPrison);

              return (
                <div className="absolute top-3 right-3 bg-slate-900/95 border border-slate-750 p-3 rounded-lg text-left w-56 font-sans text-[10.5px] shadow-2xl flex flex-col gap-2">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-1.5">
                    <h4 className="font-extrabold text-amber-500 leading-tight">
                      {formatEPName(matchedPrison.name)}
                    </h4>
                    <button onClick={() => setSelectedPrisonId(null)} className="text-slate-500 hover:text-slate-300">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 font-mono text-[9px] text-slate-300">
                    <div className="flex justify-between">
                      <span>População:</span>
                      <strong className="text-slate-100">{prisonInmatesCount} Reclusos</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacidade:</span>
                      <strong>{cap} Vagas</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Ocupação:</span>
                      <strong className={rate > 100 ? "text-rose-400 font-bold" : "text-emerald-400"}>{rate}%</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-800/60 pt-1 mt-0.5">
                      <span>Grau de Risco:</span>
                      <strong className={riskIdx > 60 ? "text-rose-400" : riskIdx > 35 ? "text-amber-400" : "text-emerald-400"}>
                        {riskIdx}/100 ({riskIdx > 60 ? "Máximo" : riskIdx > 35 ? "Médio" : "Baixo"})
                      </strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewOccPrisonId(selectedPrisonId);
                      setIsOccModalOpen(true);
                    }}
                    className="w-full bg-rose-650/80 hover:bg-rose-600 text-[9px] font-mono font-bold py-1 rounded border border-rose-500/20 text-center uppercase tracking-wider transition cursor-pointer"
                  >
                    Declarar Incidente
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

      </div>



      {/* 🔴 DECLARE NEW INCIDENT DIALOG MODAL */}
      <AnimatePresence>
        {isOccModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full text-left flex flex-col gap-4 shadow-2xl relative"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-500" /> Declaração de Incidente Táctico (Contingência)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOccModalOpen(false)}
                  className="text-slate-500 hover:text-slate-350 cursor-pointer p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddOccurrence} className="flex flex-col gap-3 font-sans">
                
                {/* Select Prison */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] font-mono text-slate-450 uppercase font-bold">Estabelecimento</label>
                  <select
                    value={newOccPrisonId}
                    onChange={(e) => setNewOccPrisonId(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none"
                  >
                    {prisons.map(p => (
                      <option key={p.id} value={p.id}>
                        {formatEPName(p.name)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid Type & Severity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9.5px] font-mono text-slate-450 uppercase font-bold">Tipo Ocorrência</label>
                    <select
                      value={newOccType}
                      onChange={(e) => setNewOccType(e.target.value as CommandOccurrence["type"])}
                      className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="DISCIPLINAR">Disciplinar</option>
                      <option value="EVASÃO">Evasão</option>
                      <option value="MÉDICO">Emergência Médica</option>
                      <option value="REDES">Quebra Redes/Hardware</option>
                      <option value="INFRAESTRUTURA">Estrutura física</option>
                      <option value="SEGURANÇA">Segurança Perímetro</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9.5px] font-mono text-slate-450 uppercase font-bold">Severidade</label>
                    <select
                      value={newOccSeverity}
                      onChange={(e) => setNewOccSeverity(e.target.value as CommandOccurrence["severity"])}
                      className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="LIGEIRA">Ligeira</option>
                      <option value="MÉDIA">Média</option>
                      <option value="CRÍTICA">Crítica (Vermelho)</option>
                    </select>
                  </div>
                </div>

                {/* Incident Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] font-mono text-slate-450 uppercase font-bold">Historial / Descrição Detalhada</label>
                  <textarea
                    rows={3}
                    value={newOccDesc}
                    onChange={(e) => setNewOccDesc(e.target.value)}
                    placeholder="Descreva a falha, tumulto, sintomas de emergência ou quebras registadas..."
                    className="bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200 focus:outline-none resize-none font-sans"
                  />
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded border border-slate-850 font-mono text-[8.5px] text-slate-450 leading-relaxed">
                  ⚠️ <strong>NOTA DE NÃO-REPÚDIO:</strong> A criação deste alerta táctico gera automaticamente assinaturas de auditoria registadas sob o ID do operador militar actual.
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsOccModalOpen(false)}
                    className="flex-1 bg-slate-950 border border-slate-850 text-slate-350 text-xs font-mono py-2 rounded-lg hover:bg-slate-900 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-rose-650 hover:bg-rose-600 border border-rose-550/20 text-slate-100 text-xs font-mono py-2 rounded-lg transition font-bold cursor-pointer"
                  >
                    Declarar Alerta
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
