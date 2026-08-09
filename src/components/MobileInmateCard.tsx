import React from "react";
import { 
  Camera, 
  ExternalLink, 
  Printer, 
  ShieldCheck, 
  History, 
  ArrowLeftRight, 
  User, 
  FileText,
  AlertTriangle,
  Building2
} from "lucide-react";

export interface Inmate {
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

export interface Prison {
  id: string;
  name: string;
}

interface MobileInmateCardProps {
  inmate: Inmate;
  index: number;
  prisons: Prison[];
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onTransfer: (id: string, prisonId: string) => void;
  onUploadPhoto: (id: string, photoDataUrl: string) => void;
  onExportPDF: (inm: Inmate) => void;
  onEditAndSign: (inm: Inmate) => void;
  onToggleHistory: (id: string) => void;
  onSelectDocumentCode: (code: string) => void;
  onOpenQuickDossier?: (inm: Inmate) => void;
}

export function MobileInmateCard({
  inmate,
  index,
  prisons,
  isSelected,
  onToggleSelect,
  onTransfer,
  onUploadPhoto,
  onExportPDF,
  onEditAndSign,
  onToggleHistory,
  onSelectDocumentCode,
  onOpenQuickDossier
}: MobileInmateCardProps) {
  const prName =
    prisons.find((p) => p.id === inmate.assignedPrisonId)?.name.replace("Estabelecimento Penitenciário de ", "EP ") ||
    "EP Viana";

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case "Máximo":
      case "Alto":
        return "bg-red-500/15 text-red-400 border-red-500/40";
      case "Médio":
        return "bg-amber-500/15 text-amber-400 border-amber-500/40";
      default:
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/40";
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all p-3.5 flex flex-col gap-3 font-sans relative overflow-hidden ${
        isSelected
          ? "bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-950/20"
          : index % 2 === 0
          ? "bg-slate-900/80 border-slate-800/80"
          : "bg-slate-950/90 border-slate-850"
      }`}
    >
      {/* Top Banner: Checkbox, Name, RNR & Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Touch-friendly Checkbox (minimum 44px hit area) */}
          <label className="flex items-center justify-center p-2.5 -m-2 cursor-pointer touch-manipulation">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(inmate.id)}
              className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-amber-500 cursor-pointer accent-amber-500"
            />
          </label>

          {/* Photo / Mugshot */}
          <div className="relative group">
            <label
              htmlFor={`mobile-photo-${inmate.id}`}
              className="w-12 h-14 border border-slate-750 rounded-lg overflow-hidden shrink-0 bg-slate-950 flex items-center justify-center cursor-pointer shadow-inner relative block"
            >
              {inmate.photo ? (
                <img
                  src={inmate.photo}
                  alt={`${inmate.firstName} ${inmate.lastName}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 p-1">
                  <User className="h-5 w-5" />
                  <span className="text-[7px] uppercase font-bold mt-0.5">Foto</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </label>
            <input
              id={`mobile-photo-${inmate.id}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => onUploadPhoto(inmate.id, reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>

          {/* Main Info */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                #{inmate.id}
              </span>
              <span
                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getRiskStyle(
                  inmate.riskLevel
                )}`}
              >
                Risco: {inmate.riskLevel}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 truncate mt-1">
              {inmate.firstName} {inmate.lastName}
            </h4>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
              <span>BI:</span>
              <strong className="text-slate-200">{inmate.idCard}</strong>
            </p>
          </div>
        </div>

        {/* Status Chip */}
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
            inmate.status === "PENDING_SYNC"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          }`}
        >
          {inmate.status === "PENDING_SYNC" ? "Offline" : "Ativo"}
        </span>
      </div>

      {/* Grid Specs: Location & Crypto Seal */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950/70 border border-slate-850 p-2.5 rounded-lg text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold flex items-center gap-1">
            <Building2 className="h-3 w-3 text-slate-400" /> Unidade & Cela
          </span>
          <span className="text-sky-400 font-bold truncate block mt-0.5">{prName}</span>
          <span className="text-slate-400 text-[11px]">Cela: {inmate.assignedCellNumber || "N/A"}</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Selo Criptográfico</span>
          <button
            type="button"
            onClick={() => onSelectDocumentCode(inmate.documentCode)}
            className="text-amber-400 hover:text-amber-300 font-mono text-xs font-bold flex items-center gap-1 mt-0.5 underline cursor-pointer truncate"
          >
            {inmate.documentCode} <ExternalLink className="h-3 w-3 shrink-0" />
          </button>
        </div>
      </div>

      {/* Quick Transfer Selector */}
      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-lg">
        <ArrowLeftRight className="h-4 w-4 text-amber-500 shrink-0" />
        <span className="text-xs text-slate-400 font-mono shrink-0">Transferir:</span>
        <select
          value={inmate.assignedPrisonId}
          onChange={(e) => onTransfer(inmate.id, e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 cursor-pointer flex-1 min-w-0"
        >
          {prisons.map((pr) => (
            <option key={pr.id} value={pr.id}>
              {pr.name.replace("Estabelecimento Penitenciário de ", "EP ")}
            </option>
          ))}
        </select>
      </div>

      {/* Touch Action Buttons Row (Min 44px hit area per touch guidelines) */}
      <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-850">
        {/* Ficha Rápida / Dossier */}
        {onOpenQuickDossier && (
          <button
            type="button"
            onClick={() => onOpenQuickDossier(inmate)}
            className="min-h-[44px] flex flex-col items-center justify-center bg-slate-900 hover:bg-slate-800 border border-slate-750 text-sky-400 rounded-lg text-[10px] font-bold gap-1 active:scale-95 transition cursor-pointer touch-manipulation"
          >
            <FileText className="h-4 w-4" />
            <span>Ficha</span>
          </button>
        )}

        {/* Edit & Sign */}
        <button
          type="button"
          onClick={() => onEditAndSign(inmate)}
          className="min-h-[44px] flex flex-col items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-[10px] font-bold gap-1 active:scale-95 transition cursor-pointer touch-manipulation"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Assinar</span>
        </button>

        {/* Export PDF */}
        <button
          type="button"
          onClick={() => onExportPDF(inmate)}
          className="min-h-[44px] flex flex-col items-center justify-center bg-slate-900 hover:bg-slate-850 border border-slate-750 text-slate-200 rounded-lg text-[10px] font-bold gap-1 active:scale-95 transition cursor-pointer touch-manipulation"
        >
          <Printer className="h-4 w-4 text-emerald-400" />
          <span>PDF</span>
        </button>

        {/* History */}
        <button
          type="button"
          onClick={() => onToggleHistory(inmate.id)}
          className="min-h-[44px] flex flex-col items-center justify-center bg-slate-900 hover:bg-slate-850 border border-slate-750 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-bold gap-1 active:scale-95 transition cursor-pointer touch-manipulation"
        >
          <History className="h-4 w-4" />
          <span>Histórico</span>
        </button>
      </div>
    </div>
  );
}
