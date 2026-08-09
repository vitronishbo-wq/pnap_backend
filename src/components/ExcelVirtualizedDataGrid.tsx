import React, { useState, useRef, useMemo, useEffect } from "react";
import { 
  Table, 
  Search, 
  Download, 
  Filter, 
  SlidersHorizontal, 
  ChevronDown, 
  CheckSquare, 
  Square, 
  ArrowUpDown, 
  Maximize2, 
  Minimize2,
  FileSpreadsheet,
  Layers,
  Sparkles
} from "lucide-react";

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor?: (item: T) => any;
  cell?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  excelColLetter?: string;
}

interface ExcelVirtualizedDataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (item: T) => string;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSelectRow?: (item: T) => void;
  selectedRowIds?: string[];
  onToggleSelectAll?: (allData: T[]) => void;
  bulkActions?: React.ReactNode;
  rowHeight?: number;
  maxContainerHeight?: number;
  className?: string;
  emptyMessage?: string;
}

export function ExcelVirtualizedDataGrid<T>({
  data,
  columns,
  getRowId,
  title = "Grelha Virtualizada de Dados",
  subtitle = "Visão compacta tipo folha de cálculo com carregamento de alto desempenho",
  searchPlaceholder = "Filtrar registos na grelha...",
  onSelectRow,
  selectedRowIds = [],
  onToggleSelectAll,
  bulkActions,
  rowHeight = 32,
  maxContainerHeight = 440,
  className = "",
  emptyMessage = "Nenhum registo encontrado na grelha."
}: ExcelVirtualizedDataGridProps<T>) {
  const [filterQuery, setFilterQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCell, setSelectedCell] = useState<{ rowIdx: number; colIdx: number } | null>({ rowIdx: 0, colIdx: 0 });
  const [density, setDensity] = useState<"compact" | "normal" | "dense">("compact");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(maxContainerHeight);

  // Dynamic row height based on density mode
  const currentRowHeight = density === "dense" ? 26 : density === "compact" ? 32 : 40;

  // Track scroll position for virtualized slice calculation
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight || maxContainerHeight);
    }
  }, [maxContainerHeight, isFullScreen]);

  // Filter items
  const filteredData = useMemo(() => {
    if (!filterQuery.trim()) return data;
    const q = filterQuery.toLowerCase().trim();
    return data.filter((item) => {
      return columns.some((col) => {
        let val = "";
        if (col.accessor) {
          val = String(col.accessor(item) || "");
        } else {
          val = String((item as any)[col.id] || "");
        }
        return val.toLowerCase().includes(q);
      });
    });
  }, [data, filterQuery, columns]);

  // Sort items
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    const col = columns.find((c) => c.id === sortColumn);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = col.accessor ? col.accessor(a) : (a as any)[col.id];
      let valB = col.accessor ? col.accessor(b) : (b as any)[col.id];

      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Virtualization window calculations
  const totalCount = sortedData.length;
  const totalContentHeight = totalCount * currentRowHeight;

  // Buffer count to prevent flickering
  const buffer = 5;
  const startIndex = Math.max(0, Math.floor(scrollTop / currentRowHeight) - buffer);
  const endIndex = Math.min(
    totalCount,
    Math.ceil((scrollTop + containerHeight) / currentRowHeight) + buffer
  );

  const visibleRows = sortedData.slice(startIndex, endIndex);
  const offsetY = startIndex * currentRowHeight;

  const handleSort = (colId: string) => {
    if (sortColumn === colId) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumn(colId);
      setSortDirection("asc");
    }
  };

  const getExcelColLetter = (index: number) => {
    return String.fromCharCode(65 + (index % 26));
  };

  const isAllSelected = sortedData.length > 0 && sortedData.every((item) => selectedRowIds.includes(getRowId(item)));

  const activeCellValue = useMemo(() => {
    if (!selectedCell || !sortedData[selectedCell.rowIdx]) return "Nenhum";
    const item = sortedData[selectedCell.rowIdx];
    const col = columns[selectedCell.colIdx];
    if (!col) return "Nenhum";
    if (col.accessor) return String(col.accessor(item) ?? "");
    return String((item as any)[col.id] ?? "");
  }, [selectedCell, sortedData, columns]);

  // Export visible data to CSV
  const handleExportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");
    const rows = sortedData.map((item) =>
      columns
        .map((c) => {
          const val = c.accessor ? c.accessor(item) : (item as any)[c.id];
          return `"${String(val ?? "").replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `grelha_dados_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`flex flex-col border border-slate-800 rounded-lg bg-slate-950/90 shadow-2xl overflow-hidden font-mono text-[10px] text-slate-300 transition-all ${
        isFullScreen ? "fixed inset-2 z-50 bg-slate-950" : ""
      } ${className}`}
    >
      {/* Excel Ribbon Top Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-xs tracking-tight">{title}</span>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold uppercase">
                GRELHA EXCEL VIRTUALIZADA
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-sans">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Filter */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3 w-3 text-slate-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-[9.5px] text-slate-200 pl-7 pr-3 py-1 rounded w-44 font-mono transition"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery("")}
                className="absolute right-2 text-slate-500 hover:text-slate-300 text-[8px] font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Density Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
            <button
              type="button"
              onClick={() => setDensity("dense")}
              className={`px-1.5 py-0.5 text-[8px] rounded transition ${
                density === "dense" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Densidade Ultra-Compacta (26px)"
            >
              Dense
            </button>
            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={`px-1.5 py-0.5 text-[8px] rounded transition ${
                density === "compact" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Densidade Normal (32px)"
            >
              Normal
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-amber-400 rounded text-[9px] font-bold flex items-center gap-1 transition cursor-pointer"
            title="Exportar para Excel / CSV"
          >
            <Download className="h-3 w-3" />
            CSV
          </button>

          {/* Full Screen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 rounded transition cursor-pointer"
            title={isFullScreen ? "Sair do modo ecrã inteiro" : "Ecrã Inteiro"}
          >
            {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Excel Formula Bar & Status Header */}
      <div className="bg-slate-950 border-b border-slate-850 px-3 py-1 flex items-center gap-3 select-none text-[9px]">
        {/* Cell Coordinates Box */}
        <div className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-400 font-bold font-mono w-16 text-center">
          {selectedCell ? `${getExcelColLetter(selectedCell.colIdx)}${selectedCell.rowIdx + 1}` : "A1"}
        </div>

        <div className="text-slate-600 font-serif italic text-xs font-bold">fx</div>

        {/* Formula / Cell Content Display */}
        <div className="flex-1 bg-slate-900/80 border border-slate-850 px-2 py-0.5 rounded text-slate-300 font-mono truncate min-h-[20px] flex items-center">
          {activeCellValue}
        </div>

        {/* Record count indicator */}
        <div className="text-[8.5px] text-slate-400 font-mono flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            <strong className="text-slate-200">{sortedData.length}</strong> / {data.length} registos
          </span>
        </div>
      </div>

      {/* Custom Bulk Actions Toolbar if present */}
      {bulkActions && <div className="bg-slate-900/60 border-b border-slate-850 px-3 py-1.5">{bulkActions}</div>}

      {/* Main Virtualized Grid Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: isFullScreen ? "calc(100vh - 120px)" : `${maxContainerHeight}px` }}
        className="overflow-x-auto overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950 border-slate-850 bg-slate-950/20"
      >
        <table className="w-full text-left border-collapse font-mono text-[9.5px]">
          {/* Sticky Excel Grid Headers */}
          <thead className="sticky top-0 z-20 bg-slate-950 shadow-md">
            {/* Top row: Excel Column Letters */}
            <tr className="bg-slate-900/90 text-slate-500 border-b border-slate-800 text-[8px] font-bold text-center select-none">
              <th className="w-9 border-r border-slate-800 py-0.5 bg-slate-950 text-slate-600">
                #
              </th>
              {onToggleSelectAll && (
                <th className="w-8 border-r border-slate-800 py-0.5 bg-slate-950">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={() => onToggleSelectAll(sortedData)}
                    className="h-3 w-3 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer accent-amber-500"
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th key={col.id} className="border-r border-slate-800 py-0.5 text-slate-500">
                  {col.excelColLetter || getExcelColLetter(idx)}
                </th>
              ))}
            </tr>

            {/* Main Data Column Headers */}
            <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[8px] font-bold border-b border-slate-800">
              <th className="w-9 text-center border-r border-slate-800 py-2 bg-slate-900/90 text-slate-500">
                Linha
              </th>

              {onToggleSelectAll && (
                <th className="w-8 text-center border-r border-slate-800 py-2 bg-slate-900/90">
                  SEL
                </th>
              )}

              {columns.map((col, colIdx) => (
                <th
                  key={col.id}
                  onClick={() => handleSort(col.id)}
                  style={{ width: col.width }}
                  className={`px-2.5 py-2 border-r border-slate-800 hover:bg-slate-900/80 cursor-pointer transition select-none ${
                    col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  <div className="flex items-center gap-1 justify-between">
                    <span className="truncate">{col.header}</span>
                    <ArrowUpDown className={`h-2.5 w-2.5 shrink-0 ${sortColumn === col.id ? "text-amber-400 font-bold" : "text-slate-600"}`} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Virtualized Body Container */}
          <tbody>
            {/* Top Spacer for Virtualization */}
            {offsetY > 0 && (
              <tr>
                <td colSpan={columns.length + (onToggleSelectAll ? 2 : 1)} style={{ height: `${offsetY}px` }} />
              </tr>
            )}

            {/* Render Visible Virtual Rows */}
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onToggleSelectAll ? 2 : 1)}
                  className="py-12 text-center text-slate-500 font-sans italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleRows.map((item, visibleIdx) => {
                const actualRowIdx = startIndex + visibleIdx;
                const rowId = getRowId(item);
                const isSelected = selectedRowIds.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    style={{ height: `${currentRowHeight}px` }}
                    className={`transition-colors border-b border-slate-850/60 ${
                      isSelected
                        ? "bg-amber-500/15 border-l-2 border-l-amber-500"
                        : actualRowIdx % 2 === 0
                        ? "bg-slate-950/40"
                        : "bg-slate-900/20"
                    } hover:bg-amber-500/10 cursor-pointer`}
                    onClick={() => {
                      if (onSelectRow) onSelectRow(item);
                    }}
                  >
                    {/* Excel Row Number Column */}
                    <td className="w-9 text-center border-r border-slate-800 font-mono text-[8px] text-slate-500 bg-slate-900/40 select-none">
                      {actualRowIdx + 1}
                    </td>

                    {/* Checkbox Column */}
                    {onToggleSelectAll && (
                      <td className="w-8 text-center border-r border-slate-800 px-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow && onSelectRow(item)}
                          className="h-3 w-3 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer accent-amber-500"
                        />
                      </td>
                    )}

                    {/* Data Cells with Excel Grid Lines */}
                    {columns.map((col, colIdx) => {
                      const isCellFocused =
                        selectedCell?.rowIdx === actualRowIdx && selectedCell?.colIdx === colIdx;

                      return (
                        <td
                          key={col.id}
                          onClick={() => setSelectedCell({ rowIdx: actualRowIdx, colIdx })}
                          className={`border-r border-slate-800/80 px-2 py-1 text-[9.5px] truncate font-mono ${
                            col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"
                          } ${isCellFocused ? "ring-1 ring-amber-400 bg-amber-400/10 text-slate-100 font-bold" : ""}`}
                        >
                          {col.cell
                            ? col.cell(item, actualRowIdx)
                            : col.accessor
                            ? String(col.accessor(item) ?? "—")
                            : String((item as any)[col.id] ?? "—")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}

            {/* Bottom Spacer for Virtualization */}
            {totalContentHeight - offsetY - visibleRows.length * currentRowHeight > 0 && (
              <tr>
                <td
                  colSpan={columns.length + (onToggleSelectAll ? 2 : 1)}
                  style={{
                    height: `${Math.max(0, totalContentHeight - offsetY - visibleRows.length * currentRowHeight)}px`
                  }}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Excel Status Bar Footer */}
      <div className="bg-slate-950 border-t border-slate-850 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[8.5px] font-mono text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> PRONTO
          </span>
          <span className="text-slate-600">|</span>
          <span>
            SELEÇÃO: <strong className="text-slate-200">{selectedRowIds.length}</strong> LINHAS
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <span>ALGORITMO: VIRTUAL SLICING (O(1) DOM)</span>
          <span>SEM BARRA DE OVERFLOW GLOBAL</span>
        </div>
      </div>
    </div>
  );
}
