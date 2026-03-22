'use client';

import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-[#F0EAD6] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          {/* أيقونة البريد */}
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-[#00416A] mb-4">تحقق من بريدك الإلكتروني</h2>

          <p className="text-gray-600 mb-2">
            تم إنشاء حسابك بنجاح، ولكن يجب تفعيله عبر البريد الإلكتروني.
          </p>
          <p className="text-gray-600 mb-4">
            لقد أرسلنا رابط التفعيل إلى بريدك الإلكتروني. يرجى النقر على الرابط لتفعيل حسابك.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 text-right">
          <h4 className="font-semibold text-[#00416A] mb-2">لم يصلك البريد؟</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>تحقق من مجلد البريد المزعج (Spam).</li>
            <li>تأكد من كتابة بريدك الإلكتروني بشكل صحيح.</li>
            <li>إذا لم يصلك بعد عدة دقائق، حاول التسجيل مرة أخرى.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="block w-full px-6 py-3 bg-[#00416A] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة إلى تسجيل الدخول
          </Link>
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}