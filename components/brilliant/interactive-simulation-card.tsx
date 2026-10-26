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

      // Draw faint background grid
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 1;
      for (let x = 20; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 20; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

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
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw pivot
      ctx.beginPath();
      ctx.arc(originX, originY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#334155";
      ctx.fill();

      // Draw bob with amber glow
      ctx.beginPath();
      ctx.arc(bobX, bobY, 15, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.shadowColor = "rgba(245, 158, 11, 0.4)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2;
      ctx.stroke();

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
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
          ⚡ Interactive Physics Simulation
        </span>
        <span className="text-xs text-slate-500 font-mono">Real-time Canvas Engine</span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">{title}</h3>

      {/* Physics Canvas - Clean Light Backdrop */}
      <div className="w-full h-52 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden mb-6 shadow-inner">
        <canvas ref={canvasRef} width={400} height={208} className="w-full h-full" />
        <div className="absolute bottom-2 left-4 text-xs font-semibold text-slate-600 bg-white/90 backdrop-blur px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
          คาบเวลาจริง:{" "}
          <span className="text-amber-600 font-bold font-mono">
            T = {period.toFixed(2)} วินาที
          </span>
        </div>
      </div>

      {/* Real-time Parameter Sliders */}
      <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>
              ความยาวเชือก (L):{" "}
              <span className="text-blue-600 font-bold font-mono">
                {length.toFixed(1)}
              </span>{" "}
              เมตร
            </span>
            <span className="text-slate-400 font-normal">0.2m - 3.0m</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={length}
            onChange={(e) => setLength(parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>
              แรงโน้มถ่วง (g):{" "}
              <span className="text-amber-600 font-bold font-mono">
                {gravity.toFixed(1)}
              </span>{" "}
              m/s²{" "}
              <span className="text-slate-500 font-normal">
                {gravity <= 2.0
                  ? "(ดวงจันทร์)"
                  : gravity >= 20.0
                  ? "(ดาวพฤหัส)"
                  : "(โลก)"}
              </span>
            </span>
            <span className="text-slate-400 font-normal">1.6 (ดวงจันทร์) - 24.8 (พฤหัส)</span>
          </div>
          <input
            type="range"
            min="1.6"
            max="24.8"
            step="0.2"
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
          />
        </div>
      </div>

      {/* Footer info & Record observation button */}
      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono">
          สมการ: T = 2π√(L/g)
        </span>

        <button
          onClick={handleSave}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer active:scale-[0.98] ${
            isSaved
              ? "bg-emerald-600 text-white font-bold"
              : "bg-slate-900 hover:bg-slate-800 text-white border border-slate-900"
          }`}
        >
          {isSaved ? "✓ บันทึกลง KGLite แล้ว" : "บันทึกการสังเกตนี้ →"}
        </button>
      </div>
    </div>
  );
}
