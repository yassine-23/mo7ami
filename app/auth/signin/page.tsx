"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Chrome } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/chat" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-900 mb-2">محامي</h1>
            <p className="text-gray-600">Mo7ami</p>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-arabic">
              تسجيل الدخول
            </h2>
            <p className="text-gray-600 mb-1">Se connecter</p>
            <p className="text-sm text-gray-500 mt-4 font-arabic">
              سجل الدخول للوصول إلى سجل المحادثات والإعدادات
            </p>
            <p className="text-sm text-gray-500">
              Connectez-vous pour accéder à l'historique et aux paramètres
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 hover:border-primary-500 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <span>جاري التحميل... / Chargement...</span>
              </div>
            ) : (
              <>
                <Chrome className="w-5 h-5" />
                <span>متابعة مع Google / Continuer avec Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">أو / ou</span>
            </div>
          </div>

          {/* Continue without account */}
          <Link
            href="/chat"
            className="block w-full text-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <span className="font-arabic">متابعة بدون حساب</span>
            <br />
            <span className="text-sm">Continuer sans compte</span>
          </Link>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center mt-6">
            بالتسجيل، أنت توافق على{" "}
            <Link href="/terms" className="text-primary-600 hover:underline">
              الشروط
            </Link>{" "}
            و
            <Link href="/privacy" className="text-primary-600 hover:underline">
              سياسة الخصوصية
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-primary-600 transition-colors"
          >
            ← العودة إلى الصفحة الرئيسية / Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
