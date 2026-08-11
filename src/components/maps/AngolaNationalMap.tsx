import React, { useState, useMemo, useRef } from "react";
import * as d3 from "d3";
import { ANGOLA_21_PROVINCES_GEOJSON } from "../../assets/maps/angolaProvincesGeoJSON";
import { ANGOLA_PROVINCES_21, AngolaProvinceData } from "../../data/geography/angolaProvinces";
import { 
  Building2, 
  ShieldAlert, 
  Users, 
  MapPin, 
  X, 
  Layers, 
  Activity, 
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Crosshair,
  Move,
  Globe,
  Focus
} from "lucide-react";

export interface PrisonMarkerData {
  id: string;
  name: string;
  location?: string;
  provinceCode?: string;
  currentOccupancy?: number;
  capacity?: number;
  lat?: number;
  lng?: number;
}

export interface LiveMovementData {
  id: string;
  inmateName?: string;
  origin: string;
  destination: string;
  status: "DEPARTED" | "EN_ROUTE" | "ARRIVED";
  progress: number;
  originCoords?: { lng: number; lat: number };
  destCoords?: { lng: number; lat: number };
}

export interface OccurrenceData {
  id: string;
  prisonId: string;
  severity: "CRÍTICA" | "MÉDIA" | "LIGEIRA";
  type: string;
  status: "ACTIVE" | "RESOLVING" | "RESOLVED";
}

export interface AngolaNationalMapProps {
  selectedProvince?: string | null;
  onSelectProvince?: (provinceName: string, provinceCode: string) => void;
  prisons?: PrisonMarkerData[];
  movements?: LiveMovementData[];
  occurrences?: OccurrenceData[];
  mapMode?: "STATUS" | "HEATMAP" | "MOVEMENTS";
  showInspectorPanel?: boolean;
  className?: string;
  height?: number;
  width?: number;
}

// Label customization for exact positioning, horizontal text alignment, and leader lines
const PROVINCE_LABEL_CONFIG: Record<string, { label: string; offset: [number, number]; rotate?: number; fontSize?: number; isSmall?: boolean; needsLeader?: boolean }> = {
  CAB: { label: "CABINDA", offset: [-12, -26], fontSize: 9.5, isSmall: true, needsLeader: true },
  ZAI: { label: "ZAIRE", offset: [-10, -20], fontSize: 10, isSmall: true, needsLeader: true },
  UIG: { label: "UÍGE", offset: [0, 0], fontSize: 11 },
  BGO: { label: "BENGO", offset: [-28, -14], fontSize: 9.5, isSmall: true, needsLeader: true },
  ICB: { label: "ICOLO E BENGO", offset: [-32, 14], fontSize: 8.5, isSmall: true, needsLeader: true },
  LUA: { label: "LUANDA", offset: [-35, -8], fontSize: 9, isSmall: true, needsLeader: true },
  CNO: { label: "CUANZA-NORTE", offset: [18, -18], fontSize: 9, isSmall: true, needsLeader: true },
  CSU: { label: "CUANZA-SUL", offset: [0, 0], fontSize: 10.5 },
  MAL: { label: "MALANJE", offset: [0, 0], fontSize: 11 },
  LNO: { label: "LUNDA-NORTE", offset: [0, -5], fontSize: 10.5 },
  LSU: { label: "LUNDA-SUL", offset: [0, 0], fontSize: 10.5 },
  MOX: { label: "MOXICO", offset: [0, -8], fontSize: 11 },
  MXL: { label: "MOXICO LESTE", offset: [0, 0], fontSize: 9 },
  BIE: { label: "BIÉ", offset: [0, 0], fontSize: 11 },
  HUA: { label: "HUAMBO", offset: [0, 0], fontSize: 10 },
  BEN: { label: "BENGUELA", offset: [0, 0], fontSize: 10.5 },
  HUI: { label: "HUÍLA", offset: [0, -5], fontSize: 11 },
  NAM: { label: "NAMIBE", offset: [-2, 0], fontSize: 10 },
  CUN: { label: "CUNENE", offset: [0, 0], fontSize: 10.5 },
  CCU: { label: "CUBANGO", offset: [0, 0], fontSize: 10.5 },
  CND: { label: "QUANDO", offset: [0, 0], fontSize: 10.5 }
};

