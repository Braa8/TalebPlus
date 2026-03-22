'use client';

import { useState } from 'react';

interface AdminEmailsClientProps {
  initialEmails?: string[];
  errorMessage?: string;
}

export default function AdminEmailsClient({ initialEmails = [], errorMessage }: AdminEmailsClientProps) {
  const [emails] = useState(initialEmails);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert('الرجاء إدخال الموضوع والرسالة');
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: data.message });
        setSubject('');
        setMessage('');
      } else {
        setResult({ success: false, message: data.error });
      }
    } catch (error) {
      setResult({ success: false, message: 'فشل الاتصال بالخادم' });
      console.log('Error sending bulk email:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#00416A] mb-6">إدارة الإيميلات</h1>
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">الإيميلات المخزنة ({emails.length})</h2>
          <div className="max-h-60 overflow-y-auto border rounded p-2">
            {emails.length > 0 ? (
              emails.map((email, idx) => (
                <div key={idx} className="py-1 border-b last:border-0">{email}</div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد إيميلات مخزنة</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">إرسال رسالة جماعية</h2>
          {result && (
            <div className={`p-4 rounded mb-4 ${result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {result.message}
            </div>
          )}
          <form onSubmit={handleSend}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">الموضوع</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00416A]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">الرسالة</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00416A]"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="bg-[#00416A] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}