import admin from 'firebase-admin';

// التحقق من وجود جميع المتغيرات البيئية المطلوبة
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Missing Firebase Admin environment variables');
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    throw error; // أو يمكنك التعامل مع الخطأ بطريقة مناسبة
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();