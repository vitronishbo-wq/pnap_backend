import React, { useState, useMemo } from "react";
import * as d3 from "d3";
import { ANGOLA_21_PROVINCES_GEOJSON } from "../../assets/maps/angolaProvincesGeoJSON";
import { ANGOLA_PROVINCES_21, AngolaProvinceData } from "../../data/geography/angolaProvinces";
import { Building2, ShieldAlert, Users, Navigation, MapPin, X, Activity } from "lucide-react";

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
  progress: number; // 0 to 100
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

export const AngolaNationalMap: React.FC<AngolaNationalMapProps> = ({
  selectedProvince = null,
  onSelectProvince,
  prisons = [],
  movements = [],
  occurrences = [],
  mapMode = "STATUS",
  showInspectorPanel = true,
  className = "",
  height = 600,
  width = 800
}) => {
  const [hoveredProvCode, setHoveredProvCode] = useState<string | null>(null);

  // 1. Configure D3 Projection for Angola (fit GeoJSON to viewBox)
  const { pathGenerator, projectedFeatures, projection } = useMemo(() => {
    // Create D3 Mercator projection centered on Angola
    const proj = d3.geoMercator();
    
    // Fit the GeoJSON FeatureCollection into the specified SVG canvas dimensions with padding
    proj.fitExtent(
      [
        [30, 25],
        [width - 30, height - 25]
      ],
      ANGOLA_21_PROVINCES_GEOJSON as any
    );

    const pathGen = d3.geoPath().projection(proj);

    const featuresWithPaths = ANGOLA_21_PROVINCES_GEOJSON.features.map((feature) => {
      const svgPath = pathGen(feature as any) || "";
      const centroid = pathGen.centroid(feature as any); // [x, y] center of polygon
      
      const meta = ANGOLA_PROVINCES_21.find(
        p => p.provinceCode === feature.properties.provinceCode || p.name.toLowerCase() === feature.properties.name.toLowerCase()
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
      pathGenerator: pathGen,
      projectedFeatures: featuresWithPaths
    };
  }, [width, height]);

  // 2. Helper to check if a province is selected
  const isSelected = (provNameOrCode: string) => {
    if (!selectedProvince || selectedProvince === "ALL") return false;
    const selLower = selectedProvince.toLowerCase();
    const targetLower = provNameOrCode.toLowerCase();
    return selLower === targetLower || selLower.includes(targetLower) || targetLower.includes(selLower);
  };

  // 3. Operational statistics calculator for selected / hovered province
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
    <div className={`relative w-full h-full flex flex-col items-center justify-center select-none ${className}`}>
      
      {/* MAP SVG CANVAS */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(15,23,42,0.8)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cyber Glow Filters */}
          <filter id="nationalGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="goldSelectedGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients */}
          <linearGradient id="provGradientDefault" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="provGradientHover" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0369a1" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="provGradientSelected" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* 1. MAP BACKGROUND GRID & RADAR RINGS */}
        <g opacity="0.15">
          <circle cx={width / 2} cy={height / 2} r={height * 0.42} stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx={width / 2} cy={height / 2} r={height * 0.28} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
        </g>

        {/* 2. PROVINCE POLYGON MAP LAYER */}
        <g id="angola-provinces-layer">
          {projectedFeatures.map((item) => {
            const selected = isSelected(item.meta.provinceCode) || isSelected(item.meta.name);
            const isHovered = hoveredProvCode === item.meta.provinceCode;
            const opData = getProvinceOperationalData(item.meta);

            // Determine border and fill color based on risk / state
            let strokeColor = "#334155";
            let strokeWidth = "1.2";
            let fillColor = "url(#provGradientDefault)";

            if (selected) {
              strokeColor = "#f59e0b";
              strokeWidth = "2.8";
              fillColor = "url(#provGradientSelected)";
            } else if (isHovered) {
              strokeColor = "#38bdf8";
              strokeWidth = "2.2";
              fillColor = "url(#provGradientHover)";
            } else if (opData.hasCritical) {
              strokeColor = "#f43f5e";
              strokeWidth = "1.8";
            } else if (opData.occupancyRate > 110) {
              strokeColor = "#f59e0b";
              strokeWidth = "1.5";
            }

            return (
              <g
                key={item.meta.provinceCode}
                className="cursor-pointer transition-all duration-200 group"
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
                  filter={selected ? "url(#goldSelectedGlow)" : isHovered ? "url(#nationalGlow)" : undefined}
                  className="transition-all duration-200"
                />

                {/* Pulse ring on critical active alerts */}
                {opData.hasCritical && (
                  <circle
                    cx={item.centroidX}
                    cy={item.centroidY}
                    r="18"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1"
                    className="animate-ping opacity-60 pointer-events-none"
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* 3. PROVINCE LABELS & CENTROID DOTS */}
        <g id="angola-labels-layer" className="pointer-events-none">
          {projectedFeatures.map((item) => {
            const selected = isSelected(item.meta.provinceCode) || isSelected(item.meta.name);
            const isHovered = hoveredProvCode === item.meta.provinceCode;

            return (
              <g key={`label-${item.meta.provinceCode}`} transform={`translate(${item.centroidX}, ${item.centroidY})`}>
                {/* Centroid Dot */}
                <circle
                  r={selected ? "5" : item.meta.isCapital ? "4" : "3"}
                  fill={selected ? "#f59e0b" : isHovered ? "#38bdf8" : item.meta.isCapital ? "#f59e0b" : "#64748b"}
                  stroke="#020617"
                  strokeWidth="1"
                />

                {/* Label Box */}
                <g transform="translate(0, -10)">
                  <rect
                    x={-(item.meta.name.length * 3.5 + 4)}
                    y="-9"
                    width={item.meta.name.length * 7 + 8}
                    height="14"
                    rx="3"
                    fill="#020617"
                    fillOpacity={selected || isHovered ? "0.95" : "0.75"}
                    stroke={selected ? "#f59e0b" : isHovered ? "#38bdf8" : "#1e293b"}
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    fill={selected ? "#f59e0b" : isHovered ? "#ffffff" : item.meta.isCapital ? "#f59e0b" : "#cbd5e1"}
                    fontSize={selected ? "9.5" : "8.5"}
                    fontFamily="monospace"
                    fontWeight={selected || isHovered ? "900" : "600"}
                    letterSpacing="0.3px"
                  >
                    {item.meta.name.toUpperCase()}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* 4. LIVE MOVEMENTS & TRANSIT LINES (IF MOVEMENTS MODE) */}
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
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  />
                  <circle cx={currentX} cy={currentY} r="5" fill="#f59e0b" className="animate-pulse" />
                  <text x={currentX + 7} y={currentY + 3} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    {m.id} ({m.progress}%)
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 5. PRISONS / ESTABLISHMENTS MARKERS */}
        <g id="prisons-layer">
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
                  <circle r={Math.max(12, Math.min(36, occPct / 3))} fill={markerColor} fillOpacity="0.25" className="animate-pulse" />
                )}
                <circle r="6" fill="#020617" stroke={markerColor} strokeWidth="1.8" />
                <circle r="3" fill={markerColor} />
              </g>
            );
          })}
        </g>
      </svg>

      {/* 6. TOUCH / DESKTOP COMPACT CONTEXTUAL OVERLAY PANEL */}
      {showInspectorPanel && activeSelectedFeature && activeSelectedData && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-slate-950/95 border border-amber-500/50 p-3.5 rounded-xl shadow-2xl backdrop-blur-md z-30 animate-fadeIn font-mono text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400 animate-bounce" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 uppercase tracking-wider">
                  {activeSelectedFeature.meta.name}
                </h4>
                <span className="text-[9px] text-slate-400 block font-sans">
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
            <div className="bg-slate-900 border border-slate-850 p-1.5 rounded">
              <span className="text-[8px] text-slate-400 block uppercase">Unidades</span>
              <strong className="text-sm font-black text-amber-400">{activeSelectedData.prisonsCount}</strong>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-1.5 rounded">
              <span className="text-[8px] text-slate-400 block uppercase">Reclusos</span>
              <strong className="text-sm font-black text-slate-100">{activeSelectedData.totalOccupancy}</strong>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-1.5 rounded">
              <span className="text-[8px] text-slate-400 block uppercase">Lotação</span>
              <strong className={`text-sm font-black ${activeSelectedData.occupancyRate > 100 ? "text-rose-400" : "text-emerald-400"}`}>
                {activeSelectedData.occupancyRate}%
              </strong>
            </div>
          </div>

          {activeSelectedData.matchedPrisons.length > 0 ? (
            <div className="mt-2 text-[9.5px] border-t border-slate-850 pt-2 flex flex-col gap-1">
              <span className="text-[8px] text-slate-500 font-bold uppercase">Estabelecimentos Prisionais:</span>
              <div className="max-h-20 overflow-y-auto space-y-1">
                {activeSelectedData.matchedPrisons.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-slate-300 bg-slate-900/60 px-2 py-1 rounded">
                    <span className="truncate">{p.name}</span>
                    <span className="font-bold text-amber-400 shrink-0">{p.currentOccupancy || 0} ecl.</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <span className="text-[9px] text-slate-500 italic block mt-1">
              Sem estabelecimentos prisionais ativos nesta jurisdição.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
