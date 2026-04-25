// app/api/send-order/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { rateLimitByIdentifier } from '@/lib/rateLimit';
import { sanitizeInput } from '@/lib/sanitize';

// تعريف نوع بيانات الطلب المستلمة من العميل
interface FormDataPayload {
  [key: string]: string | number | boolean | null | undefined | string[] | File;
  serviceType: string;
  fullName: string;
  email: string;
  phone: string;
  urgentDelivery: boolean;
  budget: string;
}

interface ServiceInfo {
  value: string;
  label: string;
  fields: string[];
}

const services: ServiceInfo[] = [
  { value: "translation", label: "ترجمة", fields: ["translationFile", "translationPages", "targetLanguage", "deliveryDate"] },
  { value: "university-assignments", label: "كتابة وظائف (الجامعة الافتراضية)", fields: ["fullNameTriple","universityId","classNumber","professorName","programName","programCode","subjectName","subjectCode","isSharedAssignment","hasPartners","partnersInfo","homeWorkFile"] },
  { value: "thesis-formatting", label: "تنسيق وتنضيد البحوث", fields: ["researchFile","universityName","formattingTemplate","researchDeliveryDate"] },
  { value: "graduation-project", label: "إعداد مشاريع التخرج", fields: ["projectTitle","specialization","expectedPages","universityRequirements","projectDeliveryDate","supervisorName","supervisorInstructions"] },
  { value: "cv-design", label: "إعداد وتصميم السير الذاتية", fields: ["cvFullName","cvSpecialization","cvExperience","cvSkills","cvCourses","cvLanguages","cvObjective"] },
  { value: "presentation-design", label: "إعداد العروض التقديمية", fields: ["presentationTopic","presentationSlides","presentationContent","presentationLanguage","presentationDeliveryDate"] },
  { value: "poster-design", label: "تصميم بوسترات وأغلفة", fields: ["posterTitle","posterStudentName","posterUniversity","posterLogo","posterSize"] },
  { value: "survey-design", label: "إعداد الاستبيانات", fields: ["surveyTopic","surveyTarget","surveyQuestionsCount","surveyQuestionType"] },
  { value: "web-development", label: "تطوير مواقع", fields: ["websiteType","pagesRequired","technologies","hasDesign","designFile"] },
  { value: "writing", label: "كتابة وظائف (عام)", fields: ["assignmentType","subject","pagesOrWords","needsReferences","referenceFile"] },
  { value: "research", label: "إعداد أبحاث", fields: ["researchTitle","methodology","sourceCount","citationFormat"] },
  { value: "packages", label: "الباقات", fields: [] },
];

const getServiceLabel = (value: string, packageName?: string): string => {
  if (value === 'packages' && packageName) return packageName;
  return services.find(s => s.value === value)?.label || value;
};

const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    fullNameTriple: "الاسم الثلاثي", universityId: "الرقم الجامعي", classNumber: "رقم الصف", professorName: "اسم الدكتور", programName: "البرنامج", programCode: "رمز البرنامج", subjectName: "اسم المادة", subjectCode: "رمز المادة",
    translationPages: "عدد الصفحات", targetLanguage: "لغة الترجمة الهدف", deliveryDate: "الموعد النهائي", researchFile: "ملف البحث", homeWorkFile: "ملف الوظيفة", partnersInfo: "معلومات الشركاء", isSharedAssignment: "هل الوظيفة مشتركة؟", hasPartners: "هل يوجد شركاء؟",
    universityName: "اسم الجامعة", formattingTemplate: "نموذج التنسيق", researchDeliveryDate: "الموعد النهائي", projectTitle: "عنوان المشروع", specialization: "التخصص", expectedPages: "عدد الصفحات المتوقع", universityRequirements: "متطلبات الجامعة", projectDeliveryDate: "الموعد النهائي", supervisorName: "المشرف العلمي", supervisorInstructions: "تعليمات المشرف",
    cvFullName: "الاسم", cvSpecialization: "التخصص", cvExperience: "الخبرات", cvSkills: "المهارات", cvCourses: "الدورات التدريبية", cvLanguages: "اللغات", cvObjective: "الهدف المهني",
    presentationTopic: "موضوع العرض", presentationSlides: "عدد الشرائح", presentationContent: "المحتوى", presentationLanguage: "لغة العرض", presentationDeliveryDate: "الموعد النهائي",
    posterTitle: "عنوان المشروع", posterStudentName: "اسم الطالب", posterUniversity: "اسم الجامعة", posterLogo: "الشعار", posterSize: "المقاس المطلوب",
    surveyTopic: "موضوع البحث", surveyTarget: "الفئة المستهدفة", surveyQuestionsCount: "عدد الأسئلة", surveyQuestionType: "نوع الأسئلة",
    websiteType: "نوع الموقع", pagesRequired: "الصفحات المطلوبة", technologies: "التقنيات المفضلة", hasDesign: "يوجد تصميم جاهز", designFile: "ملف التصميم",
    assignmentType: "نوع الوظيفة", subject: "الموضوع", pagesOrWords: "عدد الصفحات/الكلمات", needsReferences: "يحتاج مراجع", referenceFile: "ملف المراجع",
    researchTitle: "عنوان البحث", methodology: "المنهجية", sourceCount: "عدد المصادر", citationFormat: "تنسيق الاقتباس",
  };
  return labels[field] || field;
};

