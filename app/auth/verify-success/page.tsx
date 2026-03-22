'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifySuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // اختياري: إعادة توجيه تلقائي بعد 5 ثوان
    const timer = setTimeout(() => {
      router.push('/auth/login');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F0EAD6] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">تم تفعيل الحساب بنجاح!</h2>
          <p className="text-gray-600 mb-2">
            تم التحقق من بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول إلى حسابك.
          </p>
          <p className="text-sm text-gray-500">
            سيتم إعادة توجيهك إلى صفحة تسجيل الدخول خلال 5 ثوانٍ...
          </p>
        </div>

        <Link
          href="/auth/login"
          className="inline-block px-6 py-3 bg-[#00416A] text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          تسجيل الدخول الآن
        </Link>
      </div>
    </div>
  );
}