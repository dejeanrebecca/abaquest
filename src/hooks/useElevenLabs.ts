/// <reference types="vite/client" />
import { useState, useCallback } from 'react';

// In-memory cache to prevent re-fetching the same audio
// Maps string (text + voiceId) to a Promise of a Blob URL
const audioCache = new Map<string, Promise<string>>();

interface UseElevenLabsOptions {
    voiceId?: string;
}

// Global state to track currently playing audio across all instances of the hook
let globalAudio: HTMLAudioElement | null = null;
let globalRequestId = 0;

export function useElevenLabs(options?: UseElevenLabsOptions) {
    const [isPlaying, setIsPlaying] = useState(false);

    // Default to a specific voice ID if provided, otherwise use env var
    const defaultVoiceId = options?.voiceId || import.meta.env.VITE_ELEVENLABS_VOICE_ID;
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

    const playAudio = useCallback(async (text: string, onComplete?: () => void, customVoiceId?: string) => {
        const voiceId = customVoiceId || defaultVoiceId;

        if (!text || !text.trim()) {
            if (onComplete) onComplete();
            return;
        }

        // Increment global request ID to cancel any pending requests
        const requestId = ++globalRequestId;

        // Stop any currently playing audio globally
        if (globalAudio) {
            globalAudio.pause();
            globalAudio = null;
        }

        setIsPlaying(true);

        const cacheKey = `${voiceId}_${text}`;

        try {
            let audioUrlPromise = audioCache.get(cacheKey);

            if (!audioUrlPromise) {
                // If no API key is set, we don't want to fallback to the synthesizer voice
                if (!apiKey || apiKey === 'your_api_key_here') {
                    console.warn("ElevenLabs API Key is missing. Narration is disabled.");
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

            // Check if this request was cancelled during the await (globally)
            if (requestId !== globalRequestId) {
                return;
            }

            // Play the audio URL
            const audio = new Audio(audioUrl);
            globalAudio = audio;

            audio.onended = () => {
                if (requestId === globalRequestId) {
                    setIsPlaying(false);
                    globalAudio = null;
                    if (onComplete) onComplete();
                }
            };

            audio.onerror = () => {
                console.error("Error playing audio.");
                if (requestId === globalRequestId) {
                    setIsPlaying(false);
                    globalAudio = null;
                    if (onComplete) onComplete();
                }
            };

            await audio.play();

        } catch (error) {
            console.error("Failed to play audio:", error);
            if (requestId === globalRequestId) {
                setIsPlaying(false);
                if (onComplete) onComplete();
            }
        }
    }, [apiKey, defaultVoiceId]);

    const stopAudio = useCallback(() => {
        globalRequestId++; // Cancel any pending loading globally
        if (globalAudio) {
            globalAudio.pause();
            globalAudio = null;
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
