use crate::error::{CoreError, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::File;
use std::io::{BufReader, BufWriter};
use std::path::Path;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PropositionStatus {
    Unexplored,
    Probed,
    Hypothesized,
    Proven,
    Refuted,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropositionNode {
    pub id: String,
    pub label: String,
    pub statement: String,
    pub confidence: f32,
    pub status: PropositionStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImplicationNode {
    pub id: String,
    pub premises: Vec<String>,
    pub conclusion: String,
    pub rule_name: String,
    pub explanation: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct KglGraph {
    pub propositions: HashMap<String, PropositionNode>,
    pub implications: HashMap<String, ImplicationNode>,
    pub edges_in: HashMap<String, Vec<String>>,  // conclusion -> premises
    pub edges_out: HashMap<String, Vec<String>>, // premise -> conclusions
}

impl KglGraph {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_proposition(&mut self, id: impl Into<String>, label: impl Into<String>, statement: impl Into<String>) -> &PropositionNode {
        let id_str = id.into();
        let now = Utc::now();
        let node = PropositionNode {
            id: id_str.clone(),
            label: label.into(),
            statement: statement.into(),
            confidence: 0.0,
            status: PropositionStatus::Unexplored,
            created_at: now,
            updated_at: now,
        };
        self.propositions.insert(id_str.clone(), node);
        self.propositions.get(&id_str).expect("INVARIANT: freshly inserted node must exist")
    }

    pub fn add_implication(&mut self, id: impl Into<String>, premises: Vec<String>, conclusion: impl Into<String>, rule_name: impl Into<String>, explanation: impl Into<String>) {
        let id_str = id.into();
        let conc_str = conclusion.into();
        
        for p in &premises {
            self.edges_out.entry(p.clone()).or_default().push(conc_str.clone());
        }
        self.edges_in.entry(conc_str.clone()).or_default().extend(premises.clone());

        let impl_node = ImplicationNode {
            id: id_str.clone(),
            premises,
            conclusion: conc_str,
            rule_name: rule_name.into(),
            explanation: explanation.into(),
        };
        self.implications.insert(id_str, impl_node);
    }

    pub fn mark_proven(&mut self, id: &str, confidence: f32) -> Result<()> {
        let node = self.propositions.get_mut(id).ok_or_else(|| CoreError::NodeNotFound(id.to_string()))?;
        node.status = PropositionStatus::Proven;
        node.confidence = confidence.clamp(0.0, 1.0);
        node.updated_at = Utc::now();
        Ok(())
    }

    pub fn are_prerequisites_proven(&self, id: &str) -> bool {
        if let Some(premises) = self.edges_in.get(id) {
            premises.iter().all(|premise_id| {
                self.propositions.get(premise_id)
                    .map(|p| p.status == PropositionStatus::Proven)
                    .unwrap_or(false)
            })
        } else {
            true // No prerequisites
        }
    }

    pub fn get_proven_count(&self) -> usize {
        self.propositions.values().filter(|p| p.status == PropositionStatus::Proven).count()
    }

    pub fn save_to_kgl(&self, path: impl AsRef<Path>) -> Result<()> {
        let file = File::create(path)?;
        let writer = BufWriter::new(file);
        serde_json::to_writer_pretty(writer, self)?;
        Ok(())
    }

    pub fn load_from_kgl(path: impl AsRef<Path>) -> Result<Self> {
        let file = File::open(path)?;
        let reader = BufReader::new(file);
        let graph = serde_json::from_reader(reader)?;
        Ok(graph)
    }
}
