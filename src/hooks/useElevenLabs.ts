/// <reference types="vite/client" />
import { useState, useCallback } from 'react';

// Global state to track currently playing audio across all instances of the hook
let globalAudio: HTMLAudioElement | null = null;
let globalRequestId = 0;

export function useElevenLabs() {
    const [isPlaying, setIsPlaying] = useState(false);

    const playAudio = useCallback(async (textOrKey: string | string[], onComplete?: () => void) => {
        if (!textOrKey || (typeof textOrKey === 'string' && !textOrKey.trim()) || (Array.isArray(textOrKey) && textOrKey.length === 0)) {
            if (onComplete) onComplete();
            return;
        }

        const items = Array.isArray(textOrKey) ? textOrKey : [textOrKey];

        // Increment global request ID to cancel any pending requests
        const requestId = ++globalRequestId;

        // Stop any currently playing audio globally
        if (globalAudio) {
            globalAudio.pause();
            globalAudio.onended = null; // Clear previous listeners
            globalAudio.onerror = null;
            globalAudio = null;
        }

        // Also cancel any ongoing synthetic speech
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            // Mandatory delay to allow the engine to clear its queue before restarting
            // Increased to 150ms to ensure finicky browser engines reset properly
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        setIsPlaying(true);

        const playItem = (index: number) => {
            // Check if cancelled
            if (requestId !== globalRequestId) return;

            if (index >= items.length) {
                // Done playing all
                setIsPlaying(false);
                if (onComplete) onComplete();
                return;
            }

            const currentItem = items[index];
            if (!currentItem || !currentItem.trim()) {
                playItem(index + 1);
                return;
            }

            // Check if it's an audio key or raw text
            // Refined: Keys MUST contain an underscore (e.g., q1_naming)
            // This prevents custom names like "Max" from being mistaken for keys.
            const isKey = /^[a-zA-Z0-9]+_[a-zA-Z0-9_]+$/.test(currentItem);

            if (isKey) {
                // PLAY STATIC AUDIO FILE
                const audioUrl = `/audio/${currentItem}.mp3`;
                const audio = new Audio(audioUrl);
                globalAudio = audio;

                audio.onended = () => {
                    globalAudio = null;
                    playItem(index + 1);
                };

                audio.onerror = () => {
                    console.error(`Error playing static audio: /audio/${currentItem}.mp3`);
                    globalAudio = null;
                    playItem(index + 1); // Skip on error and continue
                };

                audio.play().catch(error => {
                    console.error("Failed to play static audio:", error);
                    playItem(index + 1);
                });
            } else {
                // PLAY DYNAMIC SYNTHETIC AUDIO
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(currentItem);
                    const voices = window.speechSynthesis.getVoices();
                    
                    // Priority list for female voices on Windows and other platforms
                    const preferredVoice = voices.find(v => v.name.includes('Zira')) || // Windows Female
                                         voices.find(v => v.name.includes('Salli')) || // AWS Polly (often available)
                                         voices.find(v => v.name.includes('Female')) || // Generic tagged
                                         voices.find(v => v.name.includes('Google US English')) || // Google Standard
                                         voices.find(v => v.lang.includes('en') && v.name.includes('Google')) ||
                                         voices.find(v => v.lang.includes('en'));
                                         
                    if (preferredVoice) {
                        console.log(`SpeechSynthesis using voice: ${preferredVoice.name}`);
                        utterance.voice = preferredVoice;
                    }

                    // Explicit settings to ensure consistency across browsers
                    utterance.volume = 1.0;
                    utterance.rate = 1.0;
                    utterance.pitch = 1.0;

                    // Removed pitch/rate adjustments based on user feedback to make it sound more natural and match the speed of the other recordings better.

                    let finished = false;
                    const timeoutId = setTimeout(() => {
                        if (!finished) {
                            console.warn("SpeechSynthesis timeout - proceeding to next item");
                            finished = true;
                            playItem(index + 1);
                        }
                    }, 5000); // 5s safety fallback

                    utterance.onend = () => {
                        if (!finished) {
                            finished = true;
                            clearTimeout(timeoutId);
                            playItem(index + 1);
                        }
                    };

                    utterance.onerror = (e) => {
                        console.error("SpeechSynthesis error", e);
                        if (!finished) {
                            finished = true;
                            clearTimeout(timeoutId);
                            playItem(index + 1);
                        }
                    };

                    // Ensure voices are loaded. On some browsers (Chrome), they load async.
                    if (voices.length === 0) {
                        window.speechSynthesis.onvoiceschanged = () => {
                            const updatedVoices = window.speechSynthesis.getVoices();
                            const newPreferredVoice = updatedVoices.find(v => v.name.includes('Zira')) || 
                                                    updatedVoices.find(v => v.name.includes('Female')) ||
                                                    updatedVoices.find(v => v.lang.includes('en'));
                            if (newPreferredVoice) utterance.voice = newPreferredVoice;
                            window.speechSynthesis.speak(utterance);
                            // Clean up listener to avoid memory leaks
                            window.speechSynthesis.onvoiceschanged = null;
                        };
                    } else {
                        window.speechSynthesis.speak(utterance);
                    }
                } else {
                    console.warn("SpeechSynthesis not supported in this browser.");
                    playItem(index + 1);
                }
            }
        };

        // Start sequence
        playItem(0);
    }, []);

    const stopAudio = useCallback(() => {
        globalRequestId++; // Cancel any pending loading globally
        if (globalAudio) {
            globalAudio.pause();
            globalAudio = null;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
    }, []);

    // Prefetching is no longer needed since we use standard static <audio> tags or SpeechSynthesis,
    // but we keep the signature so we don't break existing components like Quest1Naming.
    const prefetchAudio = useCallback(async (textOrKey: string | string[]) => {
        if (!textOrKey || (typeof textOrKey === 'string' && !textOrKey.trim()) || (Array.isArray(textOrKey) && textOrKey.length === 0)) return;

        const items = Array.isArray(textOrKey) ? textOrKey : [textOrKey];

        items.forEach(item => {
            if (!item || !item.trim()) return;
            const isKey = /^[a-zA-Z0-9_]+$/.test(item);

            if (isKey) {
                // Standard browser preloading behavior for static files
                const audioUrl = `/audio/${item}.mp3`;
                const audio = new Audio();
                audio.src = audioUrl;
                audio.preload = "auto";
            }
        });
    }, []);

    return { playAudio, stopAudio, prefetchAudio, isPlaying };
}
