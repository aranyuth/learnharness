import type { Model, StreamFunction, SimpleStreamOptions, Api } from "@earendil-works/pi-ai";
import { streamSimple } from "@earendil-works/pi-ai/api/openai-completions";

export const ANTIGRAVITY_PROVIDER_ID = "antigravity";
export const ANTIGRAVITY_BASE_URL = "http://127.0.0.1:8000/v1";
export const ANTIGRAVITY_API_KEY = "agy-bridge";

interface BridgeState {
	connected: boolean;
	lastChecked: number;
	models: Model<"openai-completions">[];
}

const key = Symbol.for("lh.antigravity.bridge");

const DEFAULT_MODELS: Model<"openai-completions">[] = [
	{
		id: "gemini-3.8-flash-high",
		name: "Gemini 3.8 Flash High (AGY)",
		api: "openai-completions",
		provider: ANTIGRAVITY_PROVIDER_ID,
		baseUrl: ANTIGRAVITY_BASE_URL,
		reasoning: true,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 65536,
		type: "chat",
	},
	{
		id: "gemini-3.8-flash-medium",
		name: "Gemini 3.8 Flash Medium (AGY)",
		api: "openai-completions",
		provider: ANTIGRAVITY_PROVIDER_ID,
		baseUrl: ANTIGRAVITY_BASE_URL,
		reasoning: true,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 65536,
		type: "chat",
	},
	{
		id: "gemini-3.8-flash",
		name: "Gemini 3.8 Flash (AGY)",
		api: "openai-completions",
		provider: ANTIGRAVITY_PROVIDER_ID,
		baseUrl: ANTIGRAVITY_BASE_URL,
		reasoning: false,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 65536,
		type: "chat",
	},
	{
		id: "gemini-3.7-flash-medium",
		name: "Gemini 3.7 Flash Medium (AGY)",
		api: "openai-completions",
		provider: ANTIGRAVITY_PROVIDER_ID,
		baseUrl: ANTIGRAVITY_BASE_URL,
		reasoning: true,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 65536,
		type: "chat",
	},
	{
		id: "gemini-3.7-flash",
		name: "Gemini 3.7 Flash (AGY)",
		api: "openai-completions",
		provider: ANTIGRAVITY_PROVIDER_ID,
		baseUrl: ANTIGRAVITY_BASE_URL,
		reasoning: false,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 65536,
		type: "chat",
	},
	{
		id: "gemini-3.1-pro-high",
		name: "Gemini 3.1 Pro High (AGY)",
		api: "openai-completions",
		provider: ANTIGRAVITY_PROVIDER_ID,
		baseUrl: ANTIGRAVITY_BASE_URL,
		reasoning: true,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 2000000,
		maxTokens: 65536,
		type: "chat",
	},
	{
		id: "claude-sonnet-4.6-thinking",
		name: "Claude Sonnet 4.6 Thinking (AGY)",
		api: "openai-completions",
		provider: ANTIGRAVITY_PROVIDER_ID,
		baseUrl: ANTIGRAVITY_BASE_URL,
		reasoning: true,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 200000,
		maxTokens: 65536,
		type: "chat",
	},
	{
		id: "claude-opus-4.6-thinking",
		name: "Claude Opus 4.6 Thinking (AGY)",
		api: "openai-completions",
		provider: ANTIGRAVITY_PROVIDER_ID,
		baseUrl: ANTIGRAVITY_BASE_URL,
		reasoning: true,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 200000,
		maxTokens: 65536,
		type: "chat",
	},
	{
		id: "antigravity",
		name: "Antigravity Default (AGY)",
		api: "openai-completions",
		provider: ANTIGRAVITY_PROVIDER_ID,
		baseUrl: ANTIGRAVITY_BASE_URL,
		reasoning: false,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 65536,
		type: "chat",
	},
];

function getState(): BridgeState {
	const global = globalThis as typeof globalThis & { [key]?: BridgeState };
	if (!global[key]) {
		global[key] = {
			connected: true, // Optimistically true for localhost:8000
			lastChecked: 0,
			models: [...DEFAULT_MODELS],
		};
	}
	return global[key]!;
}

export function antigravityConnected(): boolean {
	const state = getState();
	return state.connected;
}

export function antigravityModels(): Model<"openai-completions">[] {
	const state = getState();
	return state.models;
}

export function antigravityModel(id: string): Model<"openai-completions"> | undefined {
	const state = getState();
	const found = state.models.find((m) => m.id === id);
	if (found) return found;

	// Dynamic fallback descriptor for any model known to the bridge
	return {
		id,
		name: `${id} (AGY)`,
		api: "openai-completions",
		provider: ANTIGRAVITY_PROVIDER_ID,
		baseUrl: ANTIGRAVITY_BASE_URL,
		reasoning: id.includes("thinking") || id.includes("high") || id.includes("medium"),
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 65536,
		type: "chat",
	};
}

export async function refreshAntigravityModels(): Promise<void> {
	const state = getState();
	const now = Date.now();
	if (now - state.lastChecked < 10000) return; // Cache for 10s

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 2000);
		const res = await fetch(`${ANTIGRAVITY_BASE_URL}/models`, {
			headers: { Authorization: `Bearer ${ANTIGRAVITY_API_KEY}` },
			signal: controller.signal,
		});
		clearTimeout(timeout);

		if (res.ok) {
			const json = (await res.json()) as { data?: Array<{ id: string; context_window?: number }> };
			if (Array.isArray(json.data) && json.data.length > 0) {
				state.connected = true;
				state.lastChecked = now;
				const fetched: Model<"openai-completions">[] = json.data.map((item) => {
					const isReasoning = item.id.includes("thinking") || item.id.includes("high") || item.id.includes("medium");
					return {
						id: item.id,
						name: `${item.id} (AGY)`,
						api: "openai-completions",
						provider: ANTIGRAVITY_PROVIDER_ID,
						baseUrl: ANTIGRAVITY_BASE_URL,
						reasoning: isReasoning,
						input: ["text", "image"],
						cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
						contextWindow: item.context_window ?? 1000000,
						maxTokens: 65536,
						type: "chat",
					};
				});
				state.models = fetched;
				return;
			}
		}
	} catch {
		// Keep existing models and set connected to false if check failed
	}
}

export const antigravityStream: StreamFunction<Api, SimpleStreamOptions> = (model, context, options) => {
	// Dispatch with AGY Bridge's local API key
	const stream = streamSimple as unknown as StreamFunction<Api, SimpleStreamOptions>;
	return stream(model, context, {
		...options,
		apiKey: ANTIGRAVITY_API_KEY,
	});
};
