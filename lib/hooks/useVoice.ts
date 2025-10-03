import { useState, useCallback } from "react";
import { voiceApi } from "@/lib/api/client";

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(
    async (audioBlob: Blob, language: string) => {
      setIsProcessing(true);
      setError(null);

      try {
        const response = await voiceApi.transcribe(audioBlob, language);
        return response.text;
      } catch (err) {
        const errorMessage =
          language === "ar"
            ? "فشل تحويل الصوت إلى نص"
            : "Échec de la transcription";
        setError(errorMessage);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    isRecording,
    isProcessing,
    error,
    setIsRecording,
    transcribe,
  };
}

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback(
    async (
      text: string,
      language: string,
      voice: string = "female",
      speed: number = 1.0
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const audioBlob = await voiceApi.synthesize(text, language, voice, speed);

        // Create audio URL and play
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };

        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          const errorMessage =
            language === "ar"
              ? "فشل تشغيل الصوت"
              : "Échec de lecture audio";
          setError(errorMessage);
          setIsPlaying(false);
          setIsLoading(false);
        };

        await audio.play();
        return audio;
      } catch (err) {
        const errorMessage =
          language === "ar"
            ? "فشل تحويل النص إلى صوت"
            : "Échec de la synthèse vocale";
        setError(errorMessage);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  return {
    isPlaying,
    isLoading,
    error,
    speak,
  };
}