const formatBoolean = (value: boolean): string => (value ? 'نعم' : 'لا');

const formatFieldValue = (value: unknown): string => {
  if (value === undefined || value === null || value === '') return 'غير مذكور';
  if (typeof value === 'boolean') return formatBoolean(value);
  if (Array.isArray(value)) return value.join('، ');
  return String(value);
};

const buildTableFromFields = (data: FormDataPayload, fields: string[], excludedFields: string[] = []): string => {
  let html = '<table dir="rtl" style="width:100%; border-collapse: collapse; margin-bottom: 15px;">';
  for (const field of fields) {
    if (excludedFields.includes(field)) continue;
    const value = data[field];
    if (value === undefined || value instanceof File) continue;
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
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const allowed = await rateLimitByIdentifier(session.user.id, { windowMs: 60 * 60 * 1000, max: 10 });
  if (!allowed) {
    return NextResponse.json({ error: 'تجاوزت الحد الأقصى للطلبات .. حاول بعد ساعة' }, { status: 429 });
  }

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email environment variables');
      return NextResponse.json({ error: 'خطأ في إعدادات البريد الإلكتروني' }, { status: 500 });
    }

    // ✅ التغيير الرئيسي: استقبال JSON بدلاً من FormData
    const body = await request.json() as Record<string, unknown>;
    
    // استخراج السعر والتفاصيل (التي لم تعد جزءا من الحقول الديناميكية)
    const estimatedPrice = (body.estimatedPrice as number) || 0;
    const priceBreakdown = (body.priceBreakdown as string) || "";
    delete body.estimatedPrice;
    delete body.priceBreakdown;

    // قائمة المرفقات المستخرجة من الروابط
    const attachments: { field: string; name: string; url: string }[] = [];
    const fileFieldNames = ["translationFile","researchFile","formattingTemplate","presentationContent","designFile","referenceFile","posterLogo","homeWorkFile"];

    for (const field of fileFieldNames) {
      const url = body[field + "Url"] as string;
      const name = body[field + "Name"] as string;
      if (url && name) {
        attachments.push({ field, name, url });
        // نحذفها من الـ body حتى لا تظهر في جدول التفاصيل
        delete body[field + "Url"];
        delete body[field + "Name"];
      }
    }

    // تحويل البيانات المتبقية إلى FormDataPayload من أجل التوافق مع دوالنا المساعدة
    const formData: FormDataPayload = body as unknown as FormDataPayload;
    const sanitizedFormData = sanitizeFormData(formData);

    // ناقل البريد
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
    await transporter.verify();

    const serviceInfo = services.find(s => s.value === sanitizedFormData.serviceType);
    if (!serviceInfo) {
      return NextResponse.json({ error: 'خدمة غير معروفة' }, { status: 400 });
    }

    const serviceLabel = getServiceLabel(sanitizedFormData.serviceType, sanitizedFormData.packageName as string);
    const urgentDelivery = formatBoolean(sanitizedFormData.urgentDelivery);
    const hasBudget = sanitizedFormData.budget ? `${sanitizedFormData.budget} ل.س` : 'غير مذكور';

    const commonFieldsHtml = `
  <table dir="rtl" style="width:100%; border-collapse: collapse; margin-bottom: 15px;">
     <tr><td style="padding:8px; font-weight:bold; width:200px; background:#f9f9f9;">الاسم الكامل</td><td style="padding:8px;">${sanitizedFormData.fullName || ''}</td></tr>
     <tr><td style="padding:8px; font-weight:bold; background:#f9f9f9;">البريد الإلكتروني</td><td style="padding:8px;">${sanitizedFormData.email || ''}</td></tr>
     <tr><td style="padding:8px; font-weight:bold; background:#f9f9f9;">رقم الهاتف</td><td style="padding:8px;">${sanitizedFormData.phone || ''}</td></tr>
     <tr><td style="padding:8px; font-weight:bold; background:#f9f9f9;">الخدمة المطلوبة</td><td style="padding:8px;">${serviceLabel}</td></tr>
     ${sanitizedFormData.serviceType === 'packages' && sanitizedFormData.packageName ? `
     <tr>
       <td style="padding:8px; font-weight:bold; background:#f9f9f9;">الباقة المطلوبة</td>
       <td style="padding:8px;">${sanitizedFormData.packageName}</td>
     </tr>
     ` : ''}
     <tr><td style="padding:8px; font-weight:bold; background:#f9f9f9;">تسليم عاجل</td><td style="padding:8px;">${urgentDelivery}</td></tr>
     <tr><td style="padding:8px; font-weight:bold; background:#f9f9f9;">الميزانية التقريبية</td><td style="padding:8px;">${hasBudget}</td></tr>
   </table>
`;

    const excludedCommon = ['fullName', 'email', 'phone', 'serviceType', 'urgentDelivery', 'budget'];
    const serviceFields = serviceInfo.fields.filter(f => !excludedCommon.includes(f) && !fileFieldNames.includes(f));

    const serviceFieldsHtml = serviceFields.length > 0
      ? buildTableFromFields(sanitizedFormData, serviceFields)
      : '<p>لا توجد تفاصيل إضافية محددة.</p>';

    const attachmentsSection = attachments.length > 0
      ? `<h3>📎 الملفات المرفقة (${attachments.length})</h3>
         <ul>
           ${attachments.map(f => `<li><strong>${getFieldLabel(f.field)}:</strong> <a href="${f.url}" target="_blank" style="color: #00416A;">تحميل الملف (${f.name})</a></li>`).join('')}
         </ul>`
      : '';

    const htmlContent = `
      <!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
        <style>body{font-family:'Tahoma',sans-serif;line-height:1.6;color:#333;margin:0;padding:20px}.container{max-width:600px;margin:auto;background:#fff;border:1px solid #00416A;border-radius:8px;padding:20px}h2{color:#00416A;border-bottom:2px solid #00416A;padding-bottom:5px}h3{color:#00416A;margin-top:20px;background:#f0f0f0;padding:8px;border-radius:4px}table{width:100%;border-collapse:collapse;margin-bottom:20px}td{padding:8px;border-bottom:1px solid #eee}.price{background:#eef7ff;padding:15px;border-radius:5px;font-size:18px;border-right:4px solid #00416A}.footer{margin-top:30px;font-size:12px;color:#777;text-align:center}ul{padding-right:20px}</style></head>
      <body><div class="container">
        <h2>📋 طلب خدمة جديد</h2>
        <h3>📌 المعلومات الأساسية</h3>${commonFieldsHtml}
        <h3>🔍 تفاصيل الخدمة</h3>${serviceFieldsHtml}
        ${attachmentsSection}
        <h3>💰 السعر التقديري</h3>
        <div class="price"><p><strong>السعر النهائي:</strong> ${estimatedPrice.toLocaleString()} ل.س</p><pre style="background:#f9f9f9;padding:10px;border-radius:5px;white-space:pre-wrap">${priceBreakdown}</pre></div>
        <div class="footer">تم إرسال هذا البريد تلقائياً من منصة الخدمات الطلابية.</div>
      </div></body></html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
      subject: `📌 طلب خدمة جديد من ${sanitizedFormData.fullName || 'مستخدم'}`,
      html: htmlContent,
    });

    return NextResponse.json({ message: 'تم إرسال الطلب بنجاح' }, { status: 200 });
  } catch (error) {
    console.error('خطأ في إرسال البريد:', error);
    return NextResponse.json({ error: 'فشل إرسال الطلب' }, { status: 500 });
  }
}