"use client";

import { X, MessageSquare, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Language } from "@/lib/utils/language";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  language: Language;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  messages: Message[];
  onNewChat?: () => void;
}

export function ChatSidebar({ isOpen, onClose, language, messages, onNewChat }: ChatSidebarProps) {
  const isArabic = language === "ar";

  // Group messages into conversations (for now, treat all messages as one conversation)
  const conversations: Conversation[] = messages.length > 0 ? [
    {
      id: "current",
      title: messages.find(m => m.role === "user")?.content.slice(0, 50) || (isArabic ? "محادثة جديدة" : "Nouvelle conversation"),
      lastMessage: messages[messages.length - 1]?.content.slice(0, 60) || "",
      timestamp: messages[messages.length - 1]?.timestamp || new Date(),
    }
  ] : [];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 w-80 bg-white border-r border-gray-200 z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isArabic && "right-0 border-l border-r-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2
              className={cn(
                "text-lg font-bold text-gray-900",
                isArabic && "font-arabic"
              )}
            >
              {isArabic ? "المحادثة الحالية" : "Conversation actuelle"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p
                  className={cn(
                    "text-gray-500 text-sm",
                    isArabic && "font-arabic"
                  )}
                >
                  {isArabic
                    ? "لا توجد رسائل بعد"
                    : "Aucun message"}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  language={language}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onNewChat}
              className={cn(
                "w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium",
                isArabic && "font-arabic"
              )}
            >
              {isArabic ? "محادثة جديدة" : "Nouvelle conversation"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function MessageItem({
  message,
  language,
}: {
  message: Message;
  language: Language;
}) {
  const isArabic = language === "ar";
  const isUser = message.role === "user";
  const timeAgo = getTimeAgo(message.timestamp, language);

  return (
    <div className="group relative">
      <div className={cn(
        "p-3 rounded-lg text-sm",
        isUser ? "bg-primary-50 border border-primary-200" : "bg-gray-50 border border-gray-200"
      )}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-600">
            {isUser ? (isArabic ? "أنت" : "Vous") : (isArabic ? "محامي" : "Mo7ami")}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
        <p
          className={cn(
            "text-gray-700 line-clamp-3 whitespace-pre-wrap",
            isArabic && "font-arabic text-right"
          )}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date, language: Language): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (language === "ar") {
    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  } else {
    if (diffMins < 1) return "maintenant";
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    return `il y a ${diffDays}j`;
  }
}
