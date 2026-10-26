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
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <span>📚 แผนผังบทเรียน</span>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
            {completedCount} / {steps.length} สำเร็จ
          </span>
        </div>

        {/* Step Trail with Connected Line */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const isCompleted = step.status === "completed";
            const isLocked = step.status === "locked";

            let markerClass = "bg-slate-200 text-slate-500 ring-4 ring-white";
            if (isCompleted) {
              markerClass = "bg-emerald-500 text-white font-bold ring-4 ring-emerald-50";
            } else if (isActive) {
              markerClass = "bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse";
            }

            return (
              <div
                key={step.conceptId}
                onClick={() => !isLocked && onSelectStep && onSelectStep(idx)}
                className={`relative flex items-start gap-3 transition-all ${
                  isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer group"
                } ${isActive ? "bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/80 -ml-2.5" : ""}`}
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
                        ? "text-blue-700"
                        : isCompleted
                        ? "text-slate-800 group-hover:text-slate-950"
                        : "text-slate-500"
                    }`}
                  >
                    {idx + 1}. {step.title}
                  </div>

                  <div className="text-[11px] mt-0.5">
                    {isCompleted ? (
                      <span className="text-emerald-600 font-mono font-medium">
                        พิสูจน์แล้ว ({step.provenProposition || step.conceptId})
                      </span>
                    ) : isActive ? (
                      <span className="text-blue-600 font-medium">
                        กำลังเรียนรู้ (Socratic Focus)
                      </span>
                    ) : (
                      <span className="text-slate-400">
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
      <div className="mt-8 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[11px] text-amber-900 leading-relaxed">
        💡 <b className="text-amber-950 font-bold">โสเครติสแนะ:</b>{" "}
        &ldquo;ความฉลาดที่แท้จริง เริ่มต้นจากการตระหนักว่าสิ่งที่เราคิดว่ารู้ อาจยังไม่ได้รับการพิสูจน์&rdquo;
      </div>
    </div>
  );
}
