// app/api/send-order/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { rateLimitByIdentifier } from '../../../lib/rateLimit';
import { sanitizeInput } from '../../../lib/sanitize';

// تعريف نوع بيانات الطلب المستلمة من العميل
interface FormDataPayload {
  [key: string]: string | number | boolean | null | undefined | string[];
  serviceType: string;
  fullName: string;
  email: string;
  phone: string;
  urgentDelivery: boolean;
  budget: string;
}

interface RequestBody {
  formData: FormDataPayload;
  estimatedPrice: number;
  priceBreakdown: string;
}

// نسخة من مصفوفة الخدمات مع الحقول (fields) - يجب أن تتطابق مع الموجودة في RequestFormClient
interface ServiceInfo {
  value: string;
  label: string;
  fields: string[];
}

const services: ServiceInfo[] = [
  {
    value: "translation",
    label: "ترجمة",
    fields: ["translationFile", "translationPages", "targetLanguage", "deliveryDate"],
  },
  {
    value: "university-assignments",
    label: "كتابة وظائف (الجامعة الافتراضية)",
    fields: [
      "fullNameTriple",
      "universityId",
      "classNumber",
      "professorName",
      "programName",
      "programCode",
      "subjectName",
      "subjectCode",
    ],
  },
  {
    value: "thesis-formatting",
    label: "تنسيق وتنضيد البحوث",
    fields: ["researchFile", "universityName", "formattingTemplate", "researchDeliveryDate"],
  },
  {
    value: "graduation-project",
    label: "إعداد مشاريع التخرج",
    fields: [
      "projectTitle",
      "specialization",
      "expectedPages",
      "universityRequirements",
      "projectDeliveryDate",
      "supervisorName",
      "supervisorInstructions",
    ],
  },
  {
    value: "cv-design",
    label: "إعداد وتصميم السير الذاتية",
    fields: ["cvFullName", "cvSpecialization", "cvExperience", "cvSkills", "cvCourses", "cvLanguages", "cvObjective"],
  },
  {
    value: "presentation-design",
    label: "إعداد العروض التقديمية",
    fields: [
      "presentationTopic",
      "presentationSlides",
      "presentationContent",
      "presentationLanguage",
      "presentationDeliveryDate",
    ],
  },
  {
    value: "poster-design",
    label: "تصميم بوسترات وأغلفة",
    fields: ["posterTitle", "posterStudentName", "posterUniversity", "posterLogo", "posterSize"],
  },
  {
    value: "survey-design",
    label: "إعداد الاستبيانات",
    fields: ["surveyTopic", "surveyTarget", "surveyQuestionsCount", "surveyQuestionType"],
  },
  {
    value: "web-development",
    label: "تطوير مواقع",
    fields: ["websiteType", "pagesRequired", "technologies", "hasDesign", "designFile"],
  },
  {
    value: "writing",
    label: "كتابة وظائف (عام)",
    fields: ["assignmentType", "subject", "pagesOrWords", "needsReferences", "referenceFile"],
  },
  {
    value: "research",
    label: "إعداد أبحاث",
    fields: ["researchTitle", "methodology", "sourceCount", "citationFormat"],
  },
  {
    value: "packages",
    label: "الباقات",
    fields: [],
  },
];

// دالة للحصول على تسمية الخدمة العربية (مع دعم الباقات)
const getServiceLabel = (value: string, packageName?: string): string => {
  if (value === 'packages' && packageName) {
    return packageName;
  }
  const service = services.find((s) => s.value === value);
  return service ? service.label : value;
};

