'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GearCard from '@/components/GearCard';
import { useCart } from '@/components/CartProvider';

export default function AllGearPage({ searchParams }) {
  const { category: initialCategory } = use(searchParams);
  const { addToCart } = useCart();

  const [gearList, setGearList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    typeof initialCategory === 'string' && initialCategory ? initialCategory : 'ทั้งหมด'
  );
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under1000' | '1000-2000' | 'above2000'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'price_asc' | 'price_desc'

  // Category buttons come from the gear that actually exists
  const categories = [
    'ทั้งหมด',
    ...new Set(gearList.map((item) => item.category).filter(Boolean)),
  ];

  // Fetch all gear once; filtering happens client-side
  useEffect(() => {
    const fetchGear = async () => {
      try {
        const res = await fetch('/api/gear');
        if (!res.ok) throw new Error('Failed to fetch gear');
        setGearList(await res.json());
      } catch (err) {
        console.error('Error loading gear:', err);
        setError('ไม่สามารถโหลดรายการอุปกรณ์ได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    fetchGear();
  }, []);

  // Client-side Price & Sorting Filtering
  const searchTerm = search.trim().toLowerCase();
  const displayedGear = gearList
    .filter(
      (item) =>
        (selectedCategory === 'ทั้งหมด' || item.category === selectedCategory) &&
        (!searchTerm || item.name?.toLowerCase().includes(searchTerm))
    )
    .filter((item) => {
      const price = Number(item.pricePerDay || 0);
      if (priceRange === 'under1000') return price < 1000;
      if (priceRange === '1000-2000') return price >= 1000 && price <= 2000;
      if (priceRange === 'above2000') return price > 2000;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.pricePerDay || 0) - (b.pricePerDay || 0);
      if (sortBy === 'price_desc') return (b.pricePerDay || 0) - (a.pricePerDay || 0);
      return 0;
    });

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('ทั้งหมด');
    setPriceRange('all');
    setSortBy('default');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/" className="hover:text-white transition">หน้าหลัก</Link>
            <span>/</span>
            <span className="text-orange-400">อุปกรณ์ทั้งหมด</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            อุปกรณ์กล้อง & เลนส์ทั้งหมด
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            เลือกเช่าอุปกรณ์ถ่ายภาพและวิดีโอระดับมืออาชีพ พร้อมเซ็นเซอร์และอุปกรณ์เสริมครบชุด สะดวก รวดเร็ว ประหยัดคุ้มค่า
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 sm:p-6 mb-10 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ค้นหาอุปกรณ์
              </label>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="พิมพ์ชื่อกล้อง เช่น Sony, Canon..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                หมวดหมู่อุปกรณ์
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ช่วงราคาค่าเช่า / วัน
              </label>
              <div className="relative">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="all">ทุกช่วงราคา</option>
                  <option value="under1000">ต่ำกว่า ฿1,000 / วัน</option>
                  <option value="1000-2000">฿1,000 - ฿2,000 / วัน</option>
                  <option value="above2000">มากกว่า ฿2,000 / วัน</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
              </div>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                เรียงลำดับตาม
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="default">แนะนำ / อัปเดตล่าสุด</option>
                  <option value="price_asc">ราคา: ต่ำไปสูง</option>
                  <option value="price_desc">ราคา: สูงไปต่ำ</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
              </div>
            </div>
          </div>

          {/* Quick Active Filters & Result Count */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-700/60 text-xs text-slate-400 gap-2">
            <div>
              <span>พบอุปกรณ์ทั้งหมด </span>
              <span className="font-bold text-white">
                {displayedGear.length}
              </span>
              <span> รายการ</span>
            </div>

            {(search || selectedCategory !== 'ทั้งหมด' || priceRange !== 'all' || sortBy !== 'default') && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition"
              >
                <i className="fa-solid fa-rotate-left"></i>
                <span>ล้างตัวกรองทั้งหมด</span>
              </button>
            )}
          </div>
        </div>

        {/* Gear Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 animate-pulse space-y-3"
              >
                <div className="aspect-[4/3] bg-slate-700 rounded-xl"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                <div className="h-3 bg-slate-700 rounded w-full"></div>
                <div className="h-8 bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-400 text-sm py-16">{error}</p>
        ) : displayedGear.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedGear.map((gear) => (
              <GearCard key={gear.id} gear={gear} onAddToCart={addToCart} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-16 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไขการค้นหา
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              ลองปรับเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูรายการทั้งหมด
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-orange-500 hover:bg-orange-600 transition"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
