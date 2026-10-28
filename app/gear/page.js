'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GearCard from '@/components/GearCard';
import { useCart } from '@/components/CartProvider';

const fallbackGear = [
  {
    id: 'gear-1',
    name: 'Sony Alpha A7 IV',
    category: 'Mirrorless/DSLR',
    description: 'กล้องฟูลเฟรมยอดนิยมสำหรับงานภาพนิ่งและวิดีโอ 4K 60p คุณภาพคมชัดระดับมืออาชีพ',
    pricePerDay: 1200,
    deposit: 3000,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
  },
  {
    id: 'gear-2',
    name: 'Canon EOS R5',
    category: 'Mirrorless/DSLR',
    description: 'บันทึกภาพความละเอียด 45MP และวิดีโอ 8K RAW เหมาะสำหรับงานพาณิชย์และพอร์ตเทรต',
    pricePerDay: 1800,
    deposit: 5000,
    image: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
  },
  {
    id: 'gear-3',
    name: 'Sony FE 24-70mm F2.8 GM II',
    category: 'Lens/Accessories',
    description: 'เลนส์ซูมมาตรฐานเกรดโปร คมชัดตั้งแต่ F2.8 น้ำหนักเบา ตอบโจทย์ทุกสถานการณ์',
    pricePerDay: 800,
    deposit: 2000,
    image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
  },
  {
    id: 'gear-4',
    name: 'DJI Ronin 4D 6K Combo',
    category: 'Cinema & Video Cam',
    description: 'กล้องซีนีม่าพร้อมกันสั่น 4 แกนในตัว ระบบโฟกัส LiDAR อุปกรณ์ระดับงานภาพยนตร์',
    pricePerDay: 3500,
    deposit: 8000,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80',
    status: 'QUEUED',
    queueDate: '15 พ.ย.',
  },
  {
    id: 'gear-5',
    name: 'DJI Mini 4 Pro Fly More Combo',
    category: 'Action Cam & Drone',
    description: 'โดรนติดกล้องขนาดพกพา น้ำหนักต่ำกว่า 249 กรัม ถ่ายแนวตั้ง 4K HDR ปลอดภัยด้วยเซนเซอร์รอบทิศทาง',
    pricePerDay: 950,
    deposit: 2500,
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
  },
  {
    id: 'gear-6',
    name: 'Fujifilm X-T5 + XF 16-80mm',
    category: 'Mirrorless/DSLR',
    description: 'โทนสีฟิล์มเอกลักษณ์ เซนเซอร์ 40.2MP เหมาะมากสำหรับการเดินทางและถ่ายภาพสตรีท',
    pricePerDay: 1100,
    deposit: 2500,
    image: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
  },
  {
    id: 'gear-7',
    name: 'Sony FE 70-200mm F2.8 GM OSS II',
    category: 'Lens/Accessories',
    description: 'เลนส์เทเลโฟโต้ไวแสง โฟกัสรวดเร็วและแม่นยำ เหมาะกับงานอีเวนต์ กีฬา และคอนเสิร์ต',
    pricePerDay: 1100,
    deposit: 3000,
    image: 'https://images.unsplash.com/photo-1595183401569-b57f0fecad35?auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
  },
  {
    id: 'gear-8',
    name: 'GoPro HERO12 Black Creator Edition',
    category: 'Action Cam & Drone',
    description: 'กล้องแอคชั่น 5.3K พร้อมกริปแบตเตอรี่ ไมโครโฟน และไฟ LED ตอบโจทย์สาย Vlog และผจญภัย',
    pricePerDay: 550,
    deposit: 1500,
    image: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&q=80',
    status: 'AVAILABLE',
  },
];

export default function AllGearPage() {
  const { addToCart } = useCart();

  const [gearList, setGearList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under1000' | '1000-2000' | 'above2000'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'price_asc' | 'price_desc'

  const categories = [
    'ทั้งหมด',
    'Mirrorless/DSLR',
    'Cinema & Video Cam',
    'Action Cam & Drone',
    'Lens/Accessories',
  ];

  // Fetch from /api/gear
  useEffect(() => {
    const fetchGear = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory !== 'ทั้งหมด') {
          params.append('category', selectedCategory);
        }
        if (search.trim()) {
          params.append('search', search.trim());
        }

        const res = await fetch(`/api/gear?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch gear');
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setGearList(data);
        } else if (!search && selectedCategory === 'ทั้งหมด') {
          // If empty DB, use fallback data
          setGearList(fallbackGear);
        } else {
          setGearList(data);
        }
      } catch (err) {
        console.error('Error loading gear:', err);
        setGearList(fallbackGear);
      } finally {
        setLoading(false);
      }
    };

    fetchGear();
  }, [selectedCategory, search]);

  // Client-side Price & Sorting Filtering
  const displayedGear = gearList
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
