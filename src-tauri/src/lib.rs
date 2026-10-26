use learnharness_core::KglGraph;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub graph: Mutex<KglGraph>,
}

#[derive(Serialize, Deserialize)]
pub struct CommandResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

#[tauri::command]
fn get_session_info() -> CommandResponse<serde_json::Value> {
    CommandResponse {
        success: true,
        data: Some(serde_json::json!({
            "version": "2.0.0",
            "framework": "Tauri v2 + Rust Core + KGLite",
            "status": "ready",
            "active_lesson": "Simple Harmonic Motion & Pendulum"
        })),
        error: None,
    }
}

#[tauri::command]
fn record_simulation_metric(
    state: State<'_, AppState>,
    length: f64,
    gravity: f64,
    period: f64,
) -> CommandResponse<String> {
    let mut graph = match state.graph.lock() {
        Ok(g) => g,
        Err(e) => {
            return CommandResponse {
                success: false,
                data: None,
                error: Some(format!("Mutex poison error: {}", e)),
            }
        }
    };

    let node_id = "n_period_sim";
    graph.add_proposition(
        node_id,
        "Simulated Period",
        format!(
            "Observed T={:.2}s for L={:.1}m, g={:.1}m/s² via physics simulation",
            period, length, gravity
        ),
    );
    let _ = graph.mark_proven(node_id, 0.99);

    CommandResponse {
        success: true,
        data: Some(format!("Recorded T={:.2}s into KGLite graph successfully", period)),
        error: None,
    }
}

#[tauri::command]
fn query_kglite_graph(state: State<'_, AppState>) -> CommandResponse<serde_json::Value> {
    let graph = match state.graph.lock() {
        Ok(g) => g,
        Err(e) => {
            return CommandResponse {
                success: false,
                data: None,
                error: Some(format!("Mutex poison error: {}", e)),
            }
        }
    };

    match serde_json::to_value(&*graph) {
        Ok(val) => CommandResponse {
            success: true,
            data: Some(val),
            error: None,
        },
        Err(e) => CommandResponse {
            success: false,
            data: None,
            error: Some(e.to_string()),
        },
    }
}

pub fn run() {
    let mut initial_graph = KglGraph::new();
    initial_graph.add_proposition("n_gravity", "Gravity", "Gravity acts as restoring force");
    initial_graph.add_proposition("n_length", "String Length", "Length dictates trajectory arc");
    initial_graph.add_proposition("n_period", "Period Formula", "Period inversely proportional to sqrt(g)");
    let _ = initial_graph.mark_proven("n_gravity", 0.98);
    let _ = initial_graph.mark_proven("n_length", 0.95);

    let app_state = AppState {
        graph: Mutex::new(initial_graph),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_session_info,
            record_simulation_metric,
            query_kglite_graph
        ])
        .run(tauri::generate_context!())
        .expect("error while running learnharness tauri desktop application");
}
