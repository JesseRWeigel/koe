"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlayIcon,
  SquareIcon,
  MicIcon,
  RotateCcwIcon,
  Volume2Icon,
  LoaderIcon,
} from "lucide-react";
import { speak, stop as stopTTS, ensureVoicesReady } from "@/lib/audio/tts";
import {
  startRecording,
  stopRecording,
  getRecorderState,
  resetRecorder,
} from "@/lib/audio/recorder";
import type { LanguageCode } from "@/lib/languages";

interface ShadowingPlayerProps {
  sentence: string;
  reading?: string;
  meaning: string;
  language: LanguageCode;
}

export function ShadowingPlayer({
  sentence,
  reading,
  meaning,
  language,
}: ShadowingPlayerProps) {
  const [phase, setPhase] = useState<
    "listen" | "recording" | "compare" | "idle"
  >("idle");
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [voicesReady, setVoicesReady] = useState(false);
  const cancelledRef = useRef(false);

  // Pre-load voices on mount so "Listen" works on first click
  useEffect(() => {
    let mounted = true;
    ensureVoicesReady().then(() => {
      if (mounted) setVoicesReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleListen = useCallback(async () => {
    cancelledRef.current = false;
    setPhase("listen");

    // Ensure voices are loaded (usually instant after first load)
    await ensureVoicesReady();

    try {
      await speak(sentence, { lang: language, rate: 0.8 });
    } catch {
      // Utterance was cancelled or errored — ignore
    }

    // Only transition to idle if we weren't cancelled/reset
    if (!cancelledRef.current) {
      setPhase("idle");
    }
  }, [sentence, language]);

  const handleRecord = useCallback(async () => {
    try {
      resetRecorder();
      await startRecording();
      setPhase("recording");
    } catch {
      alert(
        "Microphone access denied. Please allow microphone access to use shadowing."
      );
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    stopRecording();
    // Small delay to let onstop fire
    setTimeout(() => {
      const state = getRecorderState();
      setRecordingUrl(state.audioUrl);
      setPhase("compare");
    }, 200);
  }, []);

  const handlePlayOriginal = useCallback(async () => {
    try {
      await speak(sentence, { lang: language, rate: 0.8 });
    } catch {
      // cancelled — ignore
    }
  }, [sentence, language]);

  const handlePlayRecording = useCallback(() => {
    if (recordingUrl) {
      const audio = new Audio(recordingUrl);
      audio.play();
    }
  }, [recordingUrl]);

  const handleReset = useCallback(() => {
    cancelledRef.current = true;
    stopTTS();
    resetRecorder();
    setRecordingUrl(null);
    setPhase("idle");
  }, []);

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{sentence}</CardTitle>
        {reading && (
          <p className="text-muted-foreground text-center text-lg">
            {reading}
          </p>
        )}
        <p className="text-muted-foreground text-center text-sm">{meaning}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Step 1: Listen */}
          <div className="flex gap-2">
            <Button
              onClick={handleListen}
              disabled={phase === "recording" || !voicesReady}
              variant={phase === "listen" ? "default" : "outline"}
              size="lg"
            >
              {!voicesReady ? (
                <LoaderIcon className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Volume2Icon className="mr-2 h-5 w-5" />
              )}
              {!voicesReady
                ? "Loading..."
                : phase === "listen"
                  ? "Playing..."
                  : "1. Listen"}
            </Button>
          </div>

          {/* Step 2: Record */}
          <div className="flex gap-2">
            {phase === "recording" ? (
              <Button
                onClick={handleStopRecording}
                variant="destructive"
                size="lg"
              >
                <SquareIcon className="mr-2 h-5 w-5" />
                Stop Recording
              </Button>
            ) : (
              <Button
                onClick={handleRecord}
                disabled={phase === "listen"}
                variant="outline"
                size="lg"
              >
                <MicIcon className="mr-2 h-5 w-5" />
                2. Record Yourself
              </Button>
            )}
          </div>

          {/* Step 3: Compare */}
          {phase === "compare" && recordingUrl && (
            <div className="flex w-full flex-col gap-3 rounded-lg border p-4">
              <p className="text-muted-foreground text-center text-sm font-medium">
                3. Compare
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={handlePlayOriginal} variant="outline">
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Original
                </Button>
                <Button onClick={handlePlayRecording} variant="outline">
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Your Recording
                </Button>
              </div>
            </div>
          )}

          {/* Reset */}
          {phase !== "idle" && (
            <Button onClick={handleReset} variant="ghost" size="sm">
              <RotateCcwIcon className="mr-2 h-4 w-4" />
              Start Over
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
