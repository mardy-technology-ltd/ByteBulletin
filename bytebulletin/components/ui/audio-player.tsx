"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  text: string;
}

export function AudioPlayer({ text }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasSupport, setHasSupport] = useState(true);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || [];
        setVoices(availableVoices);
      };

      loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      setHasSupport(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } else if (isPaused) {
      synthRef.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      synthRef.current.cancel(); // Reset any existing speech

      // IMPORTANT: Create utterance right before speaking to avoid Chrome garbage collection bug
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a high-quality English voice
      const bestVoice = voices.find(v => v.name.includes("Natural") && v.lang.startsWith("en")) 
                     || voices.find(v => v.name.includes("Google UK English Female"))
                     || voices.find(v => v.name.includes("Google US English"))
                     || voices.find(v => v.lang.startsWith("en"));
      
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
      
      utterance.rate = 0.95; // Slightly slower for news reading
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      utterance.onerror = (e) => {
        // Ignore errors caused by the user intentionally stopping the audio
        if (e.error === "interrupted" || e.error === "canceled") {
           return;
        }
        console.error("Speech synthesis error", e);
        setIsPlaying(false);
        setIsPaused(false);
      };

      synthRef.current.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!hasSupport) return null;

  return (
    <div className="flex items-center gap-2 bg-background/50 rounded-full border px-3 py-1.5 shadow-sm">
      <div className="flex items-center text-xs font-medium text-muted-foreground mr-1">
        <Volume2 className={cn("w-3 h-3 mr-1.5", isPlaying && "text-primary animate-pulse")} />
        Listen
      </div>
      
      <button 
        onClick={togglePlay}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        )}
      </button>
      
      {(isPlaying || isPaused) && (
        <button 
          onClick={stop}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors focus:outline-none focus:ring-2 focus:ring-destructive/50"
          aria-label="Stop"
        >
          <Square className="w-3 h-3 fill-current" />
        </button>
      )}
    </div>
  );
}
