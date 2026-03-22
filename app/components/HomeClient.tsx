'use client';

import Image from 'next/image';
import Link from 'next/link';
import Lotty from './lotty';
import PillNav from './PillNav';
import { useState } from 'react';

export default function HomeClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div className="parent">
        <div className="div1 bg-linear-to-b from-white via-white to-[#F0EAD6] w-full max-h-screen">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden absolute top-4 right-4 z-50 p-2 rounded-lg bg-[#F0EAD6] text-[#00416A]"
            aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-16 right-4 z-40 bg-[#F0EAD6] rounded-lg shadow-lg p-4 min-w-50">
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="text-[#00416A] hover:bg-[#00416A] hover:text-[#F0EAD6] px-3 py-2 rounded-md transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  الرئيسية
                </Link>
                <Link
                  href="/About"
                  className="text-[#00416A] hover:bg-[#00416A] hover:text-[#F0EAD6] px-3 py-2 rounded-md transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  من نحن
                </Link>
                <Link
                  href="/Services"
                  className="text-[#00416A] hover:bg-[#00416A] hover:text-[#F0EAD6] px-3 py-2 rounded-md transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  خدماتنا
                </Link>
                <Link
                  href="/Contact"
                  className="text-[#00416A] hover:bg-[#00416A] hover:text-[#F0EAD6] px-3 py-2 rounded-md transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  تواصل معنا
                </Link>
              </nav>
            </div>
          )}

          <Lotty />

          <div className="lg:hidden">
            <div className="flex flex-col justify-center items-center mt-15 font-extrabold">
              <h2 className="text-[#00416A] text-3xl">تعرّف أكثر على منصّتنا</h2>
              <p className="text-[#00416A] text-xl mt-4">وانتقل إلى باقي الأقسام</p>
              <a
                href="#BlueSec"
                className="bg-[#F0EAD6] text-[#00416A] hover:bg-[#00416A] hover:text-[#F0EAD6] px-4 py-2 rounded-md transition-colors block mt-4 scroll-m-100"
              >
                انتقل الآن
              </a>
            </div>
          </div>
        </div>

        <div id="BlueSec" className="div2 bg-[#00416A] w-full h-screen justify-center items-center flex">
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <PillNav
              items={[
                { label: 'الرئيسية', href: '/' },
                { label: 'من نحن', href: '/About' },
                { label: 'خدماتنا', href: '/Services' },
                { label: 'تواصل معنا', href: '/Contact' },
              ]}
              activeHref="/"
              className="custom-nav mt-6 mx-22"
              ease="power2.easeOut"
              baseColor="#F0EAD6"
              pillColor="#00416A"
              hoveredPillTextColor="#00416A"
              pillTextColor="#F0EAD6"
              initialLoadAnimation={false}
            />
          </div>

          <div className="p-4 -mt-2 flex flex-col justify-center items-center">
            <Image
              src="/MainLogo.png"
              alt="شعار طالب بلس – منصة الخدمات الطلابية في سوريا"
              width={300}
              height={300}
              className="w-800 h-90 sm:w-200 sm:h-100 md:w-200 md:h-100 lg:w-100 lg:h-80 xl:w-150 xl:h-100"
              priority
            />
            <div className="text-center -mt-14 space-y-2">
              <h1 className="text-[#F0EAD6] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                منصتك الأولى لدعم رحلتك
              </h1>
              <h2 className="text-[#F0EAD6] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                الأكاديمية والمهنية
              </h2>
            </div>
            <div className="p-4 mt-18">
              <Link href="/auth/login">
                <button className="bg-[#F0EAD6] text-[#00416A] text-xl p-4 hover:bg-[#00416A] hover:text-[#F0EAD6] hover:cursor-pointer transition rounded-4xl">
                  إبدأ رحلتك و سجّل دخول
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}