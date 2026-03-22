// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { rateLimit } from '@/lib/rateLimit';
import { sanitizeInput } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
  // تطبيق تحديد المعدل
  const rateLimitResult = await rateLimit(request, {
    windowMs: 15 * 60 * 1000,
    max: 1,
    identifier: 'contact',
  });
  if (rateLimitResult) return rateLimitResult;

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email environment variables');
      return NextResponse.json(
        { error: 'خطأ في إعدادات البريد الإلكتروني' },
        { status: 500 }
      );
    }

    const body = await request.json();
    let { name, email, subject, message } = body;

    // تعقيم جميع المدخلات
    name = sanitizeInput(name);
    email = sanitizeInput(email);
    subject = sanitizeInput(subject);
    message = sanitizeInput(message);

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
      subject: `رسالة جديدة من ${name}: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Tahoma', 'Arial', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #00416A; border-radius: 8px; }
            h2 { color: #00416A; border-bottom: 2px solid #00416A; padding-bottom: 5px; }
            .info { background: #f9f9f9; padding: 15px; border-radius: 5px; }
            .label { font-weight: bold; color: #00416A; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>📬 رسالة جديدة من نموذج الاتصال</h2>
            <div class="info">
              <p><span class="label">الاسم:</span> ${name}</p>
              <p><span class="label">البريد الإلكتروني:</span> ${email}</p>
              <p><span class="label">الموضوع:</span> ${subject}</p>
              <p><span class="label">الرسالة:</span></p>
              <p style="background: #fff; padding: 10px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #777;">تم إرسال هذا البريد من نموذج الاتصال في موقعك.</p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'تم إرسال الرسالة بنجاح' },
      { status: 200 }
    );
  } catch (error) {
    console.error('خطأ في إرسال البريد:', error);
    return NextResponse.json(
      { error: 'فشل إرسال الرسالة' },
      { status: 500 }
    );
  }
}