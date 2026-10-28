'use client';

import React from 'react';
import Link from 'next/link';

export default function PhotographerCard({ photographer }) {
  if (!photographer) return null;

  const defaultImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80',
  ];

  const portfolio =
    Array.isArray(photographer.images) && photographer.images.length > 0
      ? [
          photographer.images[0] || defaultImages[0],
          photographer.images[1] || defaultImages[1],
          photographer.images[2] || defaultImages[2],
        ]
      : defaultImages;

  const priceFormatted = Number(
    photographer.pricePerHalf || 0
  ).toLocaleString();

  return (
    <div className="group bg-slate-800/80 backdrop-blur-sm border border-slate-700/70 hover:border-orange-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col justify-between">
      <div>
        {/* Header: Avatar + Info + Rating */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="relative flex-shrink-0">
            <img
              src={
                photographer.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80'
              }
              alt={photographer.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-orange-500 shadow-md shadow-orange-500/20"
            />
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] border-2 border-slate-800"
              title="ยืนยันตัวตนแล้ว"
            >
              <i className="fa-solid fa-check"></i>
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors truncate">
              {photographer.name}
            </h3>
            <p className="text-xs text-orange-400 font-medium truncate">
              {photographer.specialty || 'ช่างภาพมืออาชีพ'}
            </p>
            {photographer.location && (
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <i className="fa-solid fa-location-dot text-[10px]"></i>
                <span>{photographer.location}</span>
              </p>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <div className="flex items-center justify-end gap-1 text-xs">
              <i className="fa-solid fa-star text-amber-400"></i>
              <span className="font-bold text-white">
                {photographer.rating ? Number(photographer.rating).toFixed(1) : '5.0'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              ({photographer.reviewCount || 0} รีวิว)
            </span>
          </div>
        </div>

        {/* 3-column Portfolio Preview Grid */}
        <div className="grid grid-cols-3 gap-2 my-3">
          {portfolio.map((imgUrl, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 group/img"
            >
              <img
                src={imgUrl}
                alt={`ผลงาน ${photographer.name} ภาพที่ ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Price & Link Button */}
      <div className="pt-4 mt-2 border-t border-slate-700/60 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-slate-400 block">ราคาเริ่มต้น</span>
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-white">฿{priceFormatted}</span>
            <span className="text-xs text-slate-400 ml-1">/ ครึ่งวัน</span>
          </div>
        </div>

        <Link
          href={`/photographers/${photographer.id || ''}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-700/80 hover:bg-orange-500 text-white border border-slate-600 hover:border-orange-500 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/20 active:scale-95"
        >
          <span>ดูผลงาน & เช็กคิว</span>
          <i className="fa-solid fa-arrow-right text-xs"></i>
        </Link>
      </div>
    </div>
  );
}
