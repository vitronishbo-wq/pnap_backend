import React, { useState, useMemo } from "react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Building, 
  Users, 
  Download, 
  Grid, 
  BarChart2, 
  Info, 
  MapPin, 
  User, 
  FileText,
  HelpCircle,
  TrendingUp,
  Sliders,
  CheckCircle,
  X
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  Cell as ReCell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from "recharts";
import jsPDF from "jspdf";
import { InmateState } from "../data/schemaData";

interface RiskMapDashboardProps {
  visiblePrisons: any[];
  inmates: InmateState[];
}

export default function RiskMapDashboard({ visiblePrisons, inmates }: RiskMapDashboardProps) {
  // Filters & State
  const [selectedPrisonId, setSelectedPrisonId] = useState<string>("ALL");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [riskWeights, setRiskWeights] = useState({
    Baixo: 1,
    Médio: 2,
    Alto: 4,
    Máximo: 6
  });
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // 1. Get filtered list of prisons based on the active selection
  const activePrisons = useMemo(() => {
    if (selectedPrisonId === "ALL") {
      return visiblePrisons;
    }
    return visiblePrisons.filter(p => p.id === selectedPrisonId);
  }, [visiblePrisons, selectedPrisonId]);

  // 2. Map all blocks/pavilions inside active prisons and collect inmate counts per risk level
  const blockRiskData = useMemo(() => {
    const data: Array<{
      id: string;
      name: string;
      pavId: string;
      pavName: string;
      prisonId: string;
      prisonName: string;
      capacity: number;
      current: number;
      baixoCount: number;
      medioCount: number;
      altoCount: number;
      maximoCount: number;
      totalInmates: number;
      densityScore: number;
      occupancyRate: number;
    }> = [];

    activePrisons.forEach(prison => {
      if (prison.pavilions) {
        prison.pavilions.forEach((pav: any) => {
          if (pav.blocks) {
            pav.blocks.forEach((blk: any) => {
              // Find actual inmates in this block
              const blkInmates = inmates.filter(
                i => i.status === "ACTIVE" &&
                     i.assignedPrisonId === prison.id &&
                     i.assignedBlockId === blk.id
              );

              let baixo = 0;
              let medio = 0;
              let alto = 0;
              let maximo = 0;

              blkInmates.forEach(inm => {
                const r = (inm.riskLevel || "").toLowerCase();
                if (r.includes("baix") || r === "low") baixo++;
                else if (r.includes("méd") || r.includes("med") || r === "medium") medio++;
                else if (r.includes("alt") || r === "high") alto++;
                else if (r.includes("máx") || r.includes("max") || r.includes("seguran") || r.includes("fechad")) maximo++;
                else medio++; // Default safety fall-through
              });

              const totalCount = blkInmates.length;

              // Weighted density formula
              const weightedScore = totalCount > 0 
                ? (baixo * riskWeights.Baixo + medio * riskWeights.Médio + alto * riskWeights.Alto + maximo * riskWeights.Máximo) / totalCount
                : 0;

              data.push({
                id: blk.id,
                name: blk.name,
                pavId: pav.id,
                pavName: pav.name.split(" - ")[0],
                prisonId: prison.id,
                prisonName: prison.name.replace("Estabelecimento Penitenciário de ", "EP "),
                capacity: blk.capacity || 200,
                current: totalCount,
                baixoCount: baixo,
                medioCount: medio,
                altoCount: alto,
                maximoCount: maximo,
                totalInmates: totalCount,
                densityScore: parseFloat(weightedScore.toFixed(2)),
                occupancyRate: blk.capacity > 0 ? Math.round((totalCount / blk.capacity) * 100) : 0
              });
            });
          }
        });
      }
    });

    return data;
  }, [activePrisons, inmates, riskWeights]);

  // 3. Aggregate stats for active filters
  const statsSummary = useMemo(() => {
    let total = 0;
    let baixo = 0;
    let medio = 0;
    let alto = 0;
    let maximo = 0;

    blockRiskData.forEach(blk => {
      total += blk.totalInmates;
      baixo += blk.baixoCount;
      medio += blk.medioCount;
      alto += blk.altoCount;
      maximo += blk.maximoCount;
    });

    const highRiskTotal = alto + maximo;
    const highRiskPct = total > 0 ? Math.round((highRiskTotal / total) * 100) : 0;

    const weightedIndex = total > 0 
      ? (baixo * riskWeights.Baixo + medio * riskWeights.Médio + alto * riskWeights.Alto + maximo * riskWeights.Máximo) / total
      : 0;

    return {
      total,
      baixo,
      medio,
      alto,
      maximo,
      highRiskPct,
      weightedIndex: parseFloat(weightedIndex.toFixed(2))
    };
  }, [blockRiskData, riskWeights]);

  // 4. Inmates lists matching selected block (if any) or full filtered set
  const inmatesForList = useMemo(() => {
    return inmates.filter(i => {
      if (i.status !== "ACTIVE") return false;
      
      // Prison filter
      if (selectedPrisonId !== "ALL" && i.assignedPrisonId !== selectedPrisonId) return false;
      
      // Active Prisons list check (ensure inmate is in visible scope)
      const inVisibleScope = visiblePrisons.some(p => p.id === i.assignedPrisonId);
      if (!inVisibleScope) return false;

      // Block filter
      if (selectedBlockId && i.assignedBlockId !== selectedBlockId) return false;

      // Risk level filter
      if (selectedRiskFilter !== "ALL") {
        const normRisk = (i.riskLevel || "").toLowerCase();
        if (selectedRiskFilter === "Baixo" && !normRisk.includes("baix")) return false;
        if (selectedRiskFilter === "Médio" && !normRisk.includes("méd") && !normRisk.includes("med")) return false;
        if (selectedRiskFilter === "Alto" && !normRisk.includes("alt")) return false;
        if (selectedRiskFilter === "Máximo" && !normRisk.includes("máx") && !normRisk.includes("max")) return false;
      }

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const fullName = `${i.firstName} ${i.lastName}`.toLowerCase();
        const idStr = (i.id || "").toLowerCase();
        const crimeStr = (i.crimeId || "").toLowerCase();
        const cellStr = (i.assignedCellNumber || "").toLowerCase();
        if (!fullName.includes(q) && !idStr.includes(q) && !crimeStr.includes(q) && !cellStr.includes(q)) return false;
      }

      return true;
    });
  }, [inmates, selectedPrisonId, visiblePrisons, selectedBlockId, selectedRiskFilter, searchQuery]);

  // 5. Selected block details
  const selectedBlockDetail = useMemo(() => {
    if (!selectedBlockId) return null;
    return blockRiskData.find(b => b.id === selectedBlockId) || null;
  }, [selectedBlockId, blockRiskData]);

  // Helper to color heatmap cells based on Density Score
  const getDensityColorClass = (score: number) => {
    // Range of weighted score is from riskWeights.Baixo (1) to riskWeights.Máximo (6)
    if (score === 0) return "bg-slate-900 border-slate-800/60 text-slate-500 hover:border-slate-700";
    if (score < 2) return "bg-emerald-950/45 border-emerald-800/55 hover:bg-emerald-900/40 text-emerald-300";
    if (score < 3.2) return "bg-amber-950/45 border-amber-800/55 hover:bg-amber-900/40 text-amber-300";
    if (score < 4.5) return "bg-orange-950/50 border-orange-800/60 hover:bg-orange-900/45 text-orange-300";
    return "bg-rose-950/60 border-rose-800/70 hover:bg-rose-900/50 text-rose-300 animate-pulse-slow";
  };

  const getDensityBadgeColor = (score: number) => {
    if (score === 0) return "text-slate-500 bg-slate-900";
    if (score < 2) return "text-emerald-400 bg-emerald-950/60 border border-emerald-500/20";
    if (score < 3.2) return "text-amber-400 bg-amber-950/60 border border-amber-500/20";
    if (score < 4.5) return "text-orange-400 bg-orange-950/60 border border-orange-500/20";
    return "text-rose-400 bg-rose-950/60 border border-rose-500/20";
  };

  // Recharts structured data
  const chartsData = useMemo(() => {
    return blockRiskData.map(b => ({
      name: `${b.prisonName} - ${b.name}`,
      shortName: b.name,
      prison: b.prisonName,
      "Baixo Risco": b.baixoCount,
      "Médio Risco": b.medioCount,
      "Alto Risco": b.altoCount,
      "Máximo Risco": b.maximoCount,
      "Índice de Risco": b.densityScore,
      "Lotação": b.current,
      "Capacidade": b.capacity
    }));
  }, [blockRiskData]);

  const pieChartData = useMemo(() => {
    return [
      { name: "Baixo Risco", value: statsSummary.baixo, color: "#10b981" },
      { name: "Médio Risco", value: statsSummary.medio, color: "#f59e0b" },
      { name: "Alto Risco", value: statsSummary.alto, color: "#f97316" },
      { name: "Máximo Risco", value: statsSummary.maximo, color: "#f43f5e" }
    ].filter(d => d.value > 0);
  }, [statsSummary]);

  // PDF Export using jsPDF
  const handleExportBlockPDF = () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4"
      });

      // Layout coordinates
      const startX = 15;
      let currentY = 20;

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(245, 158, 11); // amber-500
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.text("MINISTÉRIO DO INTERIOR DE ANGOLA", startX, 15);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text("SISTEMA NACIONAL DE CONTROLO PENITENCIÁRIO - MAPA DE RISCO", startX, 23);
      
      doc.setFont("Helvetica", "oblique");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Documento gerado automaticamente sob protocolo militar secreto. Emitido em: ${new Date().toLocaleString()}`, startX, 31);

      currentY = 50;

      // Metadata Summary
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(startX, currentY, 180, 25, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text("RELATÓRIO DE ANÁLISE DE DENSIDADE E MAPEAMENTO DE RISCO", startX + 5, currentY + 7);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      const prName = selectedPrisonId === "ALL" ? "Todos os Estabelecimentos Ativos" : (activePrisons[0]?.name || "Unidade Selecionada");
      doc.text(`Estabelecimento: ${prName}`, startX + 5, currentY + 13);
      doc.text(`Filtro de Risco: ${selectedRiskFilter}`, startX + 5, currentY + 19);

      // Indicators in header block
      doc.setFont("Helvetica", "bold");
      doc.text(`Total Monitorado: ${statsSummary.total} Reclusos`, startX + 110, currentY + 13);
      doc.text(`Índice de Risco Geral: ${statsSummary.weightedIndex} / 6.00`, startX + 110, currentY + 19);

      currentY += 35;

      // Selected block focus metrics
      if (selectedBlockDetail) {
        doc.setFillColor(254, 243, 199); // amber-100
        doc.setDrawColor(245, 158, 11);
        doc.rect(startX, currentY, 180, 20, "FD");

        doc.setTextColor(146, 64, 14); // amber-800
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`FOCO INTERNO DO BLOCO: ${selectedBlockDetail.name.toUpperCase()} (${selectedBlockDetail.pavName})`, startX + 5, currentY + 6);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text(`Lotação Ativa: ${selectedBlockDetail.current} / ${selectedBlockDetail.capacity} (${selectedBlockDetail.occupancyRate}% Lotação)`, startX + 5, currentY + 13);
        doc.text(`Baixo: ${selectedBlockDetail.baixoCount} | Médio: ${selectedBlockDetail.medioCount} | Alto: ${selectedBlockDetail.altoCount} | Máximo: ${selectedBlockDetail.maximoCount}`, startX + 100, currentY + 13);
        
        currentY += 28;
      }

      // Inmate List Title
      doc.setTextColor(15, 23, 42);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`RECLUSOS ALOCADOS NO ESCOPO DE SELEÇÃO (${inmatesForList.length})`, startX, currentY);
      
      currentY += 6;

      // Table Header
      doc.setFillColor(15, 23, 42);
      doc.rect(startX, currentY, 180, 7, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("Helvetica", "bold");
      doc.text("CÓDIGO ID", startX + 2, currentY + 5);
      doc.text("NOME COMPLETO", startX + 28, currentY + 5);
      doc.text("GRAU DE RISCO", startX + 85, currentY + 5);
      doc.text("CELA ALOCADA", startX + 115, currentY + 5);
      doc.text("CÓDIGO DOC / GUIA", startX + 142, currentY + 5);

      currentY += 7;

      // Table Row
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(15, 23, 42);

      inmatesForList.forEach((inm, index) => {
        // Handle page overflow
        if (currentY > 275) {
          doc.addPage();
          currentY = 20;
          // Re-draw table header on new page
          doc.setFillColor(15, 23, 42);
          doc.rect(startX, currentY, 180, 7, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont("Helvetica", "bold");
          doc.text("CÓDIGO ID", startX + 2, currentY + 5);
          doc.text("NOME COMPLETO", startX + 28, currentY + 5);
          doc.text("GRAU DE RISCO", startX + 85, currentY + 5);
          doc.text("CELA ALOCADA", startX + 115, currentY + 5);
          doc.text("CÓDIGO DOC / GUIA", startX + 142, currentY + 5);
          currentY += 7;
          doc.setFont("Helvetica", "normal");
          doc.setTextColor(15, 23, 42);
        }

        // Zebra striping
        if (index % 2 === 1) {
          doc.setFillColor(241, 245, 249); // slate-100
          doc.rect(startX, currentY, 180, 6.5, "F");
        }

        doc.setFont("Courier", "bold");
        doc.text(inm.id || "N/A", startX + 2, currentY + 4.5);
        doc.setFont("Helvetica", "normal");
        doc.text(`${inm.firstName} ${inm.lastName}`, startX + 28, currentY + 4.5);
        
        // Highlight critical risk levels
        const r = inm.riskLevel || "Baixo";
        if (r === "Máximo" || r === "Alto") {
          doc.setFont("Helvetica", "bold");
        }
        doc.text(r, startX + 85, currentY + 4.5);
        doc.setFont("Helvetica", "normal");

        doc.text(inm.assignedCellNumber || "N/A", startX + 115, currentY + 4.5);
        doc.setFont("Courier", "normal");
        doc.text(inm.documentCode || "N/A", startX + 142, currentY + 4.5);
        
        currentY += 6.5;
      });

      // Signature Block on Last Page
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      currentY += 15;
      doc.setDrawColor(148, 163, 184); // slate-400
      doc.line(startX + 15, currentY, startX + 75, currentY);
      doc.line(startX + 105, currentY, startX + 165, currentY);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text("DIREÇÃO DE SEGURANÇA PENITENCIÁRIA", startX + 18, currentY + 4);
      doc.text("SUPERVISOR GERAL EM EXERCÍCIO", startX + 112, currentY + 4);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("Assinatura e Carimbo Oficial", startX + 31, currentY + 8);
      doc.text("Assinatura Digital Autenticada", startX + 121, currentY + 8);

      // Save PDF
      doc.save(`PNAP_MapaRisk_${selectedPrisonId === "ALL" ? "Nacional" : selectedPrisonId}_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Falha ao exportar relatório PDF. Por favor tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div id="risk-map-dashboard-root" className="flex flex-col gap-6 animate-fadeIn font-sans text-left">
      
      {/* 1. Header Filters Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500 animate-pulse" />
            Mapa Dinâmico de Risco & Densidade de Periculosidade
          </h2>
          <p className="text-xxs text-slate-400 mt-0.5 max-w-2xl leading-normal">
            Visualização de inteligência tática correlacionando o perfil de risco do recluso com a distribuição física por pavilhões e blocos. Ideal para antecipar pontos quentes de tensão.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Prison Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[8px] uppercase tracking-wider font-mono text-slate-500 font-bold">Estabelecimento Alvo:</label>
            <select
              value={selectedPrisonId}
              onChange={(e) => {
                setSelectedPrisonId(e.target.value);
                setSelectedBlockId(null); // Reset block focus on changing prison
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xxs text-slate-300 font-bold font-mono outline-none focus:border-amber-500 transition"
              title="Filtrar por estabelecimento prisional"
            >
              <option value="ALL">🚨 TODOS OS ESTABELECIMENTOS</option>
              {visiblePrisons.map(p => (
                <option key={p.id} value={p.id}>🏢 {p.name.replace("Estabelecimento Penitenciário de ", "EP ")}</option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportBlockPDF}
            disabled={isDownloading}
            className="self-end bg-slate-950 border border-slate-800 text-slate-300 hover:border-amber-500 hover:bg-slate-900 font-mono text-xxs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition cursor-pointer self-end"
            title="Descarregar relatório de inteligência com o mapeamento e a relação de reclusos em PDF"
          >
            <Download className={`h-3.5 w-3.5 text-amber-500 ${isDownloading ? "animate-spin" : ""}`} />
            {isDownloading ? "EXPORTANDO..." : "EXPORTAR PDF"}
          </button>
        </div>
      </div>

      {/* 2. Top Metrics Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-850">
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold leading-none mb-1">Total Sob Controle</span>
            <span className="text-lg font-black font-mono text-slate-200 leading-none">{statsSummary.total}</span>
            <span className="text-[8px] font-sans text-slate-400 block mt-0.5">reclusos ativos</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/40 rounded-lg border border-emerald-900/30">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-emerald-500 block uppercase font-bold leading-none mb-1">Baixo Risco</span>
            <span className="text-lg font-black font-mono text-emerald-400 leading-none">{statsSummary.baixo}</span>
            <span className="text-[8px] font-sans text-slate-400 block mt-0.5">{statsSummary.total > 0 ? Math.round((statsSummary.baixo / statsSummary.total) * 100) : 0}% do efetivo</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/45 rounded-lg border border-amber-900/30">
            <Sliders className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-amber-500 block uppercase font-bold leading-none mb-1">Médio Risco</span>
            <span className="text-lg font-black font-mono text-amber-400 leading-none">{statsSummary.medio}</span>
            <span className="text-[8px] font-sans text-slate-400 block mt-0.5">{statsSummary.total > 0 ? Math.round((statsSummary.medio / statsSummary.total) * 100) : 0}% do efetivo</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-orange-950/45 rounded-lg border border-orange-900/30">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-orange-500 block uppercase font-bold leading-none mb-1">Alto Risco</span>
            <span className="text-lg font-black font-mono text-orange-400 leading-none">{statsSummary.alto}</span>
            <span className="text-[8px] font-sans text-slate-400 block mt-0.5">{statsSummary.total > 0 ? Math.round((statsSummary.alto / statsSummary.total) * 100) : 0}% do efetivo</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 col-span-2 lg:col-span-1">
          <div className="p-2.5 bg-rose-950/40 rounded-lg border border-rose-900/30">
            <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
          </div>
          <div>
            <span className="text-[8px] font-mono text-rose-500 block uppercase font-bold leading-none mb-1">Máximo Risco</span>
            <span className="text-lg font-black font-mono text-rose-400 leading-none">{statsSummary.maximo}</span>
            <span className="text-[8px] font-sans text-slate-400 block mt-0.5">{statsSummary.total > 0 ? Math.round((statsSummary.maximo / statsSummary.total) * 100) : 0}% de alta contenção</span>
          </div>
        </div>
      </div>

      {/* 3. Heatmap Grid & Weight Config Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Heatmap Section */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5">
                  <Grid className="h-4 w-4 text-amber-500" />
                  Mapeamento de Calor: Concentração de Periculosidade
                </h3>
                <p className="text-[9.5px] text-slate-400 mt-0.5">
                  Cada quadrante representa um Bloco Funcional. A intensidade da cor indica a densidade ponderada de risco (inmates de alto/máximo risco). Clique para focar.
                </p>
              </div>

              {/* Reset selection */}
              {selectedBlockId && (
                <button
                  type="button"
                  onClick={() => setSelectedBlockId(null)}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-[9px] font-bold px-2 py-1 rounded cursor-pointer flex items-center gap-1"
                >
                  <X className="h-3 w-3 text-red-400" /> LIMPAR SELEÇÃO
                </button>
              )}
            </div>

            {/* Heatmap Blocks Grid Layout */}
            {blockRiskData.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xxs">
                Nenhum bloco ou pavilhão ativo no escopo selecionado para calcular o mapa de calor.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {blockRiskData.map((blk) => {
                  const isSelected = selectedBlockId === blk.id;
                  const isHovered = hoveredBlockId === blk.id;
                  
                  return (
                    <div
                      key={blk.id}
                      onClick={() => setSelectedBlockId(blk.id === selectedBlockId ? null : blk.id)}
                      onMouseEnter={() => setHoveredBlockId(blk.id)}
                      onMouseLeave={() => setHoveredBlockId(null)}
                      className={`cursor-pointer border p-3 rounded-lg transition-all duration-300 flex flex-col justify-between h-[125px] ${getDensityColorClass(blk.densityScore)} ${
                        isSelected 
                          ? "ring-2 ring-amber-500 border-amber-500 scale-[1.02] shadow-xl shadow-amber-500/5 bg-slate-900" 
                          : isHovered
                          ? "scale-[1.01] border-slate-500"
                          : ""
                      }`}
                    >
                      <div>
                        {/* Block & Pavilion Name */}
                        <div className="flex items-start justify-between gap-1.5 mb-1.5">
                          <div className="truncate text-left">
                            <h4 className="font-extrabold text-xs text-slate-100 truncate leading-tight font-mono">
                              {blk.name}
                            </h4>
                            <span className="text-[8.5px] font-medium text-slate-400 truncate block leading-tight">
                              {blk.pavName} • {blk.prisonName}
                            </span>
                          </div>
                          
                          {/* Weight Indicator Badge */}
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${getDensityBadgeColor(blk.densityScore)}`}>
                            Índice: {blk.densityScore}
                          </span>
                        </div>

                        {/* Inmate Load & Capacity bar */}
                        <div className="flex justify-between items-baseline text-[9.5px] font-mono mb-1">
                          <span className="text-slate-300">Carga: <strong className="text-slate-100 font-bold">{blk.totalInmates}</strong> reclusos</span>
                          <span className={`text-[8.5px] font-bold ${blk.occupancyRate >= 100 ? "text-red-400 animate-pulse" : "text-slate-400"}`}>
                            {blk.occupancyRate}% cap.
                          </span>
                        </div>
                        <div className="w-full bg-slate-950/70 h-1.5 rounded-full overflow-hidden border border-slate-900 mb-2">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              blk.occupancyRate >= 100 ? "bg-red-500" : blk.occupancyRate >= 85 ? "bg-amber-500" : "bg-cyan-500"
                            }`} 
                            style={{ width: `${Math.min(blk.occupancyRate, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Visual segmented breakdown line representing relative risk volume */}
                      <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden w-full bg-slate-950/40">
                        {blk.baixoCount > 0 && <div className="bg-emerald-500 h-full" style={{ flexGrow: blk.baixoCount }} title={`Baixo: ${blk.baixoCount}`} />}
                        {blk.medioCount > 0 && <div className="bg-amber-500 h-full" style={{ flexGrow: blk.medioCount }} title={`Médio: ${blk.medioCount}`} />}
                        {blk.altoCount > 0 && <div className="bg-orange-500 h-full" style={{ flexGrow: blk.altoCount }} title={`Alto: ${blk.altoCount}`} />}
                        {blk.maximoCount > 0 && <div className="bg-rose-500 h-full" style={{ flexGrow: blk.maximoCount }} title={`Máximo: ${blk.maximoCount}`} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Heatmap Legend */}
            <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-slate-500 uppercase font-bold text-[8.5px]">Densidade:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-slate-900 border border-slate-800 rounded-sm" /> 0.00 (Vazio)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-emerald-950/45 border border-emerald-800/55 rounded-sm" /> &lt; 2.00 (Suave)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-amber-950/45 border border-amber-800/55 rounded-sm" /> 2.00 - 3.20 (Moderado)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-orange-950/50 border border-orange-800/60 rounded-sm" /> 3.20 - 4.50 (Preocupante)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-rose-950/60 border border-rose-800/70 rounded-sm" /> &gt; 4.50 (Crítico)
                </span>
              </div>

              <div className="text-[9px] text-slate-400 italic">
                *Cálculo ponderado com pesos ajustáveis
              </div>
            </div>
          </div>
        </div>

        {/* Weighted Score Settings panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1 flex flex-col gap-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <Sliders className="h-4 w-4 text-amber-500" />
              Ajuste de Pesos da Fórmula de Risco
            </h3>
            
            <p className="text-[9.5px] text-slate-400 leading-normal mb-1">
              Modifique a relevância matemática de cada grau de periculosidade para recalcular em tempo real os índices do mapa de calor e identificar vulnerabilidades críticas.
            </p>

            <div className="flex flex-col gap-3.5 bg-slate-950/50 p-3.5 rounded-lg border border-slate-850">
              {/* Baixo Weight */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xxs font-mono">
                  <span className="text-slate-400 font-bold">Peso Baixo Risco:</span>
                  <span className="text-emerald-400 font-black">× {riskWeights.Baixo}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.5}
                  value={riskWeights.Baixo}
                  onChange={(e) => setRiskWeights({ ...riskWeights, Baixo: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Médio Weight */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xxs font-mono">
                  <span className="text-slate-400 font-bold">Peso Médio Risco:</span>
                  <span className="text-amber-400 font-black">× {riskWeights.Médio}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.5}
                  value={riskWeights.Médio}
                  onChange={(e) => setRiskWeights({ ...riskWeights, Médio: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Alto Weight */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xxs font-mono">
                  <span className="text-slate-400 font-bold">Peso Alto Risco:</span>
                  <span className="text-orange-400 font-black">× {riskWeights.Alto}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  step={0.5}
                  value={riskWeights.Alto}
                  onChange={(e) => setRiskWeights({ ...riskWeights, Alto: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Máximo Weight */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xxs font-mono">
                  <span className="text-slate-400 font-bold">Peso Máximo Risco:</span>
                  <span className="text-rose-400 font-black">× {riskWeights.Máximo}</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={12}
                  step={1}
                  value={riskWeights.Máximo}
                  onChange={(e) => setRiskWeights({ ...riskWeights, Máximo: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>

            {/* Selected Block Info Box */}
            {selectedBlockDetail ? (
              <div className="bg-amber-950/25 border border-amber-500/20 rounded-lg p-3 flex flex-col gap-1.5 text-slate-300">
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 font-mono uppercase">
                  <Info className="h-3.5 w-3.5 text-amber-500 shrink-0" /> Bloco em Foco
                </div>
                <p className="text-[10px] font-mono leading-tight">
                  Selecionado: <strong className="text-slate-100 font-black">{selectedBlockDetail.name}</strong> ({selectedBlockDetail.pavName})
                </p>
                <div className="grid grid-cols-2 gap-1 text-[9px] font-mono mt-0.5 border-t border-slate-850 pt-1.5">
                  <div>Lotação: {selectedBlockDetail.current}/{selectedBlockDetail.capacity}</div>
                  <div>Índice: {selectedBlockDetail.densityScore}</div>
                  <div className="col-span-2 text-slate-400">
                    B: {selectedBlockDetail.baixoCount} | M: {selectedBlockDetail.medioCount} | A: {selectedBlockDetail.altoCount} | MX: {selectedBlockDetail.maximoCount}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/40 border border-slate-850 rounded-lg p-4 text-center text-[10px] font-mono text-slate-500 italic flex items-center justify-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-slate-600" />
                Clique em qualquer bloco do mapa de calor para focar métricas e filtrar reclusos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Graphical Visualizations with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart A: Stacked Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4 text-amber-500" />
                Distribuição de Risco por Bloco Operacional
              </h3>
              <p className="text-[9.5px] text-slate-400 mt-0.5">
                Comparativo quantitativo empilhando o volume de reclusos em cada nível de risco de segurança.
              </p>
            </div>
          </div>

          <div className="h-[280px] w-full mt-1">
            {chartsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xxs">
                Dados indisponíveis para gerar gráfico de barras.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartsData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="shortName" 
                    stroke="#64748b" 
                    fontSize={8.5} 
                    fontFamily="monospace"
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={8.5} 
                    fontFamily="monospace"
                  />
                  <ReTooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                    itemStyle={{ color: "#cbd5e1", fontSize: "10.5px" }}
                    labelStyle={{ color: "#f59e0b", fontWeight: "bold", fontSize: "10.5px", fontFamily: "monospace" }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: "9px", fontFamily: "monospace", color: "#94a3b8" }} 
                  />
                  <Bar dataKey="Baixo Risco" stackId="a" fill="#10b981" />
                  <Bar dataKey="Médio Risco" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Alto Risco" stackId="a" fill="#f97316" />
                  <Bar dataKey="Máximo Risco" stackId="a" fill="#f43f5e" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart B: Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                Composição Percentual Geral
              </h3>
              <p className="text-[9.5px] text-slate-400 mt-0.5">
                Proporção consolidada de perigosidade no escopo de visualização ativo.
              </p>
            </div>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center mt-3">
            {pieChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xxs">
                Sem dados de reclusos
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <ReCell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                    itemStyle={{ color: "#cbd5e1", fontSize: "10px" }}
                    labelStyle={{ fontSize: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Custom Pie Legend */}
          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono border-t border-slate-850 pt-3">
            {pieChartData.map((entry) => {
              const pct = statsSummary.total > 0 ? Math.round((entry.value / statsSummary.total) * 100) : 0;
              return (
                <div key={entry.name} className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate">{entry.name}: <strong className="text-slate-200">{entry.value} ({pct}%)</strong></span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Inmate Interactive Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5">
              <User className="h-4 w-4 text-amber-500" />
              Relação Nominal de Reclusos e Enquadramento de Risco
            </h3>
            <p className="text-[9.5px] text-slate-400 mt-0.5">
              Diretório analítico de reclusos filtrados. Clique em qualquer bloco acima para refinar a lista para um pavilhão/bloco isolado.
            </p>
          </div>

          {/* Search & Risk filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar recluso (id, nome, cela, crime)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xxs text-slate-200 outline-none w-full sm:w-[220px] focus:border-amber-500"
              />
            </div>

            {/* Inmate risk filter button cluster */}
            <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 text-[9px] font-mono">
              {["ALL", "Baixo", "Médio", "Alto", "Máximo"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedRiskFilter(lvl)}
                  className={`px-2 py-1 rounded-sm cursor-pointer transition ${
                    selectedRiskFilter === lvl
                      ? "bg-slate-800 text-amber-500 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {lvl === "ALL" ? "TODOS" : lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inmates List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xxs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase pb-2 tracking-wider">
                <th className="pb-3 font-semibold pl-1">Código Recluso</th>
                <th className="pb-3 font-semibold">Nome Completo</th>
                <th className="pb-3 font-semibold">Perfil de Risco</th>
                <th className="pb-3 font-semibold">Pavilhão / Bloco</th>
                <th className="pb-3 font-semibold">Cela Alocada</th>
                <th className="pb-3 font-semibold">Guia Documental</th>
                <th className="pb-3 font-semibold text-right pr-1">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-950">
              {inmatesForList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-mono text-xxs italic">
                    Nenhum recluso corresponde aos critérios de pesquisa e filtros ativos no momento.
                  </td>
                </tr>
              ) : (
                inmatesForList.map((inm) => {
                  const r = inm.riskLevel || "Baixo";
                  let riskBadgeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  if (r.includes("Méd") || r.includes("Med")) riskBadgeColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                  else if (r.includes("Alt")) riskBadgeColor = "bg-orange-500/10 text-orange-400 border border-orange-500/20";
                  else if (r.includes("Máx") || r.includes("Max") || r.includes("Seguran")) riskBadgeColor = "bg-rose-500/10 text-rose-400 border border-rose-500/20";

                  return (
                    <tr key={inm.id} className="hover:bg-slate-950/45 transition">
                      <td className="py-2.5 font-bold text-slate-300 pl-1">{inm.id}</td>
                      <td className="py-2.5 font-sans">
                        <span className="font-semibold text-slate-200 text-xs">{inm.firstName} {inm.lastName}</span>
                        {inm.nickname && <span className="text-[9.5px] text-slate-500 ml-1.5">({inm.nickname})</span>}
                      </td>
                      <td className="py-2.5">
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${riskBadgeColor}`}>
                          {r}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-300">
                        {visiblePrisons.find(p => p.id === inm.assignedPrisonId)?.pavilions?.find(pav => pav.id === inm.assignedPavilionId)?.name?.split(" - ")[0] || "Pavilhão"} - {visiblePrisons.find(p => p.id === inm.assignedPrisonId)?.pavilions?.find(pav => pav.id === inm.assignedPavilionId)?.blocks?.find(b => b.id === inm.assignedBlockId)?.name || "Bloco"}
                      </td>
                      <td className="py-2.5 text-slate-400">{inm.assignedCellNumber || "N/A"}</td>
                      <td className="py-2.5 text-slate-400">{inm.documentCode || "N/A"}</td>
                      <td className="py-2.5 text-right pr-1">
                        <div className="flex justify-end gap-1">
                          <span className="text-[10px] text-slate-500 italic">Ativo no Sistema</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer count summary */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1 border-t border-slate-800 pt-3">
          <span>Apresentando <strong>{inmatesForList.length}</strong> de <strong>{statsSummary.total}</strong> reclusos filtrados</span>
          {selectedBlockId && (
            <span className="text-amber-500">
              *Exibindo reclusos com foco apenas no bloco ativo.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
