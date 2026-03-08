# AbaQuest Project Rules

## Audio & Narration Consistency
- **Rule**: Whenever the text in `dialogue.json` is updated for an MP3-backed narration, the corresponding `Quest*Story.tsx` or component file MUST be updated to match the exact same string.
- **Why**: The narrator component uses these strings for accessibility and visual synchronization. Mismatches lead to broken UI states or "voice-lag" impressions.
- **Quest 1 Naming**: Naming audio follow a 3-part sequence for custom names: `[q1_naming_great_name, <name>, q1_naming_is_ready]`. Suggested names use a single key: `q1_naming_<name>`.

## Development & Deployment Flow
- **Local Verification**: ALWAYS verify audio changes locally before attempting to commit or push.
- **Git Safety**: If a git lock (`.git/index.lock`) occurs, do not force-push without manual audit. Kill `node.exe` and `git.exe` processes before resetting.
- **Restoration**: In case of corruption, sync to the last known stable "Gold" commit on `origin/main` and manually re-apply definitive fixes.

## Component Standards
- **Quest Components**: Use `useElevenLabs` hook for all audio playback. Ensure `stopAudio` is called on cleanup.
- **Naming Logic**: Custom name synthesis MUST use the female voice "Zira" (Windows) or "Salli" as priority for character consistency.
