import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/verify-error?reason=missing-token', request.url));
    }

    // جلب رمز التحقق من Firestore
    const tokenDoc = await adminDb.collection('verificationTokens').doc(token).get();

    if (!tokenDoc.exists) {
      return NextResponse.redirect(new URL('/auth/verify-error?reason=invalid-token', request.url));
    }

    const tokenData = tokenDoc.data();

    if (!tokenData) {
      return NextResponse.redirect(new URL('/auth/verify-error?reason=invalid-token', request.url));
    }

    // التحقق من الصلاحية
    if (tokenData.used) {
      return NextResponse.redirect(new URL('/auth/verify-error?reason=already-used', request.url));
    }

    const now = new Date();
    const expiryDate = new Date(tokenData.expires);
    if (expiryDate < now) {
      return NextResponse.redirect(new URL('/auth/verify-error?reason=expired', request.url));
    }

    // تحديث المستخدم: تعيين emailVerified إلى التاريخ الحالي
    const userRef = adminDb.collection('users').doc(tokenData.userId);
    await userRef.update({
      emailVerified: new Date().toISOString(),
    });

    // تحديث الرمز إلى مستخدم
    await tokenDoc.ref.update({ used: true });

    // توجيه إلى صفحة نجاح التحقق
    return NextResponse.redirect(new URL('/auth/verify-success', request.url));
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(new URL('/auth/verify-error?reason=server-error', request.url));
  }
}