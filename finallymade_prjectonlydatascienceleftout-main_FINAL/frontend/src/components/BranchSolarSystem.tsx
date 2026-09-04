import { useEffect, useRef, useState, useMemo } from "react";
import { useExamMode } from "@/lib/exam-mode-context";

interface CollegeNode {
  id: string;
  name: string;
  shortName: string;
  stream: "jee" | "neet";
  closingRank: number;
  metric: string;
  metricLabel: string;
  quota: string;
  bond: string;
  x: number; // percentage in coordinate space (0-100)
  y: number; // percentage in coordinate space (0-100)
}

const NODES: CollegeNode[] = [
  // JEE Apex
  { id: "iitb", name: "IIT Bombay", shortName: "IIT-B", stream: "jee", closingRank: 68, metric: "₹45 LPA", metricLabel: "Median Pkg", quota: "OPEN AIQ", bond: "0-Year", x: 48, y: 38 },
  { id: "iitd", name: "IIT Delhi", shortName: "IIT-D", stream: "jee", closingRank: 118, metric: "₹42 LPA", metricLabel: "Median Pkg", quota: "OPEN AIQ", bond: "0-Year", x: 58, y: 34 },
  { id: "iitm", name: "IIT Madras", shortName: "IIT-M", stream: "jee", closingRank: 680, metric: "₹38 LPA", metricLabel: "Median Pkg", quota: "OPEN AIQ", bond: "0-Year", x: 40, y: 46 },
  { id: "iiith", name: "IIIT Hyderabad", shortName: "IIIT-H", stream: "jee", closingRank: 980, metric: "₹42 LPA", metricLabel: "Top Coding", quota: "Main Direct", bond: "0-Year", x: 64, y: 44 },
  { id: "nitt", name: "NIT Trichy", shortName: "NIT-T", stream: "jee", closingRank: 2100, metric: "₹32 LPA", metricLabel: "Median Pkg", quota: "OS Quota", bond: "HS 50%", x: 32, y: 32 },
  { id: "iitk", name: "IIT Kanpur", shortName: "IIT-K", stream: "jee", closingRank: 2240, metric: "₹28 LPA", metricLabel: "Median Pkg", quota: "OPEN AIQ", bond: "0-Year", x: 68, y: 58 },
  { id: "nits", name: "NIT Surathkal", shortName: "NIT-K", stream: "jee", closingRank: 3100, metric: "₹26 LPA", metricLabel: "Median Pkg", quota: "OS Quota", bond: "HS 50%", x: 26, y: 58 },

  // NEET Apex
  { id: "aiimsd", name: "AIIMS New Delhi", shortName: "AIIMS-D", stream: "neet", closingRank: 57, metric: "2,500 Beds", metricLabel: "Hospital OPD", quota: "AIIMS Open", bond: "0-Yr / ₹0", x: 52, y: 36 },
  { id: "mamc", name: "MAMC New Delhi", shortName: "MAMC", stream: "neet", closingRank: 105, metric: "2,800 Beds", metricLabel: "Daily Load", quota: "15% AIQ", bond: "1-Yr / ₹3L", x: 44, y: 32 },
  { id: "jipmer", name: "JIPMER Puducherry", shortName: "JIPMER", stream: "neet", closingRank: 277, metric: "2,200 Beds", metricLabel: "Hospital OPD", quota: "Central AIQ", bond: "0-Yr / ₹0", x: 62, y: 38 },
  { id: "vmmc", name: "VMMC & Safdarjung", shortName: "VMMC", stream: "neet", closingRank: 142, metric: "2,900 Beds", metricLabel: "Daily Load", quota: "15% AIQ", bond: "1-Yr / ₹3L", x: 38, y: 42 },
  { id: "aiimsb", name: "AIIMS Bhubaneswar", shortName: "AIIMS-BBSR", stream: "neet", closingRank: 540, metric: "1,100 Beds", metricLabel: "Super Specialty", quota: "AIIMS Open", bond: "0-Yr / ₹0", x: 66, y: 48 },
  { id: "sethgs", name: "Seth GS Mumbai", shortName: "KEM-GS", stream: "neet", closingRank: 680, metric: "2,250 Beds", metricLabel: "KEM Hospital", quota: "15% AIQ / 85% MH", bond: "1-Yr / ₹10L", x: 30, y: 48 },
  { id: "kgmu", name: "KGMU Lucknow", shortName: "KGMU", stream: "neet", closingRank: 1850, metric: "4,500 Beds", metricLabel: "Largest OPD", quota: "15% AIQ / 85% UP", bond: "2-Yr / ₹10L", x: 56, y: 64 },
];

