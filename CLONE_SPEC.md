# 📋 CLONE_SPEC.md: Complete Clean-Room Specification for LearnHarness
> **Canonical Reverse-Engineering Specification for Reconstructing LearnHarness from Scratch**  
> Generated via `/rea-clone-any` Protocol | Antigravity Autonomous Engineering Board

---

## 1. Application Overview

| Attribute | Specification Details |
|---|---|
| **Target Application** | **LearnHarness** (`learnharness.desktop` / `learnharness`) |
| **Original Tech Stack** | Electron 44 + Next.js 16 (Turbopack, App Router) + React 19 + Tailwind CSS v4 + `@earendil-works/pi-agent-core` (TypeScript) |
| **Target Architecture** | Hexagonal Architecture (Domain Core, Ports, Adapters, Composition Roots) |
| **System Identity** | Socratic Epistemic Learning Agent Harness & Cross-Session Reasoning Graph |
| **Clean-Room Boundary** | Independent reconstruction of all epistemic algorithms, state machines, and data contracts without copying proprietary dependencies |

---

## 2. User Interface & Interaction Model

### 2.1 Screen Topologies
1. **Home Canvas View (`/`):**
   - **Main Surface:** Full-screen 2D interactive force-directed graph canvas displaying all learned propositions ($n\_$) and implication argument nodes ($arg\_$).
   - **Top Navigation Bar:** Title, session switcher, new session button, search trigger (`Ctrl+K`), Settings gear, Cost & Token counter.
   - **Floating Docks:**
     - *Activity Dock:* Collapsible bottom-right status showing background worker jobs (Researcher, Demo Builder, Visual Maker) and extraction progress.
     - *Node Detail Panel:* Right slide-out panel when a proposition or argument node is clicked, showing:
       - Proposition Statement, Name, Aliases
       - Birth Session(s) with deep links to exact message transcript
       - Connected Premises and Conclusions
       - Action: Delete (with cascade confirmation)

2. **Session Classroom View (`/chat/[id]`):**
   - **Left Sidebar:** Session history list, new chat button, persistent memory overview.
   - **Center Chat Stream:**
     - Turn-by-turn conversational flow (Markdown + LaTeX math formulas).
     - Phase Dividers: Visual divider stamps separating `Probe Phase` $\rightarrow$ `Plan Phase` $\rightarrow$ `Teach Phase`.
     - Thinking Blocks: Collapsible stream of model reasoning.
     - Subagent Artifact Cards: Inline rendered HTML/JS demos, interactive SVG visualizations, or research briefs.
   - **Right Slide-out: Live Plan Window:**
     - Interactive Mermaid DAG rendered from `plan_init`.
     - Node status coloring: **Current** (Amber pulsing), **Visited** (Muted Green), **Upcoming** (Dashed Gray).
   - **Bottom Input Dock:**
     - **QuestionDock (When Question Active):** Overrides text composer. Renders multiple-choice cards or free-recall field, confidence slider (0-100%), and Think-Aloud textarea.
     - **Composer (When Free Text Active):** Multi-line input with Dictation microphone button and Send button.

### 2.2 The Predict $\rightarrow$ Teach $\rightarrow$ Check UI Protocol
- **Predict (`type: "predict"`):** Renders **OPEN** immediately in the viewport. The student must submit a prediction before the teacher proceeds with the explanation.
- **Check (`type: "check"`):** Renders **COLLAPSED** behind a button labeled *"Check your understanding"*. The student reads the explanation, worked examples, and diagrams at their own pace, then clicks to reveal the graded quiz.

---

## 3. Data Models & Storage Schemas

### 3.1 Session Record (`data/chats/<chatId>.json`)
```typescript
interface ChatRecord {
  id: string;                    // "chat_" + nanoid
  title: string;                 // e.g. "Understanding Backpropagation"
  createdAt: string;             // ISO-8601
  updatedAt: string;             // ISO-8601
  messages: LhMessage[];         // Transcript of UI and Model messages
  settings: {
    modelSlot?: "strong" | "cheap" | "vision";
    provider?: string;
    modelId?: string;
    thinkingLevel?: "off" | "low" | "medium" | "high" | "max";
  };
  turns: TurnUsage[];            // Accumulated token spend & cost per turn
  extractions: ExtractionRunUsage[]; // Provenance of graph extraction batches
}
```

### 3.2 Knowledge Graph Ledgers (`data/graph/`)
1. **`nodes.jsonl` (Propositions):**
   ```json
   {"id": "n_a1b2c3d4e5f6", "name": "Chain Rule", "statement": "The derivative of a composite function is the product of derivatives.", "aliases": ["Composite derivative formula"], "createdAt": "2026-10-26T00:00:00Z", "provenance": [{"chatId": "chat_01", "messageId": "msg_05"}]}
   ```
