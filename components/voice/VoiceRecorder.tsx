"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Language } from "@/lib/utils/language";
import axios from "axios";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onCancel: () => void;
  language: Language;
}

export function VoiceRecorder({
  onTranscript,
  onCancel,
  language,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isArabic = language === "ar";

  useEffect(() => {
    startRecording();
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Process the recording
        if (chunksRef.current.length > 0) {
          await processRecording();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError(
        isArabic
          ? "تعذر الوصول إلى الميكروفون"
          : "Impossible d'accéder au microphone"
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);

    try {
      // Create audio blob
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

      // Send to backend for transcription
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("language", language);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/voice/transcribe`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { text } = response.data;

      if (text) {
        onTranscript(text);
      } else {
        throw new Error("No transcription received");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setError(
        isArabic
          ? "فشل تحويل الصوت إلى نص"
          : "Échec de la transcription"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStop = () => {
    stopRecording();
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      const stream = mediaRecorderRef.current.stream;
      stream.getTracks().forEach((track) => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-600" />
        </div>
        <p className={cn("text-red-600 mb-4", isArabic && "font-arabic")}>
          {error}
        </p>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          {isArabic ? "إغلاق" : "Fermer"}
        </button>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
        <p className={cn("text-gray-700", isArabic && "font-arabic")}>
          {isArabic
            ? "جاري تحويل الصوت إلى نص..."
            : "Transcription en cours..."}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      {/* Recording indicator */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center mx-auto recording-pulse">
          <Mic className="w-12 h-12 text-white" />
        </div>
        {/* Pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-red-500 opacity-50 animate-ping" />
        </div>
      </div>

      {/* Recording time */}
      <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
        {formatTime(recordingTime)}
      </div>

      <p className={cn("text-gray-600 mb-6", isArabic && "font-arabic")}>
        {isArabic ? "جاري التسجيل..." : "Enregistrement en cours..."}
      </p>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleCancel}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
        >
          {isArabic ? "إلغاء" : "Annuler"}
        </button>
        <button
          onClick={handleStop}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          <Square className="w-5 h-5" />
          {isArabic ? "إيقاف" : "Arrêter"}
        </button>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-500 mt-6">
        {isArabic
          ? "تحدث بوضوح للحصول على أفضل النتائج"
          : "Parlez clairement pour de meilleurs résultats"}
      </p>
    </div>
  );
}
