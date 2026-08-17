import React from "react";
import { 
  LayoutGrid, 
  Search, 
  UserPlus, 
  Building2, 
  ArrowLeftRight
} from "lucide-react";

interface Operator {
  id?: string;
  name?: string;
  role?: string;
  level?: "NATIONAL" | "PROVINCIAL" | "ESTABLISHMENT" | string;
  territorialScope?: string;
  province?: string;
  assignedPrisonId?: string;
}

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQRScanner?: () => void;
  onOpenFilters?: () => void;
  onOpenAddInmate: () => void;
  onOpenOccupancy?: () => void;
  activeInmateCount?: number;
  alertCount?: number;
  currentOperator?: Operator | any;
}

export function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenQRScanner,
  onOpenFilters,
  onOpenAddInmate,
  onOpenOccupancy,
  activeInmateCount = 0,
  alertCount = 1,
  currentOperator
}: MobileBottomNavProps) {
  const isDashboardActive = activeTab === "dashboard" || activeTab === "centro-comando" || activeTab === "";
  const isConsultaActive = activeTab === "inmates" || activeTab === "consulta" || activeTab === "admissions";
  const isTransferActive = activeTab === "movements" || activeTab === "transfers";
  const isLotacaoActive = activeTab === "occupancy" || activeTab === "lotacao";

  // Check if central operator (DG / Superuser / National Scope)
  const isCentralDirectorate = 
    currentOperator?.role === "DIRECTOR_GERAL" ||
    currentOperator?.role === "SUPERUSER" ||
    currentOperator?.level === "NATIONAL" ||
    currentOperator?.territorialScope === "NATIONAL";

  return (
    <nav 
      id="mobile-bottom-navigation-bar"
      aria-label="Navegação móvel principal"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#04060a]/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-1 md:hidden font-sans select-none shadow-[0_-8px_25px_rgba(0,0,0,0.7)]"
    >
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        
        {/* 1. INTENÇÃO: PAINEL — Consciência situacional, KPIs e comando */}
        <button
          id="mobile-nav-btn-painel"
          type="button"
          aria-label="Abrir Painel de Comando"
          onClick={() => {
            setActiveTab("dashboard");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-200 cursor-pointer touch-manipulation active:scale-95 ${
            isDashboardActive
              ? "text-amber-400 bg-amber-500/15 font-bold shadow-sm ring-1 ring-amber-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
          title="Painel de Comando Operacional: Indicadores, KPIs e Alertas"
        >
          <div className="relative">
            <LayoutGrid className={`h-5 w-5 transition-transform ${isDashboardActive ? "scale-110 text-amber-400" : "text-slate-400"}`} />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isDashboardActive ? "font-extrabold text-amber-300" : "font-medium"}`}>
            Painel
          </span>
        </button>

        {/* 2. INTENÇÃO: CONSULTA (SEARCH-FIRST) — Exclusivo para pesquisa e localização de reclusos */}
        <button
          id="mobile-nav-btn-consulta"
          type="button"
          aria-label="Consultar e Pesquisar Reclusos"
          onClick={() => {
            setActiveTab("inmates");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center p-1 rounded-xl relative transition-all duration-200 cursor-pointer touch-manipulation active:scale-95 ${
            isConsultaActive
              ? "text-blue-400 bg-blue-500/15 font-bold shadow-sm ring-1 ring-blue-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
          title="Consulta Search-First: Pesquisa imediata por Nome, BI, RNR, EP e Cela"
        >
          <div className="relative">
            <Search className={`h-5 w-5 transition-transform ${isConsultaActive ? "scale-110 text-blue-400" : "text-slate-400"}`} />
            {activeInmateCount > 0 && (
              <span className="absolute -top-1.5 -right-3 bg-blue-600 text-white text-[7.5px] font-mono font-black px-1 py-0.2 rounded-full border border-slate-950 shadow-xs">
                {activeInmateCount > 99 ? "99+" : activeInmateCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isConsultaActive ? "font-extrabold text-blue-300" : "font-medium"}`}>
            Consulta
          </span>
        </button>

        {/* 3. INTENÇÃO: + INGRESSO OU DESPACHO CENTRAL — Adaptativo ao contexto de competência */}
        <div className="relative -top-4 px-1.5 flex flex-col items-center shrink-0">
          <button
            id="mobile-nav-btn-central-add"
            type="button"
            aria-label={isCentralDirectorate ? "Abrir Validação Central de Ingresso" : "Abrir Wizard de Ingresso de 4 Fases"}
            onClick={onOpenAddInmate}
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center font-black active:scale-90 transition-all duration-200 cursor-pointer touch-manipulation border-[3px] border-[#04060a] ${
              isCentralDirectorate
                ? "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 shadow-[0_0_22px_rgba(245,158,11,0.55)] ring-2 ring-amber-400/80"
                : "bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 shadow-[0_0_22px_rgba(16,185,129,0.55)] ring-2 ring-emerald-400/80"
            }`}
            title={
              isCentralDirectorate
                ? "Supervisão Central: Homologação e Validação de Ingresso de Reclusos"
                : "Wizard de Ingresso: 4 Fases Canónicas de Admissão (1. Mandado & Identificação, 2. Biometria & Foto, 3. Regime & Risco, 4. Cela & Oficial)"
            }
          >
            <UserPlus className="h-5.5 w-5.5 stroke-[2.7] text-slate-950 drop-shadow-sm" />
          </button>
          <span className={`text-[8px] font-bold font-mono tracking-tight mt-0.5 uppercase drop-shadow ${
            isCentralDirectorate ? "text-amber-400" : "text-emerald-400"
          }`}>
            {isCentralDirectorate ? "Validação" : "+ Ingresso"}
          </span>
        </div>

        {/* 4. INTENÇÃO: MOVIMENTOS — Exclusivo para transferências, trânsito e escoltas */}
        <button
          id="mobile-nav-btn-movimentos"
          type="button"
          aria-label="Abrir Movimentações e Transferências"
          onClick={() => {
            setActiveTab("movements");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-200 cursor-pointer touch-manipulation active:scale-95 border ${
            isTransferActive
              ? "bg-[#0b101c] border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-black"
              : "bg-[#080d18] border-amber-500/30 text-amber-400 hover:bg-[#0d1527] hover:border-amber-400/60"
          }`}
          title="Movimentações e Transferências: Guias, Trânsito e Autorizações Inter-Prisionais"
        >
          <div className="relative">
            <ArrowLeftRight className="h-5 w-5 stroke-[2.4] text-amber-400" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-bold text-amber-400">
            Movimentos
          </span>
        </button>

        {/* 5. INTENÇÃO: LOTAÇÃO — Exclusivo para capacidade, vagas e alertas de saturação */}
        <button
          id="mobile-nav-btn-lotacao"
          type="button"
          aria-label="Visualizar Lotação e Capacidade"
          onClick={() => {
            if (onOpenOccupancy) {
              onOpenOccupancy();
            } else {
              setActiveTab("occupancy");
            }
          }}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center p-1 rounded-xl relative transition-all duration-200 cursor-pointer touch-manipulation active:scale-95 ${
            isLotacaoActive
              ? "text-rose-400 bg-rose-500/15 font-bold shadow-sm ring-1 ring-rose-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
          title="Lotação e Capacidade: Vagas, Saturação e Alertas de Sobrelotação"
        >
          <div className="relative">
            <Building2 className={`h-5 w-5 transition-transform ${isLotacaoActive ? "scale-110 text-rose-400" : "text-slate-400"}`} />
            {alertCount > 0 && (
              <span 
                id="mobile-lotacao-badge"
                className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[8px] font-mono font-black h-4 w-4 rounded-full flex items-center justify-center shadow-md border border-slate-950 animate-pulse"
              >
                {alertCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isLotacaoActive ? "font-extrabold text-rose-300" : "font-medium"}`}>
            Lotação
          </span>
        </button>

      </div>
    </nav>
  );
}
