import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
if (session.user?.role !== 'admin') {
  return NextResponse.json({ error: 'غير مسموح' }, { status: 403 });
}

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({ error: 'إعدادات البريد الإلكتروني غير مكتملة' }, { status: 500 });
    }

    const { emails, subject, message } = await request.json();
    if (!emails?.length || !subject || !message) {
      return NextResponse.json({ error: 'البيانات غير كاملة' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    // إرسال البريد لكل مستلم على حدة (لتجنب قيود BCC)
    const sendPromises = emails.map((email: string) =>
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html: `
          <div dir="rtl">
            <h2>${subject}</h2>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr />
            <p style="font-size:12px; color:#777;">هذه رسالة جماعية من منصّة ( طالب+ )</p>
          </div>
        `,
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ message: `تم إرسال الرسالة إلى ${emails.length} مستلم` });
  } catch (error) {
    console.error('Error sending bulk email:', error);
    return NextResponse.json({ error: 'فشل إرسال البريد' }, { status: 500 });
  }
}