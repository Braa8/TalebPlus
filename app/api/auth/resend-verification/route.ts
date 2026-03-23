import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { rateLimit } from '../../../../lib/rateLimit';
import { sanitizeInput } from '../../../../lib/sanitize'; // استيراد دالة التعقيم

export async function POST(request: NextRequest) {
  // تطبيق Rate Limiting
  const rateLimitResult = await rateLimit(request, {
    windowMs: 60 * 60 * 1000, // 1 ساعة
    max: 3,                   // 3 طلبات لكل IP في الساعة
    identifier: 'resend-verification',
  });
  if (rateLimitResult) return rateLimitResult;

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    // تعقيم البريد الإلكتروني
    const sanitizedEmail = sanitizeInput(email);

    // التحقق من وجود المستخدم
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.where('email', '==', sanitizedEmail).limit(1).get();

    if (snapshot.empty) {
      // لا نريد إعطاء معلومات عن وجود البريد أم لا لأمان، نعيد رسالة نجاح عامة
      return NextResponse.json(
        { message: 'إذا كان البريد مسجلاً، سيتم إرسال رابط التفعيل.' },
        { status: 200 }
      );
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // التحقق من أن الحساب غير مفعل
    if (userData.emailVerified) {
      return NextResponse.json(
        { error: 'هذا الحساب مفعل بالفعل. يمكنك تسجيل الدخول.' },
        { status: 400 }
      );
    }

    // إنشاء رمز تحقق جديد
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ساعة

    // حذف أي رموز سابقة لهذا المستخدم (اختياري)
    const oldTokens = await adminDb.collection('verificationTokens')
      .where('userId', '==', userDoc.id)
      .get();
    const batch = adminDb.batch();
    oldTokens.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // حفظ الرمز الجديد
    await adminDb.collection('verificationTokens').doc(verificationToken).set({
      userId: userDoc.id,
      email: sanitizedEmail,
      expires: tokenExpires.toISOString(),
      used: false,
    });

    // إرسال البريد الإلكتروني
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.NEXTAUTH_URL) {
      console.error('Missing email environment variables');
      return NextResponse.json(
        { error: 'خطأ في إعدادات البريد' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationLink = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sanitizedEmail,
      subject: 'تأكيد البريد الإلكتروني (إعادة إرسال)',
      html: `
        <div dir="rtl">
          <h2>مرحباً ${userData.name || 'مستخدم'}</h2>
          <p>إعادة إرسال رابط التفعيل. يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني:</p>
          <a href="${verificationLink}" style="background: #00416A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">تأكيد البريد الإلكتروني</a>
          <p>إذا لم تقم بطلب إعادة الإرسال، يمكنك تجاهل هذا البريد.</p>
          <p>الرابط صالح لمدة 24 ساعة.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'تم إعادة إرسال رابط التفعيل بنجاح.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي' },
      { status: 500 }
    );
  }
}