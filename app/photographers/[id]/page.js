'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartProvider';

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
    bio: 'ช่างภาพอิสระประสบการณ์กว่า 6 ปี เชี่ยวชาญการถ่ายภาพพอร์ตเทรต แฟชั่น และงานรับปริญญาทั้งเดี่ยวและกลุ่ม โทนสีอบอุ่น ละมุน เป็นธรรมชาติ พร้อมกำกับท่าโพสให้ผ่อนคลาย',
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
    bio: 'บันทึกเรื่องราวความรักและอารมณ์ความรู้สึกอันล้ำค่า ถ่ายทอดความทรงจำวันสำคัญด้วยสไตล์ Documentary & Cinematic ดูแลทุกรายละเอียดตั้งแต่พิธีการจนถึงอาฟเตอร์ปาร์ตี้',
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
    bio: 'ช่างภาพสายคอนเสิร์ตและอีเวนต์ความเร็วสูง ดึงอารมณ์แสงสีเสียงและจังหวะของศิลปินได้อย่างแม่นยำ พร้อมส่งไฟล์รูปด่วนสำหรับทีมสื่อมวลชน',
  },
];

export default function PhotographerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const photographerId = params?.id;

  const [photographer, setPhotographer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchPhotographer = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/photographers');
        if (res.ok) {
          const data = await res.json();
          const match = data.find((p) => p.id === photographerId);
          if (match) {
            setPhotographer(match);
            setActiveImage(match.image1 || match.avatar);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fallback
      }

      // Check fallback list
      const fallback =
        fallbackPhotographers.find((p) => p.id === photographerId) ||
        fallbackPhotographers[0];
      setPhotographer(fallback);
      setActiveImage(fallback?.image1 || fallback?.avatar);
      setLoading(false);
    };

    fetchPhotographer();
  }, [photographerId]);

  const handleBook = () => {
    if (!photographer) return;
    addToCart({
      id: photographer.id,
      type: 'photographer',
      name: `ช่างภาพ: ${photographer.name}`,
      price: photographer.pricePerHalf,
      image: photographer.avatar,
      category: photographer.specialty,
    });
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-orange-500"></i>
      </div>
    );
  }

  const portfolio = [
    photographer?.image1,
    photographer?.image2,
    photographer?.image3,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/" className="hover:text-white transition">หน้าหลัก</Link>
            <span>/</span>
            <Link href="/photographers" className="hover:text-white transition">ช่างภาพทั้งหมด</Link>
            <span>/</span>
            <span className="text-orange-400">{photographer?.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Profile & Portfolio Gallery */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photographer Profile Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative flex-shrink-0">
                <img
                  src={photographer?.avatar}
                  alt={photographer?.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-orange-500 shadow-xl shadow-orange-500/20"
                />
                <span
                  className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs border-2 border-slate-900"
                  title="ช่างภาพยืนยันตัวตนแล้ว"
                >
                  <i className="fa-solid fa-check"></i>
                </span>
              </div>

              <div className="text-center sm:text-left flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    {photographer?.specialty}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <i className="fa-solid fa-location-dot text-slate-500"></i>
                    {photographer?.location || 'กรุงเทพฯ'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {photographer?.name}
                </h1>

                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm">
                  <div className="flex items-center text-amber-400">
                    <i className="fa-solid fa-star mr-1"></i>
                    <span className="font-bold text-white">
                      {photographer?.rating ? Number(photographer.rating).toFixed(1) : '5.0'}
                    </span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">
                    {photographer?.reviewCount || 0} รีวิวจากลูกค้า
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
                  {photographer?.bio || 'ช่างภาพมืออาชีพผ่านการคัดสรรจาก Cool photos มั่นใจในคุณภาพและผลงาน'}
                </p>
              </div>
            </div>

            {/* Portfolio Preview */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-images text-orange-500"></i>
                <span>ตัวอย่างผลงานเด่น (Portfolio)</span>
              </h2>

              {/* Main Preview Image */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-xl">
                <img
                  src={activeImage || portfolio[0]}
                  alt="Portfolio preview"
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>

              {/* Thumbnails */}
              {portfolio.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {portfolio.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`aspect-square rounded-xl overflow-hidden bg-slate-900 border-2 transition ${
                        activeImage === img
                          ? 'border-orange-500 scale-95 shadow-md'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Portfolio thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Booking Card & Pricing */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl sticky top-28 space-y-6">
            <h2 className="text-lg font-bold text-white pb-4 border-b border-slate-700 flex items-center justify-between">
              <span>อัตราค่าบริการ</span>
              <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                พร้อมรับงาน
              </span>
            </h2>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">
                  ค่าบริการเริ่มต้น (ครึ่งวัน 4 ชั่วโมง)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">
                    ฿{Number(photographer?.pricePerHalf || 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">/ 4 ชั่วโมง</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-700/60">
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-emerald-400"></i>
                  <span>ส่งไฟล์ภาพปรับสีทุกใบ (Full HD)</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-emerald-400"></i>
                  <span>รีทัชรูปพิเศษ 10-20 รูป</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-emerald-400"></i>
                  <span>อุปกรณ์กล้องและเลนส์ระดับมืออาชีพ</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-emerald-400"></i>
                  <span>ส่งงานผ่าน Cloud Storage ภายใน 3-5 วัน</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={handleBook}
                className="w-full py-4 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <i className="fa-solid fa-calendar-check"></i>
                <span>จองคิวช่างภาพคนนี้</span>
              </button>

              <Link
                href="/photographers"
                className="block text-center text-xs text-slate-400 hover:text-white transition pt-2"
              >
                ← ดูช่างภาพท่านอื่น
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
