import dotenv from "dotenv";
import Steel from "steel-sdk";

dotenv.config();

const STEEL_API_KEY = process.env.STEEL_API_KEY?.trim() ?? "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() ?? "";
const TASK = process.env.TASK?.trim() ?? "Go to steel.dev and summarize the latest news";
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() ?? "gemini-2.5-computer-use-preview-10-2025";

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 768;
const MAX_STEPS = 30;

type SteelAction =
  | { action: "move_mouse"; coordinates: [number, number]; screenshot?: boolean }
  | {
      action: "click_mouse";
      button: "left" | "right" | "middle" | "back" | "forward";
      coordinates?: [number, number];
      num_clicks?: number;
      screenshot?: boolean;
    }
  | { action: "scroll"; coordinates?: [number, number]; delta_x?: number; delta_y?: number; screenshot?: boolean }
  | { action: "type_text"; text: string; screenshot?: boolean }
  | { action: "press_key"; keys: string[]; screenshot?: boolean }
  | { action: "wait"; duration: number; screenshot?: boolean }
  | { action: "take_screenshot" };

type ParsedAction =
  | { kind: "move"; x: number; y: number }
  | { kind: "click"; x: number; y: number; button?: "left" | "right" | "middle"; numClicks?: number }
  | { kind: "double_click"; x: number; y: number }
  | { kind: "scroll"; x?: number; y?: number; deltaX?: number; deltaY?: number }
  | { kind: "type"; text: string }
  | { kind: "keypress"; keys: string[] }
  | { kind: "wait"; ms?: number }
  | { kind: "screenshot" }
  | { kind: "final"; message: string };

