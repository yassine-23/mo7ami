"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { LanguageToggle } from "@/components/chat/LanguageToggle";
import { detectLanguage, getDirection, type Language } from "@/lib/utils/language";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  language: Language;
  citations?: Citation[];
  timestamp: Date;
}

interface Citation {
  source: string;
  article?: string;
  reference: string;
  url?: string;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<Language>("ar");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // New: sidebar collapse state
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const detectedLang = detectLanguage(content);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat`,
        {
          message: content,
          language: detectedLang,
          conversation_id: session?.user?.id || "anonymous",
        }
      );
      return { ...response.data, detectedLang };
    },
    onSuccess: (data, content) => {
      // Add assistant's response
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: data.answer,
        language: data.language,
        citations: data.citations,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      // Add error message
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content:
          language === "ar"
            ? "عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى."
            : "Désolé, une erreur s'est produite. Veuillez réessayer.",
        language,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSendMessage = (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content,
      language: detectLanguage(content),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Send to backend
    sendMessageMutation.mutate(content);
  };

  const handleVoiceInput = (transcript: string) => {
    handleSendMessage(transcript);
  };

  const direction = getDirection(language);

  return (
    <div className="flex h-screen bg-gray-50" dir={direction}>
      {/* Sidebar for conversation history */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        language={language}
        messages={messages}
        onNewChat={() => {
          setMessages([]);
          setIsSidebarOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          language={language}
        />

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <EmptyState language={language} onExampleClick={handleSendMessage} />
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {sendMessageMutation.isPending && (
                  <LoadingMessage language={language} />
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t bg-white">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <LanguageToggle
                language={language}
                onChange={setLanguage}
              />
              <span className="text-xs text-gray-500">
                {language === "ar"
                  ? "يتم اكتشاف اللغة تلقائياً"
                  : "Détection automatique de la langue"}
              </span>
            </div>
            <ChatInput
              onSendMessage={handleSendMessage}
              onVoiceInput={handleVoiceInput}
              language={language}
              disabled={sendMessageMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ language, onExampleClick }: { language: Language; onExampleClick: (text: string) => void }) {
  const examples =
    language === "ar"
      ? [
          "شنو كايقول القانون الجنائي على السرقة؟",
          "واش عندي الحق نطلب الطلاق؟",
          "كيفاش نسجل شركة جديدة؟",
        ]
      : [
          "Que dit le code pénal sur le vol ?",
          "Ai-je le droit de demander le divorce ?",
          "Comment enregistrer une nouvelle entreprise ?",
        ];

  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary-900 mb-2">
          {language === "ar" ? "محامي" : "Mo7ami"}
        </h1>
        <p className="text-xl text-gray-600 font-arabic">
          {language === "ar"
            ? "مساعدك القانوني الذكي"
            : "Votre assistant juridique intelligent"}
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700 font-medium">
          {language === "ar" ? "أمثلة على الأسئلة:" : "Exemples de questions:"}
        </p>
        <div className="grid gap-3 max-w-2xl mx-auto">
          {examples.map((example, i) => (
            <div
              key={i}
              onClick={() => onExampleClick(example)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onExampleClick(example);
                }
              }}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <p className="text-gray-700">{example}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
        <p className="text-sm text-gray-700">
          {language === "ar"
            ? "💡 نصيحة: يمكنك استخدام الصوت أو الكتابة للسؤال"
            : "💡 Conseil: Vous pouvez utiliser la voix ou le texte pour poser vos questions"}
        </p>
      </div>
    </div>
  );
}

function LoadingMessage({ language }: { language: Language }) {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
        <span className="text-primary-600 font-bold">م</span>
      </div>
      <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="loading-dot w-2 h-2 bg-primary-600 rounded-full"></div>
          <div className="loading-dot w-2 h-2 bg-primary-600 rounded-full"></div>
          <div className="loading-dot w-2 h-2 bg-primary-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
