import React from "react";
import { Building2, ShieldAlert, Users, Percent, CheckCircle2, AlertTriangle } from "lucide-react";
import { MobileBottomDrawer } from "./MobileBottomDrawer";

interface Prison {
  id: string;
  name: string;
  capacity?: number;
  currentInmates?: number;
}

interface MobileOccupancyGaugeProps {
  isOpen: boolean;
  onClose: () => void;
  prisons: Prison[];
  inmatesCountByPrison: Record<string, number>;
}

export function MobileOccupancyGauge({
  isOpen,
  onClose,
  prisons,
  inmatesCountByPrison
}: MobileOccupancyGaugeProps) {
  // Capacity benchmark map
  const defaultCapacityMap: Record<string, number> = {
    "ep-viana": 1200,
    "ep-luanda": 800,
    "ep-kakila": 600,
    "ep-calulo": 450,
    "ep-huambo": 700
  };

  return (
    <MobileBottomDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Consulta de Lotação & Ocupação Prisional"
      subtitle="Monitorização de capacidade das Unidades Penitenciárias MININT"
      icon={<Building2 className="h-5 w-5 text-amber-400" />}
      maxHeightClass="max-h-[85vh]"
    >
      <div className="flex flex-col gap-3.5 font-sans text-xs">
        {prisons.map((pr) => {
          const count = inmatesCountByPrison[pr.id] || pr.currentInmates || 0;
          const capacity = pr.capacity || defaultCapacityMap[pr.id] || 1000;
          const percentage = Math.round((count / capacity) * 100);
          const isOvercrowded = percentage >= 90;

          return (
            <div
              key={pr.id}
              className={`p-3.5 rounded-xl border flex flex-col gap-2 transition ${
                isOvercrowded
                  ? "bg-red-950/20 border-red-500/40"
                  : "bg-slate-900/90 border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">
                    {pr.name.replace("Estabelecimento Penitenciário de ", "EP ")}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Lotação Máxima: <strong className="text-slate-200">{capacity}</strong> reclusos
                  </p>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                    isOvercrowded
                      ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                      : percentage > 75
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {percentage}% Ocupado
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOvercrowded ? "bg-red-500" : percentage > 75 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  Atuais: <strong className="text-slate-200">{count}</strong>
                </span>
                <span className="text-slate-400">
                  Vagas Livres:{" "}
                  <strong className={capacity - count <= 0 ? "text-red-400" : "text-emerald-400"}>
                    {Math.max(0, capacity - count)}
                  </strong>
                </span>
              </div>

              {isOvercrowded && (
                <div className="flex items-center gap-1.5 text-[10px] text-red-300 font-mono font-bold bg-red-950/40 p-1.5 rounded-lg border border-red-500/30 mt-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span>Alerta: Unidade próxima do limite de capacidade física.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </MobileBottomDrawer>
  );
}
