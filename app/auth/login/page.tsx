"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/Services");
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EAD6] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-[#00416A] text-center mb-8">
          تسجيل الدخول
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00416A] focus:border-transparent"
              placeholder="example@domain.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00416A] focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00416A] text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>

          <div className="flex items-center justify-between mt-4">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-[#00416A] hover:underline"
            >
              نسيت كلمة المرور؟
            </Link>
            <Link
              href="/auth/resend-verification"
              className="text-sm text-[#00416A] hover:underline"
            >
              لم تستلم رابط التفعيل؟
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm">
          ليس لديك حساب؟{" "}
          <Link
            href="/auth/signup"
            className="text-[#00416A] font-semibold hover:underline"
          >
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}
