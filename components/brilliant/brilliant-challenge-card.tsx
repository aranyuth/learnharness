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

  // Audio chime via Web Audio API
  const playAudioCue = useCallback((isCorrect: boolean) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // AudioContext unavailable
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
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative flex flex-col justify-between overflow-hidden">
      <div>
        {/* Step Indicator Header (Brilliant Style: Clean & Airy) */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              ขั้นที่ {challenge.stepNumber} จาก {challenge.totalSteps}
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              {challenge.phase === "teach" ? "Socratic Insight" : challenge.phase}
            </span>
          </div>

          <div className="flex gap-1.5">
            {Array.from({ length: challenge.totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i < challenge.stepNumber
                    ? "bg-emerald-500"
                    : i === challenge.stepNumber - 1
                    ? "bg-emerald-500 ring-2 ring-emerald-200"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Hook Headline & Socratic Question (Bold Charcoal Black) */}
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {challenge.hookHeadline}
        </h2>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug tracking-tight mt-1.5">
          {challenge.promptQuestion}
        </h1>

        {/* Challenge Choices (Brilliant-Style: Crisp White Cards with Subtle Elevation) */}
        <div className="mt-6 space-y-3">
          {challenge.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrectOption = opt.isCorrect;

            let cardStyle =
              "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50/70 shadow-sm";
            if (isSelected) {
              cardStyle = isCorrectOption
                ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-md"
                : "border-red-400 bg-red-50/60 ring-2 ring-red-400/20 shadow-md";
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 flex items-center justify-between group cursor-pointer ${cardStyle} ${
                  isAnswered ? "cursor-default" : "active:scale-[0.99]"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center transition-colors ${
                      isSelected
                        ? isCorrectOption
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white"
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {opt.text}
                  </span>
                </div>

                {isSelected && (
                  <span className="text-xs font-bold">
                    {isCorrectOption ? (
                      <span className="text-emerald-600 flex items-center gap-1 bg-emerald-100 px-2.5 py-1 rounded-full">
                        ✓ ถูกต้อง
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1 bg-red-100 px-2.5 py-1 rounded-full">
                        ✕ ลองทบทวน
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Slide-up Bottom Feedback Drawer (Brilliant Style: Soft Tinted Banner) */}
        {isAnswered && selectedOption && (
          <div
            className={`mt-6 p-5 rounded-2xl border transition-all animate-in fade-in slide-in-from-bottom-2 ${
              selectedOption.isCorrect
                ? "border-emerald-200 bg-emerald-50/80 shadow-sm"
                : "border-amber-200 bg-amber-50/80 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {selectedOption.isCorrect ? (
                <span className="text-emerald-800 font-extrabold flex items-center gap-1.5">
                  <span className="text-lg">🎉</span> ยอดเยี่ยมมาก! สัญชาตญาณถูกต้อง
                </span>
              ) : (
                <span className="text-amber-800 font-extrabold flex items-center gap-1.5">
                  <span className="text-lg">💡</span> มาดูข้อเท็จจริงนี้กัน:
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed font-normal">
              {selectedOption.explanation || challenge.epiphanyExplanation}
            </p>

            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={onContinue}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                ก้าวต่อไป (กด Enter) →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard hotkey hint footer */}
      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          คีย์ลัด: กดปุ่ม <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">1</kbd>–
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
            {challenge.options.length}
          </kbd>{" "}
          บนแป้นพิมพ์เพื่อเลือกคำตอบ
        </span>
        <span className="text-slate-400 font-medium">Brilliant Socratic Experience</span>
      </div>
    </div>
  );
}
