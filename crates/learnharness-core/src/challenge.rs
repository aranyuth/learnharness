use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChallengeType {
    MultipleChoice,
    SimulationSlider,
    FreeFormPrediction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChallengeOption {
    pub id: u8,
    pub text: String,
    pub is_correct: bool,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SliderConfig {
    pub label: String,
    pub min: f64,
    pub max: f64,
    pub step: f64,
    pub default_value: f64,
    pub unit: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Challenge {
    pub id: String,
    pub concept_id: String,
    pub challenge_type: ChallengeType,
    pub hook_headline: String,
    pub prompt_question: String,
    pub options: Vec<ChallengeOption>,
    pub slider_configs: Vec<SliderConfig>,
    pub epiphany_explanation: String,
}

impl Challenge {
    pub fn new_multiple_choice(
        id: impl Into<String>,
        concept_id: impl Into<String>,
        headline: impl Into<String>,
        question: impl Into<String>,
        options: Vec<ChallengeOption>,
        epiphany: impl Into<String>,
    ) -> Self {
        Self {
            id: id.into(),
            concept_id: concept_id.into(),
            challenge_type: ChallengeType::MultipleChoice,
            hook_headline: headline.into(),
            prompt_question: question.into(),
            options,
            slider_configs: Vec::new(),
            epiphany_explanation: epiphany.into(),
        }
    }
}
