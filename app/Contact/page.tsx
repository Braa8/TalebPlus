// app/contact/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lottie from "lottie-react";
import { FaInstagram } from "react-icons/fa";
// استيراد ملف Lottie واحد (يمكنك تغيير المسار)
import contactAnimation from "@/public/animations/contact.json";

gsap.registerPlugin(ScrollTrigger);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // تأخير بسيط للسماح بتحميل Lottie واكتمال DOM
    const timer = setTimeout(() => {
      // التحقق من وجود العناصر
      if (
        !heroRef.current ||
        !formRef.current ||
        !infoRef.current ||
        !mapRef.current
      )
        return;

      // Hero section animation
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: "power3.out",
      });

      // Form section
      gsap.from(formRef.current, {
        scrollTrigger: {
          trigger: formRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        x: -50,
        opacity: 0,
        duration: 1,
      });

      // Info section
      gsap.from(infoRef.current, {
        scrollTrigger: {
          trigger: infoRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        x: 50,
        opacity: 0,
        duration: 1,
      });

      // Map section
      gsap.from(mapRef.current, {
        scrollTrigger: {
          trigger: mapRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.4)",
      });

      ScrollTrigger.refresh();
    }, 200); // تأخير 200ms

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: "تم إرسال رسالتك بنجاح ، شكراً للمراسلة",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setMessage({
          type: "error",
          text: data.error || "حدث خطأ أثناء الإرسال، حاول مرة أخرى.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "فشل الاتصال بالخادم. تأكد من اتصالك بالإنترنت.",
      });
      console.log("Error submitting contact form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#F0EAD6] to-white overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Lottie
              animationData={contactAnimation}
              className="w-64 h-64 mx-auto"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#00416A] mb-4">
            تواصل معنا
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نحن هنا للإجابة عن استفساراتك ومساعدتك في أي وقت. املأ النموذج
            وسنعود إليك في أقرب وقت.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
        {/* Form */}
        <div ref={formRef}>
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10">
            <h2 className="text-3xl font-bold text-[#00416A] mb-6">
              أرسل رسالة
            </h2>

            {message && (
              <div
                className={`p-4 rounded-lg mb-6 ${
                  message.type === "success"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A] focus:border-transparent transition-all"
                  placeholder="أدخل اسمك"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A] focus:border-transparent transition-all"
                  placeholder="example@domain.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموضوع <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A] focus:border-transparent transition-all"
                  placeholder="موضوع الرسالة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرسالة <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#00416A] focus:border-transparent transition-all"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-[#00416A] hover:bg-opacity-90 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    جاري الإرسال...
                  </span>
                ) : (
                  "إرسال الرسالة"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Contact Info */}
        <div ref={infoRef}>
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 h-full">
            <h2 className="text-3xl font-bold text-[#00416A] mb-8">
              معلومات الاتصال
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#00416A] text-white p-3 rounded-full">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#00416A]">
                    البريد الإلكتروني
                  </h3>
                  <p className="text-gray-600 mt-1">info.talebplus@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#00416A] text-white p-3 rounded-full">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#00416A]">
                    رقم الهاتف
                  </h3>
                  <p className="text-gray-600 mt-1">0942394391</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-[#00416A] mb-4">
                تابعنا على
              </h3>
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/share/18JYBdnrGg/"
                  className="bg-gray-100 hover:bg-[#00416A] text-gray-600 hover:text-white p-3 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/talibplus.hub?igsh=MW56cTZrZ3ZyaWM3eA=="
                  className="bg-gray-100 hover:bg-[#00416A] text-gray-600 hover:text-white p-3 rounded-full transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <FaInstagram className="w-5 h-5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
