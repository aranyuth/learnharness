"use client";

import React from "react";
import type { RoadmapStepItem } from "./types";

interface ConceptRoadmapRailProps {
  steps: RoadmapStepItem[];
  activeStepIndex: number;
  onSelectStep?: (index: number) => void;
}

export function ConceptRoadmapRail({
  steps,
  activeStepIndex,
  onSelectStep,
}: ConceptRoadmapRailProps) {
  const completedCount = steps.filter((s) => s.status === "completed").length;

  return (
    <div className="w-full bg-[#0f172a]/70 border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>📚 แผนผังบทเรียน</span>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {completedCount} / {steps.length} สำเร็จ
          </span>
        </div>

        {/* Step Trail with Connected Line */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-700">
          {steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const isCompleted = step.status === "completed";
            const isLocked = step.status === "locked";

            let markerClass = "bg-slate-700 text-slate-400 ring-4 ring-slate-900";
            if (isCompleted) {
              markerClass = "bg-emerald-500 text-slate-950 font-bold ring-4 ring-slate-900";
            } else if (isActive) {
              markerClass = "bg-blue-500 text-white ring-4 ring-blue-500/30 animate-pulse";
            }

            return (
              <div
                key={step.conceptId}
                onClick={() => !isLocked && onSelectStep && onSelectStep(idx)}
                className={`relative flex items-start gap-3 transition-all ${
                  isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer group"
                } ${isActive ? "bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/30 -ml-2.5" : ""}`}
              >
                {/* Node Dot / Check Icon */}
                <div
                  className={`absolute -left-6 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${markerClass}`}
                >
                  {isCompleted ? "✓" : isActive ? "▶" : ""}
                </div>

                <div>
                  <div
                    className={`text-xs font-bold transition-colors ${
                      isActive
                        ? "text-blue-300"
                        : isCompleted
                        ? "text-slate-200 group-hover:text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {idx + 1}. {step.title}
                  </div>

                  <div className="text-[11px] mt-0.5">
                    {isCompleted ? (
                      <span className="text-emerald-400 font-mono">
                        Proven ({step.provenProposition || step.conceptId})
                      </span>
                    ) : isActive ? (
                      <span className="text-blue-400 font-medium">
                        กำลังเรียนรู้ (Socratic Focus)
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        🔒 ปลดล็อกเมื่อผ่านด่านก่อนหน้า
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Socratic Wisdom Box */}
      <div className="mt-8 p-3.5 rounded-xl bg-slate-800/40 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
        💡 <b className="text-slate-300">โสเครติสแนะ:</b>{" "}
        &ldquo;ความฉลาดที่แท้จริง เริ่มต้นจากการตระหนักว่าสิ่งที่เราคิดว่ารู้ อาจยังไม่ได้รับการพิสูจน์&rdquo;
      </div>
    </div>
  );
}
