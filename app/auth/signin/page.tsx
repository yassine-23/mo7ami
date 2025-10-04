"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Chrome } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-xl border border-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">محامي Mo7ami</h1>
          <p className="text-gray-600">مساعدك القانوني الذكي</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            تسجيل الدخول
          </h2>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 rounded-xl font-medium text-gray-700 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
            ) : (
              <Chrome className="w-5 h-5" />
            )}
            <span>{isLoading ? "جاري التحميل..." : "تسجيل الدخول بواسطة Google"}</span>
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟ سيتم إنشاؤه تلقائياً عند تسجيل الدخول
            </p>
          </div>
        </div>

        {/* Anonymous Access */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">أو</p>
          <Link
            href="/chat"
            className="inline-block px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
          >
            المتابعة بدون حساب
          </Link>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-gray-700 text-center">
            بتسجيل الدخول، أنت توافق على{" "}
            <Link href="/privacy" className="underline text-teal-700">
              سياسة الخصوصية
            </Link>{" "}
            و{" "}
            <Link href="/terms" className="underline text-teal-700">
              شروط الاستخدام
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-teal-700">
            ← العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
