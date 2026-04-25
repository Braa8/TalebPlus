// ==================================================
// الملف: app/Services/RequestFormClient.tsx
// ==================================================
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { getFieldLabel } from "@/lib/fieldLabels"; // تأكد من المسار الصحيح لملف fieldLabels
// تعريف أنواع البيانات بشكل شامل يضم جميع الخدمات
interface FormData {
  // الحقول المشتركة
  fullName: string;
  email: string;
  phone: string;
  urgentDelivery: boolean;
  budget: string;

  // اختيار الخدمة
  serviceType: string;

  // حقول الترجمة
  translationFile: File | null;
  translationPages: string; // عدد الصفحات
  targetLanguage: string; // لغة الهدف (عربية/انجليزية)
  deliveryDate: string; // الموعد النهائي

  // حقول كتابة الوظائف (الجامعة الافتراضية)
  fullNameTriple: string; // الاسم الثلاثي
  universityId: string; // الرقم الجامعي
  classNumber: string; // رقم الصف
  professorName: string; // اسم الدكتور
  programName: string; // البرنامج
  programCode: string; // رمز البرنامج
  subjectName: string; // اسم المادة
  subjectCode: string; // رمز المادة
  homeWorkDetails: string; // تفاصيل الوظيفة (ملخص المتطلبات أو نص الوظيفة)
  isSharedAssignment: boolean; // is it a shared assignment
  hasPartners: boolean; // has partners
  partnersInfo: string; // partners information
  homeWorkFile: File | null;

  // حقول تنسيق وتنضيد البحوث
  researchFile: File | null;
  universityName: string; // اسم الجامعة
  formattingTemplate: File | null; // نموذج التنسيق (اختياري)
  researchDeliveryDate: string; // الموعد النهائي

  // حقول إعداد مشاريع التخرج
  projectTitle: string; // عنوان المشروع
  specialization: string; // التخصص
  expectedPages: string; // عدد الصفحات المتوقع
  universityRequirements: string; // متطلبات الجامعة
  projectDeliveryDate: string; // الموعد النهائي
  supervisorName: string; // المشرف العلمي (اختياري)
  supervisorInstructions: string; // تعليمات المشرف (اختياري)

  // حقول إعداد السير الذاتية
  cvFullName: string; // الاسم
  cvSpecialization: string; // التخصص
  cvExperience: string; // الخبرات
  cvSkills: string; // المهارات
  cvCourses: string; // الدورات التدريبية
  cvLanguages: string; // اللغات
  cvObjective: string; // الهدف المهني

  // حقول إعداد العروض التقديمية
  presentationTopic: string; // موضوع العرض
  presentationSlides: string; // عدد الشرائح
  presentationContent: File | null; // النص أو المحتوى
  presentationLanguage: string; // لغة العرض
  presentationDeliveryDate: string; // الموعد النهائي

  // حقول تصميم بوسترات وأغلفة
  posterTitle: string; // عنوان المشروع
  posterStudentName: string; // اسم الطالب
  posterUniversity: string; // اسم الجامعة
  posterLogo: File | null; // الشعار (ان وجد) (اختياري)
  posterSize: string; // المقاس المطلوب

  // حقول إعداد الاستبيانات
  surveyTopic: string; // موضوع البحث
  surveyTarget: string; // الفئة المستهدفة
  surveyQuestionsCount: string; // عدد الأسئلة المتوقع
  surveyQuestionType: string; // نوع الأسئلة (مغلقة / مفتوحة)

  // حقول تطوير المواقع (خدمة قديمة)
  websiteType: string;
  pagesRequired: string;
  technologies: string[];
  hasDesign: boolean;
  designFile: File | null;

  // حقول كتابة الوظائف (العامة)
  assignmentType: string;
  subject: string;
  pagesOrWords: string;
  needsReferences: boolean;
  referenceFile: File | null;

  // حقول إعداد الأبحاث (العامة)
  researchTitle: string;
  methodology: string;
  sourceCount: string;
  citationFormat: string;
}


// تعريف مراحل النموذج (نستخدم 3 خطوات فعلية، والمراجعة نافذة منبثقة)
enum FormStep {
  SERVICE = 0,
  BASIC_INFO = 1,
  SERVICE_DETAILS = 2,
}

// تعريف الخدمات بشكل ديناميكي
interface ServiceOption {
  value: string;
  label: string;
  icon: string;
  description: string;
  price: string; // بالسعر المحلي (ل.س)
  detailsDescription?: string; // وصف إضافي يظهر في التفاصيل
  fields: string[]; // أسماء الحقول المطلوبة (تظهر في الخطوة الثالثة)
}

