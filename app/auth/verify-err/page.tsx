'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VerifyErrorPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  let errorMessage = 'حدث خطأ أثناء التحقق من بريدك الإلكتروني.';
  if (reason === 'invalid-token') errorMessage = 'رابط التحقق غير صالح.';
  else if (reason === 'already-used') errorMessage = 'تم استخدام رابط التحقق مسبقاً.';
  else if (reason === 'expired') errorMessage = 'انتهت صلاحية رابط التحقق. يرجى التسجيل مرة أخرى.';
  else if (reason === 'missing-token') errorMessage = 'رابط التحقق غير موجود.';
  else if (reason === 'server-error') errorMessage = 'خطأ داخلي في الخادم. حاول لاحقاً.';

  return (
    <div className="min-h-screen bg-[#F0EAD6] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">فشل التحقق</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/auth/signup"
            className="block px-6 py-3 bg-[#00416A] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            إنشاء حساب جديد
          </Link>
          <Link
            href="/auth/login"
            className="block px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}