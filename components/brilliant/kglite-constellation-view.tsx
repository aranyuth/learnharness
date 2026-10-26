"use client";

import React, { useState } from "react";
import type { KgliteConstellationNode, KgliteConstellationEdge } from "./types";

interface KgliteConstellationViewProps {
  nodes?: KgliteConstellationNode[];
  edges?: KgliteConstellationEdge[];
  provenCount?: number;
}

export function KgliteConstellationView({
  nodes = [
    { id: "n_gravity", label: "n_g", statement: "แรงโน้มถ่วงทำหน้าที่เป็น restoring force", confidence: 0.98, status: "proven", x: 40, y: 35 },
    { id: "n_length", label: "n_len", statement: "ความยาวเชือกส่งผลโดยตรงต่อระยะทางแกว่ง", confidence: 0.95, status: "proven", x: 40, y: 95 },
    { id: "n_period", label: "n_period", statement: "คาบเวลาผกผันกับรากที่สองของ g", confidence: 0.88, status: "proven", x: 155, y: 65 },
  ],
  edges = [
    { from: "n_gravity", to: "n_period", ruleName: "arg_formula" },
    { from: "n_length", to: "n_period", ruleName: "arg_formula" },
  ],
  provenCount = 3,
}: KgliteConstellationViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="w-full bg-[#0f172a]/70 border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>KGLite Epistemic Graph</span>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 cursor-pointer"
            >
              ⛶ ขยายเต็มจอ
            </button>
          </div>

          {/* Mini Interactive Constellation SVG */}
          <div className="w-full h-44 rounded-xl bg-slate-950 border border-white/5 relative overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 200 130">
              {/* Edges */}
              {edges.map((e, idx) => {
                const fromNode = nodes.find((n) => n.id === e.from);
                const toNode = nodes.find((n) => n.id === e.to);
                if (!fromNode || !toNode) return null;
                return (
                  <line
                    key={idx}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#3b82f6"
                    strokeWidth="1.8"
                    strokeDasharray="3,3"
                  />
                );
              })}

              {/* Central Implication Node */}
              <rect
                x="90"
                y="55"
                width="20"
                height="20"
                rx="4"
                fill="#1e293b"
                stroke="#60a5fa"
                strokeWidth="1.5"
              />
              <text
                x="100"
                y="68"
                fill="#93c5fd"
                fontSize="7"
                fontWeight="bold"
                textAnchor="middle"
              >
                arg_1
              </text>

              {/* Proposition Nodes */}
              {nodes.map((n) => {
                const isProven = n.status === "proven";
                return (
                  <g key={n.id}>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={13}
                      fill={isProven ? "#10b981" : "#3b82f6"}
                      className={!isProven ? "animate-pulse" : ""}
                    />
                    <text
                      x={n.x}
                      y={n.y + 3.5}
                      fill={isProven ? "#022c22" : "#ffffff"}
                      fontSize="7.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Epistemic Ledger (Proven Propositions) */}
          <div className="mt-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-400">
              Propositions ที่พิสูจน์แล้ว ({provenCount}):
            </div>
            {nodes.map((n) => (
              <div
                key={n.id}
                className="text-[11px] p-2 rounded-lg bg-slate-800/60 border border-white/5 text-slate-300 leading-snug"
              >
                <span className="text-emerald-400 font-bold mr-1">✅</span>
                <code className="text-emerald-400 font-mono font-semibold">
                  {n.id}
                </code>
                : {n.statement}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/5 text-[10px] text-slate-500 text-center font-mono">
          KGLite Graph Engine · Zero Latency
        </div>
      </div>

      {/* Fullscreen Expansion Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-6 sm:p-10">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white">
                🌌 KGLite Knowledge Constellation (Full View)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                โครงข่ายความรู้ทั้งหมดที่ได้รับการยืนยันและเชื่อมโยงแบบ Hypergraph
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/10 cursor-pointer"
            >
              ปิดหน้าต่าง [ESC]
            </button>
          </div>

          <div className="flex-1 w-full mt-6 rounded-2xl bg-slate-900 border border-white/10 relative overflow-hidden flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="text-5xl">🪐</div>
              <div className="text-sm font-semibold text-slate-300">
                โหนดความรู้ KGLite ทั้งหมด 526 รายการเชื่อมโยงอย่างสมบูรณ์
              </div>
              <div className="flex justify-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                  ● Proven: {provenCount}
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono">
                  ● In Progress: 1
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-700/30 text-slate-400 border border-slate-700 text-xs font-mono">
                  ● Locked: 4
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
