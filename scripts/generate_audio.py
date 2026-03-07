import os
import json
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs import save

# Load environment variables
load_dotenv(".env.local")
API_KEY = os.getenv("VITE_ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("VITE_ELEVENLABS_VOICE_ID")

if not API_KEY or not VOICE_ID:
    print("Error: Missing VITE_ELEVENLABS_API_KEY or VITE_ELEVENLABS_VOICE_ID in .env.local")
    exit(1)

client = ElevenLabs(api_key=API_KEY)
AUDIO_DIR = os.path.join("public", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

# Load dialogue map
with open("src/docs/dialogue.json", "r") as f:
    dialogue_map = json.load(f)

print(f"Found {len(dialogue_map)} dialogue lines to process.")

for key, text in dialogue_map.items():
    file_path = os.path.join(AUDIO_DIR, f"{key}.mp3")
    
    if os.path.exists(file_path):
        print(f"[SKIPPED] {key}.mp3 already exists.")
        continue
        
    print(f"[GENERATING] {key}...")
    try:
        audio = client.generate(
            text=text,
            voice=VOICE_ID,
            model="eleven_turbo_v2_5"
        )
        save(audio, file_path)
        print(f"  -> Saved {key}.mp3")
    except Exception as e:
        print(f"  -> Error generating {key}: {e}")

print("Done!")
