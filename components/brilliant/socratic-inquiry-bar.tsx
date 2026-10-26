"use client";

import React, { useState, useRef, useEffect } from "react";

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
    <div className="w-full bg-[#111827] border border-white/10 rounded-2xl p-4 shadow-xl">
      {/* Quick Steer Suggestion Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-2 scrollbar-none text-xs">
        <span className="text-slate-500 font-medium whitespace-nowrap">ชวนคุย:</span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(prompt)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-white/5 whitespace-nowrap transition-colors cursor-pointer text-[11px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Main Input Container */}
      <div className="relative flex items-center gap-2 bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500 transition-colors">
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
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
        />

        {/* Voice STT Button */}
        <button
          onClick={toggleRecording}
          title={isRecording ? "หยุดอัดเสียง" : "กดพูดด้วยเสียง (Voice Dictation)"}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
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
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-[0.98]"
          >
            ส่ง
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>กด <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">Enter</kbd> เพื่อส่ง หรือกดไมค์เพื่อพูด</span>
        <span>Dual-Mode: Brilliant Cards + Unlimited Socratic Chat</span>
      </div>
    </div>
  );
}
