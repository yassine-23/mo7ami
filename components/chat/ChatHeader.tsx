"use client";

import { MessageSquare, User, LogOut, Settings, Plus, Clock } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { Language } from "@/lib/utils/language";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  language: Language;
  timestamp: Date;
}

interface ChatHeaderProps {
  onHistoryClick: () => void;
  language: Language;
  messages: Message[];
  onNewChat: () => void;
  showHistory: boolean;
}

export function ChatHeader({ onHistoryClick, language, messages, onNewChat, showHistory }: ChatHeaderProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isArabic = language === "ar";

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 relative">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-teal-700">
              {isArabic ? "محامي" : "Mo7ami"}
            </h1>
          </Link>

          {/* History button */}
          <button
            onClick={onHistoryClick}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              showHistory
                ? "bg-teal-100 text-teal-700"
                : "hover:bg-gray-100 text-gray-700"
            )}
            title={isArabic ? "سجل المحادثات" : "Historique"}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden md:inline">
              {isArabic ? "السجل" : "Historique"}
            </span>
            {messages.length > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-bold",
                showHistory ? "bg-teal-200 text-teal-800" : "bg-gray-200 text-gray-700"
              )}>
                {messages.length}
              </span>
            )}
          </button>

          {/* New chat button */}
          {messages.length > 0 && (
            <button
              onClick={onNewChat}
              className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm font-medium"
              title={isArabic ? "محادثة جديدة" : "Nouvelle conversation"}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">
                {isArabic ? "جديد" : "Nouveau"}
              </span>
            </button>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {session.user.name}
                </span>
              </button>

              {/* User dropdown menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span className={cn("text-sm", isArabic && "font-arabic")}>
                        {isArabic ? "الإعدادات" : "Paramètres"}
                      </span>
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className={cn("text-sm", isArabic && "font-arabic")}>
                        {isArabic ? "تسجيل الخروج" : "Se déconnecter"}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              {isArabic ? "تسجيل الدخول" : "Se connecter"}
            </Link>
          )}
        </div>
      </div>

      {/* History Dropdown */}
      {showHistory && messages.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={onHistoryClick}
          />
          <div className={cn(
            "absolute top-full mt-2 w-96 max-h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-20",
            isArabic ? "right-4" : "left-4"
          )}>
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                {isArabic ? "سجل المحادثة" : "Historique de conversation"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {messages.length} {isArabic ? "رسالة" : "messages"}
              </p>
            </div>
            <div className="overflow-y-auto max-h-80 p-3 space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "p-3 rounded-lg text-sm",
                    message.role === "user"
                      ? "bg-teal-50 border border-teal-200"
                      : "bg-gray-50 border border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      {message.role === "user"
                        ? (isArabic ? "أنت" : "Vous")
                        : (isArabic ? "محامي" : "Mo7ami")}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeAgo(message.timestamp, language)}</span>
                    </div>
                  </div>
                  <p className={cn(
                    "text-gray-700 line-clamp-3 whitespace-pre-wrap",
                    isArabic && "text-right"
                  )}>
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
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
