import React from "react";
import { Filter, RefreshCw, CheckCircle2, Building2, ShieldAlert } from "lucide-react";
import { MobileBottomDrawer } from "./MobileBottomDrawer";

interface Prison {
  id: string;
  name: string;
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
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  prisons,
  selectedPrisonFilter,
  setSelectedPrisonFilter,
  selectedRiskFilter,
  setSelectedRiskFilter,
  onResetFilters
}: MobileFilterDrawerProps) {
  return (
    <MobileBottomDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Filtros Avançados de Custódia"
      subtitle="Filtrar reclusos por Unidade Prisional e Grau de Risco"
      icon={<Filter className="h-5 w-5 text-amber-400" />}
      maxHeightClass="max-h-[80vh]"
    >
      <div className="flex flex-col gap-4 font-sans text-xs">
        {/* Filter by Prison Unit */}
        <div>
          <label className="block font-bold text-slate-200 mb-2 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-amber-400" /> Unidade Penitenciária
          </label>
          <select
            value={selectedPrisonFilter}
            onChange={(e) => setSelectedPrisonFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-slate-200 font-sans text-xs min-h-[44px] cursor-pointer"
          >
            <option value="ALL">Todas as Unidades (Nacional)</option>
            {prisons.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Risk Level */}
        <div>
          <label className="block font-bold text-slate-200 mb-2 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-400" /> Grau de Risco Operacional
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
            onClick={onResetFilters}
            className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-400 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer touch-manipulation"
          >
            <RefreshCw className="h-4 w-4" /> Limpar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer touch-manipulation shadow-md"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </MobileBottomDrawer>
  );
}
