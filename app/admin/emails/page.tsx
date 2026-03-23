// app/admin/emails/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { adminDb } from '@/lib/firebaseAdmin';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import AdminEmailsClient from './AdminEmailsClient';

export default async function AdminEmailsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // تحقق من وجود الدور 'admin' في الجلسة
  if (session.user?.role !== 'admin') {
    redirect('/');
  }

  let emails: string[] = [];
  let errorMessage: string | undefined;

  try {
    console.log('Fetching users from Firestore...');
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.get();
    console.log(`Found ${snapshot.docs.length} documents in 'users' collection`);

    if (snapshot.docs.length > 0) {
      const firstDoc = snapshot.docs[0];
      console.log('First document data:', firstDoc.data());

      emails = snapshot.docs
        .map(doc => {
          const data = doc.data();
          const possibleEmail = data.email || data.Email || data.mail || data['e-mail'] || data.emailAddress;
          console.log('Document ID:', doc.id, 'Extracted email:', possibleEmail);
          return possibleEmail;
        })
        .filter(email => email && typeof email === 'string');
    }

    console.log('Final emails array:', emails);
  } catch (error) {
    console.error('Error in AdminEmailsPage:', error);
    errorMessage = 'حدث خطأ في جلب البيانات';
  }

  // تمرير البيانات إلى مكون العميل
  return <AdminEmailsClient initialEmails={emails} errorMessage={errorMessage} />;
}