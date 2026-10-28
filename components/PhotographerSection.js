'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PhotographerCard from './PhotographerCard';

export default function PhotographerSection({ initialPhotographers = [] }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('ทั้งหมด');

  const specialties = [
    'ทั้งหมด',
    'พอร์ตเทรต/รับปริญญา',
    'งานแต่งงาน/พรีเวดดิ้ง',
    'อีเวนต์/คอนเสิร์ต',
    'สินค้า/อาหาร',
  ];

  // Prepare photographer objects to ensure images array exists
  const formattedPhotographers = initialPhotographers.map((p) => ({
    ...p,
    images:
      p.images && p.images.length > 0
        ? p.images
        : [p.image1, p.image2, p.image3].filter(Boolean),
  }));

  const filteredPhotographers =
    selectedSpecialty === 'ทั้งหมด'
      ? formattedPhotographers
      : formattedPhotographers.filter((p) =>
          p.specialty?.toLowerCase().includes(selectedSpecialty.toLowerCase())
        );

  return (
    <section id="photographers" className="py-20 bg-slate-950 relative">
      {/* Decorative Glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-xs sm:text-sm font-semibold border border-orange-500/20 mb-3">
              <i className="fa-solid fa-user-tie"></i>
              <span>Verified Professionals • ช่างภาพคุณภาพ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              ช่างภาพมืออาชีพ คัดสรรคุณภาพ
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
              จองคิวช่างภาพที่มีประสบการณ์ การันตีผลงาน สไตล์ตรงใจ พร้อมอุปกรณ์ครบมือตอบโจทย์ทุกแนว
            </p>
          </div>

          <Link
            href="/photographers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500 hover:text-white border border-orange-500/30 transition-all duration-200 self-start md:self-auto"
          >
            <span>ดูช่างภาพทั้งหมด</span>
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>

        {/* Specialty Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedSpecialty === spec
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Photographer Grid */}
        {filteredPhotographers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotographers.map((photographer) => (
              <PhotographerCard
                key={photographer.id}
                photographer={photographer}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-800/40 rounded-3xl border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fa-solid fa-camera-retro"></i>
            </div>
            <p className="text-slate-300 text-base font-semibold">
              ไม่พบช่างภาพในหมวดหมู่นี้
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
