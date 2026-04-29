import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminDb } from '../../../../lib/firebaseAdmin';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { rateLimit } from '../../../../lib/rateLimit';
import { sanitizeInput } from '../../../../lib/sanitize';

export async function POST(request: NextRequest) {
  try {
    // تطبيق تحديد المعدل أولاً (قبل قراءة الجسم لتوفير الموارد)
    const rateLimitResult = await rateLimit(request, {
      windowMs: 60 * 60 * 1000, // 1 ساعة
      max: 5,
      identifier: 'signup',
    });
    if (rateLimitResult) return rateLimitResult;

    // قراءة البيانات
    const { email, password, name } = await request.json();

    // تعقيم المدخلات النصية
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name || '');

    if (!sanitizedEmail || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود المستخدم مسبقاً
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.where('email', '==', sanitizedEmail).limit(1).get();

    if (!snapshot.empty) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء رمز التحقق
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ساعة

    // إنشاء المستخدم مع emailVerified = null وإضافة دور client
    const newUser = {
      email: sanitizedEmail,
      password: hashedPassword,
      name: sanitizedName,
      emailVerified: null, // لم يتم التحقق بعد
      role: 'client',      // دور افتراضي لجميع المستخدمين العاديين
      createdAt: new Date().toISOString(),
    };

    // حفظ المستخدم في Firestore
    const userRef = await usersRef.add(newUser);

    // حفظ رمز التحقق في مجموعة منفصلة
    await adminDb.collection('verificationTokens').doc(verificationToken).set({
      userId: userRef.id,
      email: sanitizedEmail,
      expires: tokenExpires.toISOString(),
      used: false,
    });

    // إعداد البريد الإلكتروني
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
      subject: 'تأكيد البريد الإلكتروني',
      html: `
        <div dir="rtl">
          <h2>مرحباً ${sanitizedName || 'مستخدم'}</h2>
          <p>شكراً لتسجيلك في منصة الخدمات الطلابية. يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني:</p>
          <a href="${verificationLink}" style="background: #00416A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">تأكيد البريد الإلكتروني</a>
          <p>إذا لم تقم بالتسجيل، يمكنك تجاهل هذا البريد.</p>
          <p>الرابط صالح لمدة 24 ساعة.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'تم إنشاء الحساب، يرجى التحقق من بريدك الإلكتروني لتفعيله' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي' },
      { status: 500 }
    );
  }
}