// دالة لتحويل أسماء الحقول إلى أسماء عربية مقروءة
const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    fullNameTriple: "الاسم الثلاثي",
    universityId: "الرقم الجامعي",
    classNumber: "رقم الصف",
    professorName: "اسم الدكتور",
    programName: "البرنامج",
    programCode: "رمز البرنامج",
    subjectName: "اسم المادة",
    subjectCode: "رمز المادة",
    translationPages: "عدد الصفحات",
    targetLanguage: "لغة الترجمة الهدف",
    deliveryDate: "الموعد النهائي",
    researchFile: "ملف البحث",
    universityName: "اسم الجامعة",
    formattingTemplate: "نموذج التنسيق",
    researchDeliveryDate: "الموعد النهائي",
    projectTitle: "عنوان المشروع",
    specialization: "التخصص",
    expectedPages: "عدد الصفحات المتوقع",
    universityRequirements: "متطلبات الجامعة",
    projectDeliveryDate: "الموعد النهائي",
    supervisorName: "المشرف العلمي",
    supervisorInstructions: "تعليمات المشرف",
    cvFullName: "الاسم",
    cvSpecialization: "التخصص",
    cvExperience: "الخبرات",
    cvSkills: "المهارات",
    cvCourses: "الدورات التدريبية",
    cvLanguages: "اللغات",
    cvObjective: "الهدف المهني",
    presentationTopic: "موضوع العرض",
    presentationSlides: "عدد الشرائح",
    presentationContent: "المحتوى",
    presentationLanguage: "لغة العرض",
    presentationDeliveryDate: "الموعد النهائي",
    posterTitle: "عنوان المشروع",
    posterStudentName: "اسم الطالب",
    posterUniversity: "اسم الجامعة",
    posterLogo: "الشعار",
    posterSize: "المقاس المطلوب",
    surveyTopic: "موضوع البحث",
    surveyTarget: "الفئة المستهدفة",
    surveyQuestionsCount: "عدد الأسئلة",
    surveyQuestionType: "نوع الأسئلة",
    websiteType: "نوع الموقع",
    pagesRequired: "الصفحات المطلوبة",
    technologies: "التقنيات المفضلة",
    hasDesign: "يوجد تصميم جاهز",
    designFile: "ملف التصميم",
    assignmentType: "نوع الوظيفة",
    subject: "الموضوع",
    pagesOrWords: "عدد الصفحات/الكلمات",
    needsReferences: "يحتاج مراجع",
    referenceFile: "ملف المراجع",
    researchTitle: "عنوان البحث",
    methodology: "المنهجية",
    sourceCount: "عدد المصادر",
    citationFormat: "تنسيق الاقتباس",
  };
  return labels[field] || field;
};

// دالة مساعدة لتحويل قيمة منطقية إلى نعم/لا
const formatBoolean = (value: boolean): string => (value ? 'نعم' : 'لا');

// دالة لتنسيق قيمة الحقل
const formatFieldValue = (value: unknown): string => {
  if (value === undefined || value === null || value === '') return 'غير مذكور';
  if (typeof value === 'boolean') return formatBoolean(value);
  if (Array.isArray(value)) return value.join('، ');
  return String(value);
};

// دالة لبناء جدول HTML من قائمة الحقول
const buildTableFromFields = (
  data: FormDataPayload,
  fields: string[],
  excludedFields: string[] = []
): string => {
  let html = '<table dir="rtl" style="width:100%; border-collapse: collapse; margin-bottom: 15px;">';
  for (const field of fields) {
    if (excludedFields.includes(field)) continue;
    const value = data[field];
    if (value === undefined) continue;
    html += `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px; font-weight: bold; width: 200px; background: #f9f9f9;">${getFieldLabel(field)}</td>
        <td style="padding: 8px;">${formatFieldValue(value)}</td>
      </tr>
    `;
  }
  html += '</table>';
  return html;
};

// دالة خاصة لتعقيم جميع الحقول النصية في FormDataPayload
function sanitizeFormData(data: FormDataPayload): FormDataPayload {
  const result: FormDataPayload = { ...data };
  for (const key in result) {
    const val = result[key];
    if (typeof val === 'string') {
      result[key] = sanitizeInput(val);
    }
  }
  return result;
}

