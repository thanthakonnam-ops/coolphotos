'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PromptPayQR from '@/components/PromptPayQR';

export default function BookingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openQrRef, setOpenQrRef] = useState(null);

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/bookings');
    }
  }, [status, router]);

  // Fetch user bookings from API
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchBookings = async () => {
        try {
          setLoading(true);
          const res = await fetch('/api/bookings');
          if (!res.ok) {
            throw new Error('ไม่สามารถดึงข้อมูลประวัติการจองได้');
          }
          const data = await res.json();
          setBookings(data);
        } catch (err) {
          console.error('Fetch bookings error:', err);
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูลรายการจอง');
        } finally {
          setLoading(false);
        }
      };

      fetchBookings();
    }
  }, [status]);

  const getStatusBadge = (bStatus) => {
    const s = (bStatus || 'PENDING').toUpperCase();
    switch (s) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>ยืนยันแล้ว</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <i className="fa-solid fa-circle-check text-[10px]"></i>
            <span>เสร็จสิ้น</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span>ยกเลิก</span>
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <i className="fa-solid fa-clock text-[10px] animate-pulse"></i>
            <span>รอดำเนินการ</span>
          </span>
        );
    }
  };

  const getItemTypeBadge = (type) => {
    switch (type) {
      case 'PHOTOGRAPHER':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <i className="fa-solid fa-user-tie mr-1 text-[10px]"></i>
            ช่างภาพ
          </span>
        );
      case 'PACKAGE':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <i className="fa-solid fa-box-open mr-1 text-[10px]"></i>
            แพ็กเกจ
          </span>
        );
      case 'GEAR':
      default:
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <i className="fa-solid fa-camera mr-1 text-[10px]"></i>
            อุปกรณ์
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
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
            <span className="text-orange-400">ประวัติการจองและเช่าอุปกรณ์</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                <i className="fa-solid fa-receipt text-orange-500"></i>
                <span>ประวัติการจอง & เช่าอุปกรณ์</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                ติดตามสถานะคำสั่งจอง คิวช่างภาพ และกำหนดวันส่งคืนอุปกรณ์
              </p>
            </div>

            <Link
              href="/#rental"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 transition self-start sm:self-auto"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>จองเพิ่ม</span>
            </Link>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 animate-pulse"
              >
                <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-center">
            <i className="fa-solid fa-circle-exclamation text-3xl mb-2 block"></i>
            <p className="font-semibold">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          /* Empty Bookings State */
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-12 text-center max-w-xl mx-auto my-12">
            <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-6 text-slate-500 text-3xl">
              <i className="fa-solid fa-calendar-xmark"></i>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              ยังไม่มีประวัติการจอง
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              คุณยังไม่เคยทำการเช่าอุปกรณ์หรือจองคิวช่างภาพกับ Cool photos มาก่อน ค้นหาอุปกรณ์หรือบริการที่คุณต้องการได้ทันที
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#rental"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition"
              >
                <i className="fa-solid fa-camera"></i>
                <span>เช่าอุปกรณ์เลย</span>
              </Link>
              <Link
                href="/#photographers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                <i className="fa-solid fa-user-tie"></i>
                <span>จองช่างภาพ</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Bookings Cards / Table */
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id}>
              <div
                className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-5 sm:p-6 transition shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: ID, Type, Name, Dates */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {booking.orderRef ? `คำสั่งจอง ${booking.orderRef}` : `ID: ${booking.id.slice(0, 10)}...`}
                    </span>
                    {getItemTypeBadge(booking.itemType)}
                    {getStatusBadge(booking.status)}
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {booking.itemName}
                    {booking.quantity > 1 && (
                      <span className="text-sm font-normal text-slate-400"> × {booking.quantity}</span>
                    )}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <i className="fa-regular fa-calendar text-slate-500"></i>
                      <span>วันเริ่ม: {formatDate(booking.startDate)}</span>
                    </span>

                    {booking.endDate && (
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-arrow-right-arrow-left text-slate-500 text-[10px]"></i>
                        <span>กำหนดส่งคืน: {formatDate(booking.endDate)}</span>
                      </span>
                    )}

                    <span className="flex items-center gap-1.5">
                      <i className="fa-regular fa-clock text-slate-500"></i>
                      <span>ทำรายการเมื่อ: {formatDate(booking.createdAt)}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Price & Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between pt-4 md:pt-0 border-t md:border-t-0 border-slate-700/60 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block md:text-right">
                      ยอดชำระสุทธิ
                    </span>
                    <span className="text-xl font-extrabold text-orange-400">
                      ฿{(Number(booking.totalPrice || 0) + Number(booking.deposit || 0)).toLocaleString()}
                    </span>
                    {booking.deposit > 0 && (
                      <span className="text-[11px] text-slate-400 block md:text-right">
                        รวมมัดจำ ฿{Number(booking.deposit).toLocaleString()} (ได้คืนหลังส่งคืน)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === 'PENDING' && booking.orderRef && (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenQrRef(openQrRef === booking.orderRef ? null : booking.orderRef)
                        }
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 transition"
                      >
                        <i className="fa-solid fa-qrcode mr-1.5"></i>
                        {openQrRef === booking.orderRef ? 'ซ่อน QR' : 'ชำระเงิน'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          `รายละเอียดคำสั่งจอง ${booking.orderRef || '#' + booking.id}\nรายการ: ${booking.itemName}\nสถานะ: ${booking.status}\nค่าเช่า/ค่าบริการ: ฿${Number(
                            booking.totalPrice
                          ).toLocaleString()}\nเงินมัดจำ: ฿${Number(booking.deposit || 0).toLocaleString()}` +
                            (booking.contactName ? `\nผู้จอง: ${booking.contactName} (${booking.contactPhone})` : '') +
                            (booking.address ? `\nที่อยู่/สถานที่: ${booking.address}` : '')
                        )
                      }
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-700/60 hover:bg-slate-700 hover:text-white border border-slate-600/60 transition"
                    >
                      ดูใบยืนยัน
                    </button>
                  </div>
                </div>
              </div>
              {openQrRef && openQrRef === booking.orderRef && (
                <div className="max-w-xs mx-auto md:ml-auto md:mr-0 mt-3">
                  <PromptPayQR orderRef={booking.orderRef} />
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    ยอดนี้รวมทุกรายการที่ยังรอยืนยันในคำสั่งจอง {booking.orderRef}
                  </p>
                </div>
              )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
