# Steel + Gemini Computer Use (Node/TypeScript)

This example wires **Gemini Computer Use** decision making to **Steel's Computer API** execution loop.

It demonstrates:

- Steel session creation/release
- screenshot → model decision → browser action loop
- Gemini normalized coordinates (`0..1000`) mapped to Steel pixel coordinates
- actions: move/click/double-click/scroll/type/key/wait/screenshot

## Prerequisites

- Node.js 20+
- Steel API key
- Gemini API key with access to `gemini-2.5-computer-use-preview`

## Setup

```bash
cd examples/steel-gemini-computer-use
npm install
cp .env.example .env
```

Edit `.env`:

```env
STEEL_API_KEY=your_steel_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
TASK=Go to steel.dev and summarize the latest news
GEMINI_MODEL=gemini-2.5-computer-use-preview
```

## Run

```bash
npm run dev
```

You should see:

- Steel session viewer URL
- step-by-step action logs
- final task output
- session release confirmation

## Notes

- This implementation uses the Gemini `generateContent` endpoint and expects a JSON action response each turn.
- If your model response format differs, adjust `parseActionFromText()` in `main.ts`.
- Coordinate conversion happens in `normalizedToPixel()`.
