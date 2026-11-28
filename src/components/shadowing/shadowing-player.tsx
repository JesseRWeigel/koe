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
    "listen" | "requesting" | "recording" | "finishing" | "compare" | "idle"
  >("idle");
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [voicesReady, setVoicesReady] = useState(false);
  const activity = useRef(0);
  const playback = useRef<HTMLAudioElement | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const busyRecording = ["requesting", "recording", "finishing"].includes(phase);

  const cancelActivity = useCallback(() => {
    activity.current++;
  }, []);

  // Pre-load voices on mount so "Listen" works on first click
  useEffect(() => {
    let mounted = true;
    ensureVoicesReady().then(() => {
      if (mounted) setVoicesReady(true);
    });
    return () => {
      mounted = false;
      cancelActivity();
      resetRecorder();
      stopTTS();
      playback.current?.pause();
      playback.current = null;
    };
  }, [cancelActivity]);

  const handleListen = useCallback(async () => {
    const request = ++activity.current;
    playback.current?.pause();
    setPhase("listen");

    // Ensure voices are loaded (usually instant after first load)
    await ensureVoicesReady();
    if (request !== activity.current) return;

    try {
      await speak(sentence, { lang: language, rate: 0.8 });
    } catch {
      // Utterance was cancelled or errored — ignore
    }

    // Preserve the current comparison when replaying the original.
    if (request === activity.current) {
      setPhase(recordingUrl ? "compare" : "idle");
    }
  }, [sentence, language, recordingUrl]);

  const handleRecord = useCallback(async () => {
    const request = ++activity.current;
    playback.current?.pause();
    playback.current = null;
    stopTTS();
    setRecordingUrl(null);
    setRecordingError(null);
    setPhase("requesting");
    try {
      const started = await startRecording();
      if (started && request === activity.current) setPhase("recording");
    } catch {
      if (request !== activity.current) return;
      setRecordingError("Could not start recording. Check microphone access and try again.");
      setPhase("idle");
    }
  }, []);

  const handleStopRecording = useCallback(async () => {
    const request = activity.current;
    setPhase("finishing");
    const url = await stopRecording();
    if (request !== activity.current) return;
    setRecordingUrl(url);
    if (!url) setRecordingError("No audio was recorded. Please try again.");
    setPhase(url ? "compare" : "idle");
  }, []);

  const handlePlayOriginal = useCallback(async () => {
    playback.current?.pause();
    try {
      await speak(sentence, { lang: language, rate: 0.8 });
    } catch {
      // cancelled — ignore
    }
  }, [sentence, language]);

  const handlePlayRecording = useCallback(() => {
    if (recordingUrl) {
      stopTTS();
      playback.current?.pause();
      const audio = new Audio(recordingUrl);
      playback.current = audio;
      void audio.play().catch(() => {
        if (playback.current === audio) setRecordingError("Could not play your recording.");
      });
    }
  }, [recordingUrl]);

  const handleReset = useCallback(() => {
    activity.current++;
    playback.current?.pause();
    playback.current = null;
    setRecordingError(null);
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
              disabled={busyRecording || phase === "listen" || !voicesReady}
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
                disabled={phase === "listen" || busyRecording}
                variant="outline"
                size="lg"
              >
                <MicIcon className="mr-2 h-5 w-5" />
                {phase === "requesting"
                  ? "Waiting for microphone…"
                  : phase === "finishing"
                    ? "Finishing recording…"
                    : "2. Record Yourself"}
              </Button>
            )}
          </div>

          {recordingError && <p role="alert">{recordingError}</p>}

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
