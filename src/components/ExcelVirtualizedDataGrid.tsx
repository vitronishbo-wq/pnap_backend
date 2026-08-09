import React, { useState, useMemo } from "react";
import { List } from "react-window";
import { 
  Search, 
  Download, 
  Maximize2, 
  Minimize2, 
  FileSpreadsheet, 
  ArrowUpDown, 
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

interface RowDataProps<T> {
  sortedData: T[];
  columns: ColumnDef<T>[];
  getRowId: (item: T) => string;
  selectedRowIds: string[];
  onSelectRow?: (item: T) => void;
  onToggleSelectAll?: (allData: T[]) => void;
  selectedCell: { rowIdx: number; colIdx: number } | null;
  setSelectedCell: (cell: { rowIdx: number; colIdx: number }) => void;
}

function GridRow<T>({ index, style, sortedData, columns, getRowId, selectedRowIds, onSelectRow, onToggleSelectAll, selectedCell, setSelectedCell }: { index: number; style: React.CSSProperties } & RowDataProps<T>) {
  const item = sortedData[index];
  if (!item) return null;
  const rowId = getRowId(item);
  const isSelected = selectedRowIds.includes(rowId);

  return (
    <div
      style={style}
      className={`flex items-stretch border-b border-slate-850/60 font-mono text-[9.5px] transition-colors ${
        isSelected
          ? "bg-amber-500/15 border-l-2 border-l-amber-500"
          : index % 2 === 0
          ? "bg-slate-950/40"
          : "bg-slate-900/20"
      } hover:bg-amber-500/10 cursor-pointer`}
      onClick={() => onSelectRow?.(item)}
    >
      {/* Row Index */}
      <div className="w-9 shrink-0 text-center border-r border-slate-800 text-[8px] text-slate-500 bg-slate-900/40 select-none flex items-center justify-center font-mono">
        {index + 1}
      </div>

      {/* Checkbox */}
      {onToggleSelectAll && (
        <div
          className="w-8 shrink-0 text-center border-r border-slate-800 px-1 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectRow && onSelectRow(item)}
            className="h-3 w-3 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer accent-amber-500"
          />
        </div>
      )}

      {/* Data Cells */}
      {columns.map((col, colIdx) => {
        const isCellFocused =
          selectedCell?.rowIdx === index && selectedCell?.colIdx === colIdx;

        return (
          <div
            key={col.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCell({ rowIdx: index, colIdx });
              if (onSelectRow) onSelectRow(item);
            }}
            style={{
              width: col.width || "140px",
              flexShrink: col.width ? 0 : 1,
              flexGrow: col.width ? 0 : 1
            }}
            className={`border-r border-slate-800/80 px-2.5 py-1 flex items-center truncate ${
              col.align === "center"
                ? "justify-center text-center"
                : col.align === "right"
                ? "justify-end text-right"
                : "justify-start text-left"
            } ${
              isCellFocused ? "ring-1 ring-amber-400 bg-amber-400/10 text-slate-100 font-bold" : ""
            }`}
          >
            {col.cell
              ? col.cell(item, index)
              : col.accessor
              ? String(col.accessor(item) ?? "—")
              : String((item as any)[col.id] ?? "—")}
          </div>
        );
      })}
    </div>
  );
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
  maxContainerHeight = 400,
  className = "",
  emptyMessage = "Nenhum registo encontrado na grelha."
}: ExcelVirtualizedDataGridProps<T>) {
  const [filterQuery, setFilterQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCell, setSelectedCell] = useState<{ rowIdx: number; colIdx: number } | null>({ rowIdx: 0, colIdx: 0 });
  const [density, setDensity] = useState<"compact" | "normal" | "dense">("compact");
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Dynamic row height based on density mode
  const currentRowHeight = density === "dense" ? 28 : density === "compact" ? 36 : 44;
  const listHeight = isFullScreen ? 600 : maxContainerHeight;

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

  const handleSort = (colId: string) => {
    if (sortColumn === colId) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
      }
    } else {
      setSortColumn(colId);
      setSortDirection("asc");
    }
  };

  const isAllSelected = sortedData.length > 0 && sortedData.every((item) => selectedRowIds.includes(getRowId(item)));

  const getExcelColLetter = (idx: number) => String.fromCharCode(65 + (idx % 26));

  const activeCellValue = useMemo(() => {
    if (!selectedCell || !sortedData[selectedCell.rowIdx]) return "Nenhum registo selecionado";
    const item = sortedData[selectedCell.rowIdx];
    const col = columns[selectedCell.colIdx];
    if (!col) return "Célula fora do limite";
    if (col.accessor) return String(col.accessor(item) ?? "");
    return String((item as any)[col.id] ?? "");
  }, [selectedCell, sortedData, columns]);

  const handleExportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = columns.map((c) => `"${c.header}"`);
    const rows = sortedData.map((item) => {
      return columns
        .map((col) => {
          let val = col.accessor ? col.accessor(item) : (item as any)[col.id];
          return `"${String(val ?? "").replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_grelha_virtual_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`overflow-x-auto rounded-lg border border-slate-850 bg-slate-950/20 text-left font-mono text-[9.5px] text-slate-300 transition-all ${
        isFullScreen ? "fixed inset-2 z-50 bg-slate-950 shadow-2xl" : ""
      } ${className}`}
    >
      {/* Header Toolbar */}
      <div className="bg-slate-900/90 border-b border-slate-850 p-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-xs tracking-tight">{title}</span>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold uppercase flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> react-window
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-sans">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Real-time Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3 w-3 text-slate-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-[9.5px] text-slate-200 pl-7 pr-3 py-1 rounded w-52 font-mono"
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

          {/* Density Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
            <button
              type="button"
              onClick={() => setDensity("dense")}
              className={`px-1.5 py-0.5 text-[8px] rounded transition ${
                density === "dense" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Ultra (28px)
            </button>
            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={`px-1.5 py-0.5 text-[8px] rounded transition ${
                density === "compact" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Compacto (36px)
            </button>
            <button
              type="button"
              onClick={() => setDensity("normal")}
              className={`px-1.5 py-0.5 text-[8px] rounded transition ${
                density === "normal" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Normal (44px)
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-400 rounded text-[9px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Download className="h-3 w-3" /> Exportar CSV
          </button>

          {/* Fullscreen Toggle */}
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
          {selectedCell ? `${getExcelColLetter(selectedCell.colIdx)}${selectedCell.rowIdx + 1}` : "A1"}
        </div>
        <div className="text-slate-600 font-serif italic text-xs font-bold">fx</div>
        <div className="flex-1 bg-slate-900/80 border border-slate-850 px-2 py-0.5 rounded text-slate-300 font-mono truncate">
          {activeCellValue}
        </div>
        <div className="text-[8.5px] text-slate-400 font-mono flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            <strong className="text-slate-200">{sortedData.length}</strong> / {data.length} registos
          </span>
        </div>
      </div>

      {/* Custom Bulk Actions Toolbar */}
      {bulkActions && <div className="bg-slate-900/60 border-b border-slate-850 px-3 py-1.5">{bulkActions}</div>}

      {/* Scrollable Virtualized Grid Container */}
      <div className="overflow-x-auto w-full">
        {/* Sticky Header Row */}
        <div className="sticky top-0 z-20 bg-slate-950 border-b border-slate-800 shadow-md min-w-max">
          {/* Excel Letters Header */}
          <div className="flex items-center bg-slate-900/90 text-slate-500 border-b border-slate-800 text-[8px] font-bold select-none">
            <div className="w-9 shrink-0 text-center border-r border-slate-800 py-0.5 bg-slate-950 text-slate-600">
              #
            </div>
            {onToggleSelectAll && (
              <div className="w-8 shrink-0 text-center border-r border-slate-800 py-0.5 bg-slate-950">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={() => onToggleSelectAll(sortedData)}
                  className="h-3 w-3 rounded border-slate-800 bg-slate-900 text-amber-500 cursor-pointer accent-amber-500"
                />
              </div>
            )}
            {columns.map((col, idx) => (
              <div
                key={col.id}
                style={{ width: col.width || "140px", flexShrink: col.width ? 0 : 1, flexGrow: col.width ? 0 : 1 }}
                className="border-r border-slate-800 py-0.5 text-center text-slate-500 truncate"
              >
                {col.excelColLetter || getExcelColLetter(idx)}
              </div>
            ))}
          </div>

          {/* Column Names Header */}
          <div className="flex items-center bg-slate-950 text-slate-400 uppercase tracking-wider text-[8px] font-bold">
            <div className="w-9 shrink-0 text-center border-r border-slate-800 py-2 bg-slate-900/90 text-slate-500 font-mono">
              Linha
            </div>
            {onToggleSelectAll && (
              <div className="w-8 shrink-0 text-center border-r border-slate-800 py-2 bg-slate-900/90 font-mono">
                SEL
              </div>
            )}
            {columns.map((col) => (
              <div
                key={col.id}
                onClick={() => handleSort(col.id)}
                style={{ width: col.width || "140px", flexShrink: col.width ? 0 : 1, flexGrow: col.width ? 0 : 1 }}
                className={`px-2.5 py-2 border-r border-slate-800 hover:bg-slate-900/80 cursor-pointer transition select-none flex items-center justify-between gap-1 ${
                  col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                <span className="truncate">{col.header}</span>
                <ArrowUpDown
                  className={`h-2.5 w-2.5 shrink-0 ${
                    sortColumn === col.id ? "text-amber-400 font-bold" : "text-slate-600"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Virtualized Body using react-window List */}
        {sortedData.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-sans italic min-w-max">
            {emptyMessage}
          </div>
        ) : (
          <div className="min-w-max">
            <List
              rowCount={sortedData.length}
              rowHeight={currentRowHeight}
              rowComponent={GridRow as any}
              rowProps={{
                sortedData,
                columns,
                getRowId,
                selectedRowIds,
                onSelectRow,
                onToggleSelectAll,
                selectedCell,
                setSelectedCell
              }}
              style={{ height: listHeight, width: "100%" }}
              className="scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950"
            />
          </div>
        )}
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
          <span>ALGORITMO: REACT-WINDOW VIRTUAL LIST</span>
          <span>SEM BARRA DE OVERFLOW GLOBAL</span>
        </div>
      </div>
    </div>
  );
}
