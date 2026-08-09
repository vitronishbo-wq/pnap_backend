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
  Sparkles
} from "lucide-react";

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
  [key: string]: any;
}

interface Prison {
  id: string;
  name: string;
}

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
}

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
          className="h-3 w-3 rounded border-slate-800 bg-slate-900 text-amber-500 cursor-pointer accent-amber-500"
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
        {/* Quick Transfer Select */}
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

        {/* PDF Download */}
        <button
          type="button"
          onClick={() => onExportPDF(inm)}
          className="p-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-500 rounded cursor-pointer"
          title="Descarregar Ficha PDF"
        >
          <Printer className="h-3 w-3" />
        </button>

        {/* Edit & Sign */}
        <button
          type="button"
          onClick={() => onEditAndSign(inm)}
          className="px-1.5 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded text-[8px] font-bold flex items-center gap-1 cursor-pointer"
          title="Editar e Assinar"
        >
          <ShieldCheck className="h-3 w-3" /> Editar
        </button>

        {/* History Log Toggle */}
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
  bulkActionsNode
}: PrisonerExcelDataGridProps) {
  const [sortField, setSortField] = useState<keyof Inmate | "fullName">("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedCell, setSelectedCell] = useState<{ rowIdx: number; colIdx: number } | null>({ rowIdx: 0, colIdx: 0 });
  const [density, setDensity] = useState<"compact" | "micro">("compact");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const rowHeight = density === "micro" ? 38 : 46;
  const maxContainerHeight = 440;
  const listHeight = isFullScreen ? 600 : maxContainerHeight;

  // Filtered inmates
  const filteredInmates = useMemo(() => {
    if (!searchQuery.trim()) return inmates;
    const q = searchQuery.toLowerCase().trim();
    return inmates.filter((inm) => {
      const fullName = `${inm.firstName} ${inm.lastName}`.toLowerCase();
      const bi = (inm.idCard || "").toLowerCase();
      const id = (inm.id || "").toLowerCase();
      const prName = (prisons.find((p) => p.id === inm.assignedPrisonId)?.name || "").toLowerCase();
      return fullName.includes(q) || bi.includes(q) || id.includes(q) || prName.includes(q);
    });
  }, [inmates, searchQuery, prisons]);

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

  const handleExportCSV = () => {
    if (sortedInmates.length === 0) return;
    const headers = ["RNR", "Nome Completo", "BI", "Grau de Risco", "Unidade Prisional", "Cela", "Selo Digital", "Estado"];
    const rows = sortedInmates.map((i) => {
      const prName = prisons.find((p) => p.id === i.assignedPrisonId)?.name.replace("Estabelecimento Penitenciário de ", "EP ") || "EP";
      return [
        `"${i.id}"`,
        `"${i.firstName} ${i.lastName}"`,
        `"${i.idCard}"`,
        `"${i.riskLevel}"`,
        `"${prName}"`,
        `"${i.assignedCellNumber || "N/A"}"`,
        `"${i.documentCode}"`,
        `"${i.status === "PENDING_SYNC" ? "Offline" : "Ativo"}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reclusos_minint_excel_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`overflow-x-auto rounded-lg border border-slate-850 bg-slate-950/20 text-left font-mono text-[9.5px] text-slate-300 transition-all ${
        isFullScreen ? "fixed inset-2 z-50 bg-slate-950 shadow-2xl" : ""
      }`}
    >
      {/* Excel Toolbar */}
      <div className="bg-slate-900/90 border-b border-slate-850 p-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-xs tracking-tight">
                Matriz de Reclusos • Grelha Virtualizada react-window
              </span>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold uppercase flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> High Performance
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-sans">
              Gestão de grande volume de reclusos com renderização virtualizada react-window.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Real-time Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3 w-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Pesquisar por Nome, BI, RNR..."
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-[9.5px] text-slate-200 pl-7 pr-3 py-1 rounded w-48 font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 text-slate-500 hover:text-slate-300 text-[8px] font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Density toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
            <button
              type="button"
              onClick={() => setDensity("micro")}
              className={`px-1.5 py-0.5 text-[8px] rounded ${density === "micro" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"}`}
            >
              Micro (38px)
            </button>
            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={`px-1.5 py-0.5 text-[8px] rounded ${density === "compact" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"}`}
            >
              Compacto (46px)
            </button>
          </div>

          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-400 rounded text-[9px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Download className="h-3 w-3" /> Exportar CSV
          </button>

          {/* FullScreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded transition cursor-pointer"
          >
            {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Excel Formula Bar */}
      <div className="bg-slate-950 border-b border-slate-850 px-3 py-1 flex items-center gap-2 select-none text-[9px]">
        <div className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-400 font-bold w-16 text-center">
          {selectedCell ? `${getColLetter(selectedCell.colIdx)}${selectedCell.rowIdx + 1}` : "A1"}
        </div>
        <div className="text-slate-600 font-serif italic text-xs font-bold">fx</div>
        <div className="flex-1 bg-slate-900/80 border border-slate-850 px-2 py-0.5 rounded text-slate-300 font-mono truncate">
          {activeCellValue}
        </div>
        <div className="text-[8.5px] text-slate-400 font-mono shrink-0">
          <strong className="text-slate-200">{sortedInmates.length}</strong> / {inmates.length} reclusos registados
        </div>
      </div>

      {/* Optional Bulk Actions Node */}
      {bulkActionsNode && <div className="bg-slate-900/60 border-b border-slate-850 p-2">{bulkActionsNode}</div>}

      {/* Scrollable Virtualized Table Container */}
      <div className="overflow-x-auto w-full">
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
                className="h-3 w-3 rounded border-slate-800 bg-slate-900 text-amber-500 cursor-pointer accent-amber-500"
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
      <div className="bg-slate-950 border-t border-slate-850 px-3 py-1 flex items-center justify-between text-[8.5px] font-mono text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" /> GRELHA VIRTUALIZADA REACT-WINDOW
          </span>
          <span>• Selecionados: {selectedInmateIds.length} reclusos</span>
        </div>
        <div className="text-slate-500">Renderização em janela fixa com contenção de barra de deslocamento</div>
      </div>
    </div>
  );
}
