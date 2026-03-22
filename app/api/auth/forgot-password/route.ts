import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { rateLimit } from '@/lib/rateLimit';
import { sanitizeInput } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
  try {
    // تحديد معدل الطلبات (3 طلبات لكل IP في الساعة)
    const rateLimitResult = await rateLimit(request, {
      windowMs: 60 * 60 * 1000,
      max: 3,
      identifier: 'forgot-password',
    });
    if (rateLimitResult) return rateLimitResult;

    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'البريد مطلوب' }, { status: 400 });

    // تعقيم البريد الإلكتروني
    const sanitizedEmail = sanitizeInput(email);

    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.where('email', '==', sanitizedEmail).limit(1).get();
    if (snapshot.empty) {
      // لأسباب أمنية، نعيد نفس الرسالة حتى لو لم يكن المستخدم موجوداً
      return NextResponse.json({ message: 'إذا كان البريد موجودًا، سيتم إرسال الرابط' });
    }

    const userDoc = snapshot.docs[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // ساعة واحدة

    await adminDb.collection('passwordResets').doc(token).set({
      userId: userDoc.id,
      email: sanitizedEmail,
      expires: expires.toISOString(),
      used: false,
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sanitizedEmail,
      subject: 'إعادة تعيين كلمة المرور',
      html: `<div dir="rtl"><h2>إعادة تعيين كلمة المرور</h2><p>الرجاء النقر على الرابط:</p><a href="${resetLink}" style="background:#00416A;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">إعادة تعيين كلمة المرور</a><p>الرابط صالح لمدة ساعة.</p></div>`,
    });

    return NextResponse.json({ message: 'تم إرسال الرابط' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}