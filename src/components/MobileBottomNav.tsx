import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Building2, 
  ArrowLeftRight,
  Filter,
  Plus
} from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQRScanner?: () => void;
  onOpenFilters?: () => void;
  onOpenAddInmate: () => void;
  activeInmateCount?: number;
  alertCount?: number;
}

export function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenQRScanner,
  onOpenFilters,
  onOpenAddInmate,
  activeInmateCount = 0,
  alertCount = 0
}: MobileBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-lg px-2 py-1.5 md:hidden font-sans select-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Dashboard / Painel */}
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center p-1 rounded-xl transition cursor-pointer touch-manipulation ${
            activeTab === "dashboard" || activeTab === "centro-comando"
              ? "text-amber-400 bg-amber-500/10 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Painel</span>
        </button>

        {/* Reclusos / Consulta */}
        <button
          type="button"
          onClick={() => setActiveTab("admissions")}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center p-1 rounded-xl relative transition cursor-pointer touch-manipulation ${
            activeTab === "admissions"
              ? "text-amber-400 bg-amber-500/10 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Reclusos</span>
          {activeInmateCount > 0 && (
            <span className="absolute top-1 right-2 bg-amber-500 text-slate-950 text-[8px] font-extrabold px-1 rounded-full">
              {activeInmateCount > 99 ? "99+" : activeInmateCount}
            </span>
          )}
        </button>

        {/* Central Primary Action FAB: Admissão Rápida (+ Admitir) */}
        <div className="relative -top-3 px-1 flex flex-col items-center">
          <button
            type="button"
            onClick={onOpenAddInmate}
            className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 flex items-center justify-center font-bold active:scale-95 transition cursor-pointer touch-manipulation border-2 border-slate-950"
            title="Nova Admissão de Recluso (+ Admitir)"
          >
            <UserPlus className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Transferências */}
        <button
          type="button"
          onClick={() => setActiveTab("movements")}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center p-1 rounded-xl transition cursor-pointer touch-manipulation ${
            activeTab === "movements"
              ? "text-amber-400 bg-amber-500/10 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ArrowLeftRight className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Transferir</span>
        </button>

        {/* Lotação / EPs */}
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center p-1 rounded-xl relative transition cursor-pointer touch-manipulation ${
            activeTab === "dashboard"
              ? "text-amber-400 bg-amber-500/10 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building2 className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5">Lotação</span>
          {alertCount > 0 && (
            <span className="absolute top-1 right-2 bg-red-500 text-white text-[8px] font-extrabold px-1.5 rounded-full animate-pulse">
              {alertCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
