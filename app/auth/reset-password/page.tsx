'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) setError('رابط غير صالح');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError('كلمة المرور غير متطابقة');
    if (password.length < 6) return setError('كلمة المرور قصيرة');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('تم إعادة التعيين بنجاح');
      setTimeout(() => router.push('/auth/login'), 3000);
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
        <h2 className="text-3xl font-bold text-[#00416A] text-center mb-8">إعادة تعيين كلمة المرور</h2>
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="password" placeholder="كلمة المرور الجديدة" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
          <input type="password" placeholder="تأكيد كلمة المرور" required value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
          <button type="submit" disabled={loading} className="w-full bg-[#00416A] text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
          </button>
        </form>
        <p className="mt-6 text-center">
          <Link href="/auth/login" className="text-[#00416A] hover:underline">العودة لتسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}