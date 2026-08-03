import React, { useState, useMemo } from "react";
import { 
  Building, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Flame, 
  TrendingUp, 
  PlusCircle, 
  FileText, 
  MapPin, 
  Compass, 
  Clock, 
  CheckCircle,
  Lock,
  Eye,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  PieChart,
  Pie,
  Cell as ReCell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { InmateState } from "../data/schemaData";

interface OperatorProfile {
  id: string;
  name: string;
  role: string;
  roleName: string;
  roleDescription: string;
  level: string;
  sigla: string;
  assignedPrisonId?: string;
  province?: string;
  permissions: string[];
}

interface PrisonBlock {
  id: string;
  name: string;
  capacity: number;
  current: number;
  cellCount: number;
  riskLevel: string;
}

interface PrisonPavilion {
  id: string;
  name: string;
  blocks: PrisonBlock[];
}

interface Prison {
  id: string;
  name: string;
  location: string;
  officialCapacity: number;
  operationalCapacity: number;
  currentOccupancy: number;
  pavilions: PrisonPavilion[];
  riskBreakdown: {
    "Baixo": number;
    "Médio": number;
    "Alto": number;
    "Máximo": number;
  };
}

interface DisciplinaryIncidentUnitData {
  unit: string;
  Agressao: number;
  Fuga: number;
  PosseIlicita: number;
  Indisciplina: number;
}

interface EstablishmentDirectorDashboardProps {
  currentOperator: OperatorProfile;
  prisons: Prison[];
  inmates: InmateState[];
  disciplinaryIncidentsData: DisciplinaryIncidentUnitData[];
  setDisciplinaryIncidentsData: React.Dispatch<React.SetStateAction<DisciplinaryIncidentUnitData[]>>;
  writeAuditLog: (operator: any, actionType: string, affectedTable: string, recordId: string, details: string) => void;
  triggerNotification?: (type: "SMS" | "EMAIL" | "INTERNAL", target: string, message: string) => void;
}

export default function EstablishmentDirectorDashboard({
  currentOperator,
  prisons,
  inmates,
  disciplinaryIncidentsData,
  setDisciplinaryIncidentsData,
  writeAuditLog,
  triggerNotification
}: EstablishmentDirectorDashboardProps) {
  
  // 1. Resolve director's specific prison
  const directorPrisonId = currentOperator.assignedPrisonId || "PRIS-01";
  const myPrison = useMemo(() => {
    return prisons.find(p => p.id === directorPrisonId) || prisons[0] || null;
  }, [prisons, directorPrisonId]);

  // Clean prison name for matching in incidents database (e.g. "EP Viana" from "Estabelecimento Penitenciário de Viana")
  const shortPrisonName = useMemo(() => {
    if (!myPrison) return "EP Viana";
    if (myPrison.name.includes("Viana")) return "EP Viana";
    if (myPrison.name.includes("Kakila")) return "EP Kakila";
    if (myPrison.name.includes("Sanza")) return "EP Sanza Pombo";
    if (myPrison.name.includes("Huambo")) return "EP Viana"; // Fallback mapping
    return myPrison.name;
  }, [myPrison]);

  // 2. Incident Statistics for this unit specifically
  const localIncidents = useMemo(() => {
    const matched = disciplinaryIncidentsData.find(item => item.unit === shortPrisonName) || {
      unit: shortPrisonName, Agressao: 15, Fuga: 1, PosseIlicita: 20, Indisciplina: 10
    };
    return matched;
  }, [disciplinaryIncidentsData, shortPrisonName]);

  // States
  const [selectedPavilionId, setSelectedPavilionId] = useState<string | null>(null);
  const [incidentFormOpen, setIncidentFormOpen] = useState(false);
  const [newIncidentType, setNewIncidentType] = useState<"Agressao" | "Fuga" | "PosseIlicita" | "Indisciplina">("Agressao");
  const [newIncidentQty, setNewIncidentQty] = useState<number>(1);
  const [newIncidentReason, setNewIncidentReason] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);

  // Inmates specifically in this prison
  const localInmates = useMemo(() => {
    return inmates.filter(i => i.assignedPrisonId === directorPrisonId && i.status === "ACTIVE");
  }, [inmates, directorPrisonId]);

  // Local Risk distribution derived dynamically from inmates + default DB
  const localRiskData = useMemo(() => {
    let baixo = myPrison?.riskBreakdown?.["Baixo"] || 0;
    let medio = myPrison?.riskBreakdown?.["Médio"] || 0;
    let alto = myPrison?.riskBreakdown?.["Alto"] || 0;
    let maximo = myPrison?.riskBreakdown?.["Máximo"] || 0;

    // Count added inmates
    localInmates.forEach(inm => {
      if (inm.riskLevel === "Baixo") baixo++;
      else if (inm.riskLevel === "Médio") medio++;
      else if (inm.riskLevel === "Alto") alto++;
      else if (inm.riskLevel === "Máximo") maximo++;
    });

    const total = baixo + medio + alto + maximo;

    return [
      { name: "Baixo Risco", value: baixo, color: "#10b981", percent: total > 0 ? ((baixo / total) * 100).toFixed(1) : "0" },
      { name: "Médio Risco", value: medio, color: "#3b82f6", percent: total > 0 ? ((medio / total) * 100).toFixed(1) : "0" },
      { name: "Alto Risco", value: alto, color: "#f97316", percent: total > 0 ? ((alto / total) * 100).toFixed(1) : "0" },
      { name: "Máximo Risco", value: maximo, color: "#ef4444", percent: total > 0 ? ((maximo / total) * 100).toFixed(1) : "0" }
    ];
  }, [myPrison, localInmates]);

  // Capacity breakdown per Pavilion
  const pavilionsChartData = useMemo(() => {
    if (!myPrison || !myPrison.pavilions) return [];
    return myPrison.pavilions.map(pav => {
      const capacity = pav.blocks.reduce((sum, blk) => sum + blk.capacity, 0);
      const current = pav.blocks.reduce((sum, blk) => sum + blk.current, 0);
      return {
        name: pav.name.replace("Pavilhão", "Pav"),
        "Capacidade": capacity,
        "Ocupação Atual": current,
        "Lotação %": capacity > 0 ? Math.round((current / capacity) * 100) : 0
      };
    });
  }, [myPrison]);

  // Local incidents Recharts data structure
  const localIncidentsChartData = useMemo(() => {
    return [
      { subject: "Agressões", A: localIncidents.Agressao, fullMark: 50 },
      { subject: "Tentativas de Fuga", A: localIncidents.Fuga, fullMark: 10 },
      { subject: "Contrabando / Posse Ilícita", A: localIncidents.PosseIlicita, fullMark: 50 },
      { subject: "Indisciplina / Motins", A: localIncidents.Indisciplina, fullMark: 30 }
    ];
  }, [localIncidents]);

  // Simulated temporal occupancy trend for Area Chart
  const temporalTrendData = useMemo(() => {
    const baseOcc = myPrison ? myPrison.currentOccupancy : 1200;
    return [
      { date: "Segunda", ocupacao: Math.round(baseOcc * 0.98), capacidade: myPrison?.operationalCapacity || 1000 },
      { date: "Terça", ocupacao: Math.round(baseOcc * 0.99), capacidade: myPrison?.operationalCapacity || 1000 },
      { date: "Quarta", ocupacao: Math.round(baseOcc * 1.0), capacidade: myPrison?.operationalCapacity || 1000 },
      { date: "Quinta", ocupacao: Math.round(baseOcc * 1.01), capacidade: myPrison?.operationalCapacity || 1000 },
      { date: "Sexta", ocupacao: Math.round(baseOcc * 1.015), capacidade: myPrison?.operationalCapacity || 1000 },
      { date: "Sábado", ocupacao: Math.round(baseOcc * 1.025), capacidade: myPrison?.operationalCapacity || 1000 },
      { date: "Domingo (Hoje)", ocupacao: baseOcc, capacidade: myPrison?.operationalCapacity || 1000 }
    ];
  }, [myPrison]);

  // Overall calculations
  const occupancyRate = myPrison ? Math.round((myPrison.currentOccupancy / myPrison.operationalCapacity) * 100) : 0;
  const isOvercrowded = occupancyRate > 100;
  const criticalThreshold = 110;

  // Handler to register incident in the unit
  const handleRegisterIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidentReason.trim()) {
      alert("Por favor, introduza a descrição ou justificativo do incidente.");
      return;
    }

    setIsSimulating(true);

    setTimeout(() => {
      // 1. Update backend/state
      setDisciplinaryIncidentsData(prev => {
        return prev.map(item => {
          if (item.unit === shortPrisonName) {
            return {
              ...item,
              [newIncidentType]: item[newIncidentType] + newIncidentQty
            };
          }
          return item;
        });
      });

      // 2. Write Audit Log
      writeAuditLog(
        currentOperator,
        "CELL_CHANGE_EXECUTE",
        "DisciplinaryIncident",
        myPrison.id,
        `[INCIDENTE LOCAL] Diretor registou ${newIncidentQty} novo(s) incidente(s) de tipo "${newIncidentType}" no ${myPrison.name}. Motivo: ${newIncidentReason}`
      );

      // 3. Trigger notification alert
      if (triggerNotification) {
        triggerNotification(
          "INTERNAL",
          currentOperator.name,
          `Incidente disciplinar de ${newIncidentType} registado com sucesso para o ${shortPrisonName}.`
        );
        
        if (newIncidentType === "Agressao" || newIncidentType === "Fuga") {
          triggerNotification(
            "SMS",
            "Supervisão Nacional MININT",
            `ALERTA PRISIONAL: O Director de Estabelecimento ${currentOperator.name} reportou um incidente crítico (${newIncidentType}) no ${shortPrisonName}.`
          );
        }
      }

      setIsSimulating(false);
      setIncidentFormOpen(false);
      setNewIncidentReason("");
      setNewIncidentQty(1);
      alert("Sucesso: O incidente disciplinar local foi registado com rigor forense e enviado para a auditoria central do MININT.");
    }, 600);
  };

  const selectedPavilion = useMemo(() => {
    if (!selectedPavilionId || !myPrison) return null;
    return myPrison.pavilions.find(p => p.id === selectedPavilionId);
  }, [selectedPavilionId, myPrison]);

  if (!myPrison) {
    return (
      <div className="bg-[#05070c] border border-slate-900 rounded-xl p-8 text-center text-slate-400 font-mono text-xs flex flex-col items-center justify-center gap-3 w-full">
        <Building className="h-10 w-10 text-amber-500/60 animate-pulse" />
        <span className="font-bold text-slate-200">NENHUM ESTABELECIMENTO PENITENCIÁRIO REGISTADO</span>
        <p className="max-w-md text-[11px] text-slate-400">
          Não existe nenhum estabelecimento associado a este utilizador ou cadastrado no sistema. Crie novos estabelecimentos dinamicamente através da consola de Direção Geral.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans w-full text-left" id="director-establishment-dashboard">
      
      {/* 1. LOCAL DIRECTORY BRANDING HEADER */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-500 hidden sm:block">
            <Building className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" /> GESTÃO LOCAL EXCLUSIVA
              </span>
              <span className="text-slate-500 text-xs font-mono">• {myPrison?.location || "Angola"}</span>
            </div>
            <h1 className="text-xl font-bold font-sans tracking-tight text-slate-100 mt-1">
              Painel Diretivo: {myPrison?.name || "Estabelecimento Penitenciário"}
            </h1>
            <p className="text-xxs sm:text-xs text-slate-400 mt-1 max-w-2xl">
              Bem-vindo, <strong className="text-slate-300">{currentOperator.name}</strong> ({currentOperator.roleName}). Este portal apresenta estatísticas operacionais de lotação e incidentes estritamente delimitadas para a sua jurisdição penitenciária.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIncidentFormOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-slate-950 font-black text-xxs uppercase tracking-wider font-mono px-4 py-2.5 rounded-lg transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-red-500/15 cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Registar Incidente Disciplinar
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: OCUPAÇÃO GERAL */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xxs text-slate-400 font-mono uppercase tracking-widest">Ocupação vs Capacidade</span>
              <span className="text-2xl font-black text-slate-200 mt-1">
                {myPrison?.currentOccupancy} <span className="text-xs text-slate-500 font-normal">/ {myPrison?.operationalCapacity}</span>
              </span>
            </div>
            <span className={`p-2 rounded-lg ${isOvercrowded ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 pt-3.5 border-t border-slate-950/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">Taxa de Ocupação:</span>
            <span className={`text-xxs font-mono font-extrabold px-2 py-0.5 rounded ${
              occupancyRate > criticalThreshold ? "bg-red-500/20 text-red-400" : occupancyRate > 100 ? "bg-orange-500/20 text-orange-400" : "bg-emerald-500/20 text-emerald-400"
            }`}>
              {occupancyRate}% {isOvercrowded ? "⚠️ Sobrelotado" : "✓ Estável"}
            </span>
          </div>
        </div>

        {/* KPI 2: INCIDENTES ACUMULADOS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xxs text-slate-400 font-mono uppercase tracking-widest">Incidentes Registados</span>
              <span className="text-2xl font-black text-slate-200 mt-1">
                {localIncidents.Agressao + localIncidents.Fuga + localIncidents.PosseIlicita + localIncidents.Indisciplina}
              </span>
            </div>
            <span className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <Flame className="h-4 w-4 animate-pulse" />
            </span>
          </div>
          <div className="mt-4 pt-3.5 border-t border-slate-950/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">Mais frequente:</span>
            <span className="text-xxs font-mono text-red-400 font-extrabold bg-slate-950 px-2 py-0.5 rounded">
              Contrabando ({localIncidents.PosseIlicita})
            </span>
          </div>
        </div>

        {/* KPI 3: AMBIENTE DE SEGURANÇA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xxs text-slate-400 font-mono uppercase tracking-widest">Nível de Ameaça Coletiva</span>
              <span className={`text-sm font-black uppercase tracking-wider mt-2.5 ${
                isOvercrowded ? "text-red-400" : "text-amber-500"
              }`}>
                {isOvercrowded ? "RISCO CRÍTICO" : "RISCO MODERADO"}
              </span>
            </div>
            <span className={`p-2 rounded-lg ${isOvercrowded ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-500"}`}>
              <ShieldAlert className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 pt-3.5 border-t border-slate-950/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">Rácio guarda/recluso:</span>
            <span className="text-xxs font-mono text-slate-300 font-bold">1 : 8.5 (Vigilância Ativa)</span>
          </div>
        </div>

        {/* KPI 4: CAPACIDADE ADMISSÍVEL */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xxs text-slate-400 font-mono uppercase tracking-widest">Capacidade Admissível</span>
              <span className={`text-2xl font-black mt-1 ${
                isOvercrowded ? "text-red-400" : "text-emerald-400"
              }`}>
                {isOvercrowded 
                  ? `+${myPrison.currentOccupancy - myPrison.operationalCapacity}` 
                  : `${myPrison.operationalCapacity - myPrison.currentOccupancy}`}
                <span className="text-xs text-slate-500 font-normal"> {isOvercrowded ? "excedidos" : "disponíveis"}</span>
              </span>
            </div>
            <span className={`p-2 rounded-lg ${isOvercrowded ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 pt-3.5 border-t border-slate-950/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">Capacidade Oficial:</span>
            <span className="text-xxs font-mono text-slate-400 font-semibold">{myPrison?.officialCapacity} reclusos</span>
          </div>
        </div>
      </div>

      {/* 3. RECHARTS VISUALIZATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHARTS COLUMN 1 & 2: CAPACITY COMPARISON & TREND */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* VISUAL 1: OCCUPANCY BY PAVILION (BAR CHART) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-amber-500" /> Distribuição de Lotação por Pavilhão
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Fórmula: Ocupação Atual vs Limite</span>
              </div>
              <p className="text-xxs text-slate-400 mt-1">
                Estatística quantitativa detalhando cada pavilhão físico para isolar pontos críticos de sobrelotação.
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pavilionsChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <ReTooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#e2e8f0", fontSize: "11px" }}
                    labelStyle={{ color: "#f59e0b", fontSize: "11px", fontWeight: "bold" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }} />
                  <Bar dataKey="Capacidade" fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Ocupação Atual" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                    {pavilionsChartData.map((entry, index) => {
                      const isPavOver = entry["Ocupação Atual"] > entry["Capacidade"];
                      return <ReCell key={`cell-${index}`} fill={isPavOver ? "#ef4444" : "#f59e0b"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* VISUAL 2: OCCUPANCY HISTORICAL DAILY EVOLUTION (AREA CHART) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-indigo-400" /> Histórico Semanal de Estabilização Prisional
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Tempo Real</span>
              </div>
              <p className="text-xxs text-slate-400 mt-1">
                Evolução diária da população carcerária ativa comparada com a barreira operacional limite estabelecida pelo plano diretor de Angola.
              </p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={temporalTrendData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorOcup" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <ReTooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#e2e8f0", fontSize: "11px" }}
                    labelStyle={{ color: "#818cf8", fontSize: "11px", fontWeight: "bold" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }} />
                  <Area type="monotone" dataKey="ocupacao" name="População Ativa" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOcup)" />
                  <Area type="monotone" dataKey="capacidade" name="Capacidade Limite" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CHARTS COLUMN 3: RADAR OF INCIDENTS & DONUT OF RISK */}
        <div className="flex flex-col gap-6">
          
          {/* VISUAL 3: INCIDENT DISCIPLINARY SIGNATURE (RADAR CHART) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Flame className="h-3.5 w-3.5 text-red-500" /> Assinatura de Incidentes Disciplinares
                </h3>
              </div>
              <p className="text-xxs text-slate-400 mt-1">
                Análise de sensibilidade multidimensional por categoria do incidente para auxiliar no planejamento operacional.
              </p>
            </div>

            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={localIncidentsChartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#475569" fontSize={8} />
                  <Radar name="Incidentes" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  <ReTooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#f87171", fontSize: "11px" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Soma de Incidentes Locais:</span>
              <span className="text-red-400 font-extrabold">
                {localIncidents.Agressao + localIncidents.Fuga + localIncidents.PosseIlicita + localIncidents.Indisciplina} registos
              </span>
            </div>
          </div>

          {/* VISUAL 4: RISK LEVEL PROFILE DONUT */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Perfil de Risco Penitenciário
              </h3>
              <p className="text-xxs text-slate-400 mt-1">
                Frequência de reclusos por nível de perigosidade ativa avaliados pela biometria comportamental.
              </p>
            </div>

            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={localRiskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {localRiskData.map((entry, index) => (
                      <ReCell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                    itemStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xxs text-slate-500 uppercase font-mono leading-none">Total Reclusos</span>
                <span className="text-lg font-black text-slate-200 mt-0.5">
                  {localRiskData.reduce((acc, curr) => acc + curr.value, 0)}
                </span>
              </div>
            </div>

            {/* Legend breakdown list */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-950/60 pt-3.5">
              {localRiskData.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 truncate">{item.name}:</span>
                  <span className="text-slate-200 font-bold ml-auto">{item.value} ({item.percent}%)</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 4. INTERACTIVE PAVILION INSPECTOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
        <div className="border-b border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-teal-400" /> Inspetor Físico do Estabelecimento (Pavilhões e Blocos)
          </h3>
          <p className="text-xxs text-slate-400 mt-1">
            Selecione um pavilhão prisional para fiscalizar detalhadamente a ocupação física por bloco, número de celas e lotação tolerada.
          </p>
        </div>

        {/* Selection Tabs */}
        <div className="flex flex-wrap gap-2.5 mb-5">
          {myPrison?.pavilions?.map((pav) => {
            const pavCapacity = pav.blocks.reduce((sum, b) => sum + b.capacity, 0);
            const pavCurrent = pav.blocks.reduce((sum, b) => sum + b.current, 0);
            const pavRate = pavCapacity > 0 ? Math.round((pavCurrent / pavCapacity) * 100) : 0;
            const isPavOver = pavRate > 100;
            const isSelected = selectedPavilionId === pav.id;

            return (
              <button
                key={pav.id}
                type="button"
                onClick={() => setSelectedPavilionId(isSelected ? null : pav.id)}
                className={`px-4 py-3 rounded-lg border text-left flex flex-col gap-1 transition-all flex-1 min-w-[200px] cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 text-amber-100 shadow-md shadow-amber-500/5"
                    : "bg-slate-950/70 border-slate-850 text-slate-400 hover:border-slate-800 hover:bg-slate-950"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold font-sans text-slate-200">{pav.name}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isPavOver ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {pavRate}% Lotação
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xxs text-slate-500 mt-1 font-mono">
                  <span>Capacidade: {pavCapacity}</span>
                  <span>•</span>
                  <span className={isPavOver ? "text-red-400 font-bold" : "text-slate-400"}>Ocupados: {pavCurrent}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Block detailed grid */}
        {selectedPavilion ? (
          <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4.5 animate-fade-in text-left">
            <h4 className="text-xxs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              Estrutura Interna de Blocos: {selectedPavilion.name}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPavilion.blocks.map((blk) => {
                const blkRate = Math.round((blk.current / blk.capacity) * 100);
                const isBlkOver = blkRate > 100;
                
                return (
                  <div 
                    key={blk.id}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="text-xs font-bold text-slate-200 font-sans">{blk.name}</h5>
                          <span className="text-[9px] font-mono bg-slate-950 px-1.5 py-0.5 border border-slate-850 rounded text-slate-400">
                            ID do Bloco: {blk.id}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isBlkOver ? "bg-red-500/10 text-red-400 font-extrabold animate-pulse" : "bg-slate-950 text-slate-400"
                        }`}>
                          {blkRate}%
                        </span>
                      </div>

                      {/* Micro bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-2">
                        <div 
                          className={`h-full rounded-full ${isBlkOver ? "bg-red-500" : blkRate > 85 ? "bg-amber-500" : "bg-teal-500"}`}
                          style={{ width: `${Math.min(blkRate, 100)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400 mt-2">
                        <span>Células Ativas: <strong className="text-slate-300">{blk.cellCount}</strong></span>
                        <span>Risco Médio: <strong className="text-slate-300">{blk.riskLevel}</strong></span>
                        <span>Ocupação: <strong className="text-slate-300">{blk.current}</strong></span>
                        <span>Capacidade: <strong className="text-slate-300">{blk.capacity}</strong></span>
                      </div>
                    </div>

                    {isBlkOver && (
                      <div className="mt-3.5 bg-red-950/40 border border-red-500/20 rounded p-2 text-[9.5px] font-mono text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-400 animate-bounce" />
                        <span>ALERTA DE SOBRELOTAÇÃO EXCEDIDO!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/30 border border-dashed border-slate-850 rounded-lg p-6 text-center text-xs text-slate-500">
            Selecione um pavilhão acima para expandir os blocos prisionais, inspecionar celas e auditar reclusos.
          </div>
        )}
      </div>

      {/* 5. SECURITY NOTIFICATIONS LOG FOR LOCAL DIRECTORS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-400" /> Diretrizes e Regulamentos Prisionais de Angola (MININT)
          </h3>
          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <Compass className="h-3 w-3" /> Regulado pela Lei n.º 8/08
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-400 font-sans">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-850 flex flex-col gap-2">
            <h4 className="font-mono text-xxs font-bold uppercase text-slate-300 flex items-center gap-1">
              <Lock className="h-3 w-3 text-amber-500" /> Segregação e Atribuição de Alas
            </h4>
            <p className="text-xxs">
              De acordo com as normas forenses de Luanda e o Regulamento Geral dos Estabelecimentos Penitenciários, os reclusos de <strong>Máximo Risco</strong> e preventivos sob investigação policial devem ser mantidos em celas individuais especiais com escolta reforçada, não devendo transitar para alas comuns sem homologação superior.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-850 flex flex-col gap-2">
            <h4 className="font-mono text-xxs font-bold uppercase text-slate-300 flex items-center gap-1">
              <FileText className="h-3 w-3 text-indigo-400" /> Comunicação Obrigatória de Incidentes
            </h4>
            <p className="text-xxs">
              Toda e qualquer infração grave à ordem pública carcerária (incluindo desacatos ao corpo de guarda, posse ilegal de armas artesanais, drogas ou aparelhos de comunicação móvel) deve ser catalogada no sistema dentro de <strong>no máximo 2 horas</strong> após a ocorrência física.
            </p>
          </div>
        </div>
      </div>

      {/* 6. MODAL SIMULATION FOR DISCIPLINARY INCIDENT */}
      {incidentFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider font-mono">
                  Reportar Incidente Prisional
                </h3>
              </div>
              <button 
                onClick={() => setIncidentFormOpen(false)}
                className="text-slate-500 hover:text-slate-350 transition font-mono text-sm uppercase px-1.5 py-0.5 rounded hover:bg-slate-850"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleRegisterIncident} className="flex flex-col gap-4">
              <div>
                <label className="block text-xxs uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                  Unidade Afetada (Jurisdição Local)
                </label>
                <input 
                  type="text" 
                  value={myPrison.name}
                  disabled 
                  className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xxs text-slate-400 font-sans w-full opacity-65 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                    Tipo de Ocorrência
                  </label>
                  <select
                    value={newIncidentType}
                    onChange={(e: any) => setNewIncidentType(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xxs text-slate-200 font-sans w-full focus:outline-none focus:border-amber-500"
                  >
                    <option value="Agressao">Agressão / Indisciplina Física</option>
                    <option value="Fuga">Tentativa de Fuga / Evasão</option>
                    <option value="PosseIlicita">Contrabando / Posse Ilícita</option>
                    <option value="Indisciplina">Desobediência / Recusa Operacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xxs uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                    Quantidade de Eventos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newIncidentQty}
                    onChange={(e) => setNewIncidentQty(parseInt(e.target.value) || 1)}
                    className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xxs text-slate-200 font-sans w-full focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                  Descrição detalhada e justificação regulamentar (Auditoria)
                </label>
                <textarea
                  value={newIncidentReason}
                  onChange={(e) => setNewIncidentReason(e.target.value)}
                  rows={4}
                  placeholder="Descreva as circunstâncias físicas do incidente, reclusos envolvidos (NIP/Nome se conhecidos), medidas de contenção adoptadas e isolamento disciplinar..."
                  className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xxs text-slate-200 font-sans w-full focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="bg-slate-950 p-3 border border-slate-850 rounded-lg flex gap-2.5 text-[10px] font-mono leading-relaxed text-slate-500">
                <Info className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Garantia de Rigor:</strong> O registro deste formulário assina criptograficamente a operação com a chave eletrônica do Director do Estabelecimento e insere de forma permanente o log na trilha de auditoria central do MININT de Angola.
                </p>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-800 pt-3 mt-1">
                <button
                  type="button"
                  onClick={() => setIncidentFormOpen(false)}
                  className="bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800 font-bold text-xxs uppercase tracking-wider font-mono px-4 py-2.5 rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-900 text-slate-950 font-black text-xxs uppercase tracking-wider font-mono px-5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-500/10"
                >
                  {isSimulating ? "Registando..." : "Submeter Registro Oficial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
