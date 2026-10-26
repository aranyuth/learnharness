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
    { id: "n_gravity", label: "g_force", statement: "แรงโน้มถ่วงทำหน้าที่เป็น restoring force", confidence: 0.98, status: "proven", x: 40, y: 35 },
    { id: "n_length", label: "length", statement: "ความยาวเชือกส่งผลโดยตรงต่อระยะทางแกว่ง", confidence: 0.95, status: "proven", x: 40, y: 95 },
    { id: "n_period", label: "period", statement: "คาบเวลาผกผันกับรากที่สองของ g", confidence: 0.88, status: "proven", x: 155, y: 65 },
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
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>KGLite Epistemic Graph</span>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold px-2 py-0.5 rounded bg-blue-50 border border-blue-200 cursor-pointer"
            >
              ⛶ ขยายเต็มจอ
            </button>
          </div>

          {/* Mini Interactive Constellation SVG - Light Background */}
          <div className="w-full h-44 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 200 130">
              {/* Subtle background grid pattern */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="0.75" fill="#cbd5e1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

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
                    strokeWidth="2"
                    strokeDasharray="3,3"
                  />
                );
              })}

              {/* Central Implication Node */}
              <rect
                x="88"
                y="54"
                width="24"
                height="22"
                rx="6"
                fill="#ffffff"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <text
                x="100"
                y="68"
                fill="#1e40af"
                fontSize="8"
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
                      r={14}
                      fill={isProven ? "#10b981" : "#3b82f6"}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className={!isProven ? "animate-pulse" : ""}
                    />
                    <text
                      x={n.x}
                      y={n.y + 3.5}
                      fill="#ffffff"
                      fontSize="7"
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
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Propositions ที่พิสูจน์แล้ว ({provenCount}):
            </div>
            {nodes.map((n) => (
              <div
                key={n.id}
                className="text-[11px] p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 leading-snug"
              >
                <span className="text-emerald-600 font-bold mr-1.5">✓</span>
                <code className="text-blue-700 font-mono font-bold">
                  {n.id}
                </code>
                : {n.statement}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono">
          KGLite Graph Engine · Zero Latency
        </div>
      </div>

      {/* Fullscreen Expansion Modal - Clean Light Theme */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex flex-col p-6 sm:p-10">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 flex-1 flex flex-col max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  🌐 KGLite Knowledge Constellation (Full View)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  โครงข่ายความรู้ทั้งหมดที่ได้รับการยืนยันและเชื่อมโยงแบบ Hypergraph
                </p>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer"
              >
                ปิดหน้าต่าง [ESC]
              </button>
            </div>

            <div className="flex-1 w-full mt-6 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="text-5xl">🪐</div>
                <div className="text-base font-bold text-slate-800">
                  โหนดความรู้ KGLite ทั้งหมด 526 รายการเชื่อมโยงอย่างสมบูรณ์
                </div>
                <div className="flex justify-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-semibold">
                    ● Proven: {provenCount}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-semibold">
                    ● In Progress: 1
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-mono font-semibold">
                    ● Locked: 4
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
