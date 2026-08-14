import React, { useState, useMemo } from "react";
import { Filter, RefreshCw, CheckCircle2, Building2, ShieldAlert, MapPin } from "lucide-react";
import { MobileBottomDrawer } from "./MobileBottomDrawer";

interface Prison {
  id: string;
  name: string;
  location?: string;
  province?: string;
  officialCapacity?: number;
  operationalCapacity?: number;
  currentOccupancy?: number;
}

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prisons: Prison[];
  selectedPrisonFilter: string;
  setSelectedPrisonFilter: (prisonId: string) => void;
  selectedRiskFilter: string;
  setSelectedRiskFilter: (risk: string) => void;
  onResetFilters: () => void;
  selectedProvinceFilter?: string;
  setSelectedProvinceFilter?: (province: string) => void;
}

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
  return "Luanda";
};

export function MobileFilterDrawer({
  isOpen,
  onClose,
  prisons,
  selectedPrisonFilter,
  setSelectedPrisonFilter,
  selectedRiskFilter,
  setSelectedRiskFilter,
  onResetFilters,
  selectedProvinceFilter = "ALL",
  setSelectedProvinceFilter
}: MobileFilterDrawerProps) {
  const [internalProvince, setInternalProvince] = useState<string>(selectedProvinceFilter);

  const activeProvince = setSelectedProvinceFilter ? selectedProvinceFilter : internalProvince;

  const handleProvinceChange = (prov: string) => {
    if (setSelectedProvinceFilter) {
      setSelectedProvinceFilter(prov);
    } else {
      setInternalProvince(prov);
    }
    setSelectedPrisonFilter("ALL");
  };

  const provinceOptions = useMemo(() => {
    const set = new Set<string>();
    prisons.forEach((p) => set.add(getPrisonProvince(p)));
    return Array.from(set).sort();
  }, [prisons]);

  const filteredPrisons = useMemo(() => {
    if (activeProvince === "ALL") return prisons;
    return prisons.filter((p) => getPrisonProvince(p) === activeProvince);
  }, [prisons, activeProvince]);

  return (
    <MobileBottomDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filtros Táticos de Custódia"
      subtitle="Filtrar reclusos por Província, Unidade Prisional e Grau de Risco"
      icon={<Filter className="h-5 w-5 text-amber-400" />}
      maxHeightClass="max-h-[85vh]"
    >
      <div className="flex flex-col gap-4 font-sans text-xs">
        {/* Filter by Province */}
        <div>
          <label className="block font-bold text-slate-200 mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase">
            <MapPin className="h-4 w-4 text-amber-400" /> 1. Província de Custódia
          </label>
          <select
            value={activeProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-slate-200 font-sans text-xs min-h-[44px] cursor-pointer"
          >
            <option value="ALL">🌐 Todas as Províncias (Nível Central / Nacional)</option>
            {provinceOptions.map((prov) => (
              <option key={prov} value={prov}>
                📍 {prov} ({prisons.filter(p => getPrisonProvince(p) === prov).length} EPs)
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Prison Unit */}
        <div>
          <label className="block font-bold text-slate-200 mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase">
            <Building2 className="h-4 w-4 text-sky-400" /> 2. Estabelecimento Penitenciário (EP)
          </label>
          <select
            value={selectedPrisonFilter}
            onChange={(e) => setSelectedPrisonFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-slate-200 font-sans text-xs min-h-[44px] cursor-pointer"
          >
            <option value="ALL">
              🏢 {activeProvince === "ALL" ? "Todas as Unidades (Nacional)" : `Todos os EPs de ${activeProvince}`}
            </option>
            {filteredPrisons.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Risk Level */}
        <div>
          <label className="block font-bold text-slate-200 mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase">
            <ShieldAlert className="h-4 w-4 text-emerald-400" /> 3. Grau de Risco Operacional
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "ALL", label: "Todos os Riscos" },
              { id: "Máximo", label: "Risco Máximo" },
              { id: "Alto", label: "Risco Alto" },
              { id: "Médio", label: "Risco Médio" },
              { id: "Baixo", label: "Risco Baixo" }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRiskFilter(r.id)}
                className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer touch-manipulation flex items-center justify-between ${
                  selectedRiskFilter === r.id
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                <span>{r.label}</span>
                {selectedRiskFilter === r.id && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Reset & Apply */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              handleProvinceChange("ALL");
              onResetFilters();
            }}
            className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-400 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer touch-manipulation font-mono"
          >
            <RefreshCw className="h-4 w-4" /> Limpar Filtros
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer touch-manipulation shadow-md font-mono"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </MobileBottomDrawer>
  );
}
