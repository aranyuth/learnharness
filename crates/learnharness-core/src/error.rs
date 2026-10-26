use thiserror::Error;

#[derive(Error, Debug)]
pub enum CoreError {
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Epistemic state transition violation: {0}")]
    InvalidTransition(String),

    #[error("Node not found in KGLite graph: {0}")]
    NodeNotFound(String),

    #[error("Prerequisite not met for concept: {concept_id}, missing: {missing}")]
    PrerequisiteUnmet {
        concept_id: String,
        missing: String,
    },

    #[error("Inference provider error: {0}")]
    InferenceError(String),
}

pub type Result<T> = std::result::Result<T, CoreError>;
