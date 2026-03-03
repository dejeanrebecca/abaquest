/// <reference types="vite/client" />
import { useState, useRef, useCallback } from 'react';

// In-memory cache to prevent re-fetching the same audio
// Maps string (text + voiceId) to a Promise of a Blob URL
const audioCache = new Map<string, Promise<string>>();

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
            let audioUrlPromise = audioCache.get(cacheKey);

            if (!audioUrlPromise) {
                // If no API key is set, we don't want to fallback to the synthesizer voice
                if (!apiKey || apiKey === 'your_api_key_here') {
                    console.warn("ElevenLabs API Key is missing. Narration is disabled.");
                    // Immediately trigger onComplete to allow the UI to progress
                    if (onComplete) onComplete();
                    setIsPlaying(false);
                    return;
                }

                audioUrlPromise = fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
                }).then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`ElevenLabs API error: ${response.statusText}`);
                    }
                    const blob = await response.blob();
                    return URL.createObjectURL(blob);
                }).catch((error) => {
                    audioCache.delete(cacheKey);
                    throw error;
                });

                audioCache.set(cacheKey, audioUrlPromise);
            }

            const audioUrl = await audioUrlPromise;

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

    const prefetchAudio = useCallback(async (text: string, customVoiceId?: string) => {
        const voiceId = customVoiceId || defaultVoiceId;

        if (!text || !text.trim()) return;

        const cacheKey = `${voiceId}_${text}`;

        if (audioCache.has(cacheKey)) return;

        try {
            if (!apiKey || apiKey === 'your_api_key_here') return;

            const promise = fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
            }).then(async (response) => {
                if (!response.ok) {
                    throw new Error(`ElevenLabs API prefetch error: ${response.statusText}`);
                }
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            }).catch((error) => {
                audioCache.delete(cacheKey);
                throw error;
            });

            audioCache.set(cacheKey, promise);
            await promise;

        } catch (error) {
            console.error("Failed to prefetch audio:", error);
        }
    }, [apiKey, defaultVoiceId]);

    return { playAudio, stopAudio, prefetchAudio, isPlaying };
}
