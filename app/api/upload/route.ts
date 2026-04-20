import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: Request) {
  // 1. التحقق من المصادقة
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    // 2. الحصول على اسم الملف من query string
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'file';

    // 3. قراءة الملف مباشرة من body
    const file = await request.blob();

    if (!file) {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 400 });
    }

    // 4. رفع الملف إلى Vercel Blob
    const blob = await put(`uploads/${session.user.id}/${Date.now()}_${filename}`, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'فشل رفع الملف' },
      { status: 500 }
    );
  }
}