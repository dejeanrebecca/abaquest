# AbaQuest Project Rules

## Development Workflow
1. **Local Testing First**: ALWAYS verify changes in the local development environment (`npm run dev`) before proceeding to any deployment step.
2. **User Confirmation**: After local verification, explicitly request user confirmation before triggering any `gcloud` or `deploy.ps1` commands that affect the live site.
3. **Branch Hygiene**: Work in feature branches and merge only after local tests pass and the user approves the "Gold" phase integration.
4. **Narration Sync**: Whenever text in `src/docs/dialogue.json` is updated for audio regeneration, search for and update the matching `narrationText` in its corresponding `Quest*Story.tsx` file to maintain consistency.

## Audio Generation Standards
1. **Narration Splitting**: Use the 3-part splitting logic (`[MP3, Text, MP3]`) for custom names to conserve ElevenLabs tokens.
2. **Synthesizer Settings**: Prefer female-coded voices (e.g., "Microsoft Zira") for browser-based speech synthesis to ensure character consistency.
