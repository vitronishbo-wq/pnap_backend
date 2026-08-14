import React, { useState, useMemo } from "react";
import { List } from "react-window";
import { 
  Search, 
  Download, 
  FileSpreadsheet, 
  Maximize2, 
  Minimize2, 
  Printer, 
  ShieldCheck, 
  History, 
  Camera, 
  ExternalLink,
  ArrowUpDown,
  Sparkles,
  LayoutGrid,
  Rows3,
  Filter,
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ShieldAlert
} from "lucide-react";
import { MobileInmateCard, Inmate, Prison } from "./MobileInmateCard";

interface PrisonerExcelDataGridProps {
  inmates: Inmate[];
  prisons: Prison[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedInmateIds: string[];
  onToggleSelectInmate: (id: string) => void;
  onSelectAllInmates: (inmates: Inmate[]) => void;
  onTransferInmate: (id: string, prisonId: string) => void;
  onEditRiskInmate: (id: string, risk: string) => void;
  onUploadPhoto: (id: string, photoDataUrl: string) => void;
  onExportPDF: (inm: Inmate) => void;
  onEditAndSign: (inm: Inmate) => void;
  onToggleHistory: (id: string) => void;
  selectedHistoryId: string | null;
  historyLogs: any[];
  onSelectDocumentCode: (code: string) => void;
  bulkActionsNode?: React.ReactNode;
  onOpenQuickDossier?: (inm: Inmate) => void;
  onOpenFilterDrawer?: () => void;
}

// Helper to determine province of a prison reliably
const getPrisonProvince = (prison: Prison | any): string => {
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
  if (name.includes("Cunene") || name.includes("Ondjiva") || name.includes("Pequenos")) return "Cunene";
  if (name.includes("Moxico") || name.includes("Luena")) return "Moxico";
  if (name.includes("Zaire") || name.includes("Mbanza")) return "Zaire";
  if (name.includes("Lunda-Norte") || name.includes("Dundo")) return "Lunda-Norte";
  if (name.includes("Lunda-Sul") || name.includes("Saurimo")) return "Lunda-Sul";
  if (name.includes("Cuanza-Norte") || name.includes("Ndalatando")) return "Cuanza-Norte";
  if (name.includes("Cuanza-Sul") || name.includes("Sumbe")) return "Cuanza-Sul";
  if (name.includes("Cuando") || name.includes("Cubango") || name.includes("Menongue")) return "Cuando Cubango";
  return "Luanda";
};

interface PrisonerRowProps {
  sortedInmates: Inmate[];
  prisons: Prison[];
  selectedInmateIds: string[];
  onToggleSelectInmate: (id: string) => void;
  onUploadPhoto: (id: string, photoDataUrl: string) => void;
  onSelectDocumentCode: (code: string) => void;
  onTransferInmate: (id: string, prisonId: string) => void;
  onExportPDF: (inm: Inmate) => void;
  onEditAndSign: (inm: Inmate) => void;
  onToggleHistory: (id: string) => void;
  setSelectedCell: (cell: { rowIdx: number; colIdx: number }) => void;
}

function PrisonerRow({
  index,
  style,
  sortedInmates,
  prisons,
  selectedInmateIds,
  onToggleSelectInmate,
  onUploadPhoto,
  onSelectDocumentCode,
  onTransferInmate,
  onExportPDF,
  onEditAndSign,
  onToggleHistory,
  setSelectedCell
}: { index: number; style: React.CSSProperties } & PrisonerRowProps) {
  const inm = sortedInmates[index];
  if (!inm) return null;
  const isSelected = selectedInmateIds.includes(inm.id);
  const prName =
    prisons.find((p) => p.id === inm.assignedPrisonId)?.name.replace("Estabelecimento Penitenciário de ", "EP ") ||
    "EP Viana";

  return (
    <div
      style={style}
      className={`flex items-center border-b border-slate-850/60 font-mono text-[9.5px] transition-colors ${
        isSelected
          ? "bg-amber-500/15 border-l-2 border-l-amber-500"
          : index % 2 === 0
          ? "bg-slate-950/40"
          : "bg-slate-900/20"
      } hover:bg-amber-500/10 cursor-pointer`}
    >
      {/* Row Index */}
      <div className="w-8 shrink-0 text-center border-r border-slate-800 font-mono text-[8px] text-slate-500 bg-slate-900/40 select-none flex items-center justify-center h-full">
        {index + 1}
      </div>

      {/* Checkbox */}
      <div
        className="w-8 shrink-0 text-center border-r border-slate-800 px-1 flex items-center justify-center h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelectInmate(inm.id)}
          className="h-3.5 w-3.5 rounded border-slate-800 bg-slate-900 text-amber-500 cursor-pointer accent-amber-500"
        />
      </div>

      {/* Mugshot & RNR */}
      <div
        onClick={() => setSelectedCell({ rowIdx: index, colIdx: 0 })}
        className="w-28 shrink-0 px-2 py-1 border-r border-slate-800/80 flex items-center gap-2 overflow-hidden h-full"
      >
        <label
          htmlFor={`grid-photo-${inm.id}`}
          className="w-6 h-7 border border-slate-800 rounded overflow-hidden shrink-0 bg-slate-900 relative group cursor-pointer"
          title="Substituir foto"
          onClick={(e) => e.stopPropagation()}
        >
          {inm.photo ? (
            <img src={inm.photo} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-600">
              <Camera className="h-3 w-3" />
            </div>
          )}
        </label>
        <input
          id={`grid-photo-${inm.id}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => onUploadPhoto(inm.id, reader.result as string);
              reader.readAsDataURL(file);
            }
          }}
        />
        <span className="font-bold text-slate-300 font-mono text-[9px] truncate">{inm.id}</span>
      </div>

      {/* Full Name */}
      <div
        onClick={() => setSelectedCell({ rowIdx: index, colIdx: 1 })}
        className="min-w-[160px] flex-1 px-2.5 py-1 border-r border-slate-800/80 font-bold text-slate-100 truncate flex items-center h-full"
      >
        {inm.firstName} {inm.lastName}
      </div>

      {/* BI */}
      <div
        onClick={() => setSelectedCell({ rowIdx: index, colIdx: 2 })}
        className="w-28 shrink-0 px-2.5 py-1 border-r border-slate-800/80 text-slate-350 truncate flex items-center h-full"
      >
        {inm.idCard}
      </div>

      {/* Risk Level */}
      <div
        onClick={() => setSelectedCell({ rowIdx: index, colIdx: 3 })}
        className="w-20 shrink-0 px-2 py-1 border-r border-slate-800/80 text-center flex items-center justify-center h-full"
      >
        <span
          className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase border ${
            inm.riskLevel === "Máximo" || inm.riskLevel === "Alto"
              ? "bg-red-500/10 text-red-400 border-red-500/30"
              : inm.riskLevel === "Médio"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          }`}
        >
          {inm.riskLevel}
        </span>
      </div>

      {/* Prison Unit & Cell */}
      <div
        onClick={() => setSelectedCell({ rowIdx: index, colIdx: 4 })}
        className="w-36 shrink-0 px-2.5 py-1 border-r border-slate-800/80 truncate text-slate-300 flex items-center h-full"
      >
        <span className="font-medium text-sky-400 truncate">{prName}</span>
        <span className="text-slate-500 text-[8px] ml-1 shrink-0">({inm.assignedCellNumber || "N/A"})</span>
      </div>

      {/* Crypto Seal */}
      <div
        onClick={() => setSelectedCell({ rowIdx: index, colIdx: 5 })}
        className="w-28 shrink-0 px-2 py-1 border-r border-slate-800/80 text-center flex items-center justify-center h-full"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectDocumentCode(inm.documentCode);
          }}
          className="text-amber-500 hover:underline text-[8.5px] font-mono flex items-center justify-center gap-1 mx-auto cursor-pointer truncate"
        >
          {inm.documentCode} <ExternalLink className="h-2.5 w-2.5 shrink-0" />
        </button>
      </div>

