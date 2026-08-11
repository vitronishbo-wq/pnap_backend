import React, { useState, useMemo } from "react";
import * as d3 from "d3";
import { ANGOLA_21_PROVINCES_GEOJSON } from "../../assets/maps/angolaProvincesGeoJSON";
import { ANGOLA_PROVINCES_21, AngolaProvinceData } from "../../data/geography/angolaProvinces";
import { Building2, ShieldAlert, Users, MapPin, X, Layers, Activity, Maximize2 } from "lucide-react";

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

// Label customization for exact positioning and rotation inside vector shapes
const PROVINCE_LABEL_CONFIG: Record<string, { label: string; offset: [number, number]; rotate?: number; fontSize?: number }> = {
  CAB: { label: "CABINDA", offset: [0, 0], rotate: -42, fontSize: 10 },
  ZAI: { label: "ZAIRE", offset: [0, 0], fontSize: 11 },
  UIG: { label: "UÍGE", offset: [0, 0], fontSize: 12 },
  BGO: { label: "BENGO", offset: [-5, -10], fontSize: 10 },
  ICB: { label: "ICOLO E BENGO", offset: [-8, 2], rotate: -48, fontSize: 8.5 },
  LUA: { label: "LUANDA", offset: [-18, -2], fontSize: 9 },
  CNO: { label: "CUANZA-NORTE", offset: [0, 0], rotate: -38, fontSize: 9.5 },
  CSU: { label: "CUANZA-SUL", offset: [0, 0], fontSize: 11 },
  MAL: { label: "MALANJE", offset: [0, 0], fontSize: 12 },
  LNO: { label: "LUNDA-NORTE", offset: [0, -5], fontSize: 11 },
  LSU: { label: "LUNDA-SUL", offset: [0, 0], fontSize: 11 },
  MOX: { label: "MOXICO", offset: [0, -8], fontSize: 12 },
  MXL: { label: "MOXICO LESTE", offset: [0, 0], fontSize: 9.5 },
  BIE: { label: "BIÉ", offset: [0, 0], fontSize: 12 },
  HUA: { label: "HUAMBO", offset: [0, 0], fontSize: 10.5 },
  BEN: { label: "BENGUELA", offset: [0, 0], fontSize: 11 },
  HUI: { label: "HUÍLA", offset: [0, -5], fontSize: 12 },
  NAM: { label: "NAMIBE", offset: [-2, 0], fontSize: 10.5 },
  CUN: { label: "CUNENE", offset: [0, 0], fontSize: 11.5 },
  CCU: { label: "CUBANGO", offset: [0, 0], fontSize: 11 },
  CND: { label: "QUANDO", offset: [0, 0], fontSize: 12 }
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
  const [themeStyle, setThemeStyle] = useState<"VECTOR_ORANGE" | "TACTICAL_DARK">("VECTOR_ORANGE");

  // D3 Projection setup
  const { projectedFeatures, projection } = useMemo(() => {
    const proj = d3.geoMercator();
    
    // Fit the 21 provinces into the SVG canvas with controlled margins
    proj.fitExtent(
      [
        [35, 30],
        [width - 35, height - 30]
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
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full max-h-[640px] object-contain"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
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
                onMouseEnter={() => setHoveredProvCode(item.meta.provinceCode)}
                onMouseLeave={() => setHoveredProvCode(null)}
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

        {/* EMBEDDED PROVINCE TEXT LABELS */}
        <g id="angola-province-labels" className="pointer-events-none">
          {projectedFeatures.map((item) => {
            const selected = isSelected(item.meta.provinceCode) || isSelected(item.meta.name);
            const isHovered = hoveredProvCode === item.meta.provinceCode;

            const code = item.meta.provinceCode;
            const cfg = PROVINCE_LABEL_CONFIG[code] || { label: item.meta.name.toUpperCase(), offset: [0, 0] };
            
            const posX = item.centroidX + cfg.offset[0];
            const posY = item.centroidY + cfg.offset[1];
            const rot = cfg.rotate || 0;
            const size = cfg.fontSize || 11;

            const textColor = themeStyle === "VECTOR_ORANGE"
              ? (selected ? "#020617" : "#ffffff")
              : (selected ? "#f59e0b" : "#e2e8f0");

            return (
              <g
                key={`label-${code}`}
                transform={`translate(${posX}, ${posY}) rotate(${rot})`}
              >
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={textColor}
                  fontSize={selected ? size + 1.5 : size}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="900"
                  letterSpacing="0.4px"
                  className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                >
                  {cfg.label}
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
      </svg>

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
    </div>
  );
};
