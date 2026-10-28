'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PhotographerCard from '@/components/PhotographerCard';

const fallbackPhotographers = [
  {
    id: 'photo-1',
    name: 'คุณธนกฤต วิทยากร (เบียร์)',
    specialty: 'พอร์ตเทรต/รับปริญญา',
    location: 'กรุงเทพฯ และปริมณฑล',
    rating: 4.9,
    reviewCount: 128,
    pricePerHalf: 3500,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80',
    image1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80',
    image2: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80',
    image3: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-2',
    name: 'คุณพิมพ์ชนก แสงแก้ว (นก)',
    specialty: 'งานแต่งงาน/พรีเวดดิ้ง',
    location: 'กรุงเทพฯ / ทั่วประเทศ',
    rating: 5.0,
    reviewCount: 95,
    pricePerHalf: 6500,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80',
    image1: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
    image2: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80',
    image3: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-3',
    name: 'คุณณัฐดนัย ภัทรพล (ต้น)',
    specialty: 'อีเวนต์/คอนเสิร์ต',
    location: 'กรุงเทพฯ',
    rating: 4.8,
    reviewCount: 76,
    pricePerHalf: 4500,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80',
    image1: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80',
    image2: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80',
    image3: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-4',
    name: 'คุณอารียา กุลสวัสดิ์ (แพรว)',
    specialty: 'สินค้า/อาหาร',
    location: 'กรุงเทพฯ และปริมณฑล',
    rating: 4.9,
    reviewCount: 88,
    pricePerHalf: 4000,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80',
    image1: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80',
    image2: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80',
    image3: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-5',
    name: 'คุณกิตติศักดิ์ เจริญดี (แม็ก)',
    specialty: 'พอร์ตเทรต/รับปริญญา',
    location: 'เชียงใหม่ / ภาคเหนือ',
    rating: 4.7,
    reviewCount: 64,
    pricePerHalf: 3000,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80',
    image1: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80',
    image2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
    image3: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-6',
    name: 'คุณวรรณิศา รัตนโชติ (วิว)',
    specialty: 'งานแต่งงาน/พรีเวดดิ้ง',
    location: 'ภูเก็ต / ภาคใต้',
    rating: 4.9,
    reviewCount: 112,
    pricePerHalf: 7000,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80',
    image1: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
    image2: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80',
    image3: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80',
  },
];

export default function AllPhotographersPage() {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [specialty, setSpecialty] = useState('ทั้งหมด');
  const [sort, setSort] = useState('rating'); // 'rating' | 'price_asc' | 'price_desc' | 'latest'
  const [search, setSearch] = useState('');

  const specialties = [
    'ทั้งหมด',
    'พอร์ตเทรต/รับปริญญา',
    'งานแต่งงาน/พรีเวดดิ้ง',
    'อีเวนต์/คอนเสิร์ต',
    'สินค้า/อาหาร',
  ];

  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (specialty !== 'ทั้งหมด') {
          params.append('specialty', specialty);
        }
        if (sort) {
          params.append('sort', sort);
        }

        const res = await fetch(`/api/photographers?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch photographers');
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setPhotographers(data);
        } else if (specialty === 'ทั้งหมด') {
          setPhotographers(fallbackPhotographers);
        } else {
          setPhotographers(data);
        }
      } catch (err) {
        console.error('Error fetching photographers:', err);
        setPhotographers(fallbackPhotographers);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotographers();
  }, [specialty, sort]);

  // Client-side text search & image formatting
  const displayedPhotographers = photographers
    .filter((p) => {
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(term) ||
        p.specialty?.toLowerCase().includes(term) ||
        p.location?.toLowerCase().includes(term)
      );
    })
    .map((p) => ({
      ...p,
      images:
        p.images && p.images.length > 0
          ? p.images
          : [p.image1, p.image2, p.image3].filter(Boolean),
    }));

  const resetFilters = () => {
    setSpecialty('ทั้งหมด');
    setSort('rating');
    setSearch('');
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
            <span className="text-orange-400">ช่างภาพทั้งหมด</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            ช่างภาพมืออาชีพทั้งหมด
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            เลือกช่างภาพที่มีประสบการณ์ การันตีผลงาน พร้อมอุปกรณ์ครบมือ ตอบสนองทุกความต้องการ ทั้งภาพนิ่งและวิดีโอ
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 sm:p-6 mb-10 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ค้นหาช่างภาพ
              </label>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ หรือสถานที่..."
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

            {/* Specialty Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ประเภทงานถ่ายภาพ
              </label>
              <div className="relative">
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  {specialties.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
              </div>
            </div>

            {/* Sort by Rating / Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                เรียงลำดับตาม
              </label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="rating">เรตติ้งและคะแนนรีวิวสูงสุด (Rating)</option>
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
              <span>พบช่างภาพทั้งหมด </span>
              <span className="font-bold text-white">
                {displayedPhotographers.length}
              </span>
              <span> คน</span>
            </div>

            {(search || specialty !== 'ทั้งหมด' || sort !== 'rating') && (
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

        {/* Photographers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square bg-slate-700 rounded-xl"></div>
                  <div className="aspect-square bg-slate-700 rounded-xl"></div>
                  <div className="aspect-square bg-slate-700 rounded-xl"></div>
                </div>
                <div className="h-8 bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : displayedPhotographers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPhotographers.map((photographer) => (
              <PhotographerCard
                key={photographer.id}
                photographer={photographer}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-16 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fa-solid fa-user-xmark"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              ไม่พบช่างภาพที่ตรงกับเงื่อนไขการค้นหา
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              ลองปรับเปลี่ยนประเภทงาน หรือรีเซ็ตตัวกรองเพื่อดูช่างภาพทั้งหมด
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