export async function POST(request: Request) {
  // 1. التحقق من المصادقة
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  // 2. تطبيق Rate Limiting بناءً على معرف المستخدم
  const allowed = await rateLimitByIdentifier(session.user.id, {
    windowMs: 60 * 60 * 1000, // 1 ساعة
    max: 10,                  // 10 طلبات لكل مستخدم في الساعة
  });
  if (!allowed) {
    return NextResponse.json(
      { error: 'تجاوزت الحد الأقصى للطلبات .. حاول بعد ساعة' },
      { status: 429 }
    );
  }

  try {
    // التحقق من وجود متغيرات البيئة
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email environment variables');
      return NextResponse.json(
        { error: 'خطأ في إعدادات البريد الإلكتروني' },
        { status: 500 }
      );
    }

    const body = (await request.json()) as RequestBody;
    const { formData, estimatedPrice, priceBreakdown } = body;

    // تعقيم جميع الحقول النصية في formData (لحماية من XSS)
    const sanitizedFormData = sanitizeFormData(formData);

    // إعداد ناقل البريد
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    // الحصول على معلومات الخدمة
    const serviceInfo = services.find((s) => s.value === sanitizedFormData.serviceType);
    if (!serviceInfo) {
      return NextResponse.json({ error: 'خدمة غير معروفة' }, { status: 400 });
    }

    // تمرير packageName إن وجد (للباقات)
    const serviceLabel = getServiceLabel(sanitizedFormData.serviceType, sanitizedFormData.packageName as string | undefined);
    const urgentDelivery = formatBoolean(sanitizedFormData.urgentDelivery);
    const hasBudget = sanitizedFormData.budget ? `${sanitizedFormData.budget} ل.س` : 'غير مذكور';

    // الحقول المشتركة (نعرضها دائماً)
    const commonFieldsHtml = `
      <table dir="rtl" style="width:100%; border-collapse: collapse; margin-bottom: 15px;">
         <tr><td style="padding:8px; font-weight:bold; width:200px; background:#f9f9f9;">الاسم الكامل</td><td style="padding:8px;">${sanitizedFormData.fullName}</td></tr>
         <tr><td style="padding:8px; font-weight:bold; background:#f9f9f9;">البريد الإلكتروني</td><td style="padding:8px;">${sanitizedFormData.email}</td></tr>
         <tr><td style="padding:8px; font-weight:bold; background:#f9f9f9;">رقم الهاتف</td><td style="padding:8px;">${sanitizedFormData.phone}</td></tr>
         <tr><td style="padding:8px; font-weight:bold; background:#f9f9f9;">الخدمة المطلوبة</td><td style="padding:8px;">${serviceLabel}</td></tr>
         <tr><td style="padding:8px; font-weight:bold; background:#f9f9f9;">تسليم عاجل</td><td style="padding:8px;">${urgentDelivery}</td></tr>
         <tr><td style="padding:8px; font-weight:bold; background:#f9f9f9;">الميزانية التقريبية</td><td style="padding:8px;">${hasBudget}</td></tr>
       </table>
    `;

    // الحقول الخاصة بالخدمة (نستثني الحقول المشتركة)
    const excludedCommon = ['fullName', 'email', 'phone', 'serviceType', 'urgentDelivery', 'budget'];
    const serviceFields = serviceInfo.fields.filter(f => !excludedCommon.includes(f) && !f.includes('File'));

    const serviceFieldsHtml = serviceFields.length > 0
      ? buildTableFromFields(sanitizedFormData, serviceFields)
      : '<p>لا توجد تفاصيل إضافية محددة.</p>';

    // --- قسم الملفات المرفوعة (روابط) ---
    const attachmentFields = [
      'translationFileUrl',
      'researchFileUrl',
      'formattingTemplateUrl',
      'presentationContentUrl',
      'designFileUrl',
      'referenceFileUrl',
      'posterLogoUrl',
    ];
    const attachmentsHtml = attachmentFields
      .filter(field => sanitizedFormData[field])
      .map(field => {
        const originalField = field.replace('Url', '');
        const label = getFieldLabel(originalField);
        const url = sanitizedFormData[field] as string;
        return `
          <p style="margin: 8px 0;">
            <strong>${label}:</strong>
            <a href="${url}" target="_blank" style="color: #00416A;">تحميل الملف</a>
          </p>
        `;
      })
      .join('');
    const attachmentsSection = attachmentsHtml
      ? `<h3>📎 الملفات المرفوعة</h3>${attachmentsHtml}`
      : '';

    // بناء HTML النهائي
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Tahoma', 'Arial', sans-serif; line-height: 1.6; color: #333; margin:0; padding:20px; }
          .container { max-width: 600px; margin: auto; background: #fff; border: 1px solid #00416A; border-radius: 8px; padding: 20px; }
          h2 { color: #00416A; border-bottom: 2px solid #00416A; padding-bottom: 5px; }
          h3 { color: #00416A; margin-top: 20px; background: #f0f0f0; padding: 8px; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          td { padding: 8px; border-bottom: 1px solid #eee; }
          .price { background: #eef7ff; padding: 15px; border-radius: 5px; font-size: 18px; border-right: 4px solid #00416A; }
          .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>📋 طلب خدمة جديد</h2>
          
          <h3>📌 المعلومات الأساسية</h3>
          ${commonFieldsHtml}

          <h3>🔍 تفاصيل الخدمة</h3>
          ${serviceFieldsHtml}

          ${attachmentsSection}

          <h3>💰 السعر التقديري</h3>
          <div class="price">
            <p><strong>السعر النهائي:</strong> ${estimatedPrice.toLocaleString()} ل.س</p>
            <pre style="background: #f9f9f9; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${priceBreakdown}</pre>
          </div>

          <div class="footer">
            تم إرسال هذا البريد تلقائياً من منصة الخدمات الطلابية.
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
      subject: `📌 طلب خدمة جديد من ${sanitizedFormData.fullName || 'مستخدم'}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'تم إرسال الطلب بنجاح' }, { status: 200 });
  } catch (error) {
    console.error('خطأ في إرسال البريد:', error);
    return NextResponse.json(
      { error: 'فشل إرسال الطلب' },
      { status: 500 }
    );
  }
}