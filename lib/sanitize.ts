/**
 * تنظيف النص من أي أكواد HTML/JS ضارة.
 * @param input - النص المدخل من المستخدم
 * @returns النص النظيف (خالٍ من أي علامات HTML ضارة)
 */
export function sanitizeInput(input: string): string {
  // Escape HTML special characters
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * تنظيف مع السماح ببعض علامات HTML الأساسية (إن احتجت)
 * @param input - النص المدخل
 * @returns نص نظيف مع السماح بـ <b>, <i>, <p>, إلخ.
 * ملاحظة: هذه النسخة لا تسمح بالعلامات لتبسيط الكود، يمكن توسيعها حسب الحاجة.
 */
export function sanitizeHtml(input: string): string {
  // إذا أردت السماح ببعض العلامات، يمكنك استخدام مكتبة متخصصة لكن الأسهل الآن هو إجراء نفس التعقيم.
  return sanitizeInput(input);
}