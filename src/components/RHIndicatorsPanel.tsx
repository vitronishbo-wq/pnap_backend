import React, { useState, useMemo } from "react";
import { formatEPName } from "../utils/formatUtils";
import RHStaffRatioTreemap from "./RHStaffRatioTreemap";
import { 
  Users, 
  Shield, 
  TrendingUp, 
  Activity, 
  Layers, 
  UserCheck, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  Key, 
  Flame, 
  HeartPulse, 
  ShieldAlert,
  Sliders,
  Sparkles,
  MapPin,
  FileSpreadsheet
} from "lucide-react";
import { OperatorProfile } from "../App";

// Let's specify local typing for prisons and inmates to keep it fully self-contained
interface Prison {
  id: string;
  name: string;
  location: string;
  officialCapacity: number;
  operationalCapacity: number;
  currentOccupancy: number;
  riskBreakdown?: Record<string, number>;
}

interface Inmate {
  id: string;
  firstName: string;
  lastName: string;
  assignedPrisonId?: string;
  healthStatus?: string;
  disciplinaryRecordsCount?: number;
  riskLevel?: string;
}

interface RHIndicatorsPanelProps {
  operators: OperatorProfile[];
  prisons: Prison[];
  inmates: Inmate[];
  organicUnits: any[];
}

