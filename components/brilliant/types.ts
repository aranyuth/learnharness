export type EpistemicPhase = "probe" | "plan" | "teach";

export interface ChallengeOptionItem {
  id: number;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface SimulationSliderConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
}

export interface SocraticChallengeData {
  id: string;
  conceptId: string;
  phase: EpistemicPhase;
  stepNumber: number;
  totalSteps: number;
  hookHeadline: string;
  promptQuestion: string;
  options: ChallengeOptionItem[];
  simulationType?: "pendulum" | "spring" | "calculus" | "none";
  sliders?: SimulationSliderConfig[];
  epiphanyExplanation: string;
}

export interface RoadmapStepItem {
  index: number;
  conceptId: string;
  title: string;
  description: string;
  status: "completed" | "active" | "locked";
  provenProposition?: string;
}

export interface KgliteConstellationNode {
  id: string;
  label: string;
  statement: string;
  confidence: number;
  status: "proven" | "hypothesized" | "locked";
  x: number;
  y: number;
}

export interface KgliteConstellationEdge {
  from: string;
  to: string;
  ruleName: string;
}
