import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
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