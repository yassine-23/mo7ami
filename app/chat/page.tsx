"use client";

export const dynamic = "force-dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { LanguageToggle } from "@/components/chat/LanguageToggle";
import { detectLanguage, getDirection, type Language } from "@/lib/utils/language";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

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

const ROTATING_EXAMPLES: Record<Language, string[][]> = {
  ar: [
    [
      "شنو كايقول القانون الجنائي على السرقة؟",
      "واش عندي الحق نطلب الطلاق؟",
      "كيفاش نسجل شركة جديدة؟",
    ],
    [
      "شنو هي حقوق العامل في المغرب؟",
      "كيفاش نقدم شكاية للبوليس؟",
      "شنو هي عقوبة التشهير الإلكتروني؟",
    ],
    [
      "كيفاش نحمي العلامة التجارية ديالي؟",
      "شنو الإجراءات باش نسترجع المال من منتوج معيب؟",
      "شنو شروط الحصول على رخصة محل تجاري؟",
    ],
    [
      "شنو هي حقوق المستهلك في التبادل الإلكتروني؟",
      "شنو الإجراءات ديال الإرث؟",
      "كيفاش نلغى عقد الكراء قبل ما يسالي؟",
    ],
  ],
  fr: [
    [
      "Que dit le code pénal sur le vol ?",
      "Ai-je le droit de demander le divorce ?",
      "Comment enregistrer une nouvelle entreprise ?",
    ],
    [
      "Quels sont les droits des salariés au Maroc ?",
      "Comment déposer une plainte à la police ?",
      "Quelle est la sanction pour la diffamation en ligne ?",
    ],
    [
      "Comment protéger ma marque commerciale ?",
      "Quelles étapes pour récupérer l'argent d'un produit défectueux ?",
      "Quelles conditions pour obtenir une licence de commerce ?",
    ],
    [
      "Quels sont les droits du consommateur dans la vente en ligne ?",
      "Quelle est la procédure de succession ?",
      "Comment résilier un bail avant son terme ?",
    ],
  ],
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<Language>("ar");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // New: sidebar collapse state
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ remaining: number; limit: number } | null>(null);
  const [usageError, setUsageError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const CLIENT_TOKEN_KEY = "mo7ami_client_token";
  const isArabic = language === "ar";
  const router = useRouter();
  const [processedPrompt, setProcessedPrompt] = useState<string | null>(null);

  // Ensure a persistent client token for anonymous usage tracking
  useEffect(() => {
    if (typeof window === "undefined") return;
    let token = window.localStorage.getItem(CLIENT_TOKEN_KEY);
    if (!token) {
      token = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
      window.localStorage.setItem(CLIENT_TOKEN_KEY, token);
    }
    setClientToken(token);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, voice }: { content: string; voice: boolean }) => {
      if (!clientToken) {
        throw new Error("CLIENT_TOKEN_NOT_READY");
      }

      const detectedLang = detectLanguage(content);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat`,
        {
          message: content,
          language: detectedLang,
          conversation_id: conversationId,
          voice_input: voice,
          user_id: session?.user?.id ?? null,
          client_token: clientToken,
        }
      );
      return { ...response.data, detectedLang };
    },
    onSuccess: (data, variables) => {
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
      setConversationId(data.conversation_id);
      setUsage({ remaining: data.remaining_questions, limit: data.daily_limit });
      setUsageError(null);
    },
    onError: (error: any) => {
      if ((error as Error).message === "CLIENT_TOKEN_NOT_READY") {
        console.warn("Client token not initialised yet");
        return;
      }

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        if (statusCode === 429) {
          const limit = Number(error.response?.data?.detail?.limit ?? (session?.user?.id ? 10 : 5));
          setUsage({ remaining: 0, limit });
          setUsageError(
            session?.user?.id
              ? isArabic
                ? "لقد وصلت إلى الحد اليومي لهذه الخدمة. جرّب مرة أخرى غداً."
                : "Vous avez atteint votre quota quotidien. Réessayez demain."
              : isArabic
                ? "لقد استهلكت الحصة المجانية لليوم. سجّل الدخول للحصول على عشرة أسئلة يومياً."
                : "Vous avez utilisé votre quota gratuit. Connectez-vous pour obtenir dix questions par jour."
          );
          return;
        }

        if (statusCode === 500) {
          setUsageError(
            isArabic
              ? "تعذر الحصول على الإجابة حالياً. تأكد من إعداد مفتاح OpenAI في الخادم أو أعد المحاولة لاحقاً."
              : "Impossible de récupérer la réponse. Vérifiez la clé OpenAI côté serveur ou réessayez plus tard."
          );
          return;
        }
      }

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

  const handleSendMessage = useCallback(
    (content: string, voice = false) => {
      if (!clientToken) {
        return;
      }

      if (usage?.remaining === 0) {
        if (!session?.user?.id) {
          setUsageError(
            isArabic
              ? "سجّل الدخول للحصول على عشرة أسئلة يومياً."
              : "Connectez-vous pour profiter de dix questions par jour."
          );
        }
        return;
      }

      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        role: "user",
        content,
        language: detectLanguage(content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      sendMessageMutation.mutate({ content, voice });
    },
    [clientToken, usage?.remaining, session?.user?.id, isArabic, sendMessageMutation]
  );

  const handleVoiceInput = (transcript: string) => {
    handleSendMessage(transcript, true);
  };

  const direction = getDirection(language);

  useEffect(() => {
    if (status === "unauthenticated") {
      setConversationId(null);
    }
  }, [status]);

  useEffect(() => {
    setUsage(null);
    setUsageError(null);
  }, [session?.user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get("prompt");
    const langParam = params.get("lang");

    if (langParam) {
      const normalizedLang = langParam === "fr" ? "fr" : "ar";
      if (normalizedLang !== language) {
        setLanguage(normalizedLang as Language);
      }
    }

    if (!prompt || processedPrompt === prompt || !clientToken) {
      return;
    }

    setMessages([]);
    setConversationId(null);
    setUsage(null);
    setUsageError(null);
    handleSendMessage(prompt);
    setProcessedPrompt(prompt);
    router.replace("/chat");
  }, [clientToken, handleSendMessage, processedPrompt, router, language]);

  if (status === "loading" || !clientToken) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-sm">Loading session…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50" dir={direction}>
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader
          onHistoryClick={() => setIsSidebarOpen(!isSidebarOpen)}
          language={language}
          messages={messages}
          onNewChat={() => {
            setMessages([]);
            setIsSidebarOpen(false);
            setConversationId(null);
            setUsageError(null);
          }}
          showHistory={isSidebarOpen}
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
            {!session?.user?.id && (
              <div className="mb-3 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
                {isArabic
                  ? "لديك خمس أسئلة مجانية يومياً دون تسجيل. سجّل الدخول لتحصل على عشرة أسئلة كل يوم."
                  : "Profitez de cinq questions gratuites par jour sans compte. Connectez-vous pour en obtenir dix."}
                <button
                  onClick={() => signIn("google")}
                  className="ml-3 rounded-full bg-teal-600 px-3 py-1 text-xs text-white hover:bg-teal-700"
                >
                  {isArabic ? "تسجيل الدخول" : "Se connecter"}
                </button>
              </div>
            )}

            {usageError && (
              <div className="mb-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {usageError}
              </div>
            )}

            {usage && usage.remaining >= 0 && (
              <div className="mb-2 text-xs text-gray-500">
                {isArabic
                  ? `الأسئلة المتبقية لليوم: ${usage.remaining} / ${usage.limit}`
                  : `Questions restantes aujourd'hui : ${usage.remaining} / ${usage.limit}`}
              </div>
            )}

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
              disabled={sendMessageMutation.isPending || usage?.remaining === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ language, onExampleClick }: { language: Language; onExampleClick: (text: string) => void }) {
  const exampleSets = ROTATING_EXAMPLES[language];
  const totalSets = exampleSets.length;
  const [setIndex, setSetIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setSetIndex(0);
    setTransitioning(false);
  }, [language]);

  useEffect(() => {
    if (totalSets <= 1) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setTransitioning(true);
      timeout = setTimeout(() => {
        setSetIndex((prev) => (prev + 1) % totalSets);
        setTransitioning(false);
      }, 250);
    }, 5000);

    return () => {
      clearInterval(interval);
      if (timeout) clearTimeout(timeout);
      setTransitioning(false);
    };
  }, [totalSets, language]);

  const currentExamples = exampleSets[setIndex] ?? [];

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
        <div className="grid gap-3 max-w-2xl mx-auto overflow-hidden">
          {currentExamples.map((example, i) => (
            <div
              key={`${setIndex}-${i}`}
              onClick={() => onExampleClick(example)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onExampleClick(example);
                }
              }}
              className={cn(
                "p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer transform",
                "hover:scale-105 active:scale-95 duration-300",
                transitioning ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
              )}
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
