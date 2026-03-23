import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import bcrypt from 'bcryptjs';
import { rateLimit } from '../../../../lib/rateLimit';

export async function POST(request: NextRequest) {
  // تطبيق تحديد المعدل
  const rateLimitResult = await rateLimit(request, {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 2,
    identifier: 'reset-password',
  });
  if (rateLimitResult) return rateLimitResult;

  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'الرابط وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const resetDoc = await adminDb.collection('passwordResets').doc(token).get();

    if (!resetDoc.exists) {
      return NextResponse.json(
        { error: 'رابط إعادة التعيين غير صالح' },
        { status: 400 }
      );
    }

    const resetData = resetDoc.data();

    if (!resetData) {
      return NextResponse.json(
        { error: 'بيانات الرابط غير موجودة' },
        { status: 400 }
      );
    }

    if (resetData.used) {
      return NextResponse.json(
        { error: 'تم استخدام هذا الرابط من قبل' },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiryDate = new Date(resetData.expires);
    if (expiryDate < now) {
      return NextResponse.json(
        { error: 'انتهت صلاحية الرابط' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await adminDb.collection('users').doc(resetData.userId).update({
      password: hashedPassword,
    });

    await resetDoc.ref.update({ used: true });

    return NextResponse.json(
      { message: 'تم إعادة تعيين كلمة المرور بنجاح' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي' },
      { status: 500 }
    );
  }
}