      {/* Status */}
      <div
        onClick={() => setSelectedCell({ rowIdx: index, colIdx: 6 })}
        className="w-20 shrink-0 px-2 py-1 border-r border-slate-800/80 text-center flex items-center justify-center h-full"
      >
        <span
          className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
            inm.status === "PENDING_SYNC"
              ? "bg-amber-500/10 text-amber-400 animate-pulse"
              : "bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {inm.status === "PENDING_SYNC" ? "Offline" : "Ativo"}
        </span>
      </div>

      {/* Quick Custody Actions */}
      <div
        className="min-w-[210px] shrink-0 px-2 py-1 border-r border-slate-800/80 flex items-center gap-1.5 h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <select
          value={inm.assignedPrisonId}
          onChange={(e) => onTransferInmate(inm.id, e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-[8.5px] text-slate-300 font-mono focus:outline-none focus:border-amber-500 cursor-pointer w-24"
          title="Transferir unidade"
        >
          {prisons.map((pr) => (
            <option key={pr.id} value={pr.id}>
              {pr.name.replace("Estabelecimento Penitenciário de ", "EP ")}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onExportPDF(inm)}
          className="p-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-500 rounded cursor-pointer"
          title="Descarregar Ficha PDF"
        >
          <Printer className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={() => onEditAndSign(inm)}
          className="px-1.5 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded text-[8px] font-bold flex items-center gap-1 cursor-pointer"
          title="Editar e Assinar"
        >
          <ShieldCheck className="h-3 w-3" /> Editar
        </button>

        <button
          type="button"
          onClick={() => onToggleHistory(inm.id)}
          className="p-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
          title="Histórico de Alterações"
        >
          <History className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export function PrisonerExcelDataGrid({
  inmates,
  prisons,
  searchQuery,
  onSearchChange,
  selectedInmateIds,
  onToggleSelectInmate,
  onSelectAllInmates,
  onTransferInmate,
  onUploadPhoto,
  onExportPDF,
  onEditAndSign,
  onToggleHistory,
  onSelectDocumentCode,
  bulkActionsNode,
  onOpenQuickDossier,
  onOpenFilterDrawer
}: PrisonerExcelDataGridProps) {
  const [sortField, setSortField] = useState<keyof Inmate | "fullName">("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedCell, setSelectedCell] = useState<{ rowIdx: number; colIdx: number } | null>({ rowIdx: 0, colIdx: 0 });
  const [density, setDensity] = useState<"compact" | "micro">("compact");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"auto" | "cards" | "grid">("auto");

  // --- AUTOMATED PROVINCIAL & EP SELECT DRILL-DOWN STATES ---
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>("ALL");
  const [selectedEpFilter, setSelectedEpFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [isSmartFilterExpanded, setIsSmartFilterExpanded] = useState(true);

  const rowHeight = density === "micro" ? 38 : 46;
  const listHeight = isFullScreen ? 600 : 440;

  // 1. Dynamic Province Breakdown List
  const provinceList = useMemo(() => {
    const map = new Map<string, { epCount: number; inmateCount: number; capacity: number }>();
    prisons.forEach((pr) => {
      const prov = getPrisonProvince(pr);
      const prInmates = inmates.filter((i) => i.assignedPrisonId === pr.id).length;
      const cap = (pr as any).officialCapacity || (pr as any).operationalCapacity || (pr as any).capacity || 500;
      
      const current = map.get(prov) || { epCount: 0, inmateCount: 0, capacity: 0 };
      map.set(prov, {
        epCount: current.epCount + 1,
        inmateCount: current.inmateCount + prInmates,
        capacity: current.capacity + cap
      });
    });

    return Array.from(map.entries()).map(([province, stats]) => ({
      province,
      ...stats
    })).sort((a, b) => a.province.localeCompare(b.province));
  }, [prisons, inmates]);

  // 2. Dynamic EPs List for the selected Province (or all if ALL selected)
  const availablePrisonsForProvince = useMemo(() => {
    return prisons.filter((pr) => {
      if (selectedProvinceFilter === "ALL") return true;
      return getPrisonProvince(pr) === selectedProvinceFilter;
    }).map((pr) => {
      const currentCount = inmates.filter((i) => i.assignedPrisonId === pr.id).length;
      const capacity = (pr as any).officialCapacity || (pr as any).operationalCapacity || (pr as any).capacity || 500;
      const saturation = capacity > 0 ? Math.round((currentCount / capacity) * 100) : 0;
      const statusLabel = saturation > 100 ? "Crítico (Sobrelotação)" : saturation >= 85 ? "Alerta" : "Normal";
      return {
        ...pr,
        currentCount,
        capacity,
        saturation,
        statusLabel
      };
    }).sort((a, b) => b.saturation - a.saturation);
  }, [prisons, inmates, selectedProvinceFilter]);

  // 3. Filtered Inmates using Province + EP + Status + Search Query
  const filteredInmates = useMemo(() => {
    let result = inmates;

    // Filter by Province
    if (selectedProvinceFilter !== "ALL") {
      const allowedPrisonIds = new Set(
        prisons.filter((p) => getPrisonProvince(p) === selectedProvinceFilter).map((p) => p.id)
      );
      result = result.filter((inm) => allowedPrisonIds.has(inm.assignedPrisonId));
    }

    // Filter by Specific EP
    if (selectedEpFilter !== "ALL") {
      result = result.filter((inm) => inm.assignedPrisonId === selectedEpFilter);
    }

    // Filter by Legal/Operational Status
    if (selectedStatusFilter !== "ALL") {
      if (selectedStatusFilter === "PREVENTIVO") {
        result = result.filter((inm) => 
          (inm.legalStatus === "Preventivo" || inm.status === "Preventivo" || (inm as any).judicialSituation?.toLowerCase().includes("preventiv") || !(inm as any).condenacaoDefinitiva)
        );
      } else if (selectedStatusFilter === "CONDENADO") {
        result = result.filter((inm) => 
          (inm.legalStatus === "Condenado" || inm.status === "Condenado" || (inm as any).judicialSituation?.toLowerCase().includes("condenad") || (inm as any).condenacaoDefinitiva)
        );
      } else if (selectedStatusFilter === "HIGH_RISK") {
        result = result.filter((inm) => inm.riskLevel === "Alto" || inm.riskLevel === "Máximo");
      } else if (selectedStatusFilter === "OFFLINE") {
        result = result.filter((inm) => inm.status === "PENDING_SYNC");
      }
    }

    // Filter by Text Search (Instant multi-field)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((inm) => {
        const fullName = `${inm.firstName} ${inm.lastName}`.toLowerCase();
        const bi = (inm.idCard || "").toLowerCase();
        const id = (inm.id || "").toLowerCase();
        const prName = (prisons.find((p) => p.id === inm.assignedPrisonId)?.name || "").toLowerCase();
        const crime = (inm.crimeDescription || (inm as any).crime || "").toLowerCase();
        const cell = (inm.assignedCellNumber || "").toLowerCase();
        return fullName.includes(q) || bi.includes(q) || id.includes(q) || prName.includes(q) || crime.includes(q) || cell.includes(q);
      });
    }

    return result;
  }, [inmates, prisons, selectedProvinceFilter, selectedEpFilter, selectedStatusFilter, searchQuery]);

  // Active EP Info calculation for summary bar
  const activeSelectedEp = useMemo(() => {
    if (selectedEpFilter === "ALL") return null;
    return availablePrisonsForProvince.find((p) => p.id === selectedEpFilter) || null;
  }, [availablePrisonsForProvince, selectedEpFilter]);

  // Aggregate stats for current scope
  const activeScopeStats = useMemo(() => {
    let totalCap = 0;
    let totalInm = 0;
    if (selectedEpFilter !== "ALL") {
      const p = prisons.find((pr) => pr.id === selectedEpFilter);
      totalCap = (p as any)?.officialCapacity || (p as any)?.capacity || 500;
      totalInm = inmates.filter((i) => i.assignedPrisonId === selectedEpFilter).length;
    } else if (selectedProvinceFilter !== "ALL") {
      const provPrisons = prisons.filter((p) => getPrisonProvince(p) === selectedProvinceFilter);
      totalCap = provPrisons.reduce((acc, p) => acc + ((p as any).officialCapacity || (p as any).capacity || 500), 0);
      totalInm = inmates.filter((i) => provPrisons.some((p) => p.id === i.assignedPrisonId)).length;
    } else {
      totalCap = prisons.reduce((acc, p) => acc + ((p as any).officialCapacity || (p as any).capacity || 500), 0);
      totalInm = inmates.length;
    }
    const saturation = totalCap > 0 ? Math.round((totalInm / totalCap) * 100) : 0;
    return { totalCap, totalInm, saturation };
  }, [prisons, inmates, selectedProvinceFilter, selectedEpFilter]);

  // Sorted inmates
  const sortedInmates = useMemo(() => {
    return [...filteredInmates].sort((a, b) => {
      let valA: string = "";
      let valB: string = "";

      if (sortField === "fullName") {
        valA = `${a.firstName} ${a.lastName}`.toLowerCase();
        valB = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else {
        valA = String(a[sortField] || "").toLowerCase();
        valB = String(b[sortField] || "").toLowerCase();
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredInmates, sortField, sortDir]);

  const handleSort = (field: keyof Inmate | "fullName") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const isAllSelected = sortedInmates.length > 0 && sortedInmates.every((i) => selectedInmateIds.includes(i.id));

  const getColLetter = (idx: number) => String.fromCharCode(65 + (idx % 26));

  const activeCellValue = useMemo(() => {
    if (!selectedCell || !sortedInmates[selectedCell.rowIdx]) return "Nenhum";
    const inm = sortedInmates[selectedCell.rowIdx];
    const fields = [
      `RNR: ${inm.id}`,
      `RECLUSO: ${inm.firstName} ${inm.lastName}`,
      `BI: ${inm.idCard}`,
      `RISCO: ${inm.riskLevel}`,
      `UNIDADE: ${prisons.find((p) => p.id === inm.assignedPrisonId)?.name.replace("Estabelecimento Penitenciário de ", "EP ") || "EP"}`,
      `CELA: ${inm.assignedCellNumber || "N/A"}`,
      `ESTADO: ${inm.status === "PENDING_SYNC" ? "Offline" : "Ativo"}`
    ];
    return fields[selectedCell.colIdx] || `${inm.firstName} ${inm.lastName}`;
  }, [selectedCell, sortedInmates, prisons]);

  const handleResetFilters = () => {
    setSelectedProvinceFilter("ALL");
    setSelectedEpFilter("ALL");
    setSelectedStatusFilter("ALL");
    onSearchChange("");
  };

  const hasActiveFilters = selectedProvinceFilter !== "ALL" || selectedEpFilter !== "ALL" || selectedStatusFilter !== "ALL" || Boolean(searchQuery);

  const handleExportCSV = () => {
    if (sortedInmates.length === 0) return;
    const headers = ["RNR", "Nome Completo", "BI", "Grau de Risco", "Unidade Prisional", "Província", "Cela", "Selo Digital", "Estado"];
    const rows = sortedInmates.map((i) => {
      const pr = prisons.find((p) => p.id === i.assignedPrisonId);
      const prName = pr?.name.replace("Estabelecimento Penitenciário de ", "EP ") || "EP";
      const prov = pr ? getPrisonProvince(pr) : "N/A";
      return [
        `"${i.id}"`,
        `"${i.firstName} ${i.lastName}"`,
        `"${i.idCard}"`,
        `"${i.riskLevel}"`,
        `"${prName}"`,
        `"${prov}"`,
        `"${i.assignedCellNumber || "N/A"}"`,
        `"${i.documentCode}"`,
        `"${i.status === "PENDING_SYNC" ? "Offline" : "Ativo"}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `consulta_reclusos_minint_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-850 bg-slate-950/60 text-left font-sans text-slate-300 transition-all overflow-hidden shadow-2xl ${
        isFullScreen ? "fixed inset-2 z-50 bg-slate-950 shadow-2xl overflow-y-auto" : ""
      }`}
    >
      {/* Excel & Smartphone Navigation Bar */}
      <div className="bg-slate-900/95 border-b border-slate-850 p-3 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-xs sm:text-sm tracking-tight font-mono">
                Censo & Consulta Tática de Reclusos
              </span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 font-mono">
                <Wifi className="h-3 w-3" /> Memória Local (Offline)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
              Filtro escalonado por Província, Unidade Prisional (EP) com detalhes de lotação e pesquisa global.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Quick Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSmartFilterExpanded(!isSmartFilterExpanded)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer touch-manipulation min-h-[38px] ${
              isSmartFilterExpanded
                ? "bg-amber-500/20 border-amber-500 text-amber-300"
                : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
            title="Mostrar/Ocultar Seletores de Província e EP"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px]">Filtros ({selectedProvinceFilter !== "ALL" ? selectedProvinceFilter : "Nacional"})</span>
            {isSmartFilterExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {/* Filter Drawer Trigger for Mobile */}
          {onOpenFilterDrawer && (
            <button
              type="button"
              onClick={onOpenFilterDrawer}
              className="p-2 bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-amber-400 rounded-xl min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer touch-manipulation sm:hidden"
              title="Filtros em Bottom Sheet"
            >
              <Filter className="h-4 w-4" />
            </button>
          )}

          {/* Layout Mode Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setLayoutMode("auto")}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                layoutMode === "auto" ? "bg-amber-500 text-slate-950" : "text-slate-400"
              }`}
              title="Ajuste automático para ecrã"
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("cards")}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                layoutMode === "cards" ? "bg-amber-500 text-slate-950" : "text-slate-400"
              }`}
              title="Cartões Empilhados (Smartphone)"
            >
              <Rows3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                layoutMode === "grid" ? "bg-amber-500 text-slate-950" : "text-slate-400"
              }`}
              title="Grelha Excel Virtualizada"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer touch-manipulation min-h-[38px]"
            title="Exportar dados filtrados para CSV"
          >
            <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">CSV</span>
          </button>

          {/* FullScreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition cursor-pointer touch-manipulation min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SMART CASCADING SELECTS & INSTANT SEARCH PANEL (MOBILE & DESKTOP) */}
      {/* ======================================================== */}
      {isSmartFilterExpanded && (
        <div className="bg-[#060a12] border-b border-slate-800/90 p-3 sm:p-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 1. SELECT PROVÍNCIA */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-amber-400" /> Província
                </span>
                <span className="text-[9px] text-amber-400/80 font-mono">
                  {selectedProvinceFilter === "ALL" ? "Todas (Nacional)" : selectedProvinceFilter}
                </span>
              </label>
              <select
                id="select-province-filter"
                value={selectedProvinceFilter}
                onChange={(e) => {
                  setSelectedProvinceFilter(e.target.value);
                  setSelectedEpFilter("ALL"); // Reset EP when province changes
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded-xl px-2.5 py-2 text-xs font-mono font-medium text-slate-200 cursor-pointer min-h-[40px]"
              >
                <option value="ALL">🌐 Todas as Províncias de Angola ({inmates.length} Reclusos)</option>
                {provinceList.map((p) => (
                  <option key={p.province} value={p.province}>
                    📍 {p.province} • {p.epCount} {p.epCount === 1 ? "EP" : "EPs"} ({p.inmateCount} reclusos)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. SELECT ESTABELECIMENTO PENITENCIÁRIO (EP) COM LOTAÇÃO */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-sky-400" /> Estabelecimento (EP)
                </span>
                <span className="text-[9px] text-sky-400/80 font-mono">
                  {availablePrisonsForProvince.length} {availablePrisonsForProvince.length === 1 ? "Unidade" : "Unidades"}
                </span>
              </label>
              <select
                id="select-ep-filter"
                value={selectedEpFilter}
                onChange={(e) => setSelectedEpFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 rounded-xl px-2.5 py-2 text-xs font-mono font-medium text-slate-200 cursor-pointer min-h-[40px]"
              >
                <option value="ALL">
                  🏢 {selectedProvinceFilter === "ALL" ? "Todos os Estabelecimentos (Global)" : `Todos os EPs de ${selectedProvinceFilter}`}
                </option>
                {availablePrisonsForProvince.map((pr) => {
                  const label = `${pr.name.replace("Estabelecimento Penitenciário de ", "EP ")} [${pr.currentCount}/${pr.capacity} (${pr.saturation}%) • ${pr.statusLabel}]`;
                  return (
                    <option key={pr.id} value={pr.id}>
                      {pr.saturation > 100 ? "🔴" : pr.saturation >= 85 ? "🟡" : "🟢"} {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 3. SELECT REGIME / SITUAÇÃO PROCESSUAL / RISCO */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-emerald-400" /> Situação & Risco
                </span>
                <span className="text-[9px] text-emerald-400/80 font-mono">Filtro Rápido</span>
              </label>
              <select
                id="select-status-filter"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-2.5 py-2 text-xs font-mono font-medium text-slate-200 cursor-pointer min-h-[40px]"
              >
                <option value="ALL">⚖️ Toda População (Preventivos + Condenados)</option>
                <option value="PREVENTIVO">⏳ Preventivos / Em Instrução</option>
                <option value="CONDENADO">🔒 Condenados com Sentença Firme</option>
                <option value="HIGH_RISK">⚠️ Grau de Risco Alto & Máximo</option>
                <option value="OFFLINE">⚡ Registados Offline (Pendente Sinc.)</option>
              </select>
            </div>

            {/* 4. BARRA DE PROCURA INTELIGENTE E RÁPIDA */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Search className="h-3 w-3 text-amber-400" /> Pesquisa Instantânea
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Nome, BI, RNR, Delito</span>
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                <input
                  id="inmate-smart-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Nome, BI, RNR, Artigo, Cela..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-xs text-slate-200 pl-9 pr-8 py-2 rounded-xl font-mono min-h-[40px] placeholder-slate-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="absolute right-2.5 text-slate-500 hover:text-slate-200 text-xs font-bold p-1 cursor-pointer"
                    title="Limpar pesquisa"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* DYNAMIC OCCUPANCY GAUGE & RESULT BANNER */}
          <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Scope pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">
                <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                <span className="font-bold text-slate-200">
                  {selectedProvinceFilter === "ALL" ? "Âmbito Nacional" : selectedProvinceFilter}
                </span>
                {selectedEpFilter !== "ALL" && (
                  <>
                    <span className="text-slate-600">/</span>
                    <span className="text-sky-300 font-bold">
                      {prisons.find((p) => p.id === selectedEpFilter)?.name.replace("Estabelecimento Penitenciário de ", "EP ") || "EP"}
                    </span>
                  </>
                )}
              </div>

              {/* Lotação Bar & Saturation indicator */}
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-slate-400">Lotação:</span>
                <span className="font-bold text-slate-100">
                  {activeScopeStats.totalInm} / {activeScopeStats.totalCap}
                </span>
                <div className="w-24 sm:w-32 bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 shrink-0">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      activeScopeStats.saturation > 100
                        ? "bg-red-500"
                        : activeScopeStats.saturation >= 85
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, activeScopeStats.saturation)}%` }}
                  />
                </div>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono border ${
                    activeScopeStats.saturation > 100
                      ? "bg-red-500/15 border-red-500/40 text-red-400"
                      : activeScopeStats.saturation >= 85
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                      : "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  }`}
                >
                  {activeScopeStats.saturation}% {activeScopeStats.saturation > 100 ? "Sobrelotado" : "Normal"}
                </span>
              </div>
            </div>

            {/* Results count & Clear filters button */}
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                <span className="text-slate-400">Resultados:</span>
                <strong className="text-amber-400 text-xs px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {sortedInmates.length}
                </strong>
                <span className="text-slate-500 text-[10px]">({inmates.length} total)</span>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 rounded-lg flex items-center gap-1 transition cursor-pointer active:scale-95"
                  title="Restabelecer consulta para todos os estabelecimentos"
                >
                  <RefreshCw className="h-3 w-3" /> Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Formula Bar - Visible on desktop / grid mode */}
      <div className="bg-slate-950 border-b border-slate-850 px-3 py-1.5 hidden md:flex items-center gap-2 select-none text-xs">
        <div className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg text-amber-400 font-mono font-bold w-16 text-center">
          {selectedCell ? `${getColLetter(selectedCell.colIdx)}${selectedCell.rowIdx + 1}` : "A1"}
        </div>
        <div className="text-slate-600 font-serif italic text-xs font-bold">fx</div>
        <div className="flex-1 bg-slate-900/80 border border-slate-850 px-2.5 py-1 rounded-lg text-slate-300 font-mono truncate">
          {activeCellValue}
        </div>
        <div className="text-[11px] text-slate-400 font-mono shrink-0">
          <strong className="text-slate-200">{sortedInmates.length}</strong> registos filtrados
        </div>
      </div>

      {/* Optional Bulk Actions Node */}
      {bulkActionsNode && <div className="bg-slate-900/80 border-b border-slate-850 p-2.5">{bulkActionsNode}</div>}

      {/* MOBILE STACKED CARDS VIEW (renders when layoutMode === 'cards' OR on small screen widths when 'auto') */}
      <div className={`${layoutMode === "cards" ? "block" : layoutMode === "grid" ? "hidden" : "block md:hidden"} p-3 space-y-3`}>
        {sortedInmates.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-sans italic">
            Nenhum recluso corresponde à pesquisa ativa.
          </div>
        ) : (
          sortedInmates.map((inm, idx) => (
            <MobileInmateCard
              key={inm.id}
              inmate={inm}
              index={idx}
              prisons={prisons}
              isSelected={selectedInmateIds.includes(inm.id)}
              onToggleSelect={onToggleSelectInmate}
              onTransfer={onTransferInmate}
              onUploadPhoto={onUploadPhoto}
              onExportPDF={onExportPDF}
              onEditAndSign={onEditAndSign}
              onToggleHistory={onToggleHistory}
              onSelectDocumentCode={onSelectDocumentCode}
              onOpenQuickDossier={onOpenQuickDossier}
            />
          ))
        )}
      </div>

      {/* DESKTOP VIRTUALIZED GRID VIEW (renders when layoutMode === 'grid' OR on medium+ screens when 'auto') */}
      <div className={`${layoutMode === "grid" ? "block" : layoutMode === "cards" ? "hidden" : "hidden md:block"} overflow-x-auto w-full`}>
        {/* Sticky Header Row */}
        <div className="sticky top-0 z-20 bg-slate-950 border-b border-slate-800 shadow-md min-w-max">
          {/* Excel Letters Header */}
          <div className="flex items-center bg-slate-900/90 text-slate-500 border-b border-slate-800 text-[8px] font-bold select-none">
            <div className="w-8 shrink-0 text-center border-r border-slate-800 py-0.5 bg-slate-950 text-slate-600">
              #
            </div>
            <div className="w-8 shrink-0 text-center border-r border-slate-800 py-0.5 bg-slate-950">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={() => onSelectAllInmates(sortedInmates)}
                className="h-3.5 w-3.5 rounded border-slate-800 bg-slate-900 text-amber-500 cursor-pointer accent-amber-500"
              />
            </div>
            {["A", "B", "C", "D", "E", "F", "G", "H"].map((lettr) => (
              <div
                key={lettr}
                className={`border-r border-slate-800 py-0.5 text-center text-slate-500 ${
                  lettr === "A" ? "w-28 shrink-0" :
                  lettr === "B" ? "min-w-[160px] flex-1" :
                  lettr === "C" ? "w-28 shrink-0" :
                  lettr === "D" ? "w-20 shrink-0" :
                  lettr === "E" ? "w-36 shrink-0" :
                  lettr === "F" ? "w-28 shrink-0" :
                  lettr === "G" ? "w-20 shrink-0" :
                  "min-w-[210px] shrink-0"
                }`}
              >
                {lettr}
              </div>
            ))}
          </div>

          {/* Column Names Header */}
          <div className="flex items-center bg-slate-950 text-slate-400 uppercase tracking-wider text-[8px] font-bold">
            <div className="w-8 shrink-0 text-center border-r border-slate-800 py-2 bg-slate-900/90 text-slate-500">
              Linha
            </div>
            <div className="w-8 shrink-0 text-center border-r border-slate-800 py-2 bg-slate-900/90">
              SEL
            </div>

            <div
              onClick={() => handleSort("id")}
              className="w-28 shrink-0 px-2 py-2 border-r border-slate-800 hover:bg-slate-900 cursor-pointer flex items-center justify-between"
            >
              <span>Mugshot / RNR</span>
              <ArrowUpDown className="h-2.5 w-2.5 text-slate-600" />
            </div>

            <div
              onClick={() => handleSort("fullName")}
              className="min-w-[160px] flex-1 px-2.5 py-2 border-r border-slate-800 hover:bg-slate-900 cursor-pointer flex items-center justify-between"
            >
              <span>Nome do Recluso</span>
              <ArrowUpDown className="h-2.5 w-2.5 text-slate-600" />
            </div>

            <div
              onClick={() => handleSort("idCard")}
              className="w-28 shrink-0 px-2.5 py-2 border-r border-slate-800 hover:bg-slate-900 cursor-pointer flex items-center justify-between"
            >
              <span>Nº B.I.</span>
              <ArrowUpDown className="h-2.5 w-2.5 text-slate-600" />
            </div>

            <div
              onClick={() => handleSort("riskLevel")}
              className="w-20 shrink-0 px-2 py-2 border-r border-slate-800 hover:bg-slate-900 cursor-pointer flex items-center justify-between justify-center"
            >
              <span>Risco</span>
              <ArrowUpDown className="h-2.5 w-2.5 text-slate-600" />
            </div>

            <div
              onClick={() => handleSort("assignedPrisonId")}
              className="w-36 shrink-0 px-2.5 py-2 border-r border-slate-800 hover:bg-slate-900 cursor-pointer flex items-center justify-between"
            >
              <span>Unidade & Cela</span>
              <ArrowUpDown className="h-2.5 w-2.5 text-slate-600" />
            </div>

            <div className="w-28 shrink-0 px-2 py-2 border-r border-slate-800 text-center">
              Selo Cripto
            </div>

            <div className="w-20 shrink-0 px-2 py-2 border-r border-slate-800 text-center">
              Estado
            </div>

            <div className="min-w-[210px] shrink-0 px-2.5 py-2 border-r border-slate-800 text-center">
              Ações Rápidas de Custódia
            </div>
          </div>
        </div>

        {/* Virtualized Body using react-window List */}
        {sortedInmates.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-sans italic min-w-max">
            Nenhum recluso corresponde à pesquisa ativa.
          </div>
        ) : (
          <div className="min-w-max">
            <List
              rowCount={sortedInmates.length}
              rowHeight={rowHeight}
              rowComponent={PrisonerRow as any}
              rowProps={{
                sortedInmates,
                prisons,
                selectedInmateIds,
                onToggleSelectInmate,
                onUploadPhoto,
                onSelectDocumentCode,
                onTransferInmate,
                onExportPDF,
                onEditAndSign,
                onToggleHistory,
                setSelectedCell
              }}
              style={{ height: listHeight, width: "100%" }}
              className="scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950"
            />
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="bg-slate-950 border-t border-slate-850 px-3 py-2 flex items-center justify-between text-xs font-mono text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> MININT SMARTHPHONE READY
          </span>
          <span className="hidden sm:inline">• Selecionados: {selectedInmateIds.length} reclusos</span>
        </div>
        <div className="text-slate-500 text-[10px]">Total: {sortedInmates.length} registos ativos</div>
      </div>
    </div>
  );
}
