import React from "react";
import { 
  FileText, 
  UserCheck, 
  ShieldCheck, 
  Building2, 
  ExternalLink, 
  Printer, 
  History, 
  QrCode,
  AlertTriangle,
  Calendar,
  Lock
} from "lucide-react";
import { MobileBottomDrawer } from "./MobileBottomDrawer";

interface Inmate {
  id: string;
  firstName: string;
  lastName: string;
  idCard: string;
  assignedPrisonId: string;
  assignedCellNumber?: string;
  riskLevel: string;
  photo?: string;
  status?: string;
  documentCode: string;
  crimeDescription?: string;
  admissionDate?: string;
  [key: string]: any;
}

interface Prison {
  id: string;
  name: string;
}

interface MobileQuickDossierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inmate: Inmate | null;
  prisons: Prison[];
  onExportPDF: (inm: Inmate) => void;
  onEditAndSign: (inm: Inmate) => void;
  onToggleHistory: (id: string) => void;
}

export function MobileQuickDossierDrawer({
  isOpen,
  onClose,
  inmate,
  prisons,
  onExportPDF,
  onEditAndSign,
  onToggleHistory
}: MobileQuickDossierDrawerProps) {
  if (!inmate) return null;

  const prName =
    prisons.find((p) => p.id === inmate.assignedPrisonId)?.name.replace("Estabelecimento Penitenciário de ", "EP ") ||
    "EP Viana";

  return (
    <MobileBottomDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha Canónica de Custódia (Consulta Rápida)"
      subtitle={`Registo RNR: #${inmate.id}`}
      icon={<FileText className="h-5 w-5 text-amber-400" />}
      maxHeightClass="max-h-[88vh]"
    >
      <div className="flex flex-col gap-4 font-sans text-xs">
        {/* Header Card: Mugshot, Name, BI & Risk */}
        <div className="flex items-start gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <div className="w-16 h-20 bg-slate-950 rounded-xl overflow-hidden border border-slate-750 shrink-0 flex items-center justify-center shadow-inner">
            {inmate.photo ? (
              <img src={inmate.photo} alt="Mugshot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="text-slate-600 font-bold text-center text-[10px]">SEM FOTO</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                #{inmate.id}
              </span>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/30">
                Risco: {inmate.riskLevel}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-100 truncate mt-1">
              {inmate.firstName} {inmate.lastName}
            </h3>

            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Nº B.I.: <strong className="text-slate-200">{inmate.idCard}</strong>
            </p>
          </div>
        </div>

        {/* Custody Info Specs Grid */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 border border-slate-850 p-3 rounded-xl font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Unidade Alocada</span>
            <span className="text-sky-400 font-bold block mt-0.5 truncate">{prName}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Nº de Cela</span>
            <span className="text-slate-200 font-bold block mt-0.5">{inmate.assignedCellNumber || "A-01"}</span>
          </div>

          <div className="col-span-2 pt-2 border-t border-slate-850">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Selo Criptográfico Coded</span>
            <span className="text-amber-400 font-bold block mt-0.5 truncate">{inmate.documentCode}</span>
          </div>
        </div>

        {/* Crime / Custody Reason */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Motivo / Observações de Custódia</h4>
          <p className="text-slate-200 leading-relaxed text-xs">
            {inmate.crimeDescription || "Prisão Preventiva à ordem da Direção Nacional de Investigação Criminal (DNIC). Sem sanções disciplinares registadas nas últimas 72h."}
          </p>
        </div>

        {/* Touch Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={() => onEditAndSign(inmate)}
            className="min-h-[44px] flex items-center justify-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 font-bold rounded-xl text-xs cursor-pointer touch-manipulation"
          >
            <ShieldCheck className="h-4 w-4" /> Assinar
          </button>

          <button
            type="button"
            onClick={() => onExportPDF(inmate)}
            className="min-h-[44px] flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-emerald-400 font-bold rounded-xl text-xs cursor-pointer touch-manipulation"
          >
            <Printer className="h-4 w-4" /> PDF
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleHistory(inmate.id);
              onClose();
            }}
            className="min-h-[44px] flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 font-bold rounded-xl text-xs cursor-pointer touch-manipulation"
          >
            <History className="h-4 w-4" /> Audit Log
          </button>
        </div>
      </div>
    </MobileBottomDrawer>
  );
}
