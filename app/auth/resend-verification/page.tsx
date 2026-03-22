'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ');
      }

      setMessage('تم إعادة إرسال رابط التفعيل. يرجى التحقق من بريدك الإلكتروني.');
      setEmail('');
    } catch (err: unknown) {
        if (err instanceof Error)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EAD6] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-[#00416A] text-center mb-8">إعادة إرسال رابط التفعيل</h2>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00416A] text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري الإرسال...' : 'إعادة إرسال رابط التفعيل'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/auth/login" className="text-[#00416A] hover:underline">
            العودة إلى تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}