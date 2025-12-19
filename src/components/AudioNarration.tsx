import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

export interface AudioNarrationProps {
  text: string;
  audioId?: string; // For future audio file integration
  speaker?: 'abby' | 'ameer' | 'ameerah' | 'mistress-creola' | 'narrator';
  autoPlay?: boolean;
  onComplete?: () => void;
  showReplay?: boolean;
  compact?: boolean;
}

export function AudioNarration({
  text,
  audioId,
  speaker = 'abby',
  autoPlay = false,
  onComplete,
  showReplay = true,
  compact = false,
}: AudioNarrationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);

  // TODO: Replace with actual audio implementation
  // For now, simulate audio playback
  const playAudio = () => {
    setIsPlaying(true);
    setHasPlayed(true);

    // Simulate audio duration based on text length (rough estimate: 150 words per minute)
    const words = text.split(' ').length;
    const durationMs = (words / 150) * 60 * 1000;

    // TODO: Replace with actual Web Speech API or audio file playback
    // Example using Web Speech API (for prototype):
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for K-2 learners
      utterance.pitch = speaker === 'abby' ? 1.1 : 1.0;
      utterance.onend = () => {
        setIsPlaying(false);
        onComplete?.();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback: just wait and complete
      setTimeout(() => {
        setIsPlaying(false);
        onComplete?.();
      }, Math.max(2000, durationMs));
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const replayAudio = () => {
    stopAudio();
    setTimeout(() => playAudio(), 100);
  };

  // Auto-play on mount if enabled
  useEffect(() => {
    if (autoPlay && !hasPlayed) {
      playAudio();
    }
    return () => stopAudio();
  }, [autoPlay]);

  // Speaker avatar/icon
  const getSpeakerIcon = () => {
    switch (speaker) {
      case 'abby':
        return '🐝';
      case 'ameer':
        return '👦';
      case 'ameerah':
        return '👧';
      case 'mistress-creola':
        return '👩‍🏫';
      default:
        return '📖';
    }
  };

  const getSpeakerName = () => {
    switch (speaker) {
      case 'abby':
        return 'Abby - Your AI Guide';
      case 'ameer':
        return 'Ameer';
      case 'ameerah':
        return 'Ameerah';
      case 'mistress-creola':
        return 'Mistress Creola';
      default:
        return 'Narrator';
    }
  };

  const getSpeakerColor = () => {
    switch (speaker) {
      case 'abby':
        return 'from-deep-blue to-aqua-blue';
      case 'ameer':
        return 'from-blue-500 to-blue-600';
      case 'ameerah':
        return 'from-pink-500 to-pink-600';
      case 'mistress-creola':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-aqua-blue/10 rounded-xl p-3">
        <button
          onClick={isPlaying ? stopAudio : playAudio}
          className="bg-deep-blue hover:bg-deep-blue/90 text-white rounded-full p-3 transition-all shadow-lg"
        >
          {isPlaying ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
          )}
        </button>

        {showCaptions && <p className="text-deep-blue flex-1">{text}</p>}

        {showReplay && hasPlayed && !isPlaying && (
          <button
            onClick={replayAudio}
            className="bg-white hover:bg-gray-50 text-deep-blue rounded-full p-2 transition-all shadow border-2 border-deep-blue/20"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => setShowCaptions(!showCaptions)}
          className="text-xs bg-white hover:bg-gray-50 text-deep-blue px-3 py-1 rounded-lg border-2 border-deep-blue/20 transition-all"
          title="Toggle Captions"
        >
          CC
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${getSpeakerColor()} rounded-2xl p-4 shadow-xl text-white`}
    >
      <div className="flex items-center gap-4">
        {/* Speaker Avatar */}
        <div className="text-4xl">{getSpeakerIcon()}</div>

        {/* Speaker Info & Text */}
        <div className="flex-1">
          <p className="text-sm opacity-90 mb-1">{getSpeakerName()}</p>
          {showCaptions && <p className="text-lg leading-relaxed">{text}</p>}
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={isPlaying ? stopAudio : playAudio}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all"
            aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
          >
            {isPlaying ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
            )}
          </button>

          {showReplay && hasPlayed && !isPlaying && (
            <button
              onClick={replayAudio}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all"
              aria-label="Replay audio"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-all"
            title="Toggle Captions"
          >
            CC
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Simple audio replay button for any screen
export function ReplayButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`fixed top-4 right-4 bg-deep-blue hover:bg-deep-blue/90 text-white rounded-full p-4 shadow-xl transition-all z-50 ${className}`}
      aria-label="Replay audio"
    >
      <Volume2 className="w-6 h-6" />
    </button>
  );
}
