"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Language } from "@/lib/utils/language";
import axios from "axios";

interface AudioPlayerProps {
  text: string;
  language: Language;
  autoPlay?: boolean;
}

export function AudioPlayer({
  text,
  language,
  autoPlay = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isArabic = language === "ar";

  useEffect(() => {
    if (autoPlay) {
      handlePlay();
    }
  }, []);

  const handlePlay = async () => {
    if (isPlaying) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request TTS from backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/voice/synthesize`,
        {
          text,
          language,
          voice: "female",
          speed: 1.0,
        },
        {
          responseType: "blob",
        }
      );

      // Create audio blob URL
      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setError(
          isArabic ? "فشل تشغيل الصوت" : "Échec de lecture audio"
        );
        setIsPlaying(false);
        setIsLoading(false);
      };

      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      setError(
        isArabic
          ? "فشل تحويل النص إلى صوت"
          : "Échec de la synthèse vocale"
      );
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isLoading}
      className={cn(
        "p-2 rounded-full transition-all",
        error
          ? "text-red-600 hover:bg-red-50"
          : isPlaying
          ? "bg-primary-100 text-primary-600"
          : "text-gray-600 hover:bg-gray-100"
      )}
      title={
        isArabic
          ? isPlaying
            ? "إيقاف الصوت"
            : "تشغيل الصوت"
          : isPlaying
          ? "Arrêter l'audio"
          : "Lire l'audio"
      }
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isPlaying ? (
        <VolumeX className="w-5 h-5" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
}
