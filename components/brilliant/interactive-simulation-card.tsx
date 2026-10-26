"use client";

import React, { useState, useEffect, useRef } from "react";
import type { SimulationSliderConfig } from "./types";

interface InteractiveSimulationCardProps {
  title?: string;
  sliders?: SimulationSliderConfig[];
  onRecordObservation?: (data: { length: number; gravity: number; period: number }) => void;
}

export function InteractiveSimulationCard({
  title = "สำรวจ: ความยาวเชือก (L) และแรงโน้มถ่วง (g) ส่งผลต่อคาบการแกว่งอย่างไร?",
  onRecordObservation,
}: InteractiveSimulationCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [length, setLength] = useState<number>(1.0);
  const [gravity, setGravity] = useState<number>(9.8);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Period calculation: T = 2 * pi * sqrt(L / g)
  const period = 2 * Math.PI * Math.sqrt(length / Math.max(0.1, gravity));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = Math.PI / 4;
    let aVelocity = 0.0;
    let aAcceleration = 0.0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const originX = canvas.width / 2;
      const originY = 24;

      // Physics integration
      const armLength = length * 55;
      aAcceleration = ((-1 * (gravity / 12)) / armLength) * Math.sin(angle);
      aVelocity += aAcceleration;
      aVelocity *= 0.996; // slight air damping
      angle += aVelocity;

      const bobX = originX + armLength * Math.sin(angle);
      const bobY = originY + armLength * Math.cos(angle);

      // Draw string
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw pivot
      ctx.beginPath();
      ctx.arc(originX, originY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#64748b";
      ctx.fill();

      // Draw bob with amber glow
      ctx.beginPath();
      ctx.arc(bobX, bobY, 14, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [length, gravity]);

  const handleSave = () => {
    setIsSaved(true);
    if (onRecordObservation) {
      onRecordObservation({ length, gravity, period });
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="w-full bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
          Interactive Physics Simulation
        </span>
        <span className="text-xs text-slate-400 font-mono">Real-time Canvas Engine</span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white mb-4">{title}</h3>

      {/* Physics Canvas */}
      <div className="w-full h-52 rounded-xl bg-slate-950 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden mb-6">
        <canvas ref={canvasRef} width={400} height={208} className="w-full h-full" />
        <div className="absolute bottom-2 left-4 text-xs text-slate-400">
          คาบเวลาคำนวณได้จริง:{" "}
          <span className="text-amber-400 font-bold font-mono">
            T = {period.toFixed(2)} วินาที
          </span>
        </div>
      </div>

      {/* Real-time Parameter Sliders */}
      <div className="space-y-4 bg-slate-800/40 p-4 rounded-xl border border-white/5">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
            <span>
              ความยาวเชือก (L):{" "}
              <span className="text-blue-400 font-bold font-mono">
                {length.toFixed(1)}
              </span>{" "}
              เมตร
            </span>
            <span className="text-slate-500">0.2m - 3.0m</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={length}
            onChange={(e) => setLength(parseFloat(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
            <span>
              แรงโน้มถ่วง (g):{" "}
              <span className="text-amber-400 font-bold font-mono">
                {gravity.toFixed(1)}
              </span>{" "}
              m/s²{" "}
              {gravity <= 2.0
                ? "(ดวงจันทร์)"
                : gravity >= 20.0
                ? "(ดาวพฤหัส)"
                : "(โลก)"}
            </span>
            <span className="text-slate-500">1.6 (ดวงจันทร์) - 24.8 (พฤหัส)</span>
          </div>
          <input
            type="range"
            min="1.6"
            max="24.8"
            step="0.2"
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Footer info & Record observation button */}
      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-mono">
          สมการ: T = 2π√(L/g)
        </span>

        <button
          onClick={handleSave}
          className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer ${
            isSaved
              ? "bg-emerald-500 text-slate-950 font-bold"
              : "bg-slate-800 hover:bg-slate-700 text-white border border-white/10"
          }`}
        >
          {isSaved ? "✓ บันทึกลง KGLite แล้ว" : "บันทึกการสังเกตนี้ →"}
        </button>
      </div>
    </div>
  );
}
