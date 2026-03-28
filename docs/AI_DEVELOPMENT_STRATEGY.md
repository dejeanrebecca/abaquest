# AbaQuest AI Development Strategy

This guide outlines how to leverage AI efficiently during development without incurring high costs or getting blocked by rate limits.

## 1. Primary Engine: Gemini 1.5 Flash
For 90% of coding and documentation tasks, use **Gemini 1.5 Flash**.
- **Why**: It is extremely fast, has an enormous context window (2M tokens), and a very generous free tier in Google AI Studio.
- **Usage**: Feed the entire `src` and `db.json` into the context to get highly accurate, project-aware code suggestions.

## 2. Local Fallback: Ollama
When you hit Gemini rate limits or are offline, use your local **Ollama** setup:
- **Reasoning Tasks**: `ollama run gpt-oss:20b`
- **Lightweight Tasks / Wait Periods**: `ollama run phi3` (Fast, low resource usage).

## 3. Tech Stack System Prompt
When starting a new chat session for `abaquest`, use this system prompt to ensure consistency:

```text
You are an expert full-stack developer working on AbaQuest, an educational abacus app.
Core Tech Stack:
- Frontend: Vite + React (TypeScript)
- Styling: Tailwind CSS (Strictly no ad-hoc classes if a utility exists)
- Backend: Node.js (Express) + JSON Server
- Database: Firestore + local db.json
- Assets: Pre-generated MP3s and SVGs
Coding Standards:
- Use functional components and hooks.
- Follow the 'Generation-First, Consumption-Later' asset strategy.
- Maintain strict synchronization between dialogue.json and quest components.
```

## 4. Managing Pro Plan Credits
- **Claude Sonnet/Opus**: Reserve these for high-level curriculum design, complex debugging of the quest engine, or when you need "perfect" story generation.
- **Workflow**: 
  1. Prototype with **Flash**.
  2. Refine with **Sonnet** if logic is too complex for Flash.
  3. Finalize/Polish with **Opus** only if necessary.
