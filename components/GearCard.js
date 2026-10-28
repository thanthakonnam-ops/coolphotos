'use client';

import React from 'react';

export default function GearCard({ gear, onAddToCart }) {
  if (!gear) return null;

  const isQueued =
    gear.status === 'QUEUED' ||
    gear.status === 'ติดคิว' ||
    gear.status === 'unavailable';

  const priceFormatted = Number(gear.pricePerDay || 0).toLocaleString();

  const handleAction = () => {
    if (!isQueued && onAddToCart) {
      onAddToCart(gear);
    }
  };

  return (
    <div className="group relative bg-slate-800/80 backdrop-blur-sm border border-slate-700/70 hover:border-orange-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col justify-between">
      <div>
        {/* Image Area with Zoom Effect */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 mb-4">
          <img
            src={
              gear.image ||
              'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80'
            }
            alt={gear.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            {isQueued ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                <i className="fa-solid fa-clock text-[10px]"></i>
                <span>ติดคิว {gear.queueDate ? `(ว่าง ${gear.queueDate})` : ''}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <i className="fa-solid fa-circle-check text-[10px]"></i>
                <span>พร้อมเช่า</span>
              </span>
            )}
          </div>

          {/* Deposit Tag / Badge */}
          {gear.deposit !== undefined && (
            <div className="absolute bottom-3 right-3">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 backdrop-blur-md border border-slate-700">
                มัดจำ ฿{Number(gear.deposit).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-orange-400 font-medium px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
              {gear.category || 'อุปกรณ์ถ่ายภาพ'}
            </span>
            {gear.rating && (
              <span className="text-slate-400 flex items-center gap-1 text-xs">
                <i className="fa-solid fa-star text-amber-400"></i>
                <span className="text-slate-200 font-medium">{gear.rating}</span>
                {gear.reviewCount && <span>({gear.reviewCount})</span>}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1 pt-1">
            {gear.name}
          </h3>

          {gear.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {gear.description}
            </p>
          )}
        </div>
      </div>

      {/* Pricing & Action */}
      <div className="pt-3 border-t border-slate-700/60 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-400">ค่าเช่าเริ่มต้น</span>
          <div>
            <span className="text-xl font-extrabold text-white">
              ฿{priceFormatted}
            </span>
            <span className="text-xs text-slate-400 ml-1">/ วัน</span>
          </div>
        </div>

        <button
          type="button"
          disabled={isQueued}
          onClick={handleAction}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
            isQueued
              ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600/40 opacity-75'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <i
            className={`fa-solid ${
              isQueued ? 'fa-calendar-plus' : 'fa-cart-plus'
            } text-xs`}
          ></i>
          <span>{isQueued ? 'จองคิวล่วงหน้า' : 'เช่าเลย'}</span>
        </button>
      </div>
    </div>
  );
}