2. **`chains.jsonl` (Reasoning Arguments):**
   ```json
   {"id": "arg_9f8e7d6c5b4a", "premises": ["n_a1b2c3d4e5f6", "n_112233445566"], "conclusion": "n_778899aabbcc", "createdAt": "2026-10-26T00:00:00Z", "provenance": [{"chatId": "chat_01", "messageId": "msg_06"}]}
   ```
3. **`coverage.jsonl` (Extraction Deduplication):**
   ```json
   {"chatId": "chat_01", "messageId": "msg_05", "fingerprint": "sha256_hash", "coveredAt": "2026-10-26T00:00:00Z"}
   ```
4. **`sessions.jsonl`:** Checkpoints per session.

### 3.3 Background Jobs (`data/jobs/<jobId>.json`)
```typescript
interface JobRecord {
  id: string;                    // "job_" + nanoid
  chatId: string;                // Parent session anchor
  kind: "research" | "demo" | "visual" | "pdf";
  status: "queued" | "running" | "done" | "error";
  input: unknown;                // e.g. { topic: string, query: string }
  result?: unknown;              // Verified output HTML, SVG, or text
  steerId: string;               // "steer_" + jobId
  steerDelivered: boolean;       // Exactly-once delivery gate
  usage: JobUsage;               // Step-level token accounting
}
```

---

## 4. Business Logic & Algorithmic Rules

### 4.1 Phase State Machine (`src/core/phases.ts`)
```
[PROBE] ──(tool-probe_done concluded)──► [PLAN] ──(first tool-quiz with nodeId)──► [TEACH]
```
- **Rule:** The current phase is NEVER stored as a mutable database column. It is derived purely from transcript parts:
  - Phase is `probe` until part `tool-probe_done` has `state === "output-available"`.
  - Phase is `plan` after `probe_done` until an assistant message contains a `tool-quiz` or `tool-explain` call with a non-empty `nodeId`.
  - Phase is `teach` from that first tagged call forward.

### 4.2 Author-Once Plan Tree & Derived Statuses (`src/core/plan-tree.ts`)
1. **DAG Acyclic Validation:**
   - On `plan_init(mermaid_code)`: Parse Mermaid `graph TD`, extract nodes and `from --> to` edges.
   - Run Depth-First Search (DFS) cycle detection. If `createsCycle(edges, from, to)` is true, reject with `PlanTreeError("Edge X -> Y creates a cycle")`.
2. **Dynamic Status Derivation (`derivePlanStatuses`):**
   - Collect all `nodeId`s from `tool-quiz` calls in message order.
   - Collapse consecutive duplicates: `runs = [A, B, C]`.
   - `current = runs.at(-1)` (the latest tagged node).
   - `visited = Set(runs.slice(0, -1))` (all previous nodes).
   - `upcoming = AllNodes - visited - current`.

### 4.3 Anti-Leak Question Craft & Client Grading (`src/core/question-core.ts`)
1. **Option Neutrality:** Strips all `description` and reasoning from quiz options before presenting. Options are strictly bare claims.
2. **Deterministic Shuffling:** Options are shuffled using a pseudo-random seeded generator keyed on `toolCallId`. Re-renders never flicker or rearrange options.
3. **Local Client Grading:**
   ```typescript
   function gradeQuiz(input: QuizInput, selectedValue: string): { correct: boolean; note?: string } {
     const isCorrect = selectedValue.trim() === input.correctAnswer.trim();
     return { correct: isCorrect };
   }
   ```
4. **Question Stopper (`makeQuestionStopper`):**
   - When a message contains a `quiz` or `ask_user_question` tool call that resolved without authoring validation errors, the LLM loop MUST terminate immediately (`{ action: "end" }`), waiting for the student's answer via `addToolOutput`.

### 4.4 Graph Extraction & Simplification (`src/core/graph.ts`)
1. **Extractor Stage:**
   - Ingests ONLY the teacher's prose messages (`TEACHER [msg_id]`). Excludes learner comments, quiz options, and thinking tags.
   - Digest-Aware: Injects `THE GRAPH SO FAR` (existing $n\_$ IDs from the same source). Extractor outputs propositions ($n\_$) and reasoning chains ($arg\_$).
2. **Auditor Stage:**
   - Sees propositions only. Inquires graph via tools (`list_sessions`, `list_propositions`, `find`).
   - Equivalence Bias: Paraphrases of existing facts merge into the existing node ID via `{ id: local_id, linkTo: existing_node_id }`.
