import React, { useState, useMemo } from "react";
import { 
  Building2, 
  ShieldAlert, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  ArrowLeftRight,
  RefreshCw,
  Search,
  Grid,
  Maximize2,
  Lock,
  BedDouble,
  SlidersHorizontal
} from "lucide-react";
import { MobileBottomDrawer } from "./MobileBottomDrawer";

interface Cell {
  id: string;
  name: string;
  capacity: number;
  current: number;
  riskCompatibility?: string;
}

interface Block {
  id: string;
  name: string;
  capacity: number;
  current: number;
  riskLevel?: string;
  cells?: Cell[];
}

interface Pavilion {
  id: string;
  name: string;
  blocks?: Block[];
}

interface Prison {
  id: string;
  name: string;
  location?: string;
  province?: string;
  officialCapacity?: number;
  operationalCapacity?: number;
  capacity?: number;
  currentOccupancy?: number;
  currentInmates?: number;
  pavilions?: Pavilion[];
}

interface Operator {
  id?: string;
  name?: string;
  role?: string;
  level?: "NATIONAL" | "PROVINCIAL" | "ESTABLISHMENT" | string;
  territorialScope?: string;
  province?: string;
  assignedPrisonId?: string;
}

interface MobileOccupancyGaugeProps {
  isOpen: boolean;
  onClose: () => void;
  prisons: Prison[];
  inmatesCountByPrison: Record<string, number>;
  currentOperator?: Operator | any;
  onSelectCellForIntake?: (prisonId: string, cellId: string, cellName: string) => void;
}

// Province helper
const getPrisonProvince = (prison: Prison): string => {
  if (prison.province) return prison.province;
  if (prison.location) {
    const parts = prison.location.split(",");
    if (parts.length > 0 && parts[0].trim()) return parts[0].trim();
  }
  const name = prison.name || "";
  if (name.includes("Viana") || name.includes("Luanda") || name.includes("Calomboloca") || name.includes("Kakila")) return "Luanda";
  if (name.includes("Benguela") || name.includes("Lobito") || name.includes("Cavaco")) return "Benguela";
  if (name.includes("Huíla") || name.includes("Lubango") || name.includes("Bentiaba")) return "Huíla";
  if (name.includes("Huambo") || name.includes("Bailundo") || name.includes("Caála")) return "Huambo";
  if (name.includes("Caxito") || name.includes("Bengo")) return "Bengo";
  if (name.includes("Cabinda") || name.includes("Yabi")) return "Cabinda";
  if (name.includes("Namibe") || name.includes("Tômbwa")) return "Namibe";
  if (name.includes("Uíge") || name.includes("Sanza Pombo")) return "Uíge";
  if (name.includes("Malanje") || name.includes("Dondo")) return "Malanje";
  if (name.includes("Bié") || name.includes("Kuito")) return "Bié";
  if (name.includes("Cunene") || name.includes("Ondjiva")) return "Cunene";
  if (name.includes("Moxico") || name.includes("Luena")) return "Moxico";
  if (name.includes("Zaire") || name.includes("Mbanza")) return "Zaire";
  if (name.includes("Lunda-Norte") || name.includes("Dundo")) return "Lunda-Norte";
  if (name.includes("Lunda-Sul") || name.includes("Saurimo")) return "Lunda-Sul";
  if (name.includes("Cuanza-Norte") || name.includes("Ndalatando")) return "Cuanza-Norte";
  if (name.includes("Cuanza-Sul") || name.includes("Sumbe")) return "Cuanza-Sul";
  if (name.includes("Cuando") || name.includes("Cubango") || name.includes("Menongue")) return "Cuando Cubango";
  return "Luanda";
};

