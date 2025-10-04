"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, X, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Language } from "@/lib/utils/language";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  language: Language;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscript, language, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const touchStartYRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isArabic = language === "ar";
  const CANCEL_THRESHOLD = 100;

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 256;
      microphone.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const visualize = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average / 255);
        animationFrameRef.current = requestAnimationFrame(visualize);
      };
      visualize();

      const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      const mimeType = types.find(t => MediaRecorder.isTypeSupported(t)) || "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 0) await processAudio(audioBlob);
        cleanup();
      };

      mediaRecorder.start();
      setIsRecording(true);

      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone error:", err);
      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
            setError(isArabic ? "تم رفض إذن الميكروفون" : "Permission micro refusée");
            break;
          case "NotFoundError":
            setError(isArabic ? "لم يتم العثور على ميكروفون" : "Aucun microphone trouvé");
            break;
          case "NotReadableError":
            setError(isArabic ? "الميكروفون قيد الاستخدام" : "Microphone déjà utilisé");
            break;
          default:
            setError(isArabic ? "خطأ في الوصول إلى الميكروفون" : "Erreur d'accès au micro");
        }
      }
      cleanup();
    }
  }, [language, isArabic]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    audioChunksRef.current = [];
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    cleanup();
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("language", language);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/voice/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Transcription failed");

      const data = await response.json();
      if (data.text && data.text.trim()) {
        onTranscript(data.text.trim());
      } else {
        setError(isArabic ? "لم يتم التعرف على الصوت" : "Aucun son détecté");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setError(isArabic ? "فشل التعرف على الصوت. حاول مرة أخرى." : "Échec de la transcription. Réessayez.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setRecordingTime(0);
    setVolume(0);
    setSlideOffset(0);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isProcessing) return;
    e.preventDefault();
    touchStartYRef.current = e.touches[0].clientY;
    setIsTouching(true);
    startRecording();
  }, [disabled, isProcessing, startRecording]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTouching) return;
    const deltaY = touchStartYRef.current - e.touches[0].clientY;
    if (deltaY > 0) setSlideOffset(Math.min(deltaY, 150));
  }, [isTouching]);

  const handleTouchEnd = useCallback(() => {
    if (!isTouching) return;
    setIsTouching(false);
    if (slideOffset >= CANCEL_THRESHOLD) {
      cancelRecording();
    } else {
      stopRecording();
    }
    setSlideOffset(0);
  }, [isTouching, slideOffset, cancelRecording, stopRecording]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || isProcessing) return;
    e.preventDefault();
    touchStartYRef.current = e.clientY;
    setIsTouching(true);
    startRecording();
  }, [disabled, isProcessing, startRecording]);

  const handleMouseUp = useCallback(() => {
    if (!isTouching) return;
    setIsTouching(false);
    stopRecording();
  }, [isTouching, stopRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      cleanup();
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        disabled={disabled || isProcessing}
        className={cn(
          "p-3 rounded-full transition-all duration-200 touch-none",
          isRecording ? "bg-red-500 scale-110" : isProcessing ? "bg-gray-400" : "bg-teal-600 hover:bg-teal-700 active:scale-95",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        title={isArabic ? "اضغط مع الاستمرار للتسجيل" : "Maintenez pour enregistrer"}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}
      </button>

      {isRecording && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8">
            <div className={cn("text-center mb-4 transition-opacity", slideOffset >= CANCEL_THRESHOLD ? "opacity-100" : "opacity-60")}>
              <ChevronUp className="w-8 h-8 mx-auto text-red-500 animate-bounce" />
              <p className="text-sm text-red-500 font-medium">
                {isArabic ? "اسحب لأعلى للإلغاء" : "Glissez pour annuler"}
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="relative" style={{ transform: `translateY(-${slideOffset}px) scale(${1 + volume * 0.3})`, transition: "transform 0.1s" }}>
                <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" style={{ animationDuration: "1.5s" }} />
              </div>
              <div className="text-3xl font-mono font-bold text-gray-800">{formatTime(recordingTime)}</div>
              <div className="flex items-center gap-1 h-8">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-1 bg-teal-500 rounded-full transition-all duration-100" style={{ height: `${Math.random() * volume * 100 < (i + 1) * 5 ? 8 + Math.random() * 24 : 4}px` }} />
                ))}
              </div>
              <p className="text-sm text-gray-500 text-center">
                {isArabic ? "ارفع إصبعك لإرسال التسجيل" : "Relâchez pour envoyer"}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <X className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
