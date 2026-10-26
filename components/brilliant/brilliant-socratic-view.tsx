"use client";

import React, { useState, useEffect } from "react";
import { BrilliantChallengeCard } from "./brilliant-challenge-card";
import { InteractiveSimulationCard } from "./interactive-simulation-card";
import { ConceptRoadmapRail } from "./concept-roadmap-rail";
import { KgliteConstellationView } from "./kglite-constellation-view";
import { SocraticInquiryBar } from "./socratic-inquiry-bar";
import type { SocraticChallengeData, ChallengeOptionItem, RoadmapStepItem } from "./types";

interface MessageItem {
  id: string;
  sender: "user" | "socratic";
  text: string;
  timestamp: string;
}

export function BrilliantSocraticView() {
  const [viewMode, setViewMode] = useState<"card" | "chat">("card");
  const [activeStepIndex, setActiveStepIndex] = useState(2);
  const [provenPropositions, setProvenPropositions] = useState<string[]>([
    "n_gravity: แรงโน้มถ่วงทำหน้าที่เป็น restoring force",
    "n_length: ความยาวเชือกส่งผลโดยตรงต่อระยะทางแกว่ง",
  ]);

  // Roadmap steps
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStepItem[]>([
    { index: 0, conceptId: "n_motion", title: "นิยามแรงและการเคลื่อนที่", description: "กฎการเคลื่อนที่ของนิวตัน", status: "completed", provenProposition: "n_motion" },
    { index: 1, conceptId: "n_hooke", title: "แรงดึงกลับของสปริง (Hooke's Law)", description: "การคืนตัวสู่จุดสมดุล", status: "completed", provenProposition: "n_hooke" },
    { index: 2, conceptId: "n_pendulum", title: "ลูกตุ้มอย่างง่าย (Simple Pendulum)", description: "คาบเวลาและความยาวเชือก", status: "active" },
    { index: 3, conceptId: "n_energy", title: "การอนุรักษ์พลังงานกล", description: "พลังงานศักย์และพลังงานจลน์", status: "locked" },
    { index: 4, conceptId: "n_resonance", title: "การสั่นพ้อง (Resonance)", description: "ความถี่ธรรมชาติและการถ่ายโอนพลังงาน", status: "locked" },
  ]);

  // Current challenge
  const [activeChallenge, setActiveChallenge] = useState<SocraticChallengeData>({
    id: "ch_pendulum_g",
    conceptId: "n_pendulum",
    phase: "teach",
    stepNumber: 3,
    totalSteps: 5,
    hookHeadline: "การทดลองทางความคิด (Thought Experiment)",
    promptQuestion: "หากเรานำลูกตุ้มนี้ไปแกว่งบน 'ดวงจันทร์' ซึ่งมีแรงโน้มถ่วงเพียง 1/6 เท่าของโลก คาบการแกว่ง (เวลาต่อนัด) จะเป็นอย่างไร?",
    options: [
      { id: 1, text: "แกว่งเร็วขึ้น (คาบเวลาสั้นลง)", isCorrect: false, explanation: "ลองพิจารณา: ถ้าแรงดึงกลับลดลง ลูกตุ้มควรจะแกว่งอย่างเอื่อยๆ หรือรวดเร็ว?" },
      { id: 2, text: "แกว่งช้าลง (คาบเวลายาวนานขึ้น)", isCorrect: true, explanation: "ถูกต้องยอดเยี่ยม! เนื่องจากแรงโน้มถ่วง g ทำหน้าที่เป็นแรงดึงกลับ เมื่อ g ลดลง ลูกตุ้มจึงถูกดึงกลับอย่างเอื่อยๆ คาบเวลา T = 2π√(L/g) จึงยาวขึ้นประมาณ 2.45 เท่า!" },
      { id: 3, text: "แกว่งเท่าเดิม เพราะมวลของลูกตุ้มไม่ได้เปลี่ยน", isCorrect: false, explanation: "มวลของลูกตุ้มไม่มีผลในสูตร T = 2π√(L/g) ก็จริง แต่แรงโน้มถ่วง g มีผลโดยตรงครับ!" },
    ],
    epiphanyExplanation: "สูตรคาบการแกว่ง T = 2π√(L/g) แสดงให้เห็นว่าคาบเวลาผกผันกับรากที่สองของ g เมื่อแรงโน้มถ่วงลดลง ตัวหารลดลง คาบเวลาจึงยาวขึ้น",
  });

  // Conversation history for Timeline Chat Mode
  const [messages, setMessages] = useState<MessageItem[]>([
    { id: "m1", sender: "socratic", text: "ยินดีต้อนรับสู่บทเรียน 'การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย' ในขั้นตอนนี้เราจะสำรวจลูกตุ้มนาฬิกา (Simple Pendulum)", timestamp: "09:00" },
    { id: "m2", sender: "user", text: "ทำไมแรงโน้มถ่วงถึงมีผลต่อความเร็วในการแกว่งครับ?", timestamp: "09:01" },
    { id: "m3", sender: "socratic", text: "เพราะแรงโน้มถ่วงทำหน้าที่เป็น 'Restoring Force' หรือแรงดึงกลับสู่ตำแหน่งสมดุล ยิ่งแรงดึงกลับมาก วัตถุก็จะเร่งกลับมาเร็วขึ้นครับ!", timestamp: "09:02" },
  ]);

  const [activeTabCenter, setActiveTabCenter] = useState<"card" | "simulator">("card");

  // Handle answering the Brilliant Card
  const handleAnswerSubmit = (option: ChallengeOptionItem) => {
    if (option.isCorrect) {
      setProvenPropositions((prev) => [
        ...prev,
        "n_period: คาบเวลาผกผันกับรากที่สองของ g (Proven via Socratic challenge)",
      ]);
      setRoadmapSteps((prev) =>
        prev.map((s, idx) => (idx === 2 ? { ...s, status: "completed", provenProposition: "n_period" } : idx === 3 ? { ...s, status: "active" } : s))
      );
    }

    // Add to message timeline as well
    setMessages((prev) => [
      ...prev,
      { id: `m_ans_${Date.now()}`, sender: "user", text: `[เลือกคำตอบที่ ${option.id}] ${option.text}`, timestamp: "เมื่อสักครู่" },
      { id: `m_rep_${Date.now()}`, sender: "socratic", text: option.explanation, timestamp: "เมื่อสักครู่" },
    ]);
  };

  const handleContinue = () => {
    alert("🎉 ยอดเยี่ยม! บันทึกข้อสรุปนี้ลงใน KGLite เรียบร้อยแล้ว และปลดล็อก Step ที่ 4 (การอนุรักษ์พลังงานกล) สำเร็จ!");
    setActiveStepIndex(3);
    setActiveChallenge({
      id: "ch_energy",
      conceptId: "n_energy",
      phase: "teach",
      stepNumber: 4,
      totalSteps: 5,
      hookHeadline: "ขั้นถัดไป: พลังงานในลูกตุ้ม",
      promptQuestion: "ที่จุดสูงสุดของการแกว่ง พลังงานจลน์ (Kinetic Energy) ของลูกตุ้มมีค่าเท่าใด?",
      options: [
        { id: 1, text: "มีค่าสูงสุด (Maximum)", isCorrect: false, explanation: "ที่จุดสูงสุด ลูกตุ้มหยุดนิ่งชั่วขณะก่อนเปลี่ยนทิศทาง ความเร็วจึงเป็น 0" },
        { id: 2, text: "มีค่าเป็นศูนย์ (Zero)", isCorrect: true, explanation: "ถูกต้อง! พลังงานกลทั้งหมดกลายเป็นพลังงานศักย์ (Potential Energy)" },
        { id: 3, text: "มีค่าเท่ากับครึ่งหนึ่งของพลังงานทั้งหมด", isCorrect: false, explanation: "ไม่ใช่ครับ ที่จุดสูงสุดความเร็วเป็นศูนย์ พลังงานจลน์จึงเป็นศูนย์" },
      ],
      epiphanyExplanation: "การแกว่งคือการถ่ายเทพลังงานระหว่างพลังงานศักย์ที่จุดสูงสุด และพลังงานจลน์ที่จุดต่ำสุดอย่างสมบูรณ์",
    });
  };

  // Handle Free-form Socratic Chat
  const handleSendMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `msg_u_${Date.now()}`, sender: "user", text, timestamp: "เมื่อสักครู่" },
    ]);

    // Simulate Socratic Response
    setTimeout(() => {
      let reply = "เป็นคำถามที่ดีมากครับ! โสเครติสอยากให้คุณลองสังเกตดูว่า ในสมการ T = 2π√(L/g) มีตัวแปรใดบ้างที่ควบคุมจังหวะการแกว่ง?";
      if (text.includes("มวล")) {
        reply = "สังเกตไหมครับว่าในสูตร 'ไม่มีมวล (m)' อยู่เลย! นั่นแปลว่าแม้ลูกตุ้มจะหนัก 1 กรัม หรือ 1 ตัน ถ้าเชือกยาวเท่ากัน จะแกว่งด้วยคาบเวลาเท่ากันเป๊ะครับ!";
      } else if (text.includes("เข้าใจง่าย")) {
        reply = "เปรียบเหมือนชิงช้าในสนามเด็กเล่นครับ: คนตัวเล็กกับคนตัวใหญ่ นั่งชิงช้าสายยาวเท่ากัน ก็จะแกว่งด้วยจังหวะช้าเร็วเท่ากัน!";
      }

      setMessages((prev) => [
        ...prev,
        { id: `msg_s_${Date.now()}`, sender: "socratic", text: reply, timestamp: "เมื่อสักครู่" },
      ]);
    }, 600);
  };

  // Keyboard shortcut to toggle Card/Chat View (Cmd+T / Ctrl+T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setViewMode((m) => (m === "card" ? "chat" : "card"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header Bar - Authentic Brilliant.org Clean White Aesthetic */}
      <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-base font-bold">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-900">
                วิชา: กลศาสตร์และลูกตุ้มอย่างง่าย
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Phase: Teach (โสเครติส)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              KGLite Engine · Step {activeChallenge.stepNumber} of {activeChallenge.totalSteps}
            </div>
          </div>
        </div>

        {/* View Mode Switcher + Streak Badges */}
        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "card"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ⭐ Brilliant Card
            </button>
            <button
              onClick={() => setViewMode("chat")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "chat"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              💬 Timeline Chat
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
            <span className="text-amber-600">🔥 7 วัน</span> Streak
          </div>
        </div>
      </header>

      {/* 3-Column Master Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Zone 1: Left Pane (Concept Roadmap Rail) - 3 cols */}
        <aside className="lg:col-span-3 w-full">
          <ConceptRoadmapRail
            steps={roadmapSteps}
            activeStepIndex={activeStepIndex}
            onSelectStep={(idx) => setActiveStepIndex(idx)}
          />
        </aside>

        {/* Zone 2: Center Pane (Brilliant Cards / Chat + Socratic Inquiry Bar) - 6 cols */}
        <section className="lg:col-span-6 w-full space-y-6">
          {viewMode === "card" ? (
            <>
              {/* Tabs to switch between Challenge Card and Simulator */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTabCenter("card")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTabCenter === "card"
                      ? "bg-white text-slate-900 border border-slate-200 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🎯 การ์ดโจทย์ (Challenge)
                </button>
                <button
                  onClick={() => setActiveTabCenter("simulator")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTabCenter === "simulator"
                      ? "bg-white text-amber-700 border border-amber-200 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🧪 ตัวจำลองฟิสิกส์ (Simulator)
                </button>
              </div>

              {activeTabCenter === "card" ? (
                <BrilliantChallengeCard
                  challenge={activeChallenge}
                  onAnswerSubmit={handleAnswerSubmit}
                  onContinue={handleContinue}
                />
              ) : (
                <InteractiveSimulationCard
                  onRecordObservation={(data) => {
                    alert(`บันทึกค่า: L=${data.length}m, g=${data.gravity}m/s², T=${data.period.toFixed(2)}s ลง KGLite เรียบร้อย`);
                  }}
                />
              )}
            </>
          ) : (
            /* Timeline Chat View - Clean Crisp Light Design */
            <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4 max-h-[600px] overflow-y-auto">
              <div className="text-xs font-bold text-slate-500 pb-2 border-b border-slate-100 uppercase tracking-wider">
                บทสนทนาโสเครติส (Timeline Chat Stream)
              </div>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                        : "bg-slate-100 border border-slate-200/80 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Socratic Inquiry Bar (Always available for free-form typing & voice) */}
          <SocraticInquiryBar onSendMessage={handleSendMessage} />
        </section>

        {/* Zone 3: Right Pane (KGLite Epistemic Constellation) - 3 cols */}
        <aside className="lg:col-span-3 w-full">
          <KgliteConstellationView provenCount={provenPropositions.length} />
        </aside>
      </main>
    </div>
  );
}
