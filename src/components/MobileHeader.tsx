import React, { useState } from "react";
import { 
  Shield, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Search, 
  Menu, 
  X, 
  Building2, 
  Database, 
  Users, 
  ArrowLeftRight, 
  LayoutDashboard, 
  BrainCircuit, 
  ShieldCheck, 
  Briefcase, 
  Scale, 
  Stethoscope, 
  FileCheck2, 
  Settings,
  ChevronRight
} from "lucide-react";

interface MobileHeaderProps {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  syncQueueCount: number;
  isSyncing: boolean;
  onTriggerSync: () => void;
  currentOperator: {
    name: string;
    province?: string;
    unit?: string;
    role?: string;
  };
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearchModal: () => void;
  onOpenAddInmate: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  isOnline,
  setIsOnline,
  syncQueueCount,
  isSyncing,
  onTriggerSync,
  currentOperator,
  activeTab,
  setActiveTab,
  onOpenSearchModal,
  onOpenAddInmate
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuModules = [
    { id: "centro-comando", label: "Painel de Comando Nacional", icon: LayoutDashboard, badge: "Geral" },
    { id: "admissions", label: "Cadastro & Reclusos (IndexedDB)", icon: Users, badge: "Campo" },
    { id: "movements", label: "Guia de Transferência e Escolta", icon: ArrowLeftRight, badge: "Trânsito" },
    { id: "governance", label: "Gestão de Lotação & Vagas", icon: Building2, badge: "EPs" },
    { id: "centro-inteligencia", label: "Centro de Inteligência Prisional", icon: BrainCircuit, badge: "IA/Risco" },
    { id: "auditing", label: "Auditoria Central & Não-Repúdio", icon: ShieldCheck, badge: "SHA-256" },
    { id: "rh", label: "Efetivo RH & Rácio Guarda/Recluso", icon: Briefcase, badge: "MININT" },
    { id: "mncp", label: "Doutrina CNEL / MNCP", icon: Scale, badge: "Direito" },
    { id: "health", label: "Módulo Clínico & Saúde Prisional", icon: Stethoscope, badge: "Saúde" },
    { id: "documents", label: "Modelos de Documentos e Selos", icon: FileCheck2, badge: "Oficial" },
    { id: "settings", label: "Ajustes de Rede e Parâmetros OS", icon: Settings, badge: "Config" }
  ];

  return (
    <header className="md:hidden sticky top-0 z-30 bg-slate-950/95 border-b border-slate-800 backdrop-blur-md px-3 py-2 font-sans select-none">
      {/* Top Bar Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Emblem + Title */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-500 shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-xs text-slate-100 tracking-wider">
                PNAP.AO
              </span>
              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[8px] font-mono font-bold px-1 rounded uppercase">
                OS MOBILE
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400 font-mono truncate max-w-[140px]">
              {currentOperator.unit || `EP ${currentOperator.province || "Luanda"}`}
            </p>
          </div>
        </div>

        {/* Right: Actions (Search, Sync State Badge, Menu) */}
        <div className="flex items-center gap-1.5">
          {/* Quick Search Trigger */}
          <button
            type="button"
            onClick={onOpenSearchModal}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-mono flex items-center justify-center cursor-pointer active:scale-95 transition"
            title="Pesquisar Recluso"
          >
            <Search className="h-4 w-4 text-amber-400" />
          </button>

          {/* Network & Offline Status Button */}
          <button
            type="button"
            onClick={() => {
              if (!isOnline) {
                setIsOnline(true);
                onTriggerSync();
              } else {
                onTriggerSync();
              }
            }}
            className={`px-2 py-1.5 rounded-lg border text-[9px] font-mono font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer ${
              !isOnline
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400 animate-pulse"
                : syncQueueCount > 0
                ? "bg-sky-500/15 border-sky-500/40 text-sky-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
          >
            {!isOnline ? (
              <>
                <WifiOff className="h-3 w-3 text-amber-400" />
                <span>OFFLINE ({syncQueueCount})</span>
              </>
            ) : syncQueueCount > 0 ? (
              <>
                <RefreshCw className={`h-3 w-3 text-sky-400 ${isSyncing ? "animate-spin" : ""}`} />
                <span>SYNC ({syncQueueCount})</span>
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3 text-emerald-400" />
                <span>ONLINE</span>
              </>
            )}
          </button>

          {/* Slide-out Menu Hamburger */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-mono flex items-center justify-center cursor-pointer active:scale-95 transition"
          >
            {isMenuOpen ? <X className="h-4 w-4 text-amber-400" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Network Alert Notification Bar when Offline */}
      {!isOnline && (
        <div className="mt-2 bg-amber-950/80 border border-amber-500/40 rounded-lg p-2 text-[10px] font-mono text-amber-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Database className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Contingência Angola Ativa. Operações gravadas no IndexedDB ({syncQueueCount} pendentes).</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOnline(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[9px] shrink-0 cursor-pointer"
          >
            Reconectar
          </button>
        </div>
      )}

      {/* Slide-out Full Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end transition-opacity">
          <div className="w-4/5 max-w-sm bg-slate-950 border-l border-slate-800 h-full flex flex-col p-4 overflow-y-auto font-sans shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="font-mono font-bold text-sm text-slate-100">Módulos PNAP.AO</h3>
                  <p className="text-[10px] text-slate-400">Operador: {currentOperator.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Action Button inside Drawer */}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenAddInmate();
              }}
              className="w-full min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider mb-4 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            >
              <Users className="h-4 w-4" /> + Cadastrar Novo Recluso
            </button>

            {/* Module List Links */}
            <div className="flex flex-col gap-1.5 flex-1">
              {menuModules.map((mod) => {
                const IconComp = mod.icon;
                const isActive = activeTab === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(mod.id);
                      setIsMenuOpen(false);
                    }}
                    className={`min-h-[48px] px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer touch-manipulation ${
                      isActive
                        ? "bg-amber-500/15 border-amber-500 text-amber-400 font-bold"
                        : "bg-slate-900/80 border-slate-850 text-slate-300 hover:bg-slate-850"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComp className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                      <span>{mod.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-750">
                        {mod.badge}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer info */}
            <div className="border-t border-slate-850 pt-3 mt-4 text-[10px] text-slate-500 font-mono flex flex-col gap-1">
              <span>SISTEMA OPERACIONAL MININT • ANGOLA</span>
              <span>Modo Contingência: IndexedDB + PWA Offline</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
