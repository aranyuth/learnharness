pub mod challenge;
pub mod epistemic;
pub mod error;
pub mod kglite;

pub use challenge::{Challenge, ChallengeOption, ChallengeType, SliderConfig};
pub use epistemic::{PlanStep, PlanState, ProbeState, SocraticSession, TeachState};
pub use error::{CoreError, Result};
pub use kglite::{ImplicationNode, KglGraph, PropositionNode, PropositionStatus};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_epistemic_typestate_pipeline() -> Result<()> {
        let mut graph = KglGraph::new();
        graph.add_proposition("n_gravity", "Gravity", "Gravity acts as the restoring force");
        graph.add_proposition("n_period", "Period", "Period is inversely proportional to sqrt(g)");
        graph.add_implication("arg_1", vec!["n_gravity".into()], "n_period", "Deduction", "By simple harmonic formula");

        // 1. Probe phase
        let session = SocraticSession::new("sess_001", graph);
        let session = session.record_probe_result(Some("n_gravity".into()), Some("n_period".into()));

        // 2. Transition to Plan
        let steps = vec![
            PlanStep { index: 0, concept_id: "n_gravity".into(), title: "Concept of Gravity".into(), completed: false },
            PlanStep { index: 1, concept_id: "n_period".into(), title: "Pendulum Period Formula".into(), completed: false },
        ];
        let session = session.transition_to_plan(steps)?;

        // 3. Transition to Teach
        let challenge1 = Challenge::new_multiple_choice(
            "ch_1",
            "n_gravity",
            "Gravity on the Moon",
            "If gravity is 1/6th on the Moon, does the pendulum swing faster or slower?",
            vec![
                ChallengeOption { id: 1, text: "Faster".into(), is_correct: false, explanation: "Wrong".into() },
                ChallengeOption { id: 2, text: "Slower".into(), is_correct: true, explanation: "Correct! T increases.".into() },
            ],
            "Gravity pulls back more gently.",
        );
        let mut teach_session = session.transition_to_teach(challenge1)?;

        assert_eq!(teach_session.state.current_step, 0);

        // 4. Verify answer and advance
        let is_finished = teach_session.verify_and_advance("n_gravity", 0.95, None)?;
        assert!(!is_finished);
        assert_eq!(teach_session.state.current_step, 1);
        assert_eq!(teach_session.graph.get_proven_count(), 1);

        Ok(())
    }
}
