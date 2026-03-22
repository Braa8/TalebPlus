import { Suspense } from 'react';
import VerifyErrorClient from './VerifyErrorClient';

export default function VerifyErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0EAD6] flex items-center justify-center">جاري التحميل...</div>}>
      <VerifyErrorClient />
    </Suspense>
  );
}