function assertEnv(): void {
  if (!STEEL_API_KEY) throw new Error("Missing STEEL_API_KEY in .env");
  if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY in .env");
  if (!STEEL_API_KEY.startsWith("ste-")) {
    throw new Error("Invalid STEEL_API_KEY format (expected key starting with 'ste-')");
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function normalizedToPixel(x: number, y: number): [number, number] {
  const nx = clamp(Number(x), 0, 1000);
  const ny = clamp(Number(y), 0, 1000);
  return [Math.round((nx / 1000) * VIEWPORT_WIDTH), Math.round((ny / 1000) * VIEWPORT_HEIGHT)];
}

function mapActionToSteel(action: ParsedAction): SteelAction {
  switch (action.kind) {
    case "move": {
      return { action: "move_mouse", coordinates: normalizedToPixel(action.x, action.y), screenshot: true };
    }
    case "click": {
      return {
        action: "click_mouse",
        button: action.button ?? "left",
        coordinates: normalizedToPixel(action.x, action.y),
        ...(action.numClicks && action.numClicks > 1 ? { num_clicks: action.numClicks } : {}),
        screenshot: true,
      };
    }
    case "double_click": {
      return {
        action: "click_mouse",
        button: "left",
        coordinates: normalizedToPixel(action.x, action.y),
        num_clicks: 2,
        screenshot: true,
      };
    }
    case "scroll": {
      return {
        action: "scroll",
        ...(typeof action.x === "number" && typeof action.y === "number"
          ? { coordinates: normalizedToPixel(action.x, action.y) }
          : {}),
        ...(typeof action.deltaX === "number" ? { delta_x: action.deltaX } : {}),
        ...(typeof action.deltaY === "number" ? { delta_y: action.deltaY } : {}),
        screenshot: true,
      };
    }
    case "type":
      return { action: "type_text", text: action.text, screenshot: true };
    case "keypress":
      return { action: "press_key", keys: action.keys, screenshot: true };
    case "wait":
      return { action: "wait", duration: Math.max(0.05, (action.ms ?? 1000) / 1000), screenshot: true };
    case "screenshot":
      return { action: "take_screenshot" };
    case "final":
      return { action: "take_screenshot" };
  }
}

function parseActionFromText(text: string): ParsedAction | null {
  const clean = text.trim();

  const fenced = clean.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? clean;

  try {
    const parsed = JSON.parse(candidate) as Record<string, unknown>;

    if (typeof parsed.final === "string") return { kind: "final", message: parsed.final };
    if (typeof parsed.message === "string" && parsed.done === true) return { kind: "final", message: parsed.message };

    const action = (parsed.action ?? parsed) as Record<string, unknown>;
    const type = String(action.type ?? "").toLowerCase();

    if (type === "move") return { kind: "move", x: Number(action.x), y: Number(action.y) };
    if (type === "click") {
      return {
        kind: "click",
        x: Number(action.x),
        y: Number(action.y),
        button: typeof action.button === "string" ? (action.button as "left" | "right" | "middle") : "left",
        numClicks: typeof action.num_clicks === "number" ? action.num_clicks : 1,
      };
    }
    if (type === "double_click" || type === "doubleclick") {
      return { kind: "double_click", x: Number(action.x), y: Number(action.y) };
    }
    if (type === "scroll") {
      return {
        kind: "scroll",
        x: typeof action.x === "number" ? action.x : undefined,
        y: typeof action.y === "number" ? action.y : undefined,
        deltaX: typeof action.delta_x === "number" ? action.delta_x : 0,
        deltaY: typeof action.delta_y === "number" ? action.delta_y : 500,
      };
    }
    if (type === "type") return { kind: "type", text: String(action.text ?? "") };
    if (type === "keypress") {
      if (Array.isArray(action.keys)) return { kind: "keypress", keys: action.keys.map((k) => String(k)) };
      if (typeof action.keys === "string") return { kind: "keypress", keys: action.keys.split("+").map((k) => k.trim()) };
    }
    if (type === "wait") return { kind: "wait", ms: typeof action.ms === "number" ? action.ms : 1000 };
    if (type === "screenshot") return { kind: "screenshot" };
  } catch {
    // Ignore parse failures and fall through
  }

  return null;
}

async function callGemini(task: string, step: number, screenshotBase64: string, history: string[]): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL,
  )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const system = [
    "You are controlling a remote browser through Steel Computer API.",
    "Use normalized coordinates from 0..1000 for x and y.",
    "Return ONLY valid JSON with one of:",
    '{"action":{"type":"move","x":500,"y":500}}',
    '{"action":{"type":"click","x":500,"y":500,"button":"left","num_clicks":1}}',
    '{"action":{"type":"double_click","x":500,"y":500}}',
    '{"action":{"type":"scroll","delta_x":0,"delta_y":600}}',
    '{"action":{"type":"type","text":"hello"}}',
    '{"action":{"type":"keypress","keys":["Enter"]}}',
    '{"action":{"type":"wait","ms":1000}}',
    '{"action":{"type":"screenshot"}}',
    '{"final":"short final answer"}',
    "No markdown, no prose outside JSON.",
  ].join("\n");

  const prompt = [
    `Task: ${task}`,
    `Step: ${step}/${MAX_STEPS}`,
    history.length ? `Recent history:\n${history.slice(-6).join("\n")}` : "",
    "Use the screenshot to decide the next best action.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const body = {
    systemInstruction: {
      parts: [{ text: system }],
    },
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/png",
              data: screenshotBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 600,
    },
  };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini API error ${resp.status}: ${text}`);
  }

  const json = (await resp.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("\n");
  if (!text) throw new Error("Gemini returned no text action payload");
  return text;
}

async function run(): Promise<void> {
  assertEnv();

  const steel = new Steel({ steelAPIKey: STEEL_API_KEY });
  let sessionId: string | null = null;

  try {
    const session = await steel.sessions.create({
      dimensions: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
      timeout: 15 * 60 * 1000,
      blockAds: true,
    });

    sessionId = session.id;
    console.log("✅ Steel session started");
    console.log(`🔗 Live viewer: ${session.sessionViewerUrl}`);

    const history: string[] = [];
    let finalMessage = "Task ended without explicit final message.";

    let screenshotResp = await steel.sessions.computer(session.id, { action: "take_screenshot" });
    let screenshotBase64 = screenshotResp.base64_image;

    if (!screenshotBase64) throw new Error("No screenshot from initial Steel capture");

    for (let step = 1; step <= MAX_STEPS; step++) {
      const modelText = await callGemini(TASK, step, screenshotBase64, history);
      const parsed = parseActionFromText(modelText);

      if (!parsed) {
        throw new Error(`Unable to parse Gemini action JSON at step ${step}. Raw:\n${modelText}`);
      }

      if (parsed.kind === "final") {
        finalMessage = parsed.message;
        console.log(`\n🎉 Final: ${finalMessage}`);
        break;
      }

      const steelAction = mapActionToSteel(parsed);
      history.push(`step ${step}: ${JSON.stringify(parsed)}`);
      console.log(`➡️  ${JSON.stringify(parsed)}`);

      const computerResp = await steel.sessions.computer(session.id, steelAction);
      screenshotBase64 = computerResp.base64_image;

      if (!screenshotBase64) {
        const fallback = await steel.sessions.computer(session.id, { action: "take_screenshot" });
        screenshotBase64 = fallback.base64_image;
      }

      if (!screenshotBase64) {
        throw new Error("No screenshot returned after action");
      }
    }

    console.log("\n🧾 Task:", TASK);
    console.log("✅ Result:", finalMessage);
  } finally {
    if (sessionId) {
      await steel.sessions.release(sessionId);
      console.log("🧹 Steel session released");
    }
  }
}

run().catch((err) => {
  console.error("❌ Runner failed:", err);
  process.exit(1);
});
