'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
}

interface FormData {
  packageId: string;
  fullName: string;
  email: string;
  phone: string;
  deliveryDate: string;
  notes: string;
}

const packages: Package[] = [
  {
    id: 'basic',
    name: 'باكج مشروع التخرّج',
    description: 'خدمات متكاملة لمشروع التخرّج',
    price: 413000,
    features: ['تنسيق المشروع', 'تصميم العرض', 'تصميم الغلاف و البوستر'],
  },
  {
    id: 'professional',
    name: 'باكج (طالب+) الخرّيج',
    description: 'التأهيل لسوق العمل',
    price: 980000,
    popular: true,
    features: ['CV', 'Cover Letter', 'LinkedIn', 'موقع إلكتروني', 'بطاقة أعمال رقمية'],
  },
  {
    id: 'enterprise',
    name: 'باقة (طالب+) الشاملة',
    description: 'كل ما تحتاجه في مكان واحد',
    price: 1540000,
    features: [
      'إعداد بحث أكاديمي أو إشراف على مشروع',
      'تنسيق و تنضيد المشروع',
      'ترجمة أكاديمية (اختياري)',
      'تصميم عرض تقديمي تفاعلي',
      'تصميم بوستر و غلاف المشروع',
    ],
  },
  {
    id: 'creative',
    name: 'باقة (طالب+) الإبداعية',
    description: 'إبداع بلا حدود',
    price: 253000,
    features: ['إنفوجرافيك تعليمي', 'تصميم عرض تقديمي تفاعلي', 'تصميم بوستر و غلاف المشروع'],
  },
  {
    id: 'speed',
    name: 'باقة (طالب+) السريعة',
    description: '🚀',
    price: 506000,
    features: ['تنضيد مشروع تخرج', 'تصميم عرض تقديمي ', 'تصميم بوستر '],
  },
];

const PackagesClient: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<FormData>({
    packageId: '',
    fullName: '',
    email: '',
    phone: '',
    deliveryDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormData((prev) => ({ ...prev, packageId: pkg.id }));
    setFieldErrors({});
    // نخفي أي رسالة قديمة عند اختيار باقة جديدة
    setMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'الاسم الكامل مطلوب';
    }
    if (!formData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'رقم الهاتف مطلوب';
    }
    if (!formData.deliveryDate) {
      errors.deliveryDate = 'تاريخ الاستلام مطلوب';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        serviceType: 'packages',
        packageName: selectedPackage.name,
        urgentDelivery: false,
        budget: '',
        deliveryDate: formData.deliveryDate,
        notes: formData.notes.trim(),
        estimatedPrice: selectedPackage.price,
        priceBreakdown: `السعر النهائي: ${selectedPackage.price.toLocaleString()} ل.س`,
      };

      const response = await fetch('/api/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.' });
        // نعيد تعيين النموذج إلى حالته الأولية
        setFormData({
          packageId: '',
          fullName: '',
          email: '',
          phone: '',
          deliveryDate: '',
          notes: '',
        });
        setSelectedPackage(null);
        setFieldErrors({});
      } else {
        setMessage({ type: 'error', text: data.error || 'حدث خطأ، حاول مرة أخرى' });
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F0EAD6] to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-4 group">
            <h1 className="text-2xl font-bold text-[#00416A] group-hover:text-opacity-80 transition-colors">
              ← العودة للرئيسية
            </h1>
          </Link>
          <h1 className="text-5xl font-bold text-[#00416A] mb-4">اختر باقتك المناسبة</h1>
          <p className="text-xl text-gray-600">خطط مرنة تناسب جميع الاحتياجات</p>
        </div>

        {/* ✅ رسالة التأكيد – تظهر بشكل مستقل ولا تختفي إلا بالضغط على زر الإغلاق */}
        {message && (
          <div
            className={`relative max-w-2xl mx-auto p-4 rounded-lg mb-6 flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            <span className="text-sm sm:text-base">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-xl font-bold leading-none mr-4 hover:opacity-70 transition-opacity"
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>
        )}

        {/* شبكة الباقات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
                selectedPackage?.id === pkg.id
                  ? 'ring-4 ring-[#00416A] scale-105'
                  : 'hover:shadow-2xl'
              }`}
              onClick={() => handlePackageSelect(pkg)}
            >
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#00416A] mb-2">{pkg.name}</h3>
                <p className="text-gray-500 mb-4">{pkg.description}</p>
                <div className="text-4xl font-bold text-[#00416A] mb-6">
                  {pkg.price.toLocaleString()}{' '}
                  <span className="text-lg font-normal text-gray-500">ل.س</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600">
                      <span className="text-[#00416A] text-xl">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'bg-[#00416A] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedPackage?.id === pkg.id ? 'تم الاختيار' : 'اختر هذه الباقة'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* نموذج الطلب – يظهر فقط عند اختيار باقة */}
        {selectedPackage && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-[#00416A] mb-6 text-center">
              طلب الباقة: {selectedPackage.name}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] focus:border-transparent transition-all ${
                      fieldErrors.fullName ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="أدخل اسمك"
                  />
                  {fieldErrors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.fullName}</p>
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
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] focus:border-transparent transition-all ${
                      fieldErrors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="example@domain.com"
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
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
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] focus:border-transparent transition-all ${
                      fieldErrors.phone ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="+966 5X XXX XXXX"
                  />
                  {fieldErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ ووقت الاستلام <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-[#00416A] focus:border-transparent transition-all ${
                      fieldErrors.deliveryDate ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {fieldErrors.deliveryDate && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.deliveryDate}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A] focus:border-transparent transition-all"
                  placeholder="أي تفاصيل إضافية تريد إضافتها..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-4 px-6 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 ${
                    loading ? 'bg-gray-400 text-white' : 'bg-[#00416A] text-white hover:bg-opacity-90'
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
                  type="button"
                  onClick={() => setSelectedPackage(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackagesClient;