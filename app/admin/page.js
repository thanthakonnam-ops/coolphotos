import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminUser } from '@/lib/admin';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminBookings from '@/components/AdminBookings';

export const metadata = {
  title: 'จัดการการจอง - Cool Photos',
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/admin');
  }

  const admin = await getAdminUser();
  if (!admin) {
    redirect('/');
  }

  const bookings = await prisma.booking.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <p className="text-xs text-orange-400 mb-2">ผู้ดูแลระบบ: {admin.name}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <i className="fa-solid fa-clipboard-check text-orange-500"></i>
            <span>จัดการการจอง</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            ตรวจสอบข้อมูลลูกค้า ยืนยันคิว และอัปเดตสถานะการจองทั้งหมด
          </p>
        </div>

        <AdminBookings initialBookings={bookings} />
      </main>

      <Footer />
    </div>
  );
}