export const AngolaNationalMap: React.FC<AngolaNationalMapProps> = ({
  selectedProvince = null,
  onSelectProvince,
  prisons = [],
  movements = [],
  occurrences = [],
  mapMode = "STATUS",
  showInspectorPanel = true,
  className = "",
  height = 680,
  width = 750
}) => {
  const [hoveredProvCode, setHoveredProvCode] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [themeStyle, setThemeStyle] = useState<"VECTOR_ORANGE" | "TACTICAL_DARK">("VECTOR_ORANGE");

  // Zoom & Pan interactive state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseGeo, setMouseGeo] = useState<{ lat: number; lng: number } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // D3 Projection setup
  const { projectedFeatures, projection } = useMemo(() => {
    const proj = d3.geoMercator();
    
    // Fit the 21 provinces into the SVG canvas with balanced margins for all 21 provinces + Cabinda enclave
    proj.fitExtent(
      [
        [20, 25],
        [width - 20, height - 25]
      ],
      ANGOLA_21_PROVINCES_GEOJSON as any
    );

    const pathGen = d3.geoPath().projection(proj);

    const featuresWithPaths = ANGOLA_21_PROVINCES_GEOJSON.features.map((feature) => {
      const svgPath = pathGen(feature as any) || "";
      const centroid = pathGen.centroid(feature as any);
      
      const meta = ANGOLA_PROVINCES_21.find(
        p => p.provinceCode.toLowerCase() === feature.properties.provinceCode.toLowerCase() ||
             p.name.toLowerCase() === feature.properties.name.toLowerCase() ||
             feature.id.toLowerCase() === p.provinceCode.toLowerCase()
      );

      return {
        feature,
        svgPath,
        centroidX: centroid[0],
        centroidY: centroid[1],
        meta: meta || {
          provinceCode: feature.properties.provinceCode,
          geometryId: feature.id,
          name: feature.properties.name,
          capital: feature.properties.capital,
          region: feature.properties.region as any,
          isCapital: feature.properties.isCapital,
          centerLng: 0,
          centerLat: 0
        }
      };
    });

    return {
      projection: proj,
      projectedFeatures: featuresWithPaths
    };
  }, [width, height]);

  // Zoom & Pan Helpers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(Number((prev + 0.25).toFixed(2)), 4.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(Number((prev - 0.25).toFixed(2)), 0.6));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleCenterOnSelected = () => {
    if (activeSelectedFeature) {
      const cx = activeSelectedFeature.centroidX;
      const cy = activeSelectedFeature.centroidY;
      const targetScale = 1.8;
      setZoomLevel(targetScale);
      setPanOffset({
        x: width / 2 - cx * targetScale,
        y: height / 2 - cy * targetScale
      });
    } else {
      handleResetView();
    }
  };

  // Mouse Drag & Wheel handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    if (svgRef.current && projection) {
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const rawX = (e.clientX - rect.left) * scaleX;
      const rawY = (e.clientY - rect.top) * scaleY;

      const mapX = (rawX - panOffset.x) / zoomLevel;
      const mapY = (rawY - panOffset.y) / zoomLevel;

      const inverted = projection.invert([mapX, mapY]);
      if (inverted && !isNaN(inverted[0]) && !isNaN(inverted[1])) {
        setMouseGeo({ lng: Number(inverted[0].toFixed(4)), lat: Number(inverted[1].toFixed(4)) });
      }
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(Number((prev + 0.15).toFixed(2)), 4.0));
    } else {
      setZoomLevel(prev => Math.max(Number((prev - 0.15).toFixed(2)), 0.6));
    }
  };

  // Helper: test if province is selected
  const isSelected = (provNameOrCode: string) => {
    if (!selectedProvince || selectedProvince === "ALL") return false;
    const selLower = selectedProvince.toLowerCase();
    const targetLower = provNameOrCode.toLowerCase();
    return selLower === targetLower || selLower.includes(targetLower) || targetLower.includes(selLower);
  };

  // Operational metrics for selected/hovered province
  const getProvinceOperationalData = (provMeta: AngolaProvinceData) => {
    const matchedPrisons = prisons.filter(p => {
      const loc = (p.location || p.provinceCode || p.name || "").toLowerCase();
      const name = provMeta.name.toLowerCase();
      const code = provMeta.provinceCode.toLowerCase();
      const alt = (provMeta.altName || "").toLowerCase();
      return loc.includes(name) || loc.includes(code) || (alt && loc.includes(alt));
    });

    const totalOccupancy = matchedPrisons.reduce((acc, curr) => acc + (curr.currentOccupancy || 0), 0);
    const totalCapacity = matchedPrisons.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

    const prisonIds = matchedPrisons.map(p => p.id);
    const activeAlerts = occurrences.filter(o => prisonIds.includes(o.prisonId) && o.status !== "RESOLVED");
    const hasCritical = activeAlerts.some(o => o.severity === "CRÍTICA");

    return {
      prisonsCount: matchedPrisons.length,
      matchedPrisons,
      totalOccupancy,
      totalCapacity,
      occupancyRate,
      activeAlertsCount: activeAlerts.length,
      hasCritical
    };
  };

  const activeSelectedFeature = useMemo(() => {
    if (!selectedProvince || selectedProvince === "ALL") return null;
    return projectedFeatures.find(f => isSelected(f.meta.provinceCode) || isSelected(f.meta.name));
  }, [selectedProvince, projectedFeatures]);

  const activeSelectedData = useMemo(() => {
    if (!activeSelectedFeature) return null;
    return getProvinceOperationalData(activeSelectedFeature.meta);
  }, [activeSelectedFeature, prisons, occurrences]);

  const handleProvinceClick = (meta: AngolaProvinceData) => {
    if (!onSelectProvince) return;
    if (isSelected(meta.provinceCode) || isSelected(meta.name)) {
      onSelectProvince("ALL", "ALL");
    } else {
      onSelectProvince(meta.name, meta.provinceCode);
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center select-none bg-slate-950 rounded-2xl overflow-hidden border border-slate-900 shadow-2xl ${className}`}>
      
      {/* MAP HEADER / TITLE & THEME TOGGLE HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800/80 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="text-sm font-black tracking-widest text-slate-100 uppercase font-sans">
            ANGOLA <span className="text-amber-500 text-xs font-mono font-normal">| 21 PROVÍNCIAS</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setThemeStyle(themeStyle === "VECTOR_ORANGE" ? "TACTICAL_DARK" : "VECTOR_ORANGE")}
            className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
            title="Alternar estilo visual do mapa"
          >
            <Layers className="h-3 w-3" />
            {themeStyle === "VECTOR_ORANGE" ? "ESTILO VETORIAL" : "ESTILO TÁCTICO"}
          </button>
        </div>
      </div>

      {/* SVG CANVAS */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full max-h-[640px] object-contain cursor-grab active:cursor-grabbing"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="angolaOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="angolaOrangeHover" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="angolaOrangeSelected" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="tacticalDarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Glowing Filters */}
          <filter id="hoverGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="selectedGoldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* BACKGROUND SUBTLE TACTICAL GRID */}
        <g opacity="0.08">
          <pattern id="bgGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
          </pattern>
          <rect width={width} height={height} fill="url(#bgGrid)" />
        </g>

        {/* INTERACTIVE TRANSFORM GROUP (PAN & ZOOM) */}
        <g id="map-zoom-pan-group" transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>

        {/* PROVINCE POLYGONS LAYER */}
        <g id="angola-vector-polygons">
          {projectedFeatures.map((item) => {
            const selected = isSelected(item.meta.provinceCode) || isSelected(item.meta.name);
            const isHovered = hoveredProvCode === item.meta.provinceCode;
            const opData = getProvinceOperationalData(item.meta);

            // Styling variables based on theme
            let fillColor = themeStyle === "VECTOR_ORANGE" ? "url(#angolaOrangeGradient)" : "url(#tacticalDarkGradient)";
            let strokeColor = themeStyle === "VECTOR_ORANGE" ? "#020617" : "#334155";
            let strokeWidth = themeStyle === "VECTOR_ORANGE" ? "3.5" : "1.8";

            if (selected) {
              fillColor = themeStyle === "VECTOR_ORANGE" ? "url(#angolaOrangeSelected)" : "url(#angolaOrangeGradient)";
              strokeColor = "#38bdf8";
              strokeWidth = "4.5";
            } else if (isHovered) {
              fillColor = "url(#angolaOrangeHover)";
              strokeColor = "#ffffff";
              strokeWidth = "4.0";
            } else if (opData.hasCritical) {
              strokeColor = "#f43f5e";
              strokeWidth = "3.8";
            }

            return (
              <g
                key={item.meta.provinceCode}
                className="cursor-pointer transition-all duration-150"
                onClick={() => handleProvinceClick(item.meta)}
                onMouseEnter={(e) => {
                  setHoveredProvCode(item.meta.provinceCode);
                  setTooltipPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) => {
                  setTooltipPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => {
                  setHoveredProvCode(null);
                  setTooltipPos(null);
                }}
              >
                {/* Polygon Shape */}
                <path
                  d={item.svgPath}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  filter={selected ? "url(#selectedGoldGlow)" : isHovered ? "url(#hoverGlow)" : undefined}
                  className="transition-all duration-150"
                />

                {/* Pulse Ring on Critical Alert */}
                {opData.hasCritical && (
                  <circle
                    cx={item.centroidX}
                    cy={item.centroidY}
                    r="22"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    className="animate-ping opacity-75 pointer-events-none"
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* EMBEDDED PROVINCE TEXT LABELS WITH HORIZONTAL CARDS & LEADER LINES */}
        <g id="angola-province-labels" className="pointer-events-none">
          {projectedFeatures.map((item) => {
            const selected = isSelected(item.meta.provinceCode) || isSelected(item.meta.name);
            const isHovered = hoveredProvCode === item.meta.provinceCode;

            const code = item.meta.provinceCode;
            const cfg = PROVINCE_LABEL_CONFIG[code] || { label: item.meta.name.toUpperCase(), offset: [0, 0] };
            
            const origX = item.centroidX;
            const origY = item.centroidY;
            const posX = origX + cfg.offset[0];
            const posY = origY + cfg.offset[1];
            const size = cfg.fontSize || 10.5;
            const hasOffset = cfg.offset[0] !== 0 || cfg.offset[1] !== 0;

            const labelStr = cfg.label;
            const approxCharWidth = size * 0.62;
            const cardWidth = labelStr.length * approxCharWidth + 12;
            const cardHeight = size + 8;

            const bgFill = themeStyle === "VECTOR_ORANGE"
              ? (selected ? "rgba(2, 6, 23, 0.92)" : "rgba(15, 23, 42, 0.82)")
              : (selected ? "rgba(245, 158, 11, 0.9)" : "rgba(2, 6, 23, 0.85)");

            const bgStroke = selected ? "#38bdf8" : (isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.25)");

            const textColor = themeStyle === "VECTOR_ORANGE"
              ? (selected ? "#fbbf24" : "#ffffff")
              : (selected ? "#020617" : "#e2e8f0");

            return (
              <g key={`label-${code}`}>
                {/* Leader line for small/offset provinces */}
                {(hasOffset || cfg.needsLeader) && (
                  <line
                    x1={origX}
                    y1={origY}
                    x2={posX}
                    y2={posY}
                    stroke={themeStyle === "VECTOR_ORANGE" ? "#fef08a" : "#94a3b8"}
                    strokeWidth="1"
                    strokeDasharray="2 3"
                    opacity="0.75"
                  />
                )}

                {/* Label Background Card */}
                <rect
                  x={posX - cardWidth / 2}
                  y={posY - cardHeight / 2}
                  width={cardWidth}
                  height={cardHeight}
                  rx={4}
                  ry={4}
                  fill={bgFill}
                  stroke={bgStroke}
                  strokeWidth="0.8"
                />

                {/* Horizontal Text */}
                <text
                  x={posX}
                  y={posY + 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={textColor}
                  fontSize={selected ? size + 1 : size}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="800"
                  letterSpacing="0.3px"
                >
                  {labelStr}
                </text>
              </g>
            );
          })}
        </g>

        {/* LIVE MOVEMENTS LAYER */}
        {mapMode === "MOVEMENTS" && (
          <g id="movements-layer" className="pointer-events-none">
            {movements.map((m) => {
              if (m.status === "ARRIVED" || !m.originCoords || !m.destCoords) return null;
              
              const pOrigin = projection([m.originCoords.lng, m.originCoords.lat]) || [0, 0];
              const pDest = projection([m.destCoords.lng, m.destCoords.lat]) || [0, 0];

              const currentX = pOrigin[0] + (pDest[0] - pOrigin[0]) * (m.progress / 100);
              const currentY = pOrigin[1] + (pDest[1] - pOrigin[1]) * (m.progress / 100);

              return (
                <g key={m.id}>
                  <line
                    x1={pOrigin[0]}
                    y1={pOrigin[1]}
                    x2={pDest[0]}
                    y2={pDest[1]}
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    opacity="0.9"
                  />
                  <circle cx={currentX} cy={currentY} r="6" fill="#f59e0b" className="animate-pulse" />
                  <text x={currentX + 8} y={currentY + 3} fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {m.id} ({m.progress}%)
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* PRISON / ESTABLISHMENT MARKERS */}
        <g id="prisons-markers-layer">
          {prisons.map((p) => {
            if (!p.lat || !p.lng) return null;
            const pos = projection([p.lng, p.lat]);
            if (!pos) return null;

            const occPct = p.capacity && p.capacity > 0 ? Math.round(((p.currentOccupancy || 0) / p.capacity) * 100) : 0;
            let markerColor = "#10b981";
            if (occPct > 110) markerColor = "#f43f5e";
            else if (occPct > 90) markerColor = "#f59e0b";

            return (
              <g key={p.id} transform={`translate(${pos[0]}, ${pos[1]})`} className="cursor-pointer">
                {mapMode === "HEATMAP" && (
                  <circle r={Math.max(14, Math.min(38, occPct / 2.5))} fill={markerColor} fillOpacity="0.3" className="animate-pulse" />
                )}
                <circle r="6" fill="#020617" stroke={markerColor} strokeWidth="2" />
                <circle r="3" fill={markerColor} />
              </g>
            );
          })}
        </g>

        </g> {/* END MAP PAN & ZOOM TRANSFORM GROUP */}
      </svg>

      {/* FLOATING MAP ADJUSTMENT & ZOOM CONTROLS HUD */}
      <div className="absolute top-14 right-3 z-20 pointer-events-auto flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/80 shadow-2xl">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 transition cursor-pointer flex items-center justify-center"
          title="Aumentar Zoom (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/80 transition cursor-pointer flex items-center justify-center"
          title="Reduzir Zoom (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleCenterOnSelected}
          className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-slate-700/80 transition cursor-pointer flex items-center justify-center"
          title="Focar / Centralizar Província Selecionada"
        >
          <Focus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition cursor-pointer flex items-center justify-center"
          title="Re-centrar / Ajustar Vista Completa"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* COMPASS & REAL-TIME GPS COORDINATES HUD */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 shadow-xl">
        <div className="flex items-center gap-1 text-amber-400 font-bold">
          <Compass className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" />
          <span>N</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <Globe className="h-3 w-3 text-cyan-400 shrink-0" />
          {mouseGeo ? (
            <span className="text-slate-200 font-semibold">
              GPS: <span className="text-cyan-400">{mouseGeo.lat}° S</span>, <span className="text-amber-400">{mouseGeo.lng}° E</span>
            </span>
          ) : (
            <span className="text-slate-500">WGS84: Passe o cursor no mapa</span>
          )}
        </div>
        <div className="h-3 w-[1px] bg-slate-800" />
        <div className="text-slate-400 font-bold">
          Escala: <span className="text-amber-400">{Math.round(zoomLevel * 100)}%</span>
        </div>
      </div>

      {/* INSPECTOR / CONTEXT PANEL */}
      {showInspectorPanel && activeSelectedFeature && activeSelectedData && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-slate-950/95 border border-amber-500/60 p-4 rounded-xl shadow-2xl backdrop-blur-md z-30 font-mono text-left animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400 animate-bounce" />
              <div>
                <h4 className="font-black text-sm text-slate-100 uppercase tracking-wider">
                  {activeSelectedFeature.meta.name}
                </h4>
                <span className="text-[10px] text-slate-400 block font-sans">
                  Cap: {activeSelectedFeature.meta.capital} • {activeSelectedFeature.meta.region}
                </span>
              </div>
            </div>

            {onSelectProvince && (
              <button
                type="button"
                onClick={() => onSelectProvince("ALL", "ALL")}
                className="text-slate-400 hover:text-amber-400 p-1 rounded hover:bg-slate-900 transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center my-2">
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
              <span className="text-[8px] text-slate-400 block uppercase">Unidades</span>
              <strong className="text-sm font-black text-amber-400">{activeSelectedData.prisonsCount}</strong>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
              <span className="text-[8px] text-slate-400 block uppercase">Reclusos</span>
              <strong className="text-sm font-black text-slate-100">{activeSelectedData.totalOccupancy}</strong>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
              <span className="text-[8px] text-slate-400 block uppercase">Lotação</span>
              <strong className={`text-sm font-black ${activeSelectedData.occupancyRate > 100 ? "text-rose-400" : "text-emerald-400"}`}>
                {activeSelectedData.occupancyRate}%
              </strong>
            </div>
          </div>

          {activeSelectedData.matchedPrisons.length > 0 ? (
            <div className="mt-2 text-[10px] border-t border-slate-850 pt-2 flex flex-col gap-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Estabelecimentos Prisionais:</span>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                {activeSelectedData.matchedPrisons.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-slate-300 bg-slate-900 px-2 py-1.5 rounded border border-slate-850">
                    <span className="truncate">{p.name}</span>
                    <span className="font-bold text-amber-400 shrink-0 ml-2">{p.currentOccupancy || 0} ecl.</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 italic block mt-1">
              Sem estabelecimentos prisionais registrados nesta província.
            </span>
          )}
        </div>
      )}

      {/* FLOATING HOVER TOOLTIP */}
      {hoveredProvCode && tooltipPos && (() => {
        const featureItem = projectedFeatures.find(f => f.meta.provinceCode === hoveredProvCode);
        if (!featureItem) return null;
        const op = getProvinceOperationalData(featureItem.meta);
        return (
          <div
            className="fixed z-50 pointer-events-none bg-slate-950/95 border border-amber-500/80 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md font-mono text-left animate-fadeIn"
            style={{
              left: Math.min(tooltipPos.x + 15, window.innerWidth - 220),
              top: Math.max(tooltipPos.y - 70, 20)
            }}
          >
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1 mb-1">
              <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <strong className="text-xs text-slate-100 uppercase tracking-wider font-extrabold">{featureItem.meta.name}</strong>
              <span className="text-[9px] text-slate-400 font-sans">({featureItem.meta.capital})</span>
            </div>
            <div className="text-[10px] text-slate-300 flex flex-col gap-0.5">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">EPs Operacionais:</span>
                <strong className="text-amber-400 font-bold">{op.prisonsCount}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Lotação Total:</span>
                <strong className="text-slate-200">{op.totalOccupancy} / {op.totalCapacity}</strong>
              </div>
              {op.hasCritical && (
                <div className="text-rose-400 text-[9px] font-bold uppercase mt-0.5 animate-pulse">
                  ⚠️ Alerta Crítico Activo
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
