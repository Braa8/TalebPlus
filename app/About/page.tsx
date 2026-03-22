// app/about/page.tsx
'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lottie from 'lottie-react';
import Link from 'next/link';

// استيراد ملفات Lottie من مجلد public
import heroAnimation from '@/public/animations/hero.json';
import storyAnimation from '@/public/animations/story.json';
import visionAnimation from '@/public/animations/vision.json';
import missionAnimation from '@/public/animations/mission.json';
import qualityAnimation from '@/public/animations/quality.json';
import integrityAnimation from '@/public/animations/integrity.json';
import innovationAnimation from '@/public/animations/innovation.json';
import commitmentAnimation from '@/public/animations/commitment.json';
import ctaAnimation from '@/public/animations/cta.json';

gsap.registerPlugin(ScrollTrigger);

interface LottieAnimationProps {
  animationData: unknown;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

const LottieAnimation = ({ animationData, className = '', loop = true, autoplay = true }: LottieAnimationProps) => {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
};

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const visionMissionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // التحقق من وجود جميع العناصر قبل بدء الحركة
    const elements = [
      heroRef.current,
      storyRef.current,
      visionMissionRef.current,
      valuesRef.current,
      teamRef.current,
      ctaRef.current,
    ];
    if (elements.some(el => !el)) return;

    // Hero section animation
    gsap.from(heroRef.current, {
      opacity: 0,
      y: 50,
      duration: 1.2,
      ease: 'power3.out',
    });

    // Story section
    gsap.from(storyRef.current, {
      scrollTrigger: {
        trigger: storyRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
      x: -100,
      opacity: 0,
      duration: 1,
    });

    // Vision & Mission cards
    if (visionMissionRef.current?.children) {
      gsap.from(visionMissionRef.current.children, {
        scrollTrigger: {
          trigger: visionMissionRef.current,
          start: 'top 80%',
        },
        scale: 0.8,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'back.out(1.4)',
      });
    }

    // Values cards
    if (valuesRef.current?.children) {
      gsap.from(valuesRef.current.children, {
        scrollTrigger: {
          trigger: valuesRef.current,
          start: 'top 80%',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
      });
    }

    // Team members
    if (teamRef.current?.children) {
      gsap.from(teamRef.current.children, {
        scrollTrigger: {
          trigger: teamRef.current,
          start: 'top 80%',
        },
        scale: 0.5,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'elastic.out(1, 0.3)',
      });
    }

    // CTA section
    gsap.from(ctaRef.current, {
      scrollTrigger: {
        trigger: ctaRef.current,
        start: 'top 90%',
      },
      y: 80,
      opacity: 0,
      duration: 1,
      ease: 'back.out(1.2)',
    });

    // تحديث ScrollTrigger بعد تعريف جميع الحركات
    ScrollTrigger.refresh();

    // تنظيف
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []); // التبعيات فارغة لأننا نريد تشغيلها مرة واحدة

  return (
    <main className="min-h-screen bg-linear-to-br from-[#F0EAD6] to-white overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <LottieAnimation animationData={heroAnimation} className="w-64 h-64 mx-auto" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-[#00416A] mb-6">من نحن</h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
            منصة رائدة تهدف لمساعدة الطلاب في إنجاز مشاريعهم الأكاديمية بجودة عالية واحترافية
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section ref={storyRef} className="py-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <LottieAnimation animationData={storyAnimation} className="w-full max-w-md mx-auto" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#00416A] mb-6">قصتنا</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              انطلقت منصتنا بهدف سد الفجوة بين الطلاب واحتياجاتهم الأكاديمية.
              بدأنا كفكرة بسيطة لمساعدة زملائنا في الجامعة، واليوم أصبحنا منصة متكاملة
              تخدم مئات الطلاب سنوياً.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              نؤمن بأن كل طالب يستحق الدعم المناسب لتحقيق طموحه الأكاديمي، ونسعى جاهدين
              لتقديم خدمات متميزة تلبي تطلعاتهم.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section ref={visionMissionRef} className="py-24 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow">
            <LottieAnimation animationData={visionAnimation} className="w-32 h-32 mb-6" />
            <h3 className="text-3xl font-bold text-[#00416A] mb-4">رؤيتنا</h3>
            <p className="text-gray-600 text-lg">
              أن نكون المنصة الرائدة في تقديم الخدمات الأكاديمية
              ونساهم في تخريج أجيال متميزة قادرة على المنافسة العالمية.
            </p>
          </div>
          <div className="bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow">
            <LottieAnimation animationData={missionAnimation} className="w-32 h-32 mb-6" />
            <h3 className="text-3xl font-bold text-[#00416A] mb-4">رسالتنا</h3>
            <p className="text-gray-600 text-lg">
              تمكين الطلاب من تحقيق التفوق الأكاديمي من خلال خدمات احترافية عالية الجودة
              مع الحفاظ على القيم الأكاديمية والنزاهة.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-[#00416A] text-center mb-16">قيمنا</h2>
        <div ref={valuesRef} className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon:  innovationAnimation, title: 'الجودة', desc: 'نلتزم بتقديم أعلى مستويات الجودة في جميع خدماتنا.' },
            { icon: integrityAnimation, title: 'النزاهة', desc: 'نعمل بشفافية وأمانة في جميع تعاملاتنا.' },
            { icon: qualityAnimation, title: 'الابتكار', desc: 'نسعى لتطوير حلول مبتكرة تلبي احتياجات الطلاب.' },
            { icon: commitmentAnimation, title: 'الالتزام', desc: 'نحترم وقت عملائنا ونلتزم بالمواعيد.' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              <LottieAnimation animationData={item.icon} className="w-24 h-24 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#00416A] text-center mb-2">{item.title}</h3>
              <p className="text-gray-600 text-center">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section ref={ctaRef} className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-[#00416A] to-[#002b4a] opacity-90"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <LottieAnimation animationData={ctaAnimation} className="w-48 h-48 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">انضم إلى رحلتنا الأكاديمية</h2>
          <p className="text-xl text-white/90 mb-10">نحن هنا لدعمك في كل خطوة. تواصل معنا الآن!</p>
          <Link
            href="/Contact"
            className="inline-block bg-white text-[#00416A] py-4 px-12 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
          >
            تواصل معنا
          </Link>
        </div>
      </section>
    </main>
  );
}