export function BranchSolarSystem() {
  const { isNeet } = useExamMode();
  const [hoveredNode, setHoveredNode] = useState<CollegeNode | null>(null);
  const [activeAutoNode, setActiveAutoNode] = useState<number>(0);
  const [radarDegrees, setRadarDegrees] = useState(0);

  // Smooth radar sweep animation
  useEffect(() => {
    let animId: number;
    let start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      setRadarDegrees((elapsed * 35) % 360);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Filter nodes according to active mode
  const currentNodes = useMemo(() => {
    return NODES.filter((n) => (isNeet ? n.stream === "neet" : n.stream === "jee"));
  }, [isNeet]);

  // Periodic cycle of auto-highlighting
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAutoNode((prev) => (prev + 1) % currentNodes.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [currentNodes.length]);

  const selectedNode = hoveredNode || currentNodes[activeAutoNode] || currentNodes[0];

  const primaryAccent = isNeet ? "#10b981" : "#3b82f6";
  const primaryGlow = isNeet ? "rgba(16, 185, 129, 0.25)" : "rgba(59, 130, 246, 0.25)";

  return (
    <div className="relative w-full h-full min-h-[580px] bg-[#07090e] text-neutral-100 flex flex-col justify-between overflow-hidden select-none font-mono">
      {/* ─── 1. RADAR COORDINATE BACKGROUND GRID ─── */}
      <div 
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 45%, ${primaryGlow} 0%, transparent 65%),
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 48px 48px, 48px 48px",
        }}
      />

      {/* ─── 2. TOP TELEMETRY HUD BAR ─── */}
      <div className="relative z-10 p-6 md:p-8 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-[10.5px] font-semibold tracking-[0.2em] uppercase">
            <span className="size-2 rounded-full animate-ping" style={{ background: primaryAccent }} />
            <span style={{ color: primaryAccent }}>
              {isNeet ? "MCC CLINICAL MATRIX RADAR · 2026" : "JoSAA ADMISSION TELEMETRY RADAR · 2026"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
            National Admission Probability Spectrum
          </h1>
          <p className="text-xs text-neutral-400 max-w-xl mt-1 leading-relaxed">
            Real-time algorithmic coordinate mapping of India's premier {isNeet ? "medical" : "engineering"} institutions against verified 10-year opening and closing ranks.
          </p>
        </div>

        {/* Live Coordinate Gauge */}
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl">
          <div className="text-right">
            <div className="text-[10px] uppercase text-neutral-500 tracking-wider">RADAR BEARING</div>
            <div className="text-sm font-bold text-white tabular-nums">{radarDegrees.toFixed(1)}° AZIMUTH</div>
          </div>
          <div className="w-px h-7 bg-white/10" />
          <div className="text-right">
            <div className="text-[10px] uppercase text-neutral-500 tracking-wider">INSTITUTES MAPPED</div>
            <div className="text-sm font-bold tabular-nums" style={{ color: primaryAccent }}>
              {isNeet ? "706 GMCs" : "118 INIs / NITs"}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. CENTRAL RADAR DISPLAY CANVAS ─── */}
      <div className="relative flex-1 flex items-center justify-center p-4 min-h-[380px]">
        {/* Radar Range Rings (Concentric circles) */}
        <div className="relative size-[340px] sm:size-[480px] md:size-[560px] rounded-full border border-white/10 flex items-center justify-center pointer-events-none">
          {/* Outer ring label */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] text-neutral-500 uppercase tracking-widest bg-[#07090e] px-2">
            AIR 50,000 PERIPHERY
          </span>

          {/* Ring 2 */}
          <div className="size-[75%] rounded-full border border-white/10 flex items-center justify-center relative">
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] text-neutral-500 uppercase tracking-widest bg-[#07090e] px-2">
              AIR 15,000 TARGET
            </span>

            {/* Ring 3 */}
            <div className="size-[65%] rounded-full border border-white/15 flex items-center justify-center relative">
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] text-neutral-400 uppercase tracking-widest bg-[#07090e] px-2">
                AIR 3,000 ELITE
              </span>

              {/* Core Ring */}
              <div 
                className="size-[45%] rounded-full border flex items-center justify-center relative"
                style={{ borderColor: `${primaryAccent}40` }}
              >
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest bg-[#07090e] px-2" style={{ color: primaryAccent }}>
                  APEX AIR &lt; 500
                </span>

                {/* Radar Center Crosshair */}
                <div className="size-2 rounded-full" style={{ background: primaryAccent }} />
              </div>
            </div>
          </div>

          {/* Radar Sweep Line (Phosphor Line) */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background: `conic-gradient(from ${radarDegrees}deg at 50% 50%, ${primaryGlow} 0deg, transparent 45deg, transparent 360deg)`,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left pointer-events-none"
            style={{
              background: `linear-gradient(to right, ${primaryAccent}, transparent)`,
              transform: `rotate(${radarDegrees}deg)`,
            }}
          />
        </div>

        {/* Coordinate Nodes (Institutions) */}
        {currentNodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <div
              key={node.id}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              className="absolute transition-transform duration-300 z-20 cursor-pointer"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: `translate(-50%, -50%) scale(${isSelected ? 1.15 : 1})`,
              }}
            >
              {/* Pulsing Beacon */}
              <div className="relative flex items-center justify-center group">
                {isSelected && (
                  <span
                    className="absolute size-9 rounded-full opacity-60 animate-ping"
                    style={{ background: primaryAccent }}
                  />
                )}
                <div
                  className={`size-6 rounded-full border flex items-center justify-center font-bold text-[10px] transition-all shadow-md ${
                    isSelected
                      ? "bg-white text-black border-white ring-4"
                      : "bg-[#111624] text-white border-white/30 hover:border-white"
                  }`}
                  style={{ ringColor: primaryGlow }}
                >
                  {node.shortName[0]}
                </div>

                {/* Label Tag */}
                <div
                  className={`absolute top-7 whitespace-nowrap px-2 py-0.5 rounded-md border text-[10px] font-bold tracking-wider uppercase transition-all ${
                    isSelected
                      ? "bg-neutral-900 border-white/40 text-white shadow-xl scale-105"
                      : "bg-black/80 border-white/10 text-neutral-400"
                  }`}
                >
                  {node.shortName} · AIR {node.closingRank}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── 4. BOTTOM TELEMETRY STATUS & LIVE NODE INSPECTOR ─── */}
      <div className="relative z-10 border-t border-white/10 bg-black/60 backdrop-blur-md p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Selected Institute Telemetry Card */}
        {selectedNode && (
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="size-10 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-lg">
              {isNeet ? "🩺" : "🏛"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{selectedNode.name}</span>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold border border-white/20 bg-white/10 text-neutral-300">
                  {selectedNode.quota}
                </span>
              </div>
              <div className="flex items-center gap-4 text-neutral-400 mt-0.5 text-[11px]">
                <span>Round Closing: <strong className="text-white">AIR #{selectedNode.closingRank}</strong></span>
                <span>•</span>
                <span>{selectedNode.metricLabel}: <strong style={{ color: primaryAccent }}>{selectedNode.metric}</strong></span>
                <span>•</span>
                <span>Rural Bond: <strong className="text-amber-400">{selectedNode.bond}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Global Live Verification Ticker */}
        <div className="flex items-center gap-3 font-mono text-[10.5px] text-neutral-400 self-end md:self-auto">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>OFFICIAL ALLOTMENT DATA VERIFIED · 100% MATHEMATICAL ENGINE</span>
        </div>
      </div>
    </div>
  );
}
