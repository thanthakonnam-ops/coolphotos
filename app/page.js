import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import GearSection from '@/components/GearSection';
import PhotographerSection from '@/components/PhotographerSection';
import PackagesSection from '@/components/PackagesSection';
import SDGSection from '@/components/SDGSection';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  let gearList = [];
  let photographerList = [];
  let packageList = [];
  let gearCategories = [];

  try {
    const [dbGear, dbPhotographers, dbPackages, dbCategories] = await Promise.all([
      prisma.gear.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.photographer.findMany({
        orderBy: { rating: 'desc' },
        take: 6,
      }),
      prisma.package.findMany(),
      prisma.gear.findMany({
        distinct: ['category'],
        select: { category: true },
      }),
    ]);

    gearList = dbGear;
    photographerList = dbPhotographers;
    packageList = dbPackages;
    gearCategories = dbCategories.map((g) => g.category);
  } catch (err) {
    console.error('Failed to query database in HomePage:', err);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* 1. Header Navigation */}
      <Header />

      <main className="flex-grow">
        {/* 2. Hero Section with Quick Search */}
        <HeroSection gearCategories={gearCategories} />

        {/* 3. Popular Gear Section */}
        <GearSection initialGear={gearList} />

        {/* 4. Verified Photographers Section */}
        <PhotographerSection initialPhotographers={photographerList} />

        {/* 5. Packages Section */}
        <PackagesSection dbPackages={packageList} />

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
