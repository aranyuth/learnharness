"use client";

import React, { useState, useRef } from "react";

interface SocraticInquiryBarProps {
  onSendMessage: (text: string) => void;
  onAbort?: () => void;
  isGenerating?: boolean;
}

export function SocraticInquiryBar({
  onSendMessage,
  onAbort,
  isGenerating = false,
}: SocraticInquiryBarProps) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = () => {
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mock Voice STT toggle
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Auto fill simulated voice transcription after 2s
      setTimeout(() => {
        setInputText((prev) =>
          prev ? `${prev} และถ้ามวลเปลี่ยนล่ะ?` : "ถ้าเราเพิ่มความยาวเชือก 2 เท่า คาบเวลาจะเพิ่มเท่าไหร่?"
        );
        setIsRecording(false);
        inputRef.current?.focus();
      }, 1800);
    }
  };

  const quickPrompts = [
    "💡 ขออธิบายแบบเข้าใจง่ายขึ้น",
    "🧪 ขอยกตัวอย่างในชีวิตประจำวัน",
    "📐 พิสูจน์ด้วยสูตรคณิตศาสตร์",
    "🤔 ถ้าเปลี่ยนตัวแปรอื่นจะเป็นอย่างไร?",
  ];

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
      {/* Quick Steer Suggestion Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-2 scrollbar-none text-xs">
        <span className="text-slate-400 font-semibold whitespace-nowrap text-[11px]">ชวนคุย:</span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(prompt)}
            className="px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/90 whitespace-nowrap transition-colors cursor-pointer text-[11px] font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Main Input Container - Crisp Light Design */}
      <div className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isRecording
              ? "🎙️ กำลังฟังเสียงของคุณ... (กำลังแปลงเป็นข้อความ)"
              : "พิมพ์ถามข้อสงสัย ถามเจาะลึก หรือโต้แย้งโสเครติสที่นี่..."
          }
          className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        {/* Voice STT Button */}
        <button
          onClick={toggleRecording}
          title={isRecording ? "หยุดอัดเสียง" : "กดพูดด้วยเสียง (Voice Dictation)"}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        {/* Send / Abort Button */}
        {isGenerating ? (
          <button
            onClick={onAbort}
            title="หยุดการคิด"
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            ⏹ หยุด
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            title="ส่งคำถาม (Enter)"
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-[0.98]"
          >
            ส่ง
          </button>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span>กด <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200">Enter</kbd> เพื่อส่ง หรือกดไมค์เพื่อพูด</span>
        <span className="font-medium text-slate-500">Dual-Mode: Brilliant Cards + Unlimited Socratic Chat</span>
      </div>
    </div>
  );
}