const services: ServiceOption[] = [
  {
    value: "translation",
    label: "ترجمة",
    icon: "🌐",
    description: "ترجمة النصوص والمستندات",
    price: "117000",
    fields: [
      "translationFile",
      "translationPages",
      "targetLanguage",
      "deliveryDate",
    ],
  },
  {
    value: "university-assignments",
    label: "كتابة وظائف (الجامعة الافتراضية)",
    icon: "📚",
    description: "حل واجبات ومشاريع الجامعة الافتراضية السورية",
    price: "75000-150000 حسب متطلبات الوظيفة",
    detailsDescription:
      "خدمة مخصصة للجامعة الافتراضية السورية. مدة التسليم القصوى 10 أيام.",
    fields: [
      "fullNameTriple",
      "universityId",
      "classNumber",
      "professorName",
      "programName",
      "programCode",
      "subjectName",
      "subjectCode",
      "homeWorkDetails",
      "isSharedAssignment",
      "hasPartners",
      "partnersInfo",
      "homeWorkFile"
    ],
  },
  {
    value: "thesis-formatting",
    label: "تنسيق وتنضيد البحوث",
    icon: "📐",
    description:
      "تنسيق البحث وفق المتطلبات (الهوامش - الخطوط - العناوين - الفهرس - المراجع)",
    price: "300000",
    fields: [
      "researchFile",
      "universityName",
      "formattingTemplate",
      "researchDeliveryDate",
    ],
  },
  {
    value: "graduation-project",
    label: "إعداد مشاريع التخرج",
    icon: "🎓",
    description:
      "مساعدة الطالب في إعداد مشروع التخرج (الهيكل العلمي - التنسيق - التدقيق اللغوي - إعداد العرض)",
    price: "1300000",
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
    icon: "📄",
    description: "إعداد سيرة ذاتية احترافية",
    price: "75000",
    fields: [
      "cvFullName",
      "cvSpecialization",
      "cvExperience",
      "cvSkills",
      "cvCourses",
      "cvLanguages",
      "cvObjective",
    ],
  },
  {
    value: "presentation-design",
    label: "إعداد العروض التقديمية",
    icon: "📊",
    description: "تصميم عروض تقديمية احترافية",
    price: "75000",
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
    icon: "🖼️",
    description: "تصميم غلاف المشروع أو بوستر العرض",
    price: "100000",
    fields: [
      "posterTitle",
      "posterStudentName",
      "posterUniversity",
      "posterLogo",
      "posterSize",
    ],
  },
  {
    value: "survey-design",
    label: "إعداد الاستبيانات",
    icon: "📋",
    description: "تصميم استبيانات علمية لمشاريع التخرج أو الدراسات",
    price: "100000",
    fields: [
      "surveyTopic",
      "surveyTarget",
      "surveyQuestionsCount",
      "surveyQuestionType",
    ],
  },
  {
    value: "web-development",
    label: "تطوير مواقع",
    icon: "💻",
    description: "تصميم وبرمجة المواقع",
    price: "500000",
    fields: [
      "websiteType",
      "pagesRequired",
      "technologies",
      "hasDesign",
      "designFile",
    ],
  },
  {
    value: "writing",
    label: "كتابة وظائف (عام)",
    icon: "📝",
    description: "كتابة الأبحاث والتقارير",
    price: "75000",
    fields: [
      "assignmentType",
      "subject",
      "pagesOrWords",
      "needsReferences",
      "referenceFile",
    ],
  },
  {
    value: "research",
    label: "إعداد أبحاث",
    icon: "🔬",
    description: "إعداد الدراسات والأبحاث",
    price: "300000",
    fields: ["researchTitle", "methodology", "sourceCount", "citationFormat"],
  },
  {
    value: "packages",
    label: "الباقات",
    icon: "📦",
    description: "اختر باقة تناسب احتياجك",
    price: "استعرض الباقات",
    fields: [],
  },
];

// قائمة الحقول الاختيارية (لا يتم التحقق من إجباريتها)
const optionalFields = [
  "formattingTemplate",
  "posterLogo",
  "referenceFile",
  "designFile",
  "supervisorInstructions",
  "supervisorName",
  "homeWorkFile",
];

// دالة مساعدة لإنشاء كائن فارغ من FormData
const createEmptyFormData = (): FormData => ({
  fullName: "",
  email: "",
  phone: "",
  urgentDelivery: false,
  budget: "",
  serviceType: "",
  translationFile: null,
  translationPages: "",
  targetLanguage: "",
  deliveryDate: "",
  fullNameTriple: "",
  universityId: "",
  classNumber: "",
  professorName: "",
  programName: "",
  programCode: "",
  subjectName: "",
  subjectCode: "",
  homeWorkDetails: "",
  isSharedAssignment: false,
  hasPartners: false,
  partnersInfo: "",
  homeWorkFile: null,
  researchFile: null,
  universityName: "",
  formattingTemplate: null,
  researchDeliveryDate: "",
  projectTitle: "",
  specialization: "",
  expectedPages: "",
  universityRequirements: "",
  projectDeliveryDate: "",
  supervisorName: "",
  supervisorInstructions: "",
  cvFullName: "",
  cvSpecialization: "",
  cvExperience: "",
  cvSkills: "",
  cvCourses: "",
  cvLanguages: "",
  cvObjective: "",
  presentationTopic: "",
  presentationSlides: "",
  presentationContent: null,
  presentationLanguage: "",
  presentationDeliveryDate: "",
  posterTitle: "",
  posterStudentName: "",
  posterUniversity: "",
  posterLogo: null,
  posterSize: "",
  surveyTopic: "",
  surveyTarget: "",
  surveyQuestionsCount: "",
  surveyQuestionType: "",
  websiteType: "",
  pagesRequired: "",
  technologies: [],
  hasDesign: false,
  designFile: null,
  assignmentType: "",
  subject: "",
  pagesOrWords: "",
  needsReferences: false,
  referenceFile: null,
  researchTitle: "",
  methodology: "",
  sourceCount: "",
  citationFormat: "",
});

