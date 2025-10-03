"use client";

import { Menu, User, LogOut, Settings } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { Language } from "@/lib/utils/language";

interface ChatHeaderProps {
  onMenuClick: () => void;
  language: Language;
}

export function ChatHeader({ onMenuClick, language }: ChatHeaderProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isArabic = language === "ar";

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isArabic ? "القائمة" : "Menu"}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary-900">
              {isArabic ? "محامي" : "Mo7ami"}
            </h1>
          </Link>
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
    </header>
  );
}
