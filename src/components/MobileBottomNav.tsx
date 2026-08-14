import React from "react";
import { 
  LayoutGrid, 
  Users, 
  UserPlus, 
  Building2, 
  ArrowLeftRight,
  ClipboardList
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
  const isNational = 
    !currentOperator ||
    currentOperator.territorialScope === "NATIONAL" ||
    currentOperator.level === "NATIONAL" ||
    currentOperator.role === "DIRECTOR_GERAL" ||
    currentOperator.role === "NATIONAL_DIRECTOR";

  const isProvincial = !isNational && currentOperator?.level === "PROVINCIAL";
  const isEP = !isNational && !isProvincial;

  const isDashboardActive = activeTab === "dashboard" || activeTab === "centro-comando" || activeTab === "";
  const isReclusosActive = activeTab === "admissions" || activeTab === "inmates";
  const isTransferActive = activeTab === "movements" || activeTab === "transfers";
  const isLotacaoActive = activeTab === "occupancy" || activeTab === "lotacao";

  return (
    <div 
      id="mobile-bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#04060a]/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-1 md:hidden font-sans select-none shadow-[0_-8px_25px_rgba(0,0,0,0.7)]"
    >
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        
        {/* 1. PAINEL — «O que está a acontecer?» (Observar) */}
        <button
          id="mobile-nav-btn-painel"
          type="button"
          onClick={() => {
            setActiveTab("dashboard");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-200 cursor-pointer touch-manipulation active:scale-95 ${
            isDashboardActive
              ? "text-amber-400 bg-amber-500/15 font-bold shadow-sm ring-1 ring-amber-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
          title={
            isNational
              ? "Painel Central: Visão Nacional, Alertas Críticos, População e Transferências Pendentes"
              : isProvincial
              ? "Painel Provincial: Situação da Jurisdição, Ocorrências e População Provincial"
              : "Painel EP: Ocorrências do Dia, Ocupação e Tarefas Operacionais"
          }
        >
          <div className="relative">
            <LayoutGrid className={`h-5 w-5 transition-transform ${isDashboardActive ? "scale-110 text-amber-400" : "text-slate-400"}`} />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isDashboardActive ? "font-extrabold text-amber-300" : "font-medium"}`}>
            {isNational ? "Painel DG" : "Painel"}
          </span>
        </button>

        {/* 2. CONSULTA — «Quem / o quê preciso localizar?» (Localizar) */}
        <button
          id="mobile-nav-btn-reclusos"
          type="button"
          onClick={() => {
            setActiveTab("admissions");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center p-1 rounded-xl relative transition-all duration-200 cursor-pointer touch-manipulation active:scale-95 ${
            isReclusosActive
              ? "text-blue-400 bg-blue-500/15 font-bold shadow-sm ring-1 ring-blue-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
          title={
            isNational
              ? "Consulta Nacional: Recluso, Matrícula RNR, Processo, Estabelecimentos e Auditoria"
              : "Consulta Local: Dossier Completo, Pavilhão/Bloco/Cela, Saúde, Visitas e Disciplina"
          }
        >
          <div className="relative">
            <Users className={`h-5 w-5 transition-transform ${isReclusosActive ? "scale-110 text-blue-400" : "text-slate-400"}`} />
            {activeInmateCount > 0 && (
              <span className="absolute -top-1.5 -right-3 bg-blue-600 text-white text-[7.5px] font-mono font-black px-1 py-0.2 rounded-full border border-slate-950">
                {activeInmateCount > 99 ? "99+" : activeInmateCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isReclusosActive ? "font-extrabold text-blue-300" : "font-medium"}`}>
            Consulta
          </span>
        </button>

        {/* 3. INGRESSO — «Registar e admitir» (Admitir) */}
        {/* Central = Supervisão/Validação; Provincial/EP = Wizard Operacional */}
        <div className="relative -top-4 px-1.5 flex flex-col items-center shrink-0">
          <button
            id="mobile-nav-btn-central-add"
            type="button"
            onClick={onOpenAddInmate}
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center font-black active:scale-90 transition-all duration-200 cursor-pointer touch-manipulation border-[3px] border-[#04060a] ${
              isNational
                ? "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 shadow-[0_0_22px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/80"
                : "bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 shadow-[0_0_22px_rgba(16,185,129,0.55)] ring-2 ring-emerald-400/80"
            }`}
            title={
              isNational
                ? "Supervisão e Validação de Ingressos Nacionais / Admissão Superior"
                : "Wizard de Admissão: 15 Etapas Canónicas (Mandado, Biometria, Classificação e Cela)"
            }
          >
            {isNational ? (
              <ClipboardList className="h-5.5 w-5.5 stroke-[2.5] text-slate-950 drop-shadow-sm" />
            ) : (
              <UserPlus className="h-5.5 w-5.5 stroke-[2.7] text-slate-950 drop-shadow-sm" />
            )}
          </button>
          <span className={`text-[8px] font-bold font-mono tracking-tight mt-0.5 uppercase drop-shadow ${
            isNational ? "text-amber-400" : "text-emerald-400"
          }`}>
            {isNational ? "+ Validação" : "+ Ingresso"}
          </span>
        </div>

        {/* 4. TRANSFERÊNCIA — «Mover sob competência» (Movimentar) */}
        <button
          id="mobile-nav-btn-transferir"
          type="button"
          onClick={() => {
            setActiveTab("movements");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-200 cursor-pointer touch-manipulation active:scale-95 border ${
            isTransferActive
              ? "bg-[#0b101c] border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-black"
              : "bg-[#080d18] border-amber-500/30 text-amber-400 hover:bg-[#0d1527] hover:border-amber-400/60"
          }`}
          title={
            isNational
              ? "Transferências Nacionais: Avaliação de Pedidos Interprovinciais, Escoltas e Destinos"
              : "Movimentação Local: Pedido de Transferência, Guias de Trânsito, Escolta e Recepção"
          }
        >
          <div className="relative">
            <ArrowLeftRight className="h-5 w-5 stroke-[2.4] text-amber-400" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-bold text-amber-400">
            Transferir
          </span>
        </button>

        {/* 5. LOTAÇÃO — «Onde está / onde pode estar?» (Posicionar / Capacitar) */}
        <button
          id="mobile-nav-btn-lotacao"
          type="button"
          onClick={() => {
            if (onOpenOccupancy) {
              onOpenOccupancy();
            } else {
              setActiveTab("dashboard");
            }
          }}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center p-1 rounded-xl relative transition-all duration-200 cursor-pointer touch-manipulation active:scale-95 ${
            isLotacaoActive
              ? "text-rose-400 bg-rose-500/15 font-bold shadow-sm ring-1 ring-rose-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
          title={
            isNational
              ? "Lotação Nacional: Mapa das 18 Províncias, Capacidade Oficial, Sobrelotação e Redistribuição"
              : "Lotação Estrutural: Província → EP → Pavilhão → Bloco → Cela (Vagas e Ocupação)"
          }
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
    </div>
  );
}
