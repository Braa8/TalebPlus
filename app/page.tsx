import { Suspense } from 'react';
import HomeClient from './components/HomeClient';
import { Metadata } from 'next';

// إضافة بيانات تعريفية متقدمة لتحسين SEO
export const metadata: Metadata = {
  title: 'طالب بلس | منصتك الأولى لدعم المسيرة الأكاديمية والمهنية في سوريا',
  description: 'منصة طالب بلس تقدم خدمات متكاملة للطلاب السوريين: ترجمة، كتابة وظائف، إعداد أبحاث، تطوير مواقع، وتصميم السير الذاتية. سجل الآن لتبدأ رحلتك.',
  keywords: 'خدمات طلابية سوريا, مساعدة في الأبحاث, كتابة وظائف, ترجمة معتمدة, تطوير مواقع للطلاب, تصميم سيرة ذاتية, مشاريع التخرج, الجامعة الافتراضية السورية',
  openGraph: {
    title: 'طالب بلس | منصة الخدمات الطلابية في سوريا',
    description: 'دعم أكاديمي ومهني متكامل للطلاب السوريين. خدمات: ترجمة، أبحاث، تطوير مواقع، إعداد السير الذاتية، وغيرها.',
    url: 'https://talebplus.vercel.app',
    siteName: 'طالب بلس',
    images: [
      {
        url: 'https://talebplus.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'طالب بلس - منصة الخدمات الطلابية',
      },
    ],
    locale: 'ar_SY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'طالب بلس | منصة الخدمات الطلابية في سوريا',
    description: 'دعم أكاديمي ومهني للطلاب السوريين. سجل الآن واستفد من خدماتنا المتكاملة.',
    images: ['https://talebplus.vercel.app/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://talebplus.vercel.app',
  },
};

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <HomeClient />
      </Suspense>

      {/* إضافة بيانات منظمة JSON‑LD لتعزيز ظهور الموقع في محركات البحث */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: 'طالب بلس',
            url: 'https://talebplus.vercel.app',
            logo: 'https://talebplus.vercel.app/MainLogo.png',
            description: 'منصة متكاملة تقدم خدمات أكاديمية ومهنية للطلاب السوريين',
            sameAs: [
              'https://www.facebook.com/talebplus',
              'https://www.instagram.com/talebplus',
              'https://twitter.com/talebplus',
            ],
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'SY',
              addressLocality: 'دمشق',
            },
            offers: {
              '@type': 'Offer',
              description: 'خدمات متنوعة للطلاب: ترجمة، كتابة وظائف، إعداد أبحاث، تطوير مواقع، تصميم سيرة ذاتية',
            },
          }),
        }}
      />
    </>
  );
}