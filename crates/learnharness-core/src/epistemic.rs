use crate::challenge::Challenge;
use crate::error::{CoreError, Result};
use crate::kglite::KglGraph;
use serde::{Deserialize, Serialize};

pub trait SessionState {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProbeState {
    pub floor_concept: Option<String>,
    pub ceiling_concept: Option<String>,
    pub probe_turn: u8,
}
impl SessionState for ProbeState {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanStep {
    pub index: usize,
    pub concept_id: String,
    pub title: String,
    pub completed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanState {
    pub steps: Vec<PlanStep>,
}
impl SessionState for PlanState {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeachState {
    pub steps: Vec<PlanStep>,
    pub current_step: usize,
    pub active_challenge: Option<Challenge>,
}
impl SessionState for TeachState {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SocraticSession<S: SessionState> {
    pub id: String,
    pub graph: KglGraph,
    pub state: S,
}

impl SocraticSession<ProbeState> {
    pub fn new(id: impl Into<String>, graph: KglGraph) -> Self {
        Self {
            id: id.into(),
            graph,
            state: ProbeState {
                floor_concept: None,
                ceiling_concept: None,
                probe_turn: 0,
            },
        }
    }

    pub fn record_probe_result(mut self, floor: Option<String>, ceiling: Option<String>) -> Self {
        self.state.floor_concept = floor;
        self.state.ceiling_concept = ceiling;
        self.state.probe_turn += 1;
        self
    }

    pub fn transition_to_plan(self, steps: Vec<PlanStep>) -> Result<SocraticSession<PlanState>> {
        if steps.is_empty() {
            return Err(CoreError::InvalidTransition("Plan must have at least one step".into()));
        }
        Ok(SocraticSession {
            id: self.id,
            graph: self.graph,
            state: PlanState { steps },
        })
    }
}

impl SocraticSession<PlanState> {
    pub fn transition_to_teach(self, first_challenge: Challenge) -> Result<SocraticSession<TeachState>> {
        Ok(SocraticSession {
            id: self.id,
            graph: self.graph,
            state: TeachState {
                steps: self.state.steps,
                current_step: 0,
                active_challenge: Some(first_challenge),
            },
        })
    }
}

impl SocraticSession<TeachState> {
    pub fn verify_and_advance(
        &mut self,
        concept_id: &str,
        confidence: f32,
        next_challenge: Option<Challenge>,
    ) -> Result<bool> {
        self.graph.mark_proven(concept_id, confidence)?;

        if let Some(step) = self.state.steps.get_mut(self.state.current_step) {
            step.completed = true;
        }

        if self.state.current_step + 1 < self.state.steps.len() {
            self.state.current_step += 1;
            self.state.active_challenge = next_challenge;
            Ok(false) // Not finished
        } else {
            self.state.active_challenge = None;
            Ok(true) // Finished entire lesson
        }
    }
}
