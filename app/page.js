import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import GearSection from '@/components/GearSection';
import PhotographerSection from '@/components/PhotographerSection';
import PackagesSection from '@/components/PackagesSection';
import SDGSection from '@/components/SDGSection';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';

// Default fallback gear in case the database is freshly initialized
const fallbackGear = [
  {
    id: 'gear-1',
    name: 'Canon 930',
    category: 'Compact Digital',
    description: '',
    pricePerDay: 300,
    deposit: 1000,
    image: '/images/gear/canon-930.jpg',
    status: 'AVAILABLE',
  },
  {
    id: 'gear-2',
    name: 'Canon 31s',
    category: 'Compact Digital',
    description: '',
    pricePerDay: 300,
    deposit: 1000,
    image: '/images/gear/canon-31s.jpg',
    status: 'AVAILABLE',
  },
  {
    id: 'gear-3',
    name: 'Canon 105',
    category: 'Compact Digital',
    description: '',
    pricePerDay: 300,
    deposit: 1000,
    image: '/images/gear/canon-105.jpg',
    status: 'AVAILABLE',
  },
  {
    id: 'gear-4',
    name: 'Canon G9X',
    category: 'Compact Digital',
    description: '',
    pricePerDay: 500,
    deposit: 1500,
    image: '/images/gear/canon-g9x.jpg',
    status: 'AVAILABLE',
  },
];

// Default fallback photographers
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
];

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  let gearList = [];
  let photographerList = [];

  try {
    const [dbGear, dbPhotographers] = await Promise.all([
      prisma.gear.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.photographer.findMany({
        orderBy: { rating: 'desc' },
        take: 6,
      }),
    ]);

    gearList = dbGear && dbGear.length > 0 ? dbGear : fallbackGear;
    photographerList =
      dbPhotographers && dbPhotographers.length > 0
        ? dbPhotographers
        : fallbackPhotographers;
  } catch (err) {
    console.error('Failed to query database in HomePage:', err);
    gearList = fallbackGear;
    photographerList = fallbackPhotographers;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* 1. Header Navigation */}
      <Header />

      <main className="flex-grow">
        {/* 2. Hero Section with Quick Search */}
        <HeroSection />

        {/* 3. Popular Gear Section */}
        <GearSection initialGear={gearList} />

        {/* 4. Verified Photographers Section */}
        <PhotographerSection initialPhotographers={photographerList} />

        {/* 5. Packages Section */}
        <PackagesSection />

        {/* 6. SDG Sustainability Section */}
        <SDGSection />

        {/* 7. How It Works - 4 Steps */}
        <HowItWorks />
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}
