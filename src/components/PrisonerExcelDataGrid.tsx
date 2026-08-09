import React, { useState, useRef, useMemo, useEffect } from "react";
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
  ChevronDown,
  Layers,
  UserCheck,
  Check
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

export function PrisonerExcelDataGrid({
  inmates,
  prisons,
  searchQuery,
  onSearchChange,
  selectedInmateIds,
  onToggleSelectInmate,
  onSelectAllInmates,
  onTransferInmate,
  onEditRiskInmate,
  onUploadPhoto,
  onExportPDF,
  onEditAndSign,
  onToggleHistory,
  selectedHistoryId,
  historyLogs,
  onSelectDocumentCode,
  bulkActionsNode
}: PrisonerExcelDataGridProps) {
  const [sortField, setSortField] = useState<keyof Inmate | "fullName">("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedCell, setSelectedCell] = useState<{ rowIdx: number; colIdx: number } | null>({ rowIdx: 0, colIdx: 0 });
  const [density, setDensity] = useState<"compact" | "normal" | "micro">("compact");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const rowHeight = density === "micro" ? 36 : density === "compact" ? 44 : 56;
  const maxContainerHeight = 440;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

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

  // Virtualized row slice calculation
  const totalCount = sortedInmates.length;
  const totalContentHeight = totalCount * rowHeight;
  const buffer = 4;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const endIndex = Math.min(totalCount, Math.ceil((scrollTop + maxContainerHeight) / rowHeight) + buffer);

  const visibleRows = sortedInmates.slice(startIndex, endIndex);
  const offsetY = startIndex * rowHeight;

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
        isFullScreen ? "fixed inset-2 z-50 bg-slate-950" : ""
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
                Matriz de Reclusos • Grelha Virtualizada Excel
              </span>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold uppercase">
                Zero Overflow Slicing
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-sans">
              Gestão de grande volume de reclusos em grelha compacta de alto rendimento.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Real-time search filter inside grid */}
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
              Micro (36px)
            </button>
            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={`px-1.5 py-0.5 text-[8px] rounded ${density === "compact" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400"}`}
            >
              Compacto (44px)
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

      {/* Main Virtualized Grid Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: isFullScreen ? "calc(100vh - 140px)" : `${maxContainerHeight}px` }}
        className="overflow-x-auto overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950 bg-slate-950/40"
      >
        <table className="w-full text-left border-collapse font-mono text-[9.5px]">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-20 bg-slate-950 shadow-md">
            {/* Excel letters */}
            <tr className="bg-slate-900/90 text-slate-500 border-b border-slate-800 text-[8px] font-bold text-center select-none">
              <th className="w-8 border-r border-slate-800 py-0.5 bg-slate-950">#</th>
              <th className="w-8 border-r border-slate-800 py-0.5 bg-slate-950">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={() => onSelectAllInmates(sortedInmates)}
                  className="h-3 w-3 rounded border-slate-800 bg-slate-900 text-amber-500 cursor-pointer accent-amber-500"
                />
              </th>
              {["A", "B", "C", "D", "E", "F", "G", "H"].map((lettr) => (
                <th key={lettr} className="border-r border-slate-800 py-0.5 text-slate-500">
                  {lettr}
                </th>
              ))}
            </tr>

            {/* Column Headers */}
            <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[8px] font-bold border-b border-slate-800">
              <th className="w-8 text-center border-r border-slate-800 py-2 bg-slate-900/90 text-slate-500">
                Linha
              </th>
              <th className="w-8 text-center border-r border-slate-800 py-2 bg-slate-900/90">
                SEL
              </th>

              <th onClick={() => handleSort("id")} className="px-2 py-2 border-r border-slate-800 hover:bg-slate-900 cursor-pointer w-24">
                <div className="flex items-center justify-between">
                  <span>Mugshot / RNR</span>
                  <ArrowUpDown className="h-2.5 w-2.5 text-slate-600" />
                </div>
              </th>

              <th onClick={() => handleSort("fullName")} className="px-2.5 py-2 border-r border-slate-800 hover:bg-slate-900 cursor-pointer min-w-[150px]">
                <div className="flex items-center justify-between">
                  <span>Nome do Recluso</span>
                  <ArrowUpDown className="h-2.5 w-2.5 text-slate-600" />
                </div>
              </th>

              <th onClick={() => handleSort("idCard")} className="px-2.5 py-2 border-r border-slate-800 hover:bg-slate-900 cursor-pointer w-28">
                <div className="flex items-center justify-between">
                  <span>Nº B.I.</span>
                  <ArrowUpDown className="h-2.5 w-2.5 text-slate-600" />
                </div>
              </th>

              <th onClick={() => handleSort("riskLevel")} className="px-2 py-2 border-r border-slate-800 hover:bg-slate-900 cursor-pointer w-24 text-center">
                <div className="flex items-center justify-between">
                  <span>Risco</span>
                  <ArrowUpDown className="h-2.5 w-2.5 text-slate-600" />
                </div>
              </th>

              <th onClick={() => handleSort("assignedPrisonId")} className="px-2.5 py-2 border-r border-slate-800 hover:bg-slate-900 cursor-pointer min-w-[130px]">
                <div className="flex items-center justify-between">
                  <span>Unidade & Cela</span>
                  <ArrowUpDown className="h-2.5 w-2.5 text-slate-600" />
                </div>
              </th>

              <th className="px-2 py-2 border-r border-slate-800 w-28 text-center">
                Selo Cripto
              </th>

              <th className="px-2 py-2 border-r border-slate-800 w-20 text-center">
                Estado
              </th>

              <th className="px-2.5 py-2 border-r border-slate-800 min-w-[200px] text-center">
                Ações Rápidas de Custódia
              </th>
            </tr>
          </thead>

          {/* Virtualized Body */}
          <tbody>
            {offsetY > 0 && (
              <tr>
                <td colSpan={10} style={{ height: `${offsetY}px` }} />
              </tr>
            )}

            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500 font-sans italic">
                  Nenhum recluso corresponde à pesquisa ativa.
                </td>
              </tr>
            ) : (
              visibleRows.map((inm, visibleIdx) => {
                const actualRowIdx = startIndex + visibleIdx;
                const isSelected = selectedInmateIds.includes(inm.id);
                const prName = prisons.find((p) => p.id === inm.assignedPrisonId)?.name.replace("Estabelecimento Penitenciário de ", "EP ") || "EP Viana";

                return (
                  <tr
                    key={inm.id}
                    style={{ height: `${rowHeight}px` }}
                    className={`transition-colors border-b border-slate-850/60 ${
                      isSelected
                        ? "bg-amber-500/15 border-l-2 border-l-amber-500"
                        : actualRowIdx % 2 === 0
                        ? "bg-slate-950/40"
                        : "bg-slate-900/20"
                    } hover:bg-amber-500/10 cursor-pointer`}
                  >
                    {/* Row Index */}
                    <td className="w-8 text-center border-r border-slate-800 font-mono text-[8px] text-slate-500 bg-slate-900/40 select-none">
                      {actualRowIdx + 1}
                    </td>

                    {/* Checkbox */}
                    <td className="w-8 text-center border-r border-slate-800 px-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectInmate(inm.id)}
                        className="h-3 w-3 rounded border-slate-800 bg-slate-900 text-amber-500 cursor-pointer accent-amber-500"
                      />
                    </td>

                    {/* Mugshot & RNR */}
                    <td
                      onClick={() => setSelectedCell({ rowIdx: actualRowIdx, colIdx: 0 })}
                      className="px-2 py-1 border-r border-slate-800/80"
                    >
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`grid-photo-${inm.id}`}
                          className="w-7 h-8 border border-slate-800 rounded overflow-hidden shrink-0 bg-slate-900 relative group cursor-pointer"
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
                        <span className="font-bold text-slate-300 font-mono text-[9px]">{inm.id}</span>
                      </div>
                    </td>

                    {/* Full Name */}
                    <td
                      onClick={() => setSelectedCell({ rowIdx: actualRowIdx, colIdx: 1 })}
                      className="px-2.5 py-1 border-r border-slate-800/80 font-bold text-slate-100 truncate"
                    >
                      {inm.firstName} {inm.lastName}
                    </td>

                    {/* BI */}
                    <td
                      onClick={() => setSelectedCell({ rowIdx: actualRowIdx, colIdx: 2 })}
                      className="px-2.5 py-1 border-r border-slate-800/80 text-slate-350"
                    >
                      {inm.idCard}
                    </td>

                    {/* Risk Level */}
                    <td
                      onClick={() => setSelectedCell({ rowIdx: actualRowIdx, colIdx: 3 })}
                      className="px-2 py-1 border-r border-slate-800/80 text-center"
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
                    </td>

                    {/* Prison Unit & Cell */}
                    <td
                      onClick={() => setSelectedCell({ rowIdx: actualRowIdx, colIdx: 4 })}
                      className="px-2.5 py-1 border-r border-slate-800/80 truncate text-slate-300"
                    >
                      <span className="font-medium text-sky-400">{prName}</span>
                      <span className="text-slate-500 text-[8px] ml-1.5">({inm.assignedCellNumber || "N/A"})</span>
                    </td>

                    {/* Crypto Seal */}
                    <td
                      onClick={() => setSelectedCell({ rowIdx: actualRowIdx, colIdx: 5 })}
                      className="px-2 py-1 border-r border-slate-800/80 text-center"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDocumentCode(inm.documentCode);
                        }}
                        className="text-amber-500 hover:underline text-[8.5px] font-mono flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      >
                        {inm.documentCode} <ExternalLink className="h-2.5 w-2.5" />
                      </button>
                    </td>

                    {/* Status */}
                    <td
                      onClick={() => setSelectedCell({ rowIdx: actualRowIdx, colIdx: 6 })}
                      className="px-2 py-1 border-r border-slate-800/80 text-center"
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
                    </td>

                    {/* Quick Custody Actions */}
                    <td className="px-2 py-1 border-r border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 flex-wrap">
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

                      {/* Inline History Trail overlay if expanded */}
                      {selectedHistoryId === inm.id && (
                        <div className="mt-1 p-2 bg-slate-950 border border-slate-800 rounded text-[8px] font-mono flex flex-col gap-1 max-h-32 overflow-y-auto">
                          <span className="text-amber-500 font-bold">Rastreabilidade Forense ({historyLogs.filter((l) => l.inmateId === inm.id).length}):</span>
                          {historyLogs.filter((l) => l.inmateId === inm.id).length === 0 ? (
                            <span className="text-slate-500 italic">Sem histórico de alterações.</span>
                          ) : (
                            historyLogs.filter((l) => l.inmateId === inm.id).map((l) => (
                              <div key={l.id} className="border-b border-slate-900 pb-1">
                                <span className="text-slate-400">{l.operatorName}:</span> Alterou <span className="text-amber-400">{l.fieldName}</span> de "{l.oldValue}" para "{l.newValue}"
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}

            {totalContentHeight - offsetY - visibleRows.length * rowHeight > 0 && (
              <tr>
                <td colSpan={10} style={{ height: `${Math.max(0, totalContentHeight - offsetY - visibleRows.length * rowHeight)}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Status Bar */}
      <div className="bg-slate-950 border-t border-slate-850 px-3 py-1 flex items-center justify-between text-[8.5px] font-mono text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" /> GRELHA VIRTUALIZADA ACTIVA
          </span>
          <span>• Selecionados: {selectedInmateIds.length} reclusos</span>
        </div>
        <div className="text-slate-500">Renderização em janela fixa com contenção de barra de deslocamento</div>
      </div>
    </div>
  );
}
