'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GearCard from './GearCard';
import { useCart } from './CartProvider';

export default function GearSection({ initialGear = [] }) {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');

  const categories = [
    'ทั้งหมด',
    'Mirrorless/DSLR',
    'Cinema & Video Cam',
    'Action Cam & Drone',
    'Lens/Accessories',
  ];

  const filteredGear =
    selectedCategory === 'ทั้งหมด'
      ? initialGear
      : initialGear.filter((item) =>
          item.category?.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  return (
    <section id="rental" className="py-20 bg-slate-900 relative">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-xs sm:text-sm font-semibold border border-orange-500/20 mb-3">
              <i className="fa-solid fa-camera"></i>
              <span>Popular Gear • อุปกรณ์พร้อมเช่า</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              อุปกรณ์กล้องยอดนิยม พร้อมเช่าทันที
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
              เช่ากล้อง เลนส์ และอุปกรณ์เสริมระดับมืออาชีพ ตรวจสอบสภาพ 100% ทุกชิ้นก่อนส่งมอบ
            </p>
          </div>

          <Link
            href="/gear"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500 hover:text-white border border-orange-500/30 transition-all duration-200 self-start md:self-auto"
          >
            <span>ดูอุปกรณ์ทั้งหมด</span>
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gear Grid */}
        {filteredGear.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGear.map((gear) => (
              <GearCard key={gear.id} gear={gear} onAddToCart={addToCart} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-800/40 rounded-3xl border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fa-solid fa-box-open"></i>
            </div>
            <p className="text-slate-300 text-base font-semibold">
              ไม่พบอุปกรณ์ในหมวดหมู่นี้
            </p>
            <p className="text-slate-500 text-xs mt-1">
              โปรดลองเลือกหมวดหมู่อื่น หรือกลับมาดูใหม่ภายหลัง
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
