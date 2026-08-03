import React, { useState } from "react";
import { MapPin, Globe, X, Building2, Users, Shield, Sparkles } from "lucide-react";

export interface AngolaHolographicMapBackgroundProps {
  opacityClass?: string;
  selectedProvince?: string;
  onSelectProvince?: (provinceName: string) => void;
  prisons?: Array<{ id?: string; name?: string; location?: string; currentOccupancy?: number; capacity?: number }>;
}

export const AngolaHolographicMapBackground: React.FC<AngolaHolographicMapBackgroundProps> = ({
  opacityClass = "opacity-25",
  selectedProvince = "ALL",
  onSelectProvince,
  prisons = []
}) => {
  const [hoveredProv, setHoveredProv] = useState<string | null>(null);

  // List of all 21 official provinces (Divisão Político-Administrativa 2024) with geographical SVG map coordinates
  const PROVINCES_MAP = [
    { id: "LUA", name: "Luanda", code: "LUA", x: 365, y: 310, isCapital: true, region: "Litoral Norte" },
    { id: "ICB", name: "Icolo e Bengo", code: "ICB", x: 380, y: 320, isCapital: false, region: "Litoral Norte" },
    { id: "HUA", name: "Huambo", code: "HUA", x: 445, y: 450, isCapital: false, region: "Planalto Central" },
    { id: "BEN", name: "Benguela", code: "BGU", x: 380, y: 460, isCapital: false, region: "Litoral Centro" },
    { id: "CAB", name: "Cabinda", code: "CAB", x: 425, y: 140, isCapital: false, region: "Norte Enclave" },
    { id: "BGO", name: "Bengo", code: "BGO", x: 395, y: 300, isCapital: false, region: "Norte" },
    { id: "CNO", name: "Cuanza-Norte", altName: "Cuanza Norte", code: "CNO", x: 440, y: 320, isCapital: false, region: "Norte" },
    { id: "CSU", name: "Cuanza-Sul", altName: "Cuanza Sul", code: "CSU", x: 410, y: 385, isCapital: false, region: "Centro" },
    { id: "MAL", name: "Malanje", code: "MAL", x: 520, y: 300, isCapital: false, region: "Norte Interior" },
    { id: "LNO", name: "Lunda-Norte", altName: "Lunda Norte", code: "LNO", x: 610, y: 250, isCapital: false, region: "Leste" },
    { id: "LSU", name: "Lunda-Sul", altName: "Lunda Sul", code: "LSU", x: 630, y: 330, isCapital: false, region: "Leste" },
    { id: "MOX", name: "Moxico", code: "MOX", x: 620, y: 460, isCapital: false, region: "Leste" },
    { id: "MXL", name: "Moxico Leste", code: "MXL", x: 670, y: 470, isCapital: false, region: "Leste Fronteira" },
    { id: "BIE", name: "Bié", code: "BIE", x: 510, y: 435, isCapital: false, region: "Planalto Central" },
    { id: "HUI", name: "Huíla", code: "HUI", x: 460, y: 540, isCapital: false, region: "Sul" },
    { id: "NAM", name: "Namibe", code: "NAM", x: 370, y: 570, isCapital: false, region: "Sul Litoral" },
    { id: "CUN", name: "Cunene", code: "CNN", x: 450, y: 620, isCapital: false, region: "Sul Fronteira" },
    { id: "CCU", name: "Cubango", altName: "Cuando Cubango", code: "CCU", x: 540, y: 580, isCapital: false, region: "Sudeste" },
    { id: "CND", name: "Cuando", code: "CND", x: 600, y: 600, isCapital: false, region: "Sudeste Fronteira" },
    { id: "UIG", name: "Uíge", code: "UIG", x: 470, y: 240, isCapital: false, region: "Norte" },
    { id: "ZAI", name: "Zaire", code: "ZAI", x: 410, y: 220, isCapital: false, region: "Norte Litoral" }
  ];

  // Helper function to check if a province name matches the selected filter
  const isProvSelected = (provName: string, altName?: string) => {
    if (!selectedProvince || selectedProvince === "ALL") return false;
    const selLower = selectedProvince.toLowerCase();
    const pLower = provName.toLowerCase();
    const altLower = altName ? altName.toLowerCase() : "";
    return (
      selLower.includes(pLower) ||
      pLower.includes(selLower) ||
      (altLower && (selLower.includes(altLower) || altLower.includes(selLower)))
    );
  };

  // Helper to count prisons & capacity per province
  const getProvinceStats = (provName: string, altName?: string) => {
    const matched = prisons.filter(p => {
      if (!p.location) return false;
      const loc = p.location.toLowerCase();
      const pLower = provName.toLowerCase();
      const altLower = altName ? altName.toLowerCase() : "";
      return loc.includes(pLower) || (altLower && loc.includes(altLower));
    });

    const totalInmates = matched.reduce((acc, curr) => acc + (curr.currentOccupancy || 0), 0);
    const totalCapacity = matched.reduce((acc, curr) => acc + (curr.capacity || 0), 0);

    return {
      prisonCount: matched.length,
      totalInmates,
      totalCapacity,
      prisonsList: matched
    };
  };

  const handleProvinceClick = (provName: string) => {
    if (!onSelectProvince) return;
    if (isProvSelected(provName)) {
      onSelectProvince("ALL");
    } else {
      onSelectProvince(provName);
    }
  };

  const isFilterActive = selectedProvince && selectedProvince !== "ALL";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center select-none pointer-events-none"
    >
      {/* 1. FLOATING CONTROL BAR (Interactive Widget) */}
      <div className="absolute top-16 right-6 md:right-12 z-20 pointer-events-auto flex flex-col items-end gap-2">
        <div className="bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 p-2.5 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 hover:border-cyan-400">
          <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Globe className="h-4 w-4 animate-spin-slow" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[8px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> Mapa Holográfico Terrestre
            </span>
            <span className="text-xs font-mono font-black text-slate-100 flex items-center gap-1.5">
              {isFilterActive ? (
                <>
                  <MapPin className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
                  <span className="text-amber-300">Filtro: {selectedProvince}</span>
                </>
              ) : (
                <span className="text-slate-300">Todas as Províncias (Nacional)</span>
              )}
            </span>
          </div>

          {isFilterActive && onSelectProvince && (
            <button
              type="button"
              onClick={() => onSelectProvince("ALL")}
              className="ml-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 p-1.5 rounded-lg transition text-[10px] font-mono flex items-center gap-1 cursor-pointer"
              title="Limpar filtro territorial"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-bold">Limpar</span>
            </button>
          )}
        </div>

        {/* Quick hint badge */}
        <span className="text-[8.5px] font-mono text-cyan-400/80 bg-slate-950/60 px-2.5 py-1 rounded-full border border-cyan-500/20 backdrop-blur-sm">
          💡 Clique nos pontos do mapa para filtrar a jurisdição
        </span>
      </div>

      {/* 2. BACKGROUND VECTOR MAP WITH HOLOGRAPHIC STYLING */}
      <div className={`relative w-full h-full max-w-[1400px] max-h-[900px] flex items-center justify-center ${opacityClass} transition-opacity duration-700`}>
        {/* Radar concentric rings */}
        <div className="absolute w-[680px] h-[680px] rounded-full border border-cyan-500/15 animate-spin-slow pointer-events-none flex items-center justify-center">
          <div className="w-[480px] h-[480px] rounded-full border border-amber-500/10 border-dashed" />
          <div className="w-[280px] h-[280px] rounded-full border border-cyan-400/10" />
        </div>

        {/* SVG Hologram Angola Map Composition */}
        <svg
          viewBox="0 0 1000 800"
          className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(56,189,248,0.25)] pointer-events-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Hologram Glow Filters */}
            <filter id="holoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="goldGlowPin" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradients */}
            <linearGradient id="angolaMapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
            </linearGradient>

            <linearGradient id="meshLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
            </linearGradient>

            {/* Cyber Grid Pattern */}
            <pattern id="angolaHoloGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="0.5" />
              <circle cx="40" cy="0" r="1" fill="rgba(245, 158, 11, 0.25)" />
            </pattern>
          </defs>

          {/* Grid Layer */}
          <rect width="1000" height="800" fill="url(#angolaHoloGrid)" />

          {/* Coordinate Target Reticles */}
          <g stroke="rgba(56, 189, 248, 0.2)" strokeWidth="0.8">
            <line x1="100" y1="400" x2="900" y2="400" strokeDasharray="4,4" />
            <line x1="500" y1="100" x2="500" y2="700" strokeDasharray="4,4" />
            <circle cx="500" cy="400" r="320" stroke="rgba(56,189,248,0.12)" strokeDasharray="8,6" />
            <circle cx="500" cy="400" r="180" stroke="rgba(245,158,11,0.15)" />
          </g>

          {/* Cabinda Enclave (North) */}
          <g filter="url(#holoGlow)">
            <path
              d="M 400 130 L 440 120 L 450 150 L 415 160 Z"
              fill="url(#angolaMapGrad)"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="2,2"
            />
          </g>

          {/* Mainland Angola Silhouette Vector Contour */}
          <g filter="url(#holoGlow)">
            <path
              d="M 390 200 
                 L 460 190 
                 L 530 200 
                 L 640 210 
                 L 710 240 
                 L 750 310 
                 L 730 400 
                 L 740 490 
                 L 690 580 
                 L 620 660 
                 L 540 670 
                 L 460 660 
                 L 380 640 
                 L 340 570 
                 L 310 490 
                 L 325 410 
                 L 330 330 
                 L 350 260 Z"
              fill="url(#angolaMapGrad)"
              stroke="url(#meshLineGrad)"
              strokeWidth="2.5"
            />
          </g>

          {/* Internal Provincial Network Lines */}
          <g stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" strokeDasharray="3,3">
            <line x1="365" y1="310" x2="450" y2="280" />
            <line x1="365" y1="310" x2="420" y2="380" />
            <line x1="365" y1="310" x2="520" y2="300" />
            <line x1="365" y1="310" x2="620" y2="320" stroke="rgba(245, 158, 11, 0.35)" />
            <line x1="420" y1="380" x2="445" y2="450" />
            <line x1="445" y1="450" x2="510" y2="435" />
            <line x1="445" y1="450" x2="380" y2="460" />
            <line x1="445" y1="450" x2="460" y2="540" />
            <line x1="510" y1="435" x2="640" y2="480" />
            <line x1="460" y1="540" x2="570" y2="590" />
            <line x1="460" y1="540" x2="370" y2="570" stroke="rgba(245, 158, 11, 0.35)" />
            <line x1="460" y1="540" x2="450" y2="620" />
          </g>

          {/* Dynamic Laser Connection from Luanda to Currently Selected Province */}
          {(() => {
            if (!isFilterActive) return null;
            const targetProv = PROVINCES_MAP.find(p => isProvSelected(p.name, p.altName));
            if (!targetProv || targetProv.id === "LUA") return null;

            return (
              <g>
                <line
                  x1="365"
                  y1="310"
                  x2={targetProv.x}
                  y2={targetProv.y}
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                  className="animate-pulse"
                />
                <circle cx={targetProv.x} cy={targetProv.y} r="18" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
              </g>
            );
          })()}

          {/* Interactive Holographic Province Nodes */}
          {PROVINCES_MAP.map((node) => {
            const selected = isProvSelected(node.name, node.altName);
            const isHovered = hoveredProv === node.name;
            const stats = getProvinceStats(node.name, node.altName);
            const hasPrisons = stats.prisonCount > 0;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group pointer-events-auto transition-transform duration-200"
                onClick={() => handleProvinceClick(node.name)}
                onMouseEnter={() => setHoveredProv(node.name)}
                onMouseLeave={() => setHoveredProv(null)}
              >
                {/* Outer Ring & Pulse Animation */}
                {(selected || isHovered) && (
                  <circle
                    r={selected ? "22" : "16"}
                    fill="none"
                    stroke={selected ? "#f59e0b" : "#38bdf8"}
                    strokeWidth="1.5"
                    strokeDasharray="3,2"
                    className="animate-spin-slow"
                  />
                )}

                {/* Target Dot Glow */}
                <circle
                  r={selected ? "10" : isHovered ? "8" : node.isCapital ? "7" : "5"}
                  fill={
                    selected
                      ? "rgba(245, 158, 11, 0.3)"
                      : isHovered
                      ? "rgba(56, 189, 248, 0.4)"
                      : hasPrisons
                      ? "rgba(56, 189, 248, 0.2)"
                      : "rgba(148, 163, 184, 0.15)"
                  }
                  filter={selected ? "url(#goldGlowPin)" : "url(#holoGlow)"}
                />

                {/* Core Dot */}
                <circle
                  r={selected ? "5" : node.isCapital ? "4" : "3"}
                  fill={
                    selected
                      ? "#f59e0b"
                      : isHovered
                      ? "#38bdf8"
                      : node.isCapital
                      ? "#f59e0b"
                      : hasPrisons
                      ? "#38bdf8"
                      : "#94a3b8"
                  }
                />

                {/* Center Core White Point */}
                {(selected || node.isCapital) && (
                  <circle r="1.5" fill="#ffffff" />
                )}

                {/* Label Box */}
                <g transform="translate(12, -4)">
                  <rect
                    x="-2"
                    y="-10"
                    width={node.name.length * 7.5 + (selected ? 28 : 10)}
                    height="18"
                    rx="4"
                    fill={selected ? "#020617" : "#0f172a"}
                    fillOpacity={selected ? "0.95" : isHovered ? "0.9" : "0.7"}
                    stroke={selected ? "#f59e0b" : isHovered ? "#38bdf8" : "rgba(56, 189, 248, 0.2)"}
                    strokeWidth={selected ? "1.5" : "0.8"}
                  />
                  
                  <text
                    x="4"
                    y="2"
                    fill={selected ? "#f59e0b" : isHovered ? "#ffffff" : node.isCapital ? "#f59e0b" : "#cbd5e1"}
                    fontSize={selected ? "10" : "9"}
                    fontFamily="monospace"
                    fontWeight={selected || isHovered ? "900" : "600"}
                    letterSpacing="0.5px"
                  >
                    {node.name.toUpperCase()} {selected ? "✓" : ""}
                  </text>
                </g>

                {/* Hover / Selected Info Tooltip Banner */}
                {(isHovered || selected) && (
                  <g transform="translate(12, 18)">
                    <rect
                      x="-2"
                      y="0"
                      width="150"
                      height="38"
                      rx="6"
                      fill="#040711"
                      fillOpacity="0.95"
                      stroke={selected ? "#f59e0b" : "#38bdf8"}
                      strokeWidth="1"
                      filter="url(#holoGlow)"
                    />
                    <text x="6" y="13" fill="#38bdf8" fontSize="8" fontFamily="sans-serif" fontWeight="bold">
                      {node.region.toUpperCase()} • JURISDIÇÃO
                    </text>
                    <text x="6" y="24" fill="#e2e8f0" fontSize="8" fontFamily="monospace">
                      {stats.prisonCount > 0 ? `Unidades: ${stats.prisonCount} | Ocup: ${stats.totalInmates}` : "Sem unidades ativas"}
                    </text>
                    <text x="6" y="33" fill="#f59e0b" fontSize="7" fontFamily="sans-serif">
                      ► Clique para {selected ? "desativar" : "filtrar"} dashboard
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Strategic Watermark Headers */}
          <g transform="translate(80, 720)">
            <text fill="#38bdf8" fontSize="13" fontFamily="monospace" fontWeight="bold" letterSpacing="3px">
              REPÚBLICA DE ANGOLA • MININT - DGSP
            </text>
            <text fill="#64748b" fontSize="10" fontFamily="monospace" y="16" letterSpacing="1px">
              SISTEMA INTEGRADO DE GESTÃO PENITENCIÁRIA (SIGP) • MAPA HOLOGRÁFICO TERRESTRE
            </text>
          </g>

          <g transform="translate(660, 720)">
            <text fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">
              GEO-AO: 12.3789° S, 17.5442° E
            </text>
            <text fill="#475569" fontSize="9" fontFamily="monospace" y="14">
              REDE NACIONAL PENITENCIÁRIA NREP-AO
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
