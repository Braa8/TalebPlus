// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: Request): Promise<NextResponse> {
  // 1. التحقق من المصادقة
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  // 2. الحصول على اسم الملف من query string
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') || 'file';

  // 3. قراءة الملف من الطلب
  const blob = await request.blob();

  // 4. رفع الملف إلى Vercel Blob
  try {
    const uploadedBlob = await put(filename, blob, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: uploadedBlob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'فشل رفع الملف' },
      { status: 500 }
    );
  }
}