// تصفية حقول النموذج بناءً على الخدمة المختارة (للتخلص من بيانات الخدمات السابقة)
const filterFormDataForService = (data: FormData, serviceType: string): FormData => {
  const service = services.find((s) => s.value === serviceType);
  if (!service) return data;

  const allowedFields = new Set([
    "fullName", "email", "phone", "urgentDelivery", "budget", "serviceType",
    ...service.fields,
  ]);

  const newData = createEmptyFormData();
  // نسخ الحقول المسموحة فقط
  Object.keys(data).forEach((key) => {
    if (allowedFields.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newData as any)[key] = (data as any)[key];
    }
  });
  // الاحتفاظ بالحقول المشتركة دائمًا
  newData.fullName = data.fullName;
  newData.email = data.email;
  newData.phone = data.phone;
  newData.urgentDelivery = data.urgentDelivery;
  newData.budget = data.budget;
  newData.serviceType = serviceType;

  return newData;
};

const RequestFormClient: React.FC = () => {
  // تهيئة الحالة بالقيم الافتراضية فقط
  const [formData, setFormData] = useState<FormData>(createEmptyFormData());
  const [isClientReady, setIsClientReady] = useState(false);
  // مراجع لعناصر input file لإعادة تعيينها يدويًا
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // تحميل البيانات من localStorage بعد تحميل المكون (client-side فقط)
  useEffect(() => {
  const savedData = localStorage.getItem("requestFormDraft");
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      setFormData((prev) => ({ ...prev, ...parsed }));
    } catch (e) {
      console.error("Failed to load draft", e);
    }
  }
  setIsClientReady(true); // 
}, []);

  // حالة السعر التقديري
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [priceBreakdown, setPriceBreakdown] = useState<string>("");

  // حالة التحقق من الصحة
  const [errors, setErrors] = useState<Record<string, string>>({});

  // حالة تأكيد الطلب
  const [showConfirmation, setShowConfirmation] = useState(false);

  // حالة الخطوة الحالية
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.SERVICE);

  // حالة التحميل عند إرسال الطلب
  const [loading, setLoading] = useState(false);

  // حفظ البيانات في localStorage عند كل تغيير (مع debounce بسيط)
  useEffect(() => {
    const timer = setTimeout(() => {
      const dataToSave: Record<string, unknown> = {};
      for (const key in formData) {
        const value = formData[key as keyof FormData];
        if (!(value instanceof File)) {
          dataToSave[key] = value;
        }
      }
      localStorage.setItem("requestFormDraft", JSON.stringify(dataToSave));
    }, 300);
    return () => clearTimeout(timer);
  }, [formData]);

  // Calculate estimated price (fixed with urgent delivery surcharge only)
  const calculatePrice = useCallback(() => {
    const service = services.find((s) => s.value === formData.serviceType);
    if (!service) {
      setEstimatedPrice(0);
      setPriceBreakdown("");
      return;
    }

    let basePrice = 0;
    const priceStr = service.price;

    if (priceStr.includes('-')) {
      const [lower] = priceStr.split('-');
      basePrice = parseInt(lower.replace(/[^\d]/g, '')) || 0;
    } else {
      basePrice = parseInt(priceStr.replace(/[^\d]/g, '')) || 0;
    }

    let price = basePrice;
    let breakdown = `السعر الأساسي: ${price.toLocaleString()} ل.س`;

    if (formData.urgentDelivery) {
      price = Math.round(price * 1.5);
      breakdown += `\n· تسليم عاجل: +50% (السعر بعد الزيادة: ${price.toLocaleString()} ل.س)`;
    }

    setEstimatedPrice(price);
    setPriceBreakdown(breakdown);
  }, [formData.serviceType, formData.urgentDelivery]);

  // تحديث السعر عند تغيير الخدمة أو التسليم العاجل
  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  // دالة التحقق الموحدة (تقبل Step اختياريًا)
  const validateFields = (step?: FormStep): boolean => {
    const newErrors: Record<string, string> = {};
    const service = services.find((s) => s.value === formData.serviceType);

    // التحقق من الحقول المشتركة إذا كنا في الخطوة المناسبة أو في التحقق الكامل
    const shouldValidateShared = step === undefined || step === FormStep.BASIC_INFO;
    if (shouldValidateShared) {
      if (!formData.fullName.trim()) newErrors.fullName = "الاسم الكامل مطلوب";
      if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "البريد الإلكتروني غير صحيح";
      if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    }

    // التحقق من اختيار الخدمة إذا كنا في خطوة الخدمة أو التحقق الكامل
    if ((step === undefined || step === FormStep.SERVICE) && !formData.serviceType) {
      newErrors.serviceType = "يرجى اختيار الخدمة";
    }

    // التحقق من حقول الخدمة المحددة إذا كنا في خطوة التفاصيل أو التحقق الكامل
    if ((step === undefined || step === FormStep.SERVICE_DETAILS) && service) {
      service.fields.forEach((field) => {
        if (optionalFields.includes(field)) return;
        const value = formData[field as keyof FormData];
        if (!value) {
          newErrors[field] = "هذا الحقل مطلوب";
        } else if (typeof value === "string" && !value.trim()) {
          newErrors[field] = "هذا الحقل مطلوب";
        }
      });

      // تحقق إضافي لمشاركة الوظيفة
      if (formData.serviceType === "university-assignments") {
        if (formData.isSharedAssignment && formData.hasPartners && !formData.partnersInfo.trim()) {
          newErrors.partnersInfo = "معلومات الشركاء مطلوبة";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // التعامل مع تغيير الحقول
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "serviceType") {
      // عند تغيير الخدمة، نقوم بتصفية البيانات
      setFormData((prev) => filterFormDataForService(prev, value));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // مسح الخطأ المرتبط بالحقل
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: "حجم الملف يتجاوز الحد الأقصى (20 ميجابايت)",
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
    }
    // حفظ مرجع للعنصر لمسحه لاحقًا إذا لزم الأمر
    fileInputRefs.current[fieldName] = e.target;
  };

  const handleTechnologyChange = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter((t) => t !== tech)
        : [...prev.technologies, tech],
    }));
  };

  // التنقل بين الخطوات
  const goToNextStep = () => {
    if (validateFields(currentStep)) {
      if (currentStep === FormStep.SERVICE_DETAILS) {
        setShowConfirmation(true);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const resetForm = () => {
    setFormData(createEmptyFormData());
    setShowConfirmation(false);
    setCurrentStep(FormStep.SERVICE);
    localStorage.removeItem("requestFormDraft");
    // مسح مراجع الملفات
    fileInputRefs.current = {};
  };

  const sendEmail = async () => {
  if (!validateFields()) {
    alert("يرجى ملء جميع الحقول المطلوبة قبل الإرسال.");
    return;
  }

  setLoading(true);
  try {
    // 1. رفع الملفات إن وجدت (لن تكون موجودة في الباقات عادةً)
    const fileFields = [
      "translationFile", "researchFile", "formattingTemplate",
      "presentationContent", "designFile", "referenceFile",
      "posterLogo", "homeWorkFile",
    ];
    const uploadedUrls: Record<string, string> = {};

    for (const field of fileFields) {
      const file = formData[field as keyof FormData] as File | null;
      if (file) {
        try {
          const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, { method: "POST", body: file });
          if (!res.ok) throw new Error(`فشل رفع ${getFieldLabel(field)}`);
          const blob = await res.json();
          uploadedUrls[field] = blob.url;
        } catch (e) {
          console.error(e);
          alert(`فشل رفع الملف: ${getFieldLabel(field)}`);
          setLoading(false);
          return;
        }
      }
    }

    // 2. بناء كائن JSON خفيف ومخصص للخدمة
    const service = services.find(s => s.value === formData.serviceType);
    const allowedFields = new Set([
      "fullName", "email", "phone", "urgentDelivery", "budget", "serviceType",
      ...(service ? service.fields : []),
    ]);

    // نضيف packageName يدوياً لأنه قد لا يكون ضمن fields
    if (formData.serviceType === "packages") {
      allowedFields.add("packageName");
    }

    const jsonPayload: Record<string, unknown> = {};

    // نضمن الحقول الأساسية دائماً
    jsonPayload.fullName = formData.fullName || "";
    jsonPayload.email = formData.email || "";
    jsonPayload.phone = formData.phone || "";
    jsonPayload.urgentDelivery = formData.urgentDelivery;
    jsonPayload.budget = formData.budget || "";
    jsonPayload.serviceType = formData.serviceType;

    // نضيف الحقول المسموحة الأخرى إذا كانت موجودة (غير الملفات)
    for (const key of allowedFields) {
      if (["fullName", "email", "phone", "urgentDelivery", "budget", "serviceType"].includes(key)) continue;
      const value = formData[key as keyof FormData];
      if (value instanceof File) {
        // نضيف رابط واسم الملف
        if (uploadedUrls[key]) {
          jsonPayload[key + "Url"] = uploadedUrls[key];
          jsonPayload[key + "Name"] = value.name;
        }
      } else if (Array.isArray(value)) {
        jsonPayload[key] = value;
      } else if (value !== null && value !== undefined) {
        jsonPayload[key] = value;
      } else {
        jsonPayload[key] = ""; // نرسل فارغة لتجنب undefined
      }
    }

    // packageName خاص بالباقات
    if (formData.serviceType === "packages") {
      jsonPayload.packageName = (formData as any).packageName || "";
    }

    jsonPayload.estimatedPrice = estimatedPrice;
    jsonPayload.priceBreakdown = priceBreakdown;

    // 3. إرسال JSON
    const response = await fetch("/api/send-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonPayload),
    });

    if (response.ok) {
      alert("تم إرسال طلبك بنجاح! سنتواصل معك قريبًا.");
      resetForm();
    } else {
      const error = await response.json();
      alert(error.error || "حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقًا.");
    }
  } catch (error) {
    console.error("فشل الإرسال:", error);
    alert("حدث خطأ في الشبكة.");
  } finally {
    setLoading(false);
  }
};
  // عرض شريط التقدم (3 خطوات فقط)
  const renderProgress = () => {
    const steps = [
      { label: "الخدمة", icon: "🎯" },
      { label: "المعلومات", icon: "📋" },
      { label: "التفاصيل", icon: "⚙️" },
    ];
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.label} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${index <= currentStep
                    ? "bg-[#00416A] text-white"
                    : "bg-gray-200 text-gray-500"
                  }`}
              >
                {step.icon}
              </div>
              <span className="text-xs mt-1 text-gray-600">{step.label}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-2 h-1 bg-gray-200 rounded-full">
          <div
            className="absolute top-0 left-0 h-1 bg-[#00416A] rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  if (!isClientReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0EAD6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00416A] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل النموذج...</p>
        </div>
      </div>
    );
  }

  // عرض شاشة التأكيد
  if (showConfirmation) {
    const service = services.find((s) => s.value === formData.serviceType);
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0EAD6] to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
            <h1 className="text-3xl font-bold text-[#00416A] mb-6 text-center">
              تأكيد الطلب
            </h1>
            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-[#00416A] mb-3">
                  معلومات الطلب
                </h2>
                <p>
                  <span className="font-semibold">الاسم:</span>{" "}
                  {formData.fullName}
                </p>
                <p>
                  <span className="font-semibold">البريد:</span>{" "}
                  {formData.email}
                </p>
                <p>
                  <span className="font-semibold">الهاتف:</span>{" "}
                  {formData.phone}
                </p>
                <p>
                  <span className="font-semibold">الخدمة:</span>{" "}
                  {service?.label}
                </p>
                {formData.urgentDelivery && (
                  <p className="text-red-600 font-semibold">تسليم عاجل</p>
                )}
              </div>
              
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={sendEmail}
                disabled={loading}
                className={`flex-1 py-4 px-6 rounded-xl transition-all font-semibold ${loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-[#00416A] hover:bg-opacity-90 text-white'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الإرسال...
                  </span>
                ) : (
                  'تأكيد وإرسال الطلب'
                )}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-300 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                تعديل الطلب
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // عرض النموذج
  const service = services.find((s) => s.value === formData.serviceType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0EAD6] to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 group">
            <h1 className="text-2xl font-bold text-[#00416A] group-hover:text-opacity-80 transition-colors">
              ← العودة للرئيسية
            </h1>
          </Link>
          <h1 className="text-5xl font-bold text-[#00416A] mb-2">طلب الخدمة</h1>
          <p className="text-gray-600">
            املأ النموذج أدناه وسنقوم بالتواصل معك قريباً
          </p>
        </div>

        {renderProgress()}

        {/* عرض السعر التقديري مع تنويه */}
        {estimatedPrice > 0 && currentStep !== FormStep.SERVICE && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-r-4 border-[#00416A]">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                
                <p className="text-xs text-gray-500 mt-1">
                  * السعر يزداد 50% في حالة التسليم العاجل
                </p>
              </div>
              <button
                onClick={() => setShowConfirmation(true)}
                className="bg-[#00416A] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-semibold"
              >
                مراجعة الطلب
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20"
        >
          {/* الخطوة 1: اختيار الخدمة */}
          {currentStep === FormStep.SERVICE && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#00416A]">
                  ما هي الخدمة التي تريدها؟
                </h2>
                <p className="text-gray-500">اختر الخدمة المناسبة لطلبك</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((s) => {
                  if (s.value === 'packages') {
                    return (
                      <Link
                        key={s.value}
                        href="/packages"
                        className="relative block p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="text-center">
                          <div className="text-5xl mb-3">{s.icon}</div>
                          <h3 className="text-xl font-semibold text-[#00416A] mb-1">
                            {s.label}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {s.description}
                          </p>
                          <p className="text-lg font-bold text-[#00416A]">
                            {s.price}
                          </p>
                        </div>
                      </Link>
                    );
                  }
                  return (
                    <label
                      key={s.value}
                      className={`relative block p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.serviceType === s.value
                          ? "border-[#00416A] bg-blue-50 shadow-lg"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                      <input
                        type="radio"
                        name="serviceType"
                        value={s.value}
                        checked={formData.serviceType === s.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-5xl mb-3">{s.icon}</div>
                        <h3 className="text-xl font-semibold text-[#00416A] mb-1">
                          {s.label}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {s.description}
                        </p>
                        <p className="text-lg font-bold text-[#00416A]">
                          {s.price}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.serviceType && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {errors.serviceType}
                </p>
              )}
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="bg-[#00416A] text-white px-8 py-3 rounded-xl hover:bg-opacity-90 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* الخطوة 2: المعلومات الأساسية */}
          {currentStep === FormStep.BASIC_INFO && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#00416A]">
                  المعلومات الأساسية
                </h2>
                <p className="text-gray-500">كيف يمكننا التواصل معك؟</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] transition-all ${errors.fullName ? "border-red-500" : "border-gray-200"
                      }`}
                    placeholder="أدخل اسمك الكامل"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] transition-all ${errors.email ? "border-red-500" : "border-gray-200"
                      }`}
                    placeholder="example@domain.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] transition-all ${errors.phone ? "border-red-500" : "border-gray-200"
                      }`}
                    placeholder="09XX XXX XXX"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الميزانية التقريبية (اختياري)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A] transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="urgentDelivery"
                      checked={formData.urgentDelivery}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-[#00416A] border-2 border-gray-300 rounded focus:ring-[#00416A]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      تسليم عاجل (زيادة 50% على السعر) في غضون 3 أيام كحد أقصى
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex justify-between gap-4 mt-8">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  السابق
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="bg-[#00416A] text-white px-8 py-3 rounded-xl hover:bg-opacity-90 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* الخطوة 3: تفاصيل الخدمة */}
          {currentStep === FormStep.SERVICE_DETAILS && service && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#00416A]">
                  {service.label}
                </h2>
                {service.detailsDescription && (
                  <p className="text-gray-600 mt-2 bg-blue-50 p-3 rounded-lg">
                    {service.detailsDescription}
                  </p>
                )}
              </div>

              {/* عرض الحقول ديناميكياً حسب الخدمة */}
              <div className="grid grid-cols-1 gap-5 sm:gap-6">
                {service.fields.includes("fullNameTriple") && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      الاسم الثلاثي الكامل{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="fullNameTriple"
                      value={formData.fullNameTriple}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] text-sm sm:text-base ${errors.fullNameTriple
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.fullNameTriple && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.fullNameTriple}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("universityId") && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      الرقم الجامعي <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="universityId"
                      value={formData.universityId}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] text-sm sm:text-base ${errors.universityId
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.universityId && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.universityId}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("classNumber") && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      رقم الصف <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="classNumber"
                      value={formData.classNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] text-sm sm:text-base ${errors.classNumber
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.classNumber && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.classNumber}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("professorName") && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      اسم الدكتور <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="professorName"
                      value={formData.professorName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] text-sm sm:text-base ${errors.professorName
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.professorName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.professorName}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("programName") && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      البرنامج <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="programName"
                      value={formData.programName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] text-sm sm:text-base ${errors.programName
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.programName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.programName}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("programCode") && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      رمز البرنامج <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="programCode"
                      value={formData.programCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] text-sm sm:text-base ${errors.programCode
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.programCode && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.programCode}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("subjectName") && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      اسم المادة <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="subjectName"
                      value={formData.subjectName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] text-sm sm:text-base ${errors.subjectName
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.subjectName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.subjectName}
                      </p>
                    )}
                  </div>
                )}
                {service.fields.includes("homeWorkDetails") && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      عنوان الوظيفة و ملخص عن المتطلبات المرفقة <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      name="homeWorkDetails"
                      value={formData.homeWorkDetails}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] text-sm sm:text-base ${errors.homeWorkDetails
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.homeWorkDetails && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.homeWorkDetails}
                      </p>
                    )}
                    <div className="mt-3">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => handleFileUpload(e, "homeWorkFile")}
                        className="w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-[#00416A] file:text-white hover:file:bg-opacity-90 text-sm sm:text-base"
                      />
                      {errors.homeWorkFile && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">
                          {errors.homeWorkFile}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Dynamic fields for shared assignment */}
                {service.fields.includes("homeWorkDetails") && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isSharedAssignment"
                          checked={formData.isSharedAssignment}
                          onChange={handleInputChange}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-[#00416A] border-gray-300 rounded focus:ring-[#00416A]"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          هل هذه وظيفة مشتركة؟
                        </span>
                      </label>
                    </div>

                    {formData.isSharedAssignment && (
                      <div className="sm:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="hasPartners"
                            checked={formData.hasPartners}
                            onChange={handleInputChange}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-[#00416A] border-gray-300 rounded focus:ring-[#00416A]"
                          />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            هل يوجد شركاء؟ (في حال لم يكن لديك شركاء سوف نحاول إيجاد شركاء مناسبين لك)
                          </span>
                        </label>
                      </div>
                    )}

                    { (formData.isSharedAssignment || formData.hasPartners) && (
                      <div className="sm:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          معلومات الشركاء <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="partnersInfo"
                          value={formData.partnersInfo}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="الرجاء إدخال الأسماء الكاملة والأرقام الجامعية ومعلومات الاتصال لكل شريك و ذلك حفاظاً على استفادتكم من الخدمة..."
                          className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] text-sm sm:text-base ${errors.partnersInfo
                              ? "border-red-500"
                              : "border-gray-200"
                            }`}
                        />
                        {errors.partnersInfo && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.partnersInfo}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {service.fields.includes("subjectCode") && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      رمز المادة <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="subjectCode"
                      value={formData.subjectCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] text-sm sm:text-base ${errors.subjectCode
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.subjectCode && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">
                        {errors.subjectCode}
                      </p>
                    )}
                  </div>
                )}

                {/* خدمات الترجمة */}
                {service.fields.includes("translationFile") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الملف المراد ترجمته{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => handleFileUpload(e, "translationFile")}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00416A] file:text-white hover:file:bg-opacity-90"
                    />
                    {errors.translationFile && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.translationFile}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("translationPages") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عدد الصفحات <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      name="translationPages"
                      value={formData.translationPages}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.translationPages
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                      placeholder="0"
                    />
                    {errors.translationPages && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.translationPages}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("targetLanguage") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      لغة الترجمة الهدف <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="targetLanguage"
                      value={formData.targetLanguage}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.targetLanguage
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    >
                      <option value="">اختر اللغة</option>
                      <option value="ar">العربية</option>
                      <option value="en">الإنجليزية</option>
                    </select>
                    {errors.targetLanguage && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.targetLanguage}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("deliveryDate") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموعد النهائي <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.deliveryDate
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.deliveryDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.deliveryDate}
                      </p>
                    )}
                  </div>
                )}

                {/* خدمة تنسيق البحوث */}
                {service.fields.includes("researchFile") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ملف البحث <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, "researchFile")}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00416A] file:text-white"
                    />
                    {errors.researchFile && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.researchFile}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("universityName") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الجامعة <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="universityName"
                      value={formData.universityName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.universityName
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.universityName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.universityName}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("formattingTemplate") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نموذج التنسيق (اختياري)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        handleFileUpload(e, "formattingTemplate")
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00416A] file:text-white"
                    />
                  </div>
                )}

                {service.fields.includes("researchDeliveryDate") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموعد النهائي <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="date"
                      name="researchDeliveryDate"
                      value={formData.researchDeliveryDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.researchDeliveryDate
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.researchDeliveryDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.researchDeliveryDate}
                      </p>
                    )}
                  </div>
                )}

                {/* خدمة إعداد مشاريع التخرج */}
                {service.fields.includes("projectTitle") && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان المشروع <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="projectTitle"
                      value={formData.projectTitle}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.projectTitle
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.projectTitle && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.projectTitle}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("specialization") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التخصص <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.specialization
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.specialization && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.specialization}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("expectedPages") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عدد الصفحات المتوقع{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      name="expectedPages"
                      value={formData.expectedPages}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.expectedPages
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.expectedPages && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.expectedPages}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("universityRequirements") && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      متطلبات الجامعة <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      name="universityRequirements"
                      value={formData.universityRequirements}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.universityRequirements
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                      placeholder="اذكر متطلبات الجامعة الخاصة بمشروع التخرج..."
                    />
                    {errors.universityRequirements && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.universityRequirements}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("projectDeliveryDate") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموعد النهائي <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="date"
                      name="projectDeliveryDate"
                      value={formData.projectDeliveryDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.projectDeliveryDate
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.projectDeliveryDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.projectDeliveryDate}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("supervisorName") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المشرف العلمي (إن وجد)
                    </label>
                    <input
                      type="text"
                      name="supervisorName"
                      value={formData.supervisorName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A]"
                      placeholder="اسم المشرف"
                    />
                  </div>
                )}

                {service.fields.includes("supervisorInstructions") && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تعليمات المشرف
                    </label>
                    <textarea
                      name="supervisorInstructions"
                      value={formData.supervisorInstructions}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A]"
                      placeholder="أي تعليمات خاصة من المشرف..."
                    />
                  </div>
                )}

                {/* خدمة السير الذاتية */}
                {service.fields.includes("cvFullName") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="cvFullName"
                      value={formData.cvFullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.cvFullName ? "border-red-500" : "border-gray-200"
                        }`}
                    />
                    {errors.cvFullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cvFullName}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("cvSpecialization") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التخصص <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="cvSpecialization"
                      value={formData.cvSpecialization}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.cvSpecialization
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.cvSpecialization && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cvSpecialization}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("cvExperience") && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الخبرات <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      name="cvExperience"
                      value={formData.cvExperience}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.cvExperience
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                      placeholder="الخبرات السابقة..."
                    />
                    {errors.cvExperience && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cvExperience}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("cvSkills") && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المهارات <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      name="cvSkills"
                      value={formData.cvSkills}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.cvSkills ? "border-red-500" : "border-gray-200"
                        }`}
                      placeholder="المهارات التقنية والشخصية..."
                    />
                    {errors.cvSkills && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cvSkills}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("cvCourses") && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الدورات التدريبية <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      name="cvCourses"
                      value={formData.cvCourses}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.cvCourses ? "border-red-500" : "border-gray-200"
                        }`}
                      placeholder="الدورات والشهادات..."
                    />
                    {errors.cvCourses && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cvCourses}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("cvLanguages") && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اللغات <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="cvLanguages"
                      value={formData.cvLanguages}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.cvLanguages
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                      placeholder="العربية (أم)، الإنجليزية (متقدم)..."
                    />
                    {errors.cvLanguages && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cvLanguages}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("cvObjective") && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الهدف المهني <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      name="cvObjective"
                      value={formData.cvObjective}
                      onChange={handleInputChange}
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.cvObjective
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                      placeholder="أهدافك المهنية..."
                    />
                    {errors.cvObjective && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cvObjective}
                      </p>
                    )}
                  </div>
                )}

                {/* خدمة العروض التقديمية */}
                {service.fields.includes("presentationTopic") && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      موضوع العرض <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="presentationTopic"
                      value={formData.presentationTopic}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.presentationTopic
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.presentationTopic && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.presentationTopic}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("presentationSlides") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عدد الشرائح <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      name="presentationSlides"
                      value={formData.presentationSlides}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.presentationSlides
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.presentationSlides && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.presentationSlides}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("presentationContent") && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      النص أو المحتوى <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) =>
                        handleFileUpload(e, "presentationContent")
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00416A] file:text-white"
                    />
                    {errors.presentationContent && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.presentationContent}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("presentationLanguage") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      لغة العرض <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="presentationLanguage"
                      value={formData.presentationLanguage}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.presentationLanguage
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    >
                      <option value="">اختر اللغة</option>
                      <option value="ar">العربية</option>
                      <option value="en">الإنجليزية</option>
                      <option value="both">الاثنتين معاً</option>
                    </select>
                    {errors.presentationLanguage && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.presentationLanguage}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("presentationDeliveryDate") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموعد النهائي <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="date"
                      name="presentationDeliveryDate"
                      value={formData.presentationDeliveryDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.presentationDeliveryDate
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.presentationDeliveryDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.presentationDeliveryDate}
                      </p>
                    )}
                  </div>
                )}

                {/* خدمة تصميم بوسترات */}
                {service.fields.includes("posterTitle") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان المشروع <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="posterTitle"
                      value={formData.posterTitle}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.posterTitle
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.posterTitle && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.posterTitle}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("posterStudentName") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الطالب <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="posterStudentName"
                      value={formData.posterStudentName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.posterStudentName
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.posterStudentName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.posterStudentName}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("posterUniversity") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الجامعة <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="posterUniversity"
                      value={formData.posterUniversity}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.posterUniversity
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.posterUniversity && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.posterUniversity}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("posterLogo") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الشعار (إن وجد)
                    </label>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      onChange={(e) => handleFileUpload(e, "posterLogo")}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00416A] file:text-white"
                    />
                  </div>
                )}

                {service.fields.includes("posterSize") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المقاس المطلوب <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="posterSize"
                      value={formData.posterSize}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.posterSize ? "border-red-500" : "border-gray-200"
                        }`}
                      placeholder="مثال: A1, 50x70 سم"
                    />
                    {errors.posterSize && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.posterSize}
                      </p>
                    )}
                  </div>
                )}

                {/* خدمة الاستبيانات */}
                {service.fields.includes("surveyTopic") && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      موضوع البحث <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="surveyTopic"
                      value={formData.surveyTopic}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.surveyTopic
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.surveyTopic && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.surveyTopic}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("surveyTarget") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الفئة المستهدفة <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="surveyTarget"
                      value={formData.surveyTarget}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.surveyTarget
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.surveyTarget && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.surveyTarget}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("surveyQuestionsCount") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عدد الأسئلة المتوقع{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      name="surveyQuestionsCount"
                      value={formData.surveyQuestionsCount}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.surveyQuestionsCount
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    />
                    {errors.surveyQuestionsCount && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.surveyQuestionsCount}
                      </p>
                    )}
                  </div>
                )}

                {service.fields.includes("surveyQuestionType") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الأسئلة <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="surveyQuestionType"
                      value={formData.surveyQuestionType}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] ${errors.surveyQuestionType
                          ? "border-red-500"
                          : "border-gray-200"
                        }`}
                    >
                      <option value="">اختر النوع</option>
                      <option value="closed">مغلقة (اختيار من متعدد)</option>
                      <option value="open">مفتوحة</option>
                      <option value="mixed">مختلط</option>
                    </select>
                    {errors.surveyQuestionType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.surveyQuestionType}
                      </p>
                    )}
                  </div>
                )}

                {/* حقول تطوير المواقع (إذا تم اختيارها) */}
                {service.value === "web-development" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع الموقع <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="websiteType"
                        value={formData.websiteType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A]"
                      >
                        <option value="">اختر النوع</option>
                        <option value="personal">شخصي</option>
                        <option value="commercial">تجاري</option>
                        <option value="ecommerce">متجر إلكتروني</option>
                        <option value="blog">مدونة</option>
                        <option value="portfolio">معرض أعمال</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عدد الصفحات المطلوبة
                      </label>
                      <input
                        required
                        type="number"
                        name="pagesRequired"
                        value={formData.pagesRequired}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A]"
                        placeholder="1"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        التقنيات المفضلة
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          "WordPress",
                          "HTML/CSS",
                          "JavaScript",
                          "React/Next.js",
                          "Node.js",
                        ].map((tech) => (
                          <label
                            key={tech}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.technologies.includes(tech)}
                              onChange={() => handleTechnologyChange(tech)}
                              className="w-4 h-4 text-[#00416A] border-gray-300 rounded focus:ring-[#00416A]"
                            />
                            <span className="text-sm text-gray-700">
                              {tech}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="hasDesign"
                          checked={formData.hasDesign}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-[#00416A] border-gray-300 rounded focus:ring-[#00416A]"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          يوجد تصميم جاهز
                        </span>
                      </label>
                    </div>

                    {formData.hasDesign && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رفع ملف التصميم
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.psd,.ai"
                          onChange={(e) => handleFileUpload(e, "designFile")}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00416A] file:text-white"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* حقول كتابة الوظائف (العامة) */}
                {service.value === "writing" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع الوظيفة <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="assignmentType"
                        value={formData.assignmentType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A]"
                      >
                        <option value="">اختر النوع</option>
                        <option value="research">بحث</option>
                        <option value="report">تقرير</option>
                        <option value="article">مقال</option>
                        <option value="homework">حل واجب</option>
                        <option value="presentation">عرض تقديمي</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عدد الصفحات أو الكلمات
                      </label>
                      <input
                        type="number"
                        name="pagesOrWords"
                        value={formData.pagesOrWords}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A]"
                        placeholder="1"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الموضوع أو المجال{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A]"
                        placeholder="أدخل الموضوع أو المجال"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="needsReferences"
                          checked={formData.needsReferences}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-[#00416A] border-gray-300 rounded focus:ring-[#00416A]"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          يحتاج مراجع (رسوم إضافية)
                        </span>
                      </label>
                    </div>

                    {formData.needsReferences && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رفع ملف المراجع (اختياري)
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => handleFileUpload(e, "referenceFile")}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00416A] file:text-white"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* حقول إعداد الأبحاث (العامة) */}
                {service.value === "research" && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عنوان البحث <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        name="researchTitle"
                        value={formData.researchTitle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A]"
                        placeholder="أدخل عنوان البحث"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المنهجية المطلوبة
                      </label>
                      <textarea
                        name="methodology"
                        value={formData.methodology}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A]"
                        placeholder="وصف المنهجية المطلوبة..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عدد المصادر
                      </label>
                      <input
                        type="number"
                        name="sourceCount"
                        value={formData.sourceCount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A]"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تنسيق الاقتباس
                      </label>
                      <select
                        name="citationFormat"
                        value={formData.citationFormat}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A]"
                      >
                        <option value="">اختر التنسيق</option>
                        <option value="APA">APA</option>
                        <option value="MLA">MLA</option>
                        <option value="Chicago">Chicago</option>
                        <option value="Harvard">Harvard</option>
                        <option value="IEEE">IEEE</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between gap-4 mt-8">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  السابق
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmation(true)}
                  className="bg-[#00416A] text-white px-8 py-3 rounded-xl hover:bg-opacity-90 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  مراجعة الطلب
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RequestFormClient;