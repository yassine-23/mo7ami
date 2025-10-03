"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Language } from "@/lib/utils/language";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceInput: (transcript: string) => void;
  language: Language;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  onVoiceInput,
  language,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isArabic = language === "ar";

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  const handleVoiceStart = () => {
    setIsRecording(true);
  };

  const handleVoiceEnd = (transcript: string) => {
    setIsRecording(false);
    if (transcript) {
      onVoiceInput(transcript);
    }
  };

  const placeholder = isArabic
    ? "اكتب سؤالك هنا أو استخدم الميكروفون..."
    : "Tapez votre question ou utilisez le microphone...";

  return (
    <div className="relative">
      {/* Voice recording overlay */}
      {isRecording && (
        <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center z-10">
          <VoiceRecorder
            onTranscript={handleVoiceEnd}
            language={language}
            onCancel={() => setIsRecording(false)}
          />
        </div>
      )}

      {/* Text input */}
      <div
        className={cn(
          "flex items-end gap-1 sm:gap-2 p-2 sm:p-3 bg-white border-2 rounded-2xl transition-colors",
          disabled
            ? "border-gray-200 opacity-50"
            : "border-gray-300 focus-within:border-primary-500"
        )}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isRecording}
          rows={1}
          dir={isArabic ? "rtl" : "ltr"}
          className={cn(
            "flex-1 resize-none outline-none bg-transparent px-2 py-2",
            "placeholder:text-gray-400 max-h-[200px]",
            isArabic ? "font-arabic text-right" : "text-left"
          )}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Voice button */}
          <button
            type="button"
            onClick={handleVoiceStart}
            disabled={disabled}
            className={cn(
              "p-2 sm:p-2.5 rounded-full transition-colors",
              disabled
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100 hover:text-primary-600 active:scale-95"
            )}
            title={
              isArabic ? "التسجيل الصوتي" : "Enregistrement vocal"
            }
          >
            <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className={cn(
              "p-2 sm:p-2.5 rounded-full transition-all active:scale-95",
              disabled || !message.trim()
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-primary-600 text-white hover:bg-primary-700 shadow-lg"
            )}
            title={isArabic ? "إرسال" : "Envoyer"}
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Helper text */}
      <div
        className={cn(
          "mt-2 text-xs text-gray-500",
          isArabic ? "text-right" : "text-left"
        )}
      >
        {isArabic ? (
          <>
            <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> للإرسال •{" "}
            <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + Enter</kbd>{" "}
            لسطر جديد
          </>
        ) : (
          <>
            <kbd className="px-2 py-1 bg-gray-100 rounded">Entrée</kbd> pour
            envoyer •{" "}
            <kbd className="px-2 py-1 bg-gray-100 rounded">
              Maj + Entrée
            </kbd>{" "}
            nouvelle ligne
          </>
        )}
      </div>
    </div>
  );
}
