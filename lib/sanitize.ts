import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// تهيئة DOMPurify مع بيئة خادم
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * تنظيف النص من أي أكواد HTML/JS ضارة.
 * @param input - النص المدخل من المستخدم
 * @returns النص النظيف (خالٍ من أي علامات)
 */
export function sanitizeInput(input: string): string {
  // إزالة أي علامات HTML بالكامل (تسمح بالنص العادي فقط)
  return purify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * تنظيف مع السماح ببعض علامات HTML الأساسية (إن احتجت)
 * @param input - النص المدخل
 * @returns نص نظيف مع السماح بـ <b>, <i>, <p>, إلخ.
 */
export function sanitizeHtml(input: string): string {
  return purify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li', 'ol'],
    ALLOWED_ATTR: [],
  });
}