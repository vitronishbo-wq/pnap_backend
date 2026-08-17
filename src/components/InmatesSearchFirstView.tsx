import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  QrCode, 
  UserPlus, 
  FileText, 
  ArrowLeftRight, 
  Download, 
  X, 
  ShieldAlert, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  UserCheck
} from "lucide-react";
import { Inmate, Prison } from "../types";

interface InmatesSearchFirstViewProps {
  inmates: Inmate[];
  prisons: Prison[];
  currentOperator: any;
  onSelectInmate: (inmate: Inmate) => void;
  onTransferInmate?: (inmate: Inmate) => void;
  onOpenAddInmate: () => void;
  onOpenQRScanner: () => void;
  exportInmateToPDF?: (inmate: Inmate) => void;
  exportInmateListToPDF?: (inmates: Inmate[], query: string) => void;
}

export function InmatesSearchFirstView({
  inmates,
  prisons,
  currentOperator,
  onSelectInmate,
  onTransferInmate,
  onOpenAddInmate,
  onOpenQRScanner,
  exportInmateToPDF,
  exportInmateListToPDF
}: InmatesSearchFirstViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrisonId, setSelectedPrisonId] = useState("ALL");
  const [selectedRisk, setSelectedRisk] = useState("ALL");
  const [selectedRegime, setSelectedRegime] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState<"dense-table" | "dense-cards">("dense-table");

  const isNational = 
    !currentOperator ||
    currentOperator.territorialScope === "NATIONAL" ||
    currentOperator.level === "NATIONAL" ||
    currentOperator.role === "DIRECTOR_GERAL";

  // Filtered inmates
  const filteredInmates = useMemo(() => {
    return inmates.filter((inm) => {
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${inm.firstName || ""} ${inm.lastName || ""} ${inm.fullName || ""}`.toLowerCase();
        const bi = (inm.idCard || inm.biNumber || "").toLowerCase();
        const rnr = (inm.rnr || inm.id || "").toLowerCase();
        const docCode = (inm.documentCode || inm.nrep || "").toLowerCase();
        const processo = (inm.caseNumber || inm.processNumber || inm.warrantNumber || inm.court || "").toLowerCase();
        const cell = (inm.assignedCellNumber || inm.cellNumber || inm.cell || "").toLowerCase();
        const block = (inm.block || inm.sector || "").toLowerCase();
        const pav = (inm.pavilionName || inm.pavilion || "").toLowerCase();
        const crime = (inm.crimeCategory || inm.crimeId || inm.crimeDescription || "").toLowerCase();
        const prName = (prisons.find(p => p.id === (inm.assignedPrisonId || inm.prisonId))?.name || "").toLowerCase();

        const match = 
          fullName.includes(q) || 
          bi.includes(q) || 
          rnr.includes(q) ||
          docCode.includes(q) || 
          processo.includes(q) ||
          cell.includes(q) || 
          block.includes(q) ||
          pav.includes(q) || 
          crime.includes(q) || 
          prName.includes(q);

        if (!match) return false;
      }

      // Prison filter
      if (selectedPrisonId !== "ALL") {
        const prId = inm.assignedPrisonId || inm.prisonId;
        if (prId !== selectedPrisonId) return false;
      }

      // Risk filter
      if (selectedRisk !== "ALL") {
        if ((inm.riskLevel || "").toLowerCase() !== selectedRisk.toLowerCase()) return false;
      }

      // Regime filter
      if (selectedRegime !== "ALL") {
        const reg = (inm.regime || "").toLowerCase();
        if (!reg.includes(selectedRegime.toLowerCase())) return false;
      }

      // Status filter
      if (selectedStatus !== "ALL") {
        const st = (inm.status || "").toLowerCase();
        if (!st.includes(selectedStatus.toLowerCase())) return false;
      }

      return true;
    });
  }, [inmates, prisons, searchQuery, selectedPrisonId, selectedRisk, selectedRegime, selectedStatus]);

  // Risk breakdown
  const riskCounts = useMemo(() => {
    const counts = { Baixo: 0, Médio: 0, Alto: 0, Máximo: 0 };
    filteredInmates.forEach(i => {
      const r = i.riskLevel;
      if (r === "Baixo") counts.Baixo++;
      else if (r === "Médio") counts.Médio++;
      else if (r === "Alto") counts.Alto++;
      else if (r === "Máximo") counts.Máximo++;
      else counts.Médio++;
    });
    return counts;
  }, [filteredInmates]);

  const hasActiveFilters = selectedPrisonId !== "ALL" || selectedRisk !== "ALL" || selectedRegime !== "ALL" || selectedStatus !== "ALL" || searchQuery.trim().length > 0;

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedPrisonId("ALL");
    setSelectedRisk("ALL");
    setSelectedRegime("ALL");
    setSelectedStatus("ALL");
  };

  const getPrisonName = (pId?: string) => {
    if (!pId) return "Não atribuído";
    const p = prisons.find(item => item.id === pId);
    return p ? p.name.replace("Estabelecimento Penitenciário de ", "EP ") : pId;
  };

  return (
    <div id="inmates-search-first-container" className="flex flex-col gap-3 font-sans text-slate-200">
      
      {/* 1. TOP HEADER & SEARCH COMMAND BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3">
        
        {/* Title & Status Strip */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
              CONSULTA OPERACIONAL
            </span>
            <h1 className="text-xs md:text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
              Localizador
            </h1>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {filteredInmates.length} de {inmates.length}
            </span>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2">
            <button
              id="consulta-qr-scanner-btn"
              type="button"
              onClick={onOpenQRScanner}
              className="px-2.5 py-1 text-[10px] font-mono uppercase rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              title="Ler QR Code ou Código de Barras de Cartão/Guia"
            >
              <QrCode className="h-3.5 w-3.5 text-blue-400" />
              <span className="hidden sm:inline">Scanner QR</span>
            </button>

            {exportInmateListToPDF && (
              <button
                id="consulta-export-pdf-btn"
                type="button"
                onClick={() => exportInmateListToPDF(filteredInmates, searchQuery)}
                className="px-2.5 py-1 text-[10px] font-mono uppercase rounded border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition flex items-center gap-1.5 cursor-pointer"
                title="Exportar Lista de Reclusos (PDF Oficial)"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exportar PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input - Prominent Search-First Box */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-blue-400 pointer-events-none" />
          <input
            id="inmates-primary-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar imediatamente por Nome Completo, Nº do B.I., RNR / NREP, Unidade, Pavilhão ou Cela..."
            className="w-full bg-slate-950 border-2 border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all pl-10 pr-24 py-2.5 rounded-lg text-xs md:text-sm text-slate-100 placeholder-slate-500 font-mono shadow-inner"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Limpar pesquisa"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 2. DENSE FILTER BAR */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono">
          
          {/* Prison selector */}
          <div className="flex items-center gap-1">
            <Building2 className="h-3 w-3 text-slate-500" />
            <select
              id="filter-select-prison"
              value={selectedPrisonId}
              onChange={(e) => setSelectedPrisonId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none focus:border-blue-500 text-[10px] max-w-[180px] truncate"
            >
              <option value="ALL">Todas as Unidades ({prisons.length})</option>
              {prisons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name.replace("Estabelecimento Penitenciário de ", "EP ")}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter Chips */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5">
            <span className="text-slate-500 px-1 text-[9px] uppercase">Risco:</span>
            {["ALL", "Baixo", "Médio", "Alto", "Máximo"].map((risk) => (
              <button
                key={risk}
                type="button"
                onClick={() => setSelectedRisk(risk)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                  selectedRisk === risk
                    ? risk === "Máximo"
                      ? "bg-red-500 text-white"
                      : risk === "Alto"
                      ? "bg-amber-500 text-slate-950"
                      : risk === "Médio"
                      ? "bg-blue-500 text-white"
                      : risk === "Baixo"
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-700 text-slate-100"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {risk === "ALL" ? "Todos" : risk}
              </button>
            ))}
          </div>

          {/* Regime Filter */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5">
            <span className="text-slate-500 px-1 text-[9px] uppercase">Regime:</span>
            {["ALL", "Preventiva", "Fechado", "Semiaberto", "Comum"].map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => setSelectedRegime(reg)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition cursor-pointer ${
                  selectedRegime === reg
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {reg === "ALL" ? "Todos" : reg}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5">
            <span className="text-slate-500 px-1 text-[9px] uppercase">Estado:</span>
            {["ALL", "Ativo", "Trânsito", "Liberado"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition cursor-pointer ${
                  selectedStatus === st
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {st === "ALL" ? "Todos" : st}
              </button>
            ))}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-2 py-1 text-[9px] font-mono text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded transition cursor-pointer"
            >
              ✕ Limpar Filtros
            </button>
          )}

          {/* View mode toggle */}
          <div className="ml-auto hidden sm:flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("dense-table")}
              className={`px-2 py-0.5 rounded text-[9px] ${viewMode === "dense-table" ? "bg-slate-700 text-white font-bold" : "text-slate-400"}`}
            >
              Tabela
            </button>
            <button
              type="button"
              onClick={() => setViewMode("dense-cards")}
              className={`px-2 py-0.5 rounded text-[9px] ${viewMode === "dense-cards" ? "bg-slate-700 text-white font-bold" : "text-slate-400"}`}
            >
              Cartões
            </button>
          </div>
        </div>

        {/* 3. DENSE TELEMETRY STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-slate-800/60 font-mono text-[10px]">
          <div className="bg-slate-950 px-2 py-1 rounded border border-slate-850 flex items-center justify-between">
            <span className="text-slate-500">Filtrados:</span>
            <span className="font-bold text-blue-400">{filteredInmates.length}</span>
          </div>
          <div className="bg-slate-950 px-2 py-1 rounded border border-slate-850 flex items-center justify-between">
            <span className="text-emerald-500">Baixo Risco:</span>
            <span className="font-bold text-emerald-400">{riskCounts.Baixo}</span>
          </div>
          <div className="bg-slate-950 px-2 py-1 rounded border border-slate-850 flex items-center justify-between">
            <span className="text-blue-500">Médio Risco:</span>
            <span className="font-bold text-blue-400">{riskCounts.Médio}</span>
          </div>
          <div className="bg-slate-950 px-2 py-1 rounded border border-slate-850 flex items-center justify-between">
            <span className="text-amber-500">Alto Risco:</span>
            <span className="font-bold text-amber-400">{riskCounts.Alto}</span>
          </div>
          <div className="bg-slate-950 px-2 py-1 rounded border border-slate-850 flex items-center justify-between col-span-2 sm:col-span-1">
            <span className="text-red-500">Máximo:</span>
            <span className="font-bold text-red-400">{riskCounts.Máximo}</span>
          </div>
        </div>

      </div>

      {/* 4. RESULTS SECTION: DENSE LIST / CARDS */}
      {filteredInmates.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-full text-slate-500">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm text-slate-300">
              Nenhum recluso localizado
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-1 max-w-md">
              Não foram encontrados registos correspondentes à pesquisa &quot;{searchQuery}&quot; com os filtros selecionados.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition cursor-pointer"
            >
              Limpar Todos os Filtros
            </button>
          )}
        </div>
      ) : viewMode === "dense-table" ? (
        /* DENSE TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[9px] tracking-wider">
                  <th className="p-2.5 font-bold">Recluso / Identificação</th>
                  <th className="p-2.5 font-bold">Nº B.I. / RNR</th>
                  <th className="p-2.5 font-bold">Estabelecimento & Cela</th>
                  <th className="p-2.5 font-bold">Grau de Risco</th>
                  <th className="p-2.5 font-bold">Regime Penal</th>
                  <th className="p-2.5 font-bold">Estado</th>
                  <th className="p-2.5 font-bold text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInmates.map((inm) => {
                  const fullName = `${inm.firstName || ""} ${inm.lastName || ""} ${inm.fullName || ""}`.trim();
                  const rnr = inm.documentCode || inm.id || inm.nrep || "RNR-000";
                  const bi = inm.idCard || inm.biNumber || "N/A";
                  const prisonName = getPrisonName(inm.assignedPrisonId || inm.prisonId);
                  const cell = inm.assignedCellNumber || inm.cellNumber || "Sem Cela";
                  const risk = inm.riskLevel || "Médio";
                  const regime = inm.regime || "Comum";
                  const status = inm.status || "Ativo";

                  return (
                    <tr 
                      key={inm.id}
                      onClick={() => onSelectInmate(inm)}
                      className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      {/* Name & Avatar */}
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-[10px] text-amber-400 shrink-0">
                            {inm.photoUrl ? (
                              <img src={inm.photoUrl} alt="" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
                            ) : (
                              (inm.firstName?.[0] || "R") + (inm.lastName?.[0] || "")
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 group-hover:text-blue-300 transition-colors block text-xs">
                              {fullName}
                            </span>
                            <span className="text-[9px] text-amber-500/90 font-mono">
                              NREP: {rnr}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* BI Number */}
                      <td className="p-2.5 text-slate-300 font-mono">
                        {bi}
                      </td>

                      {/* Prison & Location */}
                      <td className="p-2.5">
                        <span className="text-slate-200 font-semibold block truncate max-w-[170px]">
                          {prisonName}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {inm.pavilionName ? `${inm.pavilionName} • ` : ""}Cela: {cell}
                        </span>
                      </td>

                      {/* Risk Badge */}
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase inline-block ${
                          risk === "Máximo"
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : risk === "Alto"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            : risk === "Médio"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        }`}>
                          {risk}
                        </span>
                      </td>

                      {/* Regime */}
                      <td className="p-2.5 text-slate-300 text-[10px]">
                        {regime}
                      </td>

                      {/* Status */}
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium inline-block ${
                          status.toLowerCase().includes("ativo")
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            : status.toLowerCase().includes("trânsito")
                            ? "text-sky-400 bg-sky-500/10 border border-sky-500/20"
                            : "text-slate-400 bg-slate-800"
                        }`}>
                          {status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onSelectInmate(inm)}
                            className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[9px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                            title="Abrir Dossier Completo"
                          >
                            <FileText className="h-3 w-3" />
                            <span>Dossier</span>
                          </button>

                          {onTransferInmate && (
                            <button
                              type="button"
                              onClick={() => onTransferInmate(inm)}
                              className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-[9px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                              title="Iniciar Transferência / Movimento Penal"
                            >
                              <ArrowLeftRight className="h-3 w-3" />
                              <span className="hidden sm:inline">Mover</span>
                            </button>
                          )}

                          {exportInmateToPDF && (
                            <button
                              type="button"
                              onClick={() => exportInmateToPDF(inm)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[9px] transition cursor-pointer"
                              title="Exportar Ficha Individual em PDF"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DENSE CARDS VIEW (Optimized for Mobile Touch) */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {filteredInmates.map((inm) => {
            const fullName = `${inm.firstName || ""} ${inm.lastName || ""} ${inm.fullName || ""}`.trim();
            const rnr = inm.documentCode || inm.id || inm.nrep || "RNR-000";
            const bi = inm.idCard || inm.biNumber || "N/A";
            const prisonName = getPrisonName(inm.assignedPrisonId || inm.prisonId);
            const cell = inm.assignedCellNumber || inm.cellNumber || "Sem Cela";
            const risk = inm.riskLevel || "Médio";
            const regime = inm.regime || "Comum";
            const status = inm.status || "Ativo";

            return (
              <div
                key={inm.id}
                onClick={() => onSelectInmate(inm)}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-3 flex flex-col gap-2 transition-all cursor-pointer shadow group"
              >
                {/* Card Top: Identity */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0">
                      {inm.photoUrl ? (
                        <img src={inm.photoUrl} alt="" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
                      ) : (
                        (inm.firstName?.[0] || "R") + (inm.lastName?.[0] || "")
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-100 group-hover:text-blue-300 transition-colors truncate">
                        {fullName}
                      </h4>
                      <p className="text-[10px] font-mono text-amber-500 truncate">
                        {rnr} • B.I: {bi}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase shrink-0 ${
                    risk === "Máximo"
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : risk === "Alto"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : risk === "Médio"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  }`}>
                    {risk}
                  </span>
                </div>

                {/* Card Middle: Location & Status Grid */}
                <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-850 font-mono text-[10px]">
                  <div>
                    <span className="text-[8.5px] text-slate-500 uppercase block">Unidade:</span>
                    <span className="text-slate-200 font-semibold truncate block">
                      {prisonName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-500 uppercase block">Cela / Ubicação:</span>
                    <span className="text-amber-400 font-semibold truncate block">
                      {cell}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-500 uppercase block">Regime:</span>
                    <span className="text-slate-300 truncate block">
                      {regime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-500 uppercase block">Situação:</span>
                    <span className="text-emerald-400 font-semibold truncate block">
                      {status}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 font-mono text-[10px]" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onSelectInmate(inm)}
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer py-1"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Ver Dossier</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {onTransferInmate && (
                      <button
                        type="button"
                        onClick={() => onTransferInmate(inm)}
                        className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-[9px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                        <span>Mover</span>
                      </button>
                    )}
                    {exportInmateToPDF && (
                      <button
                        type="button"
                        onClick={() => exportInmateToPDF(inm)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[9px] transition cursor-pointer"
                        title="PDF"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
