'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { todayStr } from '@/lib/pricing';

// Remember the chosen dates so checkout can prefill them
function saveDates(start, end) {
  try {
    sessionStorage.setItem('coolphotos_dates', JSON.stringify({ start, end }));
  } catch {
    // ignore
  }
}

export default function HeroSection({ gearCategories = [] }) {
  const router = useRouter();
  const today = todayStr();
  const [activeTab, setActiveTab] = useState('gear'); // 'gear' | 'photographer'

  // Gear search state
  const [gearCategory, setGearCategory] = useState('');
  const [gearStartDate, setGearStartDate] = useState('');
  const [gearEndDate, setGearEndDate] = useState('');

  // Photographer search state
  const [specialty, setSpecialty] = useState('ทั้งหมด');
  const [shootDate, setShootDate] = useState('');
  const [location, setLocation] = useState('กรุงเทพฯ และปริมณฑล');

  // A return date before the new start date is no longer valid
  const handleGearStartChange = (e) => {
    const value = e.target.value;
    setGearStartDate(value);
    if (gearEndDate && value && gearEndDate < value) setGearEndDate('');
  };

  const handleGearSearch = (e) => {
    e.preventDefault();
    saveDates(gearStartDate, gearEndDate);
    const params = new URLSearchParams();
    if (gearCategory) params.set('category', gearCategory);
    router.push(`/gear?${params.toString()}`);
  };

  const handlePhotographerSearch = (e) => {
    e.preventDefault();
    saveDates(shootDate, '');
    const params = new URLSearchParams();
    if (specialty !== 'ทั้งหมด') params.set('specialty', specialty);
    router.push(`/photographers?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-slate-900 py-16 sm:py-24 overflow-hidden">
      {/* Background with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />

      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* SDG Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium mb-6 backdrop-blur-md shadow-sm animate-fade-in">
          <i className="fa-solid fa-leaf text-emerald-400"></i>
          <span>ขับเคลื่อนเศรษฐกิจหมุนเวียน (SDG 12 & 8) • ยืมใช้ ไม่ต้องซื้อ</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none mb-6">
          เช่ากล้องง่าย จองช่างภาพครบ <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400">
            จบในที่เดียว
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          แพลตฟอร์มแบ่งปันอุปกรณ์ถ่ายภาพและรวมช่างภาพมืออาชีพ ช่วยลดต้นทุน
          ลดขยะอิเล็กทรอนิกส์ เพื่อการสร้างสรรค์ผลงานอย่างยั่งยืน
        </p>

        {/* Quick Search Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto text-left">
          {/* Tabs */}
          <div className="flex border-b border-slate-700 mb-6 pb-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('gear')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'gear'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <i className="fa-solid fa-camera"></i>
              <span>เช่าอุปกรณ์</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('photographer')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'photographer'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <i className="fa-solid fa-user-tie"></i>
              <span>จองช่างภาพ</span>
            </button>
          </div>

          {/* Tab 1: Gear Search Form */}
          {activeTab === 'gear' && (
            <form onSubmit={handleGearSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category Select */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    หมวดหมู่อุปกรณ์
                  </label>
                  <div className="relative">
                    <select
                      value={gearCategory}
                      onChange={(e) => setGearCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 appearance-none transition"
                    >
                      <option value="">ทั้งหมด</option>
                      {gearCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    วันที่เริ่มต้นเช่า
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={today}
                      value={gearStartDate}
                      onChange={handleGearStartChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    วันที่ส่งคืน
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={gearStartDate || today}
                      value={gearEndDate}
                      onChange={(e) => setGearEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <span>ค้นหาอุปกรณ์พร้อมเช่า</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Photographer Search Form */}
          {activeTab === 'photographer' && (
            <form onSubmit={handlePhotographerSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Specialty Select */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    ประเภทงานที่ต้องการ
                  </label>
                  <div className="relative">
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 appearance-none transition"
                    >
                      <option value="ทั้งหมด">ทั้งหมด</option>
                      <option value="พอร์ตเทรต/รับปริญญา">พอร์ตเทรต / รับปริญญา</option>
                      <option value="อีเวนต์/คอนเสิร์ต">อีเวนต์ / คอนเสิร์ต</option>
                      <option value="สินค้า/อาหาร">สินค้า / อาหาร</option>
                      <option value="งานแต่งงาน/พรีเวดดิ้ง">งานแต่งงาน / พรีเวดดิ้ง</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    วันที่ต้องการจองคิว
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={shootDate}
                    onChange={(e) => setShootDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition [color-scheme:dark]"
                  />
                </div>

                {/* Location Select */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    สถานที่จัดงาน
                  </label>
                  <div className="relative">
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 appearance-none transition"
                    >
                      <option value="กรุงเทพฯ และปริมณฑล">กรุงเทพฯ และปริมณฑล</option>
                      <option value="ภาคกลาง">ภาคกลาง</option>
                      <option value="ภาคเหนือ">ภาคเหนือ</option>
                      <option value="ภาคตะวันออก">ภาคตะวันออก</option>
                      <option value="ภาคใต้">ภาคใต้</option>
                      <option value="ภาคตะวันออกเฉียงเหนือ">ภาคตะวันออกเฉียงเหนือ</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <span>ค้นหาช่างภาพว่าง</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Beginner shortcut to the advisor */}
        <div className="mt-5 text-center">
          <Link
            href="/advisor"
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-orange-400 transition"
          >
            <i className="fa-solid fa-wand-magic-sparkles text-orange-400"></i>
            <span>
              ไม่รู้จะเลือกอะไร? <span className="font-semibold underline underline-offset-4">ให้ผู้ช่วยแนะนำตามงบ</span>
            </span>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 text-slate-300 text-xs sm:text-sm">
          <div className="flex items-center justify-center gap-2">
            <i className="fa-solid fa-shield-halved text-emerald-400"></i>
            <span>อุปกรณ์แท้ ตรวจสอบ 100%</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <i className="fa-solid fa-user-check text-orange-400"></i>
            <span>ช่างภาพผ่านการคัดเลือก</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <i className="fa-solid fa-truck-fast text-blue-400"></i>
            <span>จัดส่งด่วน หรือรับเอง</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <i className="fa-solid fa-recycle text-emerald-400"></i>
            <span>ลดขยะอิเล็กทรอนิกส์</span>
          </div>
        </div>
      </div>
    </section>
  );
}