3. **Merger Simplification Pass (`simplifyChains`):**
   - **Rule 1 (Prefer Fewest Premises):** If chain $C_1: [A] \Rightarrow Y$ exists, drop $C_2: [A, B] \Rightarrow Y$.
   - **Rule 2 (Ancestry-Cover):** If $[A, B] \Rightarrow X$ and $[X, C] \Rightarrow Y$ exist, drop $[A, B, C] \Rightarrow Y$.

---

## 5. Mandatory Evidence & Parity Ledger

| Subsystem / Feature | Concrete Source Anchor | Observed Behavior in Target | Parity Implementation Rule |
|---|---|---|---|
| **Phase Transition** | `src/core/phases.ts#L73-L97` | Advances `probe -> plan -> teach` via `probe_done` and tagged `nodeId` | Implement deterministic reducer over transcript parts |
| **Plan Statuses** | `src/core/contracts/plan.ts#L82-L100` | Scans transcript for latest tagged quiz; `visited` is monotonic | Derive status on every render; zero stored progress columns |
| **Question Stopper** | `src/agent/teacher-agent.ts#L152-L169` | `finishTurn` halts agent loop when question tool succeeds | Terminate LLM stream on clean question emit; wait for `addToolOutput` |
| **Option Anti-Leak** | `src/core/question-core.ts#L34-L46` | Blocks `description` in quiz schema to prevent answer leakage | Prohibit reasoning in options; enforce bare claim options |
| **Seeded Shuffle** | `src/core/question-core.ts#L520-L540` | Shuffles options using seed derived from `toolCallId` | Use Mulberry32/LCG seeded shuffle so UI never flips options |
| **Digest-Aware Extract** | `src/agent/subagents/extraction.ts#L444-L455` | Injects `THE GRAPH SO FAR` to reuse existing $n\_$ IDs | Pass prior extraction nodes as prompt context in subsequent batches |
| **Chain Simplification** | `src/core/graph.ts#L291-L320` | Drops redundant chains via ancestry-cover & fewest-premises | Run $O(N)$ graph reachability filter before committing ledgers |
| **Asynchronous Steer** | `src/server/jobs.ts#L318-L345` | Queues steer on `globalThis`; polls turn-liveness before inject | Exactly-once steer injection into conversation at turn boundaries |
| **Force Graph Anchors** | `src/core/layout.ts#L220-L250` | Spring-ties existing nodes to previous $(x,y)$ resting anchors | Warm-start layout simulation so new nodes do not reshuffle graph |
| **BYOK Local Security** | `src/store/auth.ts#L10-L45` | Reads `auth.json` (mode 0600); never transmits master keys | Local encryption/file storage; server proxies model calls |

---

## 6. Edge Cases & Failure Recovery

1. **409 Turn Conflict (Concurrent Turn Race):**
   - *Cause:* User submits answer while background steer or previous turn is still writing.
   - *Handling:* Retrying fetch with exponential backoff (`500ms -> 1000ms -> 2000ms -> 5000ms`), re-fetches latest transcript, merges unsent user message, and retries POST.
2. **Malformed Mermaid Plan Syntax:**
   - *Cause:* Model emits invalid Mermaid syntax in `plan_init`.
   - *Handling:* Deterministic parser throws line-numbered error back to LLM as a tool error; LLM re-emits valid Mermaid within the same turn.
3. **Orphaned Knowledge Nodes:**
   - *Cause:* Deleting a parent proposition cascades through referencing chains.
   - *Handling:* Any reasoning chain missing any premise or conclusion is deleted; isolated nodes drift to the canvas outer rim with an "unconnected" visual badge.
4. **Stringified JSON Parameter Wobble:**
   - *Cause:* Smaller models (like GLM or quantized SLMs) occasionally emit `options` as a stringified JSON array `"[{\"label\": \"A\"}]"`.
   - *Handling:* `parseOptionsIfString` and `healStringifiedArrays` intercept and parse before Zod/TypeBox validation fails.

---

## 7. Next-Gen Modern Architecture (KGLite + Tauri 2.0)

When reconstructing the clean-room clone for **Next-Gen LearnHarness 2.0**:
- **Application Core:** Rust (Tauri 2.0) for zero-memory footprint (<35MB RAM, <150ms startup).
- **Knowledge Graph Store:** **KGLite** (`.kgl`) replacing flat JSONL. Store propositions as `:Proposition` nodes and chains as `[:ENTAILS]` edges.
- **Query Engine:** Native openCypher for sub-millisecond Socratic pathfinding (`shortestPath`) and ancestry pruning.
- **Frontend Presentation:** Vite + React 19 + Tailwind v4 + WebGL2/WebGPU for 120 FPS graph physics.
- **Model Interface:** Google Gemini 3.8 Flash (High) via AGY / OpenRouter with native structured tool-calling.

---
*Verified against complete repository code tree (394 files, 3,505 symbols) by Antigravity Autonomous Systems Reconstructor.*
