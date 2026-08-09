import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Server,
  Zap,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Download,
  Flame,
  Radio,
  Sliders,
  Maximize2,
  ShieldAlert,
  Info,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";

export interface ClusterNodeHealth {
  id: string;
  name: string;
  location: string;
  type: "cloud-primary" | "cloud-secondary" | "local-onpremise" | "local-hybrid";
  status: "online" | "offline" | "syncing" | "degraded";
  cpuUsage: number; // 0-100%
  memoryUsage: number; // 0-100%
  latencyMs: number;
  qps: number;
  replicaLagMb: number;
  connections: number;
  maxConnections: number;
  diskIoPercent: number;
}

export interface MetricDataPoint {
  timestamp: Date;
  nodeId: string;
  cpu: number;
  memory: number;
  latency: number;
  qps: number;
  lagMb: number;
}

interface D3NodeHealthDashboardProps {
  heartbeats?: Record<string, { lastSeen: Date; latency: number; history: number[]; packetLoss: number }>;
  isLuandaFailed?: boolean;
  promotedMasterId?: string | null;
  trafficDistribution?: Array<{ id: string; qps: number; percentage: number; conns: number }>;
  onTriggerSpike?: (nodeId: string) => void;
  onToggleFailure?: () => void;
  onManualFailover?: (targetNodeId: string) => void;
  onResetFailover?: () => void;
}

