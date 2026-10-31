'use client';

import React from 'react';
import { useCart } from './CartProvider';

// Marketing copy lives here; the id and price come from the Package table so
// the bookings API can verify them.
export default function PackagesSection({ dbPackages = [] }) {
  const { addToCart } = useCart();

  const packageDetails = [
    {
      name: 'Starter',
      description: 'เช่ากล้อง Mirrorless + เลนส์ Kit 1 วัน',
      tagline: 'เหมาะสำหรับมือใหม่ ถ่ายรูปท่องเที่ยว หรือคอนเทนต์สบายๆ',
      isPopular: false,
      features: [
        'กล้อง Mirrorless 1 ตัว (Sony / Canon)',
        'เลนส์ Kit 1 ตัว ความคมชัดสูง',
        'แบตเตอรี่ 2 ก้อน + SD Card ความเร็วสูง',
        'ฟรีบริการจัดส่ง - รับคืนถึงที่',
        'บริการสอนตั้งค่ากล้องเบื้องต้น',
      ],
      icon: 'fa-camera',
    },
    {
      name: 'Creator',
      description: 'เช่ากล้อง + ช่างภาพ ครึ่งวัน',
      tagline: 'คุ้มค่าที่สุด สำหรับงานรับปริญญา โปรไฟล์ และสินค้า',
      isPopular: true,
      popularBadge: 'ยอดนิยม',
      features: [
        'ทุกอย่างที่ได้รับในแพ็กเกจ Starter',
        'ช่างภาพมืออาชีพ ครึ่งวัน (4 ชั่วโมง)',
        '50 รูป แต่งโทนสี & retouch เนียนตา',
        'ส่งไฟล์รูปทั้งหมด (Full HD) ภายใน 3 วัน',
        'ให้คำแนะนำเรื่องท่าโพสและแสง',
      ],
      icon: 'fa-fire',
    },
    {
      name: 'Pro',
      description: 'เช่ากล้อง + ช่างภาพ เต็มวัน',
      tagline: 'ครบวงจรสำหรับงานแต่งงาน งานอีเวนต์ใหญ่ และโปรดักชั่น',
      isPopular: false,
      features: [
        'ทุกอย่างที่ได้รับในแพ็กเกจ Creator',
        'ช่างภาพเต็มวัน (8 ชั่วโมง)',
        '150+ รูป แต่งโทนสี & retouch ละเอียด',
        'วิดีโอ highlight ความยาว 1 นาที (Reels / TikTok)',
        'ส่งไฟล์ด่วนพิเศษภายใน 5 วัน ผ่าน Cloud storage',
      ],
      icon: 'fa-crown',
    },
  ];

  const packages = packageDetails.map((pkg) => {
    const dbPkg = dbPackages.find((p) => p.name === pkg.name);
    return { ...pkg, id: dbPkg?.id ?? pkg.name, price: dbPkg?.price, available: Boolean(dbPkg) };
  });

  const handleSelectPackage = (pkg) => {
    if (!pkg.available) return;
    addToCart({
      id: pkg.id,
      type: 'package',
      name: `แพ็กเกจ ${pkg.name}`,
      price: pkg.price,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
    });
  };

  return (
    <section id="packages" className="py-20 bg-slate-900 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-xs sm:text-sm font-semibold border border-orange-500/20 mb-4">
            <i className="fa-solid fa-box-open"></i>
            <span>All-in-One Packages</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            แพ็กเกจสุดคุ้ม ตอบโจทย์ทุกงานถ่ายภาพ
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            เลือกแพ็กเกจที่ลงตัวกับความต้องการ ไม่ว่าจะเป็นการเช่าเดี่ยวหรือรวมช่างภาพ
            ช่วยคุณประหยัดเงินและได้งานคุณภาพสูงสุด
          </p>
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                pkg.isPopular
                  ? 'bg-slate-800/90 border-2 border-orange-500 shadow-2xl shadow-orange-500/20 md:-translate-y-4'
                  : 'bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/80'
              }`}
            >
              {/* Popular Badge */}
              {pkg.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-1.5">
                  <i className="fa-solid fa-fire text-amber-200"></i>
                  <span>{pkg.popularBadge}</span>
                </div>
              )}

              <div>
                {/* Title & Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span>{pkg.name}</span>
                    </h3>
                    <p className="text-xs text-orange-400 font-medium mt-1">
                      {pkg.description}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${
                      pkg.isPopular
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                        : 'bg-slate-700/60 text-slate-300'
                    }`}
                  >
                    <i className={`fa-solid ${pkg.icon}`}></i>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-6 leading-relaxed min-h-[36px]">
                  {pkg.tagline}
                </p>

                {/* Price Display */}
                <div className="py-4 border-y border-slate-700/80 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-slate-400 text-sm">฿</span>
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      {pkg.available ? pkg.price.toLocaleString() : '-'}
                    </span>
                    <span className="text-slate-400 text-xs ml-1">/ แพ็กเกจ</span>
                  </div>
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-shield-check"></i>
                    <span>รวมประกันความเสียหายเบื้องต้น</span>
                  </p>
                </div>

                {/* Features List */}
                <ul className="space-y-3.5 mb-8 text-sm">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/20">
                        <i className="fa-solid fa-check text-[10px]"></i>
                      </div>
                      <span className="text-slate-300 text-xs sm:text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleSelectPackage(pkg)}
                disabled={!pkg.available}
                className={`disabled:opacity-50 disabled:cursor-not-allowed w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  pkg.isPopular
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-700/80 hover:bg-slate-700 text-white hover:text-orange-400 border border-slate-600/70 hover:border-orange-500/50'
                }`}
              >
                <i className="fa-solid fa-cart-shopping text-xs"></i>
                <span>{pkg.available ? 'เลือกแพ็กเกจนี้' : 'ยังไม่เปิดให้บริการ'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