export function MobileOccupancyGauge({
  isOpen,
  onClose,
  prisons,
  inmatesCountByPrison,
  currentOperator,
  onSelectCellForIntake
}: MobileOccupancyGaugeProps) {
  const isNational = 
    !currentOperator ||
    currentOperator.territorialScope === "NATIONAL" ||
    currentOperator.level === "NATIONAL" ||
    currentOperator.role === "DIRECTOR_GERAL";

  const defaultOperatorProvince = currentOperator?.province || "Luanda";

  // Drill-down navigation states
  const [selectedProvince, setSelectedProvince] = useState<string>(isNational ? "ALL" : defaultOperatorProvince);
  const [selectedPrisonId, setSelectedPrisonId] = useState<string>("ALL");
  const [selectedPavilionId, setSelectedPavilionId] = useState<string>("ALL");
  const [selectedBlockId, setSelectedBlockId] = useState<string>("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [activeTabMode, setActiveTabMode] = useState<"structure" | "redistribution" | "available_beds">("structure");

  // 1. Provincial Aggregates
  const provincesList = useMemo(() => {
    const map = new Map<string, { totalCap: number; totalInmates: number; prisonCount: number; criticalCount: number }>();

    prisons.forEach((p) => {
      const prov = getPrisonProvince(p);
      const cap = p.officialCapacity || p.operationalCapacity || p.capacity || 500;
      const count = inmatesCountByPrison[p.id] || p.currentInmates || p.currentOccupancy || 0;
      const isCrit = count > cap;

      const current = map.get(prov) || { totalCap: 0, totalInmates: 0, prisonCount: 0, criticalCount: 0 };
      map.set(prov, {
        totalCap: current.totalCap + cap,
        totalInmates: current.totalInmates + count,
        prisonCount: current.prisonCount + 1,
        criticalCount: current.criticalCount + (isCrit ? 1 : 0)
      });
    });

    return Array.from(map.entries()).map(([province, stats]) => ({
      province,
      ...stats,
      saturation: stats.totalCap > 0 ? Math.round((stats.totalInmates / stats.totalCap) * 100) : 0
    })).sort((a, b) => b.saturation - a.saturation);
  }, [prisons, inmatesCountByPrison]);

  // 2. Filtered Prisons for active Province
  const filteredPrisons = useMemo(() => {
    return prisons.filter((p) => {
      if (selectedProvince !== "ALL" && getPrisonProvince(p) !== selectedProvince) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      }
      return true;
    }).map((p) => {
      const count = inmatesCountByPrison[p.id] || p.currentInmates || p.currentOccupancy || 0;
      const cap = p.officialCapacity || p.operationalCapacity || p.capacity || 500;
      const saturation = cap > 0 ? Math.round((count / cap) * 100) : 0;
      const freeBeds = Math.max(0, cap - count);
      return {
        ...p,
        count,
        cap,
        saturation,
        freeBeds,
        province: getPrisonProvince(p)
      };
    }).sort((a, b) => b.saturation - a.saturation);
  }, [prisons, inmatesCountByPrison, selectedProvince, searchFilter]);

  // 3. Selected Single Prison details
  const activePrison = useMemo(() => {
    if (selectedPrisonId === "ALL") return null;
    const foundFiltered = filteredPrisons.find((p) => p.id === selectedPrisonId);
    if (foundFiltered) return foundFiltered;
    const rawPrison = prisons.find((p) => p.id === selectedPrisonId);
    if (!rawPrison) return null;
    const count = inmatesCountByPrison[rawPrison.id] || rawPrison.currentInmates || rawPrison.currentOccupancy || 0;
    const cap = rawPrison.officialCapacity || rawPrison.operationalCapacity || rawPrison.capacity || 500;
    const saturation = cap > 0 ? Math.round((count / cap) * 100) : 0;
    const freeBeds = Math.max(0, cap - count);
    return {
      ...rawPrison,
      count,
      cap,
      saturation,
      freeBeds,
      province: getPrisonProvince(rawPrison)
    };
  }, [filteredPrisons, prisons, selectedPrisonId, inmatesCountByPrison]);

  // 4. Overcrowding vs Deficit (National Redistribution under NEP)
  const redistributionAnalysis = useMemo(() => {
    const overcrowded = filteredPrisons.filter((p) => p.saturation >= 100);
    const withVagas = filteredPrisons.filter((p) => p.saturation < 85 && p.freeBeds > 20);
    return { overcrowded, withVagas };
  }, [filteredPrisons]);

  // Reset drill-down
  const handleResetDrillDown = () => {
    setSelectedProvince(isNational ? "ALL" : defaultOperatorProvince);
    setSelectedPrisonId("ALL");
    setSelectedPavilionId("ALL");
    setSelectedBlockId("ALL");
    setSearchFilter("");
  };

  return (
    <MobileBottomDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        isNational 
          ? "LOTAÇÃO NACIONAL" 
          : `LOTAÇÃO ESTRUTURAL • ${defaultOperatorProvince.toUpperCase()}`
      }
      subtitle={
        isNational
          ? "NEP Controlo Penal: Mapa das 21 Províncias"
          : "NEP Controlo Penal: Província → EP → Pavilhão → Bloco → Cela (Vagas)"
      }
      icon={<Building2 className="h-5 w-5 text-rose-400" />}
      maxHeightClass="max-h-[90vh]"
    >
      <div className="flex flex-col gap-3 font-sans text-xs select-none">
        
        {/* OPERATIONAL SCOPE HEADER & QUICK TABS */}
        <div className="bg-[#050811] border border-slate-800 rounded-xl p-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-bold uppercase">
                {isNational ? "Nível Central (DG)" : `Direcção Provincial (${defaultOperatorProvince})`}
              </span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-slate-400 font-mono hidden sm:inline">
                {filteredPrisons.length} EPs monitorizados
              </span>
            </div>

            {/* Quick Filter Reset */}
            {(selectedProvince !== "ALL" || selectedPrisonId !== "ALL" || searchFilter) && (
              <button
                type="button"
                onClick={handleResetDrillDown}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-2.5 w-2.5" /> Repor Visão
              </button>
            )}
          </div>

          {/* MODE SWITCHER PILLS */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850 font-mono text-[10.5px]">
            <button
              type="button"
              onClick={() => setActiveTabMode("structure")}
              className={`py-1 rounded font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTabMode === "structure" 
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="h-3 w-3" />
              <span>1. Estrutura</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabMode("available_beds")}
              className={`py-1 rounded font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTabMode === "available_beds" 
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BedDouble className="h-3 w-3" />
              <span>2. Vagas Livres</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabMode("redistribution")}
              className={`py-1 rounded font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTabMode === "redistribution" 
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ArrowLeftRight className="h-3 w-3" />
              <span>3. Alívio/Vagas</span>
            </button>
          </div>
        </div>

        {/* CASCADING SELECTORS: PROVÍNCIA & ESTABELECIMENTO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Select Província */}
          <div className="flex flex-col gap-1">
            <label className="text-[9.5px] font-mono font-bold uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-amber-400" /> Província
              </span>
              <span className="text-amber-400 font-mono">{selectedProvince}</span>
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedPrisonId("ALL");
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-2.5 py-2 text-slate-200 font-mono text-xs min-h-[40px] cursor-pointer"
            >
              <option value="ALL">🌐 Todas as Províncias de Angola ({provincesList.length})</option>
              {provincesList.map((p) => (
                <option key={p.province} value={p.province}>
                  📍 {p.province} ({p.prisonCount} EPs • {p.totalInmates}/{p.totalCap} • {p.saturation}%)
                </option>
              ))}
            </select>
          </div>

          {/* Select Estabelecimento Penitenciário (EP) */}
          <div className="flex flex-col gap-1">
            <label className="text-[9.5px] font-mono font-bold uppercase text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3 text-sky-400" /> Estabelecimento (EP)
              </span>
              <span className="text-sky-400 font-mono">
                {selectedPrisonId === "ALL" ? "Todos" : "1 Selecionado"}
              </span>
            </label>
            <select
              value={selectedPrisonId}
              onChange={(e) => setSelectedPrisonId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-2.5 py-2 text-slate-200 font-mono text-xs min-h-[40px] cursor-pointer"
            >
              <option value="ALL">
                🏢 {selectedProvince === "ALL" ? "Todos os Estabelecimentos" : `Todos os EPs de ${selectedProvince}`}
              </option>
              {filteredPrisons.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.saturation > 100 ? "🔴" : pr.saturation >= 85 ? "🟡" : "🟢"}{" "}
                  {pr.name.replace("EP de ", "EP ")} ({pr.count}/{pr.cap} • {pr.saturation}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TAB MODE 1: PHYSICAL STRUCTURE & CAPACITY TREE */}
        {activeTabMode === "structure" && (
          <div className="flex flex-col gap-2.5">
            {/* If Single Prison is selected: Show Pavilhões & Celas Breakdown */}
            {activePrison ? (
              <div className="bg-[#040810] border border-sky-950/60 rounded-xl p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-sky-400" />
                      {activePrison.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Província de {activePrison.province} • Lotação: {activePrison.count}/{activePrison.cap} ({activePrison.saturation}%)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPrisonId("ALL")}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/30 rounded text-[10px] font-mono font-bold"
                  >
                    ← Voltar a EPs
                  </button>
                </div>

                {/* Granular Pavilhões & Celas List */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Árvore de Pavilhões & Blocos Celulares:
                  </span>

                  {(activePrison.pavilions && activePrison.pavilions.length > 0) ? (
                    activePrison.pavilions.map((pav) => (
                      <div key={pav.id} className="bg-slate-950/90 border border-slate-850 rounded-lg p-2.5 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 text-xs font-mono flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-amber-400" />
                            {pav.name}
                          </span>
                          <span className="text-[9.5px] font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">
                            {pav.blocks?.length || 0} Blocos
                          </span>
                        </div>

                        {/* Blocks & Cells */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 border-l-2 border-amber-500/30">
                          {pav.blocks?.map((blk) => {
                            const blkSat = blk.capacity > 0 ? Math.round((blk.current / blk.capacity) * 100) : 0;
                            return (
                              <div key={blk.id} className="bg-slate-900/80 border border-slate-800 rounded p-2 flex flex-col gap-1">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className="font-bold text-slate-200">{blk.name}</span>
                                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                    blkSat >= 100 ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
                                  }`}>
                                    {blk.current}/{blk.capacity} ({blkSat}%)
                                  </span>
                                </div>

                                {/* Cells inline chips */}
                                {blk.cells && blk.cells.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {blk.cells.map((cell) => {
                                      const isCellFull = cell.current >= cell.capacity;
                                      return (
                                        <button
                                          key={cell.id}
                                          type="button"
                                          onClick={() => {
                                            if (onSelectCellForIntake) {
                                              onSelectCellForIntake(activePrison.id, cell.id, cell.name);
                                            }
                                          }}
                                          className={`px-1.5 py-0.5 rounded border text-[9.5px] font-mono flex items-center gap-1 transition ${
                                            isCellFull
                                              ? "bg-red-950/40 border-red-800 text-red-300"
                                              : "bg-emerald-950/40 border-emerald-700 text-emerald-200 hover:bg-emerald-800/40 cursor-pointer"
                                          }`}
                                          title={`Cela ${cell.name}: ${cell.current}/${cell.capacity} vagas`}
                                        >
                                          <Lock className="h-2.5 w-2.5" />
                                          <span>{cell.name}: {cell.current}/{cell.capacity}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Default simulated physical breakdown for EPs without nested json
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1.5">
                        <span className="font-mono font-bold text-slate-200 text-[11px]">Pavilhão A • Regime Fechado (Máxima Segurança)</span>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Capacidade: 250</span>
                          <span className="text-amber-400 font-bold">Ocupação: 240 (96%)</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: "96%" }} />
                        </div>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1.5">
                        <span className="font-mono font-bold text-slate-200 text-[11px]">Pavilhão B • Regime Comum (Média Segurança)</span>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Capacidade: 400</span>
                          <span className="text-emerald-400 font-bold">Ocupação: 290 (72%)</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: "72%" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // List of Prisons with Dense Inline Occupancy Bars
              <div className="flex flex-col gap-2">
                {filteredPrisons.map((pr) => {
                  const isOver = pr.saturation > 100;
                  const isAlert = pr.saturation >= 85 && pr.saturation <= 100;

                  return (
                    <div
                      key={pr.id}
                      onClick={() => setSelectedPrisonId(pr.id)}
                      className={`p-3 rounded-xl border flex flex-col gap-2 transition cursor-pointer hover:border-amber-500/50 ${
                        isOver
                          ? "bg-red-950/20 border-red-500/40"
                          : isAlert
                          ? "bg-amber-950/15 border-amber-500/30"
                          : "bg-slate-900/90 border-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-100 text-xs sm:text-sm">
                              {pr.name.replace("Estabelecimento Penitenciário de ", "EP ")}
                            </h4>
                            <span className="text-[9px] font-mono bg-slate-950 border border-slate-800 px-1.5 py-0.2 rounded text-slate-400">
                              {pr.province}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                            Lotação Oficial: <strong className="text-slate-200">{pr.cap}</strong> • Ocupação: <strong className="text-amber-400">{pr.count}</strong>
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                              isOver
                                ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                                : isAlert
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {pr.saturation}% {isOver ? "Sobrelotado" : isAlert ? "Alerta" : "Normal"}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 flex items-center gap-0.5">
                            Ver Celas <ChevronRight className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                        <div
                          style={{ width: `${Math.min(pr.saturation, 100)}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver ? "bg-red-500" : isAlert ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                        <span>Vagas Livres: <strong className={pr.freeBeds === 0 ? "text-red-400" : "text-emerald-400"}>{pr.freeBeds}</strong></span>
                        <span className="text-slate-500">ID: {pr.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB MODE 2: AVAILABLE BEDS QUICK FINDER (APOIO AO INGRESSO) */}
        {activeTabMode === "available_beds" && (
          <div className="flex flex-col gap-2.5 bg-[#03060c] p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" /> Vagas Imediatas para Alocação no Ingresso
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Total de vagas livres: {filteredPrisons.reduce((acc, p) => acc + p.freeBeds, 0)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {filteredPrisons.filter(p => p.freeBeds > 0).map((p) => (
                <div key={p.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 text-xs font-mono">
                      {p.name.replace("Estabelecimento Penitenciário de ", "EP ")} ({p.province})
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Capacidade {p.count}/{p.cap} • Regime Comum & Triagem
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs">
                      +{p.freeBeds} Vagas
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPrisonId(p.id);
                        setActiveTabMode("structure");
                      }}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 rounded text-[10px] font-mono font-bold"
                    >
                      Alocar Cela
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB MODE 3: REDISTRIBUTION / ALÍVIO SOBRE LOTAÇÃO */}
        {activeTabMode === "redistribution" && (
          <div className="flex flex-col gap-3 bg-[#03060c] p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <ArrowLeftRight className="h-4 w-4" /> Plano de Redistribuição & Alívio de Sobrelotação
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {redistributionAnalysis.overcrowded.length} EPs em Sobrelotação
              </span>
            </div>

            {/* Overcrowded Source Units */}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-red-400 block mb-1">
                1. Unidades Críticas que Necessitam de Transferência de Alívio:
              </span>
              {redistributionAnalysis.overcrowded.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {redistributionAnalysis.overcrowded.map(p => (
                    <div key={p.id} className="p-2 bg-red-950/30 border border-red-800/60 rounded flex items-center justify-between text-xs font-mono">
                      <span className="text-red-200 font-bold">{p.name} ({p.province})</span>
                      <span className="text-red-400 font-bold">{p.count}/{p.cap} ({p.saturation}%) • +{p.count - p.cap} Excesso</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-mono">Nenhum estabelecimento com sobrelotação crítica de momento.</p>
              )}
            </div>

            {/* Target Units with Vacancies */}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block mb-1">
                2. Estabelecimentos Recomendados com Capacidade Receptora:
              </span>
              <div className="flex flex-col gap-1.5">
                {redistributionAnalysis.withVagas.map(p => (
                  <div key={p.id} className="p-2 bg-emerald-950/25 border border-emerald-800/50 rounded flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-200 font-bold">{p.name} ({p.province})</span>
                    <span className="text-emerald-400 font-bold">{p.freeBeds} Vagas Livres ({p.saturation}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </MobileBottomDrawer>
  );
}