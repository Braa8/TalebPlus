// app/api/admin/get-emails/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
   const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
if (session.user?.role !== 'admin') {
  return NextResponse.json({ error: 'غير مسموح' }, { status: 403 });
}
  try {
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.get();
    const emails = snapshot.docs
      .map(doc => doc.data().email)
      .filter(email => email && typeof email === 'string');
    
    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'فشل جلب الإيميلات' },
      { status: 500 }
    );
  }
}