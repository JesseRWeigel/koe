"use client";

import { useState, useCallback, useEffect } from "react";
import { Volume2Icon, VolumeXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, stop, isSupported } from "@/lib/audio";

interface PlayButtonProps {
  text: string;
  lang: "ja" | "es" | "pt-BR" | "fr";
  size?: "sm" | "default";
  className?: string;
}

export function PlayButton({
  text,
  lang,
  size = "default",
  className,
}: PlayButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const supported = isSupported();

  // Stop playback when component unmounts
  useEffect(() => {
    return () => {
      if (isPlaying) {
        stop();
      }
    };
  }, [isPlaying]);

  const handleClick = useCallback(() => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    // Listen for speech end to reset state
    const synth = window.speechSynthesis;
    const checkEnded = () => {
      if (!synth.speaking) {
        setIsPlaying(false);
      }
    };

    speak(text, { lang });

    // Poll for speech end since SpeechSynthesisUtterance events
    // aren't reliably accessible through our speak() abstraction
    const interval = setInterval(() => {
      if (!synth.speaking) {
        setIsPlaying(false);
        clearInterval(interval);
      }
    }, 100);

    // Safety timeout: clear after 30s max
    setTimeout(() => {
      clearInterval(interval);
      setIsPlaying(false);
    }, 30000);
  }, [isPlaying, text, lang]);

  if (!supported) {
    return null;
  }

  const Icon = isPlaying ? VolumeXIcon : Volume2Icon;
  const buttonSize = size === "sm" ? "icon-sm" : "icon";
  const label = isPlaying ? "Stop audio" : "Play audio";

  return (
    <Button
      variant="ghost"
      size={buttonSize}
      className={className}
      onClick={handleClick}
      aria-label={label}
    >
      <Icon />
    </Button>
  );
}