export default function D3NodeHealthDashboard({
  heartbeats,
  isLuandaFailed = false,
  promotedMasterId = null,
  trafficDistribution,
  onTriggerSpike,
  onToggleFailure,
  onManualFailover,
  onResetFailover
}: D3NodeHealthDashboardProps) {
  // 1. Live State & Stream Control
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("cloud-primary");
  const [selectedMetric, setSelectedMetric] = useState<"cpu" | "memory" | "latency" | "qps" | "lagMb">("cpu");
  const [timeWindowSec, setTimeWindowSec] = useState<number>(30); // 30s buffer
  const [stressNodeId, setStressNodeId] = useState<string | null>(null);

  // Live Nodes Metrics State
  const [nodes, setNodes] = useState<ClusterNodeHealth[]>([
    {
      id: "cloud-primary",
      name: "Luanda Central",
      location: "Luanda (Sede MININT)",
      type: "cloud-primary",
      status: isLuandaFailed ? "offline" : "online",
      cpuUsage: 42,
      memoryUsage: 68,
      latencyMs: heartbeats?.["cloud-primary"]?.latency || 12,
      qps: trafficDistribution?.find(t => t.id === "cloud-primary")?.qps || 180,
      replicaLagMb: 0,
      connections: trafficDistribution?.find(t => t.id === "cloud-primary")?.conns || 85,
      maxConnections: 500,
      diskIoPercent: 35
    },
    {
      id: "cloud-secondary",
      name: "Benguela Backup (DR)",
      location: "Benguela (Sítio Secundário)",
      type: "cloud-secondary",
      status: "online",
      cpuUsage: 28,
      memoryUsage: 45,
      latencyMs: heartbeats?.["cloud-secondary"]?.latency || 22,
      qps: trafficDistribution?.find(t => t.id === "cloud-secondary")?.qps || 95,
      replicaLagMb: 0.1,
      connections: trafficDistribution?.find(t => t.id === "cloud-secondary")?.conns || 42,
      maxConnections: 300,
      diskIoPercent: 22
    },
    {
      id: "local-onpremise",
      name: "Huambo EP",
      location: "Huambo (Comando Provincial)",
      type: "local-onpremise",
      status: "online",
      cpuUsage: 19,
      memoryUsage: 38,
      latencyMs: heartbeats?.["local-onpremise"]?.latency || 5,
      qps: trafficDistribution?.find(t => t.id === "local-onpremise")?.qps || 45,
      replicaLagMb: 0.8,
      connections: trafficDistribution?.find(t => t.id === "local-onpremise")?.conns || 15,
      maxConnections: 150,
      diskIoPercent: 14
    },
    {
      id: "local-hybrid",
      name: "Viana Móvel Edge",
      location: "Viana (Unidade Híbrida)",
      type: "local-hybrid",
      status: "online",
      cpuUsage: 55,
      memoryUsage: 74,
      latencyMs: heartbeats?.["local-hybrid"]?.latency || 38,
      qps: trafficDistribution?.find(t => t.id === "local-hybrid")?.qps || 25,
      replicaLagMb: 2.4,
      connections: trafficDistribution?.find(t => t.id === "local-hybrid")?.conns || 8,
      maxConnections: 100,
      diskIoPercent: 48
    }
  ]);

  // Historical time-series memory buffer for D3 chart
  const [metricHistory, setMetricHistory] = useState<MetricDataPoint[]>(() => {
    const initial: MetricDataPoint[] = [];
    const now = Date.now();
    const nodeIds = ["cloud-primary", "cloud-secondary", "local-onpremise", "local-hybrid"];
    // Pre-populate 20 points
    for (let i = 20; i >= 0; i--) {
      const ts = new Date(now - i * 1000);
      nodeIds.forEach(id => {
        let baseCpu = id === "cloud-primary" ? 40 : id === "local-hybrid" ? 55 : 25;
        let baseMem = id === "cloud-primary" ? 65 : 40;
        let baseLat = id === "cloud-primary" ? 12 : id === "cloud-secondary" ? 22 : id === "local-onpremise" ? 5 : 38;
        initial.push({
          timestamp: ts,
          nodeId: id,
          cpu: Math.min(100, Math.max(5, baseCpu + (Math.random() * 12 - 6))),
          memory: Math.min(100, Math.max(10, baseMem + (Math.random() * 6 - 3))),
          latency: Math.max(1, baseLat + (Math.random() * 6 - 3)),
          qps: Math.floor(Math.random() * 50 + 20),
          lagMb: Math.max(0, Number((Math.random() * 1.5).toFixed(2)))
        });
      });
    }
    return initial;
  });

  // SVG Chart Container Refs
  const timeSeriesRef = useRef<SVGSVGElement | null>(null);
  const topologyRef = useRef<SVGSVGElement | null>(null);
  const gaugeRef = useRef<SVGSVGElement | null>(null);
  const barChartRef = useRef<SVGSVGElement | null>(null);

  // Container sizing state for responsive D3 redraws
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const timeSeriesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!timeSeriesContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(timeSeriesContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync external props (heartbeats, failure status) with live node state
  useEffect(() => {
    setNodes(prev =>
      prev.map(node => {
        const hb = heartbeats?.[node.id];
        const traffic = trafficDistribution?.find(t => t.id === node.id);
        const isOffline = node.id === "cloud-primary" && isLuandaFailed;
        const isPromotedMaster = node.id === promotedMasterId;

        let status: ClusterNodeHealth["status"] = "online";
        if (isOffline) status = "offline";
        else if (hb && hb.latency > 140) status = "degraded";
        else if (hb && hb.packetLoss > 2) status = "syncing";

        // Dynamic fluctuations or stress injections
        const isStressed = stressNodeId === node.id;
        const targetCpu = isOffline
          ? 0
          : isStressed
          ? Math.min(99, node.cpuUsage + Math.floor(Math.random() * 15) + 20)
          : Math.min(98, Math.max(12, (node.cpuUsage + (Math.random() * 8 - 4))));

        const targetMem = isOffline
          ? 0
          : isStressed
          ? Math.min(96, node.memoryUsage + Math.floor(Math.random() * 10) + 10)
          : Math.min(95, Math.max(20, (node.memoryUsage + (Math.random() * 4 - 2))));

        const lat = isOffline ? 9999 : hb ? hb.latency : node.latencyMs;

        return {
          ...node,
          status,
          cpuUsage: Math.round(targetCpu),
          memoryUsage: Math.round(targetMem),
          latencyMs: lat,
          qps: isOffline ? 0 : traffic?.qps || node.qps,
          connections: isOffline ? 0 : traffic?.conns || node.connections,
          diskIoPercent: isOffline ? 0 : Math.round(Math.min(99, Math.max(5, targetCpu * 0.7 + Math.random() * 10)))
        };
      })
    );
  }, [heartbeats, isLuandaFailed, promotedMasterId, trafficDistribution, stressNodeId]);

  // Periodic heartbeat loop for streaming time series history
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const now = new Date();
      setMetricHistory(prev => {
        const nextPoints: MetricDataPoint[] = nodes.map(node => ({
          timestamp: now,
          nodeId: node.id,
          cpu: node.cpuUsage,
          memory: node.memoryUsage,
          latency: node.latencyMs > 9000 ? 0 : node.latencyMs,
          qps: node.qps,
          lagMb: node.replicaLagMb
        }));

        const cutoff = new Date(now.getTime() - timeWindowSec * 1000);
        const filtered = prev.filter(p => p.timestamp >= cutoff);
        return [...filtered, ...nextPoints];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, nodes, timeWindowSec]);

  // Overall Cluster Health Index Score (0 - 100%)
  const overallHealthScore = useMemo(() => {
    const activeNodes = nodes.filter(n => n.status !== "offline");
    if (activeNodes.length === 0) return 0;

    let score = 100;

    // Deduct for offline primary
    if (isLuandaFailed) score -= 30;

    // Deduct for average high CPU
    const avgCpu = activeNodes.reduce((acc, n) => acc + n.cpuUsage, 0) / activeNodes.length;
    if (avgCpu > 80) score -= 20;
    else if (avgCpu > 60) score -= 10;

    // Deduct for latency > 100ms
    const avgLat = activeNodes.reduce((acc, n) => acc + (n.latencyMs > 9000 ? 200 : n.latencyMs), 0) / activeNodes.length;
    if (avgLat > 150) score -= 25;
    else if (avgLat > 80) score -= 12;

    // Deduct for degraded status nodes
    const degradedCount = nodes.filter(n => n.status === "degraded").length;
    score -= degradedCount * 15;

    return Math.max(0, Math.min(100, Math.round(score)));
  }, [nodes, isLuandaFailed]);

  // --- D3 CHART 1: REAL-TIME TIME-SERIES LINE & AREA CHART ---
  useEffect(() => {
    if (!timeSeriesRef.current || metricHistory.length === 0) return;

    const svg = d3.select(timeSeriesRef.current);
    svg.selectAll("*").remove();

    const width = Math.max(300, containerWidth);
    const height = 260;
    const margin = { top: 25, right: 120, bottom: 30, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Color scale for nodes
    const nodeColors: Record<string, string> = {
      "cloud-primary": "#f59e0b", // Amber
      "cloud-secondary": "#38bdf8", // Sky
      "local-onpremise": "#10b981", // Emerald
      "local-hybrid": "#c084fc" // Purple
    };

    // Filter points to selected metric or all nodes
    const xExtent = d3.extent(metricHistory, d => d.timestamp) as [Date, Date];
    const xScale = d3
      .scaleTime()
      .domain(xExtent[0] && xExtent[1] ? xExtent : [new Date(Date.now() - 30000), new Date()])
      .range([0, innerWidth]);

    let yMax = 100;
    if (selectedMetric === "latency") {
      const maxLat = d3.max(metricHistory, d => d.latency) || 50;
      yMax = Math.max(100, Math.min(500, maxLat * 1.2));
    } else if (selectedMetric === "qps") {
      const maxQps = d3.max(metricHistory, d => d.qps) || 100;
      yMax = Math.max(50, maxQps * 1.25);
    } else if (selectedMetric === "lagMb") {
      const maxLag = d3.max(metricHistory, d => d.lagMb) || 5;
      yMax = Math.max(5, maxLag * 1.3);
    }

    const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]);

    // Gridlines
    const yGrid = d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => "");
    g.append("g")
      .attr("class", "grid")
      .call(yGrid)
      .selectAll("line")
      .attr("stroke", "#1e293b")
      .attr("stroke-dasharray", "3,3");

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => d3.timeFormat("%H:%M:%S")(d as Date));

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "#64748b")
      .attr("font-size", "10px")
      .attr("font-family", "monospace");

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => {
        if (selectedMetric === "cpu" || selectedMetric === "memory") return `${d}%`;
        if (selectedMetric === "latency") return `${d}ms`;
        if (selectedMetric === "qps") return `${d} QPS`;
        return `${d}MB`;
      });

    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "#64748b")
      .attr("font-size", "10px")
      .attr("font-family", "monospace");

    // Line generator
    const lineGenerator = d3
      .line<MetricDataPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d[selectedMetric]))
      .curve(d3.curveMonotoneX);

    // Area generator for selected node
    const areaGenerator = d3
      .area<MetricDataPoint>()
      .x(d => xScale(d.timestamp))
      .y0(innerHeight)
      .y1(d => yScale(d[selectedMetric]))
      .curve(d3.curveMonotoneX);

    // Define gradients for area fill
    const defs = svg.append("defs");
    Object.entries(nodeColors).forEach(([id, color]) => {
      const grad = defs
        .append("linearGradient")
        .attr("id", `area-grad-${id}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      grad.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.35);
      grad.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0.0);
    });

    // Group history by node
    const nodeIds = ["cloud-primary", "cloud-secondary", "local-onpremise", "local-hybrid"];
    nodeIds.forEach(id => {
      const nodeData = metricHistory.filter(d => d.nodeId === id);
      if (nodeData.length < 2) return;

      const color = nodeColors[id] || "#ffffff";
      const isSelected = selectedNodeId === id;

      // Draw Area if selected
      if (isSelected) {
        g.append("path")
          .datum(nodeData)
          .attr("fill", `url(#area-grad-${id})`)
          .attr("d", areaGenerator);
      }

      // Draw Path line
      const path = g
        .append("path")
        .datum(nodeData)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", isSelected ? 2.8 : 1.2)
        .attr("stroke-opacity", isSelected ? 1 : 0.45)
        .attr("d", lineGenerator);

      // Add endpoint circle marker
      const lastPt = nodeData[nodeData.length - 1];
      if (lastPt) {
        g.append("circle")
          .attr("cx", xScale(lastPt.timestamp))
          .attr("cy", yScale(lastPt[selectedMetric]))
          .attr("r", isSelected ? 4.5 : 2.5)
          .attr("fill", color)
          .attr("stroke", "#030712")
          .attr("stroke-width", 1.5);
      }
    });

    // Chart Legend in D3
    const legendG = g.append("g").attr("transform", `translate(${innerWidth + 15}, 10)`);

    nodeIds.forEach((id, idx) => {
      const n = nodes.find(item => item.id === id);
      const color = nodeColors[id];
      const isSel = selectedNodeId === id;

      const itemG = legendG
        .append("g")
        .attr("transform", `translate(0, ${idx * 22})`)
        .attr("class", "cursor-pointer")
        .on("click", () => setSelectedNodeId(id));

      itemG
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 3)
        .attr("fill", color)
        .attr("opacity", isSel ? 1 : 0.5);

      itemG
        .append("text")
        .attr("x", 18)
        .attr("y", 10)
        .attr("fill", isSel ? "#f8fafc" : "#94a3b8")
        .attr("font-size", "10px")
        .attr("font-weight", isSel ? "bold" : "normal")
        .attr("font-family", "sans-serif")
        .text(n ? n.name : id);
    });
  }, [metricHistory, selectedMetric, selectedNodeId, containerWidth, nodes]);

  // --- D3 CHART 2: RADIAL HEALTH INDEX GAUGE (D3 ARC) ---
  useEffect(() => {
    if (!gaugeRef.current) return;

    const svg = d3.select(gaugeRef.current);
    svg.selectAll("*").remove();

    const width = 180;
    const height = 180;
    const radius = Math.min(width, height) / 2 - 10;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Arc configuration
    const arcBg = d3
      .arc()
      .innerRadius(radius - 14)
      .outerRadius(radius)
      .startAngle(-Math.PI * 0.75)
      .endAngle(Math.PI * 0.75)
      .cornerRadius(6);

    const healthAngle = -Math.PI * 0.75 + (overallHealthScore / 100) * (Math.PI * 1.5);

    const arcFg = d3
      .arc()
      .innerRadius(radius - 14)
      .outerRadius(radius)
      .startAngle(-Math.PI * 0.75)
      .endAngle(healthAngle)
      .cornerRadius(6);

    // Background track
    g.append("path").attr("d", arcBg as any).attr("fill", "#1e293b");

    // Dynamic gradient color depending on health score
    let strokeColor = "#10b981"; // Emerald
    if (overallHealthScore < 50) strokeColor = "#ef4444"; // Red
    else if (overallHealthScore < 80) strokeColor = "#f59e0b"; // Amber

    // Foreground arc
    g.append("path").attr("d", arcFg as any).attr("fill", strokeColor);

    // Center Text Score
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.1em")
      .attr("fill", "#f8fafc")
      .attr("font-size", "28px")
      .attr("font-weight", "900")
      .attr("font-family", "monospace")
      .text(`${overallHealthScore}%`);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.6em")
      .attr("fill", "#94a3b8")
      .attr("font-size", "9px")
      .attr("font-weight", "bold")
      .attr("letter-spacing", "1px")
      .text("ÍNDICE DE SAÚDE");
  }, [overallHealthScore]);

  // --- D3 CHART 3: TOPOLOGY FORCE NETWORK GRAPH ---
  useEffect(() => {
    if (!topologyRef.current) return;

    const svg = d3.select(topologyRef.current);
    svg.selectAll("*").remove();

    const width = 460;
    const height = 280;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g");

    // Nodes definition
    interface TopologyNode extends d3.SimulationNodeDatum {
      id: string;
      name: string;
      type: string;
      status: string;
      ip: string;
      latency: number;
    }

    interface TopologyLink extends d3.SimulationLinkDatum<TopologyNode> {
      source: string | TopologyNode;
      target: string | TopologyNode;
      bandwidth: string;
    }

    const topoNodes: TopologyNode[] = nodes.map(n => ({
      id: n.id,
      name: n.name,
      type: n.type,
      status: n.status,
      ip: n.id === "cloud-primary" ? "10.224.0.10" : n.id === "cloud-secondary" ? "10.224.2.15" : n.id === "local-onpremise" ? "192.168.42.10" : "192.168.50.8",
      latency: n.latencyMs
    }));

    const topoLinks: TopologyLink[] = [
      { source: "cloud-primary", target: "cloud-secondary", bandwidth: "10 Gbps Fibra" },
      { source: "cloud-primary", target: "local-onpremise", bandwidth: "1 Gbps MPLS" },
      { source: "cloud-primary", target: "local-hybrid", bandwidth: "500 Mbps VSAT" },
      { source: "cloud-secondary", target: "local-onpremise", bandwidth: "Failover Link" }
    ];

    // Force Simulation Setup
    const simulation = d3
      .forceSimulation<TopologyNode>(topoNodes)
      .force("link", d3.forceLink<TopologyNode, TopologyLink>(topoLinks).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(45));

    // Links lines
    const link = g
      .append("g")
      .selectAll("line")
      .data(topoLinks)
      .enter()
      .append("line")
      .attr("stroke", d => {
        const srcId = typeof d.source === "object" ? d.source.id : d.source;
        if (srcId === "cloud-primary" && isLuandaFailed) return "#ef4444";
        return "#334155";
      })
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", d => (d.bandwidth.includes("VSAT") ? "4,4" : "none"));

    // Drag behavior
    const drag = d3
      .drag<SVGGElement, TopologyNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // Nodes SVG groups
    const nodeGroup = g
      .append("g")
      .selectAll("g")
      .data(topoNodes)
      .enter()
      .append("g")
      .attr("class", "cursor-pointer")
      .call(drag as any)
      .on("click", (event, d) => {
        setSelectedNodeId(d.id);
      });

    // Outer status pulse circle
    nodeGroup
      .append("circle")
      .attr("r", d => {
        const activeMaster = isLuandaFailed ? promotedMasterId : "cloud-primary";
        return d.id === activeMaster ? 26 : 22;
      })
      .attr("fill", d => {
        if (d.status === "offline") return "#450a0a";
        if (d.status === "degraded") return "#451a03";
        const activeMaster = isLuandaFailed ? promotedMasterId : "cloud-primary";
        return d.id === activeMaster ? "#422006" : "#022c22";
      })
      .attr("stroke", d => {
        if (d.status === "offline") return "#ef4444";
        if (d.status === "degraded") return "#f59e0b";
        const activeMaster = isLuandaFailed ? promotedMasterId : "cloud-primary";
        return d.id === activeMaster ? "#f59e0b" : "#10b981";
      })
      .attr("stroke-width", d => {
        const activeMaster = isLuandaFailed ? promotedMasterId : "cloud-primary";
        if (d.id === activeMaster) return 3.5;
        return selectedNodeId === d.id ? 3 : 1.5;
      })
      .attr("stroke-dasharray", d => (selectedNodeId === d.id ? "3,3" : "none"));

    // Master / Failover Badge Above Node
    nodeGroup.each(function(d) {
      const gNode = d3.select(this);
      const activeMaster = isLuandaFailed ? promotedMasterId : "cloud-primary";
      const isMaster = d.id === activeMaster;

      if (isMaster) {
        const badgeG = gNode.append("g").attr("transform", "translate(0, -30)");
        badgeG.append("rect")
          .attr("x", -32)
          .attr("y", -8)
          .attr("width", 64)
          .attr("height", 14)
          .attr("rx", 3)
          .attr("fill", isLuandaFailed ? "#f59e0b" : "#10b981")
          .attr("stroke", "#030712")
          .attr("stroke-width", 1);

        badgeG.append("text")
          .attr("x", 0)
          .attr("y", 2)
          .attr("text-anchor", "middle")
          .attr("fill", "#030712")
          .attr("font-size", "7.5px")
          .attr("font-weight", "900")
          .attr("font-family", "monospace")
          .text(isLuandaFailed ? "VIP PROMOVIDO" : "WRITE MASTER");
      } else if (d.status === "offline") {
        const badgeG = gNode.append("g").attr("transform", "translate(0, -30)");
        badgeG.append("rect")
          .attr("x", -28)
          .attr("y", -8)
          .attr("width", 56)
          .attr("height", 14)
          .attr("rx", 3)
          .attr("fill", "#ef4444")
          .attr("stroke", "#030712")
          .attr("stroke-width", 1);

        badgeG.append("text")
          .attr("x", 0)
          .attr("y", 2)
          .attr("text-anchor", "middle")
          .attr("fill", "#ffffff")
          .attr("font-size", "7.5px")
          .attr("font-weight", "900")
          .attr("font-family", "monospace")
          .text("OFFLINE");
      }
    });

    // Inner core circle
    nodeGroup
      .append("circle")
      .attr("r", 12)
      .attr("fill", d => {
        if (d.id === "cloud-primary") return "#f59e0b";
        if (d.id === "cloud-secondary") return "#38bdf8";
        if (d.id === "local-onpremise") return "#10b981";
        return "#c084fc";
      });

    // Label below node
    nodeGroup
      .append("text")
      .attr("dy", 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#f8fafc")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(d => d.name);

    // IP / Latency text
    nodeGroup
      .append("text")
      .attr("dy", 47)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-size", "8px")
      .attr("font-family", "monospace")
      .text(d => (d.status === "offline" ? "OFFLINE" : `${d.latency}ms`));

    // Simulation tick update
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as TopologyNode).x || 0)
        .attr("y1", d => (d.source as TopologyNode).y || 0)
        .attr("x2", d => (d.target as TopologyNode).x || 0)
        .attr("y2", d => (d.target as TopologyNode).y || 0);

      nodeGroup.attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, selectedNodeId, isLuandaFailed]);

  // --- D3 CHART 4: NODE RESOURCE COMPARISON BAR CHART ---
  useEffect(() => {
    if (!barChartRef.current) return;

    const svg = d3.select(barChartRef.current);
    svg.selectAll("*").remove();

    const width = 420;
    const height = 180;
    const margin = { top: 20, right: 20, bottom: 35, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const yScale = d3
      .scaleBand()
      .domain(nodes.map(n => n.name))
      .range([0, innerHeight])
      .padding(0.25);

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "10px")
      .attr("font-weight", "500");

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}%`))
      .selectAll("text")
      .attr("fill", "#64748b")
      .attr("font-size", "9px")
      .attr("font-family", "monospace");

    // Bars
    g.selectAll(".bar")
      .data(nodes)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => yScale(d.name) || 0)
      .attr("height", yScale.bandwidth())
      .attr("x", 0)
      .attr("width", d => xScale(d.cpuUsage))
      .attr("rx", 3)
      .attr("fill", d => {
        if (d.cpuUsage > 85) return "#ef4444";
        if (d.cpuUsage > 65) return "#f59e0b";
        return "#10b981";
      });

    // Value Labels inside/next to bars
    g.selectAll(".label")
      .data(nodes)
      .enter()
      .append("text")
      .attr("y", d => (yScale(d.name) || 0) + yScale.bandwidth() / 2 + 3)
      .attr("x", d => xScale(d.cpuUsage) + 6)
      .attr("fill", "#f8fafc")
      .attr("font-size", "9px")
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .text(d => (d.status === "offline" ? "OFFLINE" : `${d.cpuUsage}% CPU`));
  }, [nodes]);

  // Export Health Report Action
  const handleExportJson = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      overallHealthScore,
      isLuandaFailed,
      promotedMasterId,
      nodes
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pnap_cluster_health_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedNodeObj = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="flex flex-col gap-6 text-left" id="d3-node-health-dashboard">
      
      {/* HEADER TOOLBAR & LIVE CONTROLS */}
      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/30 text-amber-500">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
                Monitor em Tempo Real de Saúde dos Nós (D3.js)
              </h3>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                D3 STREAM ACTIVE
              </span>
            </div>
            <p className="text-xxs text-slate-400 mt-0.5">
              Visualização vetorial interativa com D3 Force Simulation, tempo real de latência, carga de CPU/Memória e telemetria do cluster PostgreSQL do MININT.
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1.5 rounded-lg text-xxs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isStreaming
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850"
            }`}
          >
            {isStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isStreaming ? "Pausar Stream" : "Retomar Stream"}
          </button>

          {onToggleFailure && (
            <button
              type="button"
              onClick={onToggleFailure}
              className={`px-3 py-1.5 rounded-lg text-xxs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isLuandaFailed
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {isLuandaFailed ? "Restaurar Luanda" : "Simular Blackout Luanda"}
            </button>
          )}

          <button
            type="button"
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xxs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Exportar Relatório D3
          </button>
        </div>
      </div>

      {/* FAILOVER SIMULATION CONTROL BAR FOR ADMIN TESTING */}
      <div className="bg-slate-950 border border-amber-500/30 p-3.5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-500/20 p-2 rounded-lg border border-amber-500/40 text-amber-400">
            <Sliders className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest block">
              PAINEL DE SIMULAÇÃO DE FAILOVER & REDIRECIONAMENTO DE NÓ (VIP 10.224.0.100)
            </span>
            <div className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2 mt-0.5">
              <span>Nó Ativo de Escrita:</span>
              <strong className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                isLuandaFailed
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold"
              }`}>
                {isLuandaFailed
                  ? promotedMasterId === "cloud-secondary"
                    ? "Benguela-DR (10.224.2.15) [PROMOVIDO]"
                    : promotedMasterId === "local-onpremise"
                    ? "Huambo-EP (192.168.42.10) [PROMOVIDO]"
                    : promotedMasterId === "local-hybrid"
                    ? "Viana-Móvel (192.168.50.8) [PROMOVIDO]"
                    : "Benguela-DR Auto-Failover"
                  : "Luanda Central (10.224.0.10) [PRIMARY]"}
              </strong>
            </div>
          </div>
        </div>

        {/* SIMULATION ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-[9px] font-mono text-slate-400 uppercase mr-1 hidden lg:inline">Testar Redirecionamento:</span>
          
          <button
            type="button"
            onClick={() => onManualFailover && onManualFailover("cloud-secondary")}
            className={`px-2.5 py-1.5 rounded text-[9.5px] font-mono font-black transition-all cursor-pointer border ${
              isLuandaFailed && (promotedMasterId === "cloud-secondary" || !promotedMasterId)
                ? "bg-sky-500 text-slate-950 border-sky-400 shadow"
                : "bg-slate-900 border-slate-800 text-sky-400 hover:bg-sky-950/40"
            }`}
          >
            → Benguela-DR
          </button>

          <button
            type="button"
            onClick={() => onManualFailover && onManualFailover("local-onpremise")}
            className={`px-2.5 py-1.5 rounded text-[9.5px] font-mono font-black transition-all cursor-pointer border ${
              isLuandaFailed && promotedMasterId === "local-onpremise"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                : "bg-slate-900 border-slate-800 text-amber-400 hover:bg-amber-950/40"
            }`}
          >
            → Huambo-EP
          </button>

          <button
            type="button"
            onClick={() => onManualFailover && onManualFailover("local-hybrid")}
            className={`px-2.5 py-1.5 rounded text-[9.5px] font-mono font-black transition-all cursor-pointer border ${
              isLuandaFailed && promotedMasterId === "local-hybrid"
                ? "bg-purple-500 text-slate-950 border-purple-400 shadow"
                : "bg-slate-900 border-slate-800 text-purple-400 hover:bg-purple-950/40"
            }`}
          >
            → Viana Edge
          </button>

          <button
            type="button"
            onClick={() => onResetFailover ? onResetFailover() : onToggleFailure && isLuandaFailed && onToggleFailure()}
            className="px-2.5 py-1.5 rounded text-[9.5px] font-mono font-black bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60 transition-all cursor-pointer flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Restaurar Luanda
          </button>
        </div>
      </div>

      {/* TOP ROW: D3 TIME SERIES CHART & RADIAL GAUGE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* TIME SERIES METRICS CHART (3 COLS) */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between relative shadow-sm" ref={timeSeriesContainerRef}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                TELEMETRIA TEMPORAL EM TEMPO REAL
              </span>
              <h4 className="text-xs font-bold text-slate-100 font-mono flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-500" /> Histórico Dinâmico de Métrica ({selectedMetric.toUpperCase()})
              </h4>
            </div>

            {/* METRIC TOGGLES */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-850">
              {(["cpu", "memory", "latency", "qps", "lagMb"] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMetric(m)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    selectedMetric === m
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m === "cpu" ? "CPU %" : m === "memory" ? "RAM %" : m === "latency" ? "Latência" : m === "qps" ? "QPS" : "LAG MB"}
                </button>
              ))}
            </div>
          </div>

          {/* D3 SVG Canvas */}
          <div className="w-full overflow-hidden flex justify-center items-center my-1">
            <svg ref={timeSeriesRef} className="w-full h-[260px]" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-900">
            <span>Buffer de Janela: {timeWindowSec}s</span>
            <span className="flex items-center gap-1 text-slate-400">
              Clique em qualquer nó na legenda D3 para isolar o histórico
            </span>
          </div>
        </div>

        {/* RADIAL HEALTH GAUGE & QUICK STATS (1 COL) */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col items-center justify-between shadow-sm">
          <div className="w-full text-left">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
              ESTADO GERAL DO CLUSTER
            </span>
            <h4 className="text-xs font-bold text-slate-100 font-mono">
              Score Integrado
            </h4>
          </div>

          {/* D3 ARC GAUGE */}
          <div className="my-2 flex items-center justify-center">
            <svg ref={gaugeRef} />
          </div>

          {/* STATUS SUMMARY CARDS */}
          <div className="w-full space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-850">
              <span className="text-slate-400">Nós Ativos:</span>
              <span className="font-bold text-emerald-400">
                {nodes.filter(n => n.status !== "offline").length} / {nodes.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-850">
              <span className="text-slate-400">Master Ativo:</span>
              <span className="font-bold text-amber-400">
                {isLuandaFailed
                  ? promotedMasterId
                    ? `${promotedMasterId === "cloud-secondary" ? "Benguela DR" : promotedMasterId === "local-onpremise" ? "Huambo EP" : "Viana"}`
                    : "SEM MASTER!"
                  : "Luanda Primary"}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* SECOND ROW: D3 NETWORK TOPOLOGY GRAPH & BAR COMPARISON & NODE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* D3 FORCE TOPOLOGY GRAPH (1.5 COL / 1 COL) */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                TOPOLOGIA DE REDE EM TEMPO REAL
              </span>
              <h4 className="text-xs font-bold text-slate-100 font-mono flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-sky-400" /> D3 Force-Directed Network Graph
              </h4>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Arraste os nós</span>
          </div>

          <div className="flex items-center justify-center overflow-hidden bg-slate-900/30 rounded-lg border border-slate-900">
            <svg ref={topologyRef} className="w-full h-[280px]" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-900">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Online
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span> Degradado
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500"></span> Offline
            </span>
          </div>
        </div>

        {/* D3 RESOURCE COMPARISON BAR CHART */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                MÉTRICAS COMPARATIVAS
              </span>
              <h4 className="text-xs font-bold text-slate-100 font-mono flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-emerald-400" /> Carga de Processamento (CPU %)
              </h4>
            </div>
          </div>

          <div className="flex items-center justify-center overflow-hidden bg-slate-900/30 rounded-lg border border-slate-900">
            <svg ref={barChartRef} className="w-full h-[200px]" />
          </div>

          {/* STRESS TEST CONTROLS */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 font-mono text-[10px] space-y-2 mt-2">
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Injeção de Carga / Stress Test:</span>
            <div className="flex gap-1.5 flex-wrap">
              {nodes.map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setStressNodeId(n.id);
                    if (onTriggerSpike) onTriggerSpike(n.id);
                    setTimeout(() => setStressNodeId(null), 4000);
                  }}
                  className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all cursor-pointer border ${
                    stressNodeId === n.id
                      ? "bg-red-500/20 border-red-500 text-red-300 animate-pulse"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  <Flame className="h-3 w-3 inline mr-1 text-amber-500" />
                  Spike {n.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* NODE INSPECTOR DETAILED PANEL */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-3">
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                  INSPECTOR DE NÓ SELECCIONADO
                </span>
                <h4 className="text-sm font-bold text-amber-400 font-mono flex items-center gap-2">
                  <Server className="h-4 w-4 text-amber-500" />
                  {selectedNodeObj.name}
                </h4>
              </div>

              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                selectedNodeObj.status === "online"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : selectedNodeObj.status === "degraded"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}>
                {selectedNodeObj.status}
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 space-y-1.5">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Localização:</span>
                  <span className="text-slate-200 font-bold">{selectedNodeObj.location}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Latência de Rede:</span>
                  <span className={`font-bold ${selectedNodeObj.latencyMs > 100 ? "text-amber-400" : "text-emerald-400"}`}>
                    {selectedNodeObj.latencyMs > 9000 ? "OFFLINE" : `${selectedNodeObj.latencyMs} ms`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Vazão de Pesquisa (QPS):</span>
                  <span className="text-sky-400 font-bold">{selectedNodeObj.qps} QPS</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Conexões Ativas:</span>
                  <span className="text-slate-200 font-bold">
                    {selectedNodeObj.connections} / {selectedNodeObj.maxConnections}
                  </span>
                </div>
              </div>

              {/* Progress meters */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Processador (CPU Usage):</span>
                    <span className="font-bold text-slate-200">{selectedNodeObj.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                    <div
                      className={`h-full transition-all duration-500 ${
                        selectedNodeObj.cpuUsage > 80
                          ? "bg-red-500"
                          : selectedNodeObj.cpuUsage > 60
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${selectedNodeObj.cpuUsage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Memória RAM Usage:</span>
                    <span className="font-bold text-slate-200">{selectedNodeObj.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                    <div
                      className="h-full bg-sky-500 transition-all duration-500"
                      style={{ width: `${selectedNodeObj.memoryUsage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>E/S de Disco (Disk IOPS):</span>
                    <span className="font-bold text-slate-200">{selectedNodeObj.diskIoPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                    <div
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${selectedNodeObj.diskIoPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-amber-300 text-[10px] font-mono mt-3 flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Nó sincronizado via motor PostgreSQL Streaming Replication com encriptação TLSv1.3 habilitada.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
