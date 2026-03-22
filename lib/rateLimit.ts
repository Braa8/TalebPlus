import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  identifier?: string;
}) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(options.max, `${options.windowMs} ms`),
    analytics: true,
    prefix: `ratelimit:${options.identifier || 'global'}`,
  });
}

export async function rateLimit(
  request: NextRequest,
  options: { windowMs: number; max: number; identifier?: string }
) {
  const limiter = createRateLimiter(options);
  // استخراج IP من الرأس x-forwarded-for أو استخدام قيمة افتراضية
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  const { success } = await limiter.limit(ip);

  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  return null; // يسمح بالمرور
}

// اختياري: تحديد المعدل بواسطة معرف مخصص (مثل userId)
export async function rateLimitByIdentifier(identifier: string, options: { windowMs: number; max: number }) {
  const limiter = createRateLimiter({ ...options, identifier });
  const { success } = await limiter.limit(identifier);
  return success;
}