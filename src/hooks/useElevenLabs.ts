/// <reference types="vite/client" />
import { useState, useRef, useCallback } from 'react';

// In-memory cache to prevent re-fetching the same audio
// Maps string (text + voiceId) to a Blob URL
const audioCache = new Map<string, string>();

interface UseElevenLabsOptions {
    voiceId?: string;
}

export function useElevenLabs(options?: UseElevenLabsOptions) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Default to a specific voice ID if provided, otherwise use env var
    const defaultVoiceId = options?.voiceId || import.meta.env.VITE_ELEVENLABS_VOICE_ID;
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

    const playAudio = useCallback(async (text: string, onComplete?: () => void, customVoiceId?: string) => {
        const voiceId = customVoiceId || defaultVoiceId;

        if (!text || !text.trim()) {
            if (onComplete) onComplete();
            return;
        }

        // Stop current audio if playing
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        setIsPlaying(true);

        const cacheKey = `${voiceId}_${text}`;

        try {
            let audioUrl = audioCache.get(cacheKey);

            if (!audioUrl) {
                // If no API key is set, fallback to Web Speech API or just simulate
                if (!apiKey || apiKey === 'your_api_key_here') {
                    console.warn("ElevenLabs API Key is missing. Falling back to Web Speech API.");
                    if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.onend = () => {
                            setIsPlaying(false);
                            if (onComplete) onComplete();
                        };
                        window.speechSynthesis.speak(utterance);
                        return;
                    } else {
                        // Fallback simulation
                        setTimeout(() => {
                            setIsPlaying(false);
                            if (onComplete) onComplete();
                        }, 2000);
                        return;
                    }
                }

                // Fetch from ElevenLabs
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'xi-api-key': apiKey,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: 'eleven_monolingual_v1',
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.5
                        }
                    }),
                });

                if (!response.ok) {
                    throw new Error(`ElevenLabs API error: ${response.statusText}`);
                }

                const blob = await response.blob();
                audioUrl = URL.createObjectURL(blob);
                audioCache.set(cacheKey, audioUrl);
            }

            // Play the audio URL
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setIsPlaying(false);
                if (onComplete) onComplete();
            };

            audio.onerror = () => {
                console.error("Error playing audio.");
                setIsPlaying(false);
                if (onComplete) onComplete();
            };

            await audio.play();

        } catch (error) {
            console.error("Failed to play audio:", error);
            setIsPlaying(false);
            if (onComplete) onComplete();
        }
    }, [apiKey, defaultVoiceId]);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        } else if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
    }, []);

    return { playAudio, stopAudio, isPlaying };
}
