"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { SocraticChallengeData, ChallengeOptionItem } from "./types";

interface BrilliantChallengeCardProps {
  challenge: SocraticChallengeData;
  onAnswerSubmit: (option: ChallengeOptionItem) => void;
  onContinue: () => void;
}

export function BrilliantChallengeCard({
  challenge,
  onAnswerSubmit,
  onContinue,
}: BrilliantChallengeCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ChallengeOptionItem | null>(null);

  // Play audio chime via Web Audio API
  const playAudioCue = useCallback((isCorrect: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isCorrect) {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // AudioContext unavailable or blocked
    }
  }, []);

  const handleSelect = useCallback(
    (option: ChallengeOptionItem) => {
      if (isAnswered) return;
      setSelectedOptionId(option.id);
      setSelectedOption(option);
      setIsAnswered(true);
      playAudioCue(option.isCorrect);
      onAnswerSubmit(option);
    },
    [isAnswered, onAnswerSubmit, playAudioCue]
  );

  // Keyboard navigation hotkeys (1-4, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= challenge.options.length && !isAnswered) {
        e.preventDefault();
        const opt = challenge.options[num - 1];
        if (opt) handleSelect(opt);
      } else if (e.key === "Enter" && isAnswered) {
        e.preventDefault();
        onContinue();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [challenge.options, handleSelect, isAnswered, onContinue]);

  return (
    <div className="w-full bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between overflow-hidden">
      <div>
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">
              ขั้นที่ {challenge.stepNumber} จาก {challenge.totalSteps}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium uppercase">
              {challenge.phase === "teach" ? "Socratic Insight" : challenge.phase}
            </span>
          </div>

          <div className="flex gap-1">
            {Array.from({ length: challenge.totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < challenge.stepNumber
                    ? "bg-emerald-400"
                    : i === challenge.stepNumber - 1
                    ? "bg-blue-500 ring-2 ring-blue-500/40"
                    : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Hook Headline & Socratic Question */}
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
          {challenge.hookHeadline}
        </h2>
        <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug tracking-tight mt-1.5">
          {challenge.promptQuestion}
        </h1>

        {/* Challenge Choices (Brilliant-Style 3D Cards) */}
        <div className="mt-6 space-y-3">
          {challenge.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrectOption = opt.isCorrect;

            let borderBgStyle =
              "border-slate-700 bg-slate-800/60 hover:border-blue-400 hover:bg-slate-800";
            if (isSelected) {
              borderBgStyle = isCorrectOption
                ? "border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50"
                : "border-red-500 bg-red-950/40 ring-1 ring-red-500/50";
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-center justify-between group cursor-pointer ${borderBgStyle} ${
                  isAnswered ? "cursor-default" : "active:scale-[0.99]"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                      isSelected
                        ? isCorrectOption
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-red-500 text-white"
                        : "bg-slate-700 text-slate-300 group-hover:bg-blue-600 group-hover:text-white"
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {opt.text}
                  </span>
                </div>

                {isSelected && (
                  <span className="text-sm font-bold">
                    {isCorrectOption ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        ✓ ถูกต้อง
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        ✕ ลองทบทวน
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Slide-up Bottom Feedback Drawer */}
        {isAnswered && selectedOption && (
          <div
            className={`mt-6 p-4 rounded-xl border transition-all animate-in fade-in slide-in-from-bottom-2 ${
              selectedOption.isCorrect
                ? "border-emerald-500/30 bg-emerald-950/40"
                : "border-amber-500/30 bg-amber-950/40"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {selectedOption.isCorrect ? (
                <span className="text-emerald-400">✨ ยอดเยี่ยมมาก! สัญชาตญาณถูกต้อง</span>
              ) : (
                <span className="text-amber-400">💡 มาดูข้อเท็จจริงนี้กัน:</span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {selectedOption.explanation || challenge.epiphanyExplanation}
            </p>

            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={onContinue}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] cursor-pointer"
              >
                ก้าวต่อไป (กด Enter) →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard hotkey hint footer */}
      <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          คีย์ลัด: กดปุ่ม <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">1</kbd>–
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {challenge.options.length}
          </kbd>{" "}
          บนแป้นพิมพ์เพื่อเลือกคำตอบ
        </span>
        <span className="text-slate-400 font-mono">Socratic Engine 2.0</span>
      </div>
    </div>
  );
}