export default function RHIndicatorsPanel({
  operators,
  prisons,
  inmates,
  organicUnits
}: RHIndicatorsPanelProps) {
  const [selectedPrisonFilter, setSelectedPrisonFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"patentes" | "permissoes" | "carga" | "racio-treemap">("racio-treemap");

  // Helper function to extract patent / rank from operator's name or roleName
  const getPatentOfOperator = (op: OperatorProfile): string => {
    const name = op.name.toLowerCase();
    if (name.includes("comissário-geral") || name.includes("comissariogeral") || name.includes("comissário geral")) {
      return "Comissário-Geral";
    }
    if (name.includes("sub-comissário") || name.includes("subcomissário") || name.includes("sub comissário")) {
      return "Sub-Comissário";
    }
    if (name.includes("superintendente-chefe") || name.includes("superintendente chefe")) {
      return "Superintendente-Chefe";
    }
    if (name.includes("superintendente")) {
      return "Superintendente";
    }
    if (name.includes("inspector-chefe") || name.includes("inspector chefe")) {
      return "Inspector-Chefe";
    }
    if (name.includes("inspector")) {
      return "Inspector";
    }
    if (name.includes("sub-inspector") || name.includes("subinspector")) {
      return "Sub-Inspector";
    }
    if (name.includes("dr.") || name.includes("dr ") || name.includes("doutor")) {
      return "Técnico de Saúde / Médico";
    }
    if (name.includes("cap.") || name.includes("capitão")) {
      return "Capitão";
    }
    
    // Fallback on role-based patents
    if (op.role === "DIRECTOR_GERAL") return "Comissário-Geral";
    if (op.role === "DIRECTOR_PROVINCIAL") return "Sub-Comissário";
    if (op.role === "DIRECTOR_CADEIA") return "Superintendente";
    if (op.role === "CHEFE_SEGURANCA") return "Inspector-Chefe";
    if (op.role === "CHEFE_SAUDE") return "Sub-Inspector";

    return "Agente Prisional";
  };

  // Patentes list in hierarchical order
  const ALL_PATENTS = [
    "Comissário-Geral",
    "Sub-Comissário",
    "Superintendente-Chefe",
    "Superintendente",
    "Inspector-Chefe",
    "Inspector",
    "Sub-Inspector",
    "Técnico de Saúde / Médico",
    "Capitão",
    "Agente Prisional"
  ];

  // List of high-level permissions to track
  const TARGET_PERMISSIONS = [
    "Incidentes",
    "Vigilância",
    "Celas",
    "Transferências",
    "Chaves",
    "Armas",
    "Saúde"
  ];

  // 1. Dynamic Patent distribution calculations
  const patentDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_PATENTS.forEach(p => counts[p] = 0);
    
    operators.forEach(op => {
      // Apply prison filter if not ALL
      if (selectedPrisonFilter !== "ALL") {
        if (op.assignedPrisonId !== selectedPrisonFilter) {
          return; // Skip if filter doesn't match
        }
      }
      const patent = getPatentOfOperator(op);
      counts[patent] = (counts[patent] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: operators.length > 0 ? Math.round((count / operators.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [operators, selectedPrisonFilter]);

  // 2. Permission distribution calculations
  const permissionDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    TARGET_PERMISSIONS.forEach(p => counts[p] = 0);

    let totalMatchCount = 0;
    operators.forEach(op => {
      if (selectedPrisonFilter !== "ALL") {
        if (op.assignedPrisonId !== selectedPrisonFilter) {
          return;
        }
      }
      totalMatchCount++;
      op.permissions.forEach(perm => {
        if (counts[perm] !== undefined) {
          counts[perm]++;
        }
      });
    });

    return TARGET_PERMISSIONS.map(name => ({
      name,
      count: counts[name] || 0,
      percentage: totalMatchCount > 0 ? Math.round(((counts[name] || 0) / totalMatchCount) * 100) : 0
    }));
  }, [operators, selectedPrisonFilter]);

  // 3. Workload Heatmap calculations
  const workloadHeatmapData = useMemo(() => {
    return prisons.map(prison => {
      // a) Chefe de Segurança workload
      // High occupancy ratio + high risk inmates = high security load
      const occupancyRatio = prison.officialCapacity > 0 ? prison.currentOccupancy / prison.officialCapacity : 1;
      const highRiskInmates = inmates.filter(i => i.assignedPrisonId === prison.id && (i.riskLevel === "Alto" || i.riskLevel === "Máximo")).length;
      const discIncidentsCount = inmates.filter(i => i.assignedPrisonId === prison.id && (i.disciplinaryRecordsCount && i.disciplinaryRecordsCount > 0)).reduce((acc, i) => acc + (i.disciplinaryRecordsCount || 0), 0);
      
      const segScore = Math.min(100, Math.round(
        (occupancyRatio * 45) + 
        (Math.min(10, highRiskInmates) * 3.5) + 
        (Math.min(15, discIncidentsCount) * 2.5)
      ));

      // b) Chefe de Saúde workload
      // Depends on inmates medical requirements (grave healthStatus, medications)
      const healthInmates = inmates.filter(i => i.assignedPrisonId === prison.id && (i.healthStatus === "GRAVE" || i.healthStatus === "CRITICO")).length;
      const baseHealthLoad = prison.currentOccupancy * 0.05; // larger prison = more basic health cases
      const sauScore = Math.min(100, Math.round(
        20 + 
        (Math.min(12, healthInmates) * 5) + 
        (Math.min(50, baseHealthLoad) * 1.2)
      ));

      // c) Director de Cadeia workload
      // General management load (total occupants, general complexity, capacity violations)
      const capacityExceededFactor = prison.currentOccupancy > prison.officialCapacity ? 20 : 0;
      const dirScore = Math.min(100, Math.round(
        (occupancyRatio * 50) + 
        capacityExceededFactor + 
        (prison.currentOccupancy > 500 ? 25 : prison.currentOccupancy > 200 ? 15 : 8)
      ));

      return {
        prisonId: prison.id,
        prisonName: prison.name,
        province: prison.location.split(",")[0],
        occupancy: prison.currentOccupancy,
        capacity: prison.officialCapacity,
        occupancyRatio,
        scores: {
          DIRECTOR_CADEIA: dirScore,
          CHEFE_SEGURANCA: segScore,
          CHEFE_SAUDE: sauScore
        }
      };
    });
  }, [prisons, inmates]);

  // Overall average workload for stats
  const averageWorkloads = useMemo(() => {
    let totalDir = 0, totalSeg = 0, totalSau = 0;
    if (workloadHeatmapData.length === 0) return { dir: 0, seg: 0, sau: 0, overall: 0 };

    workloadHeatmapData.forEach(d => {
      totalDir += d.scores.DIRECTOR_CADEIA;
      totalSeg += d.scores.CHEFE_SEGURANCA;
      totalSau += d.scores.CHEFE_SAUDE;
    });

    const dir = Math.round(totalDir / workloadHeatmapData.length);
    const seg = Math.round(totalSeg / workloadHeatmapData.length);
    const sau = Math.round(totalSau / workloadHeatmapData.length);
    const overall = Math.round((dir + seg + sau) / 3);

    return { dir, seg, sau, overall };
  }, [workloadHeatmapData]);

  // Heatmap Color picker
  const getHeatmapBg = (score: number) => {
    if (score < 35) return "bg-emerald-950/40 text-emerald-300 border-emerald-900/30";
    if (score < 65) return "bg-amber-950/40 text-amber-300 border-amber-900/30";
    if (score < 85) return "bg-orange-950/50 text-orange-300 border-orange-900/30";
    return "bg-red-950/60 text-red-200 border-red-900/50 animate-pulse";
  };

  const getHeatmapBadge = (score: number) => {
    if (score < 35) return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    if (score < 65) return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    if (score < 85) return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    return "bg-red-500/10 text-red-400 border border-red-500/20";
  };

  const getHeatmapLoadText = (score: number) => {
    if (score < 35) return "Estável (Sob Controle)";
    if (score < 65) return "Moderado (Alerta)";
    if (score < 85) return "Elevado (Rigores Ativos)";
    return "Crítico (Sobrecarregado!)";
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Upper Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/15">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider font-bold">Média de Carga Penal</span>
            <span className="text-xl font-bold font-mono text-slate-100">{averageWorkloads.overall}%</span>
            <span className="text-[8.5px] text-slate-400 font-sans">Geral de Operações SP</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/15">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider font-bold">Ponto Crítico de Risco</span>
            <span className="text-lg font-bold font-mono text-red-400">
              {workloadHeatmapData.length > 0 
                ? formatEPName(workloadHeatmapData.reduce((prev, curr) => (curr.scores.CHEFE_SEGURANCA > prev.scores.CHEFE_SEGURANCA ? curr : prev)).prisonName)
                : "Nenhum"
              }
            </span>
            <span className="text-[8.5px] text-slate-400 font-sans">
              Segurança no Limiar Crítico
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/15">
            <Key className="h-5 w-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider font-bold">Oficiais com Alta Patente</span>
            <span className="text-xl font-bold font-mono text-slate-100">
              {operators.filter(op => ["Comissário-Geral", "Sub-Comissário", "Superintendente-Chefe"].includes(getPatentOfOperator(op))).length}
            </span>
            <span className="text-[8.5px] text-slate-400 font-sans">Comando e Direção Geral</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider font-bold">Segurança de Armas Ativa</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {operators.filter(op => op.permissions.includes("Armas")).length} Oficiais
            </span>
            <span className="text-[8.5px] text-slate-400 font-sans">Com Credencial de Armas</span>
          </div>
        </div>

      </div>

      {/* Main Tabs and Selection Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
        
        {/* Navigation row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
          <div className="flex gap-1 p-1 bg-slate-950 rounded-xl border border-slate-850">
            <button
              type="button"
              onClick={() => setActiveTab("racio-treemap")}
              className={`px-3 py-1.5 rounded-lg text-xxs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "racio-treemap"
                  ? "bg-slate-800 text-amber-500 font-extrabold border border-amber-500/10 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="h-3 w-3 text-sky-400" /> Rácio Guarda/Recluso (D3 Treemap)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("carga")}
              className={`px-3 py-1.5 rounded-lg text-xxs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "carga"
                  ? "bg-slate-800 text-amber-500 font-extrabold border border-amber-500/10 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="h-3 w-3" /> Heatmap de Carga
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("patentes")}
              className={`px-3 py-1.5 rounded-lg text-xxs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "patentes"
                  ? "bg-slate-800 text-amber-500 font-extrabold border border-amber-500/10 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Award className="h-3 w-3" /> Distribuição de Patentes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("permissoes")}
              className={`px-3 py-1.5 rounded-lg text-xxs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "permissoes"
                  ? "bg-slate-800 text-amber-500 font-extrabold border border-amber-500/10 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Shield className="h-3 w-3" /> Permissões de Acesso
            </button>
          </div>

          {/* Unit selector filter */}
          {activeTab !== "carga" && (
            <div className="flex items-center gap-2 font-mono text-xxs">
              <span className="text-slate-500">Filtrar por Unidade:</span>
              <select
                value={selectedPrisonFilter}
                onChange={(e) => setSelectedPrisonFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[9px] text-slate-300 font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="ALL">Todas as Unidades</option>
                {prisons.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab 0: D3 Treemap Security Staff to Inmate Ratio */}
        {activeTab === "racio-treemap" && (
          <RHStaffRatioTreemap
            operators={operators}
            prisons={prisons}
            inmates={inmates}
            organicUnits={organicUnits}
          />
        )}

        {/* Tab 1: Heatmap of Workload */}
        {activeTab === "carga" && (
          <div className="flex flex-col gap-5">
            <div className="text-left font-sans">
              <span className="text-[10px] font-mono text-amber-500 uppercase font-black tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-amber-500" /> Mapa de Calor de Carga de Trabalho por Chefia (Workload Heatmap)
              </span>
              <p className="text-[10.5px] text-slate-400 mt-1 max-w-4xl leading-relaxed">
                Este gráfico de heatmap correlaciona dinamicamente a sobrecarga operacional dos postos de liderança penal do Serviço Penitenciário em cada estabelecimento. Os coeficientes ponderam dados vivos de superlotação de celas, índice de reclusos de alta periculosidade, ocorrências disciplinares e prontuários médicos ativos.
              </p>
            </div>

            {/* Heatmap Grid Matrix */}
            <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/15 p-1">
              <table className="w-full text-left border-collapse font-mono text-xxs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-850 text-slate-500 uppercase tracking-wider text-[8px] font-bold">
                    <th className="p-3.5 w-48 text-left">Estabelecimento Prisional</th>
                    <th className="p-3.5 text-center">Director do EP</th>
                    <th className="p-3.5 text-center">Chefe de Segurança</th>
                    <th className="p-3.5 text-center">Chefe de Saúde Clínica</th>
                    <th className="p-3.5 text-center w-28">Lotação Geral</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60 text-slate-300">
                  {workloadHeatmapData.map(row => (
                    <tr key={row.prisonId} className="hover:bg-slate-900/10 transition-colors">
                      <td className="p-3.5">
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-slate-100 font-sans text-xxs">
                            {formatEPName(row.prisonName)}
                          </span>
                          <span className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-2.5 w-2.5 text-slate-600" /> {row.province}
                          </span>
                        </div>
                      </td>

                      {/* Director Cell */}
                      <td className="p-2 text-center">
                        <div className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition ${getHeatmapBg(row.scores.DIRECTOR_CADEIA)}`}>
                          <span className="text-xs font-bold font-mono">{row.scores.DIRECTOR_CADEIA}%</span>
                          <span className={`text-[7px] uppercase font-bold px-1.5 py-0.2 rounded font-sans ${getHeatmapBadge(row.scores.DIRECTOR_CADEIA)}`}>
                            {getHeatmapLoadText(row.scores.DIRECTOR_CADEIA).split(" (")[0]}
                          </span>
                        </div>
                      </td>

                      {/* Security Chief Cell */}
                      <td className="p-2 text-center">
                        <div className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition ${getHeatmapBg(row.scores.CHEFE_SEGURANCA)}`}>
                          <span className="text-xs font-bold font-mono">{row.scores.CHEFE_SEGURANCA}%</span>
                          <span className={`text-[7px] uppercase font-bold px-1.5 py-0.2 rounded font-sans ${getHeatmapBadge(row.scores.CHEFE_SEGURANCA)}`}>
                            {getHeatmapLoadText(row.scores.CHEFE_SEGURANCA).split(" (")[0]}
                          </span>
                        </div>
                      </td>

                      {/* Health Chief Cell */}
                      <td className="p-2 text-center">
                        <div className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition ${getHeatmapBg(row.scores.CHEFE_SAUDE)}`}>
                          <span className="text-xs font-bold font-mono">{row.scores.CHEFE_SAUDE}%</span>
                          <span className={`text-[7px] uppercase font-bold px-1.5 py-0.2 rounded font-sans ${getHeatmapBadge(row.scores.CHEFE_SAUDE)}`}>
                            {getHeatmapLoadText(row.scores.CHEFE_SAUDE).split(" (")[0]}
                          </span>
                        </div>
                      </td>

                      {/* Occupation meter column */}
                      <td className="p-3.5 text-center">
                        <div className="flex flex-col gap-1 text-[10px]">
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>{row.occupancy}</span>
                            <span>{row.capacity}</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                            <div 
                              className={`h-full rounded-full ${row.occupancyRatio > 1.1 ? "bg-red-500" : row.occupancyRatio > 0.95 ? "bg-orange-500" : "bg-sky-500"}`}
                              style={{ width: `${Math.min(100, Math.round(row.occupancyRatio * 100))}%` }}
                            ></div>
                          </div>
                          <span className={`text-[8px] font-mono font-bold uppercase mt-0.5 ${row.occupancyRatio > 1 ? "text-red-400" : "text-slate-500"}`}>
                            {row.occupancyRatio > 1 ? "⚠️ Superlotado" : "Regular"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Heatmap Legend Scale */}
            <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex-wrap gap-4 text-xxs font-mono">
              <span className="text-slate-400 uppercase font-bold text-[8.5px]">Escala de Nível de Carga:</span>
              <div className="flex gap-4 items-center flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-emerald-950/60 border border-emerald-900/40"></div>
                  <span className="text-emerald-400">&lt; 35% Estável</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-amber-950/60 border border-amber-900/40"></div>
                  <span className="text-amber-400">35-65% Moderado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-orange-950/60 border border-orange-900/40"></div>
                  <span className="text-orange-400">65-85% Elevado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-red-950/80 border border-red-900/50 animate-pulse"></div>
                  <span className="text-red-400">&ge; 85% Crítico</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Distribution of Patentes */}
        {activeTab === "patentes" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: General ranks summary bar chart */}
            <div className="lg:col-span-6 flex flex-col gap-4 bg-slate-950/30 p-4 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-mono text-slate-300 uppercase font-bold border-b border-slate-900 pb-2 flex items-center gap-1">
                <Award className="h-4 w-4 text-amber-500" /> Distribuição de Patentes Militares (Efetivo Total)
              </span>

              <div className="flex flex-col gap-4.5 mt-2">
                {patentDistribution.map((patent, index) => (
                  <div key={patent.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xxs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 text-[9px] font-bold">
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-200">{patent.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-amber-500 font-bold">{patent.count} Oficiais</span>
                        <span>({patent.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${patent.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Distribution matrix per prison establishment */}
            <div className="lg:col-span-6 flex flex-col gap-4 bg-slate-950/30 p-4 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-mono text-slate-300 uppercase font-bold border-b border-slate-900 pb-2 flex items-center gap-1">
                <Layers className="h-4 w-4 text-sky-400" /> Quadro de Patentes por Estabelecimento Prisional
              </span>

              <div className="overflow-x-auto rounded-lg border border-slate-850 bg-slate-950/50 mt-1">
                <table className="w-full text-left border-collapse font-mono text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-850 text-slate-500 uppercase tracking-wider text-[7.5px] font-bold">
                      <th className="px-3 py-2">Unidade</th>
                      <th className="px-3 py-2 text-center">Alta Patente</th>
                      <th className="px-3 py-2 text-center">Inspector</th>
                      <th className="px-3 py-2 text-center">Agente</th>
                      <th className="px-3 py-2 text-center">Técnico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-slate-300">
                    {prisons.map(prison => {
                      // Filter operators assigned to this prison
                      const opsInUnit = operators.filter(o => o.assignedPrisonId === prison.id);
                      
                      const altaPatente = opsInUnit.filter(o => {
                        const pat = getPatentOfOperator(o);
                        return ["Comissário-Geral", "Sub-Comissário", "Superintendente-Chefe", "Superintendente"].includes(pat);
                      }).length;

                      const inspectores = opsInUnit.filter(o => {
                        const pat = getPatentOfOperator(o);
                        return ["Inspector-Chefe", "Inspector", "Sub-Inspector"].includes(pat);
                      }).length;

                      const agentes = opsInUnit.filter(o => {
                        const pat = getPatentOfOperator(o);
                        return ["Agente Prisional", "Capitão"].includes(pat);
                      }).length;

                      const tecnicos = opsInUnit.filter(o => {
                        const pat = getPatentOfOperator(o);
                        return ["Técnico de Saúde / Médico"].includes(pat);
                      }).length;

                      return (
                        <tr key={prison.id} className="hover:bg-slate-900/25 transition">
                          <td className="px-3 py-2.5 font-bold text-slate-200">
                            {formatEPName(prison.name)}
                          </td>
                          <td className="px-3 py-2.5 text-center text-amber-500 font-bold">{altaPatente || "—"}</td>
                          <td className="px-3 py-2.5 text-center text-sky-400 font-bold">{inspectores || "—"}</td>
                          <td className="px-3 py-2.5 text-center text-slate-300">{agentes || "—"}</td>
                          <td className="px-3 py-2.5 text-center text-emerald-400 font-bold">{tecnicos || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Permissions distribution */}
        {activeTab === "permissoes" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Authorized personnel bar chart */}
            <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-950/30 p-4 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-mono text-slate-300 uppercase font-bold border-b border-slate-900 pb-2 flex items-center gap-1">
                <ShieldAlert className="h-4 w-4 text-emerald-500" /> Cobertura Global de Permissões Críticas
              </span>

              <div className="flex flex-col gap-4.5 mt-2">
                {permissionDistribution.map(perm => (
                  <div key={perm.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xxs font-mono">
                      <span className="font-bold text-slate-200 uppercase tracking-wide">{perm.name}</span>
                      <span className="text-sky-400 font-bold">{perm.count} Oficiais ({perm.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          ["Armas", "Chaves"].includes(perm.name) ? "bg-red-500" :
                          ["Transferências", "Incidentes"].includes(perm.name) ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${perm.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Detailed units permissions coverage matrix */}
            <div className="lg:col-span-7 flex flex-col gap-4 bg-slate-950/30 p-4 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-mono text-slate-300 uppercase font-bold border-b border-slate-900 pb-2 flex items-center gap-1">
                <Key className="h-4 w-4 text-sky-400" /> Matriz de Credenciais Ativas por Unidade
              </span>

              <div className="overflow-x-auto rounded-lg border border-slate-850 bg-slate-950/50 mt-1">
                <table className="w-full text-left border-collapse font-mono text-[9px]">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-850 text-slate-500 uppercase tracking-wider text-[7px] font-bold">
                      <th className="px-3 py-2">Unidade</th>
                      <th className="px-2 py-2 text-center">Armas</th>
                      <th className="px-2 py-2 text-center">Chaves</th>
                      <th className="px-2 py-2 text-center">Transferências</th>
                      <th className="px-2 py-2 text-center">Incidentes</th>
                      <th className="px-2 py-2 text-center">Saúde</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-slate-300">
                    {prisons.map(prison => {
                      const opsInUnit = operators.filter(o => o.assignedPrisonId === prison.id);
                      
                      const armas = opsInUnit.filter(o => o.permissions.includes("Armas")).length;
                      const chaves = opsInUnit.filter(o => o.permissions.includes("Chaves")).length;
                      const transfs = opsInUnit.filter(o => o.permissions.includes("Transferências")).length;
                      const incs = opsInUnit.filter(o => o.permissions.includes("Incidentes")).length;
                      const saude = opsInUnit.filter(o => o.permissions.includes("Saúde")).length;

                      return (
                        <tr key={prison.id} className="hover:bg-slate-900/25 transition">
                          <td className="px-3 py-2 font-bold text-slate-200">
                            {formatEPName(prison.name)}
                          </td>
                          <td className="px-2 py-2 text-center font-bold text-red-400">{armas || "—"}</td>
                          <td className="px-2 py-2 text-center font-bold text-orange-400">{chaves || "—"}</td>
                          <td className="px-2 py-2 text-center font-bold text-amber-500">{transfs || "—"}</td>
                          <td className="px-2 py-2 text-center font-bold text-sky-400">{incs || "—"}</td>
                          <td className="px-2 py-2 text-center font-bold text-emerald-400">{saude || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
