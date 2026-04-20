import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions'; // تأكد من وجود هذا الملف
import RequestFormClient from './RequestFormClient';

export default async function RequestFormPage() {
  const session = await getServerSession(authOptions);

  // إذا لم يكن هناك جلسة، أعد التوجيه إلى صفحة تسجيل الدخول
  if (!session) {
    redirect('/auth/login');
  }

  // إذا كان مسجلاً، اعرض المكون العميل
  return <RequestFormClient />;
}