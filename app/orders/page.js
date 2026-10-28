'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/bookings');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
      <div className="text-center">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-orange-500 mb-3"></i>
        <p className="text-slate-400 text-sm">กำลังนำทางไปยังหน้ารายการจอง...</p>
      </div>
    </div>
